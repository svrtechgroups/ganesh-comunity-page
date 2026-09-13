import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: { id: string; order: number }[] };

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Expected items array with id and order' },
        { status: 400 }
      );
    }

    // Run updates concurrently or in transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.sponsor.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true, message: 'Sponsor orders updated successfully' });
  } catch (error) {
    console.error('Failed to reorder sponsors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder sponsors' },
      { status: 500 }
    );
  }
}
