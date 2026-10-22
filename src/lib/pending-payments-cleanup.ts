import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

declare global {
  // Prevent duplicate intervals during Next.js development hot-reloads
  var __pendingPaymentsWorkerInterval: NodeJS.Timeout | undefined;
  var __pendingPaymentsWorkerStarted: boolean | undefined;
}

export interface CleanupResult {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
  cutoffDate?: string;
  thresholdHours?: number;
  updatedPaymentsCount: number;
  updatedRsvpsCount: number;
  affectedPaymentIds?: string[];
}

/**
 * Cleans up pending payments and pending EventRSVPs older than the specified hours (default: 24h).
 * Marks them as 'Failed' (unfinished/unprocessed checkout).
 */
export async function cleanupPendingPayments(hours = 24): Promise<CleanupResult> {
  const timestamp = new Date().toISOString();
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  try {
    // 1. Fetch sample IDs (capped at 50) for audit logging without pulling full table
    const sampleExpiredPayments = await prisma.payment.findMany({
      where: {
        status: { equals: 'Pending', mode: 'insensitive' },
        createdAt: { lte: cutoffDate },
      },
      select: { id: true },
      take: 50,
    });
    const samplePaymentIds = sampleExpiredPayments.map((p) => p.id);

    // 2. Perform atomic batch updates with updateMany in parallel
    const [paymentsUpdateResult, rsvpsUpdateResult] = await Promise.all([
      prisma.payment.updateMany({
        where: {
          status: { equals: 'Pending', mode: 'insensitive' },
          createdAt: { lte: cutoffDate },
        },
        data: {
          status: 'Failed',
        },
      }),
      prisma.eventRSVP.updateMany({
        where: {
          paymentStatus: { equals: 'Pending', mode: 'insensitive' },
          createdAt: { lte: cutoffDate },
        },
        data: {
          paymentStatus: 'Failed',
        },
      }),
    ]);

    const updatedPaymentsCount = paymentsUpdateResult.count;
    const updatedRsvpsCount = rsvpsUpdateResult.count;

    if (updatedPaymentsCount === 0 && updatedRsvpsCount === 0) {
      return {
        success: true,
        message: `No pending payments or RSVPs older than ${hours} hours found.`,
        cutoffDate: cutoffDate.toISOString(),
        thresholdHours: hours,
        updatedPaymentsCount: 0,
        updatedRsvpsCount: 0,
        affectedPaymentIds: [],
      };
    }

    // 3. Audit Log to SystemLog
    await logger.warn(
      'cron/cleanup-pending-payments',
      `Pending Payments Worker: Marked ${updatedPaymentsCount} pending payment(s) and ${updatedRsvpsCount} pending RSVP(s) older than ${hours}h as Failed (Unfinished/unprocessed).`,
      {
        thresholdHours: hours,
        cutoffDate: cutoffDate.toISOString(),
        updatedPaymentsCount,
        updatedRsvpsCount,
        samplePaymentIds,
        timestamp,
      }
    );

    return {
      success: true,
      message: `Successfully marked ${updatedPaymentsCount} pending payment(s) and ${updatedRsvpsCount} pending RSVP(s) older than ${hours} hours as Failed (Unprocessed/unfinished payment).`,
      timestamp,
      cutoffDate: cutoffDate.toISOString(),
      thresholdHours: hours,
      updatedPaymentsCount,
      updatedRsvpsCount,
      affectedPaymentIds: samplePaymentIds,
    };
  } catch (error: any) {
    console.error('[PENDING PAYMENTS CLEANUP ERROR]:', error);
    try {
      await logger.error(
        'cron/cleanup-pending-payments',
        `Pending payments cleanup error: ${error?.message || error}`
      );
    } catch {}

    return {
      success: false,
      error: error?.message || 'Error executing pending payments cleanup.',
      updatedPaymentsCount: 0,
      updatedRsvpsCount: 0,
    };
  }
}

/**
 * Starts recurring pending payments cleanup worker.
 * Runs once immediately at server start, then periodically (default: every 1 hour).
 */
export function startPendingPaymentsWorker(intervalMs = 60 * 60 * 1000): boolean {
  if (globalThis.__pendingPaymentsWorkerInterval) {
    return false; // Already running in this process
  }

  console.log(`[PENDING PAYMENTS WORKER] Starting worker (Interval: ${intervalMs / 1000}s)...`);

  // Run initial cleanup pass
  cleanupPendingPayments(24)
    .then((res) => {
      if (res.updatedPaymentsCount > 0 || res.updatedRsvpsCount > 0) {
        console.log(`[PENDING PAYMENTS WORKER] Initial cleanup: ${res.message}`);
      }
    })
    .catch((err) => {
      console.error('[PENDING PAYMENTS WORKER] Error running initial cleanup:', err);
    });

  // Recurring interval
  globalThis.__pendingPaymentsWorkerInterval = setInterval(() => {
    cleanupPendingPayments(24).catch((err) => {
      console.error('[PENDING PAYMENTS WORKER] Error in recurring cleanup:', err);
    });
  }, intervalMs);

  if (globalThis.__pendingPaymentsWorkerInterval.unref) {
    globalThis.__pendingPaymentsWorkerInterval.unref();
  }

  globalThis.__pendingPaymentsWorkerStarted = true;
  return true;
}
