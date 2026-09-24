'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Heart, Calendar, Loader2 } from 'lucide-react';
import EventHero from '@/components/EventHero';
import EventDetailsSection from '@/components/EventDetailsSection';
import RitualCountdown from '@/components/RitualCountdown';
import StorySection from '@/components/StorySection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import PoojaBookingModal from '@/components/PoojaBookingModal';
import DonationModal from '@/components/DonationModal';
import NotifyMeModal from '@/components/NotifyMeModal';
import { EventTemplateConfig } from '@/types/event-template';

export interface EventLandingTemplateProps {
  eventId?: string;
  config?: EventTemplateConfig;
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

  // Load custom template config from JSON storage if eventId is provided
  useEffect(() => {
    if (initialConfig) {
      setTemplateConfig(initialConfig);
      setLoading(false);
      return;
    }

    if (eventId) {
      if (eventId !== 'evt-ganesh-chaturthi') {
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
    }
  }, [eventId, initialConfig]);

  const openPoojaBooking = (dateId?: string) => {
    setSelectedPoojaDateId(dateId);
    setPoojaModalOpen(true);
  };

  const openDonation = (cat: 'Annadanam' | 'Event Donations' = 'Annadanam') => {
    setDonationCategory(cat);
    setDonateModalOpen(true);
  };

  const openRsvp = () => {
    setNotifyModalOpen(true);
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
            {sections.showCountdown && (
              <a
                href="#ritual-clock"
                className="hidden sm:inline-flex items-center gap-1 text-[#6B3A2A] font-semibold hover:text-[#E65C00] transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Countdown</span>
              </a>
            )}

            {sections.showEventDetails && (
              <a
                href="#event-details"
                className="inline-flex items-center gap-1 text-[#6B3A2A] font-semibold hover:text-[#E65C00] transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Schedule</span>
              </a>
            )}

            {hero.secondaryCta && (
              <button
                onClick={() => openDonation('Annadanam')}
                className="inline-flex items-center gap-1 bg-[#E65C00]/10 hover:bg-[#E65C00]/20 text-[#E65C00] px-3 py-1 rounded-full font-bold transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-[#E65C00]" />
                <span>{hero.secondaryCta.label}</span>
              </button>
            )}
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

      {/* 2. EVENT DETAILS & SCHEDULE */}
      {sections.showEventDetails && (
        <div id="event-details">
          <EventDetailsSection
            eventId={templateConfig.id}
            eventTitle={templateConfig.title}
            targetDate={templateConfig.targetDate}
            primaryColor={hero.primaryColor}
            accentColor={hero.accentColor}
            backgroundColor={hero.backgroundColor}
            onOpenPoojaBooking={openPoojaBooking}
            onOpenDonation={openDonation}
            onOpenRsvp={openRsvp}
          />
        </div>
      )}

      {/* 3. RITUAL COUNTDOWN CLOCK */}
      {sections.showCountdown && (
        <RitualCountdown
          targetDate={templateConfig.targetDate}
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
        <MediaTeaserSection eventId={templateConfig.id} />
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
      />

      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
      />
    </div>
  );
}
