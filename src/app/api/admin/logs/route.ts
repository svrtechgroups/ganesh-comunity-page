import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pruneOldLogs } from '@/lib/logger';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const level = searchParams.get('level')?.trim() || 'all';
    const source = searchParams.get('source')?.trim() || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));

    const whereConditions: Prisma.SystemLogWhereInput[] = [];

    // Level filter
    if (level && level !== 'all') {
      whereConditions.push({ level: { equals: level, mode: 'insensitive' } });
    }

    // Source filter
    if (source && source !== 'all') {
      whereConditions.push({ source: { contains: source, mode: 'insensitive' } });
    }

    // Search query filter
    if (search) {
      whereConditions.push({
        OR: [
          { message: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
          { ip: { contains: search, mode: 'insensitive' } },
          { userId: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.SystemLogWhereInput = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // 1. Ensure any queued request logs are committed
    try {
      const { flushLogQueue } = await import('@/lib/request-analytics');
      await flushLogQueue();
    } catch {}

    // 2. Fetch logs and level counts
    const [totalLogs, logs, countsByLevel, recentHttpLogs] = await Promise.all([
      prisma.systemLog.count({ where }),
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.systemLog.groupBy({
        by: ['level'],
        _count: { level: true },
      }),
      prisma.systemLog.findMany({
        where: {
          OR: [
            { level: 'HTTP' },
            { source: { startsWith: 'http:' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 300,
        select: {
          id: true,
          level: true,
          source: true,
          message: true,
          details: true,
          createdAt: true,
        },
      }),
    ]);

    // 3. Compute request analytics (avg response time, min, max, slowest routes)
    let totalDuration = 0;
    let validDurationCount = 0;
    let minDuration = Infinity;
    let maxDuration = 0;
    const statusCounts: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
    const routeDurations: Record<string, { totalMs: number; count: number }> = {};

    for (const log of recentHttpLogs) {
      const details = log.details as any;
      const duration = details?.durationMs;
      const status = details?.status;
      const pathname = details?.pathname || log.source;

      if (typeof duration === 'number') {
        totalDuration += duration;
        validDurationCount++;
        if (duration < minDuration) minDuration = duration;
        if (duration > maxDuration) maxDuration = duration;
      }

      if (typeof status === 'number') {
        if (status >= 200 && status < 300) statusCounts['2xx']++;
        else if (status >= 300 && status < 400) statusCounts['3xx']++;
        else if (status >= 400 && status < 500) statusCounts['4xx']++;
        else if (status >= 500) statusCounts['5xx']++;
      }

      if (pathname && typeof pathname === 'string') {
        if (!routeDurations[pathname]) {
          routeDurations[pathname] = { totalMs: 0, count: 0 };
        }
        routeDurations[pathname].totalMs += (duration || 0);
        routeDurations[pathname].count++;
      }
    }

    const avgDuration = validDurationCount > 0 ? Math.round(totalDuration / validDurationCount) : 0;
    const slowestRoutes = Object.entries(routeDurations)
      .map(([route, data]) => ({
        route,
        count: data.count,
        avgMs: Math.round(data.totalMs / data.count),
      }))
      .sort((a, b) => b.avgMs - a.avgMs)
      .slice(0, 6);

    const retentionCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        totalLogs,
        totalPages: Math.ceil(totalLogs / limit) || 1,
      },
      stats: {
        total: totalLogs,
        countsByLevel: countsByLevel.reduce(
          (acc, item) => ({ ...acc, [item.level]: item._count.level }),
          {} as Record<string, number>
        ),
        retentionDays: 7,
        retentionCutoff: retentionCutoff.toISOString(),
        analytics: {
          totalHttpRequests: recentHttpLogs.length,
          avgResponseTimeMs: avgDuration,
          minResponseTimeMs: minDuration === Infinity ? 0 : minDuration,
          maxResponseTimeMs: maxDuration,
          statusCounts,
          slowestRoutes,
        },
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch system logs';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/admin/logs
 * Triggers manual 7-day retention log pruning
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const retentionDays = Number(body?.retentionDays) || 7;

    const result = await pruneOldLogs(retentionDays);

    return NextResponse.json({
      success: true,
      message: `Pruned ${result.deletedCount} logs older than ${retentionDays} days.`,
      deletedCount: result.deletedCount,
      retentionDays,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Log retention prune failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/logs
 * Deletes a specific log by ID
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Log ID is required' }, { status: 400 });
    }

    await prisma.systemLog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Log record deleted successfully' });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to delete log';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
