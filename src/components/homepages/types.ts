export type HomeVariantId = 'cultural' | 'heritage' | 'welfare' | 'business';

export interface HomeVariantInfo {
  id: HomeVariantId;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  themeColor: string;
  accentBg: string;
  primaryAudience: string;
  keySections: string[];
  routePath: string;
}

export const HOME_VARIANTS: HomeVariantInfo[] = [
  {
    id: 'cultural',
    name: 'Grand Cultural Citadel & Community Portal',
    tagline: 'Preserving Heritage, Uniting Generations Across Britain',
    badge: 'Flagship Edition · Heritage & Community',
    description: 'A grand celebration of UK Telugu heritage with post-event Mahotsav 2026 commemoration, year-round festival calendar, Manabadi language academy, and community patron tiers.',
    themeColor: '#E65C00',
    accentBg: 'from-[#FFF0E0] to-[#FFE0B2]',
    primaryAudience: 'Families, community elders, cultural patrons, arts enthusiasts',
    keySections: [
      'Grand Temple Hero with Saffron & Gold Foil Aesthetic',
      'Historic London Ganesh Mahotsav 2026 Retrospective Badge',
      'Apex Community Milestones (25,000+ Families, 18 Boroughs)',
      'Mitra Community Showcase & 4 Core Pillars',
      'Year-Round Festival Calendar (Ugadi 2027, Bathukamma, Diwali, Sankranti)',
      'Community Offering Plaques & Sponsor Ribbon Band'
    ],
    routePath: '/home-variants/cultural',
  },
  {
    id: 'heritage',
    name: 'Mahotsav Retrospective & Living Heritage',
    tagline: 'Celebrating the 2026 Triumph & Year-Round Spiritual Life',
    badge: 'Commemorative Edition · Divine Recap',
    description: 'Centred on honoring the unprecedented success of the 2026 London Ganesh Mahotsav, celebrating the 21-ft deity legacy, 7 sacred festival days, and ongoing spiritual gatherings.',
    themeColor: '#E65C00',
    accentBg: 'from-[#FFF0E0] to-[#FFE0B2]',
    primaryAudience: 'Devotees, volunteers, festival attendees, cultural historians',
    keySections: [
      'Commemorative Poster & Murti Divine Hero with Diya Flame',
      '7 Sacred Festival Days Chronicle (Pratishtha to Visarjan)',
      'Media Teaser Gallery & Embedded Event Video Reel',
      'Mitra Manabadi Language School Enrolment',
      'Seva Offerings, Sponsor Plaques & Gratitude Wall'
    ],
    routePath: '/home-variants/heritage',
  },
  {
    id: 'welfare',
    name: 'Seva, Welfare & 24/7 Community Care',
    tagline: 'Standing Beside Every Telugu Family in the UK — In Joy, In Need',
    badge: 'Seva Edition · Humanitarian & Student Support',
    description: 'A compassionate, heart-centered welfare platform focusing on the 24/7 student helpline, NHS elder care navigation, bereavement/repatriation support, and food aid drives.',
    themeColor: '#E65C00',
    accentBg: 'from-[#FFF0E0] to-[#FFE0B2]',
    primaryAudience: 'International students, elderly parents, families in need, seva volunteers, donors',
    keySections: [
      'Compassionate Seva Hero with Diya Flicker & 24/7 UK Helpline Bar',
      'Live Welfare Impact Numbers (£120k+ Aid, 1,450+ Students, 22k+ Meals)',
      'Four Seva Pillars: Students, Elderly NHS, Consular Repatriation, Annadanam',
      'Real Community Beneficiary Stories & Gratitude',
      'Emergency Relief Fund Donation Tiers & Volunteer Registration'
    ],
    routePath: '/home-variants/welfare',
  },
  {
    id: 'business',
    name: 'Diaspora Network & Telugu Business Hub',
    tagline: 'Connecting British-Telugu Founders, Doctors & Next-Gen Leaders',
    badge: 'Enterprise Edition · Professional & Commerce',
    description: 'Empowering over 1,200 verified Telugu businesses, NHS medical consultants, IT architects, and young professionals in the UK in authentic MITRA styling.',
    themeColor: '#E65C00',
    accentBg: 'from-[#FFF0E0] to-[#FFE0B2]',
    primaryAudience: 'Entrepreneurs, IT architects, NHS doctors, graduates, corporate partners',
    keySections: [
      'Warm Temple Network Hero with Interactive Business Search',
      'Verified UK Telugu Business Showcase (IT, Health, Legal, Sweets, Property)',
      'Young Telugu Professionals (YTP) & Executive Mentorship Network',
      'Upcoming Tech Conclave & Nari Shakthi Women Forums',
      'Corporate Membership & Sponsor Ribbon Band'
    ],
    routePath: '/home-variants/business',
  },
];
