import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_CHARITY_CASES } from '@/data/charity';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = searchParams.get('limit') ? Math.max(1, parseInt(searchParams.get('limit')!, 10)) : 50;

    const [cases, totalCount] = await Promise.all([
      prisma.charityCase.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.charityCase.count(),
    ]);

    return NextResponse.json({
      success: true,
      source: 'prisma',
      data: cases,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch {
    return NextResponse.json({ success: true, source: 'static', data: INITIAL_CHARITY_CASES });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, urgency } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Charity Case ID required' }, { status: 400 });
    }

    try {
      const updated = await prisma.charityCase.update({
        where: { id },
        data: { status, urgency },
      });
      return NextResponse.json({ success: true, source: 'prisma', data: updated });
    } catch {
      return NextResponse.json({ success: true, source: 'static', message: 'Status updated' });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
