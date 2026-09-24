import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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

async function main() {
  console.log('--- Starting Preferences Seed ---');
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'event-hero-config.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  // 1. Seed active home event
  const activeEventId = data.activeHomeEventId || 'evt-ganesh-chaturthi';
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
  const events = data.events || {};
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
