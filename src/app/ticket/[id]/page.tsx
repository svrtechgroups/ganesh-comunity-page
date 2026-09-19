import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import TicketClient from './TicketClient';
import TicketBlocked from './TicketBlocked';
import { resolveTicketId, generateTicketToken } from '@/lib/ticket-token';

// Demo payments for SSR fallback
const DEMO_PAYMENTS: Record<string, {
  id: string; amount: number; currency: string; status: string;
  customerName: string; customerEmail: string; description: string;
  paymentMethod: string; createdAt: string;
}> = {
  'pay-101': { id: 'pay-101', amount: 250.0, currency: 'GBP', status: 'Completed', customerName: 'Srinivas & Lakshmi Prasad', customerEmail: 'sl.prasad@example.co.uk', description: 'Slough Mahotsav Patron Sponsorship & Diya Seva', paymentMethod: 'Stripe Card', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  'pay-102': { id: 'pay-102', amount: 15.0, currency: 'GBP', status: 'Completed', customerName: 'Anil Varma', customerEmail: 'anil.v@example.co.uk', description: 'MITRA Ugadi Cultural Fest Entry Pass (1 Ticket)', paymentMethod: 'Stripe ApplePay', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  'pay-103': { id: 'pay-103', amount: 100.0, currency: 'GBP', status: 'Completed', customerName: 'Priyanka Reddy', customerEmail: 'priyanka.reddy@example.co.uk', description: 'Life Membership Plan Registration', paymentMethod: 'Stripe Card', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
  'pay-201': { id: 'pay-201', amount: 51.0, currency: 'GBP', status: 'Completed', customerName: 'Mahesh Babu G', customerEmail: 'member@mitra.org.uk', description: 'Seva Booking — Ganesh Mahotsav 2026 Seva Fund', paymentMethod: 'Stripe Card', createdAt: new Date(Date.now() - 3600000 * 10).toISOString() },
  'pay-202': { id: 'pay-202', amount: 25.0, currency: 'GBP', status: 'Completed', customerName: 'Mahesh Babu G', customerEmail: 'member@mitra.org.uk', description: 'Pooja Booking — Ganesh Chaturthi Morning Slot', paymentMethod: 'Stripe ApplePay', createdAt: new Date(Date.now() - 3600000 * 72).toISOString() },
};

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Booking Receipt | MITRA UK`,
    description: 'Official booking receipt and ticket from MITRA UK (MITRA). Verify this contribution record.',
  };
}

export default async function TicketPage({ params }: PageProps) {
  const tokenOrId = params.id;
  const paymentId = resolveTicketId(tokenOrId);

  if (!paymentId) {
    notFound();
  }

  // Fetch payment record (try DB first, then demo)
  let payment = null;
  try {
    payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  } catch { /* DB unavailable */ }

  if (!payment) {
    payment = DEMO_PAYMENTS[paymentId] ?? null;
  }

  if (!payment) {
    notFound();
  }

  // Block ticket access for non-Completed payments
  if (payment.status !== 'Completed') {
    return (
      <TicketBlocked
        status={payment.status}
        customerName={payment.customerName}
        description={payment.description}
        amount={payment.amount}
        currency={payment.currency}
        paymentId={payment.id}
      />
    );
  }

  // Generate canonical secure hash token for this ticket
  const canonicalToken = generateTicketToken(payment.id);
  const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mitra.org.uk'}/ticket/${canonicalToken}`;

  // Generate QR code pointing to the unguessable ticket URL
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
    width: 200,
    margin: 1,
    color: { dark: '#3D1A00', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });

  return (
    <TicketClient
      payment={{
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        description: payment.description,
        paymentMethod: payment.paymentMethod,
        createdAt: typeof payment.createdAt === 'string'
          ? payment.createdAt
          : (payment.createdAt as Date).toISOString(),
      }}
      qrDataUrl={qrDataUrl}
      ticketUrl={ticketUrl}
    />
  );
}
