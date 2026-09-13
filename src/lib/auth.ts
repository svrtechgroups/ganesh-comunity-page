import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mitra-secret-fallback-key-2026';
const SALT_ROUNDS = 12;

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'mitra-secret-fallback-key-2026')) {
  console.warn('[SECURITY WARNING] JWT_SECRET is not configured or using default key in production! Set a strong random secret in environment.');
}

// ── Password utilities ──────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT utilities ───────────────────────────────────────────────────────────

export interface TokenPayload {
  id: string;
  email: string;
  role: 'Member' | 'Admin';
  tier?: string;
  fullName?: string;
}

export function signToken(payload: TokenPayload, expiresIn = '30d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and cryptographically verifies token from request (cookie or Bearer header).
 */
export function getAuthenticatedUser(request: Request): TokenPayload | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/mitra_token=([^;]+)/);
    let token = match ? match[1] : null;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
