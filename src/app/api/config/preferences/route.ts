import { NextRequest, NextResponse } from 'next/server';
import {
  getPreferencesForEvent,
  getFeaturedEventPreferences,
  setPreference,
  saveEventPreferences,
  setActiveHomeEventId,
} from '@/lib/config-preferences';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const isFeatured = searchParams.get('featured') === 'true';

    if (eventId) {
      const data = await getPreferencesForEvent(eventId);
      return NextResponse.json({
        success: true,
        eventId: data.eventId,
        preferences: data.preferences,
        heroConfig: data.heroConfig,
        templateConfig: data.templateConfig,
      });
    }

    if (isFeatured) {
      const data = await getFeaturedEventPreferences();
      return NextResponse.json({
        success: true,
        activeHomeEventId: data.activeHomeEventId,
        preferences: data.preferences,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request: provide eventId or featured=true',
    }, { status: 400 });
  } catch (error) {
    console.error('Error in /api/config/preferences GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Set active home event ID
    if (body.action === 'setActiveHomeEvent' || body.activeHomeEventId) {
      const targetEventId = body.activeHomeEventId || body.eventId;
      if (!targetEventId) {
        return NextResponse.json({ success: false, error: 'Missing activeHomeEventId' }, { status: 400 });
      }
      await setActiveHomeEventId(targetEventId);
      return NextResponse.json({ success: true, activeHomeEventId: targetEventId });
    }

    // 2. Set single preference
    if (body.preference) {
      const result = await setPreference(
        body.preference,
        body.value,
        body.eventId,
        body.dataType
      );
      return NextResponse.json({ success: true, config: result });
    }

    // 3. Save entire event template/hero config
    if (body.eventId && body.config) {
      const result = await saveEventPreferences(body.eventId, body.config);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request body format',
    }, { status: 400 });
  } catch (error) {
    console.error('Error in /api/config/preferences POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}
