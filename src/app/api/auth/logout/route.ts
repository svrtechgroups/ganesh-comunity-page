import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  const isProduction = process.env.NODE_ENV === 'production';

  // Clear auth cookies with same attributes
  response.cookies.set('mitra_token', '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure: isProduction });
  response.cookies.set('mitra_member_session', '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure: isProduction });
  response.cookies.set('mitra_session', '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure: isProduction });

  return response;
}
