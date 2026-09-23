import { EventScheduleDay } from './types';

export const DEFAULT_GANESH_SCHEDULE: EventScheduleDay[] = [
  {
    id: 'day-1',
    date: '14th Sep',
    dateLabel: '14 Sep (Mon)',
    day: 'Monday',
    title: 'Maha Ganapati Prathista',
    theme: 'Ganesh Chaturthi The Grand Beginning',
    blessing: 'Prana Pratishtha, Sacred Maha Sankalpam & Grand Illumination',
    badge: 'GRAND CHATURTHI',
  },
  {
    id: 'day-2',
    date: '15th Sep',
    dateLabel: '15 Sep (Tue)',
    day: 'Tuesday',
    title: 'Vidya Ganapati',
    theme: 'For Wisdom, Education, Knowledge & Learning',
    blessing: 'Academic Success, Mental Clarity, Intellect & Saraswati Kataksham',
  },
  {
    id: 'day-3',
    date: '16th Sep',
    dateLabel: '16 Sep (Wed)',
    day: 'Wednesday',
    title: 'Arogya Ganapati',
    theme: 'For Radiant Health, Healing & Wellbeing',
    blessing: 'Ayushya Abhivrudhi, Vitality, Radiant Health & Disease Protection',
  },
  {
    id: 'day-4',
    date: '17th Sep',
    dateLabel: '17 Sep (Thu)',
    day: 'Thursday',
    title: 'Lakshmi Ganapati',
    theme: 'For Prosperity, Abundance & Success',
    blessing: 'Financial Growth, Business Auspiciousness & Abundance',
  },
  {
    id: 'day-5',
    date: '18th Sep',
    dateLabel: '18 Sep (Fri)',
    day: 'Friday',
    title: 'Korikala Ganapati',
    theme: 'For Wishes, Aspirations & Fulfillment',
    blessing: 'Sankalpa Siddhi, Career Milestones & Desire Fulfillment',
  },
  {
    id: 'day-6',
    date: '19th Sep',
    dateLabel: '19 Sep (Sat)',
    day: 'Saturday',
    title: 'Bhakti Ganapati',
    theme: 'For Devotion, Peace & Spiritual Strength',
    blessing: 'Inner Serenity, Family Harmony & Spiritual Elevation',
  },
  {
    id: 'day-7',
    date: '20th Sep',
    dateLabel: '20 Sep (Sun)',
    day: 'Sunday',
    title: 'Utsava Ganapati & Nimajjanam',
    theme: 'Celebration, Gratitude, Maha Visarjan & Farewell to Bappa',
    blessing: 'Maha Visarjan Blessings, Victory & Eternal Divine Grace',
    badge: 'MAHA VISARJAN',
  },
];

/**
 * Normalizes and retrieves schedule days for a single event.
 */
export function getEventSchedule(event?: {
  id?: string;
  title?: string;
  eventSchedule?: any;
  availableDates?: string[];
  date?: string;
} | null): EventScheduleDay[] {
  if (!event) return [];

  // 1. Direct eventSchedule JSON/Array
  let rawSchedule = event.eventSchedule;
  if (typeof rawSchedule === 'string' && rawSchedule.trim()) {
    try {
      rawSchedule = JSON.parse(rawSchedule);
    } catch {
      rawSchedule = [];
    }
  }

  if (Array.isArray(rawSchedule) && rawSchedule.length > 0) {
    return rawSchedule.map((s, idx) => ({
      id: s.id || `day-${idx + 1}`,
      date: s.date || `Day ${idx + 1}`,
      dateLabel: s.dateLabel || s.date || `Day ${idx + 1}`,
      day: s.day || '',
      title: s.title || `Day ${idx + 1}`,
      theme: s.theme || '',
      blessing: s.blessing || s.theme || '',
      badge: s.badge || undefined,
    }));
  }

  // 2. Fallback to availableDates if available
  if (Array.isArray(event.availableDates) && event.availableDates.length > 0) {
    return event.availableDates.map((d, idx) => ({
      id: `day-${idx + 1}`,
      date: d,
      dateLabel: d,
      day: '',
      title: `${event.title || 'Event'} - Day ${idx + 1}`,
      theme: d,
    }));
  }

  // 3. Fallback for Ganesh Chaturthi event if schedule hasn't been explicitly configured yet
  const titleLower = (event.title || '').toLowerCase();
  const idLower = (event.id || '').toLowerCase();
  if (titleLower.includes('ganesh') || idLower.includes('ganesh')) {
    return DEFAULT_GANESH_SCHEDULE;
  }

  // 4. Default to single date of the event if present
  if (event.date) {
    return [
      {
        id: 'day-1',
        date: event.date,
        dateLabel: event.date,
        day: '',
        title: event.title || 'Main Event Day',
        theme: 'Main Event Schedule',
      },
    ];
  }

  return [];
}
