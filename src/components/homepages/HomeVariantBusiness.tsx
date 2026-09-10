'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Briefcase, 
  Stethoscope, 
  Scale, 
  UtensilsCrossed, 
  Home, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Phone, 
  Star, 
  GraduationCap 
} from 'lucide-react';
import MitraCommunitySection from '@/components/MitraCommunitySection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';

export default function HomeVariantBusiness() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    { id: 'all', label: 'All Industries', count: '1,200+' },
    { id: 'it', label: 'IT & Cloud Architecture', count: '480+' },
    { id: 'health', label: 'NHS Doctors & Clinics', count: '290+' },
    { id: 'legal', label: 'Solicitors & Mortgages', count: '140+' },
    { id: 'catering', label: 'Telugu Sweets & Food', count: '180+' },
    { id: 'property', label: 'Real Estate & Lettings', count: '110+' },
  ];

  const FEATURED_BUSINESSES = [
    {
      name: 'Vedic Cloud Solutions UK',
      category: 'it',
      categoryName: 'IT & Cloud Architecture',
      location: 'Canary Wharf, London',
      rating: 4.9,
      reviews: 42,
      desc: 'Enterprise AWS/Azure migration, GenAI integration, and data analytics consulting led by Telugu tech leaders in the UK.',
      phone: '+44 20 7946 0192',
      badge: 'Gold Verified Patron'
    },
    {
      name: 'Dr. Rao Specialist Dental & Orthodontics',
      category: 'health',
      categoryName: 'NHS & Private Healthcare',
      location: 'Slough & Reading',
      rating: 5.0,
      reviews: 86,
      desc: 'Comprehensive multi-speciality dental surgery serving Thames Valley diaspora families with personalised care.',
      phone: '+44 1753 581290',
      badge: 'Verified Health Partner'
    },
    {
      name: 'Godavari Traditional Sweets & Catering',
      category: 'catering',
      categoryName: 'Authentic Andhra & Telangana Foods',
      location: 'Hounslow, Greater London',
      rating: 4.8,
      reviews: 135,
      desc: 'Authentic Pootharekulu, Bobbatlu, Gongura Biryani, and grand wedding catering across England and Wales.',
      phone: '+44 20 8572 4910',
      badge: 'Official Caterer'
    },
    {
      name: 'Thamesbridge Solicitors & Immigration',
      category: 'legal',
      categoryName: 'Legal & Immigration Services',
      location: 'Holborn, Central London',
      rating: 4.9,
      reviews: 64,
      desc: 'Skilled worker visas, ILR, student graduate routes, and property conveyancing with fluent Telugu solicitors.',
      phone: '+44 20 7183 9022',
      badge: 'Community Legal Advisory'
    },
    {
      name: 'Kakatiya Estates & Property Advisory',
      category: 'property',
      categoryName: 'Real Estate & Lettings',
      location: 'Milton Keynes & Northampton',
      rating: 4.7,
      reviews: 38,
      desc: 'Buy-to-let portfolios, residential mortgages, and HMO investment consulting for Indian diaspora professionals.',
      phone: '+44 1908 619400',
      badge: 'Property Partner'
    },
    {
      name: 'Apex AI Healthtech Consultancy',
      category: 'it',
      categoryName: 'AI & Data Science',
      location: 'Cambridge & Shoreditch',
      rating: 5.0,
      reviews: 29,
      desc: 'AI software architectures for biotechnology, NHS hospital informatics, and private healthcare startups.',
      phone: '+44 1223 849011',
      badge: 'Tech Innovation Member'
    }
  ];

  const filteredBusinesses = FEATURED_BUSINESSES.filter(biz => {
    const matchesCategory = selectedCategory === 'all' || biz.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      biz.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biz.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FFF8F0] text-[#3D1A00] min-h-screen selection:bg-[#E65C00] selection:text-white">
      
      {/* ── 1. TEMPLE BUSINESS & ENTERPRISE HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF2E0] to-[#FFF8F0] text-[#3D1A00] pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E65C00]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#E65C00]/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-7">
          
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-md text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#E65C00]" />
            <span>MANA TELUGU NETWORK · BUSINESS &amp; ENTERPRISE HUB</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
              CONNECTING TELUGU LEADERS
            </h1>
            <h2 className="text-lg sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
              BRITISH-TELUGU FOUNDERS, DOCTORS &amp; NEXT-GEN INNOVATORS
            </h2>
            <p className="text-xs sm:text-sm text-[#6B3A2A] max-w-2xl mx-auto leading-relaxed pt-1">
              Empowering over 1,200 verified Telugu businesses, NHS medical specialists, IT consultancies, and student entrepreneurs across the UK.
            </p>
          </div>

          {/* Business Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-2.5 rounded-full shadow-xl flex items-center gap-3 border-2 border-[#E65C00]/40">
              <Search className="w-5 h-5 text-[#E65C00] ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, solicitors, IT consultancies, caterers in London, Slough, Reading..."
                className="w-full text-xs sm:text-sm text-[#3D1A00] placeholder-[#6B3A2A]/60 focus:outline-none bg-transparent"
              />
              <Link
                href="/telugu-business"
                className="gold-button px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0"
              >
                Directory
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">1,200+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Verified Businesses</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">£45M+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Diaspora Trade</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">3,400+</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Tech &amp; NHS Members</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E65C00]/25 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black font-cinzel text-[#E65C00]">100%</div>
              <div className="text-[11px] text-[#6B3A2A] font-bold uppercase mt-1">Community Verified</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. BUSINESS DIRECTORY SHOWCASE ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E65C00]/20 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              <span>COMMUNITY COMMERCE &amp; SERVICES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-cinzel gold-foil-text tracking-wider">
              VERIFIED UK TELUGU DIRECTORY
            </h2>
            <p className="text-xs sm:text-sm text-[#6B3A2A]">
              Support trusted Telugu entrepreneurs, medical consultants, solicitors, and caterers across Britain.
            </p>
          </div>
          <Link
            href="/telugu-business"
            className="gold-button px-6 py-2.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5"
          >
            <span>Register Your Business Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
                selectedCategory === cat.id
                  ? 'gold-button shadow-md'
                  : 'bg-white text-[#3D1A00] border-[#E65C00]/25 hover:bg-[#FFF0E0]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[#FFF0E0] text-[#E65C00]'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredBusinesses.map((biz, idx) => (
            <div
              key={idx}
              className="temple-card temple-card-hover rounded-3xl p-6 border border-[#E65C00]/30 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFF0E0] text-[#E65C00] px-2.5 py-1 rounded-full border border-[#E65C00]/20">
                    {biz.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{biz.rating}</span>
                    <span className="text-[#6B3A2A] font-normal">({biz.reviews})</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
                    {biz.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#7A1620] mt-0.5">{biz.categoryName}</p>
                </div>

                <p className="text-xs text-[#6B3A2A] leading-relaxed">
                  {biz.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E65C00]/15 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[#6B3A2A]">
                  <MapPin className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
                  <span>{biz.location}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[#3D1A00]">{biz.phone}</span>
                  <Link
                    href="/telugu-business"
                    className="inline-flex items-center gap-1 text-[#E65C00] font-bold hover:underline"
                  >
                    <span>View Listing</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── 3. YOUNG PROFESSIONALS (YTP) MENTORSHIP ── */}
      <section className="py-20 bg-gradient-to-r from-[#FFF0E0] via-white to-[#FFF0E0] border-t border-b border-[#E65C00]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1 rounded-full border border-[#E65C00]/30 text-xs font-bold text-[#E65C00] uppercase shadow-sm">
              <Users className="w-4 h-4" />
              <span>YOUTH &amp; PROFESSIONAL MENTORSHIP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-cinzel text-[#3D1A00]">
              Young Telugu Professionals (YTP)
            </h2>
            <p className="text-xs sm:text-sm text-[#6B3A2A]">
              Connecting university graduates and early arrivals with senior British-Telugu partners in the City of London, Canary Wharf, Big Tech, and NHS clinical chairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/30 space-y-3 bg-white">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black font-cinzel text-[#3D1A00]">1-on-1 Mentorship</h4>
              <p className="text-xs text-[#6B3A2A]">CV reviews, tier-2 work visa orientation, and corporate interview prep with senior executives.</p>
            </div>

            <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/30 space-y-3 bg-white">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black font-cinzel text-[#3D1A00]">Student-to-Career Bridge</h4>
              <p className="text-xs text-[#6B3A2A]">Campus chapters in 14 UK universities supporting international Telugu students.</p>
            </div>

            <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/30 space-y-3 bg-white">
              <div className="w-12 h-12 rounded-xl bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black font-cinzel text-[#3D1A00]">Founders Pitch Fest</h4>
              <p className="text-xs text-[#6B3A2A]">Bi-annual showcase giving diaspora tech startups access to British-Telugu angel syndicates.</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/contact"
              className="gold-button px-8 py-3 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-lg"
            >
              <span>Join YTP Mentorship Program</span>
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
