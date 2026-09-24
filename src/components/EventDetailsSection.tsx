'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Clock, Download, ExternalLink, Sparkles, Flame, Heart, Utensils, Star, CheckCircle, Ticket } from 'lucide-react';
import { POOJA_DATES, getPoojaDateStatus, PoojaDateOption } from '@/components/PoojaBookingModal';
import { EventItem } from '@/lib/types';
import { getEventSchedule } from '@/lib/event-schedule';

interface EventDetailsSectionProps {
  event?: EventItem | null;
  eventId?: string;
  eventTitle?: string;
  targetDate?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  onOpenPoojaBooking?: (dateId?: string) => void;
  onOpenDonation?: (cat?: 'Annadanam' | 'Event Donations') => void;
  onOpenRsvp?: () => void;
  onOpenRSVP?: () => void;
}

const EVENT_SCHEDULES: Record<
  string,
  {
    headerBadge: string;
    title: string;
    subtitle: string;
    venueName: string;
    venueAddress: string;
    mapsUrl: string;
    items: { time: string; event: string; desc: string }[];
  }
> = {
  'evt-diwali-2026': {
    headerBadge: 'DIWALI 2026 PROGRAM & TIMINGS',
    title: 'FESTIVAL SCHEDULE & ATTRACTIONS',
    subtitle: 'Byron Hall, Harrow Leisure Centre, Christchurch Ave, Harrow HA3 5BD, London.',
    venueName: 'Byron Hall, Harrow Leisure Centre',
    venueAddress: 'Christchurch Ave, Harrow HA3 5BD, London (Near Harrow-on-the-Hill)',
    mapsUrl: 'https://maps.google.com/?q=Byron+Hall+Harrow+Leisure+Centre+HA3+5BD',
    items: [
      { time: '05:00 PM – 06:30 PM', event: 'Traditional Deepotsav', desc: 'Auspicious lighting of 1,008 clay diyas and welcome mangala harathi.' },
      { time: '06:30 PM – 08:30 PM', event: 'Telugu Cultural Showcase', desc: 'Live Telugu classical & contemporary dance recitals, musical orchestras, and comedy skit.' },
      { time: '08:30 PM – 09:30 PM', event: 'Community Mahaprasadam Feast', desc: 'Authentic South Indian festival dinner counters and live jalebi / sweet stations.' },
      { time: '09:30 PM – 10:00 PM', event: 'London Sky Fireworks Finale', desc: 'Spectacular choreographed fireworks display illuminating the London night sky.' },
    ],
  },
  'evt-ugadi-2027': {
    headerBadge: 'UGADI 2027 CELEBRATIONS',
    title: 'TELUGU NEW YEAR ITINERARY',
    subtitle: 'Beck Theatre, Grange Rd, Hayes UB3 2UE, Greater London.',
    venueName: 'Beck Theatre',
    venueAddress: 'Grange Rd, Hayes UB3 2UE, Greater London · Free patron parking on-site',
    mapsUrl: 'https://maps.google.com/?q=Beck+Theatre+Hayes+UB3+2UE',
    items: [
      { time: '10:00 AM – 11:30 AM', event: 'Plava Nama Panchanga Sravanam', desc: 'Vedic blessings, planetary forecasts, and auspicious year readings by Vedic scholars.' },
      { time: '11:30 AM – 01:00 PM', event: 'Kavi Sammelanam & Literary Forum', desc: 'Telugu poetry contest, classical Avadhanam showcases, and children’s Telugu recitation.' },
      { time: '01:00 PM – 02:30 PM', event: 'Ugadi Pachadi & Festive Bhojanam', desc: 'Traditional 6-taste Shadruchulu Ugadi Pachadi followed by a sumptuous Telugu banana leaf feast.' },
      { time: '02:30 PM – 06:00 PM', event: 'Youth Cultural Stage & Awards', desc: 'Kuchipudi, folk dances, MITRA community leadership awards, and musical drama.' },
    ],
  },
  'evt-business-summit-2027': {
    headerBadge: 'UK-INDIA SUMMIT AGENDA',
    title: 'EXECUTIVE TIMELINE & TRACKS',
    subtitle: 'QEII Centre, Broad Sanctuary, Westminster, London SW1P 3EE.',
    venueName: 'QEII Centre, Westminster',
    venueAddress: 'Broad Sanctuary, Westminster, London SW1P 3EE · 2 mins from Westminster Station',
    mapsUrl: 'https://maps.google.com/?q=QEII+Centre+Westminster+London+SW1P+3EE',
    items: [
      { time: '09:00 AM – 10:00 AM', event: 'Delegate Badge Collection & Networking Breakfast', desc: 'Meet fellow Telugu entrepreneurs, venture capitalists, and diaspora leaders.' },
      { time: '10:00 AM – 12:30 PM', event: 'Keynote & AI / FinTech Innovation Panels', desc: 'Cross-border enterprise expansion between Hyderabad IT corridor and the City of London.' },
      { time: '01:30 PM – 03:30 PM', event: 'Start-Up Pitch Arena & Investor Sessions', desc: '10 curated early-stage startups pitching live to angel networks and UK/India VC funds.' },
      { time: '03:30 PM – 05:30 PM', event: 'B2B Trade Matchmaking & High Tea Gala', desc: 'Structured one-to-one networking tables, bilateral partnership signings, and closing remarks.' },
    ],
  },
  'evt-cricket-fest-2027': {
    headerBadge: 'MITRA PREMIER LEAGUE 2027',
    title: 'TOURNAMENT FIXTURES & TIMELINE',
    subtitle: 'Merchant Taylors Ground, Sandy Lodge, Northwood HA6 2HT, Hertfordshire.',
    venueName: 'Merchant Taylors Ground',
    venueAddress: 'Sandy Lodge, Northwood HA6 2HT, Hertfordshire (Moor Park Underground Station)',
    mapsUrl: 'https://maps.google.com/?q=Merchant+Taylors+School+Northwood+HA6+2HT',
    items: [
      { time: '08:30 AM – 11:30 AM', event: 'Group Stage Matches', desc: '16 Telugu diaspora cricket clubs battling in 4 simultaneous groups across international-grade pitches.' },
      { time: '11:30 AM – 02:00 PM', event: 'Quarter-Finals & Food Stalls', desc: 'Knockout showdowns, family entertainment area, bouncy castles, and authentic Biryani counters.' },
      { time: '02:30 PM – 05:00 PM', event: 'Semi-Finals & DJ Commentary', desc: 'High-octane T20 clashes accompanied by live Telugu DJ beats and crowd interaction.' },
      { time: '05:30 PM – 07:30 PM', event: 'Grand Final & Trophy Presentation', desc: 'Championship final match followed by prize distribution by prominent diaspora dignitaries.' },
    ],
  },
};

export default function EventDetailsSection({
  event,
  eventId = 'evt-ganesh-chaturthi',
  eventTitle,
  targetDate,
  primaryColor = '#E65C00',
  accentColor = '#CC4000',
  backgroundColor = '#FFF8F0',
  onOpenPoojaBooking,
  onOpenDonation,
  onOpenRsvp,
  onOpenRSVP,
}: EventDetailsSectionProps) {
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(event || null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const handleRsvp = onOpenRSVP || onOpenRsvp;

  const isGanesh = eventId === 'evt-ganesh-chaturthi' || eventTitle?.toLowerCase().includes('ganesh');
  const customSchedule = eventId ? EVENT_SCHEDULES[eventId] : null;

  useEffect(() => {
    if (event) {
      setActiveEvent(event);
      return;
    }
    let isMounted = true;
    const fetchEvent = async () => {
      try {
        const url = eventId ? `/api/events?id=${encodeURIComponent(eventId)}` : '/api/events';
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!isMounted) return;

        if (json.success) {
          if (eventId && json.data && !Array.isArray(json.data)) {
            setActiveEvent(json.data);
          } else if (Array.isArray(json.data)) {
            const matched = eventId
              ? json.data.find((e: any) => e.id === eventId)
              : json.data.find(
                  (e: any) =>
                    e.id === 'evt-ganesh-chaturthi' ||
                    e.title?.toLowerCase().includes('ganesh') ||
                    e.enablePooja
                ) || json.data[0];
            if (matched) {
              setActiveEvent(matched);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch event dates for EventDetailsSection:', err);
      }
    };
    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [event, eventId]);

  const scheduleDays: PoojaDateOption[] = useMemo(() => {
    const s = getEventSchedule(activeEvent);
    if (s && s.length > 0) {
      return s.map((item, idx) => ({
        id: item.id || `day-${idx + 1}`,
        date: item.date || item.dateLabel || `Day ${idx + 1}`,
        day: item.day || '',
        title: item.title || `Day ${idx + 1}`,
        theme: item.theme || '',
        blessing: item.blessing || item.theme || '',
        badge: item.badge,
      }));
    }
    return POOJA_DATES;
  }, [activeEvent]);

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
  }, [isGanesh]);

  const getBookingCount = (dateStr: string) => {
    return dbCounts[dateStr] || 0;
  };

  const dailySchedule = [
    { time: 'Mon – Sat: 6:00 PM – 9:00 PM', event: 'Evening Darshan & Maha Aarti', desc: 'Vedic chants, ritual sanctum offerings, cultural recitals, and Maha Mangala Aarti.' },
    { time: 'Sunday: 11:00 AM – 5:00 PM', event: 'Weekend Darshan, Cultural Fest & Mahaprasadam', desc: 'Grand daytime Darshan, Kuchipudi classical dance, bhajans, and community food distribution.' },
  ];

  if (!isGanesh && customSchedule) {
    return (
      <section
        className="py-20 border-b transition-colors duration-300"
        style={{
          backgroundColor: backgroundColor,
          borderColor: `${primaryColor}30`,
          color: '#3D1A00',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm border"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <Calendar className="w-4 h-4" />
              <span>{customSchedule.headerBadge}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
              {customSchedule.title}
            </h2>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {customSchedule.subtitle}
            </p>
          </div>

          {/* Schedule Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {customSchedule.items.map((item, idx) => (
              <div
                key={idx}
                className="temple-card rounded-3xl p-6 border-2 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900 shadow-sm"
                style={{ borderColor: `${primaryColor}30` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    {item.time}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">STAGE {idx + 1}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.event}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Venue & Action Card */}
          <div
            className="temple-card rounded-3xl p-8 border-2 flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 shadow-sm"
            style={{ borderColor: `${primaryColor}30` }}
          >
            <div className="space-y-2 text-center md:text-left">
              <div
                className="flex items-center justify-center md:justify-start gap-2 font-black text-sm uppercase tracking-wider"
                style={{ color: primaryColor }}
              >
                <MapPin className="w-5 h-5" />
                <span>{customSchedule.venueName}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{customSchedule.venueAddress}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {handleRsvp && (
                <button
                  onClick={handleRsvp}
                  className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md transition-opacity hover:opacity-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Confirm Attendance / RSVP
                </button>
              )}
              <a
                href={customSchedule.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <span>Get Directions</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            {scheduleDays.map((dayItem, idx) => {
              const count = getBookingCount(dayItem.date);
              const status = getPoojaDateStatus(dayItem.date, count, dayItem.badge);
              const isUnavailable = status.disabled;
              return (
                <div
                  key={dayItem.id}
                  className={`temple-card rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 relative transition-all duration-300 hover:scale-[1.02] ${
                    isUnavailable
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
                      <h4 className={`text-xl font-black font-cinzel ${isUnavailable ? 'text-slate-400 line-through' : 'text-[#3D1A00]'}`}>
                        {dayItem.date}
                      </h4>
                    </div>

                    {isUnavailable ? (
                      <span className={`text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow ${
                        status.reason === 'past'
                          ? 'bg-slate-500'
                          : status.reason === 'visarjan'
                          ? 'bg-amber-600'
                          : 'bg-red-600'
                      }`}>
                        {status.statusLabel}
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
                      <Flame className={`w-4 h-4 shrink-0 ${isUnavailable ? 'text-slate-400' : 'text-[#E65C00]'}`} />
                      <h5 className={`text-base font-bold font-cinzel leading-tight ${isUnavailable ? 'text-slate-400' : 'text-[#E65C00]'}`}>
                        {dayItem.title}
                      </h5>
                    </div>
                    <p className={`text-xs font-semibold ${isUnavailable ? 'text-slate-400' : 'text-[#3D1A00]'}`}>
                      {dayItem.theme}
                    </p>
                    <p className={`text-[11px] leading-relaxed italic ${isUnavailable ? 'text-slate-400' : 'text-[#6B3A2A]'}`}>
                      ✦ {isUnavailable
                        ? status.reason === 'past'
                          ? 'Pooja date has passed.'
                          : status.reason === 'visarjan'
                          ? 'Maha Visarjan & Nimajjanam day. Bookings closed.'
                          : 'Daily booking limit reached.'
                        : dayItem.blessing}
                    </p>
                  </div>

                  {/* Card Action */}
                  {onOpenPoojaBooking ? (
                    <button
                      disabled={isUnavailable}
                      onClick={() => !isUnavailable && onOpenPoojaBooking?.(dayItem.id)}
                      className={`w-full py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm ${
                        isUnavailable
                          ? 'bg-slate-300 text-slate-500 border border-slate-400/30 cursor-not-allowed'
                          : 'gold-button'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 fill-current text-white" />
                      <span>
                        {isUnavailable
                          ? status.reason === 'past'
                            ? 'Date Passed'
                            : status.reason === 'visarjan'
                            ? 'Visarjan Day'
                            : 'Fully Booked'
                          : 'Make Event Payment'}
                      </span>
                    </button>
                  ) : null}
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
            {handleRsvp && (
              <button
                onClick={handleRsvp}
                className="gold-button px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-all"
              >
                <Ticket className="w-4 h-4 text-white" />
                <span>Register / RSVP Now</span>
              </button>
            )}

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
