import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTP } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ success: false, error: 'Email and type are required' }, { status: 400 });
    }

    const normalEmail = email.toLowerCase().trim();

    if (type !== 'REGISTER' && type !== 'FORGOT_PASSWORD') {
      return NextResponse.json({ success: false, error: 'Invalid OTP type' }, { status: 400 });
    }

    // 1. Rate Limiting: 60-second cooldown per email
    const recentOtp = await prisma.oTP.findFirst({
      where: {
        email: normalEmail,
        type,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      return NextResponse.json(
        { success: false, error: 'Please wait 60 seconds before requesting another verification code.' },
        { status: 429 }
      );
    }

    // 2. Hourly Abuse Prevention: Maximum 5 OTP requests per hour
    const hourlyCount = await prisma.oTP.count({
      where: {
        email: normalEmail,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (hourlyCount >= 5) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please try again in an hour.' },
        { status: 429 }
      );
    }

    // 3. Clean up expired OTPs for this email in background
    prisma.oTP.deleteMany({
      where: {
        email: normalEmail,
        expiresAt: { lt: new Date() },
      },
    }).catch(() => {});

    // Check if user exists depending on the type
    const existingMember = await prisma.member.findFirst({ where: { email: normalEmail } });

    if (type === 'REGISTER' && existingMember) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    if (type === 'FORGOT_PASSWORD' && !existingMember) {
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 404 });
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save to DB
    await prisma.oTP.create({
      data: {
        email: normalEmail,
        code,
        type,
        expiresAt,
      },
    });

    // Send email
    const emailSent = await sendOTP(normalEmail, code, type);

    if (!emailSent) {
      return NextResponse.json({ success: false, error: 'Failed to send OTP email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err: unknown) {
    console.error('Error sending OTP:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
