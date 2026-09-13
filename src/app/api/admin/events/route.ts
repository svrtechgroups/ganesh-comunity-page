import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      { success: true, source: 'prisma', data: events },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database error fetching admin events';
    console.error('[API ADMIN EVENTS GET ERROR]:', error);
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, date, time, venue, address, ticketPrice, status, description, bannerUrl } = body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        category: category || 'Cultural Events',
        date,
        time: time || '09:00 AM',
        venue,
        address: address || 'Langley, Slough, United Kingdom',
        ticketPrice: Number(ticketPrice) || 0,
        status: status || 'Upcoming',
        description,
        bannerUrl: bannerUrl || '/assets/poster.jpg',
      },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: newEvent });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create event in database';
    console.error('[API ADMIN EVENTS POST ERROR]:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    try {
      await prisma.event.delete({ where: { id } });
    } catch {
      // Ignore if not in DB
    }

    return NextResponse.json({ success: true, message: `Event ${id} deleted` });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      category,
      date,
      time,
      venue,
      address,
      ticketPrice,
      status,
      description,
      bannerUrl,
      capacity,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required for update.' },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        category: category !== undefined ? category : undefined,
        date: date !== undefined ? date : undefined,
        time: time !== undefined ? time : undefined,
        venue: venue !== undefined ? venue : undefined,
        address: address !== undefined ? address : undefined,
        ticketPrice: ticketPrice !== undefined ? Number(ticketPrice) : undefined,
        status: status !== undefined ? status : undefined,
        description: description !== undefined ? description : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
        capacity: capacity !== undefined ? Number(capacity) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update event in database';
    console.error('[API ADMIN EVENTS PUT ERROR]:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

