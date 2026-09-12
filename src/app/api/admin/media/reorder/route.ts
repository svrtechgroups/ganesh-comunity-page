import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: Array<{ id: string; displayOrder: number }> };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array is required for reordering.' },
        { status: 400 }
      );
    }

    // Atomically update all items in a single transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.mediaItem.update({
          where: { id: item.id },
          data: { displayOrder: Number(item.displayOrder) || 0 },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully reordered ${items.length} media items.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reorder media items';
    console.error('[API ADMIN MEDIA REORDER ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
