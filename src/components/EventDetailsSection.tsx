'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Download, ExternalLink, Sparkles, Flame, Heart, Utensils, Star, CheckCircle } from 'lucide-react';
import { POOJA_DATES } from '@/components/PoojaBookingModal';

interface EventDetailsSectionProps {
  onOpenPoojaBooking?: (dateId?: string) => void;
  onOpenDonation?: (cat?: 'Annadanam' | 'Event Donations') => void;
}

export default function EventDetailsSection({
  onOpenPoojaBooking,
  onOpenDonation,
}: EventDetailsSectionProps) {
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/payments/booking-counts', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.counts) {
          setDbCounts(data.counts);
        }
      } catch (e) {
        console.error('Error fetching booking counts:', e);
      }
    };
    fetchCounts();
  }, []);

  const getBookingCount = (dateStr: string) => {
    return dbCounts[dateStr] || 0;
  };

  const dailySchedule = [
    { time: 'Mon – Sat: 6:00 PM – 9:00 PM', event: 'Evening Darshan & Maha Aarti', desc: 'Vedic chants, ritual sanctum offerings, cultural recitals, and Maha Mangala Aarti.' },
    { time: 'Sunday: 11:00 AM – 5:00 PM', event: 'Weekend Darshan, Cultural Fest & Mahaprasadam', desc: 'Grand daytime Darshan, Kuchipudi classical dance, bhajans, and community food distribution.' },
  ];

  return (
    <section className="py-20 bg-[#FFF8F0] text-[#3D1A00] border-b border-[#E65C00]/25">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>GANESH MAHOTSAV 2026 SCHEDULE &amp; SEVA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            7-DAY MAHOTSAV &amp; POOJA CALENDAR
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#6B3A2A] leading-relaxed">
            Experience 7 divine days of Darshan, Vedic rituals, and cultural celebrations from 13th to 19th September 2026 at E Block, SLOUGH &amp; LANGLEY COLLEGE, Langley Road, SL3 8GW.
          </p>
        </div>

        {/* 7-DAY FESTIVAL SCHEDULE GRID */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#E65C00]/25 pb-3">
            <div>
              <span className="text-xs font-black font-cinzel text-[#E65C00] uppercase tracking-widest block">
                SACRED RITUAL SCHEDULE (13TH – 19TH SEP 2026)
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#3D1A00]">
                CHOOSE YOUR AUSPICIOUS POOJA DAY
              </h3>
            </div>
            <span className="text-xs text-[#6B3A2A] font-semibold">
              Personalized family Sankalpam &amp; consecrated Prasadam (Sevas from £21 to £316)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {POOJA_DATES.map((dayItem, idx) => {
              const count = getBookingCount(dayItem.date);
              const isFullyBooked = count >= 10;
              return (
                <div
                  key={dayItem.id}
                  className={`temple-card rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 relative transition-all duration-300 hover:scale-[1.02] ${
                    isFullyBooked
                      ? 'border-slate-300 bg-slate-50 opacity-70 shadow-none'
                      : dayItem.id === 'day-2'
                      ? 'border-[#E65C00] bg-gradient-to-b from-[#FFF0E0] to-white shadow-md'
                      : 'border-[#E65C00]/25 bg-white hover:border-[#E65C00]'
                  }`}
                >
                  {/* Header Badge */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black uppercase text-[#E65C00] font-cinzel tracking-wider">
                        {dayItem.day}
                      </span>
                      <h4 className={`text-xl font-black font-cinzel ${isFullyBooked ? 'text-slate-400 line-through' : 'text-[#3D1A00]'}`}>
                        {dayItem.date}
                      </h4>
                    </div>

                    {isFullyBooked ? (
                      <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                        FULLY BOOKED
                      </span>
                    ) : dayItem.badge ? (
                      <span className="bg-[#E65C00] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                        {dayItem.badge}
                      </span>
                    ) : (
                      <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        DAY {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Day Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 shrink-0 ${isFullyBooked ? 'text-slate-400' : 'text-[#E65C00]'}`} />
                      <h5 className={`text-base font-bold font-cinzel leading-tight ${isFullyBooked ? 'text-slate-400' : 'text-[#E65C00]'}`}>
                        {dayItem.title}
                      </h5>
                    </div>
                    <p className={`text-xs font-semibold ${isFullyBooked ? 'text-slate-400' : 'text-[#3D1A00]'}`}>
                      {dayItem.theme}
                    </p>
                    <p className={`text-[11px] leading-relaxed italic ${isFullyBooked ? 'text-slate-400' : 'text-[#6B3A2A]'}`}>
                      ✦ {isFullyBooked ? 'Daily booking limit reached.' : dayItem.blessing}
                    </p>
                  </div>

                  {/* Card Action */}
                  <button
                    disabled={isFullyBooked}
                    onClick={() => !isFullyBooked && onOpenPoojaBooking?.(dayItem.id)}
                    className={`w-full py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm ${
                      isFullyBooked
                        ? 'bg-slate-300 text-slate-500 border border-slate-400/30 cursor-not-allowed'
                        : 'gold-button'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current text-white" />
                    <span>{isFullyBooked ? 'Fully Booked' : 'Book Pooja / Seva'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Venue Info & Add to Calendar Bar */}
        <div className="temple-card rounded-3xl p-8 border-2 border-[#E65C00]/30 flex flex-col md:flex-row items-center justify-between gap-6 bg-white shadow-sm">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#E65C00] font-black text-sm uppercase tracking-wider font-cinzel">
              <MapPin className="w-5 h-5" />
              <span>E Block, SLOUGH &amp; LANGLEY COLLEGE</span>
            </div>
            <p className="text-xs text-[#6B3A2A]">
              Address: Langley Road, SL3 8GW · Easy access via Elizabeth Line (Langley Station) &amp; M4 Junction 5. Ample parking available for families.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=Langley+Road+SL3+8GW+Slough+UK"
              target="_blank"
              rel="noopener noreferrer"
              className="maroon-button px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-[#E65C00]/20"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-4 h-4 text-[#FF9A3C]" />
            </a>
          </div>
        </div>

        {/* Daily Program Aarti Schedule & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Daily Schedule List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl font-bold font-cinzel text-[#E65C00] flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-5 h-5 text-[#E65C00]" />
              <span>Daily Mahotsav Aarti &amp; Puja Timings</span>
            </h3>

            <div className="space-y-3">
              {dailySchedule.map((item, idx) => (
                <div key={idx} className="temple-card p-5 rounded-2xl border border-[#E65C00]/20 flex items-start gap-4 bg-white shadow-sm">
                  <div className="bg-[#FFF0E0] text-[#E65C00] px-3 py-1.5 rounded-xl font-black text-xs shrink-0 font-cinzel border border-[#E65C00]/30 shadow-sm">
                    {item.time}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#3D1A00]">{item.event}</h4>
                    <p className="text-xs text-[#6B3A2A]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Styled Map Card */}
          <div className="lg:col-span-5 temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-4 bg-white shadow-sm">
            <h3 className="text-lg font-bold font-cinzel text-[#E65C00] flex items-center gap-2 uppercase">
              <MapPin className="w-5 h-5" />
              <span>Interactive Venue Map</span>
            </h3>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#E65C00]/20 bg-[#FFF0E0] flex items-center justify-center">
              <iframe
                title="Langley Slough Venue Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19842.14810237912!2d-0.5484865000000001!3d51.5074218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48767b4c9b33a595%3A0x6b772b1d3d62fa22!2sLangley%2C%20Slough!5e0!3m2!1sen!2suk!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
