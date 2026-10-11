import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'paymentId required' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    if (!payment.eventId) {
      return NextResponse.json({ success: false, error: 'Payment does not have an associated eventId' }, { status: 400 });
    }

    // Check if an RSVP already exists
    const existing = await prisma.eventRSVP.findFirst({
      where: {
        OR: [
          { paymentIntentId: payment.id },
          ...(payment.stripePaymentIntentId ? [{ paymentIntentId: payment.stripePaymentIntentId }] : [])
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'RSVP already exists for this payment' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: payment.eventId }
    });

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Create RSVP
    const rsvp = await prisma.eventRSVP.create({
      data: {
        eventId: payment.eventId,
        attendeeName: payment.primaryDevoteeName || payment.customerName || 'Unknown',
        attendeeEmail: payment.customerEmail || 'no-email@mitra.uk',
        attendeePhone: payment.customerPhone || '',
        ticketsCount: 1,
        adultsCount: 1,
        childrenCount: 0,
        totalAmount: payment.amount || 0,
        paymentStatus: payment.status || 'Completed',
        paymentIntentId: payment.stripePaymentIntentId || payment.id,
        selectedDates:event.availableDates,
        customResponses: {
          
        }
      }
    });

    return NextResponse.json({ success: true, data: rsvp });
  } catch (error) {
    console.error('Force RSVP Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
