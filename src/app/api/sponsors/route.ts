import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: sponsors });
  } catch (error) {
    console.error('Failed to fetch public sponsors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors', data: [] },
      { status: 500 }
    );
  }
}
