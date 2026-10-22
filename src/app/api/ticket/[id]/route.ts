import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTicketId, generateTicketToken } from '@/lib/ticket-token';

// Demo payments registry for public ticket lookup
const DEMO_PAYMENTS: Record<string, {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  description: string;
  paymentMethod: string;
  createdAt: string;
}> = {
  'pay-101': {
    id: 'pay-101',
    amount: 250.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Srinivas & Lakshmi Prasad',
    customerEmail: 'sl.prasad@example.co.uk',
    description: 'Slough Mahotsav Patron Sponsorship & Diya Seva',
    paymentMethod: 'Stripe Card',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  'pay-102': {
    id: 'pay-102',
    amount: 15.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Anil Varma',
    customerEmail: 'anil.v@example.co.uk',
    description: 'MITRA Ugadi Cultural Fest Entry Pass (1 Ticket)',
    paymentMethod: 'Stripe ApplePay',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  'pay-103': {
    id: 'pay-103',
    amount: 100.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Priyanka Reddy',
    customerEmail: 'priyanka.reddy@example.co.uk',
    description: 'Life Membership Plan Registration',
    paymentMethod: 'Stripe Card',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  'pay-201': {
    id: 'pay-201',
    amount: 51.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Mahesh Babu G',
    customerEmail: 'member@mitrauk.com',
    description: 'Seva Booking — Ganesh Mahotsav 2026 Seva Fund',
    paymentMethod: 'Stripe Card',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  'pay-202': {
    id: 'pay-202',
    amount: 25.0,
    currency: 'GBP',
    status: 'Completed',
    customerName: 'Mahesh Babu G',
    customerEmail: 'member@mitrauk.com',
    description: 'Pooja Booking — Ganesh Chaturthi Morning Slot',
    paymentMethod: 'Stripe ApplePay',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const tokenOrId = params.id;

  if (!tokenOrId) {
    return NextResponse.json({ success: false, error: 'Ticket token is required.' }, { status: 400 });
  }

  const entityId = resolveTicketId(tokenOrId);
  if (!entityId) {
    return NextResponse.json({ success: false, error: 'Invalid or forged ticket token.' }, { status: 404 });
  }

  try {
    // 1. Try EventRSVP first (for Event Entry Passes)
    const rsvp = await prisma.eventRSVP.findUnique({
      where: { id: entityId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
            time: true,
            venue: true,
            address: true,
            bannerUrl: true,
          },
        },
      },
    });

    if (rsvp) {
      const tickets = Number(rsvp.ticketsCount) || 1;
      const scanned = Number(rsvp.scannedCount) || 0;
      const remainingTickets = Math.max(0, tickets - scanned);
      const scanStatus =
        scanned >= tickets
          ? 'FULL_SCANNED'
          : scanned > 0
          ? 'HALF_SCANNED'
          : 'NOT_SCANNED';

      // Find linked Payment record if available
      let paymentRecord = null;
      if (rsvp.paymentIntentId) {
        paymentRecord = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: rsvp.paymentIntentId },
        });
      }
      if (!paymentRecord && rsvp.attendeeEmail) {
        paymentRecord = await prisma.payment.findFirst({
          where: {
            customerEmail: { equals: rsvp.attendeeEmail, mode: 'insensitive' },
            eventId: rsvp.eventId,
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      const rsvpData = {
        id: rsvp.id,
        eventId: rsvp.eventId,
        event: rsvp.event,
        attendeeName: rsvp.attendeeName,
        attendeeEmail: rsvp.attendeeEmail,
        attendeePhone: rsvp.attendeePhone,
        travellingFrom: rsvp.travellingFrom,
        ticketsCount: tickets,
        adultsCount: rsvp.adultsCount,
        childrenCount: rsvp.childrenCount,
        selectedDates: rsvp.selectedDates,
        totalAmount: rsvp.totalAmount,
        supportAmount: rsvp.supportAmount,
        paymentStatus: rsvp.paymentStatus,
        paymentIntentId: rsvp.paymentIntentId,
        memberId: rsvp.memberId,
        customResponses: rsvp.customResponses,
        isScanned: rsvp.isScanned,
        scannedAt: rsvp.scannedAt,
        scannedBy: rsvp.scannedBy,
        scannedCount: scanned,
        remainingTickets,
        scanStatus,
        ticketToken: generateTicketToken(rsvp.id),
        createdAt: typeof rsvp.createdAt === 'string' ? rsvp.createdAt : rsvp.createdAt.toISOString(),
      };

      return NextResponse.json({
        success: true,
        type: 'event-pass',
        source: 'prisma',
        ticketId: rsvp.id,
        ticketToken: generateTicketToken(rsvp.id),
        rsvp: rsvpData,
        payment: paymentRecord
          ? {
              id: paymentRecord.id,
              amount: paymentRecord.amount,
              currency: paymentRecord.currency,
              status: paymentRecord.status,
              customerName: paymentRecord.customerName,
              customerEmail: paymentRecord.customerEmail,
              customerPhone: paymentRecord.customerPhone,
              description: paymentRecord.description,
              paymentMethod: paymentRecord.paymentMethod,
              stripePaymentIntentId: paymentRecord.stripePaymentIntentId,
              memberId: paymentRecord.memberId,
              eventId: paymentRecord.eventId,
              eventName: paymentRecord.eventName,
              donationType: paymentRecord.donationType,
              createdAt:
                typeof paymentRecord.createdAt === 'string'
                  ? paymentRecord.createdAt
                  : paymentRecord.createdAt.toISOString(),
            }
          : null,
        data: {
          ...rsvpData,
          payment: paymentRecord || undefined,
        },
      });
    }

    // 2. Try Payment next (for Booking receipts & contributions)
    const payment = await prisma.payment.findUnique({ where: { id: entityId } });
    if (payment) {
      // Find linked RSVP record if available
      let linkedRsvp = null;
      if (payment.stripePaymentIntentId) {
        linkedRsvp = await prisma.eventRSVP.findFirst({
          where: { paymentIntentId: payment.stripePaymentIntentId },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                category: true,
                date: true,
                time: true,
                venue: true,
                address: true,
                bannerUrl: true,
              },
            },
          },
        });
      }
      if (!linkedRsvp && payment.customerEmail && payment.eventId) {
        linkedRsvp = await prisma.eventRSVP.findFirst({
          where: {
            attendeeEmail: { equals: payment.customerEmail, mode: 'insensitive' },
            eventId: payment.eventId,
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                category: true,
                date: true,
                time: true,
                venue: true,
                address: true,
                bannerUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      return NextResponse.json({
        success: true,
        type: 'payment',
        source: 'prisma',
        ticketId: payment.id,
        ticketToken: generateTicketToken(payment.id),
        rsvp: linkedRsvp || null,
        payment: {
          ...payment,
          ticketToken: generateTicketToken(payment.id),
        },
        data: {
          ...payment,
          ticketToken: generateTicketToken(payment.id),
          rsvp: linkedRsvp || undefined,
        },
      });
    }
  } catch (err) {
    console.error('Error fetching ticket/rsvp in API:', err);
    // DB unavailable — fall through to demo
  }

  // 3. Check demo registry
  if (DEMO_PAYMENTS[entityId]) {
    const demo = DEMO_PAYMENTS[entityId];
    return NextResponse.json({
      success: true,
      type: 'demo-payment',
      source: 'demo',
      data: {
        ...demo,
        ticketToken: generateTicketToken(demo.id),
      },
    });
  }

  return NextResponse.json({ success: false, error: 'Ticket not found.' }, { status: 404 });
}
