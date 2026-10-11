'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PreferencesState {
  preferences: Record<string, any>;
  activeHomeEventId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches featured event preferences from the API and exposes a
 * getPreference(key, defaultValue?) helper for safe value access.
 *
 * Usage:
 *   const { getPreference, isLoading } = usePreferences();
 *   const title = getPreference('event.hero.title', 'My Event');
 *   const showParticles = getPreference('event.hero.showParticles', true);
 */
export function usePreferences(eventId?: string) {
  const [state, setState] = useState<PreferencesState>({
    preferences: {},
    activeHomeEventId: null,
    isLoading: true,
    error: null,
  });

  const fetchedRef = useRef(false);

  const fetchPreferences = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const url = eventId
        ? `/api/config/preferences?eventId=${encodeURIComponent(eventId)}`
        : '/api/config/preferences?featured=true';

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch preferences: ${res.status}`);

      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Unknown error');

      setState({
        preferences: data.preferences ?? {},
        activeHomeEventId: data.activeHomeEventId ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load preferences',
      }));
    }
  }, [eventId]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPreferences();
  }, [fetchPreferences]);

  /**
   * Get a typed preference value by key.
   * Falls back to defaultValue if key is not present.
   *
   * @param key - The preference key e.g. 'event.hero.title'
   * @param defaultValue - Fallback value if key not found
   */
  const getPreference = useCallback(
    <T = any>(key: string, defaultValue?: T): T => {
      const val = state.preferences[key];
      if (val === undefined || val === null) {
        return defaultValue as T;
      }
      return val as T;
    },
    [state.preferences]
  );

  return {
    ...state,
    getPreference,
    refetch: fetchPreferences,
  };
}
