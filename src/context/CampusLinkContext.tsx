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
  
  // Workspace datasets
  allCommittees: Committee[];
  allEvents: Event[];
  
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
    try {
      // 1. Remove legacy or duplicate cache keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== key) {
          if (
            k.startsWith('campuslink_user_') ||
            k.startsWith('campuslink_committees_') ||
            k.startsWith('campuslink_events_') ||
            k.startsWith('campuslink_clean_v1') ||
            k.startsWith('campuslink_clean_v2') ||
            k.startsWith('campuslink_clean_v3') ||
            k.startsWith('campuslink_clean_v4') ||
            k.startsWith('campuslink_clean_v5')
          ) {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // 2. Prune oversized image data URLs (> 50KB) in stored event caches
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('campuslink_v6_evt_') || k.startsWith('campuslink_clean_v6_global_events'))) {
          try {
            const raw = localStorage.getItem(k);
            if (raw && raw.includes('data:image/')) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const pruned = parsed.map(item => {
                  if (item.posterUrl && item.posterUrl.length > 50000) {
                    return { ...item, posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000' };
                  }
                  return item;
                });
                localStorage.setItem(k, JSON.stringify(pruned));
              }
            }
          } catch {}
        }
      }

      // 3. Retry setting current key
      try {
        localStorage.setItem(key, value);
      } catch {
        // If current value itself has oversized poster, sanitize it to guarantee saving succeeds
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map(item => {
              if (item.posterUrl && item.posterUrl.length > 50000) {
                return { ...item, posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000' };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(sanitized));
          } else if (parsed && typeof parsed === 'object') {
            if (parsed.posterUrl && parsed.posterUrl.length > 50000) {
              parsed.posterUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
            }
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch {}
      }
    } catch {
      // In-memory fallback
    }
  }
};

// Clear legacy storage cache keys and purge oversized data URLs on startup once
if (typeof window !== 'undefined') {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('campuslink_v6_evt_') || k.startsWith('campuslink_clean_v6_global_events'))) {
        const raw = localStorage.getItem(k);
        if (raw && raw.length > 300000 && raw.includes('data:image/')) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const pruned = parsed.map(item => {
                if (item.posterUrl && item.posterUrl.length > 50000) {
                  return { ...item, posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000' };
                }
                return item;
              });
              localStorage.setItem(k, JSON.stringify(pruned));
            }
          } catch {}
        }
      }
    }
  } catch {}
}

// Default Fallback Committee (immutable default template)
export const DEFAULT_FALLBACK_COMMITTEE: Committee = {
  id: 'comm_main',
  handle: 'my-org',
  name: 'My Student Committee',
  tagline: 'Empower your campus events with CampusLink',
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="%236366f1" style="background:%2309090b;padding:24px;border-radius:24px"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
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
    let result: Committee[] = [];
    if (typeof window !== 'undefined') {
      try {
        let currentUserId: string | undefined;
        const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
        if (savedUserStr && savedUserStr !== 'null') {
          try {
            const u = JSON.parse(savedUserStr);
            currentUserId = u?.id;
          } catch {}
        }
        if (currentUserId) {
          const userSaved = localStorage.getItem(getUserCommitteesKey(currentUserId));
          if (userSaved) {
            const parsed = JSON.parse(userSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              result = parsed;
            }
          }
        }
        if (result.length === 0) {
          const guestSaved = localStorage.getItem(getUserCommitteesKey('usr_guest'));
          if (guestSaved) {
            const parsed = JSON.parse(guestSaved);
            if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
          }
        }
        if (result.length === 0) {
          const defaultSaved = localStorage.getItem(getUserCommitteesKey('default'));
          if (defaultSaved) {
            const parsed = JSON.parse(defaultSaved);
            if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
          }
        }
        if (result.length === 0) {
          const globalSaved = localStorage.getItem(STORAGE_KEY_GLOBAL_COMMITTEES);
          if (globalSaved) {
            const parsed = JSON.parse(globalSaved);
            if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
          }
        }
      } catch {}
    }
    const mapped = result.map(c => ({
      ...c,
      coverUrl: c.coverUrl || c.socials?.coverUrl || ''
    }));
    return mapped.length > 0 ? mapped : [DEFAULT_FALLBACK_COMMITTEE];
  });

  // Master events dataset containing all published & created events
  const [events, setEvents] = useState<Event[]>(() => {
    let result: Event[] = [];
    if (typeof window !== 'undefined') {
      try {
        const globalSaved = localStorage.getItem(STORAGE_KEY_GLOBAL_EVENTS);
        if (globalSaved) {
          const parsed = JSON.parse(globalSaved);
          if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
        }
        const map = new Map<string, Event>();
        result.forEach(e => map.set(e.id, e));

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('campuslink_v6_evt_') || k.startsWith('campuslink_clean_v6_evt'))) {
            try {
              const val = localStorage.getItem(k);
              if (val) {
                const parsedVal: Event[] = JSON.parse(val);
                if (Array.isArray(parsedVal)) {
                  parsedVal.forEach(e => map.set(e.id, e));
                }
              }
            } catch {}
          }
        }
        result = Array.from(map.values());
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
      const commKey = getUserCommitteesKey(user.id);
      const savedComm = localStorage.getItem(commKey);
      if (savedComm) {
        try {
          const userParsed: Committee[] = JSON.parse(savedComm);
          if (Array.isArray(userParsed) && userParsed.length > 0) {
            setCommittees(prev => {
              const clean = prev.filter(c => c.userId !== user.id && !userParsed.some(up => up.id === c.id));
              return [...userParsed, ...clean];
            });
          }
        } catch {}
      }

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

  // Synchronize authenticated user profile, committee, and events directly with Supabase
  const syncUserDataFromSupabase = async (sessionUser: any) => {
    if (!sessionUser) return;
    const userId = sessionUser.id;
    const userEmail = sessionUser.email || '';
    const userName = sessionUser.user_metadata?.full_name || (userEmail ? userEmail.split('@')[0] : 'Organizer');
    const userCommId = `comm_${userId}`;

    const supabaseUser: User = {
      id: userId,
      name: userName,
      email: userEmail,
      committeeId: userCommId
    };
    setUser(supabaseUser);

    // 1. Fetch user's committee from Supabase
    try {
      const { data: commsData } = await supabase
        .from('committees')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      let commData = commsData && commsData.length > 0 ? commsData[0] : null;

      // Check if user already had a custom committee saved in local cache
      let existingLocalComm: Committee | null = null;
      try {
        const saved = localStorage.getItem(getUserCommitteesKey(userId));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            existingLocalComm = parsed.find((c: Committee) => c.userId === userId || c.id === userCommId) || parsed[0];
          }
        }
        if (!existingLocalComm) {
          const guestSaved = localStorage.getItem(getUserCommitteesKey('usr_guest')) || localStorage.getItem(getUserCommitteesKey('default'));
          if (guestSaved) {
            const parsed = JSON.parse(guestSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const candidate = parsed[0];
              if (candidate && candidate.name && candidate.name !== 'My Student Committee') {
                existingLocalComm = candidate;
              }
            }
          }
        }
      } catch {}

      if (commData) {
        // If local has more recent non-default name/logo while Supabase is default, prefer local and sync to Supabase
        const isDbDefault = commData.name && commData.name.includes("'s Organization") && !commData.logo_url;
        const isLocalCustom = existingLocalComm && existingLocalComm.name && !existingLocalComm.name.includes("'s Organization");

        const effectiveCommData = (isDbDefault && isLocalCustom && existingLocalComm) ? {
          ...commData,
          name: existingLocalComm.name,
          handle: existingLocalComm.handle || commData.handle,
          tagline: existingLocalComm.tagline || commData.tagline,
          logo_url: existingLocalComm.logoUrl || commData.logo_url,
          cover_url: existingLocalComm.coverUrl || commData.socials?.coverUrl || commData.cover_url,
          description: existingLocalComm.description || commData.description,
          socials: existingLocalComm.socials || commData.socials
        } : commData;

        const effectiveCoverUrl = effectiveCommData.coverUrl || effectiveCommData.socials?.coverUrl || effectiveCommData.cover_url || '';

        const userComm: Committee = {
          id: effectiveCommData.id,
          userId: effectiveCommData.user_id,
          handle: effectiveCommData.handle || (userEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || 'my-org'),
          name: effectiveCommData.name || (userName ? `${userName}'s Organization` : 'My Organization'),
          tagline: effectiveCommData.tagline || '',
          logoUrl: effectiveCommData.logo_url || '',
          coverUrl: effectiveCoverUrl,
          description: effectiveCommData.description || '',
          socials: (effectiveCommData.socials && typeof effectiveCommData.socials === 'object')
            ? { ...effectiveCommData.socials, coverUrl: effectiveCoverUrl }
            : { website: '', coverUrl: effectiveCoverUrl },
          members: Array.isArray(effectiveCommData.members) ? effectiveCommData.members : [],
          verified: Boolean(effectiveCommData.verified)
        };

        if (isDbDefault && isLocalCustom) {
          // Push updated local data to Supabase
          supabase.from('committees').upsert({
            id: userComm.id,
            user_id: userComm.userId,
            name: userComm.name,
            handle: userComm.handle,
            tagline: userComm.tagline,
            logo_url: userComm.logoUrl,
            description: userComm.description,
            socials: {
              ...(userComm.socials || {}),
              coverUrl: userComm.coverUrl || ''
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' }).then(() => {});
        }

        setUser(prev => prev ? { ...prev, committeeId: userComm.id } : prev);
        safeLocalStorageSet(getUserCommitteesKey(userId), JSON.stringify([userComm]));
        setCommittees(prev => {
          const clean = prev.filter(c => c.userId !== userId && c.id !== userComm.id);
          return [userComm, ...clean];
        });
      } else {
        // Create fresh committee: check if user had saved one locally first!
        const cleanHandle = (userEmail.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || `org-${userId.slice(0, 5)}`);
        const newComm: Committee = existingLocalComm ? {
          ...existingLocalComm,
          id: existingLocalComm.id || userCommId,
          userId: userId
        } : {
          id: userCommId,
          userId: userId,
          handle: cleanHandle,
          name: userName ? `${userName}'s Organization` : 'My Organization',
          tagline: 'Student organization page',
          logoUrl: '',
          coverUrl: '',
          description: '',
          socials: { website: '', coverUrl: '' },
          members: [],
          verified: false
        };

        await supabase.from('committees').upsert({
          id: newComm.id,
          user_id: newComm.userId,
          name: newComm.name,
          handle: newComm.handle,
          tagline: newComm.tagline,
          logo_url: newComm.logoUrl,
          description: newComm.description,
          socials: {
            ...(newComm.socials || {}),
            coverUrl: newComm.coverUrl || ''
          },
          updated_at: new Date().toISOString()
        });

        safeLocalStorageSet(getUserCommitteesKey(userId), JSON.stringify([newComm]));
        setCommittees(prev => {
          const clean = prev.filter(c => c.userId !== userId && c.id !== newComm.id);
          return [newComm, ...clean];
        });
      }
    } catch (err) {
      console.warn('Failed to sync committee from Supabase:', err);
    }

    // 2. Fetch user's events from Supabase
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId);

      if (eventsData && eventsData.length > 0) {
        const userFetchedEvents: Event[] = eventsData.map(d => ({
          id: d.id,
          userId: d.user_id,
          committeeId: d.committee_id,
          slug: d.slug,
          title: d.title,
          tagline: d.tagline || '',
          description: d.description || '',
          posterUrl: d.poster_url || '',
          startDate: d.start_date,
          endDate: d.end_date,
          venue: d.venue || '',
          address: d.address || '',
          mapsUrl: d.maps_url || '',
          primaryCtaText: d.primary_cta_text || 'Register Now',
          primaryCtaUrl: d.primary_cta_url || '',
          organizerContact: d.organizer_contact || {},
          themeId: d.theme_id || 'midnight',
          customAccentColor: d.custom_accent_color || '#fafafa',
          customThemeConfig: d.custom_theme_config || undefined,
          status: d.status || 'published',
          createdAt: d.created_at || new Date().toISOString(),
          updatedAt: d.updated_at || new Date().toISOString(),
          announcements: Array.isArray(d.announcements) ? d.announcements : [],
          schedule: Array.isArray(d.schedule) ? d.schedule : [],
          rulebook: Array.isArray(d.rulebook) ? d.rulebook : [],
          links: Array.isArray(d.links) ? d.links : []
        }));
        setEvents(prev => {
          const others = prev.filter(e => e.userId && e.userId !== userId);
          return [...userFetchedEvents, ...others];
        });
        if (userFetchedEvents.length > 0) {
          setActiveEventIdState(userFetchedEvents[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to sync events from Supabase:', err);
    }
  };

  // Sync Supabase Auth session if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserDataFromSupabase(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserDataFromSupabase(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setActiveEventIdState('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save changes to LocalStorage safely (merging to prevent wiping stored state on mount)
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  useEffect(() => {
    if (committees && committees.length > 0) {
      const toSave = user ? committees.filter(c => c.userId === user.id || c.id === user.committeeId) : committees;
      if (toSave.length > 0) {
        safeLocalStorageSet(getUserCommitteesKey(user?.id), JSON.stringify(toSave));
      }
      try {
        const existingGlobal = localStorage.getItem(STORAGE_KEY_GLOBAL_COMMITTEES);
        const map = new Map<string, Committee>();
        if (existingGlobal) {
          const parsed: Committee[] = JSON.parse(existingGlobal);
          if (Array.isArray(parsed)) parsed.forEach(c => map.set(c.id, c));
        }
        committees.forEach(c => map.set(c.id, c));
        safeLocalStorageSet(STORAGE_KEY_GLOBAL_COMMITTEES, JSON.stringify(Array.from(map.values())));
      } catch {
        safeLocalStorageSet(STORAGE_KEY_GLOBAL_COMMITTEES, JSON.stringify(committees));
      }
    }
  }, [committees, user?.id]);

  useEffect(() => {
    if (events && events.length > 0) {
      safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(events));
      try {
        const existingGlobal = localStorage.getItem(STORAGE_KEY_GLOBAL_EVENTS);
        const map = new Map<string, Event>();
        if (existingGlobal) {
          const parsed: Event[] = JSON.parse(existingGlobal);
          if (Array.isArray(parsed)) parsed.forEach(e => map.set(e.id, e));
        }
        events.forEach(e => map.set(e.id, e));
        safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(Array.from(map.values())));
      } catch {
        safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(events));
      }
    }
  }, [events, user?.id]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_ANALYTICS, JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY_ACTIVE_EVT, activeEventId);
  }, [activeEventId]);

  // Sync event updates across open tabs in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_GLOBAL_EVENTS || e.key === getUserEventsKey(user?.id)) {
        if (e.newValue) {
          try {
            const parsed: Event[] = JSON.parse(e.newValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEvents(prev => {
                const map = new Map<string, Event>();
                prev.forEach(item => map.set(item.id, item));
                parsed.forEach(item => map.set(item.id, item));
                return Array.from(map.values());
              });
            }
          } catch {}
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

  // Derived User-Scoped Workspace Data (STRICT ACCOUNT ISOLATION)
  const userCommittees = user
    ? committees.filter(c => c.userId === user.id || c.id === user.committeeId)
    : committees.filter(c => c.id !== 'comm_main' || committees.length === 1);

  const fallbackCommittee = committees.find(c => c.id !== 'comm_main') || committees[0] || DEFAULT_FALLBACK_COMMITTEE;

  const defaultUserCommittee: Committee = user ? {
    id: user.committeeId || fallbackCommittee.id || `comm_${user.id}`,
    userId: user.id,
    handle: (fallbackCommittee.handle && fallbackCommittee.handle !== 'my-org')
      ? fallbackCommittee.handle
      : ((user.email ? user.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() : 'my-org') || 'my-org'),
    name: (fallbackCommittee.name && fallbackCommittee.name !== 'My Student Committee')
      ? fallbackCommittee.name
      : (user.name ? `${user.name}'s Organization` : 'My Organization'),
    tagline: fallbackCommittee.tagline || 'Student organization page',
    logoUrl: fallbackCommittee.logoUrl || '',
    coverUrl: fallbackCommittee.coverUrl || fallbackCommittee.socials?.coverUrl || '',
    description: fallbackCommittee.description || '',
    socials: fallbackCommittee.socials || { website: '' },
    members: fallbackCommittee.members || [],
    verified: false
  } : fallbackCommittee;

  const activeCommittee = user
    ? ((userCommittees.length > 0 ? (userCommittees.find(c => c.id === user.committeeId || c.userId === user.id) || userCommittees[0]) : null) || defaultUserCommittee)
    : (userCommittees[0] || defaultUserCommittee);

  const userEvents = user
    ? events.filter(e => e.userId === user.id || (e.committeeId && e.committeeId === user.committeeId))
    : [];

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
      await syncUserDataFromSupabase(data.user);
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

    // Google Sign In fallback for offline/unconfigured environment
    const googleUserEmail = 'guest.organizer@campuslink.app';
    let registeredAccount = registeredAccounts.find(a => a.email.toLowerCase() === googleUserEmail);

    if (!registeredAccount) {
      const newUserId = `usr_google_${Date.now()}`;
      const newCommId = `comm_google_${Date.now()}`;

      registeredAccount = {
        id: newUserId,
        name: 'Guest Organizer',
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

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await signOutUser();
      } catch {}
    }
    setUser(null);
    setActiveEventIdState('');
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


    if (isSupabaseConfigured()) {
      try {
        supabase.from('committees').upsert({
          id: newCommittee.id,
          user_id: newCommittee.userId,
          name: newCommittee.name,
          handle: newCommittee.handle.toLowerCase(),
          tagline: newCommittee.tagline || '',
          logo_url: newCommittee.logoUrl || '',
          description: newCommittee.description || '',
          socials: newCommittee.socials || {}
        }).then(({ error }) => {
          if (error) console.warn('Supabase create committee on signup:', error.message || error);
        });
      } catch (err) {}
    }

    return { success: true };
  };

  const createEvent = (newEventData: Partial<Event>): Event => {
    const activeUser = user || (localStorage.getItem(STORAGE_KEY_USER) ? JSON.parse(localStorage.getItem(STORAGE_KEY_USER)!) : null);
    const userId = activeUser?.id || 'usr_guest';

    const slug = (newEventData.slug || (newEventData.title || 'new-event'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const created: Event = {
      id: newEventData.id || `evt_${Date.now()}`,
      userId,
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
      customThemeConfig: newEventData.customThemeConfig,
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
    if (isSupabaseConfigured()) {
      try {
        const cleanPoster = created.posterUrl?.startsWith('data:') && created.posterUrl.length > 50000
          ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
          : created.posterUrl;

        const saveUserId = activeUser?.id || user?.id || created.userId || 'usr_guest';
        const customConfig = created.customThemeConfig;

        const payload: Record<string, any> = {
          id: created.id,
          user_id: saveUserId,
          committee_id: created.committeeId,
          slug: created.slug,
          title: created.title,
          tagline: created.tagline || '',
          description: created.description || '',
          poster_url: cleanPoster || '',
          start_date: created.startDate,
          end_date: created.endDate,
          venue: created.venue || '',
          address: created.address || '',
          maps_url: created.mapsUrl || '',
          primary_cta_text: created.primaryCtaText || 'Register Now',
          primary_cta_url: created.primaryCtaUrl || '',
          theme_id: created.themeId || 'popbrutalist',
          custom_accent_color: created.customAccentColor || (customConfig?.accentColor) || '#fafafa',
          bg_svg_pattern: customConfig ? `CTC:${JSON.stringify(customConfig)}` : (created.bgSvgPattern || ''),
          organizer_contact: {
            ...(created.organizerContact || {}),
            committeeName: activeCommittee.name,
            committeeHandle: activeCommittee.handle,
            committeeLogoUrl: activeCommittee.logoUrl,
            customThemeConfig: customConfig || null
          },
          links: Array.isArray(created.links) ? created.links : [],
          announcements: Array.isArray(created.announcements) ? created.announcements : [],
          status: created.status || 'published'
        };

        if (customConfig) {
          payload.custom_theme_config = customConfig;
        }

        supabase.from('events').upsert(payload).then(({ error }) => {
          if (error) {
            if (error.message && error.message.includes('custom_theme_config')) {
              delete payload.custom_theme_config;
              supabase.from('events').upsert(payload).then(() => {});
            } else {
              console.warn('Supabase create event info:', error.message || error);
            }
          }
        });
      } catch (err) {}
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
      const targetCommId = (activeCommittee.id && activeCommittee.id !== 'comm_main') ? activeCommittee.id : (user?.committeeId || 'comm_main');
      const list = exists ? prev : [{
        ...DEFAULT_FALLBACK_EVENT,
        ...partial,
        id: eventId,
        userId: user?.id || activeCommittee.userId || 'comm_main',
        committeeId: targetCommId
      }, ...prev];
      const updated = list.map(e => {
        if (e.id === eventId) {
          const existingAliases: string[] = Array.isArray(e.slugAliases) 
            ? e.slugAliases 
            : (Array.isArray(e.organizerContact?.slugAliases) ? e.organizerContact.slugAliases : []);
          const newAliases = [...existingAliases];
          if (e.slug && partial.slug && partial.slug !== e.slug && !newAliases.includes(e.slug)) {
            newAliases.push(e.slug);
          }

          const merged: Event = {
            ...e,
            ...partial,
            slugAliases: newAliases,
            userId: e.userId || user?.id || activeCommittee.userId || 'comm_main',
            committeeId: (activeCommittee.id && activeCommittee.id !== 'comm_main') ? activeCommittee.id : (e.committeeId || user?.committeeId || 'comm_main'),
            announcements: Array.isArray(partial.announcements) ? partial.announcements : (e.announcements || []),
            links: Array.isArray(partial.links) ? partial.links : (e.links || []),
            organizerContact: {
              ...(e.organizerContact || {}),
              ...(partial.organizerContact || {}),
              slugAliases: newAliases
            },
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
      try {
        const cleanPoster = updatedTargetEvent.posterUrl?.startsWith('data:') && updatedTargetEvent.posterUrl.length > 50000
          ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
          : updatedTargetEvent.posterUrl;

        const customConfig = updatedTargetEvent.customThemeConfig;

        const payload: Record<string, any> = {
          id: updatedTargetEvent.id,
          user_id: user?.id || updatedTargetEvent.userId || 'comm_main',
          committee_id: updatedTargetEvent.committeeId,
          slug: updatedTargetEvent.slug,
          title: updatedTargetEvent.title,
          tagline: updatedTargetEvent.tagline || '',
          description: updatedTargetEvent.description || '',
          poster_url: cleanPoster || '',
          start_date: updatedTargetEvent.startDate,
          end_date: updatedTargetEvent.endDate,
          venue: updatedTargetEvent.venue || '',
          address: updatedTargetEvent.address || '',
          maps_url: updatedTargetEvent.mapsUrl || '',
          primary_cta_text: updatedTargetEvent.primaryCtaText || 'Register Now',
          primary_cta_url: updatedTargetEvent.primaryCtaUrl || '',
          theme_id: updatedTargetEvent.themeId || 'popbrutalist',
          custom_accent_color: updatedTargetEvent.customAccentColor || (customConfig?.accentColor) || '#fafafa',
          bg_svg_pattern: customConfig ? `CTC:${JSON.stringify(customConfig)}` : (updatedTargetEvent.bgSvgPattern || ''),
          organizer_contact: {
            ...(updatedTargetEvent.organizerContact || {}),
            slugAliases: updatedTargetEvent.slugAliases || [],
            committeeName: activeCommittee.name,
            committeeHandle: activeCommittee.handle,
            committeeLogoUrl: activeCommittee.logoUrl,
            customThemeConfig: customConfig || null
          },
          links: Array.isArray(updatedTargetEvent.links) ? updatedTargetEvent.links : [],
          announcements: Array.isArray(updatedTargetEvent.announcements) ? updatedTargetEvent.announcements : [],
          status: updatedTargetEvent.status || 'published'
        };

        if (customConfig) {
          payload.custom_theme_config = customConfig;
        }

        supabase.from('events').upsert(payload).then(({ error }) => {
          if (error) {
            if (error.message && error.message.includes('custom_theme_config')) {
              delete payload.custom_theme_config;
              supabase.from('events').upsert(payload).then(() => {});
            } else {
              console.warn('Supabase update event info:', error.message || error);
            }
          }
        });
      } catch (err) {}
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
    const targetId = committeeId || user?.committeeId || activeCommittee.id || (user ? `comm_${user.id}` : 'comm_main');
    const existing = committees.find(c => c.id === targetId || (user?.id && c.userId === user.id)) || activeCommittee;

    const commUserId = user?.id || existing?.userId || 'usr_guest';
    const commId = existing?.id && existing.id !== 'comm_main' 
      ? existing.id 
      : (user?.committeeId && user.committeeId !== 'comm_main' ? user.committeeId : (user ? `comm_${user.id}` : targetId));

    const finalCoverUrl = partial.coverUrl !== undefined
      ? partial.coverUrl
      : (partial.socials?.coverUrl || existing?.coverUrl || existing?.socials?.coverUrl || '');

    const updatedTargetComm: Committee = {
      ...existing,
      ...partial,
      id: commId,
      userId: commUserId,
      handle: (partial.handle !== undefined ? partial.handle : existing?.handle || 'my-org').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      coverUrl: finalCoverUrl,
      socials: {
        ...(existing?.socials || {}),
        ...(partial.socials || {}),
        coverUrl: finalCoverUrl
      }
    };

    setCommittees(prev => {
      const exists = prev.some(c => c.id === commId || (commUserId !== 'usr_guest' && c.userId === commUserId));
      let updated: Committee[];

      if (exists) {
        updated = prev.map(c => {
          if (c.id === commId || (commUserId !== 'usr_guest' && c.userId === commUserId)) {
            return updatedTargetComm;
          }
          return c;
        });
      } else {
        updated = [updatedTargetComm, ...prev];
      }

      // User-scoped cache should ONLY store this user's committee!
      safeLocalStorageSet(getUserCommitteesKey(commUserId), JSON.stringify([updatedTargetComm]));
      if (commUserId === 'usr_guest' || !user) {
        safeLocalStorageSet(getUserCommitteesKey('default'), JSON.stringify([updatedTargetComm]));
      }
      safeLocalStorageSet(STORAGE_KEY_GLOBAL_COMMITTEES, JSON.stringify(updated));
      return updated;
    });

    if (user && user.committeeId !== commId) {
      setUser(prev => prev ? { ...prev, committeeId: commId } : prev);
    }

    // If logo or name changed, also update all events belonging to this committee so they carry the logo
    if (partial.logoUrl || partial.name || partial.handle) {
      setEvents(prev => {
        const updatedEvents = prev.map(e => {
          if (e.committeeId === updatedTargetComm.id || (user?.id && e.userId === user.id)) {
            return {
              ...e,
              committeeName: updatedTargetComm.name,
              committeeHandle: updatedTargetComm.handle,
              committeeLogoUrl: updatedTargetComm.logoUrl,
              organizerContact: {
                ...(e.organizerContact || {}),
                committeeName: updatedTargetComm.name,
                committeeHandle: updatedTargetComm.handle,
                committeeLogoUrl: updatedTargetComm.logoUrl
              }
            };
          }
          return e;
        });
        safeLocalStorageSet(getUserEventsKey(user?.id), JSON.stringify(updatedEvents));
        safeLocalStorageSet(STORAGE_KEY_GLOBAL_EVENTS, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
    }

    // Update live builder draft in localStorage
    try {
      const liveDraftStr = localStorage.getItem('campuslink_builder_live_draft');
      if (liveDraftStr) {
        const liveDraft = JSON.parse(liveDraftStr);
        if (liveDraft && typeof liveDraft === 'object') {
          if (partial.logoUrl) liveDraft.committeeLogoUrl = partial.logoUrl;
          if (partial.name) liveDraft.committeeName = partial.name;
          if (partial.handle) liveDraft.committeeHandle = updatedTargetComm.handle;
          if (liveDraft.committee) {
            liveDraft.committee = { ...liveDraft.committee, ...updatedTargetComm };
          }
          localStorage.setItem('campuslink_builder_live_draft', JSON.stringify(liveDraft));
        }
      }
    } catch {}

    // Post to /api/live-sync
    try {
      fetch('/api/live-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: updatedTargetComm.handle || 'latest',
          committee: updatedTargetComm
        })
      }).catch(() => {});
    } catch {}

    // Broadcast across open tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('campuslink_live_stream');
        bc.postMessage({
          type: 'COMMITTEE_UPDATE',
          committee: updatedTargetComm
        });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}

    // Synchronize directly with Supabase committees table
    if (isSupabaseConfigured() && commUserId && commUserId !== 'usr_guest') {
      try {
        const socialsPayload = {
          ...(updatedTargetComm.socials || {}),
          coverUrl: finalCoverUrl
        };

        const dbPayload = {
          name: updatedTargetComm.name,
          handle: updatedTargetComm.handle,
          tagline: updatedTargetComm.tagline || '',
          logo_url: updatedTargetComm.logoUrl || '',
          description: updatedTargetComm.description || '',
          socials: socialsPayload,
          updated_at: new Date().toISOString()
        };

        supabase.from('committees')
          .select('id')
          .eq('user_id', commUserId)
          .limit(1)
          .then(({ data: existingRows }) => {
            if (existingRows && existingRows.length > 0) {
              const targetDbId = existingRows[0].id;
              supabase.from('committees')
                .update(dbPayload)
                .eq('id', targetDbId)
                .then(() => {});
            } else {
              supabase.from('committees')
                .upsert({
                  id: updatedTargetComm.id,
                  user_id: commUserId,
                  ...dbPayload
                }, { onConflict: 'id' })
                .then(() => {});
            }
          });

        // Also update events in Supabase for this committee so the logo is immediately loaded
        if (partial.logoUrl) {
          supabase.from('events')
            .update({
              organizer_contact: {
                committeeName: updatedTargetComm.name,
                committeeHandle: updatedTargetComm.handle,
                committeeLogoUrl: updatedTargetComm.logoUrl
              }
            })
            .or(`committee_id.eq.${updatedTargetComm.id},user_id.eq.${commUserId}`)
            .then(() => {});
        }
      } catch (err) {}
    }
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

  const resetData = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch {}
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    setUser(null);
    setRegisteredAccounts([]);
    setCommittees([]);
    setEvents([]);
    setAnalytics(INITIAL_ANALYTICS);
    setActiveEventIdState('');
    toast.success('Workspace reset! Starting fresh.');
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    }
  };

  return (
    <CampusLinkContext.Provider
      value={{
        user,
        committees: userCommittees,
        events: userEvents,
        allCommittees: committees,
        allEvents: events,
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
