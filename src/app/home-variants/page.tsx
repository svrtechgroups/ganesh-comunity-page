'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Monitor, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Eye, 
  Award,
  Info
} from 'lucide-react';

import Header from '@/components/Header';
import HomeVariantCultural from '@/components/homepages/HomeVariantCultural';
import HomeVariantHeritage from '@/components/homepages/HomeVariantHeritage';
import HomeVariantWelfare from '@/components/homepages/HomeVariantWelfare';
import HomeVariantBusiness from '@/components/homepages/HomeVariantBusiness';
import { HOME_VARIANTS, HomeVariantId } from '@/components/homepages/types';

type ViewportSize = 'full' | 'desktop' | 'laptop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  full: 'w-full',
  desktop: 'max-w-[1440px]',
  laptop: 'max-w-[1200px]',
  tablet: 'max-w-[1024px]',
  mobile: 'max-w-[390px]',
};

export default function HomeVariantsShowcasePage() {
  const [selectedVariant, setSelectedVariant] = useState<HomeVariantId>('cultural');
  const [selectedViewport, setSelectedViewport] = useState<ViewportSize>('full');

  const activeInfo = HOME_VARIANTS.find(v => v.id === selectedVariant) || HOME_VARIANTS[0];

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
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E3] to-[#FFF8F0] text-[#3D1A00] pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* ── 1. SHOWCASE HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3D1A00] via-[#5A2303] to-[#7A1620] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#FF7A00_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFD8A8]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD8A8]" />
            <span>MITRA UK · Post-Event Home Page Showcase</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-wide leading-tight">
            Preview 4 Post-Event Home Pages
          </h1>

          <p className="text-xs sm:text-sm text-[#FFF0DD]/90 max-w-3xl mx-auto leading-relaxed">
            Four distinct, beautifully crafted post-event home page concepts designed with the authentic warm saffron and ivory temple aesthetic of MITRA UK, complete with the site&apos;s official navigation header.
          </p>
        </div>
      </section>

      {/* ── 2. CONCEPT CARDS SWITCHER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOME_VARIANTS.map((v, index) => {
            const isSelected = selectedVariant === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-white border-[#E65C00] shadow-[0_12px_36px_rgba(230,92,0,0.22)] -translate-y-2'
                    : 'bg-white/90 border-[#E65C00]/20 hover:border-[#E65C00]/60 hover:bg-white hover:-translate-y-1'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/20">
                      Option {index + 1}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#E65C00]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-black font-cinzel text-base text-[#3D1A00] leading-snug">
                    {v.name}
                  </h3>

                  <p className="text-xs text-[#6B3A2A] leading-relaxed line-clamp-2">
                    {v.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E65C00]/15 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#E65C00] text-[11px]">
                    {isSelected ? '● Currently Previewing' : 'Click to Preview'}
                  </span>
                  <Link
                    href={v.routePath}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[#6B3A2A] hover:text-[#E65C00] font-bold"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. PREVIEW CONTROL TOOLBAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E65C00]/30 shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center font-black font-cinzel text-lg border border-[#E65C00]/30">
              {activeInfo.id.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black font-cinzel text-sm text-[#3D1A00]">{activeInfo.name}</h4>
                <span className="text-[10px] font-bold text-[#E65C00] bg-[#FFF0E0] px-2 py-0.5 rounded-md">
                  {activeInfo.badge}
                </span>
              </div>
              <p className="text-xs text-[#6B3A2A] mt-0.5">{activeInfo.tagline}</p>
            </div>
          </div>

          {/* Viewport Width Controls */}
          <div className="flex items-center gap-1.5 bg-[#FFF0E0]/60 p-1.5 rounded-xl border border-[#E65C00]/20">
            <span className="text-[11px] font-bold text-[#6B3A2A] px-2 hidden sm:inline">Viewport:</span>
            
            <button
              onClick={() => setSelectedViewport('full')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedViewport === 'full' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-[#6B3A2A] hover:bg-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full</span>
            </button>

            <button
              onClick={() => setSelectedViewport('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedViewport === 'desktop' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-[#6B3A2A] hover:bg-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1440px</span>
            </button>

            <button
              onClick={() => setSelectedViewport('laptop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedViewport === 'laptop' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-[#6B3A2A] hover:bg-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1200px</span>
            </button>

            <button
              onClick={() => setSelectedViewport('tablet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedViewport === 'tablet' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-[#6B3A2A] hover:bg-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setSelectedViewport('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedViewport === 'mobile' ? 'bg-[#E65C00] text-white shadow-sm' : 'text-[#6B3A2A] hover:bg-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <Link
            href={activeInfo.routePath}
            className="gold-button px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Clean Fullscreen</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>

        </div>
      </section>

      {/* ── 4. LIVE INTERACTIVE VIEWPORT PREVIEW (WITH REAL EXISTING HEADER) ── */}
      <section className="mt-8 px-2 sm:px-4 flex justify-center">
        <div
          className={`${VIEWPORT_WIDTHS[selectedViewport]} w-full transition-all duration-300 rounded-3xl overflow-hidden border-4 border-[#3D1A00]/20 shadow-2xl bg-[#FFF8F0] relative`}
        >
          {/* Mock Browser Frame (When viewport scaled) */}
          {selectedViewport !== 'full' && (
            <div className="bg-[#2A1705] text-white/70 px-4 py-2 flex items-center justify-between text-xs border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              </div>
              <div className="font-mono text-[11px] text-white/50">
                preview.mitra-uk.org · {activeInfo.name} ({selectedViewport})
              </div>
              <div className="text-[10px] text-[#FF9A3C]">Real Site Header &amp; Body</div>
            </div>
          )}

          {/* Renders the EXACT existing Header at the top of the preview */}
          <div className="border-b border-[#E65C00]/20">
            <Header previewMode={true} />
          </div>

          {/* Rendered Live Component */}
          <div>
            {renderVariant(selectedVariant)}
          </div>
        </div>
      </section>

      {/* ── 5. CONCEPT COMPARISON MATRIX ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-black font-cinzel text-[#E65C00] tracking-widest uppercase">
            SUMMARY BREAKDOWN
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-cinzel gold-foil-text">
            4 Tailored Post-Event Concepts
          </h2>
          <p className="text-xs sm:text-sm text-[#6B3A2A]">
            Choose any concept to preview in full screen or adapt for the live home page after the festival.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOME_VARIANTS.map((v, index) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-[#E65C00]/25 p-6 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E65C00] bg-[#FFF0E0] px-2.5 py-1 rounded-full inline-block">
                  Option {index + 1}
                </span>
                <h3 className="text-base font-black font-cinzel text-[#3D1A00]">{v.name}</h3>
                <p className="text-xs text-[#6B3A2A]">{v.description}</p>
                <ul className="space-y-1.5 text-xs text-[#3D1A00] pt-2">
                  {v.keySections.slice(0, 4).map((sec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E65C00] shrink-0 mt-0.5" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E65C00]/15 space-y-2">
                <button
                  onClick={() => {
                    setSelectedVariant(v.id);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold border border-[#E65C00] text-[#E65C00] hover:bg-[#FFF0E0] transition-colors"
                >
                  Preview Option {index + 1}
                </button>
                <Link
                  href={v.routePath}
                  className="w-full gold-button py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 text-center"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
