'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EventItem } from '@/lib/types';
import { generateEventJsonLd } from '@/lib/seo-config';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  ArrowLeft, 
  Loader2, 
  Heart, 
  Sparkles, 
  Ticket, 
  AlertTriangle,
  Share2,
  Check,
} from 'lucide-react';
import EventLandingTemplate from '@/components/EventLandingTemplate';
import Ganesha3DHero from '@/components/Ganesha3DHero';
import RitualCountdown from '@/components/RitualCountdown';
import EventDetailsSection from '@/components/EventDetailsSection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import NotifyMeModal from '@/components/NotifyMeModal';
import DonationModal from '@/components/DonationModal';
import PoojaBookingModal from '@/components/PoojaBookingModal';
import EventRSVPModal from '@/components/EventRSVPModal';

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [poojaModalOpen, setPoojaModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== 'undefined' && event) {
      const shareUrl = window.location.href;
      const text = `🌸 *${event.title}*\n📅 ${event.date} • ${event.time}\n📍 ${event.venue}\n\nJoin us! Event passes & details:\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/events')
      .then((res) => res.json())
      .then(async (resData) => {
        let found: EventItem | null = null;
        if (resData.success && Array.isArray(resData.data)) {
          found = resData.data.find((e: EventItem) => e.id === id) ||
            resData.data.find((e: EventItem) => e.id.toLowerCase() === id.toLowerCase()) ||
            resData.data.find((e: EventItem) => (id === 'evt-ganesh-chaturthi' || id === 'evt-101') && e.title.toLowerCase().includes('ganesh')) || null;
        }

        // If not found in DB events, check template config storage
        if (!found) {
          try {
            const resTpl = await fetch(`/api/config/preferences?eventId=${encodeURIComponent(id)}`);
            const tplJson = await resTpl.json();
            if (tplJson.success && (tplJson.templateConfig || tplJson.data)) {
              const tpl = tplJson.templateConfig || tplJson.data;
              found = {
                id: tpl.id,
                title: tpl.title,
                category: 'Cultural Events',
                date: tpl.targetDate ? tpl.targetDate.slice(0, 10) : '2027-01-01',
                time: '10:00 AM',
                venue: 'London, United Kingdom',
                address: 'Slough / London, United Kingdom',
                ticketPrice: 0,
                status: 'Upcoming',
                description: tpl.hero?.tagline || tpl.title,
                bannerUrl: tpl.hero?.bannerImageUrl || '/assets/poster.jpg',
                capacity: 1000,
                rsvpCount: 250,
                featured: true,
              };
            }
          } catch {}
        }

        if (found) {
          setEvent(found);
          setRsvpCount(found.rsvpCount || 0);
        } else {
          setEvent(null);
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
  const isTemplateEvent = id.startsWith('evt-') || (event.id && event.id.startsWith('evt-'));

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

  const isCapacityFull = !!(
    event.enforceCapacityLimit &&
    event.capacity &&
    event.capacity > 0 &&
    rsvpCount >= event.capacity
  );

  const isGaneshEvent =
    event.id === 'evt-ganesh-chaturthi' ||
    event.id === 'evt-101' ||
    event.title.toLowerCase().includes('ganesh');

  // If viewing Ganesh Chaturthi event, render the full Home Page experience with 3D Ganesha & Puja booking!
  if (isGaneshEvent) {
    return (
      <div className="bg-[#FFF8F0] min-h-screen">
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
        <Ganesha3DHero 
          onNotifyClick={() => setNotifyModalOpen(true)}
          onRSVPClick={event.enableRsvp !== false ? () => setRsvpModalOpen(true) : undefined}
          onDonateClick={event.enableSupportPayment !== false ? () => setDonateModalOpen(true) : undefined}
          onBookPoojaClick={event.enablePooja !== false ? () => setPoojaModalOpen(true) : undefined}
        />

        {/* 2. RITUAL COUNTDOWN CLOCK */}
        <RitualCountdown />

        {/* 3. EVENT DETAILS, VENUE & POOJA BOOKING */}
        <EventDetailsSection 
          event={event}
          onOpenPoojaBooking={event.enablePooja !== false ? () => setPoojaModalOpen(true) : undefined} 
        />

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
        <PoojaBookingModal isOpen={poojaModalOpen} onClose={() => setPoojaModalOpen(false)} event={event} />
        {rsvpModalOpen && (
          <EventRSVPModal
            event={{
              ...event,
              rsvpCount,
            }}
            onClose={() => setRsvpModalOpen(false)}
            onSuccess={() => setRsvpCount((prev) => prev + 1)}
          />
        )}
      </div>
    );
  }

  // If viewing any template-enabled event, render the full Landing Template experience!
  if (isTemplateEvent) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <EventLandingTemplate eventId={event.id || id} />
      </>
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
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="bg-mitra-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
            {event.category}
          </span>
          <span className="bg-mitra-gold text-mitra-navy text-xs font-black px-3 py-1 rounded-full uppercase shadow">
            {event.ticketPrice === 0 ? 'FREE EVENT' : `Adult £${event.ticketPrice}`}
          </span>
          {event.childTicketPrice !== undefined && event.childTicketPrice !== null && (
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase shadow border border-amber-300">
              Child {event.childTicketPrice === 0 ? 'FREE' : `£${event.childTicketPrice}`}
            </span>
          )}
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
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
            
            {/* Embedded Google Map or Direct Search Embed */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-56 relative shadow-sm">
              <iframe
                title="Venue Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={
                  event.mapUrl && event.mapUrl.includes('embed')
                    ? event.mapUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent((event.venue || '') + ' ' + (event.address || ''))}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                }
                className="w-full h-full border-0"
              />
            </div>
            <div className="flex justify-end pt-1">
              <a
                href={
                  event.mapUrl && !event.mapUrl.includes('embed')
                    ? event.mapUrl
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.venue || '') + ' ' + (event.address || ''))}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-mitra-red dark:text-mitra-gold hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open in Google Maps &amp; Get Directions &rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Col: RSVP Card & ICS Export */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-mitra-gold/50 shadow-xl space-y-5 sticky top-28">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-mitra-red uppercase tracking-wider block">Admission / Pricing</span>
              <div className="mt-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Adult Ticket:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {event.ticketPrice === 0 ? 'Free' : `£${event.ticketPrice}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Child Ticket:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {(event.childTicketPrice ?? event.ticketPrice) === 0 ? 'Free' : `£${event.childTicketPrice ?? event.ticketPrice}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-mitra-gold shrink-0" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-mitra-gold shrink-0" />
                <span>{event.time}</span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            {event.capacity && event.capacity > 0 ? (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all ${isCapacityFull ? 'bg-red-500' : 'bg-mitra-red'}`} 
                    style={{ width: `${Math.min(100, (rsvpCount / event.capacity) * 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Capacity: {event.capacity}</span>
                  <span>{rsvpCount} Confirmed</span>
                </div>
              </div>
            ) : null}

            {/* Capacity Sold Out Banner */}
            {isCapacityFull && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Event has reached full capacity. Registrations are closed.</span>
              </div>
            )}

            {/* ACTION BUTTONS BASED ON ADMIN TOGGLES */}
            <div className="space-y-2.5 pt-2">
              {/* RSVP Button */}
              {event.enableRsvp !== false ? (
                <button
                  onClick={() => setRsvpModalOpen(true)}
                  disabled={isCapacityFull}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    isCapacityFull
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-mitra-red hover:bg-mitra-red-dark text-white hover:scale-[1.02]'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isCapacityFull ? 'Capacity Full' : 'Register / RSVP Now'}</span>
                </button>
              ) : (
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-center text-slate-500 text-xs font-medium">
                  Registration is currently not required or closed.
                </div>
              )}

              {/* Event Support Payment Button */}
              {event.enableSupportPayment !== false && (
                <button
                  onClick={() => setDonateModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Support / Sponsor Event</span>
                </button>
              )}

              {/* Book Pooja Button */}
              {event.enablePooja !== false && (
                <button
                  onClick={() => setPoojaModalOpen(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Book Pooja / Seva</span>
                </button>
              )}

              {/* Add to Calendar */}
              <button
                onClick={handleICSDownload}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-mitra-gold" />
                <span>Add to iCal / Outlook (.ICS)</span>
              </button>

              {/* WhatsApp Share & Copy Link */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  title="Share Event on WhatsApp"
                >
                  <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain brightness-0 invert" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2.5 bg-[#FFF0E0] hover:bg-[#E65C00]/10 text-[#E65C00] border border-[#E65C00]/25 rounded-xl text-xs transition-colors relative flex items-center justify-center"
                  title="Copy Event Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  {copied && (
                    <span className="absolute -top-8 right-0 bg-[#E65C00] text-white text-[10px] px-2 py-1 rounded border border-[#E65C00]/30 shadow whitespace-nowrap">
                      Link Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modals */}
      <DonationModal isOpen={donateModalOpen} onClose={() => setDonateModalOpen(false)} />
      <PoojaBookingModal isOpen={poojaModalOpen} onClose={() => setPoojaModalOpen(false)} event={event} />
      {rsvpModalOpen && (
        <EventRSVPModal
          event={{
            ...event,
            rsvpCount,
          }}
          onClose={() => setRsvpModalOpen(false)}
          onSuccess={() => setRsvpCount((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
