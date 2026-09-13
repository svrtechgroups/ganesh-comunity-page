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
    console.error('Admin failed to get site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      siteTitle,
      tagline,
      contactEmail,
      contactPhone,
      address,
      twitterUrl,
      linkedinUrl,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      googleAnalyticsId,
      enableTracking,
    } = body;

    let settings = await prisma.siteSettings.findFirst();
    const settingsId = settings ? settings.id : 'default-settings';

    const updated = await prisma.siteSettings.upsert({
      where: { id: settingsId },
      update: {
        ...(siteTitle !== undefined && { siteTitle }),
        ...(tagline !== undefined && { tagline }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(address !== undefined && { address }),
        ...(twitterUrl !== undefined && { twitterUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(googleAnalyticsId !== undefined && { googleAnalyticsId }),
        ...(enableTracking !== undefined && { enableTracking: Boolean(enableTracking) }),
      },
      create: {
        id: 'default-settings',
        siteTitle: siteTitle || 'Mana Indian Telugu Roots Abroad (MITRA)',
        tagline: tagline || 'Serving and Connecting the Telugu Community in the United Kingdom',
        contactEmail: contactEmail || 'info@mitra.org.uk',
        contactPhone: contactPhone || '+44 20 8123 4567',
        address: address || 'MITRA Centre, London',
        twitterUrl: twitterUrl || '',
        linkedinUrl: linkedinUrl || '',
        facebookUrl: facebookUrl || '',
        instagramUrl: instagramUrl || '',
        youtubeUrl: youtubeUrl || '',
        googleAnalyticsId: googleAnalyticsId || '',
        enableTracking: enableTracking !== undefined ? Boolean(enableTracking) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Failed to update site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
