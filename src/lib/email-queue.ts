import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export interface EmailQueuePayload {
  email: string;
  subject: string;
  html: string;
  campaignType?: string | null;
  campaignId?: string | null;
}

export interface EnqueueResult {
  totalQueued: number;
  chunksProcessed: number;
}

export interface QueueWorkerStats {
  workerRunning: boolean;
  deleteOnSendEnabled: boolean;
  counts: {
    total: number;
    pending: number;
    sent: number;
    failed: number;
  };
}

// Global process-wide singleton references to ensure exactly ONE background worker runs
declare global {
  var __emailQueueWorkerInterval: NodeJS.Timeout | undefined;
  var __emailQueueWorkerTickActive: boolean | undefined;
  var __emailQueueWorkerStarted: boolean | undefined;
}

const WORKER_INTERVAL_MS = 20 * 1000; // Run every 20 seconds
const BATCH_SIZE = parseInt(process.env.EMAIL_QUEUE_BATCH_SIZE || '25', 10); // 25 emails per tick for higher throughput
const CHUNK_SIZE = 500; // Max 500 items per bulk insert chunk to protect memory
const MAX_RETRIES = 5; // Max retry attempts before marking as failed

/**
 * Splits an array into chunks of specified maximum size.
 */
export function chunkArray<T>(items: T[], size: number = CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Bulk inserts email records into the EmailQueue table in chunks of 500 max.
 * Returns immediately once all chunks are inserted.
 */
export async function enqueueEmails(
  emails: EmailQueuePayload[]
): Promise<EnqueueResult> {
  if (!emails || emails.length === 0) {
    return { totalQueued: 0, chunksProcessed: 0 };
  }

  // Filter valid emails
  const validEmails = emails.filter(
    (e) => e.email && e.email.includes('@') && e.subject && e.html
  );

  if (validEmails.length === 0) {
    return { totalQueued: 0, chunksProcessed: 0 };
  }

  // Split into chunks of 500 items max to protect memory
  const chunks = chunkArray(validEmails, CHUNK_SIZE);
  let totalQueued = 0;

  for (const chunk of chunks) {
    const records = chunk.map((item) => ({
      email: item.email.toLowerCase().trim(),
      subject: item.subject.trim(),
      html: item.html,
      status: 'pending',
      tryCount: 0,
      campaignType: item.campaignType || null,
      campaignId: item.campaignId || null,
    }));

    const result = await prisma.emailQueue.createMany({
      data: records,
      skipDuplicates: true,
    });
    totalQueued += result.count;
  }

  console.log(
    `[EMAIL QUEUE] Enqueued ${totalQueued} email(s) across ${chunks.length} chunk(s) (chunk size: ${CHUNK_SIZE}).`
  );

  // Ensure background worker is running
  startEmailQueueWorker();

  return {
    totalQueued,
    chunksProcessed: chunks.length,
  };
}

/**
 * Background worker tick executed every 20 seconds.
 * 1. Reclaims any stale 'processing' emails older than 5 minutes.
 * 2. Fetches pending emails and atomically transitions them to 'processing' to prevent multi-instance duplicates.
 * 3. Concurrently sends claimed emails using Nodemailer via Promise.all.
 * 4. Deletes or marks as 'sent' / 'failed' upon completion.
 */
export async function processEmailQueueTick(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  // Prevent concurrent execution of multiple ticks within same process
  if (globalThis.__emailQueueWorkerTickActive) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  globalThis.__emailQueueWorkerTickActive = true;
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  try {
    // 0. Reclaim any stale 'processing' items older than 5 minutes (in case worker crashed)
    await prisma.emailQueue.updateMany({
      where: {
        status: 'processing',
        createdAt: { lte: new Date(Date.now() - 5 * 60 * 1000) },
      },
      data: {
        status: 'pending',
      },
    }).catch(() => {});

    // Check .env flag: emails should only be deleted when this flag is explicitly "true"
    const shouldDeleteOnSend =
      process.env.DELETE_SENT_EMAILS === 'true' ||
      process.env.EMAIL_QUEUE_DELETE_ON_SEND === 'true';

    // 1. Fetch candidates
    const candidateBatch = await prisma.emailQueue.findMany({
      where: {
        status: 'pending',
        tryCount: { lt: MAX_RETRIES },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: BATCH_SIZE,
    });

    if (!candidateBatch || candidateBatch.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const candidateIds = candidateBatch.map((q) => q.id);

    // 2. Atomic distributed claim: transition status to 'processing'
    // This guarantees other server instances will NOT send these same emails concurrently
    await prisma.emailQueue.updateMany({
      where: {
        id: { in: candidateIds },
        status: 'pending',
      },
      data: {
        status: 'processing',
      },
    });

    // Re-verify which records this worker successfully claimed
    const pendingBatch = await prisma.emailQueue.findMany({
      where: {
        id: { in: candidateIds },
        status: 'processing',
      },
    });

    if (!pendingBatch || pendingBatch.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    processed = pendingBatch.length;
    console.log(
      `[EMAIL QUEUE WORKER] Processing tick: sending batch of ${processed} claimed email(s)...`
    );

    // 3. Send concurrently using Promise.all
    await Promise.all(
      pendingBatch.map(async (queueItem) => {
        try {
          // Send email via Nodemailer
          const isSent = await sendEmail(
            queueItem.email,
            queueItem.subject,
            queueItem.html
          );

          if (isSent) {
            succeeded++;

            // Lifecycle rule: Delete record only when flag from .env is true
            if (shouldDeleteOnSend) {
              await prisma.emailQueue
                .delete({
                  where: { id: queueItem.id },
                })
                .catch((delErr) =>
                  console.error(
                    `[EMAIL QUEUE] Failed deleting sent record ${queueItem.id}:`,
                    delErr
                  )
                );
            } else {
              // Retain record in database with status="sent"
              await prisma.emailQueue
                .update({
                  where: { id: queueItem.id },
                  data: { status: 'sent' },
                })
                .catch((updErr) =>
                  console.error(
                    `[EMAIL QUEUE] Failed updating status to 'sent' for ${queueItem.id}:`,
                    updErr
                  )
                );
            }
          } else {
            failed++;
            await recordItemFailure(
              queueItem,
              'SMTP delivery returned false without exception'
            );
          }
        } catch (dispatchError: any) {
          failed++;
          console.error(
            `[EMAIL QUEUE] Exception sending to ${queueItem.email}:`,
            dispatchError?.message || dispatchError
          );
          await recordItemFailure(
            queueItem,
            dispatchError?.message || 'Dispatch exception'
          );
        }
      })
    );

    console.log(
      `[EMAIL QUEUE WORKER] Tick completed: ${succeeded} succeeded, ${failed} failed.`
    );
  } catch (workerError: any) {
    console.error('[EMAIL QUEUE WORKER FATAL TICK ERROR]:', workerError);
  } finally {
    globalThis.__emailQueueWorkerTickActive = false;
  }

  return { processed, succeeded, failed };
}

/**
 * Handles individual email failure by incrementing tryCount and marking failed if threshold reached.
 */
async function recordItemFailure(
  item: { id: string; tryCount: number },
  _reason: string
) {
  const nextTryCount = (item.tryCount || 0) + 1;
  const newStatus = nextTryCount >= MAX_RETRIES ? 'failed' : 'pending';

  try {
    await prisma.emailQueue.update({
      where: { id: item.id },
      data: {
        tryCount: nextTryCount,
        status: newStatus,
      },
    });
  } catch (err) {
    console.error(
      `[EMAIL QUEUE] Failed recording retry count for item ${item.id}:`,
      err
    );
  }
}

/**
 * Starts the background processing worker with a 20-second interval.
 * Uses a global singleton pattern to avoid duplicate workers on Next.js hot-reload.
 */
export function startEmailQueueWorker(): boolean {
  if (globalThis.__emailQueueWorkerInterval) {
    return false; // Already running
  }

  console.log(
    `[EMAIL QUEUE] Initialising background worker (Interval: ${WORKER_INTERVAL_MS / 1000}s, Batch: ${BATCH_SIZE})...`
  );

  // Run initial tick immediately
  processEmailQueueTick().catch((err) =>
    console.error('[EMAIL QUEUE] Error in initial worker tick:', err)
  );

  // Set recurring 20s interval
  globalThis.__emailQueueWorkerInterval = setInterval(() => {
    processEmailQueueTick().catch((err) =>
      console.error('[EMAIL QUEUE] Error in recurring worker tick:', err)
    );
  }, WORKER_INTERVAL_MS);

  if (globalThis.__emailQueueWorkerInterval.unref) {
    globalThis.__emailQueueWorkerInterval.unref();
  }

  globalThis.__emailQueueWorkerStarted = true;
  return true;
}

/**
 * Stops the background processing worker.
 */
export function stopEmailQueueWorker(): boolean {
  if (globalThis.__emailQueueWorkerInterval) {
    clearInterval(globalThis.__emailQueueWorkerInterval);
    globalThis.__emailQueueWorkerInterval = undefined;
    globalThis.__emailQueueWorkerStarted = false;
    console.log('[EMAIL QUEUE] Background worker stopped.');
    return true;
  }
  return false;
}

/**
 * Returns current queue statistics and worker status.
 */
export async function getEmailQueueStats(): Promise<QueueWorkerStats> {
  const [total, pending, sent, failed] = await Promise.all([
    prisma.emailQueue.count(),
    prisma.emailQueue.count({ where: { status: 'pending' } }),
    prisma.emailQueue.count({ where: { status: 'sent' } }),
    prisma.emailQueue.count({ where: { status: 'failed' } }),
  ]);

  const shouldDeleteOnSend =
    process.env.DELETE_SENT_EMAILS === 'true' ||
    process.env.EMAIL_QUEUE_DELETE_ON_SEND === 'true';

  return {
    workerRunning: Boolean(globalThis.__emailQueueWorkerInterval),
    deleteOnSendEnabled: shouldDeleteOnSend,
    counts: {
      total,
      pending,
      sent,
      failed,
    },
  };
}

// Automatically start the worker when running on the Node.js server
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  startEmailQueueWorker();
}
