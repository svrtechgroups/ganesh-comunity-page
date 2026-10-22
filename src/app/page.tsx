'use client';

import { useState } from 'react';
import EventHero from '@/components/EventHero';
import MitraCommunitySection from '@/components/MitraCommunitySection';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import NotifyMeModal from '@/components/NotifyMeModal';
import { usePreferences } from '@/hooks/usePreferences';
import type { EventHeroConfig } from '@/types/event-template';

export default function HomePage() {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  // Fetch flat preferences from DB for the active featured event or default home
  const { getPreference, activeHomeEventId, isLoading } = usePreferences();

  const isDefaultHome = !activeHomeEventId || activeHomeEventId === 'default-home' || activeHomeEventId === 'none';

  // Build hero config directly from flat preference keys
  const heroConfig: Partial<EventHeroConfig> | undefined = isLoading ? undefined : {
    heroType:          getPreference('event.hero.heroType', isDefaultHome ? 'image' : '3d-model'),
    heroVariant:       getPreference('event.hero.heroVariant', isDefaultHome ? 'image-split' : '3d-sanctum'),
    modelUrl:          getPreference('event.hero.modelUrl', '/assets/idols/Lord Ganesh.glb'),
    modelScale:        getPreference('event.hero.modelScale', 2.8),
    proceduralFallback:getPreference('event.hero.proceduralFallback', 'none'),
    showParticles:     getPreference('event.hero.showParticles', isDefaultHome ? false : true),
    showCornerMotifs:  getPreference('event.hero.showCornerMotifs', true),
    showRadialAura:    getPreference('event.hero.showRadialAura', true),
    bannerImageUrl:    getPreference('event.hero.bannerImageUrl', '/assets/poster.jpg'),
    videoUrl:          getPreference('event.hero.videoUrl'),
    presenterBadge:    getPreference('event.hero.presenterBadge', isDefaultHome ? 'Mana Indian Telugu Roots Abroad (MITRA UK)' : 'Welcome to MITRA UK'),
    title:             getPreference('event.hero.title', isDefaultHome ? 'PRESERVING TELUGU HERITAGE' : 'MITRA UK Event'),
    subtitle:          getPreference('event.hero.subtitle', isDefaultHome ? 'UNITING COMMUNITIES ACROSS THE UNITED KINGDOM' : 'Experience Culture & Community'),
    tagline:           getPreference('event.hero.tagline', isDefaultHome ? 'Serving over 25,000 Telugu-speaking families across Britain through culture, language, and community seva.' : ''),
    loadingText:       getPreference('event.hero.loadingText', 'LOADING...'),
    scrollCueText:     getPreference('event.hero.scrollCueText', isDefaultHome ? 'Explore MITRA Community' : 'Scroll to Explore'),
    primaryColor:      getPreference('event.hero.primaryColor', '#E65C00'),
    accentColor:       getPreference('event.hero.accentColor', '#CC4000'),
    backgroundColor:   getPreference('event.hero.backgroundColor', '#FFF8F0'),
    primaryCta:        getPreference('event.hero.primaryCta', isDefaultHome ? { label: '', action: 'none' } : { label: 'Register Now', action: 'rsvp' }),
    secondaryCta:      getPreference('event.hero.secondaryCta', isDefaultHome ? { label: '', action: 'none' } : undefined),
    whatsAppUrl:       getPreference('event.hero.whatsAppUrl', 'https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd'),
  };

  // Resolve event page URL: only if an event is actively featured
  const storedSlug: string | undefined = getPreference('event.eventSlug');
  const eventSlug = !isDefaultHome
    ? (activeHomeEventId
        ? `events/${activeHomeEventId}`
        : storedSlug
          ? (storedSlug.startsWith('events/') ? storedSlug : `events/${storedSlug.replace(/^\/+/, '')}`)
          : undefined)
    : undefined;

  const sections = getPreference('event.sections') || {};
  const mediaTeaser = getPreference('event.mediaTeaser');

  const showCommunity = sections.showEventDetails !== false;
  const showMedia = isDefaultHome ? (sections.showMediaGallery !== false) : Boolean(sections.showMediaGallery);
  const showOfferings = isDefaultHome ? (sections.showOfferings !== false) : Boolean(sections.showOfferings);
  const showSponsors = isDefaultHome ? (sections.showSponsors !== false) : Boolean(sections.showSponsors);

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen">
      {/* 1. HERO — Dynamically featured Event Hero or Standard MITRA Home Hero */}
      <EventHero
        config={heroConfig}
        eventSlug={eventSlug}
        mode="home"
        isDefaultHome={isDefaultHome}
        onNotifyClick={() => setNotifyModalOpen(true)}
      />

      {/* 2. MITRA UK COMMUNITY SHOWCASE & 4 CORE PILLARS */}
      {showCommunity && <MitraCommunitySection />}

      {/* 3. MEDIA & TEASER GALLERY */}
      {showMedia && (
        <MediaTeaserSection
          eventId={!isDefaultHome ? (activeHomeEventId || undefined) : undefined}
          videoUrl={mediaTeaser?.videoUrl || heroConfig?.videoUrl}
          sectionTitle={mediaTeaser?.sectionTitle || (isDefaultHome ? 'COMMUNITY MEDIA & CULTURAL HIGHLIGHTS' : undefined)}
          subtitle={mediaTeaser?.subtitle || (isDefaultHome ? 'Experience cultural festival highlights, community gatherings, and media assets.' : undefined)}
          posterUrl={mediaTeaser?.posterUrl || heroConfig?.bannerImageUrl}
        />
      )}

      {/* 5. GET INVOLVED — OFFERING PLAQUES & SPONSOR EMAIL INQUIRY */}
      {showOfferings && <OfferingPlaques />}

      {/* 6. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      {showSponsors && <SponsorRibbonBand />}

      {/* MODAL FORMS */}
      <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
    </div>
  );
}
