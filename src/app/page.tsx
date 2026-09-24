'use client';

import { useState, useEffect } from 'react';
import EventHero from '@/components/EventHero';
import MitraCommunitySection from '@/components/MitraCommunitySection';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import NotifyMeModal from '@/components/NotifyMeModal';
import { EventTemplateConfig } from '@/types/event-template';

export default function HomePage() {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [activeEventConfig, setActiveEventConfig] = useState<EventTemplateConfig | null>(null);

  useEffect(() => {
    fetch('/api/config/preferences?featured=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && (json.templateConfig || json.data)) {
          setActiveEventConfig(json.templateConfig || json.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load active home hero config:', err);
      });
  }, []);

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen">
      {/* 1. HERO — Dynamically featured Event Hero (3D Model / Image / Video) configured via Admin Panel */}
      <EventHero
        config={activeEventConfig?.hero}
        eventSlug={activeEventConfig?.eventSlug || 'ganesh-event-2026'}
        mode="home"
        onNotifyClick={() => setNotifyModalOpen(true)}
      />

      {/* 2. MITRA UK COMMUNITY SHOWCASE & PILLARS */}
      <MitraCommunitySection />

      {/* 3. MEDIA & TEASER GALLERY */}
      <MediaTeaserSection />

      {/* 4. GET INVOLVED — OFFERING PLAQUES & SPONSOR EMAIL INQUIRY */}
      <OfferingPlaques />

      {/* 5. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      <SponsorRibbonBand />

      {/* MODAL FORMS */}
      <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
    </div>
  );
}
