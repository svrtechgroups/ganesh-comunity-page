import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthenticatedUser } from '@/lib/auth';
import { EventHeroStorageConfig, EventTemplateConfig } from '@/types/event-template';
import {
  saveEventPreferences,
  setActiveHomeEventId,
  getPreferencesForEvent,
  getFeaturedEventPreferences,
} from '@/lib/config-preferences';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'event-hero-config.json');

function readStorageConfig(): EventHeroStorageConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read event-hero-config.json:', e);
  }
  return {
    activeHomeEventId: 'evt-ganesh-chaturthi',
    events: {},
  };
}

function writeStorageConfig(config: EventHeroStorageConfig) {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write backup JSON:', e);
  }
}

export async function GET(req: Request) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    // Read all events from Event table and construct from Config
    const events = await prisma.event.findMany({ select: { id: true } });
    const featured = await getFeaturedEventPreferences();
    const eventMap: Record<string, EventTemplateConfig> = {};

    for (const ev of events) {
      const prefData = await getPreferencesForEvent(ev.id);
      eventMap[ev.id] = prefData.templateConfig;
    }

    const storageData: EventHeroStorageConfig = {
      activeHomeEventId: featured.activeHomeEventId,
      events: eventMap,
    };

    return NextResponse.json({
      success: true,
      data: storageData,
    });
  } catch (err) {
    console.warn('Falling back to file storage on GET:', err);
    const storage = readStorageConfig();
    return NextResponse.json({
      success: true,
      data: storage,
    });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const storage = readStorageConfig();

    // 1. Update activeHomeEventId in DB
    if (body.activeHomeEventId) {
      storage.activeHomeEventId = body.activeHomeEventId;
      await setActiveHomeEventId(body.activeHomeEventId);
    }

    // 2. Update specific event config in DB
    if (body.event && body.event.id) {
      const eventToSave: EventTemplateConfig = {
        ...body.event,
        updatedAt: new Date().toISOString(),
      };
      storage.events[body.event.id] = eventToSave;
      await saveEventPreferences(body.event.id, eventToSave);
    }

    // 3. Update full events map if provided directly
    if (body.events) {
      storage.events = {
        ...storage.events,
        ...body.events,
      };
      for (const [evtId, cfg] of Object.entries(body.events)) {
        await saveEventPreferences(evtId, cfg as EventTemplateConfig);
      }
    }

    // Keep JSON file synced as backup
    writeStorageConfig(storage);

    return NextResponse.json({
      success: true,
      data: storage,
      message: 'Event hero configuration saved successfully to database.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save configuration';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
