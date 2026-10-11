import { NextResponse } from 'next/server';
import { cleanupPendingPayments } from '@/lib/pending-payments-cleanup';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cron/cleanup-pending-payments
 * POST /api/cron/cleanup-pending-payments
 * Delegates execution directly to cleanupPendingPayments() in src/lib/pending-payments-cleanup.ts
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const hoursParam = url.searchParams.get('hours');
  const hours = hoursParam ? Math.max(1, parseInt(hoursParam, 10)) : 24;

  const result = await cleanupPendingPayments(hours);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const hoursParam = url.searchParams.get('hours');
  const hours = hoursParam ? Math.max(1, parseInt(hoursParam, 10)) : 24;

  const result = await cleanupPendingPayments(hours);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
