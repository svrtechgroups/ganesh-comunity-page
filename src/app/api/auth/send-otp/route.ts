import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTP } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ success: false, error: 'Email and type are required' }, { status: 400 });
    }

    if (type !== 'REGISTER' && type !== 'FORGOT_PASSWORD') {
      return NextResponse.json({ success: false, error: 'Invalid OTP type' }, { status: 400 });
    }

    // Check if user exists depending on the type
    const existingMember = await prisma.member.findFirst({ where: { email } });

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
        email,
        code,
        type,
        expiresAt,
      },
    });

    // Send email
    const emailSent = await sendOTP(email, code, type);

    if (!emailSent) {
      return NextResponse.json({ success: false, error: 'Failed to send OTP email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err: unknown) {
    console.error('Error sending OTP:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
