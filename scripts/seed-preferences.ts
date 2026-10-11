import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREFERENCE_PREFIX = {
  HOME: 'home',
  FEATURED_EVENT: 'featuredEvent',
  EVENT: 'event',
} as const;

function serializeConfigValue(value: any): { value: string; dataType: string } {
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

const DEFAULT_SEED_DATA = {
  activeHomeEventId: 'evt-ganesh-chaturthi',
  events: {
    'evt-ganesh-chaturthi': {
      id: 'evt-ganesh-chaturthi',
      title: 'THE BIGGEST MAHA GANAPATHI',
      eventSlug: 'events/evt-ganesh-chaturthi',
      targetDate: '2026-09-14T00:00:00.000Z',
      hero: {
        heroType: '3d-model',
        heroVariant: '3d-sanctum',
        modelUrl: '/assets/idols/Lord Ganesh.glb',
        modelScale: 2.8,
        proceduralFallback: 'ganesha',
        showParticles: true,
        showCornerMotifs: true,
        showRadialAura: true,
        bannerImageUrl: '/assets/poster.jpg',
        videoUrl: '',
        presenterBadge: 'Welcome to Mana Indian Telugu Roots Abroad (MITRA UK)',
        title: 'THE BIGGEST MAHA GANAPATHI',
        subtitle: 'LONDON GANESH MAHOTSAV 2026',
        tagline: 'Streaming 3D Bappa Murti & Devotional Rays',
        loadingText: 'ENTERING SANCTUM...',
        scrollCueText: 'Scroll to Enter Sanctum',
        primaryColor: '#E65C00',
        accentColor: '#CC4000',
        backgroundColor: '#FFF8F0',
        primaryCta: {
          label: 'Book Pooja / Seva',
          action: 'pooja',
        },
        secondaryCta: {
          label: 'Make Donation',
          action: 'donation',
        },
        whatsAppUrl: 'https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd',
      },
      sections: {
        showCountdown: true,
        showEventDetails: true,
        showStory: true,
        showSpecs: true,
        showMediaGallery: true,
        showOfferings: true,
        showSponsors: true,
      },
      story: {
        badge: 'THE DEVOTIONAL JOURNEY',
        quote: '“From Lalbaugcha Raja in Mumbai to Khairatabad Ganesh in Hyderabad… now London\'s own iconic Ganesha arrives in Slough.”',
        description: 'Organized by MITRA UK in association with ELE Entertainments and presented by Biryanis and more!, the Maha Ganapathi Mahotsav represents a historic cultural milestone for the UK diaspora. Step into the sanctum, offer your prayers, and experience the divine presence of Bappa in Great Britain.',
        stats: [
          { value: '5,000+', label: 'Expected Devotees' },
          { value: '100%', label: 'Eco-Friendly Clay Murti' },
          { value: 'Grand Aarti', label: 'Daily Vedic Celebrations' },
        ],
      },
      specs: {
        badge: 'IDOL SPECIFICATIONS & ARTISTRY',
        title: 'THE MAHA GANAPATHI MURTI',
        subtitle: 'Hand-sculpted by master artisans with traditional devotion, designed specifically for the historic Slough Mahotsav.',
      },
    },
  },
};

async function main() {
  console.log('--- Starting Preferences Seed (Pure DB) ---');

  // 1. Seed active home event
  const activeEventId = DEFAULT_SEED_DATA.activeHomeEventId || 'evt-ganesh-chaturthi';
  const homeKey = `global:home.activeHomeEventId`;
  await prisma.config.upsert({
    where: { configKey: homeKey },
    update: {
      value: activeEventId,
      dataType: 'string',
      prefix: PREFERENCE_PREFIX.HOME,
      preference: 'home.activeHomeEventId',
    },
    create: {
      configKey: homeKey,
      prefix: PREFERENCE_PREFIX.HOME,
      preference: 'home.activeHomeEventId',
      value: activeEventId,
      dataType: 'string',
    },
  });
  console.log(`Saved home.activeHomeEventId = ${activeEventId}`);

  // 2. Seed events
  let totalSaved = 1;
  const events = DEFAULT_SEED_DATA.events || {};
  for (const [eventId, eventConfig] of Object.entries(events as Record<string, any>)) {
    // Ensure event in DB
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      await prisma.event.create({
        data: {
          id: eventId,
          title: eventConfig.title || eventId,
          description: eventConfig.story?.description || eventConfig.hero?.subtitle || 'Community Event',
          date: eventConfig.targetDate ? String(eventConfig.targetDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
          category: 'cultural',
          venue: 'Slough Community Centre',
          address: 'Slough, UK',
          bannerUrl: eventConfig.hero?.bannerImageUrl || '/assets/poster.jpg',
          status: 'Upcoming',
        },
      });
      console.log(`Created Event row: ${eventId}`);
    }

    // Save targetDate, eventSlug, sections, story, specs
    const rootFields: Record<string, any> = {
      'event.targetDate': eventConfig.targetDate,
      'event.eventSlug': eventConfig.eventSlug,
      'event.sections': eventConfig.sections,
      'event.story': eventConfig.story,
      'event.specs': eventConfig.specs,
    };

    for (const [pref, val] of Object.entries(rootFields)) {
      if (val !== undefined) {
        const serialized = serializeConfigValue(val);
        const configKey = `${eventId}:${pref}`;
        await prisma.config.upsert({
          where: { configKey },
          update: {
            value: serialized.value,
            dataType: serialized.dataType,
            prefix: PREFERENCE_PREFIX.EVENT,
            preference: pref,
            eventId,
          },
          create: {
            configKey,
            prefix: PREFERENCE_PREFIX.EVENT,
            preference: pref,
            value: serialized.value,
            dataType: serialized.dataType,
            eventId,
          },
        });
        totalSaved++;
      }
    }

    // Save hero fields
    if (eventConfig.hero) {
      for (const [heroField, heroVal] of Object.entries(eventConfig.hero)) {
        if (heroVal !== undefined) {
          const pref = `event.hero.${heroField}`;
          const serialized = serializeConfigValue(heroVal);
          const configKey = `${eventId}:${pref}`;
          await prisma.config.upsert({
            where: { configKey },
            update: {
              value: serialized.value,
              dataType: serialized.dataType,
              prefix: PREFERENCE_PREFIX.EVENT,
              preference: pref,
              eventId,
            },
            create: {
              configKey,
              prefix: PREFERENCE_PREFIX.EVENT,
              preference: pref,
              value: serialized.value,
              dataType: serialized.dataType,
              eventId,
            },
          });
          totalSaved++;
        }
      }
    }
  }

  const count = await prisma.config.count();
  console.log(`Seeding complete! Total Config records in DB: ${count} (upserted: ${totalSaved})`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
