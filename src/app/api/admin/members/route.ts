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
    const limit = limitParam === 'all' ? 0 : Math.max(1, parseInt(limitParam || '50', 10));
    const search = searchParams.get('search')?.trim() || '';

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, members] = await prisma.$transaction([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(limit > 0 ? { skip: (page - 1) * limit, take: limit } : {}),
      }),
    ]);

    const normalized = members.map((m) => ({
      ...m,
      name: m.fullName || '',
      fullName: m.fullName || '',
      startDate: m.startDate || (m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : '2026-01-01'),
      expiryDate: m.expiryDate || 'Lifetime',
    }));

    return NextResponse.json(
      {
        success: true,
        source: 'prisma',
        data: normalized,
        pagination: {
          total,
          page,
          limit: limit || total,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
        },
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error('[ADMIN MEMBERS API] Error:', error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error, 'Failed to fetch members') },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, role, notes } = body;

    if (!fullName || !email) {
      return NextResponse.json({ success: false, error: 'Full name and email are required.' }, { status: 400 });
    }

    const newMember = await prisma.member.create({
      data: {
        fullName,
        email,
        phone,
        role: role || 'Volunteer',
        status: 'Active',
        notes: notes || null,
      },
    });
    return NextResponse.json({ success: true, source: 'prisma', data: newMember });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err, 'Invalid request payload') }, { status: 400 });
  }
}

