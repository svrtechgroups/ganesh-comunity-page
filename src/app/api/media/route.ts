import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    const featured = searchParams.get('featured'); // 'home' | 'event'
    const isHomeFeatured = searchParams.get('isHomeFeatured');
    const isEventFeatured = searchParams.get('isEventFeatured');

    // 1. Build where clause
    const where: any = {};
    if (eventId && eventId !== 'all') {
      where.eventId = eventId;
    }
    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    // Featured filters
    if (featured === 'home' || isHomeFeatured === 'true') {
      where.isHomeFeatured = true;
    }
    if (featured === 'event' || isEventFeatured === 'true') {
      where.isEventFeatured = true;
    }

    // Determine sorting
    let orderBy: any[] = [
      { displayOrder: 'asc' },
      { isFeatured: 'desc' },
      { createdAt: 'desc' },
    ];

    if (featured === 'home' || isHomeFeatured === 'true') {
      orderBy = [
        { homeDisplayOrder: 'asc' },
        { createdAt: 'desc' },
      ];
    } else if (featured === 'event' || isEventFeatured === 'true') {
      orderBy = [
        { eventDisplayOrder: 'asc' },
        { createdAt: 'desc' },
      ];
    }

    // 2. Fetch media items with tagged event
    let mediaItems = await prisma.mediaItem.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            date: true,
            time: true,
            venue: true,
            address: true,
            bannerUrl: true,
            status: true,
          },
        },
      },
      orderBy,
    });

    // Fallback for featured=home if none have been set yet in the database
    if ((featured === 'home' || isHomeFeatured === 'true') && mediaItems.length === 0) {
      mediaItems = await prisma.mediaItem.findMany({
        where: { type: 'IMAGE' },
        take: 4,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              category: true,
              date: true,
              time: true,
              venue: true,
              address: true,
              bannerUrl: true,
              status: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });
    }

    // 3. Fetch all events with media counts
    const allEvents = await prisma.event.findMany({
      include: {
        mediaItems: {
          select: {
            id: true,
            type: true,
            url: true,
            coverImage: true,
            isFeatured: true,
          },
          orderBy: [
            { isFeatured: 'desc' },
            { displayOrder: 'asc' },
          ],
        },
      },
      orderBy: { date: 'asc' },
    });

    // Compute enriched event objects with counts and primary cover
    const eventsWithStats = allEvents.map((evt) => {
      const photos = evt.mediaItems.filter((m) => m.type === 'IMAGE');
      const videos = evt.mediaItems.filter((m) => m.type === 'VIDEO');
      const featuredPhoto = photos.find((p) => p.isFeatured) || photos[0];
      const mainCover = featuredPhoto ? (featuredPhoto.url || featuredPhoto.coverImage) : evt.bannerUrl;

      return {
        id: evt.id,
        title: evt.title,
        category: evt.category,
        date: evt.date,
        time: evt.time,
        venue: evt.venue,
        address: evt.address,
        description: evt.description,
        bannerUrl: evt.bannerUrl,
        featuredMediaUrl: mainCover || evt.bannerUrl,
        status: evt.status,
        photosCount: photos.length,
        videosCount: videos.length,
        totalMediaCount: evt.mediaItems.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        mediaItems,
        events: eventsWithStats,
        totalCount: mediaItems.length,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch media';
    console.error('[API MEDIA GET ERROR]:', error);

    return NextResponse.json(
      { success: false, error: message, data: { mediaItems: [], events: [] } },
      { status: 500 }
    );
  }
}
