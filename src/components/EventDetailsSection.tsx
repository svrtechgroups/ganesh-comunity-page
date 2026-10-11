'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Clock, Download, ExternalLink, Sparkles, Flame, Heart, Utensils, Star, CheckCircle, Ticket } from 'lucide-react';
import { POOJA_DATES, getPoojaDateStatus, PoojaDateOption } from '@/components/PoojaBookingModal';
import { EventItem, CustomScheduleConfig } from '@/lib/types';
import { getEventSchedule } from '@/lib/event-schedule';
import { useEvent, isGaneshEvent } from '@/hooks/useEvent';



interface EventDetailsSectionProps {
  event?: EventItem | null;
  eventId?: string;
  eventTitle?: string;
  targetDate?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  customSchedule?: CustomScheduleConfig | null;
  onOpenPoojaBooking?: (dateId?: string) => void;
  onOpenDonation?: (cat?: 'Annadanam' | 'Event Donations') => void;
  onOpenRsvp?: () => void;
  onOpenRSVP?: () => void;
}

export default function EventDetailsSection({
  event,
  eventId = 'evt-ganesh-chaturthi',
  eventTitle,
  targetDate,
  primaryColor = '#E65C00',
  accentColor = '#CC4000',
  backgroundColor = '#FFF8F0',
  customSchedule = null,
  onOpenPoojaBooking,
  onOpenDonation,
  onOpenRsvp,
  onOpenRSVP,
}: EventDetailsSectionProps) {
  // Replaces 40 lines of manual useState + useEffect fetch
  const { event: activeEvent } = useEvent(eventId, event);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});
  const handleRsvp = onOpenRSVP || onOpenRsvp;

  // Replaces the inline multi-condition isGanesh derivation
  const isGanesh = isGaneshEvent(activeEvent || eventId, eventTitle);

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
    return isGanesh ? POOJA_DATES : [];
  }, [activeEvent, isGanesh]);

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

  if (!isGanesh) {
    const headerBadge = customSchedule?.headerBadge || `${activeEvent?.category ? activeEvent.category.toUpperCase() : 'COMMUNITY EVENT'} • PROGRAM & SCHEDULE`;
    const title = customSchedule?.title || activeEvent?.title || eventTitle || 'EVENT SCHEDULE & TIMINGS';
    const subtitle = customSchedule?.subtitle || activeEvent?.description || 'Join us for this special occasion with family, friends, and community organized by MITRA UK.';
    
    // Resolve schedule items
    let timelineItems: { time: string; event: string; desc: string }[] = [];
    if (customSchedule?.items && customSchedule.items.length > 0) {
      timelineItems = customSchedule.items;
    } else if (activeEvent?.eventSchedule) {
      let raw: any = activeEvent.eventSchedule;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch { raw = []; }
      }
      if (Array.isArray(raw) && raw.length > 0) {
        timelineItems = raw.map((item: any, idx: number) => ({
          time: item.time || item.dateLabel || item.date || `Stage ${idx + 1}`,
          event: item.event || item.title || `Stage ${idx + 1}`,
          desc: item.desc || item.description || item.theme || item.blessing || '',
        }));
      }
    }



    const venueName = customSchedule?.venueName || activeEvent?.venue || 'Event Venue';
    const venueAddress = customSchedule?.venueAddress || activeEvent?.address || 'London / United Kingdom';
    const mapsUrl = customSchedule?.mapsUrl || (
      activeEvent?.mapUrl && !activeEvent.mapUrl.includes('embed')
        ? activeEvent.mapUrl
        : `https://maps.google.com/?q=${encodeURIComponent(`${venueName} ${venueAddress}`)}`
    );
    const mapEmbedUrl = activeEvent?.mapUrl && activeEvent.mapUrl.includes('embed')
      ? activeEvent.mapUrl
      : `https://maps.google.com/maps?q=${encodeURIComponent(`${venueName} ${venueAddress}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
      <section
        className="py-20 border-b transition-colors duration-300"
        style={{
          backgroundColor: backgroundColor || '#FFF8F0',
          borderColor: `${primaryColor}30`,
          color: '#3D1A00',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 space-y-12">
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
              <span>{headerBadge}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-cinzel tracking-wider" style={{ color: primaryColor }}>
              {title}
            </h2>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {subtitle}
            </p>
          </div>

          {/* Quick Info Badges Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="p-4 rounded-2xl border flex items-center gap-3 bg-white dark:bg-slate-900 shadow-sm"
              style={{ borderColor: `${primaryColor}25` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date &amp; Time</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {activeEvent?.date || targetDate?.slice(0, 10) || 'Date TBA'} {activeEvent?.time ? `• ${activeEvent.time}` : ''}
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border flex items-center gap-3 bg-white dark:bg-slate-900 shadow-sm"
              style={{ borderColor: `${primaryColor}25` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Venue</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {venueName}
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border flex items-center gap-3 bg-white dark:bg-slate-900 shadow-sm"
              style={{ borderColor: `${primaryColor}25` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Ticket className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admission</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {activeEvent?.ticketPrice === 0 ? 'Free Entry' : `Adult £${activeEvent?.ticketPrice || 0}`}
                  {activeEvent?.childTicketPrice !== undefined && activeEvent.childTicketPrice !== null
                    ? ` • Child ${activeEvent.childTicketPrice === 0 ? 'Free' : `£${activeEvent.childTicketPrice}`}`
                    : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Timeline Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-cinzel flex items-center gap-2 uppercase tracking-wider" style={{ color: primaryColor }}>
              <Clock className="w-5 h-5" />
              <span>Program Timeline &amp; Highlights</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {timelineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl p-6 border-2 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900 shadow-sm transition-transform hover:scale-[1.01]"
                  style={{ borderColor: `${primaryColor}25` }}
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
          </div>

          {/* Pooja / Booking Cards (Only if activeEvent has Pooja enabled and booking handler passed) */}
          {activeEvent?.enablePooja && onOpenPoojaBooking && scheduleDays.length > 0 && (
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: `${primaryColor}20` }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest block" style={{ color: primaryColor }}>
                    POOJA &amp; SEVA CALENDAR
                  </span>
                  <h3 className="text-xl font-bold font-cinzel text-slate-900 dark:text-white">
                    SELECT PARTICIPATION DATE
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Book sacred sevas and community blessings
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleDays.map((dayItem, idx) => (
                  <div
                    key={dayItem.id || idx}
                    className="p-5 rounded-2xl border-2 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-3"
                    style={{ borderColor: `${primaryColor}25` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: primaryColor }}>
                          {dayItem.day || `Day ${idx + 1}`}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {dayItem.date}
                        </h4>
                      </div>
                      {dayItem.badge && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                          {dayItem.badge}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{dayItem.title}</p>
                      {dayItem.theme && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{dayItem.theme}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenPoojaBooking(dayItem.id)}
                      className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Book Seva / Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue & Location Interactive Card */}
          <div
            className="rounded-3xl p-6 sm:p-8 border-2 bg-white dark:bg-slate-900 shadow-sm space-y-6"
            style={{ borderColor: `${primaryColor}30` }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 font-black text-sm uppercase tracking-wider"
                  style={{ color: primaryColor }}
                >
                  <MapPin className="w-5 h-5 shrink-0" />
                  <span>{venueName}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                  {venueAddress}
                </p>
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
                {onOpenPoojaBooking && activeEvent?.enablePooja && (
                  <button
                    onClick={() => onOpenPoojaBooking()}
                    className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider border text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    style={{ borderColor: `${primaryColor}40` }}
                  >
                    Make Event Payment
                  </button>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-200 transition-colors"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="rounded-2xl overflow-hidden border h-64 sm:h-72 w-full relative bg-slate-100" style={{ borderColor: `${primaryColor}20` }}>
              <iframe
                title="Event Venue Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              />
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
