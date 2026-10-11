import { Metadata } from 'next';
import { EventItem, BlogPost } from './types';
import siteData from '@/data/site-metadata.json';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mitrauk.com';

export function constructMetadata({
  title = siteData.title,
  description = siteData.description,
  image = siteData.defaultImage,
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
    keywords: siteData.keywords,
    authors: siteData.authors,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteData.siteName,
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
      creator: siteData.twitterCreator,
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
    name: siteData.organization.name,
    alternateName: siteData.organization.alternateName,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: siteData.organization.sameAs,
    address: {
      '@type': 'PostalAddress',
      ...siteData.organization.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      ...siteData.organization.contactPoint,
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
