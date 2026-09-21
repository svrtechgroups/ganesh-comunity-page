import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderEmailLayout } from '@/lib/email';
import {
  enqueueEmails,
  processEmailQueueTick,
  getEmailQueueStats,
  startEmailQueueWorker,
  stopEmailQueueWorker,
  EmailQueuePayload,
} from '@/lib/email-queue';

export const dynamic = 'force-dynamic';

/**
 * POST /api/email-queue
 * 
 * Trigger & Bulk Insertion API:
 * 1. Accepts either a raw array of email payloads or a campaign configuration for target members.
 * 2. Fetches target users when a target audience is specified.
 * 3. Prepares personalized email payloads.
 * 4. Chunks into 500 items max to protect memory.
 * 5. Bulk inserts into the EmailQueue table using prisma.emailQueue.createMany (with skipDuplicates: true).
 * 6. Returns an immediate response to the client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      // Direct raw payloads option
      emails,

      // Campaign trigger option
      targetAudience = 'all',
      subject,
      title,
      message,
      imageUrl,
      badgeText = 'MITRA Community Announcement',
      buttonText,
      buttonUrl,
      campaignType = 'broadcast',
      campaignId = `camp-${Date.now()}`,
    } = body;

    let payloadsToQueue: EmailQueuePayload[] = [];

    // Case 1: Direct payloads passed
    if (Array.isArray(emails) && emails.length > 0) {
      payloadsToQueue = emails.map((item) => ({
        email: String(item.email || '').trim(),
        subject: String(item.subject || '').trim(),
        html: String(item.html || ''),
        campaignType: item.campaignType || campaignType,
        campaignId: item.campaignId || campaignId,
      }));
    } else {
      // Case 2: Target Audience Campaign Trigger
      if (!subject || !subject.trim()) {
        return NextResponse.json(
          { success: false, error: 'Email subject is required.' },
          { status: 400 }
        );
      }

      if (!message || !message.trim()) {
        return NextResponse.json(
          { success: false, error: 'Message content / template is required.' },
          { status: 400 }
        );
      }

      // 1. Fetch Target Users from Database
      const where: any = {};
      if (targetAudience === 'active') {
        where.status = 'Active';
      } else if (targetAudience && targetAudience !== 'all') {
        where.tier = { contains: targetAudience, mode: 'insensitive' };
      }

      const members = await prisma.member.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          tier: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!members || members.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No target recipients found matching the criteria.' },
          { status: 404 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mitrauk.com';
      const resolvedImageUrl = imageUrl?.trim()
        ? (imageUrl.startsWith('http') ? imageUrl.trim() : `${baseUrl.replace(/\/$/, '')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl.trim()}`)
        : null;

      const displayTitle = title?.trim() || subject.trim();

      // 2. Prepare Email Payloads
      for (const member of members) {
        if (!member.email || !member.email.includes('@')) {
          continue;
        }

        const memberName = member.fullName || 'Valued Devotee';
        const memberEmail = member.email.trim();
        const memberTier = member.tier || 'Annual Member';
        const memberId = member.id || '';

        // Personalize message placeholders
        let personalizedMessage = message
          .replace(/\{\{\s*name\s*\}\}/gi, memberName)
          .replace(/\{\{\s*fullName\s*\}\}/gi, memberName)
          .replace(/\{\{\s*email\s*\}\}/gi, memberEmail)
          .replace(/\{\{\s*tier\s*\}\}/gi, memberTier)
          .replace(/\{\{\s*id\s*\}\}/gi, memberId)
          .replace(/\{\{\s*memberId\s*\}\}/gi, memberId);

        // Convert inline markdown images ![alt](url)
        personalizedMessage = personalizedMessage.replace(
          /!\[(.*?)\]\((.*?)\)/g,
          (_match: any, alt: any, url: string) => {
            const fullImgUrl = url.startsWith('http')
              ? url
              : `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
            return `<div style="text-align: center; margin: 18px 0;"><img src="${fullImgUrl}" alt="${alt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #EAD8C7;" /></div>`;
          }
        );

        // Convert line breaks to HTML paragraphs
        const formattedBodyHtml = personalizedMessage
          .split('\n\n')
          .map(
            (p: string) =>
              `<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7; color: #2D231E;">${p.replace(/\n/g, '<br/>')}</p>`
          )
          .join('');

        const actionButtonHtml =
          buttonText && buttonUrl
            ? `
          <div style="text-align: center; margin: 28px 0 12px;">
            <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #EA580C 0%, #F97316 100%); color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 28px; border-radius: 9999px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);">
              ${buttonText} →
            </a>
          </div>
        `
            : '';

        const imageBannerHtml = resolvedImageUrl
          ? `
          <div style="text-align: center; margin-bottom: 22px;">
            <img src="${resolvedImageUrl}" alt="${displayTitle}" style="max-width: 100%; height: auto; border-radius: 14px; border: 1px solid #EAD8C7; box-shadow: 0 4px 14px rgba(61,26,0,0.08); display: block; margin: 0 auto;" />
          </div>
        `
          : '';

        const contentHtml = `
          <div style="font-family: inherit;">
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #EA580C; text-transform: uppercase; letter-spacing: 1px;">
                Namaste, ${memberName}
              </p>
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 900; color: #3D1A00; line-height: 1.3; font-family: 'Cinzel', Georgia, serif;">
                ${displayTitle}
              </h2>
            </div>

            ${imageBannerHtml}

            <div style="background: #FFFDF9; border: 1px solid #F3E8DF; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
              ${formattedBodyHtml}
              ${actionButtonHtml}
            </div>

            <div style="background: #FFF7ED; border-left: 4px solid #EA580C; padding: 12px 16px; border-radius: 0 12px 12px 0; font-size: 12px; color: #7C2D12;">
              <p style="margin: 0;">
                <strong>Member Record:</strong> ${memberTier} · ID: <code style="font-family: monospace; font-size: 11px;">${memberId}</code>
              </p>
            </div>
          </div>
        `;

        const fullHtml = renderEmailLayout({
          pageTitle: subject.trim(),
          badgeText: badgeText.trim(),
          children: contentHtml,
          footerNote: 'You received this official notice as a registered member of MITRA UK.',
        });

        payloadsToQueue.push({
          email: memberEmail,
          subject: subject.trim(),
          html: fullHtml,
          campaignType,
          campaignId,
        });
      }
    }

    if (payloadsToQueue.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid recipient email addresses found to enqueue.' },
        { status: 400 }
      );
    }

    // 3. Bulk insert into EmailQueue in chunks of 500 items max
    const { totalQueued, chunksProcessed } = await enqueueEmails(payloadsToQueue);

    // 4. Return an immediate response to the client
    return NextResponse.json({
      success: true,
      message: `Successfully enqueued ${totalQueued} emails across ${chunksProcessed} chunk(s). The background worker will send 10 emails every 20 seconds.`,
      campaignId,
      queuedCount: totalQueued,
      chunks: chunksProcessed,
      workerIntervalSeconds: 20,
      batchSize: 10,
    });
  } catch (error: any) {
    console.error('[TRIGGER EMAIL QUEUE ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to enqueue emails' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email-queue
 * Returns queue status, pending/sent/failed counts, and recent queue entries.
 */
export async function GET() {
  try {
    const stats = await getEmailQueueStats();

    const recentPending = await prisma.emailQueue.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        id: true,
        email: true,
        subject: true,
        status: true,
        tryCount: true,
        campaignType: true,
        campaignId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        workerConfig: {
          intervalSeconds: 20,
          batchSize: 10,
          chunkSize: 500,
        },
        recentPending,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve queue stats' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/email-queue
 * Trigger a manual tick or manage worker state.
 */
export async function PUT(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'process_now') {
      const result = await processEmailQueueTick();
      return NextResponse.json({
        success: true,
        message: `Processed manual tick: ${result.succeeded} sent, ${result.failed} failed.`,
        result,
      });
    }

    if (action === 'start_worker') {
      const started = startEmailQueueWorker();
      return NextResponse.json({
        success: true,
        message: started ? 'Worker started.' : 'Worker was already running.',
      });
    }

    if (action === 'stop_worker') {
      const stopped = stopEmailQueueWorker();
      return NextResponse.json({
        success: true,
        message: stopped ? 'Worker stopped.' : 'Worker was not running.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Supported: process_now, start_worker, stop_worker' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Action failed' },
      { status: 500 }
    );
  }
}
