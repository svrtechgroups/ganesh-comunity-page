'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  ExternalLink,
  Eye,
  Layers,
  ArrowUpDown,
  Play,
  Film
} from 'lucide-react';
import { isYouTubeUrl, getYouTubeThumbnailUrl, getYouTubeEmbedUrl } from '@/lib/youtube';

interface EventMediaItem {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  coverImage?: string | null;
  isHomeFeatured?: boolean;
  homeDisplayOrder?: number;
  isEventFeatured?: boolean;
  eventDisplayOrder?: number;
  createdAt: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  venue: string;
  bannerUrl: string;
  category: string;
  mediaItems: EventMediaItem[];
}

interface FeaturedSlotItem {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  coverImage?: string | null;
  description?: string | null;
  eventId?: string | null;
  isHomeFeatured: boolean;
  homeDisplayOrder: number;
  event?: {
    id: string;
    title: string;
    date: string;
    venue: string;
    bannerUrl: string;
  } | null;
}

export default function FeaturedMediaAdminPage() {
  const [slots, setSlots] = useState<(FeaturedSlotItem | null)[]>([null, null, null, null]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [standaloneMedia, setStandaloneMedia] = useState<EventMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlotNumber, setActiveSlotNumber] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [mediaSearch, setMediaSearch] = useState('');
  const [savingSlot, setSavingSlot] = useState(false);

  // Lightbox preview state
  const [previewMedia, setPreviewMedia] = useState<{ url: string; coverImage?: string | null; type: string; title: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/featured-media');
      const json = await res.json();
      if (json.success && json.data) {
        setSlots(json.data.slots || [null, null, null, null]);
        setEvents(json.data.events || []);
        setStandaloneMedia(json.data.standaloneMedia || []);
      }
    } catch (err) {
      console.error('Failed to load featured media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModalForSlot = (slotIndex: number) => {
    setActiveSlotNumber(slotIndex + 1);
    setSelectedEvent(null);
    setEventSearch('');
    setMediaSearch('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveSlotNumber(null);
    setSelectedEvent(null);
  };

  const handleAssignMediaToSlot = async (mediaItemId: string) => {
    if (!activeSlotNumber) return;
    setSavingSlot(true);
    try {
      const res = await fetch('/api/admin/featured-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: activeSlotNumber,
          mediaItemId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSlots(json.data.slots);
        setActionNotice(json.message || `Assigned media to Slot ${activeSlotNumber}.`);
        closeModal();
      } else {
        alert(json.error || 'Failed to update slot');
      }
    } catch (err) {
      console.error('Failed to update slot:', err);
      alert('Network error while assigning slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleClearSlot = async (slotNumber: number) => {
    if (!confirm(`Are you sure you want to clear Slot ${slotNumber}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/featured-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slotNumber,
          mediaItemId: null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSlots(json.data.slots);
        setActionNotice(`Slot ${slotNumber} has been cleared.`);
      }
    } catch (err) {
      console.error('Failed to clear slot:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((evt) =>
    evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    evt.venue.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const availableMediaItems = selectedEvent
    ? selectedEvent.mediaItems.filter((m) =>
        m.title.toLowerCase().includes(mediaSearch.toLowerCase()) ||
        m.category.toLowerCase().includes(mediaSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-mitra-gold border border-amber-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Homepage Teaser Grid
            </span>
            <span className="text-slate-500 text-xs">4 Independent Display Slots</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5 mt-1">
            <Sparkles className="w-6 h-6 text-mitra-gold" />
            <span>Home Page Featured Media Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Select and curate the 4 prominent featured media artwork items showcased on the public website homepage.
            Each slot maintains its own separate <span className="font-semibold text-mitra-gold font-mono">homeDisplayOrder</span> (1 to 4).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-mitra-gold ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="bg-mitra-navy hover:bg-slate-800 text-mitra-gold font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-mitra-gold/30 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview on Homepage</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500/50 p-4 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Guide Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mitra-gold/10 border border-mitra-gold/30 text-mitra-gold flex items-center justify-center font-black">
            4
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white">How Home Featured Slots Work:</h3>
            <p className="text-xs text-slate-400">
              Click any box below &rarr; Choose an Event from the list &rarr; Choose any MediaItem from that event &rarr; The image is automatically assigned to that slot.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Slots: {slots.filter(Boolean).length} of 4</span>
        </div>
      </div>

      {/* 4 Featured Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((index) => {
          const slotNum = index + 1;
          const item = slots[index];

          return (
            <div
              key={slotNum}
              className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all group"
            >
              {/* Slot Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border font-mono ${
                    item 
                      ? 'bg-mitra-gold/20 text-mitra-gold border-mitra-gold/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    SLOT #{slotNum}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Order: {slotNum}
                  </span>
                </div>

                {item && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </div>

              {/* Slot Body: Empty vs Populated */}
              {item ? (() => {
                const isVid = item.type === 'VIDEO' || isYouTubeUrl(item.url);
                const thumb = item.coverImage || (isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null) || (isVid ? '/assets/poster.jpg' : item.url) || '/assets/poster.jpg';

                return (
                  <div className="space-y-3">
                    <div 
                      onClick={() => setPreviewMedia({ url: item.url, coverImage: thumb, type: isVid ? 'VIDEO' : 'IMAGE', title: item.title })}
                      className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group-hover:border-mitra-gold/50 cursor-pointer transition-all"
                    >
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <span className="absolute bottom-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-mitra-red text-white shadow flex items-center gap-1">
                        {isVid && <Film className="w-3 h-3 shrink-0" />}
                        <span>{item.category || (isVid ? 'Video' : 'Photo')}</span>
                      </span>

                      {isVid && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-[#E65C00] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      )}

                      <button 
                        title="Preview media"
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-mitra-gold hover:text-black transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-mitra-gold transition-colors" title={item.title}>
                        {item.title}
                      </h3>
                      {item.event ? (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 line-clamp-1" title={item.event.title}>
                          <Calendar className="w-3 h-3 text-mitra-gold shrink-0" />
                          <span>{item.event.title}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">Standalone Asset</p>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div
                  onClick={() => openModalForSlot(index)}
                  className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-800 hover:border-mitra-gold/60 bg-slate-900/40 hover:bg-slate-900/80 cursor-pointer flex flex-col items-center justify-center p-4 text-center space-y-2 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-mitra-gold text-slate-400 group-hover:text-black flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white block">
                      Empty Slot #{slotNum}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Click to choose image from events
                    </span>
                  </div>
                </div>
              )}

              {/* Slot Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                {item ? (
                  <>
                    <button
                      onClick={() => openModalForSlot(index)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Change Image</span>
                    </button>
                    <button
                      onClick={() => handleClearSlot(slotNum)}
                      title="Clear slot"
                      className="p-2 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900 hover:text-white border border-rose-800/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openModalForSlot(index)}
                    className="w-full bg-mitra-red hover:bg-mitra-red-dark text-white text-xs font-bold py-2 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Image</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SELECTION MODAL (2-Step Flow: Select Event -> Select MediaItem) ── */}
      {isModalOpen && activeSlotNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-mitra-gold text-black font-mono font-black text-xs px-2.5 py-0.5 rounded-full">
                    SLOT #{activeSlotNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {selectedEvent ? 'Step 2: Choose Photo from Event' : 'Step 1: Choose Event'}
                  </span>
                </div>
                <h2 className="text-base font-black text-white">
                  {selectedEvent ? selectedEvent.title : 'Select an Event to View Its Media'}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* STEP 1: SELECT EVENT */}
              {!selectedEvent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-300">
                      Click on an event to open its photo gallery and pick a featured image for <span className="text-mitra-gold font-bold">Slot #{activeSlotNumber}</span>:
                    </p>

                    <div className="relative w-64">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm">No matching events found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="bg-slate-900 border border-slate-800 hover:border-mitra-gold/70 rounded-2xl p-3 cursor-pointer group transition-all hover:shadow-lg space-y-3"
                        >
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                            <img
                              src={evt.bannerUrl || '/assets/poster.jpg'}
                              alt={evt.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase bg-slate-900/90 text-mitra-gold px-2 py-0.5 rounded border border-mitra-gold/30">
                              {evt.mediaItems?.length || 0} Photos Available
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-xs font-bold text-white group-hover:text-mitra-gold transition-colors line-clamp-1">
                              {evt.title}
                            </h3>
                            <div className="text-[11px] text-slate-400 flex items-center justify-between">
                              <span>{evt.date}</span>
                              <span className="text-mitra-gold font-semibold flex items-center gap-0.5 text-[10px] group-hover:translate-x-0.5 transition-transform">
                                Browse <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Standalone images fallback option if any exist */}
                  {standaloneMedia.length > 0 && (
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        General / Standalone Media Assets ({standaloneMedia.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {standaloneMedia.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleAssignMediaToSlot(m.id)}
                            className="bg-slate-900 border border-slate-800 hover:border-mitra-gold rounded-xl p-2 cursor-pointer group space-y-1.5 transition-all"
                          >
                            <div className="aspect-video relative rounded-lg overflow-hidden">
                              <img src={m.url || m.coverImage || ''} alt={m.title} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[10px] font-bold text-white line-clamp-1 group-hover:text-mitra-gold">
                              {m.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* STEP 2: SELECT MEDIA ITEM FOR THE CHOSEN EVENT */
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-mitra-gold hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Choose Different Event</span>
                    </button>

                    <div className="relative w-64">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search photos in this event..."
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-mitra-gold"
                      />
                    </div>
                  </div>

                  {availableMediaItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-3">
                      <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold">No photos found for this event.</p>
                      <p className="text-xs text-slate-500">
                        Upload media for this event via the "Media &amp; Gallery" admin section first.
                      </p>
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Back to All Events
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableMediaItems.map((media) => {
                        const isCurrentlyAssigned = media.isHomeFeatured && media.homeDisplayOrder === activeSlotNumber;
                        const isInOtherSlot = media.isHomeFeatured && media.homeDisplayOrder !== activeSlotNumber;
                        const isVid = media.type === 'VIDEO' || isYouTubeUrl(media.url);
                        const thumb = media.coverImage || (isYouTubeUrl(media.url) ? getYouTubeThumbnailUrl(media.url, 'hq') : null) || (isVid ? '/assets/poster.jpg' : media.url) || '/assets/poster.jpg';

                        return (
                          <div
                            key={media.id}
                            onClick={() => !savingSlot && handleAssignMediaToSlot(media.id)}
                            className={`bg-slate-900 border rounded-2xl p-3 cursor-pointer group transition-all space-y-3 relative hover:shadow-xl ${
                              isCurrentlyAssigned
                                ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                : 'border-slate-800 hover:border-mitra-gold'
                            }`}
                          >
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                              <img
                                src={thumb}
                                alt={media.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase bg-slate-900/90 text-white px-2 py-0.5 rounded flex items-center gap-1">
                                {isVid && <Film className="w-3 h-3 shrink-0" />}
                                <span>{media.category || (isVid ? 'Video' : 'Photo')}</span>
                              </span>

                              {isVid && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-10 h-10 rounded-full bg-[#E65C00] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 fill-white ml-0.5" />
                                  </div>
                                </div>
                              )}

                              {isInOtherSlot && (
                                <span className="absolute top-2 left-2 text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded shadow">
                                  Currently Slot #{media.homeDisplayOrder}
                                </span>
                              )}

                              {isCurrentlyAssigned && (
                                <span className="absolute top-2 left-2 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded shadow">
                                  Current Slot #{activeSlotNumber}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-mitra-gold transition-colors line-clamp-2">
                                {media.title}
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                Added {new Date(media.createdAt).toLocaleDateString('en-GB')}
                              </p>
                            </div>

                            <button
                              disabled={savingSlot}
                              className={`w-full text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                                isCurrentlyAssigned
                                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50'
                                  : 'bg-mitra-gold text-black hover:bg-amber-400 shadow'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isCurrentlyAssigned ? 'Currently Selected' : `Select for Slot #${activeSlotNumber}`}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center text-xs text-slate-400">
              <span>
                {selectedEvent ? `Viewing ${availableMediaItems.length} photos` : `Viewing ${filteredEvents.length} events`}
              </span>
              <button
                onClick={closeModal}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox / Video Preview Modal */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" 
          onClick={() => setPreviewMedia(null)}
        >
          <div className="relative max-w-4xl w-full border-2 border-mitra-gold rounded-3xl overflow-hidden bg-slate-950 p-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 bg-mitra-gold text-black p-2 rounded-full z-20 hover:scale-110 transition-transform shadow-xl font-bold"
            >
              <X className="w-5 h-5" />
            </button>
            {previewMedia.type === 'VIDEO' ? (
              <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                {isYouTubeUrl(previewMedia.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(previewMedia.url) || ''}
                    title={previewMedia.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewMedia.url}
                    poster={previewMedia.coverImage || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <img 
                src={previewMedia.url || previewMedia.coverImage || '/assets/poster.jpg'} 
                alt={previewMedia.title} 
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" 
              />
            )}
            <div className="p-3 text-xs text-slate-300 font-bold">
              {previewMedia.title}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
