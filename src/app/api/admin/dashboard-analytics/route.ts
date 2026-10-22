import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEventSchedule } from '@/lib/event-schedule';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId')?.trim() || 'all';

  try {
    // 1. Fetch available events for filtering and options dropdown
    const allEvents = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        date: true,
        category: true,
        status: true,
        enablePooja: true,
        eventSchedule: true,
      },
    });

    const targetEvent = allEvents.find((e) => e.id === eventId);
    const targetTitle = targetEvent?.title?.toLowerCase() || '';

    // ── 1b. BUILD SCOPED WHERE CLAUSES ────────────────────────────────────────
    const isFiltered = Boolean(eventId && eventId !== 'all');

    const paymentWhere: any = isFiltered
      ? {
          OR: [
            { eventId },
            ...(targetTitle
              ? [
                  { eventName: { contains: targetTitle, mode: 'insensitive' } },
                  { description: { contains: targetTitle, mode: 'insensitive' } },
                ]
              : []),
          ],
        }
      : {};

    const rsvpWhere: any = {
      ...(isFiltered
        ? {
            OR: [
              { eventId },
              ...(targetTitle
                ? [{ event: { title: { contains: targetTitle, mode: 'insensitive' } } }]
                : []),
            ],
          }
        : {}),
    };

    // ── 2. AGGREGATE DATABASE METRICS (ZERO OOM, ZERO MEMORY SCANS) ───────────
    const [
      totalPaymentAgg,
      completedPaymentAgg,
      pendingPaymentAgg,
      failedPaymentAgg,
      rsvpAgg,
      poojaPaymentAgg,
      annadanamPaymentAgg,
      registeredMembersCount,
      activeMembersCount,
      memberTiersRaw,
      subscribersCount,
      charityCasesCount,
      recentPayments,
      recentRSVPs,
      recentMembers,
    ] = await Promise.all([
      // Total Payments
      prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Completed Payments
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: { equals: 'Completed', mode: 'insensitive' } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Pending Payments
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: { equals: 'Pending', mode: 'insensitive' } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Failed Payments
      prisma.payment.aggregate({
        where: { ...paymentWhere, status: { equals: 'Failed', mode: 'insensitive' } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // RSVPs (Passes, Adults, Children, Support)
      prisma.eventRSVP.aggregate({
        where: rsvpWhere,
        _sum: {
          ticketsCount: true,
          adultsCount: true,
          childrenCount: true,
          totalAmount: true,
          supportAmount: true,
        },
        _count: { id: true },
      }),
      // Paid Pooja Sevas
      prisma.payment.aggregate({
        where: {
          ...paymentWhere,
          status: { equals: 'Completed', mode: 'insensitive' },
          OR: [
            { donationType: { contains: 'pooja', mode: 'insensitive' } },
            { poojaTitle: { not: null } },
            { description: { contains: 'pooja', mode: 'insensitive' } },
          ],
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Annadanam
      prisma.payment.aggregate({
        where: {
          ...paymentWhere,
          status: { equals: 'Completed', mode: 'insensitive' },
          OR: [
            { donationType: { in: ['anadanam', 'annadanam'] } },
            { description: { contains: 'anadanam', mode: 'insensitive' } },
            { description: { contains: 'annadanam', mode: 'insensitive' } },
          ],
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Members counts
      prisma.member.count(),
      prisma.member.count({ where: { status: { equals: 'Active', mode: 'insensitive' } } }),
      // Member tiers breakdown
      prisma.member.groupBy({
        by: ['tier'],
        _count: { id: true },
      }),
      // Subscribers & Charity cases
      prisma.subscriber.count().catch(() => 0),
      prisma.charityCase.count().catch(() => 0),
      // Bounded queries for recent tables (max 15 rows)
      prisma.payment.findMany({
        where: paymentWhere,
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.eventRSVP.findMany({
        where: rsvpWhere,
        include: {
          event: {
            select: { id: true, title: true, date: true, ticketPrice: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.member.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // ── 3. MAP AGGREGATE VALUES ──────────────────────────────────────────────
    const totalRevenue = totalPaymentAgg._sum.amount || 0;
    const completedRevenue = completedPaymentAgg._sum.amount || 0;
    const completedCount = completedPaymentAgg._count.id || 0;
    const pendingRevenue = pendingPaymentAgg._sum.amount || 0;
    const pendingCount = pendingPaymentAgg._count.id || 0;
    const failedRevenue = failedPaymentAgg._sum.amount || 0;
    const failedCount = failedPaymentAgg._count.id || 0;

    const totalPaidPoojas = poojaPaymentAgg._count.id || 0;
    const totalPaidPoojaRevenue = poojaPaymentAgg._sum.amount || 0;
    const annadanamCount = annadanamPaymentAgg._count.id || 0;
    const annadanamRevenue = annadanamPaymentAgg._sum.amount || 0;

    const totalRSVPsCount = rsvpAgg._count.id || 0;
    const totalPassesIssued = rsvpAgg._sum.ticketsCount || totalRSVPsCount;
    const totalAdultsCount = rsvpAgg._sum.adultsCount || totalRSVPsCount;
    const totalChildrenCount = rsvpAgg._sum.childrenCount || 0;

    const eventSupportRevenue = rsvpAgg._sum.supportAmount || 0;
    const rsvpTotalAmount = rsvpAgg._sum.totalAmount || 0;
    const rsvpTicketRevenue = Math.max(0, rsvpTotalAmount - eventSupportRevenue);
    const eventSupportCount = eventSupportRevenue > 0 ? totalRSVPsCount : 0;
    const rsvpTicketCount = rsvpTicketRevenue > 0 ? totalRSVPsCount : 0;

    const generalDonationsRevenue = Math.max(0, completedRevenue - totalPaidPoojaRevenue - annadanamRevenue);
    const generalDonationsCount = Math.max(0, completedCount - totalPaidPoojas - annadanamCount);
    const otherRevenue = Math.max(0, generalDonationsRevenue - (rsvpTicketRevenue + eventSupportRevenue));

    const totalRealUsers = registeredMembersCount + totalRSVPsCount;

    // Top locations from RSVPs (grouped by travellingFrom with count)
    const locationGroups = await prisma.eventRSVP.groupBy({
      by: ['travellingFrom'],
      where: rsvpWhere,
      _sum: { ticketsCount: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topLocations = locationGroups.map((lg) => ({
      name: lg.travellingFrom || 'Local / Langley',
      count: lg._sum.ticketsCount || lg._count.id,
    }));

    // Member Tiers
    const memberTiers = memberTiersRaw.map((m) => ({
      tier: m.tier || 'Annual Member',
      count: m._count.id,
    }));

    // ── 4. EVENT DAILY SCHEDULE BREAKDOWN (ONLY WHEN SINGLE EVENT SELECTED) ───
    const isSingleEvent = Boolean(eventId && eventId !== 'all' && targetEvent);
    const eventScheduleList = isSingleEvent ? getEventSchedule(targetEvent) : [];

    let dailyBreakdown: any[] = [];
    if (isSingleEvent && eventScheduleList.length > 0) {
      // Fetch only the rows for this single event to compute schedule matches
      const [singleEventPayments, singleEventRsvps] = await Promise.all([
        prisma.payment.findMany({
          where: { ...paymentWhere, status: { equals: 'Completed', mode: 'insensitive' } },
          select: {
            amount: true,
            poojaDate: true,
            poojaDay: true,
            poojaTitle: true,
            description: true,
          },
          take: 5000,
        }),
        prisma.eventRSVP.findMany({
          where: rsvpWhere,
          select: {
            ticketsCount: true,
            adultsCount: true,
            childrenCount: true,
            selectedDates: true,
          },
          take: 5000,
        }),
      ]);

      dailyBreakdown = eventScheduleList.map((fd) => {
        let paidCount = 0;
        let paidRevenue = 0;
        let freeBookingsCount = 0;
        let freePasses = 0;
        let adultsCount = 0;
        let childrenCount = 0;

        const fdDate = (fd.date || '').toLowerCase();
        const fdLabel = (fd.dateLabel || fd.date || '').toLowerCase();
        const fdTitle = (fd.title || '').toLowerCase();
        const fdDay = (fd.day || '').toLowerCase();
        const fdId = (fd.id || '').toLowerCase();

        singleEventPayments.forEach((p) => {
          const pDate = (p.poojaDate || '').toLowerCase();
          const pDay = (p.poojaDay || '').toLowerCase();
          const pTitle = (p.poojaTitle || '').toLowerCase();
          const pDesc = (p.description || '').toLowerCase();

          if (
            (pDate && (pDate.includes(fdDate) || pDate.includes(fdLabel))) ||
            (fdDay && pDay && pDay.includes(fdDay)) ||
            (pTitle && (pTitle.includes(fdTitle) || fdTitle.includes(pTitle))) ||
            (fdDate && pDesc.includes(fdDate)) ||
            (fdLabel && pDesc.includes(fdLabel))
          ) {
            paidCount++;
            paidRevenue += Number(p.amount) || 0;
          }
        });

        singleEventRsvps.forEach((r) => {
          const passes = r.ticketsCount || (r.adultsCount + r.childrenCount) || 1;
          const adults = r.adultsCount ?? 1;
          const children = r.childrenCount ?? 0;
          const dates = Array.isArray(r.selectedDates) && r.selectedDates.length > 0
            ? r.selectedDates
            : [];

          const matchesDay = dates.some((d) => {
            const dLower = d.toLowerCase();
            return (
              (fdDate && dLower.includes(fdDate)) ||
              (fdLabel && dLower.includes(fdLabel)) ||
              (fdDay && dLower.includes(fdDay)) ||
              (fdId && dLower.includes(fdId)) ||
              dLower === fdDate ||
              dLower === fdLabel
            );
          });

          if (matchesDay) {
            freeBookingsCount++;
            freePasses += passes;
            adultsCount += adults;
            childrenCount += children;
          }
        });

        return {
          id: fd.id,
          date: fd.date,
          dateLabel: fd.dateLabel || fd.date,
          day: fd.day || '',
          title: fd.title,
          theme: fd.theme || '',
          paidCount,
          paidRevenue,
          freeBookingsCount,
          freePasses,
          adultsCount,
          childrenCount,
          totalDevotees: paidCount + freePasses,
        };
      });
    }

    // ── 5. UNIFIED REAL-TIME LIVE ACTIVITY FEED (FROM BOUNDED RECENT ROWS) ─────
    type LiveFeedItem = {
      id: string;
      type: 'payment' | 'rsvp' | 'member';
      title: string;
      subtitle: string;
      badge: string;
      badgeColor: string;
      amount?: string;
      details?: string;
      timestamp: string;
      rawDate: string;
    };

    const liveFeed: LiveFeedItem[] = [];

    // Add Payments
    recentPayments.slice(0, 15).forEach((p) => {
      const isCompleted = (p.status || '').toLowerCase() === 'completed';
      const isPooja = Boolean(p.poojaTitle) || (p.donationType || '').toLowerCase() === 'pooja';
      liveFeed.push({
        id: `pay-${p.id}`,
        type: 'payment',
        title: p.customerName || 'Anonymous Devotee',
        subtitle: isPooja
          ? `Sacred Pooja: ${p.poojaDate || ''} ${p.poojaTitle || ''}`
          : p.description || 'Contribution to MITRA UK',
        badge: isCompleted ? (isPooja ? 'PAID POOJA' : 'SEVA / BOOKING') : p.status.toUpperCase(),
        badgeColor: isCompleted
          ? isPooja ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-slate-700/50 text-slate-300 border-slate-600',
        amount: `£${p.amount.toFixed(2)}`,
        details: p.gotram ? `Gotram: ${p.gotram}` : p.customerEmail,
        timestamp: new Date(p.createdAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        rawDate: new Date(p.createdAt).toISOString(),
      });
    });

    // Add RSVPs
    recentRSVPs.slice(0, 15).forEach((r) => {
      const passes = r.ticketsCount || (r.adultsCount + r.childrenCount) || 1;
      const datesStr = (r.selectedDates || []).slice(0, 2).join(', ');
      liveFeed.push({
        id: `rsvp-${r.id}`,
        type: 'rsvp',
        title: r.attendeeName,
        subtitle: `Festival RSVP · ${passes} Pass${passes > 1 ? 'es' : ''} (${r.adultsCount || 1}A, ${r.childrenCount || 0}C)`,
        badge: 'FREE RSVP',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        amount: 'FREE',
        details: datesStr ? `Dates: ${datesStr}` : r.travellingFrom ? `From ${r.travellingFrom}` : r.attendeeEmail,
        timestamp: new Date(r.createdAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        rawDate: new Date(r.createdAt).toISOString(),
      });
    });

    // Add Members when viewing all events
    if (eventId === 'all') {
      recentMembers.slice(0, 10).forEach((m) => {
        liveFeed.push({
          id: `mem-${m.id}`,
          type: 'member',
          title: m.fullName,
          subtitle: `${m.tier || 'Annual Member'} · Role: ${m.role || 'Member'}`,
          badge: 'MEMBER JOINED',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          amount: m.tier || 'Member',
          details: m.email,
          timestamp: new Date(m.createdAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
          rawDate: new Date(m.createdAt).toISOString(),
        });
      });
    }

    // Sort live feed by actual date descending
    liveFeed.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

    // ── 7. RETURN COMPREHENSIVE REAL-TIME DASHBOARD DATA ──────────────────────
    return NextResponse.json(
      {
        success: true,
        source: 'prisma_live',
        timestamp,
        kpiSummary: {
          totalRealUsers,
          registeredMembersCount,
          activeMembersCount,
          subscribersCount,
          charityCasesCount,
          eventsCount: allEvents.length,

          // Donation / Revenue
          totalRevenue,
          completedRevenue,
          completedCount,
          pendingRevenue,
          pendingCount,
          failedRevenue,
          failedCount,

          // Paid Poojas vs Free Poojas
          totalPaidPoojas,
          totalPaidPoojaRevenue,
          totalFreePoojas: totalRSVPsCount,
          totalFreePasses: totalPassesIssued,

          // RSVP Passes
          totalRSVPsCount,
          totalPassesIssued,
          totalAdultsCount,
          totalChildrenCount,
        },
        dailyBreakdown,
        donationBreakdown: [
          {
            type: 'Paid Sacred Pooja Sevas',
            count: totalPaidPoojas,
            revenue: totalPaidPoojaRevenue,
            badge: 'Sacred Ritual',
          },
          {
            type: 'Annadanam & Food Seva',
            count: annadanamCount,
            revenue: annadanamRevenue,
            badge: 'Annadanam',
          },
          {
            type: 'Event RSVP',
            count: rsvpTicketCount,
            revenue: rsvpTicketRevenue,
            badge: 'Registrations to event',
          },
          {
            type: 'Event Support Fund',
            count: eventSupportCount,
            revenue: eventSupportRevenue,
            badge: 'Event Support',
          },
          {
            type: 'Other Donations',
            count: Math.max(0, generalDonationsCount - (rsvpTicketCount + eventSupportCount)),
            revenue: otherRevenue,
            badge: 'Other',
          }
        ],
        topLocations,
        memberTiers,
        selectedEventId: eventId,
        selectedEventTitle: targetEvent?.title || null,
        events: allEvents.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          category: e.category,
          status: e.status,
          enablePooja: e.enablePooja,
        })),
        recentPayments: recentPayments.slice(0, 8),
        recentRSVPs: recentRSVPs.slice(0, 8),
        recentMembers: recentMembers.slice(0, 8),
        liveFeed: liveFeed.slice(0, 20),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error occurred';
    console.error(`[ADMIN DASHBOARD ANALYTICS ERROR] [${timestamp}]:`, error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        source: 'error',
      },
      { status: 500 }
    );
  }
}
