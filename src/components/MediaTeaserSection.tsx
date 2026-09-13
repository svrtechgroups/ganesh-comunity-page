'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX, Image as ImageIcon, X, Sparkles, Film, Loader2 } from 'lucide-react';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';

interface MediaTeaserSectionProps {
  eventId?: string;
  sectionTitle?: string;
  subtitle?: string;
}

interface GalleryItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  src: string;
  title: string;
  category: string;
  description?: string | null;
}

const fallbackImages: GalleryItem[] = [
  {
    id: 'fb-1',
    type: 'IMAGE',
    url: '/assets/poster.jpg',
    src: '/assets/poster.jpg',
    title: 'Maha Ganapathi Official Event Poster',
    category: 'Official Poster',
  },
  {
    id: 'fb-2',
    type: 'IMAGE',
    url: '/assets/organizers-poster.jpg',
    src: '/assets/organizers-poster.jpg',
    title: 'MITRA UK & Organizers Announcement',
    category: 'Organizers & Brand',
  },
  {
    id: 'fb-3',
    type: 'IMAGE',
    url: '/assets/poster.jpg',
    src: '/assets/poster.jpg',
    title: 'Slough Langley Sanctum Reveal Composite',
    category: 'Divine Composite',
  },
  {
    id: 'fb-4',
    type: 'IMAGE',
    url: '/assets/organizers-poster.jpg',
    src: '/assets/organizers-poster.jpg',
    title: 'Biryanis and More! & ELE Entertainments',
    category: 'Sponsor Partners',
  },
];

export default function MediaTeaserSection({
  eventId,
  sectionTitle,
  subtitle,
}: MediaTeaserSectionProps) {
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const endpoint = eventId
      ? `/api/media?eventId=${encodeURIComponent(eventId)}&featured=event`
      : '/api/media?featured=home';

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data?.mediaItems) && data.data.mediaItems.length > 0) {
          const items: GalleryItem[] = data.data.mediaItems.slice(0, 4).map((m: any) => {
            const isVid = m.type === 'VIDEO' || isYouTubeUrl(m.url);
            const ytThumb = isYouTubeUrl(m.url) ? getYouTubeThumbnailUrl(m.url, 'hq') : null;
            const coverSrc = m.coverImage || ytThumb || (isVid ? '/assets/poster.jpg' : m.url) || '/assets/poster.jpg';

            return {
              id: m.id,
              type: isVid ? 'VIDEO' : 'IMAGE',
              url: m.url || coverSrc,
              src: coverSrc,
              title: m.title,
              category: m.category || (isVid ? 'Video Asset' : 'Featured Photo'),
              description: m.description,
            };
          });
          setGalleryItems(items);
        } else {
          // If no featured items set yet, fallback gracefully
          setGalleryItems(fallbackImages);
        }
      })
      .catch((err) => {
        console.error('Failed to load featured media items:', err);
        if (isMounted) setGalleryItems(fallbackImages);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleStartPlay = () => {
    setPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const displayTitle = sectionTitle || 'TEASER REEL & EVENT POSTERS';
  const displaySubtitle = subtitle || 'Experience the official Maha Ganapathi video teaser reel and high-resolution event artwork from our media assets.';

  return (
    <section className="py-20 bg-[#FFF3E0] text-[#3D1A00] border-y border-[#E65C00]/20">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
            <Film className="w-4 h-4" />
            <span>OFFICIAL ASSETS &amp; CINEMATIC TEASER</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            {displayTitle}
          </h2>
          
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#6B3A2A]">
            {displaySubtitle}
          </p>
        </div>

        {/* Video Player Card */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#E65C00]/30 shadow-[0_0_40px_rgba(230,92,0,0.12)] bg-white">
          <div className="relative aspect-video w-full flex items-center justify-center bg-[#FFF0E0]">
            {!playing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-[#FFF8F0]/60 backdrop-blur-[2px]">
                <img
                  src="/assets/poster.jpg"
                  alt="Poster Backdrop"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 filter brightness-90"
                />
                <div className="relative z-20 flex flex-col items-center space-y-4">
                  <button
                    onClick={handleStartPlay}
                    className="w-20 h-20 rounded-full bg-[#E65C00] hover:bg-[#FF7A00] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 group"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <span className="text-xs font-black tracking-widest text-[#3D1A00] uppercase font-cinzel bg-white/80 px-4 py-1.5 rounded-full border border-[#E65C00]/30 shadow-sm">
                    Play Official Teaser Video (.MP4)
                  </span>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              src="/assets/teaser-reel.mp4"
              poster="/assets/poster.jpg"
              controls={playing}
              className="w-full h-full object-contain"
              playsInline
            />
          </div>
        </div>

        {/* Photo & Video Gallery Grid (Dynamic 4 Featured Media Items) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="temple-card rounded-2xl overflow-hidden border border-[#E65C00]/20 bg-[#FFF0E0] p-4 h-72 animate-pulse flex flex-col justify-between">
                <div className="w-full h-48 bg-[#E65C00]/10 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3.5 bg-[#E65C00]/20 rounded w-3/4" />
                  <div className="h-2.5 bg-[#E65C00]/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="temple-card rounded-2xl overflow-hidden border border-[#E65C00]/20 cursor-pointer group hover:border-[#E65C00]/70 transition-all relative hover:shadow-[0_12px_30px_rgba(230,92,0,0.15)] hover:-translate-y-1 bg-white"
              >
                <div className="relative h-60 w-full overflow-hidden bg-[#FFF0E0]">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/poster.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A00]/50 via-transparent to-transparent opacity-80" />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-[#E65C00] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    {item.type === 'VIDEO' && <Film className="w-3 h-3 shrink-0" />}
                    <span>{item.category}</span>
                  </span>

                  {/* Video Play Button Overlay */}
                  {item.type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#E65C00] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#FF7A00] transition-all">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-xs font-bold text-[#3D1A00] group-hover:text-[#E65C00] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-[#6B3A2A] flex items-center gap-1">
                    {item.type === 'VIDEO' ? (
                      <>
                        <Play className="w-3 h-3 text-[#E65C00] fill-current" />
                        <span>Tap to watch video reel</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-[#E65C00]" />
                        <span>Tap to expand full artwork</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox / Video Player Modal */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-50 bg-[#3D1A00]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" 
          onClick={() => setLightboxItem(null)}
        >
          <div 
            className="relative max-w-4xl w-full border-2 border-[#E65C00] rounded-3xl overflow-hidden bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-5 right-5 bg-[#E65C00] hover:bg-[#FF7A00] text-white p-2.5 rounded-full z-20 hover:scale-110 transition-transform shadow-xl"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Content Display */}
            {lightboxItem.type === 'VIDEO' ? (
              <div className="relative aspect-video w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black shadow-inner">
                {isYouTubeUrl(lightboxItem.url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(lightboxItem.url) || ''}
                    title={lightboxItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={lightboxItem.url}
                    poster={lightboxItem.src}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-[#FFF0E0]">
                <img 
                  src={lightboxItem.src} 
                  alt={lightboxItem.title} 
                  className="w-full h-auto max-h-[75vh] object-contain" 
                />
              </div>
            )}

            {/* Metadata Bar */}
            <div className="p-4 flex items-center justify-between gap-4 bg-white">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-[#E65C00] text-white px-2.5 py-0.5 rounded-full">
                    {lightboxItem.type === 'VIDEO' ? 'Video Reel' : lightboxItem.category}
                  </span>
                  {lightboxItem.type === 'VIDEO' && isYouTubeUrl(lightboxItem.url) && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      YouTube Stream
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#3D1A00]">
                  {lightboxItem.title}
                </h3>
                {lightboxItem.description && (
                  <p className="text-xs text-[#6B3A2A]">
                    {lightboxItem.description}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}


