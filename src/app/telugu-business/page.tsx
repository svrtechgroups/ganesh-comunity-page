'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Star, 
  Filter, 
  X, 
  ExternalLink,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeluguBusiness } from '@/lib/types';

const CATEGORIES = [
  'All',
  'IT & Software Services',
  'Restaurants & Catering',
  'Real Estate & Mortgages',
  'Legal & Immigration',
  'Accounting & Tax Services',
  'Healthcare & Dental',
  'Retail & Groceries',
  'Event Management & Photography',
  'Automobile & Logistics',
  'Education & Tutoring',
  'Other Services',
];

const POPULAR_CITIES = ['All', 'London', 'Slough', 'Milton Keynes', 'Birmingham', 'Reading', 'Manchester', 'Swindon'];

export default function TeluguBusinessPage() {
  const [businesses, setBusinesses] = useState<TeluguBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: 'IT & Software Services',
    tagline: '',
    description: '',
    logoUrl: '',
    coverUrl: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    address: '',
    city: 'London',
    postcode: '',
    specialOffer: '',
  });

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telugu-business');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBusinesses(data.data);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/telugu-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E65C00', '#FFB800', '#2E7D32', '#FFFFFF'],
        });
        setFormData({
          businessName: '',
          ownerName: '',
          category: 'IT & Software Services',
          tagline: '',
          description: '',
          logoUrl: '',
          coverUrl: '',
          email: '',
          phone: '',
          whatsapp: '',
          website: '',
          address: '',
          city: 'London',
          postcode: '',
          specialOffer: '',
        });
      } else {
        setFormError(data.error || 'Failed to submit business request');
      }
    } catch {
      setFormError('Failed to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || b.city.toLowerCase() === selectedCity.toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    if (!q) return matchesCategory && matchesCity;

    const matchesSearch =
      b.businessName.toLowerCase().includes(q) ||
      b.ownerName.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      (b.tagline && b.tagline.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      (b.specialOffer && b.specialOffer.toLowerCase().includes(q));

    return matchesCategory && matchesCity && matchesSearch;
  });

  const featuredBusinesses = filteredBusinesses.filter((b) => b.isFeatured);
  const regularBusinesses = filteredBusinesses.filter((b) => !b.isFeatured);

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] pb-24 selection:bg-[#E65C00] selection:text-white">
      
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3D1A00] via-[#4A2200] to-[#3D1A00] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#E65C00]">
        
        {/* Background Mandala & Glows */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E65C00]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FFB800]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E65C00]/20 border border-[#FFB800]/40 text-[#FFD4A0] text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>MITRA UK Community Business Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-cinzel text-[#FFF8F0] tracking-wide leading-tight">
            TELUGU BUSINESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9A3C] via-[#FFD4A0] to-[#FF9A3C]">NETWORK UK</span>
          </h1>

          <p className="text-sm sm:text-base text-[#FFD4A0]/90 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover, support, and connect with trusted Telugu-owned businesses, service providers, and innovators across the United Kingdom. Promoting community commerce and empowering Telugu entrepreneurs abroad.
          </p>

          {/* Quick Action CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setModalOpen(true);
              }}
              className="gold-button px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Register Your Business (Free)</span>
            </button>

            <a
              href="#directory"
              className="px-6 py-3.5 rounded-full text-xs font-bold text-[#FFD4A0] hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span>Explore Directory</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Search Bar in Hero */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div className="relative bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl border-2 border-[#E65C00]/40 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
                <Search className="w-5 h-5 text-[#E65C00] shrink-0" />
                <input
                  type="text"
                  placeholder="Search by business name, IT, catering, legal, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[#3D1A00] placeholder:text-[#6B3A2A]/60 text-xs sm:text-sm font-semibold outline-none py-2"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* City quick filter in search bar */}
              <div className="w-full sm:w-auto flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                <MapPin className="w-4 h-4 text-[#E65C00] shrink-0 mr-1" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#3D1A00] outline-none py-1.5 pr-4 cursor-pointer"
                >
                  <option value="All">All Cities</option>
                  {POPULAR_CITIES.filter(c => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN DIRECTORY AREA ── */}
      <div id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        
        {/* Category Filter Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black font-cinzel text-[#3D1A00] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E65C00]" />
              <span>Filter by Industry &amp; Category</span>
            </h2>
            <span className="text-xs text-[#6B3A2A] font-bold">
              Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'Business' : 'Businesses'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white shadow-md shadow-[#E65C00]/25 scale-105'
                      : 'bg-white text-[#3D1A00] border border-[#E65C00]/20 hover:border-[#E65C00]/60 hover:bg-[#FFF0E0]'
                  }`}
                >
                  <span>{cat}</span>
                  {cat === 'All' && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-black">
                      {businesses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FEATURED BUSINESSES BANNER (if any exist in current filter) ── */}
        {featuredBusinesses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E65C00] text-white">
                <Star className="w-3.5 h-3.5 fill-current" />
              </span>
              <h2 className="text-lg font-black font-cinzel text-[#3D1A00] tracking-wide">
                FEATURED COMMUNITY PARTNERS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} isFeatured />
              ))}
            </div>
          </div>
        )}

        {/* ── ALL / REGULAR BUSINESSES ── */}
        <div className="space-y-4">
          {featuredBusinesses.length > 0 && regularBusinesses.length > 0 && (
            <h2 className="text-base font-black font-cinzel text-[#3D1A00] tracking-wide pt-4 border-t border-[#E65C00]/20">
              ALL TELUGU BUSINESSES
            </h2>
          )}

          {filteredBusinesses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#E65C00]/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#3D1A00]">No Businesses Found</h3>
                <p className="text-xs text-[#6B3A2A] max-w-md mx-auto">
                  No registered businesses matched your current search filters. Try changing your search keywords, category, or city.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#E65C00] text-white hover:bg-[#CC4000] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </div>

        {/* ── BOTTOM CALLOUT: REGISTER YOUR BUSINESS ── */}
        <div className="bg-gradient-to-r from-[#4A2200] via-[#5A2A00] to-[#4A2200] border-2 border-[#E65C00]/40 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="bg-[#E65C00] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Grow with MITRA UK
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-[#FFF8F0]">
              Are You a Telugu Business Owner in the UK?
            </h3>
            <p className="text-xs sm:text-sm text-[#FFD4A0] max-w-xl leading-relaxed">
              Join hundreds of Telugu professionals, restaurants, service providers, and firms. Showcase your business directly to thousands of Telugu diaspora families across Great Britain.
            </p>
          </div>

          <button
            onClick={() => {
              setSubmitSuccess(false);
              setModalOpen(true);
            }}
            className="gold-button px-8 py-4 rounded-full text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform z-10"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Submit Business Application</span>
          </button>
        </div>

      </div>

      {/* ── MODAL: REGISTER BUSINESS FORM ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFAF5] border-2 border-[#E65C00] rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl my-8">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FFF0E0] text-[#E65C00] hover:bg-[#E65C00] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black font-cinzel text-[#3D1A00]">
                    Application Submitted!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B3A2A] max-w-md mx-auto leading-relaxed">
                    Thank you for applying to the MITRA UK Telugu Business Directory. Your listing has been submitted for administrative verification and will be published once approved.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-xs font-black bg-[#E65C00] text-white hover:bg-[#CC4000] transition-colors"
                >
                  Close &amp; Return to Directory
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#E65C00] tracking-widest">
                    Self-Registration Application
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#3D1A00]">
                    Register Your Business
                  </h3>
                  <p className="text-xs text-[#6B3A2A]">
                    Fill in your business details. Submissions are reviewed by MITRA UK admins before being published.
                  </p>
                </div>

                {formError && (
                  <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200 font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="e.g. Godavari Traditional Caterers"
                      value={formData.businessName}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Founder / Owner Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Srinivas Varma"
                      value={formData.ownerName}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Tagline / Catchphrase (Optional)
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      placeholder="e.g. Authentic Andhra &amp; Telangana Feast Catering in London"
                      value={formData.tagline}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Business Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      placeholder="Describe your services, specialties, and why the Telugu community should choose you..."
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="contact@mybusiness.co.uk"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+44 7700 900123"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      WhatsApp Direct Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      placeholder="447700900123"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://mybusiness.co.uk"
                      value={formData.website}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      City / Region <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Slough, London, Reading"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Postcode (Optional)
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      placeholder="e.g. SL3 8GW"
                      value={formData.postcode}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Address / Street Location (Optional)
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="e.g. Langley High Street"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Special Community Offer / Discount (Optional)
                    </label>
                    <input
                      type="text"
                      name="specialOffer"
                      placeholder="e.g. 10% off for MITRA members or Free First Consultation"
                      value={formData.specialOffer}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Logo Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="logoUrl"
                      placeholder="https://.../logo.png"
                      value={formData.logoUrl}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E65C00]/20">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B3A2A] hover:bg-[#FFF0E0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gold-button px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>{submitting ? 'Submitting…' : 'Submit for Review'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// ── COMPONENT: BUSINESS CARD ──
function BusinessCard({ business, isFeatured = false }: { business: TeluguBusiness; isFeatured?: boolean }) {
  const whatsappUrl = business.whatsapp
    ? `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${business.businessName}, I found your business on MITRA UK Telugu Business Directory.`)}`
    : business.phone
    ? `https://wa.me/${business.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${business.businessName}, I found your business on MITRA UK Telugu Business Directory.`)}`
    : null;

  return (
    <div
      className={`group relative bg-white rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl ${
        isFeatured
          ? 'border-2 border-[#E65C00] shadow-md shadow-[#E65C00]/10 bg-gradient-to-b from-[#FFFDF9] to-white'
          : 'border border-[#E65C00]/20 hover:border-[#E65C00]/60'
      }`}
    >
      <div className="space-y-4">
        
        {/* Card Header: Category & Badges */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/20">
            {business.category}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white shadow-sm">
              <Star className="w-3 h-3 fill-current" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Logo / Avatar & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#FFF8F0] border border-[#E65C00]/20 shrink-0 relative flex items-center justify-center p-1">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.businessName}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Building2 className="w-6 h-6 text-[#E65C00]" />
            )}
          </div>
          <div>
            <h3 className="text-base font-black font-cinzel text-[#3D1A00] leading-snug group-hover:text-[#E65C00] transition-colors">
              {business.businessName}
            </h3>
            <p className="text-[11px] font-bold text-[#6B3A2A]">
              Founder: {business.ownerName}
            </p>
          </div>
        </div>

        {/* Tagline */}
        {business.tagline && (
          <p className="text-xs font-bold text-[#E65C00] italic">
            "{business.tagline}"
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-[#6B3A2A] leading-relaxed line-clamp-3">
          {business.description}
        </p>

        {/* Special Community Offer */}
        {business.specialOffer && (
          <div className="bg-[#FFF4E6] border border-[#E65C00]/30 rounded-2xl p-2.5 flex items-start gap-2 text-xs">
            <Tag className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
            <span className="font-bold text-[#3D1A00]">
              <span className="text-[#E65C00] font-black">Offer:</span> {business.specialOffer}
            </span>
          </div>
        )}

        {/* Location & Contact Meta */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-[#6B3A2A]">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            <span className="font-semibold truncate">
              {business.city}{business.postcode ? `, ${business.postcode}` : ''} {business.address ? `• ${business.address}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            <span className="truncate">{business.email}</span>
          </div>
        </div>

      </div>

      {/* Action CTA Buttons */}
      <div className="pt-5 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <a
            href={`tel:${business.phone}`}
            className="col-span-1 bg-[#3D1A00] hover:bg-[#E65C00] text-white rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        )}

        {business.website ? (
          <a
            href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 border border-[#E65C00]/30 hover:border-[#E65C00] hover:bg-[#FFF0E0] text-[#3D1A00] rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#E65C00]" />
            <span>Website</span>
          </a>
        ) : (
          <a
            href={`mailto:${business.email}`}
            className="col-span-1 border border-[#E65C00]/30 hover:border-[#E65C00] hover:bg-[#FFF0E0] text-[#3D1A00] rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#E65C00]" />
            <span>Email</span>
          </a>
        )}
      </div>

    </div>
  );
}
