import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const eventId = params.id;

  let event = null;
  try {
    event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      // Fallback matching by ID or title slug
      const decoded = decodeURIComponent(eventId).replace(/-/g, ' ');
      event = await prisma.event.findFirst({
        where: {
          OR: [
            { id: { equals: eventId, mode: 'insensitive' } },
            { title: { contains: decoded, mode: 'insensitive' } },
          ],
        },
      });
    }
  } catch (e) {
    console.error('[METADATA EVENT LOOKUP ERROR]:', e);
  }

  // Detect Host / Base URL from incoming request headers
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const baseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mitrauk.com');

  if (!event) {
    return {
      title: 'Event Details | MITRA UK',
      description: 'Mana Indian Telugu Roots Abroad - Official Community Event.',
    };
  }

  // Ensure absolute URL for WhatsApp & social platforms
  let posterUrl = event.bannerUrl || '/assets/organizers-poster.jpg';
  if (!posterUrl.startsWith('http://') && !posterUrl.startsWith('https://')) {
    const cleanPath = posterUrl.startsWith('/') ? posterUrl : `/${posterUrl}`;
    posterUrl = `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
  }

  const title = `${event.title} | MITRA UK`;
  const cleanDesc = event.description
    ? event.description.replace(/[\r\n]+/g, ' ').trim()
    : `Join us for ${event.title} on ${event.date} at ${event.venue}. Book your passes on MITRA UK.`;
  const description = cleanDesc.length > 200 ? `${cleanDesc.substring(0, 197)}...` : cleanDesc;
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}/events/${event.id}`;

  const imageMime = posterUrl.toLowerCase().endsWith('.png')
    ? 'image/png'
    : posterUrl.toLowerCase().endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/events/${event.id}`,
    },
    openGraph: {
      title: event.title,
      description,
      url: canonicalUrl,
      siteName: 'MITRA UK · Mana Indian Telugu Roots Abroad',
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: posterUrl,
          secureUrl: posterUrl,
          width: 1200,
          height: 630,
          alt: `${event.title} Poster`,
          type: imageMime,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [posterUrl],
      creator: '@mitra_official',
    },
  };
}

export default function EventLayout({ children }: Props) {
  return <>{children}</>;
}
