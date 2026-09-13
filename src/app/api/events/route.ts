import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: events });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error fetching events';
    console.error('[API EVENTS GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}
