import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { constructMetadata, generateOrganizationJsonLd } from '@/lib/seo-config';
import { AuthProvider } from '@/lib/auth-context';
import { getFeaturedEventForMetadata } from '@/lib/seo-server';

export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  const currentEvent = await getFeaturedEventForMetadata();

  if (currentEvent && currentEvent.bannerUrl) {
    return constructMetadata({
      title: `${currentEvent.title} | MITRA UK`,
      description: currentEvent.description || undefined,
      image: currentEvent.bannerUrl,
      canonical: '/',
    });
  }

  return constructMetadata();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="en-GB" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@500;700;900&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#FFF8F0] text-[#3D1A00] font-['Plus_Jakarta_Sans',sans-serif] min-h-screen flex flex-col justify-between selection:bg-[#E65C00] selection:text-[#FFFFFF]">
        <AuthProvider>
          <AnalyticsTracker />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
