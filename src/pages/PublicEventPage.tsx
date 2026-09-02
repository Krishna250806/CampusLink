import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampusLink } from '../context/CampusLinkContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { QrModal } from '../components/common/QrModal';
import { ShareModal } from '../components/common/ShareModal';
import { Modal } from '../components/common/Modal';
import type { EventLink, Announcement, ScheduleItem, RulebookSection, Event, Committee } from '../types/campuslink';
import { resolveSvgPattern } from '../utils/svgBackgrounds';
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

import { DEFAULT_FALLBACK_COMMITTEE, DEFAULT_FALLBACK_EVENT } from '../context/CampusLinkContext';

export const PublicEventPage: React.FC<{ isPreview?: boolean; customEvent?: any }> = ({
  isPreview = false,
  customEvent
}) => {
  const { handle, eventSlug } = useParams<{ handle?: string; eventSlug?: string }>();
  const { committees, events, allCommittees, allEvents, activeCommittee, recordPageView, recordLinkClick, recordRegClick } = useCampusLink();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedModalContent, setSelectedModalContent] = useState<'schedule' | 'rulebook' | null>(null);

  const targetSlug = (eventSlug || '').toLowerCase();
  const [remoteEvent, setRemoteEvent] = useState<Event | null>(null);

  const committeeList = allCommittees && allCommittees.length > 0 ? allCommittees : committees;
  const eventList = allEvents && allEvents.length > 0 ? allEvents : events;

  // Live Supabase DB Sync for QR Code scanners & external visitors
  useEffect(() => {
    if (!targetSlug || !isSupabaseConfigured()) return;

    const fetchSupabaseEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`slug.eq.${targetSlug},id.eq.${targetSlug}`)
        .maybeSingle();

      if (data && !error) {
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
          organizerContact: data.organizer_contact || {},
          themeId: data.theme_id || 'midnight',
          customAccentColor: data.custom_accent_color || '#fafafa',
          bgSvgPattern: data.bg_svg_pattern || '',
          status: data.status || 'published',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
          announcements: Array.isArray(data.announcements) ? data.announcements : [],
          schedule: Array.isArray(data.schedule) ? data.schedule : [],
          rulebook: Array.isArray(data.rulebook) ? data.rulebook : [],
          links: Array.isArray(data.links) && data.links.length > 0 ? data.links : [
            {
              id: `lnk_${data.id}_1`,
              title: data.primary_cta_text || 'Register Now',
              url: data.primary_cta_url || 'https://forms.google.com',
              icon: 'UserPlus',
              type: 'registration',
              featured: true,
              visible: true,
              sortOrder: 1,
              clickCount: 0
            }
          ]
        };
        setRemoteEvent(fetched);
      }
    };

    fetchSupabaseEvent();

    // Auto-refetch when user switches back to browser tab or reloads
    window.addEventListener('focus', fetchSupabaseEvent);
    return () => window.removeEventListener('focus', fetchSupabaseEvent);
  }, [targetSlug]);

  // Decode URL payload if present (for 100% instant zero-backend QR scanner accuracy)
  const queryParams = new URLSearchParams(window.location.search);
  const encodedData = queryParams.get('d');
  let decodedEventFromUrl: Event | null = null;
  if (encodedData) {
    const decoded = decodeEventPayload(encodedData);
    if (decoded && decoded.event) {
      decodedEventFromUrl = {
        ...DEFAULT_FALLBACK_EVENT,
        id: targetSlug || DEFAULT_FALLBACK_EVENT.id,
        slug: targetSlug || DEFAULT_FALLBACK_EVENT.slug,
        title: decoded.event.title || DEFAULT_FALLBACK_EVENT.title,
        tagline: decoded.event.tagline || DEFAULT_FALLBACK_EVENT.tagline,
        description: decoded.event.description || DEFAULT_FALLBACK_EVENT.description,
        posterUrl: decoded.event.posterUrl || DEFAULT_FALLBACK_EVENT.posterUrl,
        startDate: decoded.event.startDate || DEFAULT_FALLBACK_EVENT.startDate,
        endDate: decoded.event.endDate || DEFAULT_FALLBACK_EVENT.endDate,
        venue: decoded.event.venue || DEFAULT_FALLBACK_EVENT.venue,
        address: decoded.event.address || DEFAULT_FALLBACK_EVENT.address,
        mapsUrl: decoded.event.mapsUrl || DEFAULT_FALLBACK_EVENT.mapsUrl,
        primaryCtaText: decoded.event.primaryCtaText || DEFAULT_FALLBACK_EVENT.primaryCtaText,
        primaryCtaUrl: decoded.event.primaryCtaUrl || DEFAULT_FALLBACK_EVENT.primaryCtaUrl,
        themeId: (decoded.event.themeId as any) || DEFAULT_FALLBACK_EVENT.themeId,
        customAccentColor: decoded.event.customAccentColor || DEFAULT_FALLBACK_EVENT.customAccentColor,
        bgSvgPattern: decoded.event.bgSvgPattern || '',
        committeeName: decoded.committee?.name || '',
        committeeHandle: decoded.committee?.handle || '',
        committeeLogoUrl: decoded.committee?.logoUrl || '',
        links: (decoded.event.links && decoded.event.links.length > 0) ? (decoded.event.links as EventLink[]) : DEFAULT_FALLBACK_EVENT.links
      } as any;
    }
  }

  // Find local context matching event (by slug, by ID, or by decoded URL payload ID)
  const localEvent = targetSlug
    ? (
        eventList.find(e => e.slug?.toLowerCase() === targetSlug || e.id === targetSlug) ||
        (decodedEventFromUrl?.id ? eventList.find(e => e.id === decodedEventFromUrl.id) : undefined)
      )
    : undefined;

  // Match Event cleanly (prefers live builder preview > fresh local storage edit > fresh remote Supabase fetch > decoded URL payload > fallback)
  const event: Event = customEvent
    || localEvent
    || remoteEvent
    || decodedEventFromUrl
    || (targetSlug ? undefined : eventList[0])
    || DEFAULT_FALLBACK_EVENT;

  // Match Committee based on resolved event, handle, or active workspace committee
  const cleanHandleParam = (handle || '').toLowerCase().replace(/^@/, '');
  const matchedCommittee = committeeList.find(c => c.id === event?.committeeId)
    || (cleanHandleParam ? committeeList.find(c => c.handle?.toLowerCase() === cleanHandleParam) : undefined)
    || committeeList.find(c => c.userId && event?.userId && c.userId === event.userId)
    || (activeCommittee?.id === event?.committeeId ? activeCommittee : undefined)
    || committeeList.find(c => c.id !== 'comm_main')
    || activeCommittee
    || committeeList[0];

  const isDefaultComm = !matchedCommittee || matchedCommittee.id === 'comm_main';

  const committeeLogo = (!isDefaultComm && matchedCommittee?.logoUrl)
    || (event as any)?.committeeLogoUrl
    || (event as any)?.committee?.logoUrl
    || (customEvent as any)?.committee?.logoUrl
    || matchedCommittee?.logoUrl
    || DEFAULT_FALLBACK_COMMITTEE.logoUrl;

  const committeeName = (!isDefaultComm && matchedCommittee?.name)
    || (event as any)?.committeeName
    || (event as any)?.committee?.name
    || (customEvent as any)?.committee?.name
    || matchedCommittee?.name
    || DEFAULT_FALLBACK_COMMITTEE.name;

  const committeeHandle = (!isDefaultComm && matchedCommittee?.handle)
    || (event as any)?.committeeHandle
    || (event as any)?.committee?.handle
    || (customEvent as any)?.committee?.handle
    || (cleanHandleParam && cleanHandleParam !== 'events' ? cleanHandleParam : undefined)
    || matchedCommittee?.handle
    || DEFAULT_FALLBACK_COMMITTEE.handle;

  const committee: Committee = {
    id: matchedCommittee?.id || event?.committeeId || DEFAULT_FALLBACK_COMMITTEE.id,
    handle: committeeHandle,
    name: committeeName,
    logoUrl: committeeLogo,
    tagline: matchedCommittee?.tagline || (event as any)?.committee?.tagline || DEFAULT_FALLBACK_COMMITTEE.tagline,
    description: matchedCommittee?.description || (event as any)?.committee?.description || DEFAULT_FALLBACK_COMMITTEE.description,
    socials: matchedCommittee?.socials || (event as any)?.committee?.socials || DEFAULT_FALLBACK_COMMITTEE.socials,
    verified: matchedCommittee?.verified ?? (event as any)?.committee?.verified ?? DEFAULT_FALLBACK_COMMITTEE.verified,
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

  const themeClass = `theme-${event.themeId || 'midnight'}`;
  const accentColor = event.customAccentColor || '#8b5cf6';
  const activeSvgUrl = resolveSvgPattern(event.bgSvgPattern);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 pb-12 relative overflow-hidden ${themeClass}`}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      {/* SVG Background Pattern Overlay */}
      {activeSvgUrl && (
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-90 transition-all duration-300"
          style={{
            backgroundImage: `url("${activeSvgUrl.replace(/"/g, "'")}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            filter: event.themeId === 'popbrutalist' || event.themeId === 'minimal' || event.themeId === 'editorial' || event.themeId === 'scarlet'
              ? 'none'
              : 'brightness(1.6) contrast(1.25) saturate(1.2)'
          }}
        />
      )}
      {/* Top Floating Action Bar (QR & Share) */}
      {!isPreview && (
        <header className="sticky top-0 z-40 px-4 py-3 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <Link to={`/@${committee.handle}`} className="flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity">
            <img
              src={committee.logoUrl || DEFAULT_FALLBACK_COMMITTEE.logoUrl}
              alt={committee.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="%236366f1" style="background:%2309090b;padding:4px"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 12 2 2 4-4"/></svg>';
              }}
              className="w-6 h-6 rounded-full object-cover border border-white/20 bg-neutral-900"
            />
            <span className="truncate max-w-[140px] font-mono opacity-90">@{committee.handle}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              title="Get QR Code"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
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
        <section className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
          {/* Poster Background / Banner */}
          <div className="relative h-48 sm:h-60 w-full overflow-hidden">
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />

            {/* Committee Floating Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs font-medium text-white shadow-lg">
              <img
                src={committee.logoUrl || DEFAULT_FALLBACK_COMMITTEE.logoUrl}
                alt={committee.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="%236366f1" style="background:%2309090b;padding:4px"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 12 2 2 4-4"/></svg>';
                }}
                className="w-4 h-4 rounded-full object-cover bg-neutral-900"
              />
              <span>{committee.name}</span>
              {committee.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
          </div>

          {/* Hero Content Body */}
          <div className="p-5 sm:p-7 relative -mt-10 space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-tight drop-shadow-md text-white">
                {event.title}
              </h1>
              <p className="text-base sm:text-lg font-medium opacity-90 mt-1 font-sans italic text-zinc-300">
                "{event.tagline}"
              </p>
            </div>

            {/* Venue & Date Meta Rows */}
            <div className="space-y-2 text-xs sm:text-sm opacity-85 font-medium">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{startDateStr} — {endDateStr}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{event.venue} • {event.address}</span>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" /> Event Countdown
                </span>
                <span className="text-[10px] opacity-60 font-mono">LIVE TICK</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-lg sm:text-xl font-bold font-mono text-white block">{timeLeft.days}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Days</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-lg sm:text-xl font-bold font-mono text-white block">{timeLeft.hours}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Hours</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-lg sm:text-xl font-bold font-mono text-white block">{timeLeft.minutes}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Mins</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-lg sm:text-xl font-bold font-mono text-white block">{timeLeft.seconds}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Secs</span>
                </div>
              </div>
            </div>

            {/* DOMINANT PRIMARY CTA BUTTON (§4) */}
            <button
              onClick={handlePrimaryCta}
              className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-neutral-950 shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group relative overflow-hidden"
              style={{
                backgroundColor: accentColor || '#fafafa',
                color: '#09090b',
                boxShadow: `0 10px 30px ${accentColor || '#fafafa'}55`
              }}
            >
              <div className="absolute inset-0 bg-black/10 shimmer-badge pointer-events-none" />
              <Rocket className="w-5 h-5 text-neutral-950" />
              <span className="text-neutral-950 font-black">{event.primaryCtaText || 'Register Now'}</span>
              <ChevronRight className="w-5 h-5 text-neutral-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* 1. LATEST ANNOUNCEMENT BANNER */}
        {activeAnnouncement && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 backdrop-blur-md flex items-start gap-3 shadow-lg">
            <Megaphone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-100">{activeAnnouncement.title}</h4>
                <span className="text-[10px] opacity-70 font-mono">{activeAnnouncement.date}</span>
              </div>
              <p className="opacity-90">{activeAnnouncement.description}</p>
              {activeAnnouncement.url && (
                <a
                  href={activeAnnouncement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline hover:text-amber-100 mt-1"
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 2. ELEGANT INTERACTIVE LINK CARDS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
              Event Resources & Links ({event.links.filter((l: EventLink) => l.visible).length})
            </h3>
            <span className="text-[10px] opacity-50 font-mono">Tap to open</span>
          </div>

          <div className="space-y-3">
            {event.links
              .filter((l: EventLink) => l.visible)
              .sort((a: EventLink, b: EventLink) => a.sortOrder - b.sortOrder)
              .map((link: EventLink, index: number) => {
                const isFeatured = link.featured;
                const isPopBrutalist = event.themeId === 'popbrutalist';
                const popBgColors = ['#ff6b6b', '#4ecdc4', '#c77dff', '#ff9f1c', '#2ec4b6', '#ffd166'];
                const cardBg = isPopBrutalist ? popBgColors[index % popBgColors.length] : undefined;

                return (
                  <div
                    key={link.id}
                    onClick={() => handleLinkClick(link)}
                    className={`theme-card group cursor-pointer p-4 transition-all duration-200 flex items-center justify-between gap-4 ${
                      isPopBrutalist
                        ? 'rounded-2xl border-4 border-black text-black font-extrabold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : isFeatured
                        ? 'rounded-2xl ring-2 ring-white/30 shadow-lg scale-[1.01]'
                        : 'rounded-2xl'
                    }`}
                    style={isPopBrutalist ? { backgroundColor: cardBg, color: '#000000' } : undefined}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Icon Container */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isPopBrutalist
                            ? 'bg-black text-white shadow-md'
                            : isFeatured
                            ? 'bg-zinc-100 text-neutral-950 shadow-md'
                            : 'bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        <DynamicIcon name={link.icon} className="w-5.5 h-5.5" />
                      </div>

                      {/* Text & Desc */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm sm:text-base font-extrabold truncate ${isPopBrutalist ? 'text-black' : 'group-hover:text-zinc-200'} transition-colors`}>
                            {link.title}
                          </h4>
                          {isFeatured && (
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full ${
                              isPopBrutalist
                                ? 'bg-black text-white border border-black'
                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            }`}>
                              Featured
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p className={`text-xs truncate mt-0.5 ${isPopBrutalist ? 'text-black/80 font-bold' : 'opacity-75'}`}>
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 ${isPopBrutalist ? 'text-black font-black opacity-100' : 'opacity-40'} group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0`} />
                  </div>
                );
              })}
          </div>
        </section>

        {/* 3. CLEAN WATERMARK FOOTER */}
        <footer className="pt-6 pb-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-all"
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
