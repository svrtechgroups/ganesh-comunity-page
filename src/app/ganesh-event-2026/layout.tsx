import type { Metadata } from 'next';
import { headers } from 'next/headers';

interface Props {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const baseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mitrauk.com');

  const posterUrl = `${baseUrl.replace(/\/$/, '')}/assets/organizers-poster.jpg`;
  const title = 'London Ganesh Mahotsav 2026 | MITRA UK';
  const description =
    'London’s largest Maha Ganapathi Mahotsav in Slough (13-20 Sep 2026). Daily Sthapana puja, Aarti, cultural performances, and Mahaprasadam.';

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/ganesh-event-2026',
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/ganesh-event-2026`,
      siteName: 'MITRA UK · Mana Indian Telugu Roots Abroad',
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: posterUrl,
          secureUrl: posterUrl,
          width: 1200,
          height: 630,
          alt: 'London Ganesh Mahotsav 2026 Festival Poster',
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [posterUrl],
      creator: '@mitra_official',
    },
  };
}

export default function GaneshEventLayout({ children }: Props) {
  return <>{children}</>;
}
