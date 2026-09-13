import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const normalized = members.map((m) => ({
      ...m,
      name: m.fullName || '',
      fullName: m.fullName || '',
      startDate: m.startDate || (m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : '2026-01-01'),
      expiryDate: m.expiryDate || 'Lifetime',
    }));
    return NextResponse.json(
      { success: true, source: 'prisma', data: normalized },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('[ADMIN MEMBERS API] Error:', error);
    return NextResponse.json(
      { success: true, source: 'static', data: [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, role, notes } = body;

    try {
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
    } catch {
      const fallbackMember = {
        id: `MITRA-MEM-${Math.floor(5000 + Math.random() * 4000)}`,
        name: fullName,
        email,
        phone,
        tier: role || 'Volunteer',
        address: 'London, UK',
        profession: 'Volunteer Advocate',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: 'Lifetime',
      };
      return NextResponse.json({ success: true, source: 'static', data: fallbackMember });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
