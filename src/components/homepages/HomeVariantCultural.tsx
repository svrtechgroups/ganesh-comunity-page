'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Flame, 
  Calendar, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Heart, 
  Globe, 
  Building2, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import MitraCommunitySection from '@/components/MitraCommunitySection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';

export default function HomeVariantCultural() {
  const [selectedFestival, setSelectedFestival] = useState(0);

  const FESTIVALS = [
    {
      name: 'Ugadi Telugu New Year 2027',
      telugu: 'శ్రీ క్రోధి నామ ఉగాది ఉత్సవాలు',
      date: 'March 2027 · Central London & Slough',
      desc: 'The grandest gathering of British Telugus celebrating Ugadi with Panchanga Sravanam, Kavi Sammelanam, traditional Ugadi Pachadi, and star musical performances.',
      badge: 'Major Apex Gala',
      attendees: '3,500+ Attendees'
    },
    {
      name: 'Maha Bathukamma Floral Festival',
      telugu: 'లండన్ బతుకమ్మ సంబరాలు',
      date: 'October 2026 · Hounslow & Slough',
      desc: 'Honouring the unique floral celebration of Telangana heritage with traditional folk songs, colourful floral pyramids, and women empowerment gathering.',
      badge: 'Cultural Heritage',
      attendees: '2,000+ Women & Families'
    },
    {
      name: 'Deepavali & Kartika Deepotsavam',
      telugu: 'దీపావళి & కార్తీక దీపోత్సవం',
      date: 'November 2026 · Berkshire & London',
      desc: 'Lighting 1,008 sacred earthen diyas with devotional Bhajan sandhya, cultural dance recitals, and community fireworks display.',
      badge: 'Devotional Gala',
      attendees: '1,800+ Devotees'
    },
    {
      name: 'Sankranti Sambaralu & Kite Fest',
      telugu: 'మకర సంక్రాంతి సంబరాలు & గాలిపటాల పండుగ',
      date: 'January 2027 · Southall & Reading',
      desc: 'Celebrating the harvest festival with traditional Haridasu keerthanas, Bhogi bonfires, Muggu (Rangoli) competitions, and community feast.',
      badge: 'Folk & Heritage',
      attendees: '2,500+ Attendees'
    }
  ];

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen selection:bg-[#E65C00] selection:text-white">
      
      {/* ── 1. GRAND TEMPLE HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF2E0] to-[#FFF8F0] text-[#3D1A00] pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E65C00]/20">
        
        {/* Warm saffron radial glow watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#E65C00]/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#E65C00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#CC4000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-7">
          
          {/* Top Post-Event Commemoration Pill */}
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-md text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
            <span>Mana Indian Telugu Roots Abroad (MITRA UK)</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
              PRESERVING TELUGU HERITAGE
            </h1>
            <h2 className="text-lg sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
              UNITING COMMUNITIES ACROSS THE UNITED KINGDOM
            </h2>
            <p className="text-xs sm:text-sm text-[#6B3A2A] max-w-2xl mx-auto leading-relaxed pt-1">
              Serving over 25,000 Telugu-speaking families with cultural celebrations, youth Manabadi language academies, 24/7 student welfare, and business networking across Britain.
            </p>
          </div>

          {/* Post-Mahotsav Celebration Banner */}
          <div className="temple-card rounded-2xl p-4 sm:p-5 border-2 border-[#E65C00]/30 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md bg-gradient-to-r from-white via-[#FFF9F2] to-white">
            <div className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-full bg-[#FFF0E0] border border-[#E65C00]/40 flex items-center justify-center shrink-0 text-[#E65C00]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-[#E65C00] tracking-wider block">
                  Historic London Ganesh Mahotsav 2026
                </span>
                <p className="text-xs text-[#6B3A2A]">
                  Thank you 40,000+ devotees, volunteers, and patrons for Europe&apos;s grandest eco-friendly celebration!
                </p>
              </div>
            </div>
            <Link
              href="/ganesh-event-2026"
              className="maroon-button px-5 py-2 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5"
            >
              <span>View Recap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/membership"
              className="gold-button px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              <Users className="w-4 h-4" />
              <span>Become a MITRA Member</span>
            </Link>

            <Link
              href="/events"
              className="maroon-button px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 transition-all border border-[#E65C00]/30"
            >
              <Calendar className="w-4 h-4 text-[#FF9A3C]" />
              <span>Upcoming Festivals</span>
            </Link>

            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#FFF0E0] text-[#3D1A00] border-2 border-[#E65C00]/40 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>

          {/* Scroll Cue Bell */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex flex-col items-center gap-1.5 text-[#E65C00]">
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Explore MITRA Family</span>
              <div className="w-8 h-8 rounded-full border border-[#E65C00]/40 flex items-center justify-center bg-white/60">
                <span className="text-sm animate-bounce">🔔</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. APEX STATISTICS BAND ── */}
      <section className="bg-gradient-to-r from-[#3D1A00] via-[#5A2303] to-[#7A1620] text-white py-10 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-cinzel text-[#FF9A3C]">25,000+</div>
            <div className="text-xs text-[#FFF0DD]/80 font-semibold uppercase tracking-wider">Telugu Families</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-cinzel text-[#FF9A3C]">18+</div>
            <div className="text-xs text-[#FFF0DD]/80 font-semibold uppercase tracking-wider">UK Boroughs &amp; Towns</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-cinzel text-[#FF9A3C]">500+</div>
            <div className="text-xs text-[#FFF0DD]/80 font-semibold uppercase tracking-wider">Manabadi Kids Enrolled</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-cinzel text-[#FF9A3C]">100%</div>
            <div className="text-xs text-[#FFF0DD]/80 font-semibold uppercase tracking-wider">Volunteer Seva Driven</div>
          </div>
        </div>
      </section>

      {/* ── 3. MITRA UK COMMUNITY SHOWCASE & PILLARS ── */}
      <MitraCommunitySection />

      {/* ── 4. YEAR-ROUND FESTIVAL CALENDAR ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            <span>CALENDAR OF CELEBRATIONS 2026 - 2027</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            UPCOMING CULTURAL GALA
          </h2>

          <p className="text-xs sm:text-sm text-[#6B3A2A]">
            Keeping centuries of Telugu tradition vibrant in Britain. Mark your calendar for grand celebrations that unite Telugu families across England and Scotland.
          </p>
        </div>

        {/* Festival Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-3">
            {FESTIVALS.map((fest, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFestival(idx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all text-sm flex items-center justify-between ${
                  selectedFestival === idx
                    ? 'bg-gradient-to-r from-[#FFF0E0] to-[#FFE8CC] border-[#E65C00] shadow-md -translate-r-1'
                    : 'bg-white border-[#E65C00]/20 hover:border-[#E65C00]/50 hover:bg-[#FFF9F3]'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#E65C00] block">{fest.badge}</span>
                  <h4 className="font-black font-cinzel text-[#3D1A00] text-base">{fest.name}</h4>
                  <div className="text-xs text-[#6B3A2A]">{fest.date}</div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedFestival === idx ? 'text-[#E65C00] translate-x-1' : 'text-[#3D1A00]/40'}`} />
              </button>
            ))}
          </div>

          {/* Active Festival Spotlight Card */}
          <div className="lg:col-span-7">
            <div className="temple-card p-8 rounded-3xl border-2 border-[#E65C00]/40 space-y-6 bg-gradient-to-br from-white via-[#FFF9F2] to-[#FFF3E5] shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E65C00]/20 pb-4">
                <div>
                  <span className="text-xs font-bold text-[#E65C00] uppercase tracking-wider">{FESTIVALS[selectedFestival].badge}</span>
                  <h3 className="text-2xl font-black font-cinzel text-[#3D1A00]">{FESTIVALS[selectedFestival].name}</h3>
                  <p className="text-sm font-semibold text-[#7A1620] mt-0.5">{FESTIVALS[selectedFestival].telugu}</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#FFF0E0] px-3.5 py-1.5 rounded-xl border border-[#E65C00]/30 text-xs font-bold text-[#E65C00]">
                  <Users className="w-3.5 h-3.5" />
                  <span>{FESTIVALS[selectedFestival].attendees}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6B3A2A]">
                  <Calendar className="w-4 h-4 text-[#E65C00]" />
                  <span>{FESTIVALS[selectedFestival].date}</span>
                </div>
                <p className="text-sm text-[#3D1A00] leading-relaxed">
                  {FESTIVALS[selectedFestival].desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-[#E65C00]/20 text-xs space-y-1">
                  <span className="font-bold text-[#3D1A00] block">Volunteers &amp; Stage:</span>
                  <span className="text-[#6B3A2A]">Open for chapter coordinators, stage anchors, and food seva volunteers.</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E65C00]/20 text-xs space-y-1">
                  <span className="font-bold text-[#3D1A00] block">Cultural Registrations:</span>
                  <span className="text-[#6B3A2A]">Kuchipudi recitals, classical vocal music, and youth drama entries open.</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-[#E65C00]/20">
                <Link
                  href="/events"
                  className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <span>Explore Event Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/contact"
                  className="bg-white hover:bg-[#FFF0E0] text-[#7A1620] border border-[#7A1620]/30 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Volunteer for Festival
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. GET INVOLVED — OFFERING PLAQUES & VOLUNTEER ── */}
      <OfferingPlaques />

      {/* ── 6. BROUGHT TO YOU BY — SPONSOR RIBBON BAND ── */}
      <SponsorRibbonBand />

    </div>
  );
}
