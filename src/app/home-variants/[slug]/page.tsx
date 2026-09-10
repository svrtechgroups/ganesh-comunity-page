import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ChevronRight, Layers } from 'lucide-react';
import HomeVariantCultural from '@/components/homepages/HomeVariantCultural';
import HomeVariantHeritage from '@/components/homepages/HomeVariantHeritage';
import HomeVariantWelfare from '@/components/homepages/HomeVariantWelfare';
import HomeVariantBusiness from '@/components/homepages/HomeVariantBusiness';
import { HOME_VARIANTS, HomeVariantId } from '@/components/homepages/types';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return [
    { slug: 'cultural' },
    { slug: 'heritage' },
    { slug: 'welfare' },
    { slug: 'business' },
    // aliases for backward compatibility
    { slug: 'network' },
    { slug: 'magazine' },
  ];
}

export default function HomeVariantDetailPage({ params }: PageProps) {
  const { slug } = params;

  // Resolve alias
  const resolvedSlug: HomeVariantId = 
    slug === 'network' ? 'business' :
    slug === 'magazine' ? 'heritage' :
    (slug as HomeVariantId);

  const currentVariant = HOME_VARIANTS.find(v => v.id === resolvedSlug);

  if (!currentVariant) {
    notFound();
  }

  const renderVariant = (id: HomeVariantId) => {
    switch (id) {
      case 'cultural':
        return <HomeVariantCultural />;
      case 'heritage':
        return <HomeVariantHeritage />;
      case 'welfare':
        return <HomeVariantWelfare />;
      case 'business':
        return <HomeVariantBusiness />;
      default:
        return <HomeVariantCultural />;
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* Render the full-page variant directly under the existing site Header */}
      <div>
        {renderVariant(currentVariant.id)}
      </div>

      {/* ── Discreet Floating Switcher Pill at Bottom (NO localStorage) ── */}
      <div className="fixed bottom-5 right-5 z-40 bg-[#3D1A00]/95 backdrop-blur-md text-white border border-[#E65C00]/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs">
        <Link
          href="/home-variants"
          className="inline-flex items-center gap-1.5 text-[#FFD8A8] hover:text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Concepts</span>
        </Link>
        <span className="text-white/30">|</span>
        <div className="flex items-center gap-1">
          {HOME_VARIANTS.map((v) => (
            <Link
              key={v.id}
              href={v.routePath}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                v.id === currentVariant.id
                  ? 'bg-[#E65C00] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {v.id === 'cultural' ? '1. Cultural' : v.id === 'heritage' ? '2. Heritage' : v.id === 'welfare' ? '3. Welfare' : '4. Business'}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
