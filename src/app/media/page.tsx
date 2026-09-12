'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Image as ImageIcon, 
  Video, 
  BookOpen, 
  Download, 
  Play, 
  X, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  Film, 
  Eye, 
  Loader2,
  Share2,
  Check
} from 'lucide-react';
import { MEDIA_DATA } from '@/data/media';

interface EventAlbum {
  id: string;
  title: string;
  category: string;
  date: string;
  time?: string;
  venue: string;
  address?: string;
  description?: string;
  bannerUrl: string;
  featuredMediaUrl?: string;
  photosCount: number;
  videosCount: number;
  totalMediaCount: number;
  status?: string;
}

interface MediaItem {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  category: string;
  url: string;
  coverImage?: string | null;
  description?: string | null;
  eventId?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, isYouTubeUrl } from '@/lib/youtube';

function MediaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeEventIdParam = searchParams?.get('event') || null;
  const activeTabParam = searchParams?.get('tab') || 'events';

  const [topTab, setTopTab] = useState<'events' | 'patrika'>(
    activeTabParam === 'patrika' ? 'patrika' : 'events'
  );

  const [events, setEvents] = useState<EventAlbum[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Event & Media Filter within the event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(activeEventIdParam);
  const [eventMediaFilter, setEventMediaFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');

  // Lightbox & Video Player Modal states
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch from /api/media
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/media');
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data.events || []);
          setMediaItems(json.data.mediaItems || []);
        }
      } catch (err) {
        console.error('Failed to load media data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (activeEventIdParam) {
      setSelectedEventId(activeEventIdParam);
    } else {
      setSelectedEventId(null);
    }
  }, [activeEventIdParam]);

  // Handler to open an event gallery
  const handleOpenEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventMediaFilter('ALL');
    router.push(`/media?event=${eventId}`);
  };

  // Handler to go back to all events
  const handleBackToEvents = () => {
    setSelectedEventId(null);
    router.push('/media');
  };

  // Currently opened event object
  const currentEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return events.find((e) => e.id === selectedEventId) || null;
  }, [selectedEventId, events]);

  // Media linked to currently opened event
  const currentEventMedia = useMemo(() => {
    if (!selectedEventId) return [];
    return mediaItems.filter((m) => m.eventId === selectedEventId);
  }, [selectedEventId, mediaItems]);

  // Filtered by type (Photos / Videos)
  const filteredMedia = useMemo(() => {
    if (eventMediaFilter === 'ALL') return currentEventMedia;
    return currentEventMedia.filter((m) => m.type === eventMediaFilter);
  }, [currentEventMedia, eventMediaFilter]);

  // Current list of photo items for lightbox navigation
  const eventPhotos = useMemo(() => {
    return currentEventMedia.filter((m) => m.type === 'IMAGE');
  }, [currentEventMedia]);

  const handleShareEvent = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Main Header */}
      {!selectedEventId && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mitra-red/10 border border-mitra-gold/20 text-mitra-gold text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Media Archives &amp; Highlights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Festival Memories &amp; Event Media
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Explore photo albums, live festival streams, high-energy teaser reels, and historic Kuchipudi recitals tagged across MITRA UK cultural events.
          </p>
        </div>
      )}

      {/* Navigation Switcher: Events Media vs MITRA Patrika */}
      {!selectedEventId && (
        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
          <button
            onClick={() => setTopTab('events')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              topTab === 'events'
                ? 'bg-mitra-red text-white shadow-lg shadow-mitra-red/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Event Galleries ({events.length})</span>
          </button>

          <button
            onClick={() => setTopTab('patrika')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              topTab === 'patrika'
                ? 'bg-mitra-navy text-mitra-gold border border-mitra-gold/40 shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>MITRA Patrika &amp; Souvenirs</span>
          </button>
        </div>
      )}

      {/* VIEW 1: OPENED EVENT GALLERY VIEW */}
      {selectedEventId && currentEvent ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Breadcrumbs / Back button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToEvents}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-mitra-red hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all group shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Event Galleries</span>
            </button>

            <button
              onClick={handleShareEvent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-mitra-gold text-xs font-bold transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Album</span>
                </>
              )}
            </button>
          </div>

          {/* Event Hero Header Card */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-950 text-white min-h-[260px] flex flex-col justify-end p-6 sm:p-10">
            <img
              src={currentEvent.featuredMediaUrl || currentEvent.bannerUrl || '/assets/poster.jpg'}
              alt={currentEvent.title}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/poster.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-mitra-red text-white text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  {currentEvent.category}
                </span>
                {currentEvent.status && (
                  <span className="bg-white/10 backdrop-blur-md text-mitra-gold border border-mitra-gold/30 text-[11px] font-bold px-3 py-0.5 rounded-full">
                    {currentEvent.status}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {currentEvent.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
                <span className="flex items-center gap-1.5 text-mitra-gold">
                  <Calendar className="w-4 h-4" />
                  <span>{currentEvent.date}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{currentEvent.venue}</span>
                </span>
              </div>

              {currentEvent.description && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 pt-1">
                  {currentEvent.description}
                </p>
              )}
            </div>
          </div>

          {/* Media Category Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEventMediaFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  eventMediaFilter === 'ALL'
                    ? 'bg-mitra-red text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Media ({currentEventMedia.length})
              </button>

              <button
                onClick={() => setEventMediaFilter('IMAGE')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  eventMediaFilter === 'IMAGE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos ({currentEvent.photosCount})</span>
              </button>

              <button
                onClick={() => setEventMediaFilter('VIDEO')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  eventMediaFilter === 'VIDEO'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videos ({currentEvent.videosCount})</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              Click any photo to open Lightbox, or play video reel
            </div>
          </div>

          {/* Media Items Masonry / Grid */}
          {filteredMedia.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 space-y-3">
              <Film className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                No media uploaded in this filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Admin can add photos and videos for this event via the Admin Media Manager.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => {
                if (item.type === 'VIDEO') {
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveVideo(item)}
                      className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:border-amber-500/50 transition-all flex flex-col"
                    >
                      {/* Video Thumbnail with Play Button */}
                      <div className="relative aspect-video bg-slate-950 overflow-hidden shrink-0">
                        <img
                          src={item.coverImage || (isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null) || '/assets/poster.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const ytThumb = isYouTubeUrl(item.url) ? getYouTubeThumbnailUrl(item.url, 'hq') : null;
                            if (ytThumb && (e.target as HTMLImageElement).src !== ytThumb) {
                              (e.target as HTMLImageElement).src = ytThumb;
                            } else {
                              (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                        {/* Animated Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-mitra-red text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-white ml-1" />
                          </div>
                        </div>

                        {/* Video Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                            <Video className="w-3 h-3" />
                            <span>Video Reel</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mitra-red transition-colors">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 pt-3">
                          <Play className="w-3 h-3 fill-amber-500" />
                          <span>Watch Video</span>
                        </span>
                      </div>
                    </div>
                  );
                }

                // IMAGE CARD
                const photoIndex = eventPhotos.findIndex((p) => p.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePhotoIndex(photoIndex >= 0 ? photoIndex : 0)}
                    className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:border-mitra-gold/50 transition-all flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden shrink-0">
                      <img
                        src={item.url || item.coverImage || '/assets/poster.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                      {item.isFeatured && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 bg-mitra-gold text-mitra-navy text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                            <Sparkles className="w-3 h-3" />
                            <span>Featured Highlight</span>
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] text-mitra-gold font-bold block">
                          Click to enlarge
                        </span>
                        <h4 className="text-xs font-bold truncate">{item.title}</h4>
                      </div>
                    </div>

                    {item.description && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : topTab === 'events' ? (
        
        /* VIEW 2: GRID OF EVENTS (Showing major main featured image) */
        <div className="space-y-6">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-mitra-gold animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading festival media albums...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No events with media albums yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => handleOpenEvent(evt.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-mitra-gold/50 transition-all flex flex-col"
                >
                  {/* Major Main Featured Image */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden shrink-0">
                    <img
                      src={evt.featuredMediaUrl || evt.bannerUrl || '/assets/poster.jpg'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Media Count Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{evt.photosCount} Photos</span>
                      </span>

                      {evt.videosCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/90 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow">
                          <Video className="w-3.5 h-3.5" />
                          <span>{evt.videosCount} Videos</span>
                        </span>
                      )}
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-mitra-red/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                        {evt.category}
                      </span>
                    </div>

                    {/* Event Highlights bottom overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                      <div className="flex items-center gap-3 text-xs text-mitra-gold font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{evt.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-mitra-gold transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Description & CTA */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {evt.description || 'View official high-resolution photographs, cultural presentations, and video reels.'}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        Total {evt.totalMediaCount} Media Assets
                      </span>

                      <div className="flex items-center gap-1 text-xs font-extrabold text-mitra-red dark:text-mitra-gold group-hover:translate-x-1 transition-transform">
                        <span>View All Photos &amp; Videos</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (

        /* VIEW 3: MITRA PATRIKA & SOUVENIR MAGAZINES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MEDIA_DATA.filter((m) => m.category === 'MITRA Patrika' || m.category === 'MITRA Souvenir').map((pub) => (
            <div
              key={pub.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex gap-6 items-center"
            >
              <div className="relative w-28 h-36 rounded-xl overflow-hidden shadow-md border border-mitra-gold shrink-0 bg-slate-950">
                <img
                  src={pub.coverImage}
                  alt={pub.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-bold bg-mitra-navy text-mitra-gold px-2 py-0.5 rounded">
                  {pub.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pub.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{pub.description}</p>
                <button
                  onClick={() => alert(`Opening digital edition for ${pub.title}...`)}
                  className="bg-mitra-red hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Read / Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoIndex !== null && eventPhotos[activePhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Lightbox Top Controls */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="text-xs text-slate-400">
              Photo {activePhotoIndex + 1} of {eventPhotos.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = eventPhotos[activePhotoIndex]?.url;
                  if (url) window.open(url, '_blank');
                }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                title="Open original image"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                title="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Image with Prev/Next Navigation */}
          <div className="relative flex-1 flex items-center justify-center py-4">
            {activePhotoIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev !== null ? prev - 1 : null));
                }}
                className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
              <img
                src={eventPhotos[activePhotoIndex].url || eventPhotos[activePhotoIndex].coverImage || ''}
                alt={eventPhotos[activePhotoIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {activePhotoIndex < eventPhotos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex((prev) => (prev !== null ? prev + 1 : null));
                }}
                className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Caption */}
          <div className="text-center text-white space-y-1 max-w-2xl mx-auto z-10 pb-2">
            <h4 className="text-sm sm:text-base font-bold text-mitra-gold">
              {eventPhotos[activePhotoIndex].title}
            </h4>
            {eventPhotos[activePhotoIndex].description && (
              <p className="text-xs text-slate-300">
                {eventPhotos[activePhotoIndex].description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Video Reel
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-xl">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {getYouTubeEmbedUrl(activeVideo.url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.url) || ''}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Caption */}
            {activeVideo.description && (
              <div className="p-4 bg-slate-900/80 text-xs text-slate-300">
                {activeVideo.description}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400">Loading festival media archives...</div>}>
      <MediaContent />
    </Suspense>
  );
}
