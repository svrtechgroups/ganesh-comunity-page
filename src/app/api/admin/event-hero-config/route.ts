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

// Cleanup: remove legacy JSON file from filesystem if it exists
try {
  const legacyJsonPath = path.join(process.cwd(), 'src', 'data', 'event-hero-config.json');
  if (fs.existsSync(legacyJsonPath)) {
    fs.unlinkSync(legacyJsonPath);
  }
} catch (e) {
  // Ignore
}

export async function GET(req: Request) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    // Read all events from Event table and construct from Config table
    const events = await prisma.event.findMany({ select: { id: true, title: true } });
    const featured = await getFeaturedEventPreferences();
    const eventMap: Record<string, EventTemplateConfig> = {};

    for (const ev of events) {
      const prefData = await getPreferencesForEvent(ev.id);
      eventMap[ev.id] = prefData.templateConfig;
    }

    const storageData: EventHeroStorageConfig = {
      activeHomeEventId: featured.activeHomeEventId || '',
      events: eventMap,
    };

    return NextResponse.json({
      success: true,
      data: storageData,
    });
  } catch (err) {
    console.error('Failed to load event hero config from DB:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to load configuration from database.',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'Admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 1. Update activeHomeEventId in DB
    if (body.activeHomeEventId) {
      await setActiveHomeEventId(body.activeHomeEventId);
    }

    // 2. Update specific event config in DB
    if (body.event && body.event.id) {
      const eventToSave: EventTemplateConfig = {
        ...body.event,
        updatedAt: new Date().toISOString(),
      };
      await saveEventPreferences(body.event.id, eventToSave);
    }

    // 3. Update full events map if provided directly
    if (body.events) {
      for (const [evtId, cfg] of Object.entries(body.events)) {
        await saveEventPreferences(evtId, cfg as EventTemplateConfig);
      }
    }

    // Read fresh state directly from DB
    const events = await prisma.event.findMany({ select: { id: true } });
    const featured = await getFeaturedEventPreferences();
    const eventMap: Record<string, EventTemplateConfig> = {};

    for (const ev of events) {
      const prefData = await getPreferencesForEvent(ev.id);
      eventMap[ev.id] = prefData.templateConfig;
    }

    const updatedData: EventHeroStorageConfig = {
      activeHomeEventId: featured.activeHomeEventId || '',
      events: eventMap,
    };

    return NextResponse.json({
      success: true,
      data: updatedData,
      message: 'Event hero configuration saved successfully to database.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save configuration';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
