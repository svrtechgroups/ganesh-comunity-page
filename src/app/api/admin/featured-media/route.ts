import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch currently featured home media items
    const featuredItems = await prisma.mediaItem.findMany({
      where: { isHomeFeatured: true },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: { homeDisplayOrder: 'asc' },
    });

    // Construct 4 slots (1-indexed)
    const slots: (any | null)[] = [null, null, null, null];
    featuredItems.forEach((item) => {
      const order = item.homeDisplayOrder;
      if (order >= 1 && order <= 4) {
        slots[order - 1] = item;
      }
    });

    // 2. Fetch all events with their available images for selection
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        venue: true,
        bannerUrl: true,
        category: true,
        mediaItems: {
          
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            url: true,
            coverImage: true,
            isHomeFeatured: true,
            homeDisplayOrder: true,
            isEventFeatured: true,
            eventDisplayOrder: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Also get any media items that might not have an eventId (standalone/general)
    const standaloneMedia = await prisma.mediaItem.findMany({
      where: { eventId: null },
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        url: true,
        coverImage: true,
        isHomeFeatured: true,
        homeDisplayOrder: true,
        isEventFeatured: true,
        eventDisplayOrder: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        slots,
        events,
        standaloneMedia,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch featured media';
    console.error('[API ADMIN FEATURED MEDIA GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slot, mediaItemId } = body;

    const slotNum = Number(slot);
    if (!slotNum || slotNum < 1 || slotNum > 4) {
      return NextResponse.json(
        { success: false, error: 'Slot number must be an integer between 1 and 4.' },
        { status: 400 }
      );
    }

    // 1. Clear any item that currently occupies this slot
    await prisma.mediaItem.updateMany({
      where: {
        isHomeFeatured: true,
        homeDisplayOrder: slotNum,
      },
      data: {
        isHomeFeatured: false,
        homeDisplayOrder: 0,
      },
    });

    // 2. If mediaItemId is provided, assign it to this slot
    if (mediaItemId) {
      await prisma.mediaItem.update({
        where: { id: mediaItemId },
        data: {
          isHomeFeatured: true,
          homeDisplayOrder: slotNum,
        },
      });
    }

    // 3. Fetch updated slots
    const updatedFeatured = await prisma.mediaItem.findMany({
      where: { isHomeFeatured: true },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            bannerUrl: true,
          },
        },
      },
      orderBy: { homeDisplayOrder: 'asc' },
    });

    const slots: (any | null)[] = [null, null, null, null];
    updatedFeatured.forEach((item) => {
      const order = item.homeDisplayOrder;
      if (order >= 1 && order <= 4) {
        slots[order - 1] = item;
      }
    });

    return NextResponse.json({
      success: true,
      message: mediaItemId 
        ? `Successfully assigned image to Slot ${slotNum}.`
        : `Slot ${slotNum} cleared.`,
      data: { slots },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update featured slot';
    console.error('[API ADMIN FEATURED MEDIA POST ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
