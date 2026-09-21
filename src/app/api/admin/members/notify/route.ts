import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderEmailLayout } from '@/lib/email';
import { enqueueEmails, EmailQueuePayload } from '@/lib/email-queue';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      subject,
      title,
      message,
      imageUrl,
      badgeText = 'MITRA Community Announcement',
      buttonText,
      buttonUrl,
      targetAudience = 'all',
    } = body;

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mitra.org.uk';
    const resolvedImageUrl = imageUrl?.trim()
      ? (imageUrl.startsWith('http') ? imageUrl.trim() : `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl.trim()}`)
      : null;

    // Build member query
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
        { success: false, error: 'No members found in database matching the criteria.' },
        { status: 404 }
      );
    }

    const displayTitle = title?.trim() || subject.trim();
    const campaignId = `camp-member-notify-${Date.now()}`;
    const payloadsToQueue: EmailQueuePayload[] = [];

    // Prepare email payloads
    for (const member of members) {
      if (!member.email || !member.email.includes('@')) {
        continue;
      }

      const memberName = member.fullName || 'Valued Devotee';
      const memberEmail = member.email.trim();
      const memberTier = member.tier || 'Annual Member';
      const memberId = member.id || '';

      // Personalize message content with placeholders
      let personalizedMessage = message
        .replace(/\{\{\s*name\s*\}\}/gi, memberName)
        .replace(/\{\{\s*fullName\s*\}\}/gi, memberName)
        .replace(/\{\{\s*email\s*\}\}/gi, memberEmail)
        .replace(/\{\{\s*tier\s*\}\}/gi, memberTier)
        .replace(/\{\{\s*id\s*\}\}/gi, memberId)
        .replace(/\{\{\s*memberId\s*\}\}/gi, memberId);

      // Replace inline markdown images ![alt](url)
      personalizedMessage = personalizedMessage.replace(/!\[(.*?)\]\((.*?)\)/g, (_match: any, alt: any, url: string) => {
        const fullImgUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        return `<div style="text-align: center; margin: 18px 0;"><img src="${fullImgUrl}" alt="${alt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #EAD8C7;" /></div>`;
      });

      // Convert line breaks to HTML paragraphs
      const formattedBodyHtml = personalizedMessage
        .split('\n\n')
        .map((p: string) => `<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7; color: #2D231E;">${p.replace(/\n/g, '<br/>')}</p>`)
        .join('');

      const actionButtonHtml = buttonText && buttonUrl ? `
        <div style="text-align: center; margin: 28px 0 12px;">
          <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #EA580C 0%, #F97316 100%); color: #FFFFFF; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 28px; border-radius: 9999px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);">
            ${buttonText} →
          </a>
        </div>
      ` : '';

      const imageBannerHtml = resolvedImageUrl ? `
        <div style="text-align: center; margin-bottom: 22px;">
          <img src="${resolvedImageUrl}" alt="${displayTitle}" style="max-width: 100%; height: auto; border-radius: 14px; border: 1px solid #EAD8C7; box-shadow: 0 4px 14px rgba(61,26,0,0.08); display: block; margin: 0 auto;" />
        </div>
      ` : '';

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
        campaignType: 'member_announcement',
        campaignId,
      });
    }

    // Bulk insert into EmailQueue in chunks of 500 max
    const { totalQueued, chunksProcessed } = await enqueueEmails(payloadsToQueue);

    await logger.info(
      'admin/members/notify',
      `Member Notification Broadcast Queued: "${subject}" queued for ${totalQueued}/${members.length} members across ${chunksProcessed} chunk(s)`,
      {
        subject,
        badgeText,
        targetAudience,
        totalRecipients: members.length,
        totalQueued,
        chunksProcessed,
        campaignId,
      }
    );

    // Return immediate response to the client
    return NextResponse.json({
      success: true,
      message: `Successfully queued notifications for ${totalQueued} member(s). Background worker is dispatching 10 emails every 20 seconds.`,
      campaignId,
      stats: {
        totalRecipients: members.length,
        sentCount: totalQueued,
        queuedCount: totalQueued,
        failedCount: 0,
        chunks: chunksProcessed,
        workerIntervalSeconds: 20,
        batchSize: 10,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN NOTIFY MEMBERS ERROR]:', error);
    await logger.error(
      'admin/members/notify',
      `Failed to send broadcast notifications: ${error?.message || error}`
    );
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal error broadcasting notification.' },
      { status: 500 }
    );
  }
}
