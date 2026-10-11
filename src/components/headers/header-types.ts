export type HeaderVariantId = 
  | 'default-fixed'
  | 'two-tier'
  | 'grouped'
  | 'floating'
  | 'centered'
  | 'mega-menu';

export interface HeaderVariantMeta {
  id: HeaderVariantId;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  benefits: string[];
  bestFor: string;
}

export const HEADER_VARIANTS: HeaderVariantMeta[] = [
  {
    id: 'two-tier',
    title: 'Executive Two-Tier (Double Decker)',
    tagline: 'Dual-deck layout separating utility actions from primary navigation',
    badge: 'Recommended for Rich Content',
    description: 'Separates announcement ticker, WhatsApp button, and member auth onto the top saffron utility bar, leaving the bottom bar exclusively for brand prominence and spacious page links.',
    benefits: [
      'Completely eliminates horizontal competition between navigation and CTAs',
      'Accommodates all 8 menu items comfortably even on 13" laptop screens (1024px-1280px)',
      'High-profile announcement bar with venue and direct WhatsApp link',
      'Grand, prestigious presence fit for a major community organisation'
    ],
    bestFor: 'Organizations with numerous active links and important festival announcements'
  },
  {
    id: 'grouped',
    title: 'Smart Grouped Navigation (Corporate )',
    tagline: 'Consolidates 8 links into 5 intuitive dropdown categories',
    badge: 'Cleanest & Most Organized',
    description: 'Reorganises sub-pages logically: "About Us" contains Mission, Guinness Record & Leadership; "Community" contains Sponsors, Telugu Business Directory & Media. Fits in one single ultra-clean row.',
    benefits: [
      'Fits neatly on any desktop resolution with ample breathing room',
      'Zero risk of word-wrapping on the Mitra UK logo or brand text',
      'Categorical dropdowns provide a modern, professional user journey',
      'Direct WhatsApp and Member profile buttons remain prominently highlighted'
    ],
    bestFor: 'Clean, modern minimalist presentation without sacrificing any content'
  },
  {
    id: 'floating',
    title: 'Floating Island Glassmorphism',
    tagline: 'Modern 2026 floating pill header with frosted glass blur',
    badge: 'Modern Visual WOW Factor',
    description: 'Elevates the header into a sleek floating island with backdrop blur and golden borders. Features a compact brand logo, priority links, a "More ▾" overflow dropdown, and a glowing WhatsApp CTA.',
    benefits: [
      'Striking contemporary aesthetic that looks like an award-winning modern app',
      'Rounded glass pill floats above content with luxury shadow effects',
      'Automatic "More ▾" dropdown captures secondary links smoothly',
      'Compact brand lockup ensures title never squishes'
    ],
    bestFor: 'Clients wanting an ultra-modern, trendy, and visually captivating impression'
  },
  {
    id: 'centered',
    title: 'Centered Cultural Majesty (Symmetrical)',
    tagline: 'Balanced symmetrical layout framing a central Mitra UK emblem',
    badge: 'Cultural Heritage Style',
    description: 'Places the ornate Mitra UK emblem and Cinzel typography proudly in the center, flanked by balanced navigation links on left and right, with traditional warm accents.',
    benefits: [
      'Traditional royal symmetry honoring cultural festivals and heritage',
      'Mitra UK emblem is the focal centerpiece of the entire screen',
      'Balanced distribution prevents right-side crowding',
      'Preserves all major links while maintaining royal aesthetics'
    ],
    bestFor: 'Grand festivals, spiritual events, and traditional community celebrations'
  },
  {
    id: 'mega-menu',
    title: 'Adaptive Minimal with Slide Mega-Menu',
    tagline: 'Essential direct links with an interactive "Explore" mega-drawer',
    badge: 'Future-Proof & Ultra-Clean',
    description: 'Shows only high-frequency essentials (Home, Events, About Us, WhatsApp) on the main bar, accompanied by an elegant "Explore" button that opens an organized full-screen category drawer.',
    benefits: [
      '100% immune to screen size squeezing — always looks crisp and spacious',
      'Future-proof: add 20+ more pages without affecting the top header layout',
      'Mega-menu categorizes Festival schedule, Member services, and Business directory',
      'Mobile-first responsive architecture'
    ],
    bestFor: 'Rapidly growing portals with expanding sub-pages and festival activities'
  },
  {
    id: 'default-fixed',
    title: 'Refined Single-Row (Fixed Original)',
    tagline: 'The original single-row layout with responsive font scaling and no text wrapping',
    badge: 'Fixed Original',
    description: 'The original layout repaired with proper flex-shrink protection, responsive link spacing, and overflow safeguards so the brand text never wraps vertically.',
    benefits: [
      'Preserves exact original structure while fixing the flex wrapping bug',
      'Text subtitle is locked into non-squishing layout with min-w-max',
      'Adaptive spacing scales smoothly on medium-sized displays',
      'Zero learning curve for existing visitors'
    ],
    bestFor: 'Clients who want the exact original look, just properly engineered and bug-free'
  }
];
