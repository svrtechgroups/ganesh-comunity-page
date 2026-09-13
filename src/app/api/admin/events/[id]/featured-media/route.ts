import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    // 1. Fetch featured media items for this event
    const featuredItems = await prisma.mediaItem.findMany({
      where: {
        eventId,
        isEventFeatured: true,
      },
      orderBy: { eventDisplayOrder: 'asc' },
    });

    // 2. Build 4 slots
    const slots: (any | null)[] = [null, null, null, null];
    featuredItems.forEach((item) => {
      const order = item.eventDisplayOrder;
      if (order >= 1 && order <= 4) {
        slots[order - 1] = item;
      }
    });

    // 3. Fetch all media items for this event
    const eventMedia = await prisma.mediaItem.findMany({
      where: {
        eventId,
      },
      orderBy: [
        { isEventFeatured: 'desc' },
        { eventDisplayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        slots,
        eventMedia,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch event featured media';
    console.error('[API ADMIN EVENT FEATURED MEDIA GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { slot, mediaItemId } = body;

    const slotNum = Number(slot);
    if (!slotNum || slotNum < 1 || slotNum > 4) {
      return NextResponse.json(
        { success: false, error: 'Slot number must be an integer between 1 and 4.' },
        { status: 400 }
      );
    }

    // 1. Clear any item currently occupying this slot for this event
    await prisma.mediaItem.updateMany({
      where: {
        eventId,
        isEventFeatured: true,
        eventDisplayOrder: slotNum,
      },
      data: {
        isEventFeatured: false,
        eventDisplayOrder: 0,
      },
    });

    // 2. If mediaItemId is provided, assign it to this slot for this event
    if (mediaItemId) {
      // Also verify mediaItem belongs to this event
      await prisma.mediaItem.update({
        where: { id: mediaItemId },
        data: {
          eventId,
          isEventFeatured: true,
          eventDisplayOrder: slotNum,
        },
      });
    }

    // 3. Fetch updated slots and event media
    const updatedFeatured = await prisma.mediaItem.findMany({
      where: {
        eventId,
        isEventFeatured: true,
      },
      orderBy: { eventDisplayOrder: 'asc' },
    });

    const slots: (any | null)[] = [null, null, null, null];
    updatedFeatured.forEach((item) => {
      const order = item.eventDisplayOrder;
      if (order >= 1 && order <= 4) {
        slots[order - 1] = item;
      }
    });

    const eventMedia = await prisma.mediaItem.findMany({
      where: {
        eventId,
      },
      orderBy: [
        { isEventFeatured: 'desc' },
        { eventDisplayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      message: mediaItemId 
        ? `Successfully assigned image to Event Slot ${slotNum}.`
        : `Event Slot ${slotNum} cleared.`,
      data: { slots, eventMedia },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update event featured media';
    console.error('[API ADMIN EVENT FEATURED MEDIA POST ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
