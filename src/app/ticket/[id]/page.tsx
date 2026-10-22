import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import TicketClient from './TicketClient';
import EventPassClient from './EventPassClient';
import TicketBlocked from './TicketBlocked';
import { resolveTicketId, generateTicketToken } from '@/lib/ticket-token';

// Demo payments for fallback
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
};

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Official Pass & Booking Receipt | MITRA UK',
    description: 'Official event entry pass and booking receipt from MITRA UK. Verify attendee entrance and contribution records.',
  };
}

export default async function TicketPage({ params }: PageProps) {
  const tokenOrId = params.id;
  const entityId = resolveTicketId(tokenOrId);

  if (!entityId) {
    notFound();
  }

  // 1. Try EventRSVP first (for Event Entry Passes)
  let rsvp = null;
  try {
    rsvp = await prisma.eventRSVP.findUnique({
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
  } catch (err) {
    console.error('Error finding EventRSVP in TicketPage:', err);
  }

  if (rsvp) {
    const tickets = Number(rsvp.ticketsCount) || 1;
    const scanned = Number(rsvp.scannedCount) || 0;
    const remainingTickets = Math.max(0, tickets - scanned);
    const scanStatus: 'FULL_SCANNED' | 'HALF_SCANNED' | 'NOT_SCANNED' =
      scanned >= tickets
        ? 'FULL_SCANNED'
        : scanned > 0
        ? 'HALF_SCANNED'
        : 'NOT_SCANNED';

    const canonicalToken = generateTicketToken(rsvp.id);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const ticketUrl = `${baseUrl}/ticket/${canonicalToken}`;

    const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#3D1A00', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    });

    return (
      <EventPassClient
        rsvp={{
          id: rsvp.id,
          eventId: rsvp.eventId,
          event: {
            id: rsvp.event?.id || rsvp.eventId,
            title: rsvp.event?.title || 'Community Event',
            category: rsvp.event?.category,
            date: rsvp.event?.date || '',
            time: rsvp.event?.time || '',
            venue: rsvp.event?.venue || 'Venue TBD',
            address: rsvp.event?.address || '',
            bannerUrl: rsvp.event?.bannerUrl || '',
          },
          attendeeName: rsvp.attendeeName,
          attendeeEmail: rsvp.attendeeEmail,
          attendeePhone: rsvp.attendeePhone || '',
          travellingFrom: rsvp.travellingFrom || '',
          ticketsCount: tickets,
          adultsCount: rsvp.adultsCount || 0,
          childrenCount: rsvp.childrenCount || 0,
          selectedDates: rsvp.selectedDates || [],
          totalAmount: rsvp.totalAmount || 0,
          paymentStatus: rsvp.paymentStatus || 'Completed',
          memberId: rsvp.memberId || '',
          isScanned: rsvp.isScanned,
          scannedAt: rsvp.scannedAt
            ? typeof rsvp.scannedAt === 'string'
              ? rsvp.scannedAt
              : (rsvp.scannedAt as Date).toISOString()
            : undefined,
          scannedBy: rsvp.scannedBy || '',
          scannedCount: scanned,
          remainingTickets,
          scanStatus,
          createdAt:
            typeof rsvp.createdAt === 'string'
              ? rsvp.createdAt
              : (rsvp.createdAt as Date).toISOString(),
        }}
        qrDataUrl={qrDataUrl}
        ticketUrl={ticketUrl}
      />
    );
  }

  // 2. Try Payment record (for Donations / Seva booking receipts)
  let payment = null;
  try {
    payment = await prisma.payment.findUnique({ where: { id: entityId } });
  } catch (err) {
    console.error('Error finding Payment in TicketPage:', err);
  }

  if (!payment && DEMO_PAYMENTS[entityId]) {
    payment = DEMO_PAYMENTS[entityId];
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/ticket/${canonicalToken}`;

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
        createdAt:
          typeof payment.createdAt === 'string'
            ? payment.createdAt
            : (payment.createdAt as Date).toISOString(),
      }}
      qrDataUrl={qrDataUrl}
      ticketUrl={ticketUrl}
    />
  );
}
