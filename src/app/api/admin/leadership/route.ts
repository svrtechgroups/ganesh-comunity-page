import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { noCacheHeaders, getErrorMessage } from '@/lib/api-utils';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = searchParams.get('limit');
    const limit = limitParam === 'all' ? 0 : Math.max(1, parseInt(limitParam || '100', 10));
    const category = searchParams.get('category')?.trim() || '';

    const where = category ? { category: { contains: category, mode: 'insensitive' as const } } : {};

    const [total, members] = await prisma.$transaction([
      prisma.leadershipMember.count({ where }),
      prisma.leadershipMember.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        ...(limit > 0 ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
    ]);

    return NextResponse.json(
      { success: true, data: members, pagination: { total, page, limit: limit || total, totalPages: limit > 0 ? Math.ceil(total / limit) : 1 } },
      { headers: noCacheHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error, 'Failed to fetch leadership') }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, designation, category, bio, imageUrl, email, phone, linkedin, twitter, displayOrder, active } = body;

    if (!name || !designation) {
      return NextResponse.json({ success: false, error: 'Name and Designation are required.' }, { status: 400 });
    }

    const member = await prisma.leadershipMember.create({
      data: {
        name: name.trim(),
        designation: designation.trim(),
        category: category || 'Executive Committee',
        bio: bio?.trim() || '',
        imageUrl: imageUrl?.trim() || '/assets/poster.jpg',
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        linkedin: linkedin?.trim() || null,
        twitter: twitter?.trim() || null,
        displayOrder: Number(displayOrder) || 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error, 'Failed to create leadership member') }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, designation, category, bio, imageUrl, email, phone, linkedin, twitter, displayOrder, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Member ID is required.' }, { status: 400 });
    }

    const member = await prisma.leadershipMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(designation !== undefined && { designation: designation.trim() }),
        ...(category !== undefined && { category }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(linkedin !== undefined && { linkedin: linkedin?.trim() || null }),
        ...(twitter !== undefined && { twitter: twitter?.trim() || null }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error, 'Failed to update leadership member') }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Member ID is required.' }, { status: 400 });
    }

    await prisma.leadershipMember.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Leadership member deleted successfully.' });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error, 'Failed to delete leadership member') }, { status: 500 });
  }
}
