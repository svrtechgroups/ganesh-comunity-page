import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const type = searchParams.get('type')?.trim() || 'all';
    const status = searchParams.get('status')?.trim() || 'all';
    const eventId = searchParams.get('eventId')?.trim() || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = searchParams.get('limit') === 'all' ? 0 : Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const exportAll = searchParams.get('exportAll') === 'true';

    console.log(`[ADMIN PAYMENTS API] [${timestamp}] GET query: search="${search}", type="${type}", status="${status}", eventId="${eventId}", page=${page}, limit=${limit}`);

    // Fetch available events for filtering
    const availableEvents = await prisma.event.findMany({
      select: { id: true, title: true, date: true, category: true },
      orderBy: { date: 'asc' },
    });

    // Build Prisma Where Clause
    const whereConditions: Prisma.PaymentWhereInput[] = [];

    // Event Filter
    let eventCondition: Prisma.PaymentWhereInput | null = null;
    if (eventId && eventId !== 'all') {
      const matchedEvent = availableEvents.find((e) => e.id === eventId);
      eventCondition = {
        OR: [
          { eventId: eventId },
          ...(matchedEvent?.title
            ? [
                { eventName: { contains: matchedEvent.title, mode: 'insensitive' as const } },
                { description: { contains: matchedEvent.title, mode: 'insensitive' as const } },
              ]
            : [{ eventName: { contains: eventId, mode: 'insensitive' as const } }]),
        ],
      };
      whereConditions.push(eventCondition);
    }

    // Status Filter
    if (status && status !== 'all') {
      whereConditions.push({
        status: { equals: status, mode: 'insensitive' },
      });
    }

    // Type Filter
    if (type && type !== 'all') {
      whereConditions.push({
        OR: [
          { donationType: { contains: type, mode: 'insensitive' } },
          { poojaCategory: { contains: type, mode: 'insensitive' } },
          { description: { contains: type, mode: 'insensitive' } },
        ],
      });
    }

    // Search Query Filter
    if (search) {
      whereConditions.push({
        OR: [
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerEmail: { contains: search, mode: 'insensitive' } },
          { customerPhone: { contains: search, mode: 'insensitive' } },
          { primaryDevoteeName: { contains: search, mode: 'insensitive' } },
          { poojaCategory: { contains: search, mode: 'insensitive' } },
          { gotram: { contains: search, mode: 'insensitive' } },
          { familyMembers: { contains: search, mode: 'insensitive' } },
          { eventName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.PaymentWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};
    const statsWhere: Prisma.PaymentWhereInput = eventCondition ? { AND: [eventCondition] } : {};

    // 1. Calculate Stats (scoped to event if eventId is filtered)
    const [allPayments, totalFiltered] = await Promise.all([
      prisma.payment.findMany({
        where: statsWhere,
        select: {
          id: true,
          amount: true,
          status: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    let completedTotal = 0;
    let completedCount = 0;
    let pendingTotal = 0;
    let pendingCount = 0;
    let failedTotal = 0;
    let failedCount = 0;
    let totalRevenue = 0;
    const totalCount = allPayments.length;

    for (const p of allPayments) {
      const amt = p.amount || 0;
      const st = (p.status || '').toLowerCase();
      totalRevenue += amt;

      if (st === 'completed') {
        completedTotal += amt;
        completedCount++;
      } else if (st === 'pending') {
        pendingTotal += amt;
        pendingCount++;
      } else if (st === 'failed') {
        failedTotal += amt;
        failedCount++;
      }
    }

    // 2. Query Paginated Records
    let payments;
    if (exportAll || limit === 0) {
      payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } else {
      payments = await prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }

    const effectiveLimit = limit === 0 ? totalFiltered : limit;
    const totalPages = effectiveLimit > 0 ? Math.max(1, Math.ceil(totalFiltered / effectiveLimit)) : 1;

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: payments,
        pagination: {
          total: totalFiltered,
          page,
          limit: effectiveLimit,
          totalPages,
        },
        stats: {
          completedTotal,
          completedCount,
          pendingTotal,
          pendingCount,
          failedTotal,
          failedCount,
          totalRevenue,
          totalCount,
        },
        selectedEventId: eventId,
        events: availableEvents.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          category: e.category,
        })),
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
    console.error(`[ADMIN PAYMENTS API ERROR] [${timestamp}] Failed to fetch payment records:`, error);

    return NextResponse.json(
      {
        success: false,
        source: 'error',
        error: errorMessage,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        stats: {
          completedTotal: 0,
          completedCount: 0,
          pendingTotal: 0,
          pendingCount: 0,
          failedTotal: 0,
          failedCount: 0,
          totalRevenue: 0,
          totalCount: 0,
        },
      },
      { status: 500 }
    );
  }
}
