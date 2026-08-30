import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampusLink } from '../context/CampusLinkContext';
import { DynamicIcon } from '../components/common/DynamicIcon';
import { QrModal } from '../components/common/QrModal';
import { ShareModal } from '../components/common/ShareModal';
import { Modal } from '../components/common/Modal';
import type { EventLink, Announcement, ScheduleItem, RulebookSection, Event } from '../types/campuslink';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
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
  const { committees, events, recordPageView, recordLinkClick, recordRegClick } = useCampusLink();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedModalContent, setSelectedModalContent] = useState<'schedule' | 'rulebook' | null>(null);

  // Match Committee & Event with safe fallbacks
  const committee = customEvent?.committee
    || committees.find(c => c.id === customEvent?.committeeId)
    || committees.find(c => c.handle?.toLowerCase() === (handle || '').toLowerCase())
    || committees[0]
    || DEFAULT_FALLBACK_COMMITTEE;

  const event: Event = customEvent
    || events.find(e => e.committeeId === committee?.id && e.slug?.toLowerCase() === (eventSlug || '').toLowerCase())
    || events[0]
    || DEFAULT_FALLBACK_EVENT;

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

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 pb-12 relative overflow-hidden ${themeClass}`}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      {/* SVG Background Pattern Overlay */}
      {event.bgSvgPattern && (
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-90 transition-all duration-300"
          style={{
            backgroundImage: `url(${event.bgSvgPattern})`,
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
            <img src={committee.logoUrl} alt={committee.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
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
              <img src={committee.logoUrl} alt={committee.name} className="w-4 h-4 rounded-full object-cover" />
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
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
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
            <Sparkles className="w-3 h-3 text-indigo-400" />
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
