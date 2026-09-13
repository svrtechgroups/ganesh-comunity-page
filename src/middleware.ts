import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'mitra-secret-fallback-key-2026';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

interface TokenPayload {
  id?: string;
  email?: string;
  role?: string;
}

async function verifyJwtToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isAdminUiRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isMemberRoute =
    pathname === '/membership/portal' || pathname.startsWith('/membership/portal/');

  if (!isAdminApiRoute && !isAdminUiRoute && !isMemberRoute) {
    return NextResponse.next();
  }

  // Check auth token from cookie or Authorization header
  let token = request.cookies.get('mitra_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  const payload = token ? await verifyJwtToken(token) : null;

  // 1. Protection for /api/admin/* (API endpoints)
  if (isAdminApiRoute) {
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to access administrative API.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin privilege required.' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 2. Protection for /admin/* (UI pages)
  if (isAdminUiRoute) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== 'Admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Protection for /membership/portal/* (UI pages)
  if (isMemberRoute) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/membership/portal',
    '/membership/portal/:path*',
  ],
};
