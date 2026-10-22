import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// In-memory cache for high-concurrency protection
let cachedCounts: Record<string, number> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export async function GET() {
  try {
    const now = Date.now();
    if (cachedCounts && now - lastCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, counts: cachedCounts, cached: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    const dates = [
      '13th Sep',
      '14th Sep',
      '15th Sep',
      '16th Sep',
      '17th Sep',
      '18th Sep',
      '19th Sep',
      '20th Sep',
    ];

    // Initialize counts for each festival day
    const counts: Record<string, number> = {};
    dates.forEach((d) => {
      counts[d] = 0;
    });

    // 1. Efficient grouping by explicit poojaDate column
    const poojaDateGroups = await prisma.payment.groupBy({
      by: ['poojaDate'],
      where: {
        status: { equals: 'Completed', mode: 'insensitive' },
        poojaDate: { in: dates },
      },
      _count: {
        id: true,
      },
    });

    poojaDateGroups.forEach((group) => {
      if (group.poojaDate && counts[group.poojaDate] !== undefined) {
        counts[group.poojaDate] += group._count.id;
      }
    });

    // 2. Fallback check ONLY for completed payments where poojaDate was null but description contains date
    const legacyPayments = await prisma.payment.findMany({
      where: {
        status: { equals: 'Completed', mode: 'insensitive' },
        poojaDate: null,
        OR: [
          { description: { contains: 'Pooja Event Payment' } },
          { description: { contains: 'Pooja Booking' } },
          { description: { contains: 'Pooja Seva' } },
        ],
      },
      select: {
        description: true,
      },
      take: 2000, // Safe bound to protect memory
    });

    legacyPayments.forEach((p) => {
      const desc = p.description || '';
      for (const d of dates) {
        if (desc.includes(d)) {
          counts[d] = (counts[d] || 0) + 1;
          break;
        }
      }
    });

    // Update in-memory cache
    cachedCounts = counts;
    lastCacheTime = now;

    return NextResponse.json(
      { success: true, counts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database error';
    console.error('[Booking Counts API] Error:', message);

    // If cache exists, return stale cache gracefully on DB error
    if (cachedCounts) {
      return NextResponse.json({ success: true, counts: cachedCounts, stale: true });
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
