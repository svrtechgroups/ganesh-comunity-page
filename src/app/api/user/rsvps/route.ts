import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateTicketToken } from '@/lib/ticket-token';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/user/rsvps
 * Fetch all Event RSVPs & entry passes for the currently logged-in member.
 * Matches by optional memberId OR devotee attendeeEmail.
 */
export async function GET(request: Request) {
  try {
    // 1. Authenticate user from cookie or Bearer header
    const cookieStore = await cookies();
    let token = cookieStore.get('mitra_token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view tickets.' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    const userId = payload.id;
    const userEmail = payload.email?.toLowerCase().trim();

    // 2. Query all RSVPs linked to this member
    const rsvps = await prisma.eventRSVP.findMany({
      where: {
        OR: [
          ...(userId ? [{ memberId: userId }] : []),
          ...(userEmail ? [{ attendeeEmail: { equals: userEmail, mode: 'insensitive' as const } }] : []),
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
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

    // 3. Enrich with scan status and ticket token
    const enriched = rsvps.map((r) => {
      const tickets = Number(r.ticketsCount) || 1;
      const scanned = Number(r.scannedCount) || 0;
      const remainingTickets = Math.max(0, tickets - scanned);
      const scanStatus =
        scanned >= tickets
          ? 'FULL_SCANNED'
          : scanned > 0
          ? 'HALF_SCANNED'
          : 'NOT_SCANNED';

      return {
        id: r.id,
        eventId: r.eventId,
        event: r.event,
        attendeeName: r.attendeeName,
        attendeeEmail: r.attendeeEmail,
        attendeePhone: r.attendeePhone,
        travellingFrom: r.travellingFrom,
        ticketsCount: tickets,
        adultsCount: r.adultsCount,
        childrenCount: r.childrenCount,
        selectedDates: r.selectedDates,
        totalAmount: r.totalAmount,
        supportAmount: r.supportAmount,
        paymentStatus: r.paymentStatus,
        paymentIntentId: r.paymentIntentId,
        memberId: r.memberId,
        customResponses: r.customResponses,

        // Entry management fields
        isScanned: r.isScanned,
        scannedAt: r.scannedAt,
        scannedBy: r.scannedBy,
        scannedCount: scanned,
        remainingTickets,
        scanStatus,

        createdAt: typeof r.createdAt === 'string' ? r.createdAt : r.createdAt.toISOString(),
        ticketToken: generateTicketToken(r.id),
      };
    });

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: enriched,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user RSVPs';
    console.error('[USER RSVPS API ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
