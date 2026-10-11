/**
 * Next.js Instrumentation Hook
 * Runs once when the Next.js server instance starts up.
 * Ensures server-side hooks and background workers are initialized.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // 1. Initialize HTTP response-time request analytics logger hook
      const { initRequestAnalyticsServerHook } = await import('@/lib/request-analytics');
      initRequestAnalyticsServerHook();

      // 2. Start Background Pending Payments & RSVPs Cleanup Worker (24h cutoff, hourly interval)
      const { startPendingPaymentsWorker } = await import('@/lib/pending-payments-cleanup');
      startPendingPaymentsWorker();

      console.log('[INSTRUMENTATION] Background workers & Request Analytics registered successfully.');
    } catch (err) {
      console.error('[INSTRUMENTATION] Failed initializing server hooks:', err);
    }
  }
}
