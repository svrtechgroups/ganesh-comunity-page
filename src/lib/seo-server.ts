import { prisma } from './prisma';

/**
 * Server-only utility to fetch the currently active or upcoming featured event
 * for dynamic OpenGraph / Twitter metadata.
 */
export async function getFeaturedEventForMetadata() {
  try {
    // 1. Check activeHomeEventId from Config table
    const activePref = await prisma.config.findFirst({
      where: { preference: 'home.activeHomeEventId' },
    });

    if (activePref?.value) {
      const event = await prisma.event.findUnique({
        where: { id: activePref.value },
      });
      if (event && event.status !== 'Completed' && event.status !== 'Cancelled') {
        return event;
      }
    }

    // 2. Next featured upcoming event
    const featuredUpcoming = await prisma.event.findFirst({
      where: {
        featured: true,
        status: { in: ['Upcoming', 'upcoming', 'Active', 'active'] },
      },
      orderBy: { date: 'asc' },
    });
    if (featuredUpcoming) return featuredUpcoming;

    // 3. Fallback to any upcoming event
    const upcoming = await prisma.event.findFirst({
      where: {
        status: { in: ['Upcoming', 'upcoming', 'Active', 'active'] },
      },
      orderBy: { date: 'asc' },
    });
    if (upcoming) return upcoming;
  } catch (error) {
    console.error('[SEO SERVER LOOKUP ERROR]:', error);
  }

  return null;
}
