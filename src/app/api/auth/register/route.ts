import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, tier, address, profession, password, otp } = await request.json();

    // Validate required fields
    if (!fullName || !email || !phone || !password || !otp) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, password, and OTP are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Check for existing member
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Verify OTP
    const validOtp = await prisma.oTP.findFirst({
      where: {
        email,
        type: 'REGISTER',
        code: otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Calculate dates
    const startDate = new Date().toISOString().split('T')[0];
    let expiryDate = 'Lifetime';
    if (tier === 'Annual Member') {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      expiryDate = expiry.toISOString().split('T')[0];
    }

    const member = await prisma.member.create({
      data: {
        fullName,
        email,
        phone,
        tier: tier || 'Annual Member',
        address: address || '',
        profession: profession || null,
        passwordHash,
        startDate,
        expiryDate,
        status: 'Active',
        role: 'Member',
      },
    });

    // Delete used OTP
    await prisma.oTP.deleteMany({
      where: { email, type: 'REGISTER' },
    });

    // Issue JWT token right away so user can be logged in immediately
    const token = signToken({
      id: member.id,
      email: member.email,
      role: 'Member',
      fullName: member.fullName,
      tier: member.tier,
    });

    const userPayload = {
      id: member.id,
      email: member.email,
      role: 'Member' as const,
      fullName: member.fullName,
      tier: member.tier,
      phone: member.phone,
      status: member.status,
      expiryDate: member.expiryDate,
    };

    const response = NextResponse.json({ success: true, user: userPayload }, { status: 201 });

    response.cookies.set('mitra_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
