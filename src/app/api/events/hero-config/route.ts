import { NextRequest, NextResponse } from 'next/server';
import {
  getPreferencesForEvent,
  getFeaturedEventPreferences,
} from '@/lib/config-preferences';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (eventId) {
      const eventData = await getPreferencesForEvent(eventId);
      return NextResponse.json({
        success: true,
        data: eventData.templateConfig,
      });
    }

    // Return active home event config
    const featuredData = await getFeaturedEventPreferences();
    return NextResponse.json({
      success: true,
      activeHomeEventId: featuredData.activeHomeEventId,
      data: featuredData.templateConfig,
    });
  } catch (error) {
    console.error('Error fetching hero config from Config table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch config',
    }, { status: 500 });
  }
}
