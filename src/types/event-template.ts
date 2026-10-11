export type HeroType = '3d-model' | 'image' | 'video';

export type HeroVariant =
  // 3D Model Variants
  | '3d-sanctum'
  | '3d-split'
  | '3d-pedestal'
  | '3d-floating'
  // Image Variants
  | 'image-split'
  | 'image-fullscreen'
  | 'image-card-showcase'
  | 'image-editorial'
  // Video Variants
  | 'video-cinema'
  | 'video-split'
  | 'video-theater'
  | 'video-banner-strip';

export interface HeroCTA {
  label: string;
  action: 'pooja' | 'donation' | 'rsvp' | 'whatsapp' | 'link';
  linkUrl?: string;
  openNewTab?: boolean;
}

export interface EventHeroConfig {
  heroType: HeroType;
  heroVariant?: HeroVariant | string;
  // 3D Model Settings
  modelUrl?: string;
  modelScale?: number;
  proceduralFallback?: 'ganesha' | 'pedestal' | 'none';
  showParticles?: boolean;
  showCornerMotifs?: boolean;
  showRadialAura?: boolean;
  // Media Settings (for Image / Video hero types)
  bannerImageUrl?: string;
  videoUrl?: string;
  // Typography & Content
  presenterBadge: string;
  title: string;
  subtitle: string;
  tagline?: string;
  loadingText?: string;
  scrollCueText?: string;
  // Theme styling
  primaryColor?: string; // e.g. '#E65C00'
  accentColor?: string; // e.g. '#CC4000'
  backgroundColor?: string; // e.g. '#FFF8F0'
  // CTAs
  primaryCta?: HeroCTA;
  secondaryCta?: HeroCTA;
  whatsAppUrl?: string;
}

export interface EventSectionToggles {
  showCountdown: boolean;
  showEventDetails: boolean;
  showStory: boolean;
  showSpecs: boolean;
  showMediaGallery: boolean;
  showOfferings: boolean;
  showSponsors: boolean;
}

export interface EventMediaTeaserConfig {
  videoUrl?: string;
  sectionTitle?: string;
  subtitle?: string;
  posterUrl?: string;
}

export interface EventTemplateConfig {
  id: string;
  title: string;
  eventSlug: string;
  targetDate?: string; // ISO string for countdown
  hero: EventHeroConfig;
  sections: EventSectionToggles;
  mediaTeaser?: EventMediaTeaserConfig;
  story?: {
    badge?: string;
    quote?: string;
    description?: string;
    stats?: Array<{ value: string; label: string }>;
  };
  specs?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
  updatedAt?: string;
}

export interface EventHeroStorageConfig {
  activeHomeEventId: string;
  events: Record<string, EventTemplateConfig>;
}
