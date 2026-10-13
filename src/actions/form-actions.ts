'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  FormConfigInput,
  SubmissionPayload,
  FormAnalyticsReport,
  AppointmentSlotDTO,
  AppointmentScheduleConfig,
} from '@/types/dynamic-form';
import { getOrGenerateSlotsForRange } from '@/lib/forms/slots';
import { getFormAnalytics } from '@/lib/forms/analytics';
import { sendFormSubmissionNotifications } from '@/lib/email';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. FORM BUILDER: CREATE OR UPDATE FORM WITH SOFT-DELETE FOR SCHEMA DRIFT
 * ─────────────────────────────────────────────────────────────────────────────
 * Solves: Schema Drift & Field Ordering
 * Instead of hard-deleting fields, removed fields are flagged with `isActive: false`.
 * Past submissions remain linked to historical field snapshots.
 */
export async function saveFormConfigAction(payload: FormConfigInput): Promise<
  { success: true; formId: string } | { success: false; error: string }
> {
  try {
    const { id, title, description, isPublished, fields } = payload;

    return await prisma.$transaction(async (tx) => {
      let form;
      if (id) {
        // Update existing form header
        form = await tx.dynamicForm.update({
          where: { id },
          data: {
            title,
            description,
            isPublished,
          },
        });
      } else {
        // Create new form
        form = await tx.dynamicForm.create({
          data: {
            title,
            description,
            isPublished,
          },
        });
      }

      // Existing fields in DB
      const existingFields = await tx.dynamicFormField.findMany({
        where: { formId: form.id },
      });

      const incomingIds = fields.filter((f) => f.id).map((f) => f.id as string);

      // Soft-delete fields that were removed by the creator (PREVENTS SCHEMA DRIFT ERRORS)
      const fieldsToDeactivate = existingFields.filter(
        (ef) => !incomingIds.includes(ef.id) && ef.isActive
      );

      for (const field of fieldsToDeactivate) {
        await tx.dynamicFormField.update({
          where: { id: field.id },
          data: { isActive: false },
        });
      }

      // Upsert incoming fields with orderIndex
      for (let index = 0; index < fields.length; index++) {
        const field = fields[index];
        const fieldData = {
          type: field.type,
          label: field.label,
          placeholder: field.placeholder || null,
          helpText: field.helpText || null,
          isRequired: Boolean(field.isRequired),
          orderIndex: index, // Maintained order index
          options: (field.options as any) ?? [],
          appointmentConfig: (field.appointmentConfig as any) ?? null,
          isActive: true, // Mark active
        };

        if (field.id && existingFields.some((ef) => ef.id === field.id)) {
          await tx.dynamicFormField.update({
            where: { id: field.id },
            data: fieldData,
          });
        } else {
          await tx.dynamicFormField.create({
            data: {
              ...fieldData,
              formId: form.id,
            },
          });
        }
      }

      return { success: true as const, formId: form.id };
    });
  } catch (error: any) {
    console.error('[SAVE_FORM_ERROR]:', error);
    return { success: false as const, error: error.message || 'Failed to save form' };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. TOGGLE PUBLISH STATUS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function toggleFormPublishAction(formId: string, isPublished: boolean) {
  try {
    const updated = await prisma.dynamicForm.update({
      where: { id: formId },
      data: { isPublished },
    });
    return { success: true, isPublished: updated.isPublished };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. LAZY SLOT FETCHER FOR APPOINTMENT FIELDS
 * ─────────────────────────────────────────────────────────────────────────────
 * Solves: Infinite Slot Generation Bloat
 * Lazily loads/generates slots in a rolling date window (e.g., 14 days)
 */
export async function getFieldSlotsAction({
  fieldId,
  startDate,
  endDate,
  viewerTimezone,
}: {
  fieldId: string;
  startDate: string;
  endDate: string;
  viewerTimezone?: string;
}): Promise<{ success: boolean; slots?: AppointmentSlotDTO[]; error?: string }> {
  try {
    const field = await prisma.dynamicFormField.findUnique({
      where: { id: fieldId },
    });

    if (!field || field.type !== 'APPOINTMENT') {
      return { success: false, error: 'Appointment field not found' };
    }

    const config = (field.appointmentConfig as unknown as AppointmentScheduleConfig) || {
      startTime: '09:00',
      endTime: '17:00',
      intervalMinutes: 30,
      maxCapacity: 1,
      daysOfWeek: [1, 2, 3, 4, 5],
      timezone: 'UTC',
    };

    const slots = await getOrGenerateSlotsForRange({
      fieldId,
      config,
      startDateStr: startDate,
      endDateStr: endDate,
      viewerTimezone,
    });

    return { success: true, slots };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. CONCURRENCY-SAFE SUBMISSION HANDLING & DOUBLE-BOOKING PREVENTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles:
 *  - Race Conditions: Atomic conditional increment `WHERE bookedCount < maxCapacity`
 *  - Unpublishing Mid-Submission: Validates `isPublished === true` inside transaction
 *  - Schema Drift: Immutable metadata snapshot of form & fields at submission time
 */
export async function submitDynamicFormAction(payload: SubmissionPayload) {
  const { formId, answers, clientTimezone } = payload;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // STEP 1: Re-validate form publication status inside transaction (SOLVES UNPUBLISHING MID-SUBMISSION)
        const form = await tx.dynamicForm.findUnique({
          where: { id: formId },
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        });

        if (!form) {
          throw new Error('Form not found.');
        }

        if (!form.isPublished) {
          throw new Error('This form is no longer accepting responses as it was recently unpublished by the creator.');
        }

        // Validate required fields
        for (const field of form.fields) {
          if (field.isRequired) {
            const answer = answers.find((a) => a.fieldId === field.id);
            if (!answer || (!answer.answerValue && !answer.slotId && (!answer.jsonValue || answer.jsonValue.length === 0))) {
              throw new Error(`The required question "${field.label}" must be answered.`);
            }
          }
        }

        // STEP 2: Atomic Appointment Slot Claiming (PREVENTS DOUBLE-BOOKING RACE CONDITIONS)
        const appointmentBookingsToMake: { slotId: string; fieldId: string }[] = [];

        for (const ans of answers) {
          if (ans.slotId) {
            const slotId = ans.slotId;

            // Execute atomic conditional SQL increment:
            // "UPDATE ... SET bookedCount = bookedCount + 1 WHERE id = $slotId AND bookedCount < maxCapacity"
            // If another concurrent request took the last spot, rows affected will be 0!
            const updatedRowsCount = await tx.$executeRaw`
              UPDATE "AppointmentSlot"
              SET "bookedCount" = "bookedCount" + 1,
                  "version" = "version" + 1,
                  "updatedAt" = NOW()
              WHERE "id" = ${slotId}
                AND "bookedCount" < "maxCapacity";
            `;

            if (updatedRowsCount === 0) {
              throw new Error(
                'Sorry, that appointment slot was just claimed by another user. Please choose a different time slot.'
              );
            }

            appointmentBookingsToMake.push({ slotId, fieldId: ans.fieldId });
          }
        }

        // STEP 3: Create Parent Submission with Immutable Field Snapshot (SOLVES SCHEMA DRIFT)
        const fieldsSnapshot = form.fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          orderIndex: f.orderIndex,
          isRequired: f.isRequired,
        }));

        const submission = await tx.dynamicFormSubmission.create({
          data: {
            formId: form.id,
            metadata: {
              fieldsSnapshot,
              clientTimezone: clientTimezone || 'UTC',
              submittedAtIso: new Date().toISOString(),
            },
          },
        });

        // STEP 4: Store Normalized Submission Answers with Individual Field Snapshots
        for (const ans of answers) {
          const correspondingField = form.fields.find((f) => f.id === ans.fieldId);
          const fieldSnapshot = correspondingField
            ? {
                label: correspondingField.label,
                type: correspondingField.type,
                orderIndex: correspondingField.orderIndex,
              }
            : { label: 'Deleted Question', type: 'TEXT', orderIndex: -1 };

          await tx.dynamicSubmissionAnswer.create({
            data: {
              submissionId: submission.id,
              fieldId: ans.fieldId,
              fieldSnapshot: fieldSnapshot as any,
              answerValue: ans.answerValue || '',
              jsonValue: (ans.jsonValue as any) ?? null,
              slotId: ans.slotId || null,
            },
          });
        }

        // STEP 5: Create Slot Booking Records
        for (const booking of appointmentBookingsToMake) {
          await tx.slotBooking.create({
            data: {
              slotId: booking.slotId,
              submissionId: submission.id,
              status: 'CONFIRMED',
            },
          });
        }

        // Fetch booked slot times if an appointment was booked
        let appointmentDetails: { startTime: Date; endTime: Date } | null = null;
        if (appointmentBookingsToMake.length > 0) {
          const bookedSlot = await tx.appointmentSlot.findUnique({
            where: { id: appointmentBookingsToMake[0].slotId },
            select: { startTime: true, endTime: true },
          });
          if (bookedSlot) {
            appointmentDetails = bookedSlot;
          }
        }

        const answersForEmail = form.fields.map((f) => {
          const matched = answers.find((a) => a.fieldId === f.id);
          return {
            label: f.label,
            value: matched?.answerValue || (matched?.jsonValue ? matched.jsonValue.join(', ') : ''),
          };
        });

        return {
          submissionId: submission.id,
          formTitle: form.title,
          answersForEmail,
          appointmentDetails,
        };
      },
      {
        isolationLevel: 'ReadCommitted',
        timeout: 15000,
      }
    );

    // STEP 6: Send email notifications to NOTIFY_MAIL and respondent email asynchronously
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const userEmail = answers
      .map((a) => a.answerValue?.trim() || '')
      .find((val) => emailRegex.test(val));

    sendFormSubmissionNotifications({
      formTitle: result.formTitle,
      submissionId: result.submissionId,
      clientTimezone,
      answers: result.answersForEmail,
      appointment: result.appointmentDetails
        ? {
            startTime: result.appointmentDetails.startTime.toISOString(),
            endTime: result.appointmentDetails.endTime.toISOString(),
          }
        : null,
      userEmail,
    }).catch((emailErr) => {
      console.error('[FORM SUBMISSION EMAIL ERROR]:', emailErr);
    });

    return { success: true, submissionId: result.submissionId };
  } catch (error: any) {
    console.error('[SUBMIT_FORM_TRANSACTION_ERROR]:', error);
    return { success: false, error: error.message || 'Submission failed' };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 5. FETCH FORM ANALYTICS ACTION
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getFormAnalyticsAction(formId: string): Promise<{
  success: boolean;
  data?: FormAnalyticsReport;
  error?: string;
}> {
  try {
    const report = await getFormAnalytics(formId);
    if (!report) return { success: false, error: 'Form not found' };
    return { success: true, data: report };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 6. ADMIN: LIST ALL DYNAMIC FORMS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function listAdminFormsAction() {
  try {
    const forms = await prisma.dynamicForm.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            submissions: true,
            fields: { where: { isActive: true } },
          },
        },
        fields: {
          where: { isActive: true, type: 'APPOINTMENT' },
          select: { id: true },
        },
      },
    });

    return {
      success: true as const,
      forms: forms.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        isPublished: f.isPublished,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        submissionCount: f._count.submissions,
        fieldCount: f._count.fields,
        hasAppointments: f.fields.length > 0,
      })),
    };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 7. ADMIN: GET SINGLE FORM DETAILS FOR EDITING OR PREVIEW
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getFormDetailsAction(formId: string) {
  try {
    const form = await prisma.dynamicForm.findUnique({
      where: { id: formId },
      include: {
        fields: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!form) return { success: false as const, error: 'Form not found' };

    return {
      success: true as const,
      form: {
        id: form.id,
        title: form.title,
        description: form.description || '',
        isPublished: form.isPublished,
        fields: form.fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          placeholder: f.placeholder || '',
          helpText: f.helpText || '',
          isRequired: f.isRequired,
          orderIndex: f.orderIndex,
          options: (f.options as any) || [],
          appointmentConfig: (f.appointmentConfig as any) || undefined,
          isActive: f.isActive,
        })),
      },
    };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 8. ADMIN: DELETE A FORM
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function deleteFormAction(formId: string) {
  try {
    await prisma.dynamicForm.delete({
      where: { id: formId },
    });
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 9. ADMIN: GET ALL SUBMISSIONS FOR A FORM WITH DEEP ANSWERS & APPOINTMENTS
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function getFormSubmissionsAction(formId: string) {
  try {
    const submissions = await prisma.dynamicFormSubmission.findMany({
      where: { formId },
      orderBy: { submittedAt: 'desc' },
      include: {
        answers: {
          orderBy: { createdAt: 'asc' },
        },
        slotBookings: {
          include: {
            slot: true,
          },
        },
      },
    });

    return {
      success: true as const,
      submissions: submissions.map((sub) => {
        const metadata = (sub.metadata as any) || {};

        return {
          id: sub.id,
          formId: sub.formId,
          submittedAt: sub.submittedAt.toISOString(),
          clientTimezone: metadata.clientTimezone || 'UTC',
          answers: sub.answers.map((a) => {
            const snap = (a.fieldSnapshot as any) || {};
            return {
              id: a.id,
              fieldId: a.fieldId,
              label: snap.label || 'Question',
              type: snap.type || 'TEXT',
              answerValue: a.answerValue,
              jsonValue: (a.jsonValue as any) || null,
              slotId: a.slotId,
            };
          }),
          appointment: sub.slotBookings[0]
            ? {
                bookingId: sub.slotBookings[0].id,
                slotId: sub.slotBookings[0].slotId,
                status: sub.slotBookings[0].status,
                startTime: sub.slotBookings[0].slot.startTime.toISOString(),
                endTime: sub.slotBookings[0].slot.endTime.toISOString(),
              }
            : null,
        };
      }),
    };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 10. ADMIN: DELETE A SUBMISSION (SAFELY RESTORES APPOINTMENT CAPACITY)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function deleteSubmissionAction(submissionId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Find any slot bookings associated with this submission
      const bookings = await tx.slotBooking.findMany({
        where: { submissionId },
      });

      // Restore slot capacity by decrementing bookedCount
      for (const b of bookings) {
        await tx.$executeRaw`
          UPDATE "AppointmentSlot"
          SET "bookedCount" = GREATEST(0, "bookedCount" - 1),
              "updatedAt" = NOW()
          WHERE "id" = ${b.slotId};
        `;
      }

      // Delete submission (cascades to answers and slotBookings)
      await tx.dynamicFormSubmission.delete({
        where: { id: submissionId },
      });

      return { success: true as const };
    });
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}


