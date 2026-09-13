import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default-settings',
          siteTitle: 'Mana Indian Telugu Roots Abroad (MITRA)',
          tagline: 'Serving and Connecting the Telugu Community in the United Kingdom',
          contactEmail: 'info@mitra.org.uk',
          contactPhone: '+44 20 8123 4567',
          address: 'MITRA Centre, Chiswick Park, 566 Chiswick High Rd, London W4 5YA, United Kingdom',
          twitterUrl: 'https://twitter.com/mitra_official',
          linkedinUrl: 'https://linkedin.com/company/mitra-official',
          facebookUrl: 'https://facebook.com/ukteluguassociation',
          instagramUrl: 'https://instagram.com/mitra_official',
          youtubeUrl: 'https://youtube.com/@mitraofficial',
          googleAnalyticsId: 'G-MITRA2026SEO',
          enableTracking: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to get site settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve site settings',
      },
      { status: 500 }
    );
  }
}
