import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  id: 'default',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mitra_default_key',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mitra_default_key',
  currency: 'GBP',
  activeAccountName: 'MITRA Main UK Account (Barclays/Stripe)',
};

function maskSecretKey(key: string): string {
  if (!key) return '';
  if (key.includes('••••')) return key;
  if (key.length <= 8) return '••••••••';
  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}_••••••••••••${suffix}`;
}

export async function GET(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const settings = await prisma.paymentSettings.findUnique({
      where: { id: 'default' },
    });

    const active = settings || DEFAULT_SETTINGS;
    return NextResponse.json({
      success: true,
      data: {
        ...active,
        stripeSecretKey: maskSecretKey(active.stripeSecretKey),
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        ...DEFAULT_SETTINGS,
        stripeSecretKey: maskSecretKey(DEFAULT_SETTINGS.stripeSecretKey),
      },
    });
  }
}

export async function PUT(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stripePublishableKey, stripeSecretKey, currency, activeAccountName } = body;

    const current = await prisma.paymentSettings.findUnique({ where: { id: 'default' } });

    // Only update secret key if a new, unmasked key was provided
    let finalSecretKey = current?.stripeSecretKey || DEFAULT_SETTINGS.stripeSecretKey;
    if (stripeSecretKey && !stripeSecretKey.includes('••••') && stripeSecretKey.trim().length > 10) {
      finalSecretKey = stripeSecretKey.trim();
    }

    const updated = await prisma.paymentSettings.upsert({
      where: { id: 'default' },
      update: {
        stripePublishableKey: stripePublishableKey || DEFAULT_SETTINGS.stripePublishableKey,
        stripeSecretKey: finalSecretKey,
        currency: currency || 'GBP',
        activeAccountName: activeAccountName || 'MITRA Configured Stripe Account',
      },
      create: {
        id: 'default',
        stripePublishableKey: stripePublishableKey || DEFAULT_SETTINGS.stripePublishableKey,
        stripeSecretKey: finalSecretKey,
        currency: currency || 'GBP',
        activeAccountName: activeAccountName || 'MITRA Configured Stripe Account',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Stripe Payment Configuration & Payout Account Updated Successfully',
      data: {
        ...updated,
        stripeSecretKey: maskSecretKey(updated.stripeSecretKey),
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update Stripe payment settings';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
