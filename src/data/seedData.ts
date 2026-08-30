import type { Committee, Event, User, AnalyticsSummary } from '../types/campuslink';

export const DEFAULT_USER: User | null = null;

export const SEED_COMMITTEES: Committee[] = [];

export const SEED_EVENTS: Event[] = [];

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalViews: 0,
  totalLinkClicks: 0,
  totalRegClicks: 0,
  engagementRate: 0,
  topLinkTitle: 'None',
  dailyViews: [],
  linkClicksById: {}
};
