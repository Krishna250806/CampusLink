import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampusLink, DEFAULT_FALLBACK_COMMITTEE } from '../context/CampusLinkContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { QrModal } from '../components/common/QrModal';
import { ShareModal } from '../components/common/ShareModal';
import { Modal } from '../components/common/Modal';
import type { EventLink, Announcement, ScheduleItem, RulebookSection, Event, Committee } from '../types/campuslink';
import { decodeEventPayload } from '../utils/urlPayload';
import {
  Calendar,
  MapPin,
  Clock,
  Rocket,
  QrCode,
  Share2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const PublicEventPage: React.FC<{ isPreview?: boolean; customEvent?: any }> = ({
  isPreview = false,
  customEvent
}) => {
  const { handle, eventSlug } = useParams<{ handle?: string; eventSlug?: string }>();
  const { committees, events, allCommittees, allEvents, activeCommittee, activeEvent, recordPageView, recordLinkClick, recordRegClick } = useCampusLink();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedModalContent, setSelectedModalContent] = useState<'schedule' | 'rulebook' | null>(null);

  const targetSlug = (eventSlug || '').toLowerCase();
  const cleanHandleParam = (handle || '').toLowerCase().replace(/^@/, '');
  const [remoteEvent, setRemoteEvent] = useState<Event | null>(null);
  const [remoteCommittee, setRemoteCommittee] = useState<Committee | null>(null);

  const committeeList = allCommittees && allCommittees.length > 0 ? allCommittees : committees;
  const eventList = allEvents && allEvents.length > 0 ? allEvents : events;

  // Decode URL payload if present (for 100% instant zero-backend QR scanner accuracy)
  const decodedEventFromUrl: Event | null = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const queryParams = new URLSearchParams(window.location.search);
    const encodedData = queryParams.get('d');
    if (!encodedData) return null;
    const decoded = decodeEventPayload(encodedData);
    if (!decoded || !decoded.event) return null;

    return {
      id: targetSlug || decoded.event.id || 'evt_live',
      slug: targetSlug || decoded.event.slug || 'event',
      userId: decoded.event.userId || 'usr_guest',
      committeeId: decoded.event.committeeId || 'comm_custom',
      title: decoded.event.title || '',
      tagline: decoded.event.tagline || '',
      description: decoded.event.description || '',
      posterUrl: decoded.event.posterUrl || '',
      startDate: decoded.event.startDate || '',
      endDate: decoded.event.endDate || '',
      venue: decoded.event.venue || '',
      address: decoded.event.address || '',
      mapsUrl: decoded.event.mapsUrl || '',
      primaryCtaText: decoded.event.primaryCtaText || 'Register Now',
      primaryCtaUrl: decoded.event.primaryCtaUrl || '',
      themeId: (decoded.event.themeId as any) || (decoded.event.customThemeConfig ? 'custom' : 'popbrutalist'),
      customThemeConfig: decoded.event.customThemeConfig,
      customAccentColor: decoded.event.customAccentColor || decoded.event.customThemeConfig?.accentColor || '#fafafa',
      bgSvgPattern: decoded.event.bgSvgPattern || '',
      committeeName: decoded.committee?.name || '',
      committeeHandle: decoded.committee?.handle || '',
      committeeLogoUrl: decoded.committee?.logoUrl || '',
      links: Array.isArray(decoded.event.links) ? (decoded.event.links as EventLink[]) : [],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      announcements: [],
      schedule: [],
      rulebook: []
    } as any;
  }, [targetSlug]);

  // Live Database & Local Network Sync
  useEffect(() => {
    if (!targetSlug) return;

    let isMounted = true;

    const fetchLiveEvent = async () => {
      // 1. Check local server live sync API if available on dev server
      try {
        const querySlug = targetSlug || 'latest';
        const res = await fetch(`/api/live-sync?slug=${encodeURIComponent(querySlug)}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.event && isMounted) {
            setRemoteEvent(json.event);
            if (json.committee && json.committee.handle !== 'my-org') {
              setRemoteCommittee(json.committee);
            }
          }
        }
      } catch (e) {}

      // 2. Check Supabase DB if configured
      if (isSupabaseConfigured()) {
        const lookup = targetSlug || decodedEventFromUrl?.slug || decodedEventFromUrl?.id;
        if (lookup) {
          try {
            let { data, error } = await supabase
              .from('events')
              .select('*')
              .or(`slug.eq.${lookup},id.eq.${lookup}`)
              .maybeSingle();

            if (!data) {
              const { data: aliasData } = await supabase
                .from('events')
                .select('*')
                .contains('organizer_contact', { slugAliases: [lookup] })
                .limit(1)
                .maybeSingle();
              if (aliasData) data = aliasData;
            }

            if (!data) {
              const { data: altData } = await supabase
                .from('events')
                .select('*')
                .ilike('slug', `%${lookup}%`)
                .limit(1)
                .maybeSingle();
              if (altData) data = altData;
            }

            if (data && !error && isMounted) {
              const rawContact = data.organizer_contact || {};
              let loadedCustomTheme = data.custom_theme_config;
              if (!loadedCustomTheme && rawContact.customThemeConfig) {
                loadedCustomTheme = rawContact.customThemeConfig;
              }
              if (!loadedCustomTheme && typeof data.bg_svg_pattern === 'string' && data.bg_svg_pattern.startsWith('CTC:')) {
                try {
                  loadedCustomTheme = JSON.parse(data.bg_svg_pattern.slice(4));
                } catch {}
              }

              const fetched: Event = {
                id: data.id,
                userId: data.user_id,
                committeeId: data.committee_id,
                slug: data.slug,
                title: data.title,
                tagline: data.tagline || '',
                description: data.description || '',
                posterUrl: data.poster_url || '',
                startDate: data.start_date,
                endDate: data.end_date,
                venue: data.venue || '',
                address: data.address || '',
                mapsUrl: data.maps_url || '',
                primaryCtaText: data.primary_cta_text || 'Register Now',
                primaryCtaUrl: data.primary_cta_url || '',
                organizerContact: rawContact,
                themeId: data.theme_id || (loadedCustomTheme ? (loadedCustomTheme.id || 'custom') : 'popbrutalist'),
                customAccentColor: data.custom_accent_color || loadedCustomTheme?.accentColor || '#fafafa',
                bgSvgPattern: '',
                customThemeConfig: loadedCustomTheme || undefined,
                status: data.status || 'published',
                createdAt: data.created_at || new Date().toISOString(),
                updatedAt: data.updated_at || new Date().toISOString(),
                announcements: Array.isArray(data.announcements) ? data.announcements : [],
                schedule: Array.isArray(data.schedule) ? data.schedule : [],
                rulebook: Array.isArray(data.rulebook) ? data.rulebook : [],
                links: Array.isArray(data.links) && data.links.length > 0 ? data.links : []
              };
              setRemoteEvent(fetched);

              // 3. Look up organizing committee from Supabase
              const targetCommitteeHandle = (cleanHandleParam || rawContact.committeeHandle || '').trim().toLowerCase();
              let commQuery = supabase.from('committees').select('*');
              if (targetCommitteeHandle) {
                commQuery = commQuery.or(`handle.eq.${targetCommitteeHandle},id.eq.${data.committee_id},user_id.eq.${data.user_id}`);
              } else if (data.committee_id || data.user_id) {
                commQuery = commQuery.or(`id.eq.${data.committee_id},user_id.eq.${data.user_id}`);
              }
              const { data: commData } = await commQuery.maybeSingle();

              if (commData && isMounted) {
                setRemoteCommittee({
                  id: commData.id,
                  userId: commData.user_id,
                  handle: commData.handle || targetCommitteeHandle || 'org',
                  name: commData.name || rawContact.committeeName || 'Student Committee',
                  tagline: commData.tagline || '',
                  logoUrl: commData.logo_url || rawContact.committeeLogoUrl || '',
                  coverUrl: commData.cover_url || '',
                  description: commData.description || '',
                  socials: commData.socials || {},
                  members: [],
                  verified: Boolean(commData.verified)
                });
              } else if ((rawContact.committeeLogoUrl || rawContact.committeeName) && isMounted) {
                setRemoteCommittee({
                  id: data.committee_id || 'comm_custom',
                  userId: data.user_id || 'usr_guest',
                  handle: targetCommitteeHandle || rawContact.committeeHandle || 'org',
                  name: rawContact.committeeName || 'Student Committee',
                  tagline: '',
                  logoUrl: rawContact.committeeLogoUrl || '',
                  coverUrl: '',
                  description: '',
                  socials: {},
                  members: [],
                  verified: false
                });
              }
            }
          } catch (err) {}
        }
      }
    };

    fetchLiveEvent();

    const interval = setInterval(fetchLiveEvent, 4000);
    window.addEventListener('focus', fetchLiveEvent);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', fetchLiveEvent);
    };
  }, [targetSlug, decodedEventFromUrl?.slug, decodedEventFromUrl?.id, cleanHandleParam]);

  // Auto-refetch trigger on visibility / focus / periodic interval so open tabs stay 100% synced with dashboard edits
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);
    const timer = setInterval(handleUpdate, 3000);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  // Real-time live draft stream state backed by BroadcastChannel & localStorage
  const [liveStreamDraft, setLiveStreamDraft] = useState<(Event & { committee?: Partial<Committee>; committeeName?: string; committeeHandle?: string; committeeLogoUrl?: string }) | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('campuslink_builder_live_draft');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to BroadcastChannel for instant 0ms cross-tab updates as the organizer types
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('campuslink_live_stream');
        channel.onmessage = (e) => {
          if (e.data?.type === 'DRAFT_UPDATE' && e.data?.draft) {
            setLiveStreamDraft(e.data.draft);
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'campuslink_builder_live_draft' && e.newValue) {
        try {
          setLiveStreamDraft(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      try {
        channel?.close();
      } catch {}
    };
  }, []);

  const liveDraft = liveStreamDraft;

  // Find local context matching event (by slug, by ID, or by decoded payload ID)
  const isDraftMatch = Boolean(
    liveDraft && (
      (targetSlug === 'my-event' || !targetSlug) ||
      (liveDraft.slug && liveDraft.slug.toLowerCase() === targetSlug?.toLowerCase()) ||
      (liveDraft.id && liveDraft.id === targetSlug) ||
      (Array.isArray(liveDraft.slugAliases) && liveDraft.slugAliases.some(a => a.toLowerCase() === targetSlug)) ||
      (Array.isArray(liveDraft.organizerContact?.slugAliases) && liveDraft.organizerContact.slugAliases.some(a => a.toLowerCase() === targetSlug))
    )
  );

  const localEvent = targetSlug
    ? (
        (isDraftMatch ? (liveDraft as unknown as Event) : undefined) ||
        eventList.find(e => 
          e.slug?.toLowerCase() === targetSlug || 
          e.id === targetSlug ||
          (Array.isArray(e.slugAliases) && e.slugAliases.some(a => a.toLowerCase() === targetSlug)) ||
          (Array.isArray(e.organizerContact?.slugAliases) && e.organizerContact.slugAliases.some(a => a.toLowerCase() === targetSlug))
        ) ||
        (decodedEventFromUrl?.id ? eventList.find(e => e.id === decodedEventFromUrl.id) : undefined) ||
        (decodedEventFromUrl?.title ? eventList.find(e => e.title?.toLowerCase() === decodedEventFromUrl.title?.toLowerCase()) : undefined)
      )
    : ((liveDraft as unknown as Event) || eventList.find(e => e.id === activeEvent?.id) || undefined);

  // Match Event cleanly (prefers live builder preview > live stream draft > fresh remote server/Supabase > decoded URL payload > local storage > fallback)
  const rawEvent: Event = customEvent
    || (isDraftMatch ? (liveDraft as unknown as Event) : undefined)
    || (remoteEvent && Array.isArray(remoteEvent.links) && remoteEvent.links.length > 0 ? remoteEvent : undefined)
    || remoteEvent
    || (decodedEventFromUrl && Array.isArray(decodedEventFromUrl.links) && decodedEventFromUrl.links.length > 0 ? decodedEventFromUrl : undefined)
    || (localEvent && Array.isArray(localEvent.links) && localEvent.links.length > 0 ? localEvent : undefined)
    || decodedEventFromUrl
    || localEvent
    || (liveDraft as unknown as Event)
    || eventList[0]
    || {
        id: targetSlug || 'evt_live',
        committeeId: 'comm_live',
        slug: targetSlug || 'event',
        title: 'Event',
        tagline: '',
        description: '',
        posterUrl: '',
        startDate: '',
        endDate: '',
        venue: '',
        address: '',
        mapsUrl: '',
        primaryCtaText: 'Register Now',
        primaryCtaUrl: '',
        themeId: 'popbrutalist',
        customAccentColor: '#fafafa',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        announcements: [],
        links: []
      };

  // Only show links that belong strictly to this specific event
  const resolvedLinks: EventLink[] = (Array.isArray(rawEvent.links) && rawEvent.links.length > 0)
    ? rawEvent.links
    : (remoteEvent?.links && remoteEvent.links.length > 0
        ? remoteEvent.links
        : (decodedEventFromUrl?.links && decodedEventFromUrl.links.length > 0
            ? (decodedEventFromUrl.links as EventLink[])
            : (liveDraft?.links && liveDraft.links.length > 0
                ? liveDraft.links
                : (localEvent?.links && localEvent.links.length > 0
                    ? localEvent.links
                    : []))));

  const event: Event = {
    ...rawEvent,
    links: resolvedLinks
  };

  // Match Committee based on user-defined data
  const isDefaultCommittee = (c?: Partial<Committee> | null) => {
    if (!c) return true;
    return (
      (c.name === 'My Student Committee' && c.handle === 'my-org') ||
      c.handle === 'my-org'
    );
  };

  const isDefaultLogo = (url?: string | null) =>
    !url ||
    url.trim().length === 0 ||
    url.includes('data:image/svg+xml;utf8,<svg') ||
    url.includes('photo-1618005182384-a83a8bd57fbe');

  // Check draft or decoded payload committee
  const committeeFromDraftOrPayload: Partial<Committee> | undefined =
    (customEvent as any)?.committee ||
    liveDraft?.committee ||
    (liveDraft?.committeeName
      ? {
          name: liveDraft.committeeName,
          handle: liveDraft.committeeHandle,
          logoUrl: liveDraft.committeeLogoUrl
        }
      : undefined) ||
    (decodedEventFromUrl && ((decodedEventFromUrl as any).committeeName || (decodedEventFromUrl as any).committeeHandle)
      ? {
          name: (decodedEventFromUrl as any).committeeName,
          handle: (decodedEventFromUrl as any).committeeHandle,
          logoUrl: (decodedEventFromUrl as any).committeeLogoUrl
        }
      : undefined);

  const localMatchByHandle = cleanHandleParam ? committeeList.find(c => c.handle?.toLowerCase() === cleanHandleParam) : undefined;
  const localMatchById = committeeList.find(c => c.id === event?.committeeId && !isDefaultCommittee(c));

  const matchedCommittee =
    (remoteCommittee && !isDefaultCommittee(remoteCommittee) ? remoteCommittee : undefined) ||
    (localMatchByHandle && !isDefaultCommittee(localMatchByHandle) ? localMatchByHandle : undefined) ||
    (committeeFromDraftOrPayload && !isDefaultCommittee(committeeFromDraftOrPayload) ? committeeFromDraftOrPayload : undefined) ||
    localMatchById ||
    (!isDefaultCommittee(activeCommittee) ? activeCommittee : undefined) ||
    remoteCommittee ||
    localMatchByHandle ||
    activeCommittee;

  // Candidate logos gathered from all available sources
  const candidateLogos = [
    (customEvent as any)?.committeeLogoUrl,
    (customEvent as any)?.committee?.logoUrl,
    liveDraft?.committeeLogoUrl,
    liveDraft?.committee?.logoUrl,
    (decodedEventFromUrl as any)?.committeeLogoUrl,
    (decodedEventFromUrl as any)?.committee?.logoUrl,
    remoteCommittee?.logoUrl,
    (event as any)?.organizerContact?.committeeLogoUrl,
    (event as any)?.committeeLogoUrl,
    (event as any)?.committee?.logoUrl,
    matchedCommittee?.logoUrl,
    activeCommittee?.logoUrl
  ].filter((url): url is string => Boolean(url && typeof url === 'string' && url.trim().length > 0));

  // Find first custom non-placeholder logo; if none, fall back to first candidate or default SVG
  const customLogo = candidateLogos.find(url => !isDefaultLogo(url));
  const rawLogo = customLogo || candidateLogos[0] || DEFAULT_FALLBACK_COMMITTEE.logoUrl;

  const committeeLogo = (rawLogo && rawLogo.startsWith('http'))
    ? `${rawLogo}${rawLogo.includes('?') ? '&' : '?'}v=${matchedCommittee?.updatedAt || '1'}`
    : rawLogo;

  const committeeName =
    (!isDefaultCommittee(committeeFromDraftOrPayload) ? committeeFromDraftOrPayload?.name : undefined) ||
    (!isDefaultCommittee(matchedCommittee) ? matchedCommittee?.name : undefined) ||
    (event as any)?.committeeName ||
    (event as any)?.committee?.name ||
    (!isDefaultCommittee(activeCommittee) ? activeCommittee?.name : undefined) ||
    matchedCommittee?.name ||
    activeCommittee?.name ||
    'Student Committee';

  const committeeHandle =
    (committeeFromDraftOrPayload?.handle && committeeFromDraftOrPayload.handle !== 'my-org' ? committeeFromDraftOrPayload.handle : undefined) ||
    (matchedCommittee?.handle && matchedCommittee.handle !== 'my-org' ? matchedCommittee.handle : undefined) ||
    (event as any)?.committeeHandle ||
    (event as any)?.committee?.handle ||
    (cleanHandleParam && cleanHandleParam !== 'events' ? cleanHandleParam : undefined) ||
    (activeCommittee?.handle && activeCommittee.handle !== 'my-org' ? activeCommittee.handle : undefined) ||
    matchedCommittee?.handle ||
    activeCommittee?.handle ||
    'committee';

  const committee: Committee = {
    id: matchedCommittee?.id || event?.committeeId || 'comm_custom',
    handle: committeeHandle,
    name: committeeName,
    logoUrl: committeeLogo,
    tagline: matchedCommittee?.tagline || (event as any)?.committee?.tagline || '',
    description: matchedCommittee?.description || (event as any)?.committee?.description || '',
    socials: matchedCommittee?.socials || (event as any)?.committee?.socials || {},
    verified: matchedCommittee?.verified ?? (event as any)?.committee?.verified ?? false,
    members: matchedCommittee?.members || []
  };

  // Track page view once
  useEffect(() => {
    if (!isPreview && event?.id) {
      recordPageView(event.id);
    }
  }, [isPreview, event?.id]);

  // Live Countdown Calculation
  const [timeLeft, setTimeLeft] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!event?.startDate) return;

    const calculateTime = () => {
      const diff = new Date(event.startDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event?.startDate]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold font-heading">Event Not Found</h2>
          <p className="text-slate-400 text-sm">The event page you are looking for does not exist or has been removed.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white">
            Back to CampusLink
          </Link>
        </div>
      </div>
    );
  }

  // Active announcement
  const activeAnnouncement = event.announcements?.find((a: Announcement) => a.active);

  // Link click handler
  const handleLinkClick = (link: EventLink) => {
    if (!isPreview && event?.id) {
      recordLinkClick(event.id, link.id);
    }

    if (link.type === 'registration') {
      if (!isPreview && event?.id) recordRegClick(event.id);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    if (link.url === '#schedule') {
      setSelectedModalContent('schedule');
      return;
    }
    if (link.url === '#rulebook') {
      setSelectedModalContent('rulebook');
      return;
    }

    if (link.url && link.url.startsWith('http')) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Primary CTA click
  const handlePrimaryCta = () => {
    if (!isPreview && event?.id) {
      recordRegClick(event.id);
    }
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    if (event.primaryCtaUrl.startsWith('http')) {
      window.open(event.primaryCtaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Format Dates
  const startDateStr = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const endDateStr = new Date(event.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const DEFAULT_THEME_ACCENTS: Record<string, string> = {
    midnight: '#fafafa',
    aurora: '#c084fc',
    cyber: '#00f0ff',
    editorial: '#1c1917',
    festive: '#f59e0b',
    minimal: '#0f172a',
    popbrutalist: '#ffd600',
    crimson: '#f43f5e',
    scarlet: '#e11d48'
  };

  const getContrastColor = (hexColor: string) => {
    let hex = (hexColor || '#ffffff').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return '#09090b';
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#09090b' : '#ffffff';
  };

  const currentTheme = event.themeId || 'midnight';
  let customConfig = event.customThemeConfig;
  if (!customConfig && (currentTheme === 'custom' || currentTheme.startsWith('custom_') || currentTheme.startsWith('custom'))) {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('campuslink_custom_themes') : null;
      if (stored) {
        const themes = JSON.parse(stored);
        customConfig = themes.find((t: any) => t.id === currentTheme);
      }
    } catch {}

    if (!customConfig) {
      const accent = event.customAccentColor || '#10b981';
      customConfig = {
        id: currentTheme,
        name: 'Custom Theme',
        mode: 'dark',
        bgColor: '#080c14',
        bgGradientEnd: '#0f172a',
        cardBgColor: '#0f172aee',
        cardBorderColor: `${accent}40`,
        accentColor: accent,
        textColor: '#ffffff',
        subtextColor: '#94a3b8',
        fontFamily: 'sans',
        cardStyle: 'glass',
        borderRadius: 'rounded-2xl'
      };
    }
  }
  const isCustom = currentTheme === 'custom' || currentTheme.startsWith('custom_') || currentTheme.startsWith('custom') || !!customConfig;
  const themeClass = isCustom ? 'theme-custom' : `theme-${currentTheme}`;
  const accentColor = customConfig?.accentColor || event.customAccentColor || DEFAULT_THEME_ACCENTS[currentTheme] || '#fafafa';
  const ctaTextColor = getContrastColor(accentColor);

  const customStyles: React.CSSProperties = {
    '--accent-color': accentColor,
    ...(isCustom && customConfig ? {
      '--custom-bg': customConfig.bgGradientEnd
        ? `linear-gradient(135deg, ${customConfig.bgColor} 0%, ${customConfig.bgGradientEnd} 100%)`
        : customConfig.bgColor,
      '--custom-text': customConfig.textColor,
      '--custom-subtext': customConfig.subtextColor,
      '--custom-card-bg': customConfig.cardBgColor,
      '--custom-card-bg-solid': customConfig.bgColor,
      '--custom-card-border': customConfig.cardBorderColor,
      '--custom-accent': accentColor,
      '--custom-font':
        customConfig.fontFamily === 'serif' ? 'Georgia, serif'
        : customConfig.fontFamily === 'mono' ? 'ui-monospace, monospace'
        : customConfig.fontFamily === 'display' ? 'Cabinet Grotesk, sans-serif'
        : 'Inter, system-ui, sans-serif',
      '--custom-radius':
        customConfig.borderRadius === 'rounded-3xl' ? '28px'
        : customConfig.borderRadius === 'rounded-xl' ? '12px'
        : '20px',
      '--custom-card-blur': customConfig.cardStyle === 'glass' ? 'blur(16px)' : 'none',
      '--custom-card-shadow':
        customConfig.cardStyle === 'brutalist' ? '4px 4px 0px #000000'
        : customConfig.cardStyle === 'flat' ? 'none'
        : '0 12px 32px -8px rgba(0,0,0,0.35)',
    } : {})
  } as React.CSSProperties;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 pb-12 relative overflow-hidden ${themeClass}`}
      style={customStyles}
    >
      {/* Top Floating Action Bar (QR & Share) */}
      {!isPreview && (
        <header className="sticky top-0 z-40 px-4 py-3 theme-header backdrop-blur-md flex items-center justify-between transition-colors">
          <Link to={`/@${committee.handle}`} className="flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity">
            {committee.logoUrl ? (
              <img
                src={committee.logoUrl}
                alt={committee.name}
                className="w-6 h-6 rounded-full object-cover border border-current/20 bg-neutral-900"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold uppercase">
                {committee.name ? committee.name.charAt(0) : 'C'}
              </div>
            )}
            <span className="truncate max-w-[140px] font-mono opacity-90">@{committee.handle}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="p-2 rounded-xl theme-header-btn text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              title="Get QR Code"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-xl theme-header-btn text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              title="Share Event"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Responsive Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 sm:pt-6 space-y-6 relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden theme-hero-card shadow-2xl transition-all">
          {/* Poster Background / Banner */}
          <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-gradient-to-br from-neutral-900 via-zinc-950 to-neutral-900">
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            ) : null}
            {/* Gradient Overlays */}
            <div className="absolute inset-0 theme-poster-gradient" />

            {/* Committee Floating Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 theme-hero-badge px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md">
              {committee.logoUrl ? (
                <img
                  src={committee.logoUrl}
                  alt={committee.name}
                  className="w-4 h-4 rounded-full object-cover bg-neutral-900"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[9px] font-bold uppercase">
                  {committee.name ? committee.name.charAt(0) : 'C'}
                </div>
              )}
              <span>{committee.name}</span>
              {committee.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
          </div>

          {/* Hero Content Body */}
          <div className="p-5 sm:p-7 relative -mt-8 space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-tight drop-shadow-sm theme-hero-title">
                {event.title || 'Untitled Event'}
              </h1>
              {event.tagline && (
                <p className="text-base sm:text-lg font-medium mt-1 font-sans italic theme-hero-tagline">
                  "{event.tagline}"
                </p>
              )}
            </div>

            {/* Venue & Date Meta Rows */}
            <div className="space-y-2 text-xs sm:text-sm font-medium theme-meta-text">
              {(startDateStr || endDateStr) && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 theme-meta-icon flex-shrink-0" />
                  <span>{startDateStr}{endDateStr && endDateStr !== startDateStr ? ` — ${endDateStr}` : ''}</span>
                </div>
              )}
              {(event.venue || event.address) && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 theme-meta-icon flex-shrink-0" />
                  <span className="truncate">{event.venue}{event.address && event.venue ? ` • ${event.address}` : (event.address || '')}</span>
                </div>
              )}
            </div>

            {/* Live Countdown Timer */}
            <div className="p-4 rounded-2xl theme-countdown-container backdrop-blur-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono theme-meta-text">
                  <Clock className="w-3.5 h-3.5 theme-meta-icon animate-spin-slow" /> Event Countdown
                </span>
                <span className="text-[10px] font-mono theme-countdown-label opacity-75">LIVE TICK</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl theme-countdown-box">
                  <span className="text-lg sm:text-xl font-bold font-mono theme-countdown-num block">{timeLeft.days}</span>
                  <span className="text-[9px] uppercase tracking-wider theme-countdown-label font-bold">Days</span>
                </div>
                <div className="p-2 rounded-xl theme-countdown-box">
                  <span className="text-lg sm:text-xl font-bold font-mono theme-countdown-num block">{timeLeft.hours}</span>
                  <span className="text-[9px] uppercase tracking-wider theme-countdown-label font-bold">Hours</span>
                </div>
                <div className="p-2 rounded-xl theme-countdown-box">
                  <span className="text-lg sm:text-xl font-bold font-mono theme-countdown-num block">{timeLeft.minutes}</span>
                  <span className="text-[9px] uppercase tracking-wider theme-countdown-label font-bold">Mins</span>
                </div>
                <div className="p-2 rounded-xl theme-countdown-box">
                  <span className="text-lg sm:text-xl font-bold font-mono theme-countdown-num block">{timeLeft.seconds}</span>
                  <span className="text-[9px] uppercase tracking-wider theme-countdown-label font-bold">Secs</span>
                </div>
              </div>
            </div>

            {/* DOMINANT PRIMARY CTA BUTTON */}
            <button
              onClick={handlePrimaryCta}
              className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group relative overflow-hidden"
              style={{
                backgroundColor: accentColor,
                color: ctaTextColor,
                boxShadow: `0 10px 30px ${accentColor}40`
              }}
            >
              <div className="absolute inset-0 bg-white/15 shimmer-badge pointer-events-none" />
              <Rocket className="w-5 h-5 flex-shrink-0" style={{ color: ctaTextColor }} />
              <span className="font-black" style={{ color: ctaTextColor }}>{event.primaryCtaText || 'Register Now'}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" style={{ color: ctaTextColor }} />
            </button>
          </div>
        </section>

        {/* 1. LATEST ANNOUNCEMENT BANNER */}
        {activeAnnouncement && (
          <div className="p-4 rounded-2xl theme-announcement backdrop-blur-md flex items-start gap-3 shadow-lg">
            <Megaphone className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse text-current opacity-90" />
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold theme-announcement-title text-sm">{activeAnnouncement.title}</h4>
                <span className="text-[10px] opacity-75 font-mono">{activeAnnouncement.date}</span>
              </div>
              <p className="opacity-90 leading-relaxed">{activeAnnouncement.description}</p>
              {activeAnnouncement.url && (
                <a
                  href={activeAnnouncement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline hover:opacity-100 mt-1"
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 2. ELEGANT INTERACTIVE LINK CARDS */}
        {(() => {
          const rawLinks: EventLink[] = (event.links && event.links.length > 0)
            ? event.links
            : (liveDraft?.links && liveDraft.links.length > 0 ? liveDraft.links : []);

          const displayLinks = rawLinks
            .filter((l: EventLink) => l.visible)
            .reduce((acc: EventLink[], current: EventLink) => {
              if (!acc.some(l => l.id === current.id)) {
                acc.push(current);
              }
              return acc;
            }, [])
            .sort((a: EventLink, b: EventLink) => (a.sortOrder || 0) - (b.sortOrder || 0));

          if (displayLinks.length === 0) return null;

          return (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider theme-section-title">
                  Event Resources & Links ({displayLinks.length})
                </h3>
                <span className="text-[10px] opacity-60 font-mono theme-section-title">Tap to open</span>
              </div>

              <div className="space-y-3">
                {displayLinks.map((link: EventLink) => {
                  const isFeatured = link.featured;
                  return (
                    <div
                      key={link.id}
                      onClick={() => handleLinkClick(link)}
                      className={`theme-card group cursor-pointer p-4 transition-all duration-200 flex items-center justify-between gap-4 rounded-2xl ${
                        isFeatured ? 'ring-2 ring-current/25 shadow-lg scale-[1.01]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Icon Container */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 theme-icon-container">
                          <DynamicIcon name={link.icon} className="w-5.5 h-5.5" />
                        </div>

                        {/* Text & Desc */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-extrabold truncate theme-link-title transition-colors">
                              {link.title}
                            </h4>
                            {isFeatured && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full theme-featured-badge">
                                Featured
                              </span>
                            )}
                          </div>
                          {link.description && (
                            <p className="text-xs truncate mt-0.5 theme-link-desc">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 theme-chevron group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* 3. CLEAN WATERMARK FOOTER */}
        <footer className="pt-6 pb-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full theme-footer-link text-[11px] font-mono transition-all"
          >
            <Rocket className="w-3 h-3 text-indigo-400" />
            <span>Made with <strong>CampusLink</strong></span>
          </Link>
        </footer>

      </main>

      {/* Schedule / Rulebook Modal Previewers */}
      <Modal
        isOpen={selectedModalContent !== null}
        onClose={() => setSelectedModalContent(null)}
        title={selectedModalContent === 'schedule' ? `📅 Event Schedule — ${event.title}` : `📜 Official Rulebook — ${event.title}`}
        maxWidth="lg"
      >
        {selectedModalContent === 'schedule' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Detailed timeline and location breakdown for all 3 days.</p>
            <div className="space-y-3">
              {(event.schedule || []).map((item: ScheduleItem, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-indigo-400 font-bold">
                    <span>{item.time}</span>
                    <span className="text-slate-400 font-normal">{item.location}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedModalContent === 'rulebook' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-400">Please read all guidelines carefully prior to event check-in.</p>
            {(event.rulebook || []).map((sec: RulebookSection, idx: number) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">{sec.title}</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {sec.rules.map((rule: string, rIdx: number) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* QR Code & Share Modals */}
      <QrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} event={event} committee={committee} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} event={event} committee={committee} />
    </div>
  );
};
