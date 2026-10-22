import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/events/entry/scan?rsvpId=...
 * Fetch ticket & entry verification details prior to scanning.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rsvpId = searchParams.get('rsvpId');

    if (!rsvpId) {
      return NextResponse.json(
        { success: false, error: 'rsvpId query parameter is required.' },
        { status: 400 }
      );
    }

    const rsvp = await prisma.eventRSVP.findUnique({
      where: { id: rsvpId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            venue: true,
            address: true,
          },
        },
      },
    });

    if (!rsvp) {
      return NextResponse.json(
        { success: false, error: 'RSVP not found in system.' },
        { status: 404 }
      );
    }

    const remainingTickets = Math.max(0, rsvp.ticketsCount - rsvp.scannedCount);
    const scanStatus =
      rsvp.scannedCount >= rsvp.ticketsCount
        ? 'FULL_SCANNED'
        : rsvp.scannedCount > 0
        ? 'HALF_SCANNED'
        : 'NOT_SCANNED';

    return NextResponse.json({
      success: true,
      data: {
        id: rsvp.id,
        eventId: rsvp.eventId,
        event: rsvp.event,
        attendeeName: rsvp.attendeeName,
        attendeeEmail: rsvp.attendeeEmail,
        attendeePhone: rsvp.attendeePhone,
        ticketsCount: rsvp.ticketsCount,
        scannedCount: rsvp.scannedCount,
        remainingTickets,
        isScanned: rsvp.isScanned,
        scannedAt: rsvp.scannedAt,
        scannedBy: rsvp.scannedBy,
        scanStatus,
        paymentStatus: rsvp.paymentStatus,
        totalAmount: rsvp.totalAmount,
        selectedDates: rsvp.selectedDates,
        memberId: rsvp.memberId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to look up ticket';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/events/entry/scan
 * Record ticket scan at event entrance.
 *
 * Body:
 * {
 *   rsvpId: string;            // Required EventRSVP ID
 *   count?: number;            // Number of attendees entering now (default: 1)
 *   time?: string;             // Optional custom scan timestamp (ISO string)
 *   scannedBy?: string;        // Optional scanner identity (defaults to authenticated user/gate)
 *   mode?: 'add' | 'set' | 'reset'; // Scan mode (default: 'add')
 * }
 */
export async function POST(request: Request) {
  try {
    const user = getAuthenticatedUser(request);
    const body = await request.json();
    const {
      rsvpId,
      count = 1,
      time,
      scannedBy,
      mode = 'add',
    } = body;

    if (!rsvpId || typeof rsvpId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid rsvpId is required.' },
        { status: 400 }
      );
    }

    const scanDelta = Number(count) || 1;
    if (scanDelta < 0) {
      return NextResponse.json(
        { success: false, error: 'Scan count must be a non-negative number.' },
        { status: 400 }
      );
    }

    // 1. Fetch current RSVP record
    const rsvp = await prisma.eventRSVP.findUnique({
      where: { id: rsvpId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
      },
    });

    if (!rsvp) {
      return NextResponse.json(
        { success: false, error: `RSVP record with ID "${rsvpId}" not found.` },
        { status: 404 }
      );
    }

    // 2. Calculate target scanned count based on mode
    let targetCount = 0;
    if (mode === 'reset') {
      targetCount = 0;
    } else if (mode === 'set') {
      targetCount = scanDelta;
    } else {
      // Default: 'add'
      targetCount = rsvp.scannedCount + scanDelta;
    }

    // 3. ENFORCE RULE 3: scannedCount should be less than or equal to ticketsCount always
    if (targetCount > rsvp.ticketsCount) {
      const remainingAllowed = Math.max(0, rsvp.ticketsCount - rsvp.scannedCount);
      return NextResponse.json(
        {
          success: false,
          error: `Cannot scan more than total booked tickets (${rsvp.ticketsCount}). Currently scanned: ${rsvp.scannedCount}, remaining capacity: ${remainingAllowed}. Attempted total: ${targetCount}.`,
          code: 'EXCEEDS_TICKET_CAPACITY',
          ticketsCount: rsvp.ticketsCount,
          scannedCount: rsvp.scannedCount,
          remainingTickets: remainingAllowed,
        },
        { status: 400 }
      );
    }

    // 4. Determine scanned flags & metadata
    const isFullyScanned = targetCount >= rsvp.ticketsCount && targetCount > 0;
    const scanTimestamp = time ? new Date(time) : new Date();
    const finalScannedBy =
      scannedBy?.trim() ||
      user?.fullName ||
      user?.email ||
      'Gate Scanner';

    // 5. Update database record
    const updated = await prisma.eventRSVP.update({
      where: { id: rsvp.id },
      data: {
        isScanned: isFullyScanned,
        scannedCount: targetCount,
        scannedAt: targetCount > 0 ? scanTimestamp : null,
        scannedBy: targetCount > 0 ? finalScannedBy : null,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
      },
    });

    const remainingTickets = Math.max(0, updated.ticketsCount - updated.scannedCount);
    const scanStatus =
      updated.scannedCount >= updated.ticketsCount
        ? 'FULL_SCANNED'
        : updated.scannedCount > 0
        ? 'HALF_SCANNED'
        : 'NOT_SCANNED';

    return NextResponse.json({
      success: true,
      message:
        targetCount === 0
          ? 'Scan count reset to 0.'
          : isFullyScanned
          ? `All ${updated.ticketsCount} ticket(s) fully verified and checked in.`
          : `Partially scanned: ${updated.scannedCount} of ${updated.ticketsCount} ticket(s) checked in (${remainingTickets} remaining).`,
      scanStatus,
      data: {
        id: updated.id,
        eventId: updated.eventId,
        eventTitle: updated.event?.title,
        attendeeName: updated.attendeeName,
        attendeeEmail: updated.attendeeEmail,
        attendeePhone: updated.attendeePhone,
        ticketsCount: updated.ticketsCount,
        scannedCount: updated.scannedCount,
        remainingTickets,
        isScanned: updated.isScanned,
        scannedAt: updated.scannedAt,
        scannedBy: updated.scannedBy,
        paymentStatus: updated.paymentStatus,
        memberId: updated.memberId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Entry scanning operation failed';
    console.error('[EVENT ENTRY SCAN ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
