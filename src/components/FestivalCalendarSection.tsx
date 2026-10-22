'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

interface FestivalItem {
  name: string;
  telugu: string;
  date: string;
  desc: string;
  badge: string;
  attendees: string;
}

const FESTIVALS: FestivalItem[] = [
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

export default function FestivalCalendarSection() {
  const [selectedFestival, setSelectedFestival] = useState(0);
  const activeFestival = FESTIVALS[selectedFestival];

  return (
    <section className="py-20 bg-gradient-to-b from-[#FFF8F0] via-[#FFF2E0] to-[#FFF8F0] text-[#3D1A00] relative overflow-hidden border-b border-[#E65C00]/20">
      
      {/* Warm saffron radial glow watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E65C00]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E65C00]" />
            <span>COMMUNITY CULTURAL CALENDAR</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text leading-tight">
            FLAGSHIP ANNUAL FESTIVALS
          </h2>

          <p className="text-xs sm:text-sm text-[#6B3A2A] leading-relaxed">
            Keeping centuries of Telugu tradition vibrant in Britain. Mark your calendar for grand celebrations that unite Telugu families across England and Scotland.
          </p>
        </div>

        {/* Festival Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-3">
            {FESTIVALS.map((fest, idx) => (
              <button
                key={idx}
                type="button"
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
                  <span className="text-xs font-bold text-[#E65C00] uppercase tracking-wider">{activeFestival.badge}</span>
                  <h3 className="text-2xl font-black font-cinzel text-[#3D1A00]">{activeFestival.name}</h3>
                  <p className="text-sm font-semibold text-[#7A1620] mt-0.5">{activeFestival.telugu}</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#FFF0E0] px-3.5 py-1.5 rounded-xl border border-[#E65C00]/30 text-xs font-bold text-[#E65C00]">
                  <Users className="w-3.5 h-3.5" />
                  <span>{activeFestival.attendees}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6B3A2A]">
                  <Calendar className="w-4 h-4 text-[#E65C00]" />
                  <span>{activeFestival.date}</span>
                </div>
                <p className="text-sm text-[#3D1A00] leading-relaxed">
                  {activeFestival.desc}
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
                  <span>Explore All Events</span>
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
      </div>
    </section>
  );
}
