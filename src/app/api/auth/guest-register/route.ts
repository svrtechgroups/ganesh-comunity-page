import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { sendGuestWelcomeEmail } from '@/lib/email';

// ── Helper: generate a readable random temp password ─────────────────────────

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specials = '@#!';
  let pw = 'Mitra@';
  for (let i = 0; i < 6; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pw += specials.charAt(Math.floor(Math.random() * specials.length));
  return pw;
}

// ── POST /api/auth/guest-register ─────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { fullName, email, phone } = await request.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and phone are required.' },
        { status: 400 }
      );
    }

    // Normalise email
    const normalEmail = email.toLowerCase().trim();

    // ── Case 1: Existing member — silently log them in ────────────────────────
    const existing = await prisma.member.findUnique({ where: { email: normalEmail } });

    if (existing) {
      const token = signToken({
        id: existing.id,
        email: existing.email,
        role: 'Member',
        fullName: existing.fullName,
        tier: existing.tier,
      });

      const userPayload = {
        id: existing.id,
        email: existing.email,
        role: 'Member' as const,
        fullName: existing.fullName,
        tier: existing.tier,
        phone: existing.phone,
        status: existing.status,
        expiryDate: existing.expiryDate,
      };

      const response = NextResponse.json(
        { success: true, user: userPayload, isNewUser: false },
        { status: 200 }
      );

      response.cookies.set('mitra_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    // ── Case 2: New user — create account + send welcome email ────────────────
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const member = await prisma.member.create({
      data: {
        fullName: fullName.trim(),
        email: normalEmail,
        phone: phone.trim(),
        tier: 'Annual Member',
        passwordHash,
        startDate: today,
        expiryDate: expiry.toISOString().split('T')[0],
        status: 'Active',
        role: 'Member',
      },
    });

    // Send welcome email with temp password (non-blocking)
    sendGuestWelcomeEmail(normalEmail, member.fullName, tempPassword).catch((err) =>
      console.error('[guest-register] Email send failed:', err)
    );

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

    const response = NextResponse.json(
      { success: true, user: userPayload, isNewUser: true },
      { status: 201 }
    );

    response.cookies.set('mitra_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Guest registration failed';
    console.error('[guest-register] Error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
