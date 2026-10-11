import { prisma } from '@/lib/prisma';
import {
  PREFERENCE_PREFIX,
  PREF_HOME_ACTIVE_EVENT_ID,
  PREFERENCES,
  FIELD_DATA_TYPES,
  buildConfigKey,
  getPrefixFromPreference,
} from '@/constants/preferences';
import { EventTemplateConfig, EventHeroConfig } from '@/types/event-template';

export type ConfigDataType = 'string' | 'boolean' | 'number' | 'json';

export interface PreferenceItem {
  preference: string;
  prefix: string;
  value: any;
  dataType: ConfigDataType;
  eventId?: string | null;
  configKey: string;
}

/**
 * Parses raw stored string into typed value according to dataType
 */
export function parseConfigValue(value: string, dataType: string): any {
  switch (dataType) {
    case 'boolean':
      return value === 'true' || value === '1';
    case 'number': {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }
    case 'json':
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    case 'string':
    default:
      return value;
  }
}

/**
 * Serializes typed value into string and infers dataType if not specified
 */
export function serializeConfigValue(value: any, explicitDataType?: ConfigDataType): { value: string; dataType: ConfigDataType } {
  if (explicitDataType) {
    return {
      value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
      dataType: explicitDataType,
    };
  }

  if (typeof value === 'boolean') {
    return { value: value ? 'true' : 'false', dataType: 'boolean' };
  }
  if (typeof value === 'number') {
    return { value: String(value), dataType: 'number' };
  }
  if (typeof value === 'object' && value !== null) {
    return { value: JSON.stringify(value), dataType: 'json' };
  }
  return { value: String(value ?? ''), dataType: 'string' };
}

/**
 * Sets or updates a single preference entry in the Config table
 */
export async function setPreference(
  preference: string,
  value: any,
  eventId?: string | null,
  dataType?: ConfigDataType
) {
  const prefix = getPrefixFromPreference(preference);
  const key = buildConfigKey(preference, eventId);
  const field = preference.split('.').pop() || '';
  const inferredType = dataType || (FIELD_DATA_TYPES[field] as ConfigDataType) || undefined;
  const serialized = serializeConfigValue(value, inferredType);

  return await prisma.config.upsert({
    where: { configKey: key },
    update: {
      value: serialized.value,
      dataType: serialized.dataType,
      prefix,
      preference,
      eventId: eventId || null,
    },
    create: {
      configKey: key,
      prefix,
      preference,
      value: serialized.value,
      dataType: serialized.dataType,
      eventId: eventId || null,
    },
  });
}

/**
 * Reconstructs a full EventTemplateConfig object from flat preferences
 */
function reconstructEventConfig(
  eventId: string,
  prefs: Record<string, any>,
  eventTitle?: string
): EventTemplateConfig {
  const hero: EventHeroConfig = {
    heroType: prefs['event.hero.heroType'] || '3d-model',
    heroVariant: prefs['event.hero.heroVariant'] || '3d-sanctum',
    modelUrl: prefs['event.hero.modelUrl'] || '/assets/idols/Lord Ganesh.glb',
    modelScale: prefs['event.hero.modelScale'] ?? 2.8,
    proceduralFallback: prefs['event.hero.proceduralFallback'] || 'none',
    showParticles: prefs['event.hero.showParticles'] ?? true,
    showCornerMotifs: prefs['event.hero.showCornerMotifs'] ?? true,
    showRadialAura: prefs['event.hero.showRadialAura'] ?? true,
    bannerImageUrl: prefs['event.hero.bannerImageUrl'] || '',
    videoUrl: prefs['event.hero.videoUrl'] || '',
    presenterBadge: prefs['event.hero.presenterBadge'] || 'Welcome to MITRA UK',
    title: prefs['event.hero.title'] || eventTitle || 'MITRA UK Event',
    subtitle: prefs['event.hero.subtitle'] || 'Experience Culture & Community',
    tagline: prefs['event.hero.tagline'] || '',
    loadingText: prefs['event.hero.loadingText'] || 'LOADING...',
    scrollCueText: prefs['event.hero.scrollCueText'] || 'Scroll to Explore',
    primaryColor: prefs['event.hero.primaryColor'] || '#E65C00',
    accentColor: prefs['event.hero.accentColor'] || '#CC4000',
    backgroundColor: prefs['event.hero.backgroundColor'] || '#FFF8F0',
    primaryCta: prefs['event.hero.primaryCta'] || { label: 'Register Now', action: 'rsvp' },
    secondaryCta: (prefs['event.hero.secondaryCta']?.label && prefs['event.hero.secondaryCta']?.label.trim().toLowerCase() !== 'learn more')
      ? prefs['event.hero.secondaryCta']
      : undefined,
    whatsAppUrl: prefs['event.hero.whatsAppUrl'] || '',
  };

  return {
    id: eventId,
    title: prefs['event.hero.title'] || eventTitle || 'MITRA UK Event',
    eventSlug: (() => {
      const slug = prefs['event.eventSlug'];
      if (!slug || slug === eventId || slug === 'ganesh-event-2026') {
        return `events/${eventId}`;
      }
      const clean = slug.replace(/^\/+/, '');
      return clean.startsWith('events/') ? clean : `events/${clean}`;
    })(),
    targetDate: prefs['event.targetDate'],
    hero,
    sections: prefs['event.sections'] || (
      (eventId === 'evt-ganesh-chaturthi' || eventId.toLowerCase().includes('ganesh'))
        ? {
            showCountdown: true,
            showEventDetails: true,
            showStory: true,
            showSpecs: true,
            showMediaGallery: true,
            showOfferings: true,
            showSponsors: true,
          }
        : {
            showCountdown: false,
            showEventDetails: false,
            showStory: false,
            showSpecs: false,
            showMediaGallery: false,
            showOfferings: false,
            showSponsors: false,
          }
    ),
    mediaTeaser: prefs['event.mediaTeaser'] || {
      videoUrl: prefs['event.hero.videoUrl'] || '/assets/teaser-reel.mp4',
      sectionTitle: 'TEASER REEL & EVENT POSTERS',
      subtitle: 'Experience the official event teaser video reel and high-resolution event artwork from our media assets.',
      posterUrl: prefs['event.hero.bannerImageUrl'] || '/assets/poster.jpg',
    },
    story: prefs['event.story'],
    specs: prefs['event.specs'],
  };
}

/**
 * Fetch all preferences for a given eventId
 */
export async function getPreferencesForEvent(eventId: string) {
  const rows = await prisma.config.findMany({
    where: { eventId },
  });

  const preferences: Record<string, any> = {};
  for (const row of rows) {
    preferences[row.preference] = parseConfigValue(row.value, row.dataType);
  }

  // Also query Event table for fallback title
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, date: true },
  });

  const templateConfig = reconstructEventConfig(eventId, preferences, event?.title);

  return {
    eventId,
    rawConfigs: rows,
    preferences,
    templateConfig,
    heroConfig: templateConfig.hero,
  };
}

/**
 * Fetch all preferences for current featured event.
 * Returns a single flat `preferences` map (event.* rows, with any featuredEvent.* overrides applied)
 * so the frontend can call getPreference(key) directly.
 */
export async function getFeaturedEventPreferences() {
  // 1. Get active home event ID
  const activePref = await prisma.config.findFirst({
    where: { preference: PREF_HOME_ACTIVE_EVENT_ID },
  });
  const activeHomeEventId = activePref?.value ?? null;

  // 2. Get all event-scoped preferences for the active event
  const eventRows = activeHomeEventId
    ? await prisma.config.findMany({ where: { eventId: activeHomeEventId } })
    : [];

  const preferences: Record<string, any> = {};
  for (const row of eventRows) {
    preferences[row.preference] = parseConfigValue(row.value, row.dataType);
  }

  // 3. Get any global featuredEvent.* overrides and merge on top
  const featuredRows = await prisma.config.findMany({
    where: { prefix: PREFERENCE_PREFIX.FEATURED_EVENT },
  });
  for (const row of featuredRows) {
    preferences[row.preference] = parseConfigValue(row.value, row.dataType);
  }

  return {
    activeHomeEventId,
    preferences,
  };
}

/**
 * Save complete or partial EventTemplateConfig to Config table for a given eventId
 */
export async function saveEventPreferences(eventId: string, config: Partial<EventTemplateConfig>) {
  const ops: Promise<any>[] = [];

  if (config.targetDate !== undefined) {
    ops.push(setPreference(PREFERENCES.event.targetDate, config.targetDate, eventId));
  }
  if (config.eventSlug !== undefined) {
    ops.push(setPreference(PREFERENCES.event.eventSlug, config.eventSlug, eventId));
  }
  if (config.sections !== undefined) {
    ops.push(setPreference(PREFERENCES.event.sections, config.sections, eventId));
  }
  if (config.mediaTeaser !== undefined) {
    ops.push(setPreference(PREFERENCES.event.mediaTeaser, config.mediaTeaser, eventId));
  }
  if (config.story !== undefined) {
    ops.push(setPreference(PREFERENCES.event.story, config.story, eventId));
  }
  if (config.specs !== undefined) {
    ops.push(setPreference(PREFERENCES.event.specs, config.specs, eventId));
  }

  if (config.hero) {
    const hero = config.hero;
    const heroFields: (keyof EventHeroConfig)[] = [
      'heroType',
      'heroVariant',
      'modelUrl',
      'modelScale',
      'proceduralFallback',
      'showParticles',
      'showCornerMotifs',
      'showRadialAura',
      'bannerImageUrl',
      'videoUrl',
      'presenterBadge',
      'title',
      'subtitle',
      'tagline',
      'loadingText',
      'scrollCueText',
      'primaryColor',
      'accentColor',
      'backgroundColor',
      'primaryCta',
      'secondaryCta',
      'whatsAppUrl',
    ];

    for (const field of heroFields) {
      if (hero[field] !== undefined) {
        const prefKey = `event.hero.${field}`;
        ops.push(setPreference(prefKey, hero[field], eventId));
      }
    }
  }

  await Promise.all(ops);
  return await getPreferencesForEvent(eventId);
}

/**
 * Set the active featured event ID for home
 */
export async function setActiveHomeEventId(eventId: string) {
  return await setPreference(PREF_HOME_ACTIVE_EVENT_ID, eventId, null, 'string');
}
