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

  // Fetch flat preferences from DB for the active featured event
  const { getPreference, activeHomeEventId, isLoading } = usePreferences();

  // Build hero config directly from flat preference keys
  const heroConfig: Partial<EventHeroConfig> | undefined = isLoading ? undefined : {
    heroType:          getPreference('event.hero.heroType'),
    heroVariant:       getPreference('event.hero.heroVariant'),
    modelUrl:          getPreference('event.hero.modelUrl'),
    modelScale:        getPreference('event.hero.modelScale'),
    proceduralFallback:getPreference('event.hero.proceduralFallback'),
    showParticles:     getPreference('event.hero.showParticles'),
    showCornerMotifs:  getPreference('event.hero.showCornerMotifs'),
    showRadialAura:    getPreference('event.hero.showRadialAura'),
    bannerImageUrl:    getPreference('event.hero.bannerImageUrl'),
    videoUrl:          getPreference('event.hero.videoUrl'),
    presenterBadge:    getPreference('event.hero.presenterBadge'),
    title:             getPreference('event.hero.title'),
    subtitle:          getPreference('event.hero.subtitle'),
    tagline:           getPreference('event.hero.tagline'),
    loadingText:       getPreference('event.hero.loadingText'),
    scrollCueText:     getPreference('event.hero.scrollCueText'),
    primaryColor:      getPreference('event.hero.primaryColor'),
    accentColor:       getPreference('event.hero.accentColor'),
    backgroundColor:   getPreference('event.hero.backgroundColor'),
    primaryCta:        getPreference('event.hero.primaryCta'),
    secondaryCta:      getPreference('event.hero.secondaryCta'),
    whatsAppUrl:       getPreference('event.hero.whatsAppUrl'),
  };

  // Resolve event page URL: use activeHomeEventId first, then stored eventSlug
  const storedSlug: string | undefined = getPreference('event.eventSlug');
  const eventSlug = activeHomeEventId
    ? `events/${activeHomeEventId}`
    : storedSlug
      ? (storedSlug.startsWith('events/') ? storedSlug : `events/${storedSlug.replace(/^\/+/, '')}`)
      : undefined;

  const sections = getPreference('event.sections') || {};
  const mediaTeaser = getPreference('event.mediaTeaser');

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen">
      {/* 1. HERO — Dynamically featured Event Hero configured via Admin Panel */}
      <EventHero
        config={heroConfig}
        eventSlug={eventSlug}
        mode="home"
        onNotifyClick={() => setNotifyModalOpen(true)}
      />

      {/* 2. MITRA UK COMMUNITY SHOWCASE & PILLARS */}
      <MitraCommunitySection />

      {/* 3. MEDIA & TEASER GALLERY */}
      {sections.showMediaGallery && (
        <MediaTeaserSection
          eventId={activeHomeEventId || undefined}
          videoUrl={mediaTeaser?.videoUrl || heroConfig?.videoUrl}
          sectionTitle={mediaTeaser?.sectionTitle}
          subtitle={mediaTeaser?.subtitle}
          posterUrl={mediaTeaser?.posterUrl || heroConfig?.bannerImageUrl}
        />
      )}

      {/* 4. GET INVOLVED — OFFERING PLAQUES & SPONSOR EMAIL INQUIRY */}
      {sections.showOfferings && <OfferingPlaques />}

      {/* 5. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      {sections.showSponsors && <SponsorRibbonBand />}

      {/* MODAL FORMS */}
      <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
    </div>
  );
}
