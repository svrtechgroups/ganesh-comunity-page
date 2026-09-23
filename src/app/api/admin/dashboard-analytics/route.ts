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
    // 1. Parallel Database Queries across all core entities
    const [
      allPayments,
      allRSVPs,
      allEvents,
      allMembers,
      subscribersCount,
      charityCasesCount
    ] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eventRSVP.findMany({
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              ticketPrice: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.member.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriber.count().catch(() => 0),
      prisma.charityCase.count().catch(() => 0),
    ]);

    // ── 1b. EVENT FILTERING ──────────────────────────────────────────────────
    const targetEvent = allEvents.find((e) => e.id === eventId);
    const targetTitle = targetEvent?.title?.toLowerCase() || '';

    const filteredPayments = eventId && eventId !== 'all'
      ? allPayments.filter((p) => {
          if (p.eventId === eventId) return true;
          if (targetTitle) {
            const pEvent = (p.eventName || '').toLowerCase();
            const pDesc = (p.description || '').toLowerCase();
            return pEvent.includes(targetTitle) || pDesc.includes(targetTitle);
          }
          return false;
        })
      : allPayments;

    const filteredRSVPs = eventId && eventId !== 'all'
      ? allRSVPs.filter((r) => {
          if (r.eventId === eventId) return true;
          if (targetTitle && r.event?.title) {
            return r.event.title.toLowerCase().includes(targetTitle);
          }
          return false;
        })
      : allRSVPs;

    // ── 2. REAL USERS DEDUPLICATION & METRICS ──────────────────────────────────
    const uniqueUserEmails = new Set<string>();
    const userRoleCounts: Record<string, number> = {};
    const memberTierCounts: Record<string, number> = {};
    let activeMembersCount = 0;

    allMembers.forEach((m) => {
      if (eventId === 'all' && m.email) uniqueUserEmails.add(m.email.trim().toLowerCase());
      const role = m.role || 'Member';
      userRoleCounts[role] = (userRoleCounts[role] || 0) + 1;
      const tier = m.tier || 'Annual Member';
      memberTierCounts[tier] = (memberTierCounts[tier] || 0) + 1;
      if ((m.status || '').toLowerCase() === 'active') activeMembersCount++;
    });

    filteredRSVPs.forEach((r) => {
      if (r.attendeeEmail) uniqueUserEmails.add(r.attendeeEmail.trim().toLowerCase());
    });

    filteredPayments.forEach((p) => {
      if (p.customerEmail) uniqueUserEmails.add(p.customerEmail.trim().toLowerCase());
    });

    const totalRealUsers = uniqueUserEmails.size;
    const registeredMembersCount = allMembers.length;

    // ── 3. DONATIONS & REVENUE METRICS ─────────────────────────────────────────
    let completedRevenue = 0;
    let completedCount = 0;
    let pendingRevenue = 0;
    let pendingCount = 0;
    let failedRevenue = 0;
    let failedCount = 0;
    let totalRevenue = 0;

    let totalPaidPoojas = 0;
    let totalPaidPoojaRevenue = 0;
    let generalDonationsCount = 0;
    let generalDonationsRevenue = 0;
    let annadanamCount = 0;
    let annadanamRevenue = 0;
    let otherRevenue = 0;

    const donationTypeMap: Record<string, { count: number; revenue: number }> = {
      pooja: { count: 0, revenue: 0 },
      anadanam: { count: 0, revenue: 0 },
      'event donation': { count: 0, revenue: 0 },
      membership: { count: 0, revenue: 0 },
      general: { count: 0, revenue: 0 },
    };

    filteredPayments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      const st = (p.status || '').toLowerCase();
      totalRevenue += amt;

      if (st === 'completed') {
        completedRevenue += amt;
        completedCount++;

        const isPooja =
          (p.donationType || '').toLowerCase() === 'pooja' ||
          Boolean(p.poojaTitle) ||
          (p.description || '').toLowerCase().includes('pooja');

        const isAnnadanam =
          (p.donationType || '').toLowerCase() === 'anadanam' ||
          (p.donationType || '').toLowerCase() === 'annadanam' ||
          (p.description || '').toLowerCase().includes('anadanam') ||
          (p.description || '').toLowerCase().includes('annadanam');

        if (isPooja) {
          totalPaidPoojas++;
          totalPaidPoojaRevenue += amt;
          donationTypeMap.pooja.count++;
          donationTypeMap.pooja.revenue += amt;
        } else if (isAnnadanam) {
          annadanamCount++;
          annadanamRevenue += amt;
          donationTypeMap.anadanam.count++;
          donationTypeMap.anadanam.revenue += amt;
        } else {
          generalDonationsCount++;
          generalDonationsRevenue += amt;
          donationTypeMap.general.count++;
          donationTypeMap.general.revenue += amt;
        }
      } else if (st === 'pending') {
        pendingRevenue += amt;
        pendingCount++;
      } else if (st === 'failed') {
        failedRevenue += amt;
        failedCount++;
      }
    });

    // ── 4. RSVP & FREE POOJA METRICS ──────────────────────────────────────────
    const totalRSVPsCount = filteredRSVPs.length;
    let totalPassesIssued = 0;
    let totalAdultsCount = 0;
    let totalChildrenCount = 0;
    const locationCounts: Record<string, number> = {};

    filteredRSVPs.forEach((r) => {
      const passes = r.ticketsCount || (r.adultsCount + r.childrenCount) || 1;
      const adults = r.adultsCount ?? 1;
      const children = r.childrenCount ?? 0;

      totalPassesIssued += passes;
      totalAdultsCount += adults;
      totalChildrenCount += children;

      const loc = (r.travellingFrom || 'Local / Langley').trim();
      if (loc) {
        locationCounts[loc] = (locationCounts[loc] || 0) + passes;
      }
    });

    // Top Locations Sorted
    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Free Poojas / Festival Registrations
    const totalFreePoojas = totalRSVPsCount; // Free Community Pooja & Darshan RSVP bookings
    const totalFreePasses = totalPassesIssued; // Free devotee passes

    // ── 5. EVENT DAILY SCHEDULE BREAKDOWN (ONLY VISIBLE WHEN SINGLE EVENT SELECTED) ──
    const isSingleEvent = Boolean(eventId && eventId !== 'all' && targetEvent);
    const eventScheduleList = isSingleEvent ? getEventSchedule(targetEvent) : [];

    const dailyBreakdown = eventScheduleList.map((fd) => {
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

      // Check Paid Poojas matching this day
      filteredPayments.forEach((p) => {
        if ((p.status || '').toLowerCase() === 'completed') {
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
        }
      });

      // Check Free RSVP Registrations matching this day
      filteredRSVPs.forEach((r) => {
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

    // ── 6. UNIFIED REAL-TIME LIVE ACTIVITY FEED (100% REAL FROM DATABASE) ─────
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

    // Add Payments from filtered set
    filteredPayments.slice(0, 15).forEach((p) => {
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

    // Add RSVPs from filtered set
    filteredRSVPs.slice(0, 15).forEach((r) => {
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

    // Add Members only when viewing all events
    if (eventId === 'all') {
      allMembers.slice(0, 10).forEach((m) => {
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
          totalFreePoojas,
          totalFreePasses,

          // RSVP Passes
          totalRSVPsCount,
          totalPassesIssued,
          totalAdultsCount,
          totalChildrenCount,
        },
        dailyBreakdown,
        donationBreakdown: [
          {
            type: 'Paid Sacred Pooja Sevas (£116)',
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
            type: 'General & Student Welfare Fund',
            count: generalDonationsCount,
            revenue: generalDonationsRevenue,
            badge: 'Charity & Welfare',
          },
        ],
        topLocations,
        memberTiers: Object.entries(memberTierCounts).map(([tier, count]) => ({ tier, count })),
        selectedEventId: eventId,
        selectedEventTitle: targetEvent?.title || null,
        events: allEvents.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          category: e.category,
          status: e.status,
        })),
        recentPayments: filteredPayments.slice(0, 8),
        recentRSVPs: filteredRSVPs.slice(0, 8),
        recentMembers: allMembers.slice(0, 8),
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
