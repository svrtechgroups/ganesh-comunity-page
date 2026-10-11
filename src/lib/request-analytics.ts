import http from 'http';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export interface RequestAnalyticsEntry {
  method: string;
  url: string;
  pathname: string;
  status: number;
  durationMs: number;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  query?: Record<string, string>;
}

// In-memory queue for batching logs to avoid database write thrashing
const logQueue: Array<{
  id: string;
  level: string;
  source: string;
  message: string;
  details: any;
  ip: string | null;
  userId: string | null;
  createdAt: Date;
}> = [];

let flushTimeout: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL_MS = 600; // Flush to DB every 600ms
const MAX_BATCH_SIZE = 50;

/**
 * Filter out high-frequency static asset noise so the DB log remains clean and focused
 */
export function shouldLogRequest(pathname: string): boolean {
  if (!pathname || typeof pathname !== 'string') return false;

  // Ignore internal Next.js assets and HMR
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/__next') ||
    pathname.includes('/node_modules/') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/icon.jpg'
  ) {
    return false;
  }

  // Ignore static assets by file extension
  if (pathname.match(/\.(png|jpe?g|gif|webp|svg|ico|glb|gltf|css|js|map|woff2?|ttf|eot)$/i)) {
    return false;
  }

  return true;
}

/**
 * Categorize HTTP status into standard log level
 */
function getLevelForStatus(status: number): string {
  if (status >= 500) return 'ERROR';
  if (status >= 400) return 'WARN';
  return 'HTTP';
}

/**
 * Flushes queued logs to the database using batch insert
 */
export async function flushLogQueue() {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (logQueue.length === 0) return;

  const batch = logQueue.splice(0, logQueue.length);

  try {
    await prisma.systemLog.createMany({
      data: batch,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('[REQUEST ANALYTICS] Failed to batch flush request logs to database:', error);
  }
}

/**
 * Enqueue a completed HTTP request for analytics logging
 */
export function enqueueRequestLog(entry: RequestAnalyticsEntry) {
  const level = getLevelForStatus(entry.status);
  const statusCategory = entry.status >= 500 ? 'SERVER_ERROR' : entry.status >= 400 ? 'CLIENT_ERROR' : 'OK';

  const source = `http:${entry.method.toLowerCase()}`;
  const message = `${entry.method} ${entry.pathname} ${entry.status} in ${entry.durationMs}ms`;

  logQueue.push({
    id: randomUUID(),
    level,
    source,
    message,
    details: {
      type: 'request_analytics',
      method: entry.method,
      pathname: entry.pathname,
      url: entry.url,
      status: entry.status,
      statusCategory,
      durationMs: entry.durationMs,
      ip: entry.ip,
      userAgent: entry.userAgent,
      referer: entry.referer,
    },
    ip: entry.ip,
    userId: null,
    createdAt: new Date(),
  });

  // If queue reaches batch size, flush immediately; otherwise schedule debounced flush
  if (logQueue.length >= MAX_BATCH_SIZE) {
    flushLogQueue().catch(() => {});
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushLogQueue().catch(() => {});
    }, FLUSH_INTERVAL_MS);
  }
}

let isHookInitialized = false;

/**
 * Intercepts Node.js http.Server to record accurate response times for every request
 */
export function initRequestAnalyticsServerHook() {
  if (isHookInitialized) return;
  isHookInitialized = true;

  const originalEmit = http.Server.prototype.emit;

  http.Server.prototype.emit = function (event: string, ...args: any[]) {
    if (event === 'request') {
      const req = args[0] as http.IncomingMessage;
      const res = args[1] as http.ServerResponse;

      if (req && res && typeof req.url === 'string') {
        const urlParts = req.url.split('?');
        const pathname = urlParts[0] || '/';

        if (shouldLogRequest(pathname)) {
          const startTime = performance.now();

          // Listen for response completion
          res.once('finish', () => {
            const durationMs = Math.max(1, Math.round(performance.now() - startTime));

            // Attach Server-Timing and X-Response-Time headers if response headers are writable
            try {
              if (!res.headersSent) {
                res.setHeader('Server-Timing', `total;dur=${durationMs}`);
                res.setHeader('X-Response-Time', `${durationMs}ms`);
              }
            } catch {}

            // Extract client IP
            const forwarded = req.headers['x-forwarded-for'];
            const ip = typeof forwarded === 'string'
              ? forwarded.split(',')[0].trim()
              : (req.socket?.remoteAddress || null);

            enqueueRequestLog({
              method: req.method || 'GET',
              url: req.url || '/',
              pathname,
              status: res.statusCode || 200,
              durationMs,
              ip,
              userAgent: (req.headers['user-agent'] as string) || null,
              referer: (req.headers['referer'] as string) || null,
            });
          });
        }
      }
    }

    return (originalEmit as any).apply(this, [event, ...args]);
  };

  console.log('[REQUEST ANALYTICS] Real-time HTTP response-time logging hook initialized.');
}
