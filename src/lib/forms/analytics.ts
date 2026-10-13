import { prisma } from '@/lib/prisma';
import { FieldAnalyticsDTO, FormAnalyticsReport } from '@/types/dynamic-form';

/**
 * Fast analytics reporting for dynamic forms
 * Computes response volume, question response distributions, and appointment slot utilization
 */
export async function getFormAnalytics(formId: string): Promise<FormAnalyticsReport | null> {
  const form = await prisma.dynamicForm.findUnique({
    where: { id: formId },
    include: {
      fields: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!form) return null;

  // 1. Total Submissions Count & Velocity
  const totalSubmissions = await prisma.dynamicFormSubmission.count({
    where: { formId },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const submissionsLast7Days = await prisma.dynamicFormSubmission.count({
    where: {
      formId,
      submittedAt: { gte: sevenDaysAgo },
    },
  });

  // 2. Field-level Analytics
  const fieldAnalyticsList: FieldAnalyticsDTO[] = [];

  for (const field of form.fields) {
    const totalAnswers = await prisma.dynamicSubmissionAnswer.count({
      where: { fieldId: field.id },
    });

    if (['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type)) {
      // Group by normalized answer value
      const distributionQuery = await prisma.dynamicSubmissionAnswer.groupBy({
        by: ['answerValue'],
        where: { fieldId: field.id },
        _count: {
          answerValue: true,
        },
        orderBy: {
          _count: {
            answerValue: 'desc',
          },
        },
      });

      const choiceDistribution = distributionQuery.map((item) => ({
        choice: item.answerValue || '(Empty)',
        count: item._count.answerValue,
        percentage: totalAnswers > 0 ? Math.round((item._count.answerValue / totalAnswers) * 100) : 0,
      }));

      fieldAnalyticsList.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        totalAnswers,
        choiceDistribution,
      });
    } else if (field.type === 'APPOINTMENT') {
      // Slot capacity & booking analytics
      const slots = await prisma.appointmentSlot.findMany({
        where: { fieldId: field.id },
        select: {
          maxCapacity: true,
          bookedCount: true,
        },
      });

      const totalSlots = slots.length;
      const totalCapacity = slots.reduce((acc, s) => acc + s.maxCapacity, 0);
      const totalBooked = slots.reduce((acc, s) => acc + s.bookedCount, 0);
      const utilization = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

      fieldAnalyticsList.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        totalAnswers,
        appointmentStats: {
          totalSlots,
          totalCapacity,
          totalBooked,
          utilizationPercentage: utilization,
        },
      });
    } else {
      // Text, Textarea, Date basic response volume
      fieldAnalyticsList.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        totalAnswers,
      });
    }
  }

  return {
    formId: form.id,
    formTitle: form.title,
    isPublished: form.isPublished,
    totalSubmissions,
    submissionsLast7Days,
    fields: fieldAnalyticsList,
  };
}
