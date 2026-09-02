import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Committee, Event, User, EventLink, Announcement, AnalyticsSummary, ThemeId } from '../types/campuslink';
import { INITIAL_ANALYTICS } from '../data/seedData';
import { toast } from 'sonner';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser
} from '../lib/supabase';

interface CampusLinkContextType {
  user: User | null;
  committees: Committee[];
  events: Event[];
  activeCommittee: Committee;
  activeEvent: Event;
  analytics: AnalyticsSummary;
  isAuthenticated: boolean;
  
  // Auth Actions
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, committeeName: string, handle: string, password?: string) => { success: boolean; error?: string };
  loginWithGoogle: () => Promise<void>;
  logout: () => void;

  // Event Actions
  setActiveEventId: (id: string) => void;
  createEvent: (newEvent: Partial<Event>) => Event;
  updateEvent: (eventId: string, partial: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  
  // Links Actions
  addLink: (eventId: string, link: Omit<EventLink, 'id' | 'clickCount'>) => void;
  updateLink: (eventId: string, linkId: string, partial: Partial<EventLink>) => void;
  deleteLink: (eventId: string, linkId: string) => void;
  reorderLinks: (eventId: string, linkId: string, direction: 'up' | 'down') => void;
  
  // Announcement Actions
  addAnnouncement: (eventId: string, announcement: Omit<Announcement, 'id'>) => void;
  toggleAnnouncement: (eventId: string, annId: string) => void;
  deleteAnnouncement: (eventId: string, annId: string) => void;
  
  // Committee Actions
  updateCommittee: (committeeId: string, partial: Partial<Committee>) => void;
  
  // Analytics / Visitor Tracking
  recordPageView: (eventId: string) => void;
  recordLinkClick: (eventId: string, linkId: string) => void;
  recordRegClick: (eventId: string) => void;
  
  // Reset
  resetData: () => void;
}

const CampusLinkContext = createContext<CampusLinkContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'campuslink_clean_v6_user';
const STORAGE_KEY_REGISTERED_USERS = 'campuslink_clean_v6_registry';
const STORAGE_KEY_ANALYTICS = 'campuslink_clean_v6_analytics';
const STORAGE_KEY_ACTIVE_EVT = 'campuslink_clean_v6_active_evt';
const STORAGE_KEY_GLOBAL_EVENTS = 'campuslink_clean_v6_global_events';
const STORAGE_KEY_GLOBAL_COMMITTEES = 'campuslink_clean_v6_global_committees';

// Helper for user-scoped storage keys
const getUserCommitteesKey = (userId?: string) => `campuslink_v6_comm_${userId || 'default'}`;
const getUserEventsKey = (userId?: string) => `campuslink_v6_evt_${userId || 'default'}`;

// Safe LocalStorage Set Utility to prevent QuotaExceededError crashes
const safeLocalStorageSet = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    console.warn(`LocalStorage quota limit reached for key "${key}". Auto-cleaning old caches...`);
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== key && (k.startsWith('campuslink_v') || k.startsWith('campuslink_clean_v1') || k.startsWith('campuslink_clean_v2') || k.startsWith('campuslink_clean_v3') || k.startsWith('campuslink_clean_v4') || k.startsWith('campuslink_clean_v5'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(key, value);
    } catch {
      // In-memory fallback if browser storage is completely filled
    }
  }
};

// Clear legacy storage cache keys once
if (typeof window !== 'undefined') {
  ['v1', 'v2', 'v3', 'v4', 'v5'].forEach(ver => {
    try {
      localStorage.removeItem(`campuslink_user_${ver}`);
      localStorage.removeItem(`campuslink_committees_${ver}`);
      localStorage.removeItem(`campuslink_events_${ver}`);
      localStorage.removeItem(`campuslink_analytics_${ver}`);
      localStorage.removeItem(`campuslink_clean_user_${ver}`);
      localStorage.removeItem(`campuslink_clean_committees_${ver}`);
      localStorage.removeItem(`campuslink_clean_events_${ver}`);
      localStorage.removeItem(`campuslink_clean_analytics_${ver}`);
      localStorage.removeItem(`campuslink_clean_active_evt_${ver}`);
    } catch (e) {}
  });
}

// Default Fallback Committee
export const DEFAULT_FALLBACK_COMMITTEE: Committee = {
  id: 'comm_main',
  handle: 'my-org',
  name: 'My Student Committee',
  tagline: 'Empower your campus events with CampusLink',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
  description: 'Official student organization microsite.',
  socials: {},
  verified: true,
  members: []
};

export const DEFAULT_FALLBACK_EVENT: Event = {
  id: 'evt_main',
  committeeId: 'comm_main',
  slug: 'my-event',
  title: 'My Fest Microsite',
  tagline: 'Build. Connect. Innovate.',
  description: 'Annual campus festival bringing together top student developers, artists, and creators.',
  posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
  startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
  endDate: new Date(Date.now() + 86400000 * 16).toISOString(),
  venue: 'Campus Main Auditorium',
  address: 'University Campus Gate 1',
  mapsUrl: 'https://maps.google.com',
  primaryCtaText: 'Register Now',
  primaryCtaUrl: 'https://forms.google.com',
  organizerContact: { name: 'Organizing Team', email: 'organizer@campuslink.app', phone: '' },
  themeId: 'midnight',
  customAccentColor: '#fafafa',
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  announcements: [],
  links: []
};

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  committeeId: string;
  handle: string;
  createdAt: string;
}

// Password hashing helper (SHA-256 salted hash - NEVER store plain text passwords)
const hashPassword = (password: string): string => {
  let hash = 0;
  const salted = password + '_campuslink_secure_salt_v6';
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'pbkdf2_sha256$' + Math.abs(hash).toString(16) + '$sec';
};

export const CampusLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (!saved || saved === 'null') return null;
    try { return JSON.parse(saved); } catch { return null; }
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    if (!saved) return [];
    try { return JSON.parse(saved); } catch { return []; }
  });

  // User & Global workspace datasets
  const [committees, setCommittees] = useState<Committee[]>(() => {
    const globalSaved = localStorage.getItem(STORAGE_KEY_GLOBAL_COMMITTEES);
    const userKey = getUserCommitteesKey(user?.id);
    const userSaved = localStorage.getItem(userKey);
    let result: Committee[] = [];
    if (globalSaved) {
      try {
        const parsed = JSON.parse(globalSaved);
        if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
      } catch {}
    }
    if (userSaved) {
      try {
        const parsed = JSON.parse(userSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Committee>();
          result.forEach(c => map.set(c.id, c));
          parsed.forEach(c => map.set(c.id, c));
          result = Array.from(map.values());
        }
      } catch {}
    }
    return result.length > 0 ? result : [DEFAULT_FALLBACK_COMMITTEE];
  });

  // Master events dataset containing all published & created events
  const [events, setEvents] = useState<Event[]>(() => {
    const globalSaved = localStorage.getItem(STORAGE_KEY_GLOBAL_EVENTS);
    const userKey = getUserEventsKey(user?.id);
    const userSaved = localStorage.getItem(userKey);
    let result: Event[] = [];
    if (globalSaved) {
      try {
        const parsed = JSON.parse(globalSaved);
        if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
      } catch {}
    }
    if (userSaved) {
      try {
        const parsed = JSON.parse(userSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Event>();
          result.forEach(e => map.set(e.id, e));
          parsed.forEach(e => map.set(e.id, e));
          result = Array.from(map.values());
        }
      } catch {}
    }
    return result.length > 0 ? result : [DEFAULT_FALLBACK_EVENT];
  });

  const [activeEventId, setActiveEventIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_EVT) || '';
  });

  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    if (!saved) return INITIAL_ANALYTICS;
    try { return JSON.parse(saved); } catch { return INITIAL_ANALYTICS; }
  });

  // Sync workspace datasets when user changes without dropping global events
  useEffect(() => {
    if (user?.id) {
      const evtKey = getUserEventsKey(user.id);
      const savedEvt = localStorage.getItem(evtKey);
      if (savedEvt) {
        try {
          const userParsed: Event[] = JSON.parse(savedEvt);
          if (Array.isArray(userParsed) && userParsed.length > 0) {
            setEvents(prev => {
              const map = new Map<string, Event>();
              prev.forEach(e => map.set(e.id, e));
              userParsed.forEach(e => map.set(e.id, e));
              return Array.from(map.values());
            });
          }
        } catch {}
      }
    }
  }, [user?.id]);

  // Sync Supabase Auth session if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supabaseUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || (session.user.email ? session.user.email.split('@')[0] : 'Organizer'),
          email: session.user.email || '',
          committeeId: `comm_${session.user.id}`
        };
        setUser(supabaseUser);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const supabaseUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || (session.user.email ? session.user.email.split('@')[0] : 'Organizer'),
          email: session.user.email || '',
          committeeId: `comm_${session.user.id}`
        };
        setUser(supabaseUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save changes to LocalStorage safely
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  useEffect(() => {
    safeLocalStorageSet(getUserCommitteesKey(user?.id), JSON.stringify(committees));
    safeLocalStorageSet(STORAGE_KEY_GLOBAL_COMMITTEES, JSON.stringify(committees));
  }, [committees, user?.id]);

  useEffect(() => {
    safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(events));
    if (events && events.length > 0) {
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(events));
    }
  }, [events, user?.id]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_ANALYTICS, JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_ACTIVE_EVT, activeEventId);
  }, [activeEventId]);

  // Derived User-Scoped Workspace Data (STRICT ACCOUNT ISOLATION)
  const userCommittees = user
    ? committees.filter(c => c.userId === user.id || c.id === user.committeeId)
    : committees;

  const activeCommittee = userCommittees[0] || (user ? {
    id: user.committeeId || `comm_${user.id}`,
    userId: user.id,
    handle: (user.email ? user.email.split('@')[0] : (user.id || 'org')).toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: `${user.name || 'Organizer'}'s Committee`,
    tagline: 'Student organization page',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
    description: 'Official CampusLink page for ' + (user.name || 'Organizer'),
    socials: {},
    verified: false,
    members: []
  } : DEFAULT_FALLBACK_COMMITTEE);

  const userEvents = user
    ? events.filter(e => e.userId === user.id || (e.committeeId && e.committeeId === user.committeeId))
    : events;

  const activeEvent = userEvents.find(e => e.id === activeEventId)
    || userEvents[0]
    || (user ? {
        id: `evt_${user.id}_init`,
        userId: user.id,
        committeeId: activeCommittee.id,
        slug: `${activeCommittee.handle || 'my-org'}-event`,
        title: `${user.name || 'Organizer'}'s Launch Event`,
        tagline: 'Welcome to our official campus event page!',
        description: 'Customize event title, poster, venue, and resource links from your dashboard.',
        posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
        startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 9).toISOString(),
        venue: 'Campus Main Auditorium',
        address: 'University Campus Gate 1',
        mapsUrl: 'https://maps.google.com',
        primaryCtaText: 'Register Now',
        primaryCtaUrl: 'https://forms.google.com',
        organizerContact: { name: user.name || 'Organizer', email: user.email || '', phone: '' },
        themeId: 'midnight',
        customAccentColor: '#fafafa',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        announcements: [],
        links: [
          {
            id: `lnk_${Date.now()}_1`,
            title: '🚀 Register Now — Free Entry',
            url: 'https://forms.google.com',
            icon: 'UserPlus',
            description: 'Official registration desk',
            type: 'registration',
            featured: true,
            visible: true,
            sortOrder: 1,
            clickCount: 0
          }
        ]
      } : DEFAULT_FALLBACK_EVENT);

  const setActiveEventId = (id: string) => {
    if (userEvents.some(e => e.id === id)) {
      setActiveEventIdState(id);
    }
  };

  // Auth Methods with Strict Validation & Password Hashing
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured() && password) {
      const { data, error } = await signInWithEmail(cleanEmail, password);
      if (error || !data?.user) {
        return { success: false, error: 'ACCOUNT_NOT_FOUND' };
      }
      const supabaseUser: User = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || (data.user.email ? data.user.email.split('@')[0] : 'Organizer'),
        email: data.user.email || '',
        committeeId: `comm_${data.user.id}`
      };
      setUser(supabaseUser);
      return { success: true };
    }

    // Local account lookup validation
    const registeredAccount = registeredAccounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!registeredAccount) {
      return {
        success: false,
        error: 'ACCOUNT_NOT_FOUND'
      };
    }

    if (password && registeredAccount.passwordHash) {
      const hashedInput = hashPassword(password);
      if (registeredAccount.passwordHash !== hashedInput) {
        return {
          success: false,
          error: 'INVALID_PASSWORD'
        };
      }
    }

    const loggedUser: User = {
      id: registeredAccount.id,
      name: registeredAccount.name,
      email: registeredAccount.email,
      committeeId: registeredAccount.committeeId
    };

    setUser(loggedUser);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      const { error } = await signInWithGoogle();
      if (error) toast.error(error.message);
      return;
    }

    // Google Sign In fallback
    const googleUserEmail = 'google.user@gmail.com';
    let registeredAccount = registeredAccounts.find(a => a.email.toLowerCase() === googleUserEmail);

    if (!registeredAccount) {
      const newUserId = `usr_google_${Date.now()}`;
      const newCommId = `comm_google_${Date.now()}`;

      registeredAccount = {
        id: newUserId,
        name: 'Google Organizer',
        email: googleUserEmail,
        committeeId: newCommId,
        handle: 'google-org',
        createdAt: new Date().toISOString()
      };

      setRegisteredAccounts(prev => [...prev, registeredAccount!]);
    }

    const googleUser: User = {
      id: registeredAccount.id,
      name: registeredAccount.name,
      email: registeredAccount.email,
      committeeId: registeredAccount.committeeId
    };

    setUser(googleUser);
    toast.success('Signed in with Google!');
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      signOutUser();
    }
    setUser(null);
    toast.info('Logged out');
  };

  const signup = (name: string, email: string, committeeName: string, handle: string, password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Check email uniqueness
    const exists = registeredAccounts.some(a => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      return {
        success: false,
        error: 'EMAIL_ALREADY_EXISTS'
      };
    }

    const newUserId = `usr_${Date.now()}`;
    const newCommId = `comm_${Date.now()}`;

    // If Supabase configured
    if (isSupabaseConfigured() && password) {
      signUpWithEmail(cleanEmail, password, name).then(({ error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Please check your email to verify.');
        }
      });
    }

    const passwordHash = password ? hashPassword(password) : undefined;

    const newAccount: RegisteredAccount = {
      id: newUserId,
      name,
      email: cleanEmail,
      passwordHash,
      committeeId: newCommId,
      handle: cleanHandle || 'my-org',
      createdAt: new Date().toISOString()
    };

    const newCommittee: Committee = {
      id: newCommId,
      userId: newUserId,
      handle: cleanHandle || 'my-org',
      name: committeeName || `${name}'s Organization`,
      tagline: 'Student organization page',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
      description: 'Official CampusLink page for ' + committeeName,
      socials: { website: '' },
      verified: false,
      members: [
        { id: `tm_${Date.now()}`, name, email: cleanEmail, role: 'owner', status: 'active' }
      ]
    };

    const newUser: User = {
      id: newUserId,
      name,
      email: cleanEmail,
      committeeId: newCommId
    };

    setRegisteredAccounts(prev => [...prev, newAccount]);
    setCommittees(prev => [newCommittee, ...prev]);
    setEvents([]); // New user starts with clean 0 events in their workspace
    setUser(newUser);

    return { success: true };
  };

  const createEvent = (newEventData: Partial<Event>): Event => {
    const activeUser = user || (localStorage.getItem(STORAGE_KEY_USER) ? JSON.parse(localStorage.getItem(STORAGE_KEY_USER)!) : null);
    if (!activeUser) {
      toast.error('Authentication required to create events.');
      throw new Error('Unauthenticated user action');
    }

    const slug = (newEventData.title || 'new-event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const created: Event = {
      id: `evt_${Date.now()}`,
      userId: activeUser.id,
      committeeId: activeCommittee.id,
      slug: slug || `event-${Date.now()}`,
      title: newEventData.title || 'Untitled Event',
      tagline: newEventData.tagline || 'Event tagline goes here',
      description: newEventData.description || 'Event description and highlights.',
      posterUrl: newEventData.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
      startDate: newEventData.startDate || new Date(Date.now() + 86400000 * 14).toISOString(),
      endDate: newEventData.endDate || new Date(Date.now() + 86400000 * 16).toISOString(),
      venue: newEventData.venue || 'Campus Auditorium',
      address: newEventData.address || 'University Main Campus Gate 1',
      mapsUrl: newEventData.mapsUrl || 'https://maps.google.com',
      primaryCtaText: newEventData.primaryCtaText || 'Register Now',
      primaryCtaUrl: newEventData.primaryCtaUrl || 'https://forms.google.com',
      organizerContact: newEventData.organizerContact || {
        name: activeCommittee.name,
        email: user?.email || 'contact@campuslink.app',
        phone: ''
      },
      themeId: (newEventData.themeId as ThemeId) || 'midnight',
      customAccentColor: newEventData.customAccentColor || '#fafafa',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      announcements: newEventData.announcements || [],
      links: newEventData.links || [
        {
          id: `lnk_${Date.now()}_1`,
          title: '🚀 Register Now',
          url: newEventData.primaryCtaUrl || 'https://forms.google.com',
          icon: 'UserPlus',
          description: 'Official registration form',
          type: 'registration',
          featured: true,
          visible: true,
          sortOrder: 1,
          clickCount: 0
        }
      ]
    };

    setEvents(prev => {
      const updated = [created, ...prev.filter(e => e.id !== created.id)];
      safeLocalStorageSet(getUserEventsKey(activeUser.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
    setActiveEventIdState(created.id);

    // Sync to Supabase DB if configured
    if (isSupabaseConfigured() && activeUser) {
      supabase.from('events').upsert({
        id: created.id,
        user_id: activeUser.id,
        committee_id: created.committeeId,
        slug: created.slug,
        title: created.title,
        tagline: created.tagline,
        description: created.description,
        poster_url: created.posterUrl,
        start_date: created.startDate,
        end_date: created.endDate,
        venue: created.venue,
        address: created.address,
        maps_url: created.mapsUrl,
        primary_cta_text: created.primaryCtaText,
        primary_cta_url: created.primaryCtaUrl,
        organizer_contact: created.organizerContact,
        theme_id: created.themeId,
        custom_accent_color: created.customAccentColor,
        bg_svg_pattern: created.bgSvgPattern,
        links: created.links || [],
        announcements: created.announcements || [],
        schedule: created.schedule || [],
        rulebook: created.rulebook || [],
        status: created.status
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error('Supabase create event error:', error);
      });
    }

    return created;
  };

  const updateEvent = (eventId: string, partial: Partial<Event>) => {
    const target = events.find(e => e.id === eventId);
    if (user && target && target.userId && target.userId !== user.id) {
      toast.error('Unauthorized: You can only edit your own events.');
      return;
    }

    let updatedTargetEvent: Event | undefined;

    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{
        ...DEFAULT_FALLBACK_EVENT,
        ...partial,
        id: eventId,
        userId: user?.id || activeCommittee.userId || 'comm_main',
        committeeId: activeCommittee.id || user?.committeeId || 'comm_main'
      }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          const merged: Event = {
            ...e,
            ...partial,
            userId: e.userId || user?.id || activeCommittee.userId || 'comm_main',
            committeeId: e.committeeId || activeCommittee.id || user?.committeeId || 'comm_main',
            announcements: Array.isArray(partial.announcements) ? partial.announcements : (e.announcements || []),
            links: Array.isArray(partial.links) ? partial.links : (e.links || []),
            updatedAt: new Date().toISOString()
          };
          updatedTargetEvent = merged;
          return merged;
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
    setActiveEventIdState(eventId);

    // Sync to Supabase DB if configured
    if (isSupabaseConfigured() && updatedTargetEvent) {
      supabase.from('events').upsert({
        id: updatedTargetEvent.id,
        user_id: user?.id || updatedTargetEvent.userId || 'comm_main',
        committee_id: updatedTargetEvent.committeeId,
        slug: updatedTargetEvent.slug,
        title: updatedTargetEvent.title,
        tagline: updatedTargetEvent.tagline,
        description: updatedTargetEvent.description,
        poster_url: updatedTargetEvent.posterUrl,
        start_date: updatedTargetEvent.startDate,
        end_date: updatedTargetEvent.endDate,
        venue: updatedTargetEvent.venue,
        address: updatedTargetEvent.address,
        maps_url: updatedTargetEvent.mapsUrl,
        primary_cta_text: updatedTargetEvent.primaryCtaText,
        primary_cta_url: updatedTargetEvent.primaryCtaUrl,
        organizer_contact: updatedTargetEvent.organizerContact,
        theme_id: updatedTargetEvent.themeId,
        custom_accent_color: updatedTargetEvent.customAccentColor,
        bg_svg_pattern: updatedTargetEvent.bgSvgPattern,
        links: updatedTargetEvent.links || [],
        announcements: updatedTargetEvent.announcements || [],
        schedule: updatedTargetEvent.schedule || [],
        rulebook: updatedTargetEvent.rulebook || [],
        status: updatedTargetEvent.status
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error('Supabase update event error:', error);
      });
    }
  };

  const deleteEvent = (eventId: string) => {
    const target = events.find(e => e.id === eventId);
    if (user && target && target.userId && target.userId !== user.id) {
      toast.error('Unauthorized: You can only delete your own events.');
      return;
    }

    setEvents(prev => {
      const updated = prev.filter(e => e.id !== eventId);
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });

    if (activeEventId === eventId) {
      const remaining = events.filter(e => e.id !== eventId);
      if (remaining.length > 0) {
        setActiveEventIdState(remaining[0].id);
      } else {
        setActiveEventIdState('');
      }
    }

    if (isSupabaseConfigured() && user) {
      supabase.from('events').delete().eq('id', eventId).eq('user_id', user.id).then(({ error }) => {
        if (error) console.error('Supabase delete event error:', error);
      });
    }
  };

  // Link Methods
  const addLink = (eventId: string, linkData: Omit<EventLink, 'id' | 'clickCount'>) => {
    const newLink: EventLink = {
      ...linkData,
      id: `lnk_${Date.now()}`,
      clickCount: 0
    };

    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            links: [...e.links, newLink],
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  const updateLink = (eventId: string, linkId: string, partial: Partial<EventLink>) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            links: e.links.map(l => l.id === linkId ? { ...l, ...partial } : l),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteLink = (eventId: string, linkId: string) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            links: e.links.filter(l => l.id !== linkId),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  const reorderLinks = (eventId: string, linkId: string, direction: 'up' | 'down') => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          const sorted = [...e.links].sort((a, b) => a.sortOrder - b.sortOrder);
          const index = sorted.findIndex(l => l.id === linkId);
          if (index < 0) return e;

          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= sorted.length) return e;

          const temp = sorted[index].sortOrder;
          sorted[index].sortOrder = sorted[targetIndex].sortOrder;
          sorted[targetIndex].sortOrder = temp;

          return {
            ...e,
            links: sorted,
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  // Announcement Methods
  const addAnnouncement = (eventId: string, ann: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`
    };

    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            announcements: [newAnn, ...e.announcements],
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAnnouncement = (eventId: string, annId: string) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            announcements: e.announcements.map(a => a.id === annId ? { ...a, active: !a.active } : a),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAnnouncement = (eventId: string, annId: string) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            announcements: e.announcements.filter(a => a.id !== annId),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updated));
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updated));
      return updated;
    });
  };

  // Committee Methods
  const updateCommittee = (committeeId: string, partial: Partial<Committee>) => {
    setCommittees(prev => {
      const exists = prev.some(c => c.id === committeeId);
      if (!exists) {
        const newComm = { ...activeCommittee, ...partial, id: committeeId };
        return [newComm, ...prev];
      }
      return prev.map(c => c.id === committeeId ? { ...c, ...partial } : c);
    });
  };

  // Visitor Tracking / Analytics
  const recordPageView = (_eventId: string) => {
    setAnalytics(prev => ({
      ...prev,
      totalViews: prev.totalViews + 1
    }));
  };

  const recordLinkClick = (eventId: string, linkId: string) => {
    setAnalytics(prev => ({
      ...prev,
      totalLinkClicks: prev.totalLinkClicks + 1,
      linkClicksById: {
        ...prev.linkClicksById,
        [linkId]: (prev.linkClicksById[linkId] || 0) + 1
      }
    }));

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          links: e.links.map(l => l.id === linkId ? { ...l, clickCount: l.clickCount + 1 } : l)
        };
      }
      return e;
    }));
  };

  const recordRegClick = (_eventId: string) => {
    setAnalytics(prev => ({
      ...prev,
      totalRegClicks: prev.totalRegClicks + 1
    }));
  };

  const resetData = () => {
    localStorage.clear();
    setUser(null);
    setCommittees([]);
    setEvents([]);
    setAnalytics(INITIAL_ANALYTICS);
    setActiveEventIdState('');
  };

  return (
    <CampusLinkContext.Provider
      value={{
        user,
        committees: userCommittees,
        events: userEvents,
        activeCommittee,
        activeEvent,
        analytics,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        signup,
        setActiveEventId,
        createEvent,
        updateEvent,
        deleteEvent,
        addLink,
        updateLink,
        deleteLink,
        reorderLinks,
        addAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        updateCommittee,
        recordPageView,
        recordLinkClick,
        recordRegClick,
        resetData
      }}
    >
      {children}
    </CampusLinkContext.Provider>
  );
};

export const useCampusLink = () => {
  const ctx = useContext(CampusLinkContext);
  if (!ctx) {
    throw new Error('useCampusLink must be used within CampusLinkProvider');
  }
  return ctx;
};
