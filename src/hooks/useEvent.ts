'use client';

import { useState, useEffect } from 'react';
import { EventItem } from '@/lib/types';

/**
 * Fetches a single event by ID (or the first featured Ganesh event as fallback).
 * Replaces the repeated inline fetch pattern used in EventDetailsSection and event pages.
 *
 * Usage:
 *   const { event, isLoading } = useEvent('evt-ganesh-chaturthi');
 */
export function useEvent(eventId?: string | null, providedEvent?: EventItem | null) {
  const [event, setEvent] = useState<EventItem | null>(providedEvent || null);
  const [isLoading, setIsLoading] = useState(!providedEvent && Boolean(eventId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If event was passed in as a prop, use it directly
    if (providedEvent) {
      setEvent(providedEvent);
      setIsLoading(false);
      return;
    }

    // Only fetch if we have an eventId to look up
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchEvent = async () => {
      try {
        const url = `/api/events?id=${encodeURIComponent(eventId)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!isMounted) return;

        if (json.success) {
          if (json.data && !Array.isArray(json.data)) {
            setEvent(json.data);
          } else if (Array.isArray(json.data)) {
            const matched = json.data.find((e: EventItem) => e.id === eventId) || json.data[0];
            if (matched) setEvent(matched);
          }
        } else {
          setError(json.error || 'Failed to load event');
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchEvent();
    return () => { isMounted = false; };
  }, [eventId, providedEvent]);

  return { event, isLoading, error };
}

/**
 * Returns true if an event ID, title, or EventItem matches the Ganesh festival.
 * Extracted from EventDetailsSection / Ganesha3DHero / EventLandingTemplate to a single source.
 */
export function isGaneshEvent(
  eventOrId?: EventItem | string | null,
  eventTitle?: string | null
): boolean {
  if (!eventOrId && !eventTitle) return false;

  if (typeof eventOrId === 'string') {
    const id = eventOrId.toLowerCase();
    return id === 'evt-ganesh-chaturthi' || id.includes('ganesh');
  }

  if (typeof eventOrId === 'object' && eventOrId !== null) {
    const ev = eventOrId as EventItem;
    return (
      ev.id === 'evt-ganesh-chaturthi' ||
      ev.id === 'ganesh-event-2026' ||
      ev.id?.toLowerCase().includes('ganesh') ||
      ev.title?.toLowerCase().includes('ganesh') ||
      Boolean(eventTitle?.toLowerCase().includes('ganesh'))
    );
  }

  return Boolean(eventTitle?.toLowerCase().includes('ganesh'));
}
