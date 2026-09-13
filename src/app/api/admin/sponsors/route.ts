import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: sponsors });
  } catch (error) {
    console.error('Failed to fetch admin sponsors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsors', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      tier,
      logoUrl,
      websiteUrl,
      order,
      active,
      accent,
      gradient,
      blackLogoBg,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Sponsor name is required' },
        { status: 400 }
      );
    }

    // Auto calculate next order if not provided
    let calculatedOrder = Number(order);
    if (isNaN(calculatedOrder) || calculatedOrder <= 0) {
      const highest = await prisma.sponsor.findFirst({
        orderBy: { order: 'desc' },
      });
      calculatedOrder = (highest?.order ?? 0) + 1;
    }

    const newSponsor = await prisma.sponsor.create({
      data: {
        name,
        tier: tier || 'Partner',
        logoUrl: logoUrl || '/assets/poster.jpg',
        websiteUrl: websiteUrl || '#',
        order: calculatedOrder,
        active: active !== undefined ? Boolean(active) : true,
        accent: accent || 'from-[#E65C00] to-[#FF7A00]',
        gradient: gradient || 'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)',
        blackLogoBg: Boolean(blackLogoBg),
      },
    });

    return NextResponse.json({ success: true, data: newSponsor });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      tier,
      logoUrl,
      websiteUrl,
      order,
      active,
      accent,
      gradient,
      blackLogoBg,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sponsor ID required' }, { status: 400 });
    }

    const updated = await prisma.sponsor.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(tier !== undefined && { tier }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(order !== undefined && { order: Number(order) }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(accent !== undefined && { accent }),
        ...(gradient !== undefined && { gradient }),
        ...(blackLogoBg !== undefined && { blackLogoBg: Boolean(blackLogoBg) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update sponsor';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sponsor ID required' }, { status: 400 });
    }

    await prisma.sponsor.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Sponsor ${id} deleted` });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
