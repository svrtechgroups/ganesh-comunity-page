import { Metadata } from 'next';
import { EventItem, BlogPost } from './types';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mitrauk.com';

export function constructMetadata({
  title = 'Mana Indian Telugu Roots Abroad (MITRA) | Official Website',
  description = 'The premier UK non-profit organization promoting Telugu language, culture, arts, community welfare, student counselling, and high-impact charitable programs across Great Britain.',
  image = '/assets/organizers-poster.jpg',
  canonical = '/',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${BASE_URL.replace(/\/$/, '')}${image.startsWith('/') ? '' : '/'}${image}`;

  return {
    title: `${title} | MITRA`,
    description,
    keywords: [
      'Mana Indian Telugu Roots Abroad',
      'MITRA',
      'Telugu Community UK',
      'London Telugu Events',
      'Ugadi Celebrations UK',
      'Telugu Charity UK',
      'Kuchipudi Dance London',
      'Telugu Student Help London',
    ],
    authors: [{ name: 'Mana Indian Telugu Roots Abroad IT Committee' }],
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Mana Indian Telugu Roots Abroad (MITRA)',
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
      creator: '@mitra_official',
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Mana Indian Telugu Roots Abroad',
    alternateName: 'MITRA',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/mitra_official',
      'https://linkedin.com/company/mitra-official',
      'https://facebook.com/ukteluguassociation',
      'https://youtube.com/@mitraofficial',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chiswick Park, 566 Chiswick High Rd',
      addressLocality: 'London',
      postalCode: 'W4 5YA',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44-20-8123-4567',
      contactType: 'customer service',
      email: 'info@mitra.org.uk',
    },
  };
}

export function generateEventJsonLd(event: EventItem) {
  const eventBanner = event.bannerUrl?.startsWith('http')
    ? event.bannerUrl
    : `${BASE_URL.replace(/\/$/, '')}${event.bannerUrl?.startsWith('/') ? '' : '/'}${event.bannerUrl || 'assets/organizers-poster.jpg'}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: `${event.date}T16:00:00+00:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: event.address,
    },
    image: [eventBanner],
    organizer: {
      '@type': 'Organization',
      name: 'Mana Indian Telugu Roots Abroad',
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: event.ticketPrice,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/events/${event.id}`,
    },
  };
}
