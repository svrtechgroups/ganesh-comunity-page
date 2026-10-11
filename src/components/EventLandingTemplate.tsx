'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Ticket, Loader2, Image as ImageIcon } from 'lucide-react';
import EventHero from '@/components/EventHero';
import EventDetailsSection from '@/components/EventDetailsSection';
import RitualCountdown from '@/components/RitualCountdown';
import StorySection from '@/components/StorySection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import { EventTemplateConfig } from '@/types/event-template';

// Heavy modals: lazy-loaded on demand to reduce initial page bundle size
const PoojaBookingModal = dynamic(() => import('@/components/PoojaBookingModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>,
});
const DonationModal = dynamic(() => import('@/components/DonationModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>,
});
const NotifyMeModal = dynamic(() => import('@/components/NotifyMeModal'), { ssr: false });
const EventRSVPModal = dynamic(() => import('@/components/EventRSVPModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"><Loader2 className="w-8 h-8 text-orange-400 animate-spin" /></div>,
});


export interface EventLandingTemplateProps {
  eventId?: string;
  config?: EventTemplateConfig;
  event?: any;
}

const DEFAULT_GANESH_CONFIG: EventTemplateConfig = {
  id: 'evt-ganesh-chaturthi',
  title: 'London Ganesh Mahotsav 2026',
  eventSlug: 'ganesh-event-2026',
  targetDate: '2026-09-14T00:00:00.000Z',
  hero: {
    heroType: '3d-model',
    modelUrl: '/assets/idols/Lord Ganesh.glb',
    modelScale: 2.8,
    proceduralFallback: 'none',
    bannerImageUrl: '/assets/poster.jpg',
    presenterBadge: 'Welcome to Mana Indian Telugu Roots Abroad (MITRA UK)',
    title: 'THE BIGGEST MAHA GANAPATHI',
    subtitle: 'LONDON GANESH MAHOTSAV 2026',
    tagline: 'Streaming 3D Bappa Murti & Devotional Rays',
    loadingText: 'ENTERING SANCTUM...',
    scrollCueText: 'Scroll to Enter Sanctum',
    primaryColor: '#E65C00',
    accentColor: '#CC4000',
    backgroundColor: '#FFF8F0',
    primaryCta: {
      label: 'Book Pooja / Seva',
      action: 'pooja',
    },
    secondaryCta: {
      label: 'Make Donation',
      action: 'donation',
    },
    whatsAppUrl: 'https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd',
  },
  sections: {
    showCountdown: true,
    showEventDetails: true,
    showStory: true,
    showSpecs: true,
    showMediaGallery: true,
    showOfferings: true,
    showSponsors: true,
  },
};

export default function EventLandingTemplate({
  eventId = 'evt-ganesh-chaturthi',
  config: initialConfig,
  event: initialEvent,
}: EventLandingTemplateProps) {
  const [templateConfig, setTemplateConfig] = useState<EventTemplateConfig>(
    initialConfig || DEFAULT_GANESH_CONFIG
  );
  const [loading, setLoading] = useState<boolean>(!initialConfig && eventId !== 'evt-ganesh-chaturthi');
  const [poojaModalOpen, setPoojaModalOpen] = useState(false);
  const [selectedPoojaDateId, setSelectedPoojaDateId] = useState<string | undefined>(undefined);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donationCategory, setDonationCategory] = useState<'Annadanam' | 'Event Donations'>('Annadanam');
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [dbEvent, setDbEvent] = useState<any>(initialEvent || null);
  const [rsvpCount, setRsvpCount] = useState<number>(initialEvent?.rsvpCount || 0);

  // Load custom template config from JSON storage if eventId is provided
  useEffect(() => {
    if (initialConfig) {
      setTemplateConfig(initialConfig);
      setLoading(false);
    }

    if (eventId) {
      if (eventId !== 'evt-ganesh-chaturthi' && !initialConfig) {
        setLoading(true);
      }
      fetch(`/api/config/preferences?eventId=${encodeURIComponent(eventId)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && (json.templateConfig || json.data)) {
            setTemplateConfig(json.templateConfig || json.data);
          }
        })
        .catch((err) => {
          console.warn('Using default template config:', err);
        })
        .finally(() => {
          setLoading(false);
        });

      if (!initialEvent) {
        fetch(`/api/events?id=${encodeURIComponent(eventId)}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.data) {
              setDbEvent(json.data);
              setRsvpCount(json.data.rsvpCount || 0);
            }
          })
          .catch(() => {});
      }
    }
  }, [eventId, initialConfig, initialEvent]);

  const openPoojaBooking = (dateId?: string) => {
    setSelectedPoojaDateId(dateId);
    setPoojaModalOpen(true);
  };

  const openDonation = (cat: 'Annadanam' | 'Event Donations' = 'Annadanam') => {
    setDonationCategory(cat);
    setDonateModalOpen(true);
  };

  const openRsvp = () => {
    setRsvpModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#FFF8F0] text-slate-800">
        <Loader2 className="w-8 h-8 text-[#E65C00] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Loading Event Experience...</p>
      </div>
    );
  }

  const { hero, sections } = templateConfig;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: hero.backgroundColor || '#FFF8F0',
        color: '#3D1A00',
      }}
    >
      {/* Top Banner Navigation Bar */}
      <div className="bg-[#FFF3E0] border-b border-[#E65C00]/20 py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 text-xs">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 font-bold text-[#E65C00] hover:text-[#CC4000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={openRsvp}
              className="gold-button px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>RSVP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION (3D / Image / Video) */}
      <EventHero
        config={hero}
        eventSlug={templateConfig.eventSlug}
        mode="event"
        onBookPoojaClick={() => openPoojaBooking()}
        onDonateClick={() => openDonation('Event Donations')}
        onRsvpClick={openRsvp}
        onNotifyClick={openRsvp}
      />
      {/* MEDIA GALLERY LINK BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href={`/media?event=${templateConfig.id || eventId}`} className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-xl border border-slate-700/50 gap-4 group hover:border-mitra-gold/50 transition-colors">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <ImageIcon className="w-5 h-5 text-mitra-gold" />
              Official Event Media Gallery
            </h3>
            <p className="text-sm text-slate-300">
              View high-resolution photos, video reels, and highlights from this event.
            </p>
          </div>
          <div className="shrink-0 bg-mitra-red hover:bg-[#c22026] text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 group-hover:scale-105">
            <ImageIcon className="w-4 h-4" />
            <span>View Gallery</span>
          </div>
        </Link>
      </div>      {/* 3. RITUAL COUNTDOWN CLOCK */}
      {sections.showCountdown && (
        <RitualCountdown
          targetDate={dbEvent?.date||templateConfig.targetDate}
          eventTitle={templateConfig.title}
          primaryColor={hero.primaryColor}
          accentColor={hero.accentColor}
          backgroundColor={hero.backgroundColor}
        />
      )}

      {/* 4. DEVOTIONAL / ABOUT STORY */}
      {sections.showStory && (
        <StorySection
          story={templateConfig.story}
          bannerImageUrl={hero.bannerImageUrl}
          primaryColor={hero.primaryColor}
          accentColor={hero.accentColor}
          backgroundColor={hero.backgroundColor}
        />
      )}

      {/* 5. SPECIFICATIONS / HIGHLIGHTS */}
      {sections.showSpecs && (
        <IdolSpecsCard
          specs={templateConfig.specs}
          primaryColor={hero.primaryColor}
          bannerImageUrl={hero.bannerImageUrl}
        />
      )}

      {/* 6. MEDIA & TEASER GALLERY */}
      {sections.showMediaGallery && (
        <MediaTeaserSection
          eventId={templateConfig.id}
          videoUrl={templateConfig.mediaTeaser?.videoUrl || hero.videoUrl}
          sectionTitle={templateConfig.mediaTeaser?.sectionTitle}
          subtitle={templateConfig.mediaTeaser?.subtitle}
          posterUrl={templateConfig.mediaTeaser?.posterUrl || hero.bannerImageUrl}
        />
      )}

      {/* 7. COMMUNITY OFFERINGS & PARTICIPATION */}
      {sections.showOfferings && <OfferingPlaques />}

      {/* 8. SPONSOR RIBBON BAND */}
      {sections.showSponsors && <SponsorRibbonBand />}

      {/* MODAL DIALOGS */}
      <PoojaBookingModal
        isOpen={poojaModalOpen}
        onClose={() => setPoojaModalOpen(false)}
        initialDateId={selectedPoojaDateId}
      />

      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        initialCategory={donationCategory}
        eventId={templateConfig.id}
        eventName={templateConfig.title}
      />

      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
      />

      {rsvpModalOpen && (
        <EventRSVPModal
          event={{
            id: dbEvent?.id || templateConfig.id || eventId,
            title: dbEvent?.title || templateConfig.title,
            date: dbEvent?.date || (templateConfig.targetDate ? templateConfig.targetDate.slice(0, 10) : '2026-09-26'),
            time: dbEvent?.time || '09:00 AM',
            venue: dbEvent?.venue || 'London / United Kingdom',
            ticketPrice: dbEvent?.ticketPrice ?? 0,
            childTicketPrice: dbEvent?.childTicketPrice ?? 0,
            capacity: dbEvent?.capacity ?? 500,
            rsvpCount: rsvpCount,
            enforceCapacityLimit: dbEvent?.enforceCapacityLimit ?? false,
            enableRsvp: dbEvent?.enableRsvp ?? true,
            availableDates: dbEvent?.availableDates || [],
            eventSchedule: dbEvent?.eventSchedule || [],
            adultCapacity: dbEvent?.adultCapacity ?? 0,
            childCapacity: dbEvent?.childCapacity ?? 0,
            customFields: dbEvent?.customFields || [],
          }}
          onClose={() => setRsvpModalOpen(false)}
          onSuccess={() => setRsvpCount((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
