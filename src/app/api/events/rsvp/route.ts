import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { sendGuestWelcomeEmail, sendEmail, renderEmailLayout, sendEventRegistrationConfirmationEmail } from '@/lib/email';

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
      totalAmount,
      supportAmount = 0,
      paymentStatus,
      paymentIntentId,
      customResponses = {},
    } = await request.json();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required attendee fields' },
        { status: 400 }
      );
    }

    const totalTickets = Number(ticketsCount) || 0;
    const normalEmail = attendeeEmail.toLowerCase().trim();
    const safeName = attendeeName.trim();
    const safePhone = attendeePhone ? attendeePhone.trim() : '';
    const adults = Number(adultsCount) || 0;
    const children = Number(childrenCount) || 0;
    const rawDates: string[] = Array.isArray(selectedDates) ? selectedDates : [];
    const travelOrigin = travellingFrom ? String(travellingFrom).trim() : null;

    // ── 1. Fetch Event and Validate Customization & Capacity ───────────────
    let eventRecord = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!eventRecord && (eventId === 'evt-ganesh-chaturthi' || eventId === 'evt-101')) {
      eventRecord = await prisma.event.findFirst({
        where: { title: { contains: 'Ganesh', mode: 'insensitive' } },
      });
    }

    if (!eventRecord && (eventId === 'evt-bathukamma-2026' || eventId.toLowerCase().includes('bathukamma') || eventId.toLowerCase().includes('grays'))) {
      eventRecord = await prisma.event.findFirst({
        where: {
          OR: [
            { title: { contains: 'Bathukamma', mode: 'insensitive' } },
            { title: { contains: 'Grays', mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!eventRecord) {
      return NextResponse.json(
        { success: false, error: 'Event not found in system.' },
        { status: 404 }
      );
    }

    // Filter past dates if it's the Ganesh festival specific dates
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 8 is September
    const currentDay = now.getDate();

    let datesArray = rawDates.filter((dateStr) => {
      if (dateStr.toLowerCase().includes('sep')) {
        const dayNum = parseInt(dateStr.replace(/\D/g, ''), 10);
        if (isNaN(dayNum)) return true;
        if (currentYear > 2026) return false;
        if (currentYear === 2026 && currentMonth === 8 && dayNum < currentDay) return false;
      }
      return true;
    });

    if (datesArray.length === 0) {
      if (rawDates.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Please select an upcoming date. Past dates cannot be booked.' },
          { status: 400 }
        );
      }
      datesArray = [eventRecord.date || 'General Admission'];
    }

    if (eventRecord && eventRecord.enableRsvp === false) {
      return NextResponse.json(
        { success: false, error: 'Registration / RSVP is currently disabled for this event.' },
        { status: 400 }
      );
    }

    const capacity = eventRecord ? (eventRecord.capacity || 5000) : 5000;
    const currentRsvps = eventRecord ? (eventRecord.rsvpCount || 0) : 0;
    const newTotalRsvps = currentRsvps + totalTickets;

    // Check total capacity limit enforcement
    if (eventRecord && eventRecord.enforceCapacityLimit && newTotalRsvps > capacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Event capacity reached (${capacity} attendees max). Registrations are now closed.`,
        },
        { status: 400 }
      );
    }

    // Check separate adult capacity limit
    if (eventRecord && eventRecord.enforceCapacityLimit && eventRecord.adultCapacity && eventRecord.adultCapacity > 0) {
      const adultAgg = await prisma.eventRSVP.aggregate({
        where: { eventId: eventRecord.id },
        _sum: { adultsCount: true },
      });
      const currentAdults = adultAgg._sum.adultsCount || 0;
      if (currentAdults + adults > eventRecord.adultCapacity) {
        const remainingAdults = Math.max(0, eventRecord.adultCapacity - currentAdults);
        return NextResponse.json(
          {
            success: false,
            error: `Adult capacity limit reached (${eventRecord.adultCapacity} adults max). Only ${remainingAdults} adult slot${remainingAdults === 1 ? '' : 's'} remaining.`,
          },
          { status: 400 }
        );
      }
    }

    // Check separate child capacity limit
    if (eventRecord && eventRecord.enforceCapacityLimit && eventRecord.childCapacity && eventRecord.childCapacity > 0) {
      const childAgg = await prisma.eventRSVP.aggregate({
        where: { eventId: eventRecord.id },
        _sum: { childrenCount: true },
      });
      const currentChildren = childAgg._sum.childrenCount || 0;
      if (currentChildren + children > eventRecord.childCapacity) {
        const remainingChildren = Math.max(0, eventRecord.childCapacity - currentChildren);
        return NextResponse.json(
          {
            success: false,
            error: `Child capacity limit reached (${eventRecord.childCapacity} children max). Only ${remainingChildren} child slot${remainingChildren === 1 ? '' : 's'} remaining.`,
          },
          { status: 400 }
        );
      }
    }

    // Check capacity alert threshold (e.g. last 10 slots or fewer left)
    const threshold = Number(process.env.CAPACITY_ALERT_THRESHOLD) || 10;
    const remainingSlots = capacity - newTotalRsvps;

    if (eventRecord && remainingSlots <= threshold && !eventRecord.capacityAlertSent) {
      const notifyRecipient = process.env.NOTIFY_MAIL || process.env.REPORT_MAIL || process.env.SMTP_USER;
      if (notifyRecipient) {
        const alertSubject = `🚨 Event Capacity Warning: "${eventRecord.title}" has ${remainingSlots <= 0 ? 'reached full capacity' : `only ${remainingSlots} slots remaining`}`;
        const alertHtml = renderEmailLayout({
          pageTitle: 'Event Capacity Alert',
          badgeText: 'Capacity Threshold Alert',
          isAlert: true,
          children: `
            <h2 style="color: #991B1B; font-family: 'Cinzel', Georgia, serif; font-size: 18px; margin: 0 0 12px;">
              Event Capacity Warning
            </h2>
            <p style="color: #2D231E; font-size: 14px; margin: 0 0 16px;">
              The event <strong>${eventRecord.title}</strong> is approaching or has reached its capacity limit.
            </p>
            <div style="background: #FFF8F0; border: 1.5px solid #FDBA74; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #6B5E55;">Configured Capacity:</td><td style="font-weight: 700; color: #2D231E;">${capacity}</td></tr>
                <tr><td style="padding: 6px 0; color: #6B5E55;">Total Registered:</td><td style="font-weight: 700; color: #C2410C;">${newTotalRsvps}</td></tr>
                <tr><td style="padding: 6px 0; color: #6B5E55;">Remaining Slots:</td><td style="font-weight: 700; color: #DC2626;">${Math.max(0, remainingSlots)}</td></tr>
                <tr><td style="padding: 6px 0; color: #6B5E55;">Capacity Limit Enforced:</td><td style="font-weight: 700;">${eventRecord.enforceCapacityLimit ? 'YES (Further registrations will be blocked)' : 'NO (Registrations will continue)'}</td></tr>
              </table>
            </div>
          `,
        });

        sendEmail(notifyRecipient, alertSubject, alertHtml).catch((e) =>
          console.error('[CAPACITY ALERT EMAIL ERROR]:', e)
        );
      }

      await prisma.event.update({
        where: { id: eventId },
        data: { capacityAlertSent: true },
      }).catch(() => {});
    }

    if (!eventRecord) {
      const isBathukammaId = eventId.toLowerCase().includes('bathukamma') || eventId.toLowerCase().includes('grays');
      eventRecord = await prisma.event.create({
        data: {
          id: eventId,
          title: isBathukammaId ? 'MITRA Grays Bathukamma 2026' : 'London Ganesh Mahotsav 2026',
          category: 'Cultural Events',
          date: isBathukammaId ? '2026-10-18' : '13 to 19 September 2026',
          time: isBathukammaId ? '4:30 PM onwards' : 'Monday – Saturday: 6:00 PM – 9:00 PM | Sunday: 11:00 AM – 5:00 PM',
          venue: isBathukammaId ? 'Thurrock Rugby Football Club' : 'E Block, SLOUGH & LANGLEY COLLEGE',
          address: isBathukammaId ? 'Oakfield, Long Lane, Grays, Essex, RM16 2QH' : 'Langley Road, SL3 8GW',
          description: isBathukammaId
            ? 'Get ready for a wonderful evening celebrating flowers, culture and togetherness, with family fun, DJ, food and traditional Bathukamma celebrations.'
            : 'London’s largest Maha Ganapathi Mahotsav.',
          bannerUrl: isBathukammaId
            ? 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=1200'
            : '/assets/organizers-poster.jpg',
          capacity: isBathukammaId ? 600 : 5000,
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
    const parsedAmount = Number(totalAmount) || 0;
    const finalPaymentStatus = paymentStatus || (parsedAmount > 0 ? 'Completed' : 'Free');

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
          totalAmount: parsedAmount,
          supportAmount: Number(supportAmount) || 0,
          paymentStatus: finalPaymentStatus,
          paymentIntentId: paymentIntentId ? String(paymentIntentId) : null,
          customResponses: customResponses || {},
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
        totalAmount: parsedAmount,
        supportAmount: Number(supportAmount) || 0,
        paymentStatus: finalPaymentStatus,
        paymentIntentId: paymentIntentId ? String(paymentIntentId) : null,
        customResponses: customResponses || {},
        createdAt: new Date(),
      };
    }
 
     // ── 2.5 Send Registration & Payment Confirmation Email ──────────────────
     sendEventRegistrationConfirmationEmail({
       recipientEmail: normalEmail,
       recipientName: safeName,
       eventName: eventRecord?.title || 'MITRA Grays Bathukamma 2026',
       eventDate: eventRecord?.date || 'Sunday, 18 October 2026',
       eventTime: eventRecord?.time || '4:30 PM onwards',
       eventVenue: eventRecord?.venue || 'Thurrock Rugby Football Club',
       eventAddress: eventRecord?.address || 'Oakfield, Long Lane, Grays, Essex, RM16 2QH',
       totalAmount: parsedAmount,
       supportAmount: Number(supportAmount) || 0,
       ticketsCount: totalTickets,
       adultsCount: adults,
       childrenCount: children,
       selectedDates: datesArray,
       paymentIntentId: paymentIntentId ? String(paymentIntentId) : undefined,
       rsvpId: rsvp.id,
     }).catch((emailErr) => {
       console.error('[RSVP CONFIRMATION EMAIL ERROR]:', emailErr);
     });

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
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'RSVP processing failed';
    console.error('[RSVP ERROR]:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
