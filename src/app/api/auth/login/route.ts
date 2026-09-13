import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email, password, loginType } = await request.json();

    if (!email || !password) {
      await logger.warn('auth/login', 'Login attempted without email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // ── Admin Login ─────────────────────────────────────────────────────────
    if (loginType === 'admin') {
      // 1. Try DB admin user
      const admin = await prisma.adminUser.findFirst({
        where: { OR: [{ email }, { username: email }] },
      }).catch(() => null);

      let adminMatched = false;
      let adminRecord: { id: string; username: string; email: string; role: string } | null = null;

      if (admin) {
        // Support both bcrypt hash and legacy plain-text passwords
        const bcryptMatch = await verifyPassword(password, admin.passwordHash).catch(() => false);
        const legacyMatch = admin.passwordHash === password;
        if (bcryptMatch || legacyMatch) {
          adminMatched = true;
          adminRecord = admin;
        }
      }

      if (!adminMatched || !adminRecord) {
        await logger.warn('auth/login', `Failed admin login attempt for "${email}"`);
        return NextResponse.json({ success: false, error: 'Invalid admin credentials.' }, { status: 401 });
      }

      const token = signToken({ id: adminRecord.id, email: adminRecord.email, role: 'Admin' }, '7d');

      const userPayload = {
        id: adminRecord.id,
        email: adminRecord.email,
        role: 'Admin' as const,
        username: adminRecord.username,
      };

      await logger.info('auth/login', `Admin login successful: "${adminRecord.email}"`, {
        adminId: adminRecord.id,
        role: 'Admin',
      });

      const response = NextResponse.json({ success: true, role: 'Admin', user: userPayload });

      response.cookies.set('mitra_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    // ── Member Login ────────────────────────────────────────────────────────
    const member = await prisma.member
      .findUnique({ where: { email: email.toLowerCase().trim() } })
      .catch(() => null);

    let memberMatched = false;

    if (member && member.passwordHash) {
      // Support bcrypt hash and legacy plain-text password
      const bcryptMatch = await verifyPassword(password, member.passwordHash).catch(() => false);
      const legacyMatch = member.passwordHash === password;
      memberMatched = bcryptMatch || legacyMatch;
    }

    if (!memberMatched || !member) {
      await logger.warn('auth/login', `Failed member login attempt for "${email}"`);
      return NextResponse.json(
        { success: false, error: 'Incorrect email or password.' },
        { status: 401 }
      );
    }

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
      imageUrl: member.imageUrl,
    };

    await logger.info('auth/login', `Member login successful: "${member.fullName}" <${member.email}>`, {
      memberId: member.id,
      tier: member.tier,
    });

    const response = NextResponse.json({ success: true, role: 'Member', user: userPayload });

    response.cookies.set('mitra_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    await logger.error('auth/login', `Login endpoint crashed: ${errorMessage}`, err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
