'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Save, 
  Eye, 
  EyeOff,
  Box, 
  Image as ImageIcon, 
  Video, 
  Home, 
  Flame, 
  Heart, 
  Check, 
  RefreshCw, 
  Palette, 
  ExternalLink,
  Layers,
  Calendar,
  AlertCircle,
  Plus,
  Play,
  Award,
  Feather,
  Compass,
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  X,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import EventHero from '@/components/EventHero';
import { useAdminSidebar } from '@/app/admin/layout';
import { EventTemplateConfig, EventHeroConfig, HeroType, EventHeroStorageConfig } from '@/types/event-template';

interface EventItemOption {
  id: string;
  title: string;
  category?: string;
  date?: string;
}

const COLOR_PRESETS = [
  { name: 'Saffron & Gold (Ganesh)', primary: '#E65C00', accent: '#CC4000', bg: '#FFF8F0' },
  { name: 'Diwali Festive Amber', primary: '#D97706', accent: '#B45309', bg: '#FFFBEB' },
  { name: 'Temple Royal Maroon', primary: '#881337', accent: '#9F1239', bg: '#FFF1F2' },
  { name: 'Ugadi Emerald Green', primary: '#047857', accent: '#065F46', bg: '#F0FDF4' },
  { name: 'Midnight Navy & Gold', primary: '#1E3A8A', accent: '#1D4ED8', bg: '#F8FAFC' },
];

const HERO_VARIANTS: Record<
  HeroType,
  Array<{
    id: string;
    name: string;
    badge: string;
    desc: string;
    icon: any;
  }>
> = {
  '3d-model': [
    {
      id: '3d-sanctum',
      name: 'Classic Sanctum',
      badge: 'V1 Centered',
      desc: 'Full-width centered temple sanctum with particle dust & divine golden rays',
      icon: Flame,
    },
    {
      id: '3d-split',
      name: 'Interactive Split',
      badge: 'V2 Side-by-Side',
      desc: '2-column layout with left typography & right 360° interactive 3D stage',
      icon: Layers,
    },
    {
      id: '3d-pedestal',
      name: 'Exhibition Pedestal',
      badge: 'V3 Spotlight',
      desc: 'Spotlight showcase with glowing pedestal disc & floating specs HUD cards',
      icon: Award,
    },
    {
      id: '3d-floating',
      name: 'Holographic Island',
      badge: 'V4 Cosmic Rings',
      desc: 'Celestial floating idol with concentric energy rings & highlight chips',
      icon: Sparkles,
    },
  ],
  'image': [
    {
      id: 'image-split',
      name: 'Modern Split Stage',
      badge: 'V1 2-Column',
      desc: 'Left typography & CTAs, right framed interactive visual card with ambient glow',
      icon: Layers,
    },
    {
      id: 'image-fullscreen',
      name: 'Cinematic Fullscreen',
      badge: 'V2 Full-Bleed',
      desc: 'Full-bleed edge-to-edge photography with dark vignette & gold-foil title',
      icon: ImageIcon,
    },
    {
      id: 'image-card-showcase',
      name: 'Elevated 3D Card',
      badge: 'V3 3D Card',
      desc: 'Floating showcase card with perspective lift, category badge & integrated CTA bar',
      icon: Box,
    },
    {
      id: 'image-editorial',
      name: 'Editorial Magazine',
      badge: 'V4 Editorial',
      desc: 'Asymmetrical masthead with overlapping photo frame & cultural highlights ticker',
      icon: Feather,
    },
  ],
  'video': [
    {
      id: 'video-cinema',
      name: 'Cinematic Backdrop',
      badge: 'V1 Fullscreen Loop',
      desc: 'Full-bleed looping video background with dark gradient scrim & centered gold text',
      icon: Video,
    },
    {
      id: 'video-split',
      name: 'Split Media Stage',
      badge: 'V2 2-Column Video',
      desc: 'Left event details & registration, right framed 16:9 HD video player',
      icon: Layers,
    },
    {
      id: 'video-theater',
      name: 'Ambilight Theater',
      badge: 'V3 Theater Stage',
      desc: 'Centered cinema screen with ambient theme glow radiating behind it',
      icon: Play,
    },
    {
      id: 'video-banner-strip',
      name: '21:9 Cinema Scope',
      badge: 'V4 Panoramic Strip',
      desc: 'Ultra-widescreen cinema scope banner with floating overlay pill bar',
      icon: Compass,
    },
  ],
};

export default function EventHeroAdminPage() {
  const { sidebarOpen, toggleSidebar } = useAdminSidebar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storageData, setStorageData] = useState<EventHeroStorageConfig | null>(null);
  const [availableEvents, setAvailableEvents] = useState<EventItemOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-ganesh-chaturthi');

  // Form state for current selected event
  const [currentConfig, setCurrentConfig] = useState<EventTemplateConfig | null>(null);

  // Live Preview States
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'event' | 'home'>('event');
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [previewToast, setPreviewToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setPreviewToast(message);
    setTimeout(() => {
      setPreviewToast((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  // Load storage config and DB events
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load admin config
      const resConfig = await fetch('/api/admin/event-hero-config');
      const dataConfig = await resConfig.json();

      if (dataConfig.success && dataConfig.data) {
        setStorageData(dataConfig.data);
        const activeId = dataConfig.data.activeHomeEventId || 'evt-ganesh-chaturthi';
        const initialId = dataConfig.data.events[activeId] ? activeId : Object.keys(dataConfig.data.events)[0] || 'evt-ganesh-chaturthi';
        setSelectedEventId(initialId);
        setCurrentConfig(dataConfig.data.events[initialId] || null);
      }

      // 2. Load DB events for picker options
      const resEvents = await fetch('/api/events');
      const dataEvents = await resEvents.json();
      if (dataEvents.success && Array.isArray(dataEvents.data)) {
        setAvailableEvents(dataEvents.data);
      }
    } catch (err) {
      console.error('Failed to load event hero config:', err);
      setError('Failed to load configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When switching event tab
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    if (storageData?.events[id]) {
      setCurrentConfig(storageData.events[id]);
    } else {
      // Create new draft config based on template
      const baseEvent = availableEvents.find((e) => e.id === id);
      const newConfig: EventTemplateConfig = {
        id,
        title: baseEvent?.title || 'New Event Celebration',
        eventSlug: baseEvent ? `events/${baseEvent.id}` : 'new-event',
        targetDate: baseEvent?.date ? `${baseEvent.date}T09:00:00.000Z` : new Date().toISOString(),
        hero: {
          heroType: 'image',
          bannerImageUrl: '/assets/poster.jpg',
          presenterBadge: 'Welcome to Mana Indian Telugu Roots Abroad (MITRA UK)',
          title: baseEvent?.title.toUpperCase() || 'GRAND COMMUNITY FESTIVAL',
          subtitle: 'UK TELUGU CELEBRATION 2026',
          tagline: 'Join the grand festivities, food stalls and cultural programs',
          loadingText: 'LOADING CELEBRATION...',
          scrollCueText: 'Explore Event Schedule',
          primaryColor: '#E65C00',
          accentColor: '#CC4000',
          backgroundColor: '#FFF8F0',
          primaryCta: { label: 'Register / RSVP', action: 'rsvp' },
          secondaryCta: { label: 'Join Community WhatsApp', action: 'whatsapp' },
          whatsAppUrl: 'https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd',
        },
        sections: {
          showCountdown: true,
          showEventDetails: true,
          showStory: true,
          showSpecs: false,
          showMediaGallery: true,
          showOfferings: true,
          showSponsors: true,
        },
      };
      setCurrentConfig(newConfig);
    }
  };

  // Set current event as featured on Home
  const handleSetAsHomeHero = async () => {
    if (!currentConfig || !storageData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/event-hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeHomeEventId: currentConfig.id,
          event: currentConfig,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setStorageData(resData.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(resData.error || 'Failed to update home hero.');
      }
    } catch {
      setError('Network error updating home hero.');
    } finally {
      setSaving(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!currentConfig) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/event-hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: currentConfig,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setStorageData(resData.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(resData.error || 'Failed to save config.');
      }
    } catch {
      setError('Network error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof EventHeroConfig, val: any) => {
    if (!currentConfig) return;
    setCurrentConfig({
      ...currentConfig,
      hero: {
        ...currentConfig.hero,
        [field]: val,
      },
    });
  };

  const handleHeroTypeChange = (type: HeroType) => {
    if (!currentConfig) return;
    const defaultVariant =
      type === '3d-model' ? '3d-sanctum' :
      type === 'image' ? 'image-split' :
      'video-split';

    setCurrentConfig({
      ...currentConfig,
      hero: {
        ...currentConfig.hero,
        heroType: type,
        heroVariant: defaultVariant,
      },
    });
  };

  const updateSectionToggle = (section: keyof EventTemplateConfig['sections'], val: boolean) => {
    if (!currentConfig) return;
    setCurrentConfig({
      ...currentConfig,
      sections: {
        ...currentConfig.sections,
        [section]: val,
      },
    });
  };

  const isCurrentHomeHero = storageData?.activeHomeEventId === currentConfig?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-mitra-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1700px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Option */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              !sidebarOpen
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-lg ring-1 ring-amber-500/40'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={sidebarOpen ? 'Hide Left Navigation Sidebar' : 'Open Left Navigation Sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4 text-amber-400" /> : <PanelLeftOpen className="w-4 h-4 text-amber-400" />}
            <span className="font-semibold">{sidebarOpen ? 'Hide Sidebar' : 'Open Sidebar'}</span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-mitra-gold text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Event Hero Studio &amp; Template Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">Event Hero &amp; Landing Page Manager</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved successfully and updated in JSON storage!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Event Selection Tabs */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
          <span>SELECT EVENT TO CUSTOMIZE:</span>
          <span className="text-[11px] text-amber-400">
            Active Home Event: <strong>{storageData?.events[storageData.activeHomeEventId]?.title || storageData?.activeHomeEventId}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.values(storageData?.events || {}).map((evt) => {
            const isSelected = selectedEventId === evt.id;
            const isHome = storageData?.activeHomeEventId === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => handleSelectEvent(evt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{evt.title}</span>
                {isHome && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    Home Hero
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Add from Available Events if not yet in storage */}
          {availableEvents
            .filter((e) => !storageData?.events[e.id])
            .map((e) => (
              <button
                key={e.id}
                onClick={() => handleSelectEvent(e.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add {e.title.slice(0, 18)}...</span>
              </button>
            ))}
        </div>
      </div>

      {currentConfig && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* CENTER: LIVE INTERACTIVE HERO PREVIEW */}
          <div className="flex-1 min-w-0 w-full space-y-4 lg:sticky lg:top-4">
            <div id="live-preview-section" className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
              {/* Preview Toolbar Header */}
              <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Live Preview
                    </span>
                  </div>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-xs font-bold text-slate-300 hidden sm:inline truncate max-w-[200px]">
                    {currentConfig.title}
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                    {currentConfig.hero.heroType} &bull; {currentConfig.hero.heroVariant || 'default'}
                  </span>
                </div>

                {/* Viewport & Mode Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mode Selector */}
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('event')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        previewMode === 'event'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Event View
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('home')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        previewMode === 'home'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Home View
                    </button>
                  </div>

                  {/* Viewport Selector */}
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('desktop')}
                      className={`p-1.5 rounded-md transition-all ${
                        previewViewport === 'desktop'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Desktop Full Width"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('tablet')}
                      className={`p-1.5 rounded-md transition-all ${
                        previewViewport === 'tablet'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tablet 768px"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewViewport('mobile')}
                      className={`p-1.5 rounded-md transition-all ${
                        previewViewport === 'mobile'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mobile 390px"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={() => setFullscreenPreview(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Fullscreen Live Preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Open Live Public Link */}
                  <Link
                    href={`/${previewMode === 'home' ? '' : currentConfig.eventSlug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Open Live Public URL in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </div>
              </div>

              {/* Simulated Browser Address Bar */}
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">
                    mitra.org.uk{previewMode === 'home' ? '' : `/${currentConfig.eventSlug}`}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono hidden md:block">
                  {previewViewport === 'desktop' ? '100% Canvas' : previewViewport === 'tablet' ? '768px Tablet' : '390px Mobile'}
                </div>
              </div>

              {/* Preview Frame Canvas Content */}
              <div className="relative bg-slate-900/40 p-2 sm:p-4 min-h-[520px] max-h-[calc(100vh-14rem)] overflow-y-auto flex items-center justify-center">
                {/* Floating Action Toast */}
                {previewToast && (
                  <div className="absolute top-4 z-40 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{previewToast}</span>
                  </div>
                )}

                {/* Viewport: Desktop */}
                {previewViewport === 'desktop' && (
                  <div className="w-full rounded-xl overflow-hidden shadow-inner border border-slate-800/80">
                    <EventHero
                      key={`${currentConfig.id}-${currentConfig.hero.heroType}-${currentConfig.hero.heroVariant || 'default'}-desktop`}
                      config={currentConfig.hero}
                      eventSlug={currentConfig.eventSlug}
                      mode={previewMode}
                      onBookPoojaClick={() => showToast('Preview: "Book Pooja / Seva" Triggered')}
                      onDonateClick={() => showToast('Preview: "Make Donation" Triggered')}
                      onRsvpClick={() => showToast('Preview: "Register / RSVP" Triggered')}
                      onNotifyClick={() => showToast('Preview: "Notify Me" Triggered')}
                    />
                  </div>
                )}

                {/* Viewport: Tablet */}
                {previewViewport === 'tablet' && (
                  <div className="w-[768px] max-w-full rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden shrink-0 bg-[#FFF8F0]">
                    <div className="bg-slate-800 px-4 py-1.5 flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-700">
                      <span>Tablet Simulator</span>
                      <span className="font-mono">768 × 1024</span>
                    </div>
                    <div className="overflow-hidden">
                      <EventHero
                        key={`${currentConfig.id}-${currentConfig.hero.heroType}-${currentConfig.hero.heroVariant || 'default'}-tablet`}
                        config={currentConfig.hero}
                        eventSlug={currentConfig.eventSlug}
                        mode={previewMode}
                        onBookPoojaClick={() => showToast('Preview: "Book Pooja / Seva" Triggered')}
                        onDonateClick={() => showToast('Preview: "Make Donation" Triggered')}
                        onRsvpClick={() => showToast('Preview: "Register / RSVP" Triggered')}
                        onNotifyClick={() => showToast('Preview: "Notify Me" Triggered')}
                      />
                    </div>
                  </div>
                )}

                {/* Viewport: Mobile */}
                {previewViewport === 'mobile' && (
                  <div className="w-[390px] max-w-full rounded-[36px] shadow-2xl border-[6px] border-slate-700 overflow-hidden shrink-0 bg-[#FFF8F0] relative">
                    {/* Mobile Dynamic Island */}
                    <div className="bg-slate-900 px-6 py-2 flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800">
                      <span className="font-semibold text-white">9:41</span>
                      <div className="w-16 h-3.5 bg-black rounded-full" />
                      <span>5G 100%</span>
                    </div>
                    <div className="overflow-hidden max-h-[640px] overflow-y-auto">
                      <EventHero
                        key={`${currentConfig.id}-${currentConfig.hero.heroType}-${currentConfig.hero.heroVariant || 'default'}-mobile`}
                        config={currentConfig.hero}
                        eventSlug={currentConfig.eventSlug}
                        mode={previewMode}
                        onBookPoojaClick={() => showToast('Preview: "Book Pooja / Seva" Triggered')}
                        onDonateClick={() => showToast('Preview: "Make Donation" Triggered')}
                        onRsvpClick={() => showToast('Preview: "Register / RSVP" Triggered')}
                        onNotifyClick={() => showToast('Preview: "Notify Me" Triggered')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: CONFIGURATION FORM (Independent Scroll) */}
          <div className="w-full lg:w-[460px] xl:w-[500px] shrink-0 space-y-5 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-2 pb-12">
            {/* Home Feature Ribbon */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isCurrentHomeHero ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-500'}`}>
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Feature on Public Home</h3>
                  <p className="text-[10px] text-slate-400">
                    {isCurrentHomeHero
                      ? 'Currently featured on the website root page.'
                      : 'Display this hero on the MITRA UK homepage.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSetAsHomeHero}
                disabled={isCurrentHomeHero || saving}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isCurrentHomeHero
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                }`}
              >
                {isCurrentHomeHero ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Set Active</span>
                  </>
                )}
              </button>
            </div>

            {/* 1. Hero Type & Layout Variant Selector */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Hero Display Style
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(['3d-model', 'image', 'video'] as HeroType[]).map((type) => {
                  const isSelected = currentConfig.hero.heroType === type;
                  const Icon = type === '3d-model' ? Box : type === 'image' ? ImageIcon : Video;
                  const label = type === '3d-model' ? '3D Model' : type === 'image' ? 'Image' : 'Video';

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleHeroTypeChange(type)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Layout Variant Selector */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Layout Variant Style
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold font-mono">
                    {currentConfig.hero.heroVariant || (currentConfig.hero.heroType === '3d-model' ? '3d-sanctum' : currentConfig.hero.heroType === 'image' ? 'image-split' : 'video-split')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HERO_VARIANTS[currentConfig.hero.heroType].map((v) => {
                    const currentVariant = currentConfig.hero.heroVariant || (
                      currentConfig.hero.heroType === '3d-model' ? '3d-sanctum' :
                      currentConfig.hero.heroType === 'image' ? 'image-split' :
                      'video-split'
                    );
                    const isSelected = currentVariant === v.id;
                    const Icon = v.icon;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => updateHero('heroVariant', v.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold text-white leading-tight">{v.name}</span>
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                            isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {v.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {v.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Controls by Hero Type */}
              {currentConfig.hero.heroType === '3d-model' && (
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      3D Model URL (.glb / .gltf)
                    </label>
                    <input
                      type="text"
                      value={currentConfig.hero.modelUrl || ''}
                      onChange={(e) => updateHero('modelUrl', e.target.value)}
                      placeholder="/assets/idols/Lord Ganesh.glb"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Procedural Fallback (During Loading)
                    </label>
                    <select
                      value={currentConfig.hero.proceduralFallback || 'ganesha'}
                      onChange={(e) => updateHero('proceduralFallback', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="ganesha">Lord Ganesh Sanctum Murti</option>
                      <option value="pedestal">Ornate Lotus Pedestal Only</option>
                      <option value="none">None (Loading Spinner Only)</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Background Atmosphere</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.hero.showParticles !== false && currentConfig.hero.proceduralFallback !== 'none'}
                          onChange={(e) => updateHero('showParticles', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                        />
                        <span>Dust Particles</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.hero.showCornerMotifs !== false && currentConfig.hero.proceduralFallback !== 'none'}
                          onChange={(e) => updateHero('showCornerMotifs', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                        />
                        <span>Lotus Motifs</span>
                      </label>

                      <label className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.hero.showRadialAura !== false && currentConfig.hero.proceduralFallback !== 'none'}
                          onChange={(e) => updateHero('showRadialAura', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                        />
                        <span>Radial Aura</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentConfig.hero.heroType === 'image' && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Hero Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.bannerImageUrl || ''}
                    onChange={(e) => updateHero('bannerImageUrl', e.target.value)}
                    placeholder="/assets/poster.jpg or https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {currentConfig.hero.heroType === 'video' && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Hero Video URL (MP4 / WebM)
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.videoUrl || ''}
                    onChange={(e) => updateHero('videoUrl', e.target.value)}
                    placeholder="/assets/teaser.mp4 or https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Devotional Content & Typography */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Devotional Copy &amp; Typography
              </label>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Presenter Badge
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.presenterBadge}
                    onChange={(e) => updateHero('presenterBadge', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Main Heading (Title)
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.title}
                    onChange={(e) => updateHero('title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.subtitle}
                    onChange={(e) => updateHero('subtitle', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Tagline / Devotional Message
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.tagline || ''}
                    onChange={(e) => updateHero('tagline', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Loading Text</label>
                    <input
                      type="text"
                      value={currentConfig.hero.loadingText || ''}
                      onChange={(e) => updateHero('loadingText', e.target.value)}
                      placeholder="ENTERING SANCTUM..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Scroll Cue Text</label>
                    <input
                      type="text"
                      value={currentConfig.hero.scrollCueText || ''}
                      onChange={(e) => updateHero('scrollCueText', e.target.value)}
                      placeholder="Explore Event Schedule"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Action CTAs & Links */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                3. Action CTAs &amp; Links
              </label>

              <div className="space-y-3">
                {/* Primary CTA */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">Primary Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Label</label>
                      <input
                        type="text"
                        value={currentConfig.hero.primaryCta.label}
                        onChange={(e) =>
                          updateHero('primaryCta', {
                            ...currentConfig.hero.primaryCta,
                            label: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Action</label>
                      <select
                        value={currentConfig.hero.primaryCta.action}
                        onChange={(e) =>
                          updateHero('primaryCta', {
                            ...currentConfig.hero.primaryCta,
                            action: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      >
                        <option value="pooja">Book Pooja / Seva</option>
                        <option value="rsvp">Register / RSVP</option>
                        <option value="donation">Make Donation</option>
                        <option value="link">Custom URL</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Secondary Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Label</label>
                      <input
                        type="text"
                        value={currentConfig.hero.secondaryCta.label}
                        onChange={(e) =>
                          updateHero('secondaryCta', {
                            ...currentConfig.hero.secondaryCta,
                            label: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Action</label>
                      <select
                        value={currentConfig.hero.secondaryCta.action}
                        onChange={(e) =>
                          updateHero('secondaryCta', {
                            ...currentConfig.hero.secondaryCta,
                            action: e.target.value,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      >
                        <option value="whatsapp">Join WhatsApp</option>
                        <option value="donation">Make Donation</option>
                        <option value="pooja">Book Pooja</option>
                        <option value="link">Custom URL</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Community WhatsApp Invite Link
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.whatsAppUrl || ''}
                    onChange={(e) => updateHero('whatsAppUrl', e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Theme Color Palette */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  4. Theme Color Palette
                </label>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      updateHero('primaryColor', preset.primary);
                      updateHero('accentColor', preset.accent);
                      updateHero('backgroundColor', preset.bg);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Primary Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={currentConfig.hero.primaryColor || '#E65C00'}
                      onChange={(e) => updateHero('primaryColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] text-slate-300 font-mono truncate">
                      {currentConfig.hero.primaryColor || '#E65C00'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Accent Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={currentConfig.hero.accentColor || '#CC4000'}
                      onChange={(e) => updateHero('accentColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] text-slate-300 font-mono truncate">
                      {currentConfig.hero.accentColor || '#CC4000'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Background Tint</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={currentConfig.hero.backgroundColor || '#FFF8F0'}
                      onChange={(e) => updateHero('backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] text-slate-300 font-mono truncate">
                      {currentConfig.hero.backgroundColor || '#FFF8F0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Landing Page Sections Toggles */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Landing Page Sections</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Toggle visible sections on this event&apos;s full template page:
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { key: 'showCountdown', label: 'Countdown Timer' },
                  { key: 'showEventDetails', label: 'Event Schedule & Timings' },
                  { key: 'showStory', label: 'Devotional / About Story' },
                  { key: 'showSpecs', label: 'Idol Specifications / Specs' },
                  { key: 'showMediaGallery', label: 'Media Teaser Gallery' },
                  { key: 'showOfferings', label: 'Community Seva & Offerings' },
                  { key: 'showSponsors', label: 'Sponsor Ribbon Band' },
                ].map(({ key, label }) => {
                  const isChecked = !!currentConfig.sections[key as keyof typeof currentConfig.sections];
                  return (
                    <label
                      key={key}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      <span className="text-xs text-slate-200 font-medium">{label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          updateSectionToggle(key as keyof typeof currentConfig.sections, e.target.checked)
                        }
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save All Changes</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Home</span>
                </Link>

                <Link
                  href={`/${currentConfig.eventSlug}`}
                  target="_blank"
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Event Landing</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Live Preview Modal */}
      {fullscreenPreview && currentConfig && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          {/* Fullscreen Header Bar */}
          <div className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Live Fullscreen Preview
                </span>
              </div>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs font-bold text-white hidden sm:inline">{currentConfig.title}</span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                {currentConfig.hero.heroType} &bull; {currentConfig.hero.heroVariant || 'default'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('event')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    previewMode === 'event'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Event Landing
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('home')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    previewMode === 'home'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Home Hero
                </button>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-lg transition-all ${
                    previewViewport === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`p-1.5 rounded-lg transition-all ${
                    previewViewport === 'tablet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded-lg transition-all ${
                    previewViewport === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setFullscreenPreview(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Body */}
          <div className="flex-1 overflow-y-auto bg-slate-950 relative">
            {previewToast && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{previewToast}</span>
              </div>
            )}

            {previewViewport === 'desktop' && (
              <div className="w-full min-h-full">
                <EventHero
                  key={`fs-${currentConfig.id}-${currentConfig.hero.heroType}-${currentConfig.hero.heroVariant || 'default'}-desktop`}
                  config={currentConfig.hero}
                  eventSlug={currentConfig.eventSlug}
                  mode={previewMode}
                  onBookPoojaClick={() => showToast('Preview: "Book Pooja / Seva" Clicked!')}
                  onDonateClick={() => showToast('Preview: "Make Donation" Clicked!')}
                  onRsvpClick={() => showToast('Preview: "Register / RSVP" Clicked!')}
                  onNotifyClick={() => showToast('Preview: "Notify Me" Clicked!')}
                />
              </div>
            )}

            {previewViewport === 'tablet' && (
              <div className="py-8 px-4 flex justify-center">
                <div className="w-[768px] max-w-full bg-[#FFF8F0] rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden">
                  <EventHero
                    key={`fs-${currentConfig.id}-${currentConfig.hero.heroType}-${currentConfig.hero.heroVariant || 'default'}-tablet`}
                    config={currentConfig.hero}
                    eventSlug={currentConfig.eventSlug}
                    mode={previewMode}
                    onBookPoojaClick={() => showToast('Preview: "Book Pooja / Seva" Clicked!')}
                    onDonateClick={() => showToast('Preview: "Make Donation" Clicked!')}
                    onRsvpClick={() => showToast('Preview: "Register / RSVP" Clicked!')}
                    onNotifyClick={() => showToast('Preview: "Notify Me" Clicked!')}
                  />
                </div>
              </div>
            )}

            {previewViewport === 'mobile' && (
              <div className="py-8 px-4 flex justify-center">
                <div className="w-[390px] max-w-full bg-[#FFF8F0] rounded-[36px] shadow-2xl border-[6px] border-slate-700 overflow-hidden">
                  <EventHero
                    key={`fs-${currentConfig.id}-${currentConfig.hero.heroType}-${currentConfig.hero.heroVariant || 'default'}-mobile`}
                    config={currentConfig.hero}
                    eventSlug={currentConfig.eventSlug}
                    mode={previewMode}
                    onBookPoojaClick={() => showToast('Preview: "Book Pooja / Seva" Clicked!')}
                    onDonateClick={() => showToast('Preview: "Make Donation" Clicked!')}
                    onRsvpClick={() => showToast('Preview: "Register / RSVP" Clicked!')}
                    onNotifyClick={() => showToast('Preview: "Notify Me" Clicked!')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Quick Jump & Preview Pill */}
      {currentConfig && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('live-preview-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-amber-400 border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
            title="Scroll to Live Preview"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setFullscreenPreview(true)}
            className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xl transition-all hover:scale-105"
            title="Open Fullscreen Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
