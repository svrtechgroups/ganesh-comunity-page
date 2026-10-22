import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendGuestWelcomeEmail } from '@/lib/email';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '@#!';
  let pw = 'Mitra@';
  for (let i = 0; i < 6; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pw += specials.charAt(Math.floor(Math.random() * specials.length));
  return pw;
}

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const body = await request.json();
    const { rsvpId, convertAll, eventId } = body;

    console.log(`[CONVERT-TO-MEMBER] [${timestamp}] Request received:`, { rsvpId, convertAll, eventId });

    // ── Mode 1: Single RSVP Conversion ─────────────────────────────────────────
    if (rsvpId) {
      const rsvp = await prisma.eventRSVP.findUnique({
        where: { id: rsvpId },
      });

      if (!rsvp) {
        return NextResponse.json({ success: false, error: 'RSVP record not found' }, { status: 404 });
      }

      const normalEmail = rsvp.attendeeEmail.toLowerCase().trim();
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);

      let member = await prisma.member.findUnique({
        where: { email: normalEmail },
      });

      let isNew = false;
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      if (!member) {
        // Create new member
        member = await prisma.member.create({
          data: {
            fullName: rsvp.attendeeName.trim(),
            email: normalEmail,
            phone: rsvp.attendeePhone?.trim() || '',
            tier: 'Annual Member',
            passwordHash,
            startDate: today,
            expiryDate: expiry.toISOString().split('T')[0],
            status: 'Active',
            role: 'Member',
          },
        });
        isNew = true;
      } else {
        // Update password with fresh OTP / temp password
        member = await prisma.member.update({
          where: { id: member.id },
          data: {
            passwordHash,
            status: 'Active',
          },
        });
      }

      // Link memberId back to RSVP record
      await prisma.eventRSVP.update({
        where: { id: rsvp.id },
        data: { memberId: member.id },
      }).catch((e) => console.warn('[CONVERT-TO-MEMBER] RSVP memberId update failed:', e));

      // Send credentials email
      await sendGuestWelcomeEmail(normalEmail, member.fullName, tempPassword);

      return NextResponse.json({
        success: true,
        message: isNew
          ? `New Member account created for ${member.fullName} (${normalEmail}). Login credentials sent to email!`
          : `One-time login credentials regenerated for ${member.fullName} (${normalEmail}) and sent to email!`,
        member: {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          isNew,
        },
      });
    }

    // ── Mode 2: Bulk / Convert All RSVPs ───────────────────────────────────────
    if (convertAll) {
      const whereClause = eventId && eventId !== 'all' ? { eventId } : {};
      const rsvps = await prisma.eventRSVP.findMany({
        where: whereClause,
      });

      if (rsvps.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No RSVPs found to convert.',
          convertedCount: 0,
        });
      }

      let createdCount = 0;
      let updatedCount = 0;
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      for (const rsvp of rsvps) {
        const normalEmail = rsvp.attendeeEmail.toLowerCase().trim();
        if (!normalEmail) continue;

        try {
          const tempPassword = generateTempPassword();
          const passwordHash = await hashPassword(tempPassword);

          const existingMember = await prisma.member.findUnique({
            where: { email: normalEmail },
          });

          let targetMemberId = '';
          if (!existingMember) {
            const newMember = await prisma.member.create({
              data: {
                fullName: rsvp.attendeeName.trim(),
                email: normalEmail,
                phone: rsvp.attendeePhone?.trim() || '',
                tier: 'Annual Member',
                passwordHash,
                startDate: today,
                expiryDate: expiry.toISOString().split('T')[0],
                status: 'Active',
                role: 'Member',
              },
            });
            targetMemberId = newMember.id;
            createdCount++;
          } else {
            await prisma.member.update({
              where: { id: existingMember.id },
              data: { passwordHash, status: 'Active' },
            });
            targetMemberId = existingMember.id;
            updatedCount++;
          }

          if (targetMemberId) {
            await prisma.eventRSVP.updateMany({
              where: { attendeeEmail: { equals: normalEmail, mode: 'insensitive' } },
              data: { memberId: targetMemberId },
            }).catch(() => {});
          }

          // Send email with credentials (non-blocking for speed)
          sendGuestWelcomeEmail(normalEmail, rsvp.attendeeName, tempPassword).catch((err) =>
            console.error(`[CONVERT-ALL] Email error for ${normalEmail}:`, err)
          );
        } catch (e) {
          console.error(`[CONVERT-ALL] Error processing ${normalEmail}:`, e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${createdCount + updatedCount} RSVPs (${createdCount} new accounts created, ${updatedCount} refreshed). One-time passwords sent to their emails!`,
        createdCount,
        updatedCount,
        totalProcessed: createdCount + updatedCount,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid conversion request payload' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Conversion failed';
    console.error(`[CONVERT-TO-MEMBER ERROR] [${timestamp}]:`, err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
