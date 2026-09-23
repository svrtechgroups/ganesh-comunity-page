import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cron/cleanup-pending-payments
 * POST /api/cron/cleanup-pending-payments
 *
 * Cron Job / Scheduled Worker:
 * 1. Checks for all pending payments created more than 24 hours ago (or configurable ?hours=N).
 * 2. Marks them as "Failed" with clear annotation "Unfinished/unprocessed payment after 24 hours".
 * 3. Also finds associated EventRSVP records with paymentStatus = 'Pending' older than 24 hours and marks them as 'Failed'.
 * 4. Logs the action to SystemLog.
 * 5. Returns a structured JSON report.
 */
async function processPendingCleanup(request: Request) {
  const timestamp = new Date().toISOString();
  const url = new URL(request.url);
  const hoursParam = url.searchParams.get('hours');
  const dryRun = url.searchParams.get('dryRun') === 'true';
  const hours = hoursParam ? Math.max(1, parseInt(hoursParam, 10)) : 24;

  // Cutoff timestamp: e.g. 24 hours ago
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

    if (dryRun) {
      return NextResponse.json({
        success: true,
        mode: 'dry-run',
        message: `Dry run completed. Found ${expiredPayments.length} pending payment(s) and ${expiredRsvps.length} pending RSVP(s) older than ${hours} hours.`,
        cutoffDate: cutoffDate.toISOString(),
        thresholdHours: hours,
        expiredPaymentsCount: expiredPayments.length,
        expiredRsvpsCount: expiredRsvps.length,
        payments: expiredPayments,
        rsvps: expiredRsvps,
      });
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
        `Cron Cleanup: Marked ${updatedPaymentsCount} pending payment(s) and ${updatedRsvpsCount} pending RSVP(s) older than ${hours}h as Failed (Unfinished/unprocessed).`,
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

    return NextResponse.json({
      success: true,
      message: `Successfully marked ${updatedPaymentsCount} pending payment(s) and ${updatedRsvpsCount} pending RSVP(s) older than ${hours} hours as Failed (Unprocessed/unfinished payment).`,
      timestamp,
      cutoffDate: cutoffDate.toISOString(),
      thresholdHours: hours,
      updatedPaymentsCount,
      updatedRsvpsCount,
      affectedPaymentIds: updatedPaymentIds,
      summary: {
        totalPendingFound: expiredPayments.length,
        totalPaymentsUpdated: updatedPaymentsCount,
        totalRsvpsUpdated: updatedRsvpsCount,
      },
    });
  } catch (error: any) {
    console.error('[CRON CLEANUP PENDING PAYMENTS ERROR]:', error);
    await logger.error(
      'cron/cleanup-pending-payments',
      `Cron cleanup error: ${error?.message || error}`
    );

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal error executing pending payments cleanup cron.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return processPendingCleanup(request);
}

export async function POST(request: Request) {
  return processPendingCleanup(request);
}
