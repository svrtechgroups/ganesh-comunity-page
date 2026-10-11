import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getEventSchedule } from '@/lib/event-schedule';
import { noCacheHeaders, getErrorMessage } from '@/lib/api-utils';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId')?.trim() || 'all';
    const selectedDate = searchParams.get('selectedDate')?.trim() || 'all';
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = searchParams.get('limit') === 'all' ? 0 : Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const exportAll = searchParams.get('exportAll') === 'true';

    // Base condition for the event (used for analytics calculation)
    const isSingleEventSelected = Boolean(eventId && eventId !== 'all');
    const eventWhere: Prisma.EventRSVPWhereInput = isSingleEventSelected
      ? { eventId, paymentStatus: { in: ['Completed', 'Free'] } }
      : { paymentStatus: { in: ['Completed', 'Free'] } };

    // 1. Fetch Event details and Stats
    const targetEvent = isSingleEventSelected
      ? await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, title: true, date: true, eventSchedule: true, availableDates: true },
        })
      : null;

    let totalRSVPs = 0;
    let totalPasses = 0;
    let totalAdults = 0;
    let totalChildren = 0;
    let dayAnalytics: any[] = [];

    if (isSingleEventSelected && targetEvent) {
      // If single event, we need the raw rows for day-by-day grouping
      const eventRSVPs = await prisma.eventRSVP.findMany({
        where: eventWhere,
        select: { ticketsCount: true, adultsCount: true, childrenCount: true, selectedDates: true },
      });

      totalRSVPs = eventRSVPs.length;
      
      const scheduleDays = getEventSchedule(targetEvent);
      const dayStatsMap = new Map<string, any>();

      scheduleDays.forEach((f) => {
        const key = f.dateLabel || f.date;
        dayStatsMap.set(key, { date: key, title: f.title, bookingsCount: 0, totalPasses: 0, adultsCount: 0, childrenCount: 0 });
      });

      for (const r of eventRSVPs) {
        const tickets = r.ticketsCount || (r.adultsCount + r.childrenCount) || 1;
        const adults = r.adultsCount ?? 1;
        const children = r.childrenCount ?? 0;

        totalPasses += tickets;
        totalAdults += adults;
        totalChildren += children;

        const dates = Array.isArray(r.selectedDates) && r.selectedDates.length > 0 ? r.selectedDates : [];
        for (const d of dates) {
          let matchedKey = dayStatsMap.has(d) ? d : null;
          if (!matchedKey) {
            for (const [k] of Array.from(dayStatsMap.entries())) {
              if (k.toLowerCase() === d.toLowerCase() || d.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(d.toLowerCase())) {
                matchedKey = k;
                break;
              }
            }
          }
          if (!matchedKey) {
            matchedKey = d;
            dayStatsMap.set(d, { date: d, title: `${targetEvent.title} - ${d}`, bookingsCount: 0, totalPasses: 0, adultsCount: 0, childrenCount: 0 });
          }
          const curr = dayStatsMap.get(matchedKey)!;
          curr.bookingsCount += 1;
          curr.totalPasses += tickets;
          curr.adultsCount += adults;
          curr.childrenCount += children;
        }
      }
      dayAnalytics = Array.from(dayStatsMap.values());
    } else {
      // No single event selected: use pure DB aggregate (fixes 1.7 double-query loading all records into memory)
      const agg = await prisma.eventRSVP.aggregate({
        where: { paymentStatus: { in: ['Completed', 'Free'] } },
        _count: { id: true },
        _sum: { ticketsCount: true, adultsCount: true, childrenCount: true },
      });
      totalRSVPs = agg._count.id;
      totalPasses = agg._sum.ticketsCount || 0;
      totalAdults = agg._sum.adultsCount || 0;
      totalChildren = agg._sum.childrenCount || 0;
      
      // Fallback: if ticketsCount wasn't populated but adults+children were, sum them
      if (totalPasses === 0 && (totalAdults > 0 || totalChildren > 0)) {
        totalPasses = totalAdults + totalChildren;
      }
      // Ultimate fallback if all counts are 0
      if (totalPasses === 0 && totalRSVPs > 0) totalPasses = totalRSVPs;
    }


    // 2. Build Prisma Filter Where Clause for Attendee Table Query
    const whereConditions: Prisma.EventRSVPWhereInput[] = [
      { paymentStatus: { in: ['Completed', 'Free'] } }
    ];

    if (eventId && eventId !== 'all') {
      whereConditions.push({ eventId });
    }

    if (selectedDate && selectedDate !== 'all') {
      whereConditions.push({
        selectedDates: {
          has: selectedDate,
        },
      });
    }

    if (search) {
      whereConditions.push({
        OR: [
          { attendeeName: { contains: search, mode: 'insensitive' } },
          { attendeeEmail: { contains: search, mode: 'insensitive' } },
          { attendeePhone: { contains: search, mode: 'insensitive' } },
          { travellingFrom: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const tableWhere: Prisma.EventRSVPWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // 3. Count total matching records for pagination
    const totalFiltered = await prisma.eventRSVP.count({ where: tableWhere });

    // 4. Query paginated records with event details
    let rsvps;
    if (exportAll || limit === 0) {
      rsvps = await prisma.eventRSVP.findMany({
        where: tableWhere,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              venue: true,
              customFields: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      rsvps = await prisma.eventRSVP.findMany({
        where: tableWhere,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              venue: true,
              customFields: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }

    // 5. Enrich RSVPs with Member account status and Payment info
    const attendeeEmails = rsvps.map((r) => r.attendeeEmail.toLowerCase().trim()).filter(Boolean);
    const paymentIntentIds = rsvps.map((r) => r.paymentIntentId).filter(Boolean) as string[];

    let memberEmailSet = new Set<string>();
    let memberMap = new Map<string, any>();
    let paymentMap = new Map<string, any>();

    if (attendeeEmails.length > 0) {
      try {
        const existingMembers = await prisma.member.findMany({
          where: {
            email: { in: attendeeEmails },
          },
          select: { email: true, id: true, tier: true, status: true },
        });

        existingMembers.forEach((m) => {
          memberEmailSet.add(m.email.toLowerCase().trim());
          memberMap.set(m.email.toLowerCase().trim(), m);
        });
      } catch (e) {
        console.warn('[ADMIN RSVPS] Error querying member status:', e);
      }
    }

    if (paymentIntentIds.length > 0) {
      try {
        const payments = await prisma.payment.findMany({
          where: { stripePaymentIntentId: { in: paymentIntentIds } },
          select: { id: true, stripePaymentIntentId: true, memberId: true },
        });
        payments.forEach((p) => {
          if (p.stripePaymentIntentId) {
            paymentMap.set(p.stripePaymentIntentId, p);
          }
        });
      } catch (e) {
        console.warn('[ADMIN RSVPS] Error querying payments:', e);
      }
    }

    const enrichedRsvps = rsvps.map((r) => {
      const email = r.attendeeEmail.toLowerCase().trim();
      const payment = r.paymentIntentId ? paymentMap.get(r.paymentIntentId) : null;
      return {
        ...r,
        isMember: memberEmailSet.has(email),
        memberId: memberEmailSet.has(email) ? memberMap.get(email)?.id : null,
        paymentId: payment ? payment.id : null,
        paymentMemberId: payment ? payment.memberId : null,
      };
    });

    const effectiveLimit = limit === 0 ? totalFiltered : limit;
    const totalPages = effectiveLimit > 0 ? Math.max(1, Math.ceil(totalFiltered / effectiveLimit)) : 1;

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: enrichedRsvps,
        pagination: {
          total: totalFiltered,
          page,
          limit: effectiveLimit,
          totalPages,
        },
        stats: {
          totalRSVPs,
          totalPasses,
          totalAdults,
          totalChildren,
        },
        dayAnalytics,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error fetching admin RSVPs:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch RSVPs from database',
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
        stats: { totalRSVPs: 0, totalPasses: 0, totalAdults: 0, totalChildren: 0 },
        dayAnalytics: [],
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'RSVP ID is required' }, { status: 400 });
    }

    const deleted = await prisma.eventRSVP.delete({
      where: { id },
    });

    if (deleted.eventId) {
      await prisma.event
        .update({
          where: { id: deleted.eventId },
          data: { rsvpCount: { decrement: deleted.ticketsCount } },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'RSVP deleted successfully',
      data: deleted,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
