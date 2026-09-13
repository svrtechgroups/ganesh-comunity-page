'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EventItem } from '@/lib/types';
import { trackRSVP } from '@/lib/analytics';
import { generateEventJsonLd } from '@/lib/seo-config';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Download, 
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import Ganesha3DHero from '@/components/Ganesha3DHero';
import RitualCountdown from '@/components/RitualCountdown';
import EventDetailsSection from '@/components/EventDetailsSection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import NotifyMeModal from '@/components/NotifyMeModal';
import DonationModal from '@/components/DonationModal';

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvped, setRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(1420);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/events')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const found = resData.data.find((e: EventItem) => e.id === id) ||
            resData.data.find((e: EventItem) => (id === 'evt-ganesh-chaturthi' || id === 'evt-101') && e.title.toLowerCase().includes('ganesh'));
          if (found) {
            setEvent(found);
            setRsvpCount(found.rsvpCount || 0);
          } else {
            setEvent(null);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load event detail from DB:', err);
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-mitra-gold animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading festival details from database...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Event Not Found</h1>
        <Link href="/events" className="text-mitra-red font-bold underline text-sm">Return to Events Hub</Link>
      </div>
    );
  }

  const jsonLd = generateEventJsonLd(event);
  const isGaneshEvent = id === 'evt-ganesh-chaturthi' || id === 'evt-101' || event.title.toLowerCase().includes('ganesh');

  const handleRSVP = async () => {
    if (rsvped) return;
    setRsvpCount((prev) => prev + 1);
    setRsvped(true);
    trackRSVP(event.id, event.title);

    try {
      await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          attendeeName: 'Community Attendee',
          attendeeEmail: 'attendee@mitra.org.uk',
          ticketsCount: 1,
        }),
      });
    } catch {}
  };

  const handleICSDownload = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MITRA Events//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.venue}, ${event.address}
DTSTART:${event.date.replace(/-/g, '')}T160000Z
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    link.click();
  };

  // If viewing Ganesh Chaturthi event, render the full Home Page experience with 3D Ganesha & Puja booking!
  if (isGaneshEvent) {
    return (
      <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Back Link Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex justify-between items-center">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E65C00] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
          <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/25 text-[10px] font-black px-3 py-1 rounded-full uppercase">
            GANESH CHATURTHI FESTIVAL PAGE
          </span>
        </div>

        {/* 1. HERO — 3D VEILED GANESHA & REVEAL EXPERIENCE */}
        <Ganesha3DHero onNotifyClick={() => setNotifyModalOpen(true)} />

        {/* 2. RITUAL COUNTDOWN CLOCK */}
        <RitualCountdown />

        {/* 3. EVENT DETAILS, VENUE & 3 DONATION CATEGORIES / POOJA BOOKING (£116) */}
        <EventDetailsSection />

        {/* 4. IDOL SPECS PLAQUE */}
        <IdolSpecsCard />

        {/* 5. MEDIA & TEASER GALLERY */}
        <MediaTeaserSection 
          eventId={event.id} 
          sectionTitle="TEASER REEL & EVENT POSTERS" 
        />

        {/* MODAL FORMS */}
        <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
        <DonationModal isOpen={donateModalOpen} onClose={() => setDonateModalOpen(false)} />
      </div>
    );
  }

  // Standard Event Detail layout for non-Ganesh events
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/events" className="inline-flex items-center gap-1 text-xs font-bold text-mitra-red dark:text-mitra-gold hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Calendar</span>
      </Link>

      {/* Hero Banner */}
      <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-mitra-gold/30">
        <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-mitra-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
            {event.category}
          </span>
          <span className="bg-mitra-gold text-mitra-navy text-xs font-black px-3 py-1 rounded-full uppercase shadow">
            {event.ticketPrice === 0 ? 'FREE EVENT' : `£${event.ticketPrice}`}
          </span>
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Hosted by MITRA UK
          </p>
        </div>
      </div>

      {/* Main Content & RSVP Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              About This Event
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Venue Location & Map
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">{event.venue}</p>
              <p>{event.address}</p>
            </div>
            
            {/* Interactive Map Placeholder */}
            <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs font-semibold">
              <MapPin className="w-5 h-5 text-mitra-red mr-2" />
              <span>Interactive Google Map Location Pin ({event.venue})</span>
            </div>
          </div>
        </div>

        {/* Right Col: RSVP Card & ICS Export */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-mitra-gold/50 shadow-xl space-y-4 sticky top-28">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-mitra-red uppercase tracking-wider block">Registration Status</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {event.ticketPrice === 0 ? 'Free RSVP' : `£${event.ticketPrice} per Ticket`}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-mitra-gold shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-mitra-gold shrink-0" />
                <span>{event.time}</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-mitra-gold shrink-0" />
                <span>{rsvpCount} / {event.capacity} Confirmed Attendees</span>
              </div> */}
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-mitra-red h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (rsvpCount / event.capacity) * 100)}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-400 block text-right">
                {Math.round((rsvpCount / event.capacity) * 100)}% Seats Reserved
              </span>
            </div>

            <button
              onClick={handleRSVP}
              disabled={rsvped}
              className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                rsvped
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-mitra-red hover:bg-mitra-red-dark text-white'
              }`}
            >
              {rsvped ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RSVP Confirmed & Ticket Issued</span>
                </>
              ) : (
                <span>Confirm RSVP Registration</span>
              )}
            </button>

            <button
              onClick={handleICSDownload}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-mitra-gold" />
              <span>Add to iCal / Outlook (.ICS)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
