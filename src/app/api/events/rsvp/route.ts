import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
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
  try {
    const {
      eventId,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      travellingFrom,
      ticketsCount,
      adultsCount,
      childrenCount,
      selectedDates,
    } = await request.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required attendee fields' },
        { status: 400 }
      );
    }

    const normalEmail = attendeeEmail.toLowerCase().trim();
    const safeName = attendeeName.trim();
    const safePhone = attendeePhone ? attendeePhone.trim() : '';
    const adults = Number(adultsCount) || 1;
    const children = Number(childrenCount) || 0;
    const totalTickets = Number(ticketsCount) || (adults + children);
    const datesArray: string[] = Array.isArray(selectedDates) ? selectedDates : ['14 Sep (Mon)'];
    const travelOrigin = travellingFrom ? String(travellingFrom).trim() : null;

    // ── 1. Create or Update Event in DB ─────────────────────────────────────
    let eventRecord = await prisma.event.findUnique({
      where: { id: eventId },
    }).catch(() => null);

    if (!eventRecord) {
      eventRecord = await prisma.event.create({
        data: {
          id: eventId,
          title: 'London Ganesh Mahotsav 2026',
          category: 'Cultural Events',
          date: '13 to 19 September 2026',
          time: 'Monday – Saturday: 6:00 PM – 9:00 PM | Sunday: 11:00 AM – 5:00 PM',
          venue: 'E Block, SLOUGH & LANGLEY COLLEGE',
          address: 'Langley Road, SL3 8GW',
          description: 'London’s largest Maha Ganapathi Mahotsav.',
          bannerUrl: '/assets/organizers-poster.jpg',
          capacity: 5000,
          rsvpCount: totalTickets,
        },
      }).catch(() => null);
    } else {
      await prisma.event.update({
        where: { id: eventId },
        data: { rsvpCount: { increment: totalTickets } },
      }).catch(() => {});
    }

    // ── 2. Create Event RSVP in DB ──────────────────────────────────────────
    let rsvp;
    try {
      rsvp = await prisma.eventRSVP.create({
        data: {
          eventId,
          attendeeName: safeName,
          attendeeEmail: normalEmail,
          attendeePhone: safePhone,
          travellingFrom: travelOrigin,
          ticketsCount: totalTickets,
          adultsCount: adults,
          childrenCount: children,
          selectedDates: datesArray,
        },
      });
    } catch (e) {
      console.warn('[RSVP] DB creation fallback:', e);
      rsvp = {
        id: `RSVP-${Date.now()}`,
        eventId,
        attendeeName: safeName,
        attendeeEmail: normalEmail,
        attendeePhone: safePhone,
        travellingFrom: travelOrigin,
        ticketsCount: totalTickets,
        adultsCount: adults,
        childrenCount: children,
        selectedDates: datesArray,
        createdAt: new Date(),
      };
    }

    // ── 3. Automatic Guest Login & Member Account Creation ──────────────────
    let member = await prisma.member.findUnique({
      where: { email: normalEmail },
    }).catch(() => null);

    let isNewUser = false;

    if (!member) {
      // Generate temporary password and create account
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      try {
        member = await prisma.member.create({
          data: {
            fullName: safeName,
            email: normalEmail,
            phone: safePhone,
            tier: 'Annual Member',
            passwordHash,
            startDate: today,
            expiryDate: expiry.toISOString().split('T')[0],
            status: 'Active',
            role: 'Member',
          },
        });
        isNewUser = true;

        // Send email with temp password asynchronously
        sendGuestWelcomeEmail(normalEmail, member.fullName, tempPassword).catch((err) =>
          console.error('[RSVP-GUEST] Email send failed:', err)
        );
      } catch (memErr) {
        console.error('[RSVP-GUEST] Member creation error:', memErr);
      }
    }

    // Prepare User Payload & JWT Token for seamless automatic login
    let userPayload = null;
    let token = '';

    if (member) {
      userPayload = {
        id: member.id,
        email: member.email,
        role: (member.role || 'Member') as 'Member' | 'Admin',
        fullName: member.fullName,
        tier: member.tier,
        phone: member.phone,
        status: member.status,
        expiryDate: member.expiryDate,
      };

      token = signToken({
        id: member.id,
        email: member.email,
        role: (member.role || 'Member') as 'Member' | 'Admin',
        fullName: member.fullName,
        tier: member.tier,
      });
    }

    const response = NextResponse.json({
      success: true,
      source: 'prisma',
      isNewUser,
      user: userPayload,
      data: {
        rsvpId: rsvp.id,
        eventId,
        attendeeName: rsvp.attendeeName,
        attendeeEmail: rsvp.attendeeEmail,
        attendeePhone: rsvp.attendeePhone,
        travellingFrom: rsvp.travellingFrom,
        ticketsCount: rsvp.ticketsCount,
        adultsCount: rsvp.adultsCount,
        childrenCount: rsvp.childrenCount,
        selectedDates: rsvp.selectedDates,
        createdAt: rsvp.createdAt,
      },
    });

    if (token) {
      response.cookies.set('mitra_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'RSVP processing failed';
    console.error('[RSVP ERROR]:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
