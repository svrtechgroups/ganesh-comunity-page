import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { rsvpId } = await request.json();

    if (!rsvpId) {
      return NextResponse.json({ success: false, error: 'RSVP ID is required' }, { status: 400 });
    }

    const rsvp = await prisma.eventRSVP.findUnique({
      where: { id: rsvpId },
    });

    if (!rsvp) {
      return NextResponse.json({ success: false, error: 'RSVP not found' }, { status: 404 });
    }

    if (!rsvp.paymentIntentId) {
      return NextResponse.json({ success: false, error: 'No Stripe Payment Intent associated with this RSVP' }, { status: 400 });
    }

    const normalEmail = rsvp.attendeeEmail.toLowerCase().trim();

    const member = await prisma.member.findUnique({
      where: { email: normalEmail },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'No Member found for this email. Please convert to member first.' }, { status: 400 });
    }

    // Map Payment to Member
    const updatedPayment = await prisma.payment.updateMany({
      where: { stripePaymentIntentId: rsvp.paymentIntentId },
      data: { memberId: member.id },
    });

    if (updatedPayment.count === 0) {
      return NextResponse.json({ success: false, error: 'Payment record not found in the database.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully mapped payment to member ${member.fullName}.`,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Mapping failed';
    console.error('Error mapping payment to member:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
