export type Role = 'Super Admin' | 'Media Secretary' | 'Events Coordinator' | 'Membership Officer' | 'Charity Officer' | 'Committee Viewer';

export interface EventItem {
  id: string;
  title: string;
  category: 'Cultural Events' | 'Business Networking' | 'Sports' | 'Women Empowerment' | 'World Conferences';
  date: string; // YYYY-MM-DD
  time: string;
  venue: string;
  address: string;
  description: string;
  bannerUrl: string;
  status: 'Upcoming' | 'Past';
  capacity: number;
  rsvpCount: number;
  ticketPrice: number; // 0 for free
  featured?: boolean;
}

export interface LeadershipMember {
  id: string;
  name: string;
  designation: string;
  category: 'Founders' | 'Patrons'  | 'Executive Committee' | 'Nari Shakthi' | string;
  bio?: string | null;
  imageUrl: string;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  displayOrder: number;
  active?: boolean;
}

export interface MediaAlbum {
  id: string;
  title: string;
  category: 'Photo Gallery' | 'Video Gallery' | 'Press Releases' | 'MITRA Patrika' | 'MITRA Souvenir';
  date: string;
  coverImage: string;
  itemCount: number;
  pdfUrl?: string;
  youtubeId?: string;
  description?: string;
}

export interface MediaItemData {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  category?: string;
  coverImage?: string | null;
  url: string;
  description?: string | null;
  eventId?: string | null;
  event?: EventItem | null;
  isFeatured: boolean;
  displayOrder: number;
  isHomeFeatured?: boolean;
  homeDisplayOrder?: number;
  isEventFeatured?: boolean;
  eventDisplayOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface EventWithMedia extends EventItem {
  mediaItems?: MediaItemData[];
  photosCount?: number;
  videosCount?: number;
  totalMediaCount?: number;
  featuredMediaUrl?: string;
}

export interface CharityCase {
  id: string; // MITRA-HELP-XXXX
  name: string;
  email: string;
  phone: string;
  category: 'Student Counselling' | 'Repatriation Support' | 'Women Helpline' | 'Community Service' | 'Emergency Assistance';
  details: string;
  status: 'New' | 'In Progress' | 'Resolved';
  assignedTo?: string;
  createdAt: string;
  isConfidential: boolean;
  notes: string[];
}

export interface Member {
  id: string; // MITRA-MEM-XXXX or cuid
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  tier: string;
  role?: string;
  status: string;
  startDate?: string | null;
  expiryDate?: string | null;
  address?: string | null;
  profession?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  cause: string;
  date: string;
  paymentMethod: 'Card' | 'PayPal' | 'Bank Transfer';
  receiptNo: string;
  status?: 'Completed' | 'Pending' | 'Failed';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  coverImage: string;
  tags: string[];
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventName: string; // page_view, event_rsvp, membership_signup, donation_completed, help_request_submitted, search_executed
  path: string;
  details?: Record<string, any>;
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  twitterUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  googleAnalyticsId: string;
  enableTracking: boolean;
}

export type BusinessCategory =
  | 'IT & Software Services'
  | 'Restaurants & Catering'
  | 'Real Estate & Mortgages'
  | 'Legal & Immigration'
  | 'Accounting & Tax Services'
  | 'Healthcare & Dental'
  | 'Retail & Groceries'
  | 'Event Management & Photography'
  | 'Automobile & Logistics'
  | 'Education & Tutoring'
  | 'Other Services';

export interface TeluguBusiness {
  id: string;
  businessName: string;
  ownerName: string;
  category: BusinessCategory | string;
  tagline?: string | null;
  description: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  email: string;
  phone: string;
  whatsapp?: string | null;
  website?: string | null;
  address?: string | null;
  city: string;
  postcode?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  isFeatured: boolean;
  specialOffer?: string | null;
  adminNotes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
