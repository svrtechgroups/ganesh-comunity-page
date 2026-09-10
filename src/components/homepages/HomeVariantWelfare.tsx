'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  PhoneCall, 
  GraduationCap, 
  Users, 
  Utensils, 
  LifeBuoy, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  MessageCircle 
} from 'lucide-react';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';

export default function HomeVariantWelfare() {
  const [selectedDonation, setSelectedDonation] = useState(50);

  const SEVA_PILLARS = [
    {
      title: 'International Student Helpline',
      telugu: 'విద్యార్థి సంక్షేమ సేవ',
      icon: GraduationCap,
      desc: 'UK airport welcome advice, university accommodation vetting, part-time work legal orientation, and free grocery ration parcels during initial arrival weeks.',
      badge: 'Immediate Help',
      actionText: 'Get Student Support',
      actionLink: '/charity'
    },
    {
      title: 'Senior Citizen Care & NHS Guidance',
      telugu: 'వృద్ధుల సంరక్షణ & వైద్య సహాయం',
      icon: Heart,
      desc: 'Connecting elderly visiting parents with fluent Telugu NHS doctors, healthcare navigators, mental well-being circles, and weekly tea & cultural satsangs.',
      badge: 'Family Welfare',
      actionText: 'Request Elder Assistance',
      actionLink: '/contact'
    },
    {
      title: 'Bereavement & Consular Repatriation',
      telugu: 'మిత్ర కారుణ్య నిధి',
      icon: LifeBuoy,
      desc: '24/7 crisis response working closely with the High Commission of India, London coroner courts, and funeral directors to support families in tragedy.',
      badge: 'Mitra Karunya Nidhi',
      actionText: 'Emergency Repatriation',
      actionLink: '/contact'
    },
    {
      title: 'Annadanam & Food Hunger Relief',
      telugu: 'అన్నదాన సేవ',
      icon: Utensils,
      desc: 'Free warm vegetarian meals, prasad hampers, and winter care kits distributed to students in temporary accommodations and vulnerable community members.',
      badge: 'Food Seva',
      actionText: 'Sponsor a Meal Box',
      actionLink: '/donate'
    }
  ];

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen selection:bg-[#E65C00] selection:text-white">
      
      {/* ── 1. COMPASSIONATE SEVA HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF2E0] to-[#FFF8F0] text-[#3D1A00] pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E65C00]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#E65C00]/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-7">
          
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-md text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            <Heart className="w-4 h-4 text-[#E65C00] fill-current" />
            <span>MANAVA SEVE MADHAVA SEVA · MITRA UK WELFARE</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
              STANDING BESIDE EVERY TELUGU FAMILY
            </h1>
            <h2 className="text-lg sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
              IN JOY, IN NEED, IN UNITY — 24 HOURS A DAY
            </h2>
            <p className="text-xs sm:text-sm text-[#6B3A2A] max-w-2xl mx-auto leading-relaxed pt-1">
              Whether you are an international student facing arrival challenges, an elderly parent needing NHS language guidance, or a family navigating an unforeseen bereavement — MITRA UK Seva is your trusted sanctuary.
            </p>
          </div>

          {/* 24/7 Helpline Banner in Hero */}
          <div className="temple-card rounded-2xl p-5 border-2 border-[#E65C00]/35 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg bg-gradient-to-r from-white via-[#FFF9F2] to-white">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-full bg-[#E65C00] text-white flex items-center justify-center shrink-0 shadow-md">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-[#E65C00] tracking-wider block">
                  24/7 MITRA UK Community Helpdesk
                </span>
                <p className="text-xs font-bold text-[#3D1A00]">
                  +44 20 8123 9870 <span className="text-[#6B3A2A] font-normal">/ Direct WhatsApp Support</span>
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="gold-button px-6 py-2.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5"
            >
              <span>Request Help Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">£120,000+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Relief Disbursed</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">1,450+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Students Guided</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">22,000+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Meals Served</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">38+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Repatriation Cases</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. THE 4 PILLARS OF SEVA ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>COMMUNITY WELFARE SERVICES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            HOW MITRA CARES FOR YOU
          </h2>
          <p className="text-xs sm:text-sm text-[#6B3A2A]">
            Founded on the principle that no Telugu soul in Britain shall ever feel abandoned or alone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SEVA_PILLARS.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={idx}
                className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#E65C00]/25 space-y-5 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF0E0] border border-[#E65C00]/30 flex items-center justify-center text-[#E65C00] group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all shadow-sm">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFF0E0] text-[#E65C00] px-3 py-1 rounded-full border border-[#E65C00]/25">
                      {pillar.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#7A1620] mt-0.5">{pillar.telugu}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6B3A2A] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E65C00]/15 flex items-center justify-between">
                  <Link
                    href={pillar.actionLink}
                    className="gold-button px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>{pillar.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] text-[#6B3A2A] font-semibold">100% Free &amp; Confidential</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. COMMUNITY EMERGENCY RELIEF FUND PLAQUES ── */}
      <section className="py-16 bg-gradient-to-r from-[#FFF0E0] via-white to-[#FFF0E0] border-t border-b border-[#E65C00]/25">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-[#E65C00]/30 text-xs font-bold text-[#E65C00] uppercase shadow-sm">
            <Heart className="w-4 h-4 fill-current" />
            <span>Support Community Hardship Fund</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black font-cinzel text-[#3D1A00]">
            Help a Telugu Student or Family in Urgent Need
          </h3>
          <p className="text-xs sm:text-sm text-[#6B3A2A] max-w-xl mx-auto">
            100% of your tax-efficient donation directly funds emergency food hampers, airport stranded transit, and medical support.
          </p>

          {/* Amount Selector */}
          <div className="flex justify-center gap-3 pt-2">
            {[25, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedDonation(amt)}
                className={`px-6 py-2.5 rounded-full text-xs font-black border transition-all ${
                  selectedDonation === amt
                    ? 'gold-button scale-105 shadow-md'
                    : 'bg-white text-[#3D1A00] border-[#E65C00]/30 hover:bg-[#FFF0E0]'
                }`}
              >
                £{amt}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#6B3A2A] max-w-md mx-auto">
            {selectedDonation === 25 && '£25 provides an essential grocery & spices ration pack for an international student.'}
            {selectedDonation === 50 && '£50 covers urgent winter heating & local transit support for a newly arrived family.'}
            {selectedDonation === 100 && '£100 contributes to medical navigation and consular repatriation assistance.'}
          </div>

          <div className="pt-2">
            <Link
              href="/donate"
              className="gold-button inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              <span>Donate £{selectedDonation} to Welfare Fund</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. OFFERING PLAQUES ── */}
      <OfferingPlaques />

      {/* ── 5. SPONSOR RIBBON BAND ── */}
      <SponsorRibbonBand />

    </div>
  );
}
