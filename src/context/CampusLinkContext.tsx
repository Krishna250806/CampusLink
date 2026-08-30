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
  login: (email: string, password?: string) => { success: boolean; error?: string };
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

// Helper for user-scoped storage keys
const getUserCommitteesKey = (userId?: string) => `campuslink_v6_comm_${userId || 'guest'}`;
const getUserEventsKey = (userId?: string) => `campuslink_v6_evt_${userId || 'guest'}`;

// Clear legacy storage cache keys once
if (typeof window !== 'undefined') {
  ['v1', 'v2', 'v3', 'v4', 'v5'].forEach(ver => {
    localStorage.removeItem(`campuslink_user_${ver}`);
    localStorage.removeItem(`campuslink_committees_${ver}`);
    localStorage.removeItem(`campuslink_events_${ver}`);
    localStorage.removeItem(`campuslink_analytics_${ver}`);
    localStorage.removeItem(`campuslink_clean_user_${ver}`);
    localStorage.removeItem(`campuslink_clean_committees_${ver}`);
    localStorage.removeItem(`campuslink_clean_events_${ver}`);
    localStorage.removeItem(`campuslink_clean_analytics_${ver}`);
    localStorage.removeItem(`campuslink_clean_active_evt_${ver}`);
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
  password?: string;
  committeeId: string;
  handle: string;
  createdAt: string;
}

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

  // User-isolated workspace datasets
  const [committees, setCommittees] = useState<Committee[]>(() => {
    const key = getUserCommitteesKey(user?.id);
    const saved = localStorage.getItem(key);
    if (!saved) return user ? [DEFAULT_FALLBACK_COMMITTEE] : [];
    try { return JSON.parse(saved); } catch { return []; }
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const key = getUserEventsKey(user?.id);
    const saved = localStorage.getItem(key);
    if (!saved) return user ? [DEFAULT_FALLBACK_EVENT] : [];
    try { return JSON.parse(saved); } catch { return []; }
  });

  const [activeEventId, setActiveEventIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_EVT) || '';
  });

  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    if (!saved) return INITIAL_ANALYTICS;
    try { return JSON.parse(saved); } catch { return INITIAL_ANALYTICS; }
  });

  // Re-load user workspace datasets whenever user changes
  useEffect(() => {
    if (user?.id) {
      const commKey = getUserCommitteesKey(user.id);
      const evtKey = getUserEventsKey(user.id);
      
      const savedComm = localStorage.getItem(commKey);
      const savedEvt = localStorage.getItem(evtKey);
      
      if (savedComm) {
        try { setCommittees(JSON.parse(savedComm)); } catch { setCommittees([DEFAULT_FALLBACK_COMMITTEE]); }
      } else {
        const defaultComm: Committee = {
          ...DEFAULT_FALLBACK_COMMITTEE,
          id: user.committeeId || `comm_${user.id}`,
          name: `${user.name}'s Committee`,
          handle: user.email.split('@')[0].toLowerCase()
        };
        setCommittees([defaultComm]);
      }

      if (savedEvt) {
        try { setEvents(JSON.parse(savedEvt)); } catch { setEvents([DEFAULT_FALLBACK_EVENT]); }
      } else {
        const defaultEvt: Event = {
          ...DEFAULT_FALLBACK_EVENT,
          id: `evt_${Date.now()}`,
          committeeId: user.committeeId || `comm_${user.id}`,
          title: `Welcome to ${user.name}'s Workspace`,
          slug: 'welcome-event'
        };
        setEvents([defaultEvt]);
      }
    } else {
      setCommittees([]);
      setEvents([]);
    }
  }, [user?.id]);

  // Sync Supabase Auth session if configured
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supabaseUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Organizer',
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
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Organizer',
          email: session.user.email || '',
          committeeId: `comm_${session.user.id}`
        };
        setUser(supabaseUser);
      } else if (!session && isSupabaseConfigured()) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getUserCommitteesKey(user.id), JSON.stringify(committees));
    }
  }, [committees, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getUserEventsKey(user.id), JSON.stringify(events));
    }
  }, [events, user?.id]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_EVT, activeEventId);
  }, [activeEventId]);

  // Derived Active State
  const activeCommittee = committees.find(c => c.id === user?.committeeId) || committees[0] || DEFAULT_FALLBACK_COMMITTEE;
  const activeEvent = events.find(e => e.id === activeEventId) || events[0] || DEFAULT_FALLBACK_EVENT;

  const setActiveEventId = (id: string) => {
    if (events.some(e => e.id === id)) {
      setActiveEventIdState(id);
    }
  };

  // Auth Methods with Strict Validation
  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured() && password) {
      signInWithEmail(cleanEmail, password).then(({ error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Successfully logged in!');
        }
      });
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

    if (password && registeredAccount.password && registeredAccount.password !== password) {
      return {
        success: false,
        error: 'INVALID_PASSWORD'
      };
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

    const newAccount: RegisteredAccount = {
      id: newUserId,
      name,
      email: cleanEmail,
      password,
      committeeId: newCommId,
      handle: cleanHandle || 'my-org',
      createdAt: new Date().toISOString()
    };

    const newCommittee: Committee = {
      id: newCommId,
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
    setCommittees([newCommittee]);
    setEvents([DEFAULT_FALLBACK_EVENT]);
    setUser(newUser);

    return { success: true };
  };

  // Event Methods
  const createEvent = (newEventData: Partial<Event>): Event => {
    const slug = (newEventData.title || 'new-event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const created: Event = {
      id: `evt_${Date.now()}`,
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

    setEvents(prev => [created, ...prev]);
    setActiveEventIdState(created.id);
    return created;
  };

  const updateEvent = (eventId: string, partial: Partial<Event>) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, ...partial, id: eventId }, ...prev];
      return list.map(e => e.id === eventId ? { ...e, ...partial, updatedAt: new Date().toISOString() } : e);
    });
    setActiveEventIdState(eventId);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    if (activeEventId === eventId) {
      const remaining = events.filter(e => e.id !== eventId);
      if (remaining.length > 0) {
        setActiveEventIdState(remaining[0].id);
      } else {
        setActiveEventIdState('');
      }
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
      return list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            links: [...e.links, newLink],
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
    });
  };

  const updateLink = (eventId: string, linkId: string, partial: Partial<EventLink>) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      return list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            links: e.links.map(l => l.id === linkId ? { ...l, ...partial } : l),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
    });
  };

  const deleteLink = (eventId: string, linkId: string) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      return list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            links: e.links.filter(l => l.id !== linkId),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
    });
  };

  const reorderLinks = (eventId: string, linkId: string, direction: 'up' | 'down') => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      return list.map(e => {
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
      return list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            announcements: [newAnn, ...e.announcements],
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
    });
  };

  const toggleAnnouncement = (eventId: string, annId: string) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      return list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            announcements: e.announcements.map(a => a.id === annId ? { ...a, active: !a.active } : a),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
    });
  };

  const deleteAnnouncement = (eventId: string, annId: string) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventId);
      const list = exists ? prev : [{ ...DEFAULT_FALLBACK_EVENT, id: eventId }, ...prev];
      return list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            announcements: e.announcements.filter(a => a.id !== annId),
            updatedAt: new Date().toISOString()
          };
        }
        return e;
      });
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
        committees,
        events,
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
