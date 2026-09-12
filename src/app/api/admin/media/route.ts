import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const type = searchParams.get('type');

    const where: any = {};
    if (eventId && eventId !== 'all') {
      where.eventId = eventId;
    }
    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    const [mediaItems, events] = await Promise.all([
      prisma.mediaItem.findMany({
        where,
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
        orderBy: [
          { isFeatured: 'desc' },
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.event.findMany({
        select: {
          id: true,
          title: true,
          date: true,
          venue: true,
          bannerUrl: true,
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Statistics
    const totalMedia = mediaItems.length;
    const totalPhotos = mediaItems.filter((m) => m.type === 'IMAGE').length;
    const totalVideos = mediaItems.filter((m) => m.type === 'VIDEO').length;
    const distinctEventIds = new Set(mediaItems.map((m) => m.eventId).filter(Boolean));

    return NextResponse.json({
      success: true,
      data: {
        mediaItems,
        events,
        stats: {
          totalMedia,
          totalPhotos,
          totalVideos,
          totalEventsCovered: distinctEventIds.size,
        },
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admin media';
    console.error('[API ADMIN MEDIA GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      type = 'IMAGE',
      category = 'Photo',
      url,
      coverImage,
      description,
      eventId,
      isFeatured = false,
      displayOrder = 0,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Media title is required.' },
        { status: 400 }
      );
    }

    if (!url || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'Media URL or FTP uploaded image is required.' },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();
    const isYt = isYouTubeUrl(cleanUrl);
    const resolvedType = isYt ? 'VIDEO' : (type.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE');
    const resolvedCategory = isYt && (!category || category === 'Photo') ? 'Video' : (category || (resolvedType === 'VIDEO' ? 'Video' : 'Photo'));
    const ytThumb = isYt ? getYouTubeThumbnailUrl(cleanUrl, 'hq') : null;
    const resolvedCoverImage = coverImage && coverImage.trim() !== cleanUrl
      ? coverImage.trim()
      : (ytThumb || (resolvedType === 'IMAGE' ? cleanUrl : null));

    const newMedia = await prisma.mediaItem.create({
      data: {
        title: title.trim(),
        type: resolvedType,
        category: resolvedCategory,
        url: cleanUrl,
        coverImage: resolvedCoverImage,
        description: description?.trim() || null,
        eventId: eventId && eventId !== 'none' ? eventId : null,
        isFeatured: Boolean(isFeatured),
        displayOrder: Number(displayOrder) || 0,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newMedia,
      message: 'Media item created successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create media item';
    console.error('[API ADMIN MEDIA POST ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      type,
      category,
      url,
      coverImage,
      description,
      eventId,
      isFeatured,
      displayOrder,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media item ID is required for update.' },
        { status: 400 }
      );
    }

    const cleanUrl = url !== undefined ? url.trim() : undefined;
    const isYt = cleanUrl ? isYouTubeUrl(cleanUrl) : false;
    const resolvedType = cleanUrl && isYt ? 'VIDEO' : (type ? (type.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE') : undefined);
    const ytThumb = isYt && cleanUrl ? getYouTubeThumbnailUrl(cleanUrl, 'hq') : null;
    const resolvedCoverImage = coverImage !== undefined
      ? (coverImage && coverImage.trim() !== cleanUrl ? coverImage.trim() : (ytThumb || null))
      : (ytThumb || undefined);

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        type: resolvedType,
        category: category !== undefined ? category : (isYt ? 'Video' : undefined),
        url: cleanUrl,
        coverImage: resolvedCoverImage,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        eventId: eventId !== undefined ? (eventId && eventId !== 'none' ? eventId : null) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Media item updated successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update media item';
    console.error('[API ADMIN MEDIA PUT ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media item ID is required for deletion.' },
        { status: 400 }
      );
    }

    await prisma.mediaItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Media item ${id} successfully removed.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete media item';
    console.error('[API ADMIN MEDIA DELETE ERROR]:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
