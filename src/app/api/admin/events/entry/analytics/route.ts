import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/events/entry/analytics?eventId=...
 *
 * Real-time event gate entry and attendance analytics:
 * - How many are about to attend (totalTicketsExpected & totalTicketsRemaining)
 * - How many have attended (totalTicketsAttended)
 * - How many are half scanned (halfScannedCount)
 * - How many are full scanned (fullScannedCount)
 * - How many are not scanned (notScannedCount)
 * - Hourly gate check-in velocity and recent activity feed
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'all';

    // 1. Build where filter for EventRSVP
    const where: Prisma.EventRSVPWhereInput = {};
    if (eventId && eventId !== 'all') {
      where.eventId = eventId;
    }

    // 2. Fetch all matching RSVPs and event details
    const [rsvps, eventsList] = await Promise.all([
      prisma.eventRSVP.findMany({
        where,
        select: {
          id: true,
          eventId: true,
          attendeeName: true,
          attendeeEmail: true,
          attendeePhone: true,
          ticketsCount: true,
          adultsCount: true,
          childrenCount: true,
          isScanned: true,
          scannedAt: true,
          scannedBy: true,
          scannedCount: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              capacity: true,
              venue: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.findMany({
        select: { id: true, title: true, date: true, capacity: true, venue: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // 3. Aggregate metrics
    let totalRsvps = rsvps.length;
    let totalTicketsExpected = 0;
    let totalTicketsAttended = 0;
    let totalAdultsExpected = 0;
    let totalChildrenExpected = 0;

    let notScannedCount = 0;
    let halfScannedCount = 0;
    let fullScannedCount = 0;

    let ticketsInNotScanned = 0;
    let ticketsInHalfScannedAttended = 0;
    let ticketsInHalfScannedRemaining = 0;
    let ticketsInFullScanned = 0;

    const hourlyScanMap = new Map<string, number>();
    const scannedRsvps: typeof rsvps = [];

    for (const r of rsvps) {
      const tickets = Number(r.ticketsCount) || 1;
      const scanned = Number(r.scannedCount) || 0;
      const adults = Number(r.adultsCount) || 0;
      const children = Number(r.childrenCount) || 0;

      totalTicketsExpected += tickets;
      totalTicketsAttended += scanned;
      totalAdultsExpected += adults;
      totalChildrenExpected += children;

      if (scanned === 0) {
        notScannedCount++;
        ticketsInNotScanned += tickets;
      } else if (scanned >= tickets) {
        fullScannedCount++;
        ticketsInFullScanned += tickets;
      } else {
        // 0 < scanned < tickets
        halfScannedCount++;
        ticketsInHalfScannedAttended += scanned;
        ticketsInHalfScannedRemaining += (tickets - scanned);
      }

      // Track scans by hour
      if (r.scannedAt) {
        scannedRsvps.push(r);
        const scanDate = new Date(r.scannedAt);
        const hourKey = `${scanDate.toISOString().slice(0, 10)} ${String(scanDate.getHours()).padStart(2, '0')}:00`;
        hourlyScanMap.set(hourKey, (hourlyScanMap.get(hourKey) || 0) + scanned);
      }
    }

    const totalTicketsRemaining = Math.max(0, totalTicketsExpected - totalTicketsAttended);
    const attendancePercentage =
      totalTicketsExpected > 0
        ? ((totalTicketsAttended / totalTicketsExpected) * 100).toFixed(1)
        : '0.0';

    // Sort recent scans by scan time
    scannedRsvps.sort((a, b) => {
      const timeA = a.scannedAt ? new Date(a.scannedAt).getTime() : 0;
      const timeB = b.scannedAt ? new Date(b.scannedAt).getTime() : 0;
      return timeB - timeA;
    });

    const recentScans = scannedRsvps.slice(0, 25).map((r) => ({
      id: r.id,
      attendeeName: r.attendeeName,
      attendeeEmail: r.attendeeEmail,
      eventTitle: r.event?.title || 'Unknown Event',
      ticketsCount: r.ticketsCount,
      scannedCount: r.scannedCount,
      remainingTickets: Math.max(0, r.ticketsCount - r.scannedCount),
      scanStatus:
        r.scannedCount >= r.ticketsCount
          ? 'FULL_SCANNED'
          : r.scannedCount > 0
          ? 'HALF_SCANNED'
          : 'NOT_SCANNED',
      scannedAt: r.scannedAt,
      scannedBy: r.scannedBy,
    }));

    // Hourly timeline
    const hourlyTimeline = Array.from(hourlyScanMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Event title for selected filter
    const selectedEvent = eventsList.find((e) => e.id === eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          filter: {
            eventId,
            eventTitle: selectedEvent ? selectedEvent.title : 'All Events',
            eventCapacity: selectedEvent?.capacity || null,
            eventVenue: selectedEvent?.venue || null,
          },
          summary: {
            // How many are about to attend vs attended:
            totalRsvps,
            totalTicketsExpected,           // Total registered attendees expected
            totalTicketsAttended,           // Total checked-in attendees
            totalTicketsRemaining,          // Attendees yet to enter
            attendancePercentage: `${attendancePercentage}%`,
          },
          scanClassification: {
            // Breakdown requested:
            fullScanned: {
              count: fullScannedCount,
              tickets: ticketsInFullScanned,
              description: 'All tickets on booking are verified and checked in.',
            },
            halfScanned: {
              count: halfScannedCount,
              attendedTickets: ticketsInHalfScannedAttended,
              remainingTickets: ticketsInHalfScannedRemaining,
              description: 'Partially checked in (some group members arrived, others pending).',
            },
            notScanned: {
              count: notScannedCount,
              tickets: ticketsInNotScanned,
              description: 'Registered devotees about to attend (zero scans so far).',
            },
          },
          attendeeDemographics: {
            totalAdultsExpected,
            totalChildrenExpected,
          },
          recentScans,
          hourlyTimeline,
          availableEvents: eventsList.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
          })),
        },
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
    const message = error instanceof Error ? error.message : 'Failed to fetch entry analytics';
    console.error('[EVENT ENTRY ANALYTICS ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
