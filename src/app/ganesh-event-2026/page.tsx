'use client';

import { useState, useEffect } from 'react';
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
import EventRSVPModal from '@/components/EventRSVPModal';
import Link from 'next/link';
import { ArrowLeft, Flame, Heart, Ticket } from 'lucide-react';

export default function GaneshEvent2026Page() {
  const [poojaModalOpen, setPoojaModalOpen] = useState(false);
  const [selectedPoojaDateId, setSelectedPoojaDateId] = useState<string | undefined>(undefined);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donationCategory, setDonationCategory] = useState<'Annadanam' | 'Event Donations'>('Annadanam');
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);

  const [eventData, setEventData] = useState<any>({
    id: 'evt-ganesh-chaturthi',
    title: 'London Ganesh Mahotsav 2026',
    date: '13-20 Sep 2026',
    time: '09:00 AM - 09:00 PM',
    venue: 'E Block, Slough & Langley College, Slough, SL3 8GW',
    ticketPrice: 0,
    childTicketPrice: 0,
    capacity: 5000,
    rsvpCount: 0,
    enableRsvp: true,
    enableSupportPayment: true,
    enablePooja: true,
    enforceCapacityLimit: false,
  });

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const matched = json.data.find(
            (e: any) => e.id === 'evt-ganesh-chaturthi' || e.title.toLowerCase().includes('ganesh')
          );
          if (matched) {
            setEventData(matched);
          }
        }
      })
      .catch(() => {});
  }, []);

  const openPoojaBooking = (dateId?: string) => {
    setSelectedPoojaDateId(dateId);
    setPoojaModalOpen(true);
  };

  const openDonation = (cat: 'Annadanam' | 'Event Donations' = 'Annadanam') => {
    setDonationCategory(cat);
    setDonateModalOpen(true);
  };

  const openRSVP = () => {
    setRsvpModalOpen(true);
  };

  const isRsvpEnabled = eventData.enableRsvp !== false;
  const isPoojaEnabled = eventData.enablePooja !== false;
  const isSupportPaymentEnabled = eventData.enableSupportPayment !== false;

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
            {isRsvpEnabled && (
              <button
                onClick={openRSVP}
                className="gold-button px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Ticket className="w-3.5 h-3.5 text-white" />
                <span>Register / RSVP Now</span>
              </button>
            )}
            {isPoojaEnabled && (
              <button
                onClick={() => openPoojaBooking()}
                className="gold-button px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Flame className="w-3.5 h-3.5 fill-current text-white" />
                <span>Make Event Payment</span>
              </button>
            )}
            {isSupportPaymentEnabled && (
              <button
                onClick={() => openDonation('Event Donations')}
                className="maroon-button px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-[#E65C00]/30"
              >
                <Heart className="w-3.5 h-3.5 fill-current text-[#FF9A3C]" />
                <span>Make a Booking</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. HERO — 3D GANESHA SANCTUM WITH BOOK POOJA & MAKE DONATION CTAS */}
      <Ganesha3DHero 
        onRSVPClick={isRsvpEnabled ? openRSVP : undefined}
        onBookPoojaClick={isPoojaEnabled ? () => openPoojaBooking() : undefined}
        onDonateClick={isSupportPaymentEnabled ? () => openDonation('Event Donations') : undefined}
      />

      <EventDetailsSection 
        onOpenRSVP={isRsvpEnabled ? openRSVP : undefined}
        onOpenPoojaBooking={isPoojaEnabled ? openPoojaBooking : undefined}
        onOpenDonation={isSupportPaymentEnabled ? openDonation : undefined}
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

      {rsvpModalOpen && (
        <EventRSVPModal
          event={eventData}
          onClose={() => setRsvpModalOpen(false)}
        />
      )}
    </div>
  );
}
