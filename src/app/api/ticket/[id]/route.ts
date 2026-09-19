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
    customerEmail: 'member@mitra.org.uk',
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
    customerEmail: 'member@mitra.org.uk',
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

  const paymentId = resolveTicketId(tokenOrId);
  if (!paymentId) {
    return NextResponse.json({ success: false, error: 'Invalid or forged ticket token.' }, { status: 404 });
  }

  try {
    // Try DB first
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (payment) {
      return NextResponse.json({
        success: true,
        source: 'prisma',
        data: {
          ...payment,
          ticketToken: generateTicketToken(payment.id),
        },
      });
    }
  } catch {
    // DB unavailable — fall through to demo
  }

  // Check demo registry
  if (DEMO_PAYMENTS[paymentId]) {
    const demo = DEMO_PAYMENTS[paymentId];
    return NextResponse.json({
      success: true,
      source: 'demo',
      data: {
        ...demo,
        ticketToken: generateTicketToken(demo.id),
      },
    });
  }

  return NextResponse.json({ success: false, error: 'Ticket not found.' }, { status: 404 });
}
