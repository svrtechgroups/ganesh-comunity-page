import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendPaymentFailureAlert } from '@/lib/email';
import Stripe from 'stripe';

/**
 * POST /api/payments/webhook
 *
 * Handles Stripe webhook events to keep our DB in sync with actual payment state.
 *
 * Events handled:
 *   • payment_intent.succeeded      → Payment.status = 'Completed'
 *   • payment_intent.payment_failed → Payment.status = 'Failed' + Email Alert + DB Log
 *   • payment_intent.canceled       → Payment.status = 'Failed' + DB Log
 */

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // Resolve the current Stripe Secret Key (DB → env)
  let stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  try {
    const settings = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });
    if (
      settings?.stripeSecretKey &&
      !settings.stripeSecretKey.includes('default_key') &&
      !settings.stripeSecretKey.includes('REPLACE_WITH')
    ) {
      stripeSecretKey = settings.stripeSecretKey;
    }
  } catch {
    // DB unavailable — use env var
  }

  if (!stripeSecretKey || stripeSecretKey.includes('REPLACE_WITH')) {
    await logger.warn('payments/webhook', 'Stripe webhook received but Stripe secret key is not configured');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-07-29.dahlia' });

  // Read the raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    if (!webhookSecret || webhookSecret.includes('REPLACE_WITH')) {
      if (process.env.NODE_ENV === 'production') {
        await logger.error('payments/webhook', 'STRIPE_WEBHOOK_SECRET is missing in production. Refusing to process unsigned webhook.');
        return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET must be configured in production.' }, { status: 500 });
      }
      await logger.warn('payments/webhook', 'No STRIPE_WEBHOOK_SECRET set — parsing event without signature (DEV mode only)');
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    await logger.error('payments/webhook', `Webhook signature verification failed: ${message}`, err);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Handle Events ─────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const meta = pi.metadata || {};
        const emailToLookup = (meta.customerEmail || pi.receipt_email || '').toLowerCase().trim();

        // 1. Resolve memberId by looking up email first, then fallback to metadata
        let resolvedMemberId: string | null = null;

        if (emailToLookup) {
          try {
            const memberByEmail = await prisma.member.findUnique({
              where: { email: emailToLookup },
            });
            if (memberByEmail) {
              resolvedMemberId = memberByEmail.id;
            }
          } catch (memErr) {
            console.warn(`[Webhook] Email member lookup notice:`, memErr);
          }
        }

        if (!resolvedMemberId && meta.memberId) {
          resolvedMemberId = String(meta.memberId).trim();
        }

        // Try to update existing pending record, or create a new one
        try {
          const existing = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: pi.id },
          });

          if (existing) {
            await prisma.payment.update({
              where: { id: existing.id },
              data: {
                status: 'Completed',
                ...(resolvedMemberId ? { memberId: resolvedMemberId } : {}),
              },
            });
            await logger.paymentSuccess('payments/webhook', `Payment succeeded: £${existing.amount} (${existing.customerName} <${existing.customerEmail}>)`, {
              paymentIntentId: pi.id,
              paymentId: existing.id,
              amount: existing.amount,
              customerEmail: existing.customerEmail,
              customerName: existing.customerName,
              donationType: existing.donationType,
              eventName: existing.eventName,
            });
          } else {
            // Fallback: create from PaymentIntent metadata
            const metaEmail = meta.customerEmail || pi.receipt_email || '';
            const created = await prisma.payment.create({
              data: {
                amount: pi.amount / 100,
                currency: pi.currency.toUpperCase(),
                status: 'Completed',
                customerName: meta.customerName || 'Unknown Devotee',
                customerEmail: metaEmail,
                customerPhone: meta.customerPhone || null,
                description: pi.description || 'MITRA Community Contribution',
                paymentMethod: meta.paymentMethod || 'Stripe',
                stripePaymentIntentId: pi.id,
                memberId: resolvedMemberId || meta.memberId || null,
                eventId: meta.eventId || null,
                eventName: meta.eventName || null,
                donationType: meta.donationType ? String(meta.donationType).toLowerCase().trim() : null,
                poojaCategory: meta.poojaCategory ? String(meta.poojaCategory).trim() : null,
                poojaDate: meta.poojaDate || null,
                poojaDay: meta.poojaDay || null,
                poojaTitle: meta.poojaTitle || null,
                gotram: meta.gotram || null,
                familyMembers: meta.familyMembers || null,
                specialWishes: meta.specialWishes || null,
                primaryDevoteeName: meta.primaryDevoteeName || meta.customerName || null,
              },
            });
            await logger.paymentSuccess('payments/webhook', `Payment succeeded (fallback created): £${created.amount} (${created.customerName} <${created.customerEmail}>)`, {
              paymentIntentId: pi.id,
              paymentId: created.id,
              amount: created.amount,
              customerEmail: created.customerEmail,
            });
          }
        } catch (dbErr) {
          await logger.error('payments/webhook', `DB update error on payment_intent.succeeded for PI ${pi.id}`, dbErr);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const meta = pi.metadata || {};
        const lastError = pi.last_payment_error;

        const failureReason = lastError?.message || 'Payment intent failed during charge processing';
        const declineCode = lastError?.decline_code || lastError?.code || 'card_declined';
        const devoteeName = meta.customerName || meta.primaryDevoteeName || 'Devotee';
        const devoteeEmail = meta.customerEmail || pi.receipt_email || 'Not Provided';
        const devoteePhone = meta.customerPhone || 'Not Provided';
        const amount = (pi.amount || 0) / 100;
        const currency = (pi.currency || 'GBP').toUpperCase();
        const cause = meta.eventName || meta.poojaTitle || meta.donationType || pi.description || 'MITRA Contribution';

        // 1. Mark DB record as Failed
        try {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: pi.id },
            data: { status: 'Failed' },
          });
        } catch (dbErr) {
          console.error('[Webhook] DB update error on failed:', dbErr);
        }

        // 2. Log structured failure to SystemLog
        await logger.paymentFailure('payments/webhook', `Payment failed: £${amount} ${currency} from ${devoteeName} (${failureReason})`, {
          paymentIntentId: pi.id,
          amount,
          currency,
          customerName: devoteeName,
          customerEmail: devoteeEmail,
          customerPhone: devoteePhone,
          cause,
          declineCode,
          failureReason,
          stripeError: lastError,
        });

        // 3. Send Email Alert to REPORT_MAIL
        try {
          await sendPaymentFailureAlert({
            customerName: devoteeName,
            customerEmail: devoteeEmail,
            customerPhone: devoteePhone,
            amount,
            currency,
            cause,
            paymentIntentId: pi.id,
            failureReason,
            declineCode,
            errorCode: lastError?.code,
            source: 'Stripe Webhook (payment_intent.payment_failed)',
            metadata: meta,
            timestamp: new Date().toISOString(),
          });
        } catch (emailErr) {
          await logger.error('payments/webhook', `Failed sending payment failure email alert for PI ${pi.id}`, emailErr);
        }

        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const meta = pi.metadata || {};

        try {
          await prisma.payment.updateMany({
            where: { stripePaymentIntentId: pi.id },
            data: { status: 'Failed' },
          });
        } catch {}

        await logger.warn('payments/webhook', `PaymentIntent canceled: ${pi.id} (Cancellation reason: ${pi.cancellation_reason || 'Unknown'})`, {
          paymentIntentId: pi.id,
          metadata: meta,
          cancellationReason: pi.cancellation_reason,
        });
        break;
      }

      default:
        await logger.info('payments/webhook', `Stripe event ignored: ${event.type}`, { eventId: event.id });
        break;
    }
  } catch (err) {
    await logger.error('payments/webhook', `Webhook handler runtime error: ${err instanceof Error ? err.message : String(err)}`, err);
  }

  return NextResponse.json({ received: true });
}
