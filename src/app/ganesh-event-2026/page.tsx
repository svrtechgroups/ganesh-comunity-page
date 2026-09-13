'use client';

import { useState } from 'react';
import Ganesha3DHero from '@/components/Ganesha3DHero';
import RitualCountdown from '@/components/RitualCountdown';
import StorySection from '@/components/StorySection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import EventDetailsSection from '@/components/EventDetailsSection';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import PoojaBookingModal from '@/components/PoojaBookingModal';
import DonationModal from '@/components/DonationModal';
import Link from 'next/link';
import { ArrowLeft, Flame, Heart } from 'lucide-react';

export default function GaneshEvent2026Page() {
  const [poojaModalOpen, setPoojaModalOpen] = useState(false);
  const [selectedPoojaDateId, setSelectedPoojaDateId] = useState<string | undefined>(undefined);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donationCategory, setDonationCategory] = useState<'Annadanam' | 'Event Donations'>('Annadanam');

  const openPoojaBooking = (dateId?: string) => {
    setSelectedPoojaDateId(dateId);
    setPoojaModalOpen(true);
  };

  const openDonation = (cat: 'Annadanam' | 'Event Donations' = 'Annadanam') => {
    setDonationCategory(cat);
    setDonateModalOpen(true);
  };

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen">
      
      {/* Top Banner Navigation Bar */}
      <div className="bg-[#FFF3E0] border-b border-[#E65C00]/20 py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 text-xs">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[#E65C00] hover:text-[#CC4000] font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to MITRA UK Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider hidden sm:inline-block">
              LONDON GANESH MAHOTSAV 2026
            </span>
            <button
              onClick={() => openPoojaBooking()}
              className="gold-button px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
            >
              <Flame className="w-3.5 h-3.5 fill-current text-white" />
              <span>Book Pooja / Seva</span>
            </button>
            <button
              onClick={() => openDonation('Event Donations')}
              className="maroon-button px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-[#E65C00]/30"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-[#FF9A3C]" />
              <span>Make Donation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. HERO — 3D GANESHA SANCTUM WITH BOOK POOJA & MAKE DONATION CTAS */}
      <Ganesha3DHero 
        onBookPoojaClick={() => openPoojaBooking()}
        onDonateClick={() => openDonation('Event Donations')}
      />

      <EventDetailsSection 
        onOpenPoojaBooking={openPoojaBooking}
        onOpenDonation={openDonation}
      />

      {/* 2. RITUAL COUNTDOWN CLOCK */}
      <RitualCountdown />

      {/* 3. DEVOTIONAL STORY OF THE MAHOTSAV */}
      <StorySection />

      {/* 4. THE IDOL SPECS PLAQUE */}
      <IdolSpecsCard />

      {/* 5. 7-DAY FESTIVAL SCHEDULE, VENUE & SEVA PARTICIPATION */}
      

      {/* 6. MEDIA & TEASER GALLERY */}
      <MediaTeaserSection eventId="evt-ganesh-chaturthi" />

      {/* 7. GET INVOLVED — OFFERING PLAQUES & SPONSORSHIP (EMAIL INQUIRY) */}
      <OfferingPlaques />

      {/* 8. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      <SponsorRibbonBand />

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
    </div>
  );
}
