/**
 * Next.js Instrumentation Hook
 * Runs once when the Next.js server instance starts up.
 * Ensures the background Email Queue worker is initialized.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { startEmailQueueWorker } = await import('@/lib/email-queue');
      startEmailQueueWorker();
      console.log('[INSTRUMENTATION] Background Email Queue Worker registered successfully.');
    } catch (err) {
      console.error('[INSTRUMENTATION] Failed initializing Email Queue Worker:', err);
    }
  }
}
