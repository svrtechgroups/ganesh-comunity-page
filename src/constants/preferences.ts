/**
 * Preference Constants
 * 
 * Central registry of typed preference keys and prefixes used throughout the application.
 * All preference keys should be referenced through these constants.
 */

export const PREFERENCE_PREFIX = {
  HOME: 'home',
  FEATURED_EVENT: 'featuredEvent',
  EVENT: 'event',
} as const;

export type PreferencePrefix = typeof PREFERENCE_PREFIX[keyof typeof PREFERENCE_PREFIX];

// Home page preferences
export const PREF_HOME_ACTIVE_EVENT_ID = 'home.activeHomeEventId';

// Featured event hero preferences (prefix: 'featuredEvent')
export const PREF_FEATURED_HERO_TYPE = 'featuredEvent.hero.heroType';
export const PREF_FEATURED_HERO_VARIANT = 'featuredEvent.hero.heroVariant';
export const PREF_FEATURED_MODEL_URL = 'featuredEvent.hero.modelUrl';
export const PREF_FEATURED_MODEL_SCALE = 'featuredEvent.hero.modelScale';
export const PREF_FEATURED_PROCEDURAL_FALLBACK = 'featuredEvent.hero.proceduralFallback';
export const PREF_FEATURED_SHOW_PARTICLES = 'featuredEvent.hero.showParticles';
export const PREF_FEATURED_SHOW_CORNER_MOTIFS = 'featuredEvent.hero.showCornerMotifs';
export const PREF_FEATURED_SHOW_RADIAL_AURA = 'featuredEvent.hero.showRadialAura';
export const PREF_FEATURED_BANNER_IMAGE_URL = 'featuredEvent.hero.bannerImageUrl';
export const PREF_FEATURED_VIDEO_URL = 'featuredEvent.hero.videoUrl';
export const PREF_FEATURED_PRESENTER_BADGE = 'featuredEvent.hero.presenterBadge';
export const PREF_FEATURED_TITLE = 'featuredEvent.hero.title';
export const PREF_FEATURED_SUBTITLE = 'featuredEvent.hero.subtitle';
export const PREF_FEATURED_TAGLINE = 'featuredEvent.hero.tagline';
export const PREF_FEATURED_LOADING_TEXT = 'featuredEvent.hero.loadingText';
export const PREF_FEATURED_SCROLL_CUE_TEXT = 'featuredEvent.hero.scrollCueText';
export const PREF_FEATURED_PRIMARY_COLOR = 'featuredEvent.hero.primaryColor';
export const PREF_FEATURED_ACCENT_COLOR = 'featuredEvent.hero.accentColor';
export const PREF_FEATURED_BACKGROUND_COLOR = 'featuredEvent.hero.backgroundColor';
export const PREF_FEATURED_PRIMARY_CTA = 'featuredEvent.hero.primaryCta';
export const PREF_FEATURED_SECONDARY_CTA = 'featuredEvent.hero.secondaryCta';
export const PREF_FEATURED_WHATSAPP_URL = 'featuredEvent.hero.whatsAppUrl';
export const PREF_FEATURED_SECTIONS = 'featuredEvent.sections';
export const PREF_FEATURED_STORY = 'featuredEvent.story';
export const PREF_FEATURED_SPECS = 'featuredEvent.specs';

// Event-specific preferences (scoped to an eventId, prefix: 'event')
export const PREF_EVENT_HERO_TYPE = 'event.hero.heroType';
export const PREF_EVENT_HERO_VARIANT = 'event.hero.heroVariant';
export const PREF_EVENT_MODEL_URL = 'event.hero.modelUrl';
export const PREF_EVENT_MODEL_SCALE = 'event.hero.modelScale';
export const PREF_EVENT_PROCEDURAL_FALLBACK = 'event.hero.proceduralFallback';
export const PREF_EVENT_SHOW_PARTICLES = 'event.hero.showParticles';
export const PREF_EVENT_SHOW_CORNER_MOTIFS = 'event.hero.showCornerMotifs';
export const PREF_EVENT_SHOW_RADIAL_AURA = 'event.hero.showRadialAura';
export const PREF_EVENT_BANNER_IMAGE_URL = 'event.hero.bannerImageUrl';
export const PREF_EVENT_VIDEO_URL = 'event.hero.videoUrl';
export const PREF_EVENT_PRESENTER_BADGE = 'event.hero.presenterBadge';
export const PREF_EVENT_TITLE = 'event.hero.title';
export const PREF_EVENT_SUBTITLE = 'event.hero.subtitle';
export const PREF_EVENT_TAGLINE = 'event.hero.tagline';
export const PREF_EVENT_LOADING_TEXT = 'event.hero.loadingText';
export const PREF_EVENT_SCROLL_CUE_TEXT = 'event.hero.scrollCueText';
export const PREF_EVENT_PRIMARY_COLOR = 'event.hero.primaryColor';
export const PREF_EVENT_ACCENT_COLOR = 'event.hero.accentColor';
export const PREF_EVENT_BACKGROUND_COLOR = 'event.hero.backgroundColor';
export const PREF_EVENT_PRIMARY_CTA = 'event.hero.primaryCta';
export const PREF_EVENT_SECONDARY_CTA = 'event.hero.secondaryCta';
export const PREF_EVENT_WHATSAPP_URL = 'event.hero.whatsAppUrl';
export const PREF_EVENT_SECTIONS = 'event.sections';
export const PREF_EVENT_STORY = 'event.story';
export const PREF_EVENT_SPECS = 'event.specs';
export const PREF_EVENT_TARGET_DATE = 'event.targetDate';
export const PREF_EVENT_SLUG = 'event.eventSlug';

/**
 * All preference keys grouped by namespace
 */
export const PREFERENCES = {
  home: {
    activeHomeEventId: PREF_HOME_ACTIVE_EVENT_ID,
  },
  featuredEvent: {
    heroType: PREF_FEATURED_HERO_TYPE,
    heroVariant: PREF_FEATURED_HERO_VARIANT,
    modelUrl: PREF_FEATURED_MODEL_URL,
    modelScale: PREF_FEATURED_MODEL_SCALE,
    proceduralFallback: PREF_FEATURED_PROCEDURAL_FALLBACK,
    showParticles: PREF_FEATURED_SHOW_PARTICLES,
    showCornerMotifs: PREF_FEATURED_SHOW_CORNER_MOTIFS,
    showRadialAura: PREF_FEATURED_SHOW_RADIAL_AURA,
    bannerImageUrl: PREF_FEATURED_BANNER_IMAGE_URL,
    videoUrl: PREF_FEATURED_VIDEO_URL,
    presenterBadge: PREF_FEATURED_PRESENTER_BADGE,
    title: PREF_FEATURED_TITLE,
    subtitle: PREF_FEATURED_SUBTITLE,
    tagline: PREF_FEATURED_TAGLINE,
    loadingText: PREF_FEATURED_LOADING_TEXT,
    scrollCueText: PREF_FEATURED_SCROLL_CUE_TEXT,
    primaryColor: PREF_FEATURED_PRIMARY_COLOR,
    accentColor: PREF_FEATURED_ACCENT_COLOR,
    backgroundColor: PREF_FEATURED_BACKGROUND_COLOR,
    primaryCta: PREF_FEATURED_PRIMARY_CTA,
    secondaryCta: PREF_FEATURED_SECONDARY_CTA,
    whatsAppUrl: PREF_FEATURED_WHATSAPP_URL,
    sections: PREF_FEATURED_SECTIONS,
    story: PREF_FEATURED_STORY,
    specs: PREF_FEATURED_SPECS,
  },
  event: {
    heroType: PREF_EVENT_HERO_TYPE,
    heroVariant: PREF_EVENT_HERO_VARIANT,
    modelUrl: PREF_EVENT_MODEL_URL,
    modelScale: PREF_EVENT_MODEL_SCALE,
    proceduralFallback: PREF_EVENT_PROCEDURAL_FALLBACK,
    showParticles: PREF_EVENT_SHOW_PARTICLES,
    showCornerMotifs: PREF_EVENT_SHOW_CORNER_MOTIFS,
    showRadialAura: PREF_EVENT_SHOW_RADIAL_AURA,
    bannerImageUrl: PREF_EVENT_BANNER_IMAGE_URL,
    videoUrl: PREF_EVENT_VIDEO_URL,
    presenterBadge: PREF_EVENT_PRESENTER_BADGE,
    title: PREF_EVENT_TITLE,
    subtitle: PREF_EVENT_SUBTITLE,
    tagline: PREF_EVENT_TAGLINE,
    loadingText: PREF_EVENT_LOADING_TEXT,
    scrollCueText: PREF_EVENT_SCROLL_CUE_TEXT,
    primaryColor: PREF_EVENT_PRIMARY_COLOR,
    accentColor: PREF_EVENT_ACCENT_COLOR,
    backgroundColor: PREF_EVENT_BACKGROUND_COLOR,
    primaryCta: PREF_EVENT_PRIMARY_CTA,
    secondaryCta: PREF_EVENT_SECONDARY_CTA,
    whatsAppUrl: PREF_EVENT_WHATSAPP_URL,
    sections: PREF_EVENT_SECTIONS,
    story: PREF_EVENT_STORY,
    specs: PREF_EVENT_SPECS,
    targetDate: PREF_EVENT_TARGET_DATE,
    eventSlug: PREF_EVENT_SLUG,
  },
} as const;

/**
 * Data type declaration for each field to ensure correct serialization and parsing
 */
export const FIELD_DATA_TYPES: Record<string, 'string' | 'boolean' | 'number' | 'json'> = {
  heroType: 'string',
  heroVariant: 'string',
  modelUrl: 'string',
  modelScale: 'number',
  proceduralFallback: 'string',
  showParticles: 'boolean',
  showCornerMotifs: 'boolean',
  showRadialAura: 'boolean',
  bannerImageUrl: 'string',
  videoUrl: 'string',
  presenterBadge: 'string',
  title: 'string',
  subtitle: 'string',
  tagline: 'string',
  loadingText: 'string',
  scrollCueText: 'string',
  primaryColor: 'string',
  accentColor: 'string',
  backgroundColor: 'string',
  primaryCta: 'json',
  secondaryCta: 'json',
  whatsAppUrl: 'string',
  sections: 'json',
  story: 'json',
  specs: 'json',
  targetDate: 'string',
  eventSlug: 'string',
  activeHomeEventId: 'string',
};

/**
 * Helper to compute the unique configKey for deterministic upserts
 */
export function buildConfigKey(preference: string, eventId?: string | null): string {
  return eventId ? `${eventId}:${preference}` : `global:${preference}`;
}

/**
 * Helper to determine prefix from preference name
 */
export function getPrefixFromPreference(preference: string): string {
  const parts = preference.split('.');
  return parts[0] || 'general';
}
