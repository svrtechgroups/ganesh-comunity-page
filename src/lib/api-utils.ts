import { NextResponse } from 'next/server';

/**
 * Standard no-cache headers used by all dynamic admin API routes.
 * Extracted here so every route handler doesn't repeat them inline.
 */
export const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

/**
 * Safely extract a string message from an unknown error value.
 * Replaces the pattern: error instanceof Error ? error.message : 'Unknown'
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

/**
 * Standard error JSON response factory.
 * @example  return apiError('Event not found', 404);
 */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Standard success JSON response factory.
 * Uses noCacheHeaders by default to keep all admin data fresh.
 * @example  return apiSuccess({ data: events, total: 42 });
 */
export function apiSuccess(body: Record<string, unknown>, noCache = true): NextResponse {
  return NextResponse.json(
    { success: true, source: 'prisma', ...body },
    noCache ? { headers: noCacheHeaders } : undefined
  );
}
