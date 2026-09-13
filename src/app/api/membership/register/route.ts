import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, tier, profession, address, password } = await request.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json({ success: false, error: 'Full Name, Email and Phone required' }, { status: 400 });
    }

    const randomNum = Math.floor(5000 + Math.random() * 4000);
    const memberId = `MITRA-MEM-${randomNum}`;
    const today = new Date().toISOString().split('T')[0];
    const selectedTier = tier || 'Annual Member';
    const expiry = selectedTier === 'Life Member' ? 'Lifetime' : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pwd = password || 'pass123';

    try {
      const newMember = await prisma.member.create({
        data: {
          id: memberId,
          fullName,
          email,
          phone,
          tier: selectedTier,
          role: 'Member',
          status: 'Active',
          profession: profession || 'Community Supporter',
          address: address || 'United Kingdom',
          passwordHash: pwd,
          startDate: today,
          expiryDate: expiry,
        },
      });

      const response = NextResponse.json({
        success: true,
        source: 'prisma',
        data: newMember,
      });

      // Automatically log in newly registered member
      response.cookies.set('mitra_member_session', JSON.stringify({ id: newMember.id, fullName, email, tier: selectedTier, status: 'Active', expiryDate: expiry }), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    } catch {
      const fallbackMember = {
        id: memberId,
        fullName,
        email,
        phone,
        tier: selectedTier,
        role: 'Member',
        status: 'Active',
        profession: profession || 'Community Supporter',
        address: address || 'United Kingdom',
        startDate: today,
        expiryDate: expiry,
      };

      const response = NextResponse.json({
        success: true,
        source: 'static',
        data: fallbackMember,
      });

      response.cookies.set('mitra_member_session', JSON.stringify({ id: memberId, fullName, email, tier: selectedTier, status: 'Active', expiryDate: expiry }), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
