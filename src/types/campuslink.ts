export type ThemeId = 'midnight' | 'aurora' | 'cyber' | 'editorial' | 'festive' | 'minimal' | 'popbrutalist' | 'crimson' | 'scarlet';

export type LinkType = 
  | 'registration'
  | 'schedule'
  | 'rulebook'
  | 'venue'
  | 'results'
  | 'instagram'
  | 'whatsapp'
  | 'contact'
  | 'sponsorship'
  | 'volunteer'
  | 'feedback'
  | 'drive'
  | 'youtube'
  | 'website'
  | 'custom';

export interface EventLink {
  id: string;
  title: string;
  url: string;
  icon: string; // Icon identifier or name
  description?: string;
  thumbnailUrl?: string;
  type: LinkType;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  clickCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  url?: string;
  active: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor';
  status: 'active' | 'invited';
  avatarUrl?: string;
}

export interface OrganizerContact {
  name: string;
  email: string;
  phone: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  location: string;
  speaker?: string;
}

export interface RulebookSection {
  title: string;
  rules: string[];
}

export interface Event {
  id: string;
  userId?: string;
  committeeId: string;
  slug: string; // e.g., 'technova-2026'
  title: string; // e.g., "TECHNOVA '26"
  tagline: string; // e.g., "Build. Compete. Create."
  description: string;
  posterUrl: string;
  bannerUrl?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  venue: string;
  address: string;
  mapsUrl: string;
  primaryCtaText: string; // e.g., "Register Now"
  primaryCtaUrl: string;
  organizerContact: OrganizerContact;
  themeId: ThemeId;
  customAccentColor?: string;
  bgSvgPattern?: string;
  status: 'published' | 'draft' | 'archived';
  links: EventLink[];
  announcements: Announcement[];
  schedule?: ScheduleItem[];
  rulebook?: RulebookSection[];
  createdAt: string;
  updatedAt: string;
}

export interface Committee {
  id: string;
  userId?: string;
  handle: string; // e.g., "technova"
  name: string;   // e.g., "TechNova Society"
  tagline: string; // e.g., "Empowering Student Innovators"
  logoUrl: string;
  coverUrl?: string;
  description: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
  };
  members: TeamMember[];
  verified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  committeeId: string;
  avatarUrl?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalLinkClicks: number;
  totalRegClicks: number;
  engagementRate: number; // e.g., 78.4%
  topLinkTitle: string;
  dailyViews: { date: string; views: number; clicks: number }[];
  linkClicksById: Record<string, number>;
}

export type EventItem = any;
export type UserSession = any;
export type CommitteeHub = any;
export type StudentPass = any;

