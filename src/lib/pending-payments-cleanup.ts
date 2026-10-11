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
    // 1. Find all pending payments older than the cutoff
    const expiredPayments = await prisma.payment.findMany({
      where: {
        status: { equals: 'Pending', mode: 'insensitive' },
        createdAt: { lte: cutoffDate },
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        customerName: true,
        customerEmail: true,
        description: true,
        eventName: true,
        eventId: true,
        stripePaymentIntentId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Find any pending EventRSVPs older than the cutoff
    const expiredRsvps = await prisma.eventRSVP.findMany({
      where: {
        paymentStatus: { equals: 'Pending', mode: 'insensitive' },
        createdAt: { lte: cutoffDate },
      },
      select: {
        id: true,
        eventId: true,
        attendeeName: true,
        attendeeEmail: true,
        totalAmount: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    if (expiredPayments.length === 0 && expiredRsvps.length === 0) {
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

    const updatedPaymentIds: string[] = [];
    let updatedPaymentsCount = 0;

    // 3. Update each pending payment to 'Failed' with descriptive note
    for (const p of expiredPayments) {
      const tag = `[Failed: Unfinished/unprocessed payment after ${hours}h]`;
      const updatedDescription = p.description?.includes('Unfinished/unprocessed')
        ? p.description
        : `${p.description || 'Devotee Checkout'} ${tag}`;

      await prisma.payment.update({
        where: { id: p.id },
        data: {
          status: 'Failed',
          description: updatedDescription,
        },
      });

      updatedPaymentIds.push(p.id);
      updatedPaymentsCount++;
    }

    // 4. Update pending RSVPs to 'Failed'
    let updatedRsvpsCount = 0;
    if (expiredRsvps.length > 0) {
      const rsvpUpdateResult = await prisma.eventRSVP.updateMany({
        where: {
          id: { in: expiredRsvps.map((r) => r.id) },
        },
        data: {
          paymentStatus: 'Failed',
        },
      });
      updatedRsvpsCount = rsvpUpdateResult.count;
    }

    // 5. Audit Log to SystemLog
    if (updatedPaymentsCount > 0 || updatedRsvpsCount > 0) {
      await logger.warn(
        'cron/cleanup-pending-payments',
        `Pending Payments Worker: Marked ${updatedPaymentsCount} pending payment(s) and ${updatedRsvpsCount} pending RSVP(s) older than ${hours}h as Failed (Unfinished/unprocessed).`,
        {
          thresholdHours: hours,
          cutoffDate: cutoffDate.toISOString(),
          updatedPaymentsCount,
          updatedRsvpsCount,
          paymentIds: updatedPaymentIds,
          timestamp,
        }
      );
    }

    return {
      success: true,
      message: `Successfully marked ${updatedPaymentsCount} pending payment(s) and ${updatedRsvpsCount} pending RSVP(s) older than ${hours} hours as Failed (Unprocessed/unfinished payment).`,
      timestamp,
      cutoffDate: cutoffDate.toISOString(),
      thresholdHours: hours,
      updatedPaymentsCount,
      updatedRsvpsCount,
      affectedPaymentIds: updatedPaymentIds,
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
