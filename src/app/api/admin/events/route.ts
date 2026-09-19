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
    const {
      title,
      category,
      date,
      time,
      venue,
      address,
      ticketPrice,
      childTicketPrice,
      status,
      description,
      bannerUrl,
      capacity,
      enableRsvp = true,
      enableSupportPayment = true,
      enablePooja = true,
      enforceCapacityLimit = false,
      adultCapacity = 0,
      childCapacity = 0,
      availableDates,
      mapUrl,
      customFields,
    } = body;

    let parsedDates: string[] = [];
    if (Array.isArray(availableDates)) {
      parsedDates = availableDates.map(String).map((s) => s.trim()).filter(Boolean);
    } else if (typeof availableDates === 'string') {
      parsedDates = availableDates.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }

    let parsedCustomFields = [];
    if (Array.isArray(customFields)) {
      parsedCustomFields = customFields;
    } else if (typeof customFields === 'string' && customFields.trim()) {
      try {
        parsedCustomFields = JSON.parse(customFields);
      } catch {}
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        category: category || 'Cultural Events',
        date,
        time: time || '09:00 AM',
        venue,
        address: address || 'Langley, Slough, United Kingdom',
        ticketPrice: Number(ticketPrice) || 0,
        childTicketPrice: Number(childTicketPrice) || 0,
        status: status || 'Upcoming',
        description,
        bannerUrl: bannerUrl || '/assets/poster.jpg',
        capacity: Number(capacity) || 300,
        enableRsvp: Boolean(enableRsvp),
        enableSupportPayment: Boolean(enableSupportPayment),
        enablePooja: Boolean(enablePooja),
        enforceCapacityLimit: Boolean(enforceCapacityLimit),
        adultCapacity: Number(adultCapacity) || 0,
        childCapacity: Number(childCapacity) || 0,
        availableDates: parsedDates,
        mapUrl: mapUrl ? String(mapUrl).trim() : null,
        customFields: parsedCustomFields,
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
      childTicketPrice,
      status,
      description,
      bannerUrl,
      capacity,
      enableRsvp,
      enableSupportPayment,
      enablePooja,
      enforceCapacityLimit,
      adultCapacity,
      childCapacity,
      availableDates,
      mapUrl,
      customFields,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required for update.' },
        { status: 400 }
      );
    }

    let parsedDates: string[] | undefined = undefined;
    if (availableDates !== undefined) {
      if (Array.isArray(availableDates)) {
        parsedDates = availableDates.map(String).map((s) => s.trim()).filter(Boolean);
      } else if (typeof availableDates === 'string') {
        parsedDates = availableDates.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      }
    }

    let parsedCustomFields = undefined;
    if (customFields !== undefined) {
      if (Array.isArray(customFields)) {
        parsedCustomFields = customFields;
      } else if (typeof customFields === 'string' && customFields.trim()) {
        try {
          parsedCustomFields = JSON.parse(customFields);
        } catch {
          parsedCustomFields = [];
        }
      } else if (customFields === null) {
        parsedCustomFields = [];
      }
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
        childTicketPrice: childTicketPrice !== undefined ? Number(childTicketPrice) : undefined,
        status: status !== undefined ? status : undefined,
        description: description !== undefined ? description : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
        capacity: capacity !== undefined ? Number(capacity) : undefined,
        enableRsvp: enableRsvp !== undefined ? Boolean(enableRsvp) : undefined,
        enableSupportPayment: enableSupportPayment !== undefined ? Boolean(enableSupportPayment) : undefined,
        enablePooja: enablePooja !== undefined ? Boolean(enablePooja) : undefined,
        enforceCapacityLimit: enforceCapacityLimit !== undefined ? Boolean(enforceCapacityLimit) : undefined,
        adultCapacity: adultCapacity !== undefined ? Number(adultCapacity) : undefined,
        childCapacity: childCapacity !== undefined ? Number(childCapacity) : undefined,
        availableDates: parsedDates !== undefined ? parsedDates : undefined,
        mapUrl: mapUrl !== undefined ? (mapUrl ? String(mapUrl).trim() : null) : undefined,
        customFields: parsedCustomFields !== undefined ? parsedCustomFields : undefined,
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

