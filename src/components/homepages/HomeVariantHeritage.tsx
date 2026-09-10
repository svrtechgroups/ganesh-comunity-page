'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Flame, 
  Calendar, 
  Heart, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Play, 
  BookOpen, 
  Camera, 
  GraduationCap, 
  Users, 
  ExternalLink 
} from 'lucide-react';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';

export default function HomeVariantHeritage() {
  const FESTIVAL_DAYS = [
    {
      day: 'Day 1 · 13th Sept',
      title: 'Prana Pratishtha & Maha Sankalpam',
      telugu: 'ప్రాణ ప్రతిష్ఠ & మహా సంకల్పం',
      desc: 'Invoking divine presence into the 21-ft eco-friendly clay Ganesha with Vedic chants by 7 vedic scholars.',
      badge: 'Sacred Consecration'
    },
    {
      day: 'Day 2 · 14th Sept',
      title: 'Siddhi Vinayaka & Youth Sankalpam',
      telugu: 'సిద్ధి వినాయక పూజ',
      desc: 'Special blessings for children and young students for academic focus and auspicious beginnings.',
      badge: 'Youth & Family'
    },
    {
      day: 'Day 3 · 15th Sept',
      title: 'Vidya Ganapathi Special Archana',
      telugu: 'విద్యా గణపతి విశేషార్చన',
      desc: 'Pen, notebook, and textbook samprokshana with Saraswati stotram recitals for school & university students.',
      badge: 'Academic Seva'
    },
    {
      day: 'Day 4 · 16th Sept',
      title: 'Arogya Ganapathi & Ayushya Homam',
      telugu: 'ఆరోగ్య గణపతి & ఆయుష్య హోమం',
      desc: 'Prayers for health, well-being, and longevity for parents and elderly community members.',
      badge: 'Health & Healing'
    },
    {
      day: 'Day 5 · 17th Sept',
      title: 'Maha Annadanam & Classical Arts',
      telugu: 'మహా అన్నదానం & నాట్య వేడుక',
      desc: 'Over 8,000 devotees served sanctified satvik bhojanam alongside non-stop Kuchipudi recitals.',
      badge: 'Annadanam Seva'
    },
    {
      day: 'Day 6 · 18th Sept',
      title: 'Maha Laddu Prasadam Auction',
      telugu: 'మహా లడ్డూ ప్రసాదం వేలం',
      desc: 'Historic community auction with proceeds supporting MITRA UK student emergency relief fund.',
      badge: 'Divine Prasadam'
    },
    {
      day: 'Day 7 · 20th Sept',
      title: 'Utsava Ganapathi Grand Visarjan',
      telugu: 'మహా నిమజ్జనం & శోభాయాత్ర',
      desc: 'Spectacular dhol-tasha, kolatam, flower showers, and eco-friendly water immersion in Slough.',
      badge: 'Grand Visarjan'
    }
  ];

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen selection:bg-[#E65C00] selection:text-white">
      
      {/* ── 1. COMMEMORATIVE HERO WITH SACRED GLOW ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF0E0] to-[#FFF8F0] text-[#3D1A00] pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E65C00]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E65C00]/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-md text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
              <span>DIVINE BLESSINGS · LONDON GANESH MAHOTSAV 2026</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black font-cinzel leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
                A HISTORIC TRIUMPH OF DEVOTION
              </h1>
              <h2 className="text-lg sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
                21-FOOT ECO-FRIENDLY CLAY GANESHA
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#6B3A2A] leading-relaxed max-w-xl mx-auto lg:mx-0">
              MITRA UK extends our heartfelt gratitude to the 40,000+ devotees, youth volunteers, Slough Borough Council, and our generous patrons who united to create Europe&apos;s grandest Maha Ganapathi celebration.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0 text-center">
              <div className="bg-white p-3 rounded-2xl border border-[#E65C00]/25 shadow-sm">
                <div className="text-xl sm:text-2xl font-black font-cinzel text-[#E65C00]">40,000+</div>
                <div className="text-[10px] text-[#6B3A2A] font-bold uppercase mt-0.5">Devotees</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#E65C00]/25 shadow-sm">
                <div className="text-xl sm:text-2xl font-black font-cinzel text-[#E65C00]">22,000+</div>
                <div className="text-[10px] text-[#6B3A2A] font-bold uppercase mt-0.5">Meals Served</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#E65C00]/25 shadow-sm">
                <div className="text-xl sm:text-2xl font-black font-cinzel text-[#E65C00]">100%</div>
                <div className="text-[10px] text-[#6B3A2A] font-bold uppercase mt-0.5">Clay Immersion</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/ganesh-event-2026"
                className="gold-button px-7 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>View Mahotsav Photos &amp; Video</span>
              </Link>
              <Link
                href="/events"
                className="maroon-button px-7 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 transition-all border border-[#E65C00]/30"
              >
                <Calendar className="w-4 h-4 text-[#FF9A3C]" />
                <span>Next: Ugadi 2027</span>
              </Link>
            </div>
          </div>

          {/* Right Commemorative Poster Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#E65C00] to-[#FF7A00] rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500 pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#E65C00]/40 shadow-2xl bg-white">
                <img
                  src="/assets/poster.jpg"
                  alt="London Ganesh Mahotsav 2026 Poster"
                  className="w-full h-auto object-cover"
                />
                <div className="p-4 bg-gradient-to-t from-[#3D1A00] to-[#3D1A00]/90 text-white text-center space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9A3C]">
                    Slough &amp; Langley College SL3 8GW
                  </span>
                  <p className="text-xs font-extrabold font-cinzel">London Ganesh Mahotsav 2026 Archive</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. SEVEN SACRED DAYS CHRONICLE ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>FESTIVAL RETROSPECTIVE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            7 DAYS OF DIVINE CELEBRATION
          </h2>
          <p className="text-xs sm:text-sm text-[#6B3A2A]">
            A daily chronicle of the rituals, spiritual poojas, cultural showcases, and the sacred eco-visarjan in Slough.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FESTIVAL_DAYS.map((item, idx) => (
            <div
              key={idx}
              className="temple-card temple-card-hover rounded-3xl p-6 border border-[#E65C00]/30 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E65C00] bg-[#FFF0E0] px-2.5 py-1 rounded-full border border-[#E65C00]/20">
                    {item.day}
                  </span>
                  <span className="text-[10px] font-bold text-[#7A1620]">{item.badge}</span>
                </div>

                <h3 className="text-base font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-[#7A1620]">{item.telugu}</p>
                <p className="text-xs text-[#6B3A2A] leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E65C00]/15 flex items-center justify-between text-xs">
                <span className="text-[#3D1A00] font-bold text-[11px]">Mahotsav Archive</span>
                <Link href="/ganesh-event-2026" className="text-[#E65C00] font-bold flex items-center gap-1 hover:underline">
                  <span>View Photos</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. MEDIA & TEASER GALLERY ── */}
      <MediaTeaserSection />

      {/* ── 4. YEAR-ROUND MANABADI & LANGUAGE WING ── */}
      <section className="py-16 bg-gradient-to-r from-[#FFF0E0] via-white to-[#FFF0E0] border-t border-b border-[#E65C00]/25">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-8 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#E65C00]/30 text-xs font-bold text-[#E65C00] uppercase">
                <GraduationCap className="w-4 h-4" />
                <span>Manabadi Admissions Open</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black font-cinzel text-[#3D1A00]">
                Pass on Our Mother Tongue to the Next Generation
              </h3>
              <p className="text-xs sm:text-sm text-[#6B3A2A] leading-relaxed max-w-xl">
                Mitra Manabadi teaches Telugu speaking, reading, writing, and moral storytelling to children across 12 UK weekend centers in London, Slough, Berkshire, and Reading.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                <Link href="/membership" className="gold-button px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span>Enroll Your Child</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/about" className="bg-white text-[#3D1A00] border border-[#E65C00]/40 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#FFF0E0] transition-colors">
                  View Syllabus &amp; Centers
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 bg-white p-6 rounded-3xl border-2 border-[#E65C00]/30 shadow-lg text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-black font-cinzel text-base text-[#3D1A00]">500+ Students</h4>
              <p className="text-xs text-[#6B3A2A]">Certified Telugu curriculum with annual exams and cultural graduation day.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. OFFERING PLAQUES ── */}
      <OfferingPlaques />

      {/* ── 6. SPONSOR RIBBON BAND ── */}
      <SponsorRibbonBand />

    </div>
  );
}
