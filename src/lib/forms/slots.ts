import { prisma } from '@/lib/prisma';
import { AppointmentScheduleConfig, AppointmentSlotDTO } from '@/types/dynamic-form';

/**
 * Helper to parse a time string "HH:MM" into hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

/**
 * Converts a date and local time string into an exact UTC Date object based on a target IANA timezone.
 * Solves: Timezone Discrepancies
 */
export function createUTCDateFromLocal(
  dateStr: string, // "YYYY-MM-DD"
  timeStr: string, // "HH:MM"
  targetTimezone: string = 'UTC'
): Date {
  // Construct ISO-like string and resolve via standard Intl
  const [year, month, day] = dateStr.split('-').map(Number);
  const { hours, minutes } = parseTime(timeStr);

  // Initial naive UTC date
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  try {
    // Get difference between naive UTC and the target timezone for this instant
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(naiveUtc);
    const getVal = (type: string) => parts.find((p) => p.type === type)?.value || '00';

    const tzYear = parseInt(getVal('year'), 10);
    const tzMonth = parseInt(getVal('month'), 10);
    const tzDay = parseInt(getVal('day'), 10);
    let tzHour = parseInt(getVal('hour'), 10);
    if (tzHour === 24) tzHour = 0; // Handle 24-hour midnight quirk in some locales
    const tzMin = parseInt(getVal('minute'), 10);

    const tzAsUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, 0);
    const offsetMs = tzAsUtc - naiveUtc.getTime();

    // The real UTC moment is naiveUtc minus the offset
    return new Date(naiveUtc.getTime() - offsetMs);
  } catch (err) {
    console.warn(`[TIMEZONE FALLBACK] Invalid timezone "${targetTimezone}", falling back to UTC:`, err);
    return naiveUtc;
  }
}

/**
 * Formats a UTC Date to a readable string in the viewer's local timezone.
 */
export function formatSlotLocalTime(utcDate: Date, viewerTimezone?: string): string {
  const tz = viewerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(utcDate);
}

/**
 * Formats start and end times into a readable time range (e.g. "9:00 AM – 9:30 AM")
 */
export function formatSlotTimeRange(
  startTime: Date,
  endTime: Date,
  viewerTimezone?: string
): string {
  const tz = viewerTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${timeFormatter.format(startTime)} – ${timeFormatter.format(endTime)}`;
}

/**
 * Lazy On-Demand Window Slot Generator
 * Solves: Infinite Slot Generation Bloat & Concurrency Safety
 *
 * Generates slots strictly within a defined date window (e.g. next 14 or 30 days)
 * instead of generating millions of rows into the future.
 * Uses atomic skipDuplicates / ON CONFLICT to remain strictly idempotent.
 */
export async function getOrGenerateSlotsForRange({
  fieldId,
  config,
  startDateStr, // "YYYY-MM-DD"
  endDateStr,   // "YYYY-MM-DD"
  viewerTimezone,
}: {
  fieldId: string;
  config: AppointmentScheduleConfig;
  startDateStr: string;
  endDateStr: string;
  viewerTimezone?: string;
}): Promise<AppointmentSlotDTO[]> {
  const {
    startTime: dayStartStr = '09:00',
    endTime: dayEndStr = '17:00',
    intervalMinutes = 30,
    maxCapacity = 1,
    daysOfWeek = [1, 2, 3, 4, 5], // Monday - Friday
    timezone = 'UTC',
  } = config;

  const startMoment = new Date(`${startDateStr}T00:00:00Z`);
  const endMoment = new Date(`${endDateStr}T23:59:59Z`);

  // Max cap on window generation to protect database against malicious wide ranges
  const maxDaysAllowed = 60;
  const daysDiff = Math.ceil((endMoment.getTime() - startMoment.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > maxDaysAllowed) {
    throw new Error(`Requested slot range exceeds maximum allowed window of ${maxDaysAllowed} days.`);
  }

  const slotsToCreate: {
    fieldId: string;
    startTime: Date;
    endTime: Date;
    maxCapacity: number;
  }[] = [];

  const currentDay = new Date(startMoment);

  while (currentDay <= endMoment) {
    const dayOfWeek = currentDay.getUTCDay(); // 0 is Sunday, 1 is Monday, etc.
    const normalizedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Optional standard mapping if needed

    // Check if the day is an allowed day of week (support both 0-6 and 1-7 configs)
    const isAllowedDay = daysOfWeek.includes(dayOfWeek) || daysOfWeek.includes(normalizedDayOfWeek);

    if (isAllowedDay) {
      const dateIso = currentDay.toISOString().split('T')[0];
      const { hours: startH, minutes: startM } = parseTime(dayStartStr);
      const { hours: endH, minutes: endM } = parseTime(dayEndStr);

      const totalStartMin = startH * 60 + startM;
      const totalEndMin = endH * 60 + endM;

      for (let min = totalStartMin; min + intervalMinutes <= totalEndMin; min += intervalMinutes) {
        const slotStartH = String(Math.floor(min / 60)).padStart(2, '0');
        const slotStartM = String(min % 60).padStart(2, '0');
        const slotEndMinTotal = min + intervalMinutes;
        const slotEndH = String(Math.floor(slotEndMinTotal / 60)).padStart(2, '0');
        const slotEndM = String(slotEndMinTotal % 60).padStart(2, '0');

        const slotStartTime = createUTCDateFromLocal(dateIso, `${slotStartH}:${slotStartM}`, timezone);
        const slotEndTime = createUTCDateFromLocal(dateIso, `${slotEndH}:${slotEndM}`, timezone);

        slotsToCreate.push({
          fieldId,
          startTime: slotStartTime,
          endTime: slotEndTime,
          maxCapacity: Math.max(1, maxCapacity),
        });
      }
    }

    currentDay.setUTCDate(currentDay.getUTCDate() + 1);
  }

  // Idempotently persist new slots without overwriting existing bookings
  if (slotsToCreate.length > 0) {
    await prisma.appointmentSlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true, // Uses Postgres @@unique([fieldId, startTime])
    });
  }

  // Fetch all persisted slots within the requested UTC window
  const queryWindowStart = createUTCDateFromLocal(startDateStr, '00:00', timezone);
  const queryWindowEnd = createUTCDateFromLocal(endDateStr, '23:59', timezone);

  const persistedSlots = await prisma.appointmentSlot.findMany({
    where: {
      fieldId,
      startTime: {
        gte: queryWindowStart,
        lte: queryWindowEnd,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  const now = new Date();
  const minNoticeHours = config.minNoticeHours ?? 2;
  const earliestBookableTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

  let maxAdvanceDate: Date | null = null;
  if (typeof config.maxDaysInAdvance === 'number') {
    maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + config.maxDaysInAdvance);
    maxAdvanceDate.setHours(23, 59, 59, 999);
  }

  let cutoffDate: Date | null = null;
  if (config.bookingCutoffDate) {
    cutoffDate = new Date(`${config.bookingCutoffDate}T23:59:59Z`);
  }

  return persistedSlots
    // Exclude slots that have completely passed in real time
    .filter((slot) => slot.endTime > now)
    .map((slot) => {
      const remaining = Math.max(0, slot.maxCapacity - slot.bookedCount);
      const isPastOrTooSoon = slot.startTime < earliestBookableTime;
      const isBeyondMaxAdvance = maxAdvanceDate ? slot.startTime > maxAdvanceDate : false;
      const isAfterCutoff = cutoffDate ? slot.startTime > cutoffDate : false;

      const isEligible = !isPastOrTooSoon && !isBeyondMaxAdvance && !isAfterCutoff;
      const isAvailable = isEligible && slot.bookedCount < slot.maxCapacity;

      return {
        id: slot.id,
        fieldId: slot.fieldId,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        maxCapacity: slot.maxCapacity,
        bookedCount: slot.bookedCount,
        remainingCapacity: isEligible ? remaining : 0,
        isAvailable,
        formattedLocalTime: formatSlotLocalTime(slot.startTime, viewerTimezone),
        formattedTimeRange: formatSlotTimeRange(slot.startTime, slot.endTime, viewerTimezone),
      };
    });
}
