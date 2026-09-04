import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import type { Event, ThemeId, EventLink, CustomThemeConfig } from '../../types/campuslink';
import { PhoneMockup } from '../../components/phone/PhoneMockup';
import { PublicEventPage } from '../PublicEventPage';
import { compressImage } from '../../utils/imageCompressor';
import { CustomThemeModal } from '../../components/common/CustomThemeModal';
import {
  Rocket,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Palette,
  Upload,
  QrCode,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { QrModal } from '../../components/common/QrModal';
import { isoToDatetimeLocal, datetimeLocalToIso } from '../../utils/dateUtils';

const THEMES_CONFIG: { id: ThemeId; name: string; desc: string; bgClass: string; defaultAccent: string }[] = [
  { id: 'midnight', name: 'Midnight', desc: 'Monochromatic obsidian glass', bgClass: 'bg-[#09090b] border-white/20 text-white', defaultAccent: '#fafafa' },
  { id: 'aurora', name: 'Aurora', desc: 'Deep cosmic violet & soft glow', bgClass: 'bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border-purple-500/30 text-purple-100', defaultAccent: '#c084fc' },
  { id: 'cyber', name: 'Cyber', desc: 'Sleek tech minimal & neon cyan', bgClass: 'bg-[#080b11] border-cyan-500/30 text-cyan-300 font-mono', defaultAccent: '#00f0ff' },
  { id: 'editorial', name: 'Editorial', desc: 'Warm alabaster & serif type', bgClass: 'bg-[#faf7f2] border-stone-300 text-stone-900', defaultAccent: '#1c1917' },
  { id: 'festive', name: 'Festive', desc: 'Royal amethyst & warm gold', bgClass: 'bg-gradient-to-br from-[#180b26] to-[#2d124d] border-amber-400/40 text-amber-200', defaultAccent: '#f59e0b' },
  { id: 'minimal', name: 'Minimal', desc: 'Modern architect slate', bgClass: 'bg-[#f8fafc] border-slate-300 text-slate-900', defaultAccent: '#0f172a' },
  { id: 'popbrutalist', name: 'Neo-Brutalist Pop', desc: 'Warm butter canvas & drop shadows', bgClass: 'bg-[#fffde7] border-2 border-black text-black font-extrabold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]', defaultAccent: '#ffd600' },
  { id: 'crimson', name: 'Crimson Maroon', desc: 'Luxury velvet maroon & soft rose', bgClass: 'bg-[#180407] border-rose-900/60 text-rose-100 font-bold', defaultAccent: '#f43f5e' },
  { id: 'scarlet', name: 'Scarlet Rose', desc: 'Delicate blush & energetic crimson', bgClass: 'bg-[#fff5f5] border-rose-300 text-rose-950 font-bold', defaultAccent: '#e11d48' }
];

import { DEFAULT_FALLBACK_COMMITTEE, DEFAULT_FALLBACK_EVENT } from '../../context/CampusLinkContext';

export const EventBuilderPage: React.FC = () => {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const { activeEvent, events, createEvent, updateEvent, activeCommittee } = useCampusLink();

  const safeCommittee = activeCommittee || DEFAULT_FALLBACK_COMMITTEE;
  const safeActiveEvent = activeEvent || DEFAULT_FALLBACK_EVENT;

  // Check if a saved live builder draft exists in localStorage
  const getSavedLiveDraft = (): Partial<Event> | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('campuslink_builder_live_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return null;
  };

  const liveDraftSaved = getSavedLiveDraft();

  // Find target event if editing
  const isEditing = !!eventId;
  const targetEvent = events.find(e => e.id === eventId) || safeActiveEvent;

  // Retrieve any existing links from live draft, target event, or workspace
  const existingLinks: EventLink[] = (liveDraftSaved?.links && liveDraftSaved.links.length > 0)
    ? (liveDraftSaved.links as EventLink[])
    : (targetEvent?.links && targetEvent.links.length > 0)
    ? targetEvent.links
    : (events.find(e => Array.isArray(e.links) && e.links.length > 0)?.links || []);

  const initialEvent: Partial<Event> = (isEditing && targetEvent)
    ? {
        ...targetEvent,
        links: existingLinks,
        ...(liveDraftSaved || {})
      }
    : {
        ...(liveDraftSaved || {}),
        title: liveDraftSaved?.title || (targetEvent?.title && targetEvent.title !== DEFAULT_FALLBACK_EVENT.title ? targetEvent.title : ""),
        tagline: liveDraftSaved?.tagline || (targetEvent?.tagline && targetEvent.tagline !== DEFAULT_FALLBACK_EVENT.tagline ? targetEvent.tagline : ""),
        description: liveDraftSaved?.description || (targetEvent?.description && targetEvent.description !== DEFAULT_FALLBACK_EVENT.description ? targetEvent.description : ""),
        posterUrl: liveDraftSaved?.posterUrl || (targetEvent?.posterUrl && targetEvent.posterUrl !== DEFAULT_FALLBACK_EVENT.posterUrl ? targetEvent.posterUrl : ""),
        startDate: liveDraftSaved?.startDate || targetEvent?.startDate || new Date(Date.now() + 86400000 * 7).toISOString(),
        endDate: liveDraftSaved?.endDate || targetEvent?.endDate || new Date(Date.now() + 86400000 * 9).toISOString(),
        venue: liveDraftSaved?.venue || (targetEvent?.venue && targetEvent.venue !== DEFAULT_FALLBACK_EVENT.venue ? targetEvent.venue : ""),
        address: liveDraftSaved?.address || (targetEvent?.address && targetEvent.address !== DEFAULT_FALLBACK_EVENT.address ? targetEvent.address : ""),
        mapsUrl: liveDraftSaved?.mapsUrl || targetEvent?.mapsUrl || "",
        primaryCtaText: liveDraftSaved?.primaryCtaText || targetEvent?.primaryCtaText || "Register Now",
        primaryCtaUrl: liveDraftSaved?.primaryCtaUrl || targetEvent?.primaryCtaUrl || "",
        themeId: liveDraftSaved?.themeId || targetEvent?.themeId || "popbrutalist",
        customThemeConfig: (() => {
          if (liveDraftSaved?.customThemeConfig) return liveDraftSaved.customThemeConfig;
          if (targetEvent?.customThemeConfig) return targetEvent.customThemeConfig;
          const tid = liveDraftSaved?.themeId || targetEvent?.themeId;
          if (tid && (tid === 'custom' || tid.startsWith('custom_'))) {
            try {
              const stored = typeof window !== 'undefined' ? localStorage.getItem('campuslink_custom_themes') : null;
              if (stored) {
                const list = JSON.parse(stored);
                return list.find((t: any) => t.id === tid) || list[0];
              }
            } catch {}
          }
          return undefined;
        })(),
        customAccentColor: liveDraftSaved?.customAccentColor || targetEvent?.customAccentColor || "#fafafa",
        organizerContact: {
          name: safeCommittee.name,
          email: "",
          phone: ""
        },
        links: existingLinks,
        announcements: targetEvent?.announcements || []
      };

  const [draft, setDraft] = useState<Partial<Event>>(initialEvent);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [customThemes, setCustomThemes] = useState<CustomThemeConfig[]>([]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [editingTheme, setEditingTheme] = useState<CustomThemeConfig | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('campuslink_custom_themes');
      if (stored) {
        setCustomThemes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load custom themes in builder', e);
    }
  }, []);

  const handleSaveCustomTheme = (themeConfig: CustomThemeConfig) => {
    let updated: CustomThemeConfig[];
    const exists = customThemes.some(t => t.id === themeConfig.id);
    if (exists) {
      updated = customThemes.map(t => t.id === themeConfig.id ? themeConfig : t);
    } else {
      updated = [...customThemes, themeConfig];
    }
    setCustomThemes(updated);
    try {
      localStorage.setItem('campuslink_custom_themes', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom themes in builder', e);
    }

    setDraft(prev => ({
      ...prev,
      themeId: themeConfig.id,
      customThemeConfig: themeConfig,
      customAccentColor: themeConfig.accentColor,
      bgSvgPattern: ''
    }));
    setIsThemeModalOpen(false);
    setEditingTheme(null);
  };

  // BroadcastChannel for instant 0ms cross-tab real-time preview updates
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('campuslink_live_stream');
      }
    } catch {}

    const fullDraft = {
      ...draft,
      committee: safeCommittee,
      committeeName: safeCommittee.name,
      committeeHandle: safeCommittee.handle,
      committeeLogoUrl: safeCommittee.logoUrl,
      committeeId: safeCommittee.id
    };

    // 1. Instant 0ms broadcast across all tabs
    try {
      channel?.postMessage({
        type: 'DRAFT_UPDATE',
        draft: fullDraft
      });
    } catch {}

    // 2. Debounced persistent storage & context update
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('campuslink_builder_live_draft', JSON.stringify(fullDraft));
        window.dispatchEvent(new Event('storage'));

        const targetId = eventId || targetEvent?.id;
        if (targetId) {
          updateEvent(targetId, fullDraft);
        }

        // Post to server for cross-device sync (e.g. mobile phone refresh without rescanning)
        fetch('/api/live-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: fullDraft.slug,
            event: fullDraft,
            committee: safeCommittee
          })
        }).catch(() => {});
      } catch {}
    }, 150);

    return () => {
      clearTimeout(timer);
      try {
        channel?.close();
      } catch {}
    };
  }, [draft, eventId, targetEvent?.id, safeCommittee]);

  // Initial mount sync: ensure draft is immediately available so live event page and QR scans have full links on first load
  useEffect(() => {
    try {
      const fullDraft = {
        ...initialEvent,
        committee: safeCommittee,
        committeeName: safeCommittee.name,
        committeeHandle: safeCommittee.handle,
        committeeLogoUrl: safeCommittee.logoUrl,
        committeeId: safeCommittee.id
      };
      localStorage.setItem('campuslink_builder_live_draft', JSON.stringify(fullDraft));
      window.dispatchEvent(new Event('storage'));

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('campuslink_live_stream');
        bc.postMessage({ type: 'DRAFT_UPDATE', draft: fullDraft });
        setTimeout(() => bc.close(), 100);
      }

      fetch('/api/live-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: fullDraft.slug,
          event: fullDraft,
          committee: safeCommittee
        })
      }).catch(() => {});
    } catch {}
  }, []);

  // Form Field Updaters
  const updateField = (key: keyof Event, val: any) => {
    setDraft(prev => {
      const updated = { ...prev, [key]: val };
      if (key === 'title') {
        const generatedSlug = (val || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        if (generatedSlug) {
          updated.slug = generatedSlug;
        }
      }
      return updated;
    });
  };

  // Local File Upload Handler for Event Poster
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 500, 0.65);
        updateField('posterUrl', compressed);
        toast.success('Event poster uploaded & optimized successfully!');
      } catch (err) {
        console.error('Poster compression failed:', err);
        try {
          const fallback = await compressImage(file, 350, 350, 0.5);
          updateField('posterUrl', fallback);
          toast.success('Event poster uploaded!');
        } catch {
          toast.error('Could not process image file. Please use a smaller PNG/JPG.');
        }
      }
    }
  };

  // Link Handlers inside Builder Step 3
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<any>('registration');

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl) return;

    let cleanUrl = newLinkUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const linkItem: EventLink = {
      id: `lnk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: newLinkTitle.trim(),
      url: cleanUrl,
      icon: 'Link',
      type: newLinkType,
      featured: false,
      visible: true,
      sortOrder: (draft.links?.length || 0) + 1,
      clickCount: 0
    };

    setDraft(prev => ({
      ...prev,
      links: [...(prev.links || []), linkItem]
    }));

    setNewLinkTitle('');
    setNewLinkUrl('');
    toast.success(`Link "${linkItem.title}" added!`);
  };

  const removeDraftLink = (linkId: string) => {
    setDraft(prev => ({
      ...prev,
      links: (prev.links || []).filter(l => l.id !== linkId)
    }));
    toast.info('Link removed');
  };

  // Publish Event Final Action
  const handlePublish = () => {
    try {
      const payloadToSave: Partial<Event> = {
        ...draft,
        committeeId: safeCommittee.id,
        status: 'published'
      };

      if (isEditing && (eventId || targetEvent?.id)) {
        const idToUpdate = eventId || targetEvent.id;
        updateEvent(idToUpdate, payloadToSave);
        toast.success("Event updated successfully!");
      } else {
        createEvent(payloadToSave);
        toast.success("Event published live to CampusLink!");
      }
      try {
        localStorage.removeItem('campuslink_builder_live_draft');
      } catch {}
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      navigate('/dashboard');
    } catch (err: any) {
      // Graceful offline/guest fallback
      updateEvent(targetEvent?.id || 'evt_main', { ...draft, committeeId: safeCommittee.id });
      toast.success("Event saved successfully!");
      navigate('/dashboard');
    }
  };

  const handleResetDraft = () => {
    try {
      localStorage.removeItem('campuslink_builder_live_draft');
    } catch {}
    setDraft({
      id: `evt_${Date.now()}`,
      userId: safeCommittee.userId || 'usr_guest',
      committeeId: safeCommittee.id,
      slug: 'new-campus-fest',
      title: 'New Campus Fest',
      tagline: 'Connect. Celebrate. Experience.',
      description: 'Annual campus festival bringing together top students and creators.',
      posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000',
      startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 16).toISOString(),
      venue: 'Campus Main Auditorium',
      address: 'University Main Campus Gate 1',
      mapsUrl: 'https://maps.google.com',
      primaryCtaText: 'Register Now',
      primaryCtaUrl: 'https://forms.google.com',
      themeId: 'popbrutalist',
      customAccentColor: '#fafafa',
      links: []
    });
    toast.info('Draft reset! You can now configure your new event.');
  };

  const livePublicSlug = draft.slug || targetEvent?.slug || 'my-event';

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="px-6 py-4 bg-neutral-900 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-white rounded-xl bg-neutral-950 border border-white/10 hover:bg-neutral-800 transition-all cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black font-heading text-white">{isEditing ? 'Edit Event' : 'Interactive Event Builder'}</h2>
              <button
                type="button"
                onClick={handleResetDraft}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-zinc-300 rounded-md border border-white/10 cursor-pointer transition-colors"
                title="Clear cached draft and start fresh"
              >
                Reset / New
              </button>
            </div>
            <p className="text-xs text-zinc-400 font-mono">@{safeCommittee.handle} • Real-Time Live Preview Engine</p>
          </div>
        </div>

        {/* Mobile Edit vs Preview Switcher */}
        <div className="flex md:hidden bg-neutral-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMobileTab('edit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer ${
              mobileTab === 'edit' ? 'bg-zinc-100 text-neutral-950 font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer ${
              mobileTab === 'preview' ? 'bg-zinc-100 text-neutral-950 font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/events/${livePublicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Open Live Microsite in new tab"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">View Live</span>
          </a>

          <button
            onClick={() => setIsQrOpen(true)}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Get Event QR Code"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">QR Code</span>
          </button>

          <button
            onClick={handlePublish}
            className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
          >
            <Rocket className="w-4 h-4 text-emerald-500" /> {isEditing ? 'Save Changes' : 'Publish Event'}
          </button>
        </div>
      </header>

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        event={{ ...draft, committee: safeCommittee, committeeId: safeCommittee.id } as Event}
        committee={safeCommittee}
      />

      {/* Main Split Layout: Editor Left | Phone Mockup Right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
        
        {/* LEFT COLUMN: 5-Step Guided Form Editor */}
        <div className={`md:col-span-6 lg:col-span-7 p-6 sm:p-8 overflow-y-auto ${mobileTab === 'preview' ? 'hidden md:block' : 'block'}`}>
          <div className="max-w-xl mx-auto space-y-6">
            
            {/* Step Wizard Indicator */}
            <div className="flex items-center justify-between p-3.5 glass-panel rounded-2xl border border-white/10 shadow-lg">
              {[1, 2, 3, 4, 5].map(stepNum => (
                <button
                  key={stepNum}
                  onClick={() => setCurrentStep(stepNum)}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    currentStep === stepNum
                      ? 'bg-zinc-100 text-neutral-950 shadow-xl ring-2 ring-white/50 scale-105'
                      : currentStep > stepNum
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-900 text-slate-400 border border-white/5 hover:text-slate-200'
                  }`}
                >
                  {stepNum}
                </button>
              ))}
            </div>

            {/* STEP 1: BASICS */}
            {currentStep === 1 && (
              <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl">
                <div>
                  <h3 className="text-xl font-black font-heading text-white">Step 1: Event Basics</h3>
                  <p className="text-xs text-slate-400">Set event title, tagline, registration link, and description.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Fest Title *</label>
                    <input
                      type="text"
                      value={draft.title || ''}
                      onChange={e => updateField('title', e.target.value)}
                      placeholder="e.g. TECHNOVA '26"
                      className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Tagline / Motto *</label>
                    <input
                      type="text"
                      value={draft.tagline || ''}
                      onChange={e => updateField('tagline', e.target.value)}
                      placeholder="e.g. Build. Compete. Create."
                      className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={draft.primaryCtaText || ''}
                      onChange={e => updateField('primaryCtaText', e.target.value)}
                      placeholder="e.g. Register Now"
                      className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary CTA Link URL</label>
                    <input
                      type="url"
                      value={draft.primaryCtaUrl || ''}
                      onChange={e => updateField('primaryCtaUrl', e.target.value)}
                      placeholder="https://forms.google.com/..."
                      className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm font-mono text-zinc-300 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Event Description</label>
                    <textarea
                      rows={4}
                      value={draft.description || ''}
                      onChange={e => updateField('description', e.target.value)}
                      placeholder="Detail the tracks, prize pool, and eligibility requirements..."
                      className="w-full p-4 bg-neutral-950 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & LOCATION */}
            {currentStep === 2 && (
              <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl">
                <div>
                  <h3 className="text-xl font-black font-heading text-white">Step 2: Date & Venue</h3>
                  <p className="text-xs text-slate-400">Specify dates, times, and venue map links for attendees.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={isoToDatetimeLocal(draft.startDate)}
                      onChange={e => updateField('startDate', datetimeLocalToIso(e.target.value, 14))}
                      className="w-full px-3.5 py-3 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={isoToDatetimeLocal(draft.endDate)}
                      onChange={e => updateField('endDate', datetimeLocalToIso(e.target.value, 16))}
                      className="w-full px-3.5 py-3 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Venue Name</label>
                  <input
                    type="text"
                    value={draft.venue || ''}
                    onChange={e => updateField('venue', e.target.value)}
                    placeholder="e.g. Auditorium Complex & Tech Park"
                    className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Address / Landmark</label>
                  <input
                    type="text"
                    value={draft.address || ''}
                    onChange={e => updateField('address', e.target.value)}
                    placeholder="e.g. Gate 3, Sector 4, XYZ University Campus"
                    className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Google Maps URL</label>
                  <input
                    type="url"
                    value={draft.mapsUrl || ''}
                    onChange={e => updateField('mapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-4 py-3 bg-neutral-950 border border-white/10 rounded-xl text-sm font-mono text-zinc-300 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: LINKS MANAGER */}
            {currentStep === 3 && (
              <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
                <div>
                  <h3 className="text-xl font-black font-heading text-white">Step 3: Links & Modules</h3>
                  <p className="text-xs text-slate-400">Add schedule links, rulebook PDFs, WhatsApp groups, and socials.</p>
                </div>

                <form onSubmit={handleAddLink} className="p-4 bg-neutral-950 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white block">Add Link Module</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Title (e.g. 📅 Event Schedule)"
                      value={newLinkTitle}
                      onChange={e => setNewLinkTitle(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="URL (https://...)"
                      value={newLinkUrl}
                      onChange={e => setNewLinkUrl(e.target.value)}
                      className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <select
                      value={newLinkType}
                      onChange={e => setNewLinkType(e.target.value)}
                      className="px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white"
                    >
                      <option value="registration">Registration</option>
                      <option value="schedule">Schedule</option>
                      <option value="rulebook">Rulebook PDF</option>
                      <option value="whatsapp">WhatsApp Group</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">Teaser Video</option>
                    </select>

                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Link
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {(draft.links || []).map((link, idx) => (
                    <div key={link.id || idx} className="p-3 bg-neutral-950 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{link.title}</h4>
                        <p className="text-[10px] font-mono text-zinc-400 truncate">{link.url}</p>
                      </div>
                      <button
                        onClick={() => removeDraftLink(link.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: APPEARANCE & LOCAL POSTER UPLOAD */}
            {currentStep === 4 && (
              <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
                <div>
                  <h3 className="text-xl font-black font-heading text-white">Step 4: Theme & Poster Image</h3>
                  <p className="text-xs text-slate-400">Pick from 6 curated themes and upload local event poster image.</p>
                </div>

                {/* Local File Upload + URL for Event Poster */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Event Poster Banner Image</label>
                  <div className="space-y-3">
                    {draft.posterUrl && (
                      <img src={draft.posterUrl} alt="Poster preview" className="w-full h-36 rounded-2xl object-cover border border-white/20 shadow-md" />
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={draft.posterUrl || ''}
                        onChange={e => updateField('posterUrl', e.target.value)}
                        placeholder="https://... or upload local file"
                        className="flex-1 px-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100"
                      />
                      <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm">
                        <Upload className="w-4 h-4 text-neutral-950" />
                        <span>Upload Local Poster File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePosterUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-purple-400" /> Select Theme Template
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTheme(null);
                        setIsThemeModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Custom Theme
                    </button>
                  </div>

                  {customThemes.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 block">Your Custom Templates:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {customThemes.map(ct => {
                          const isSelected = draft.themeId === ct.id;
                          return (
                            <div
                              key={ct.id}
                              onClick={() => {
                                updateField('themeId', ct.id);
                                updateField('customThemeConfig', ct);
                                updateField('customAccentColor', ct.accentColor);
                                updateField('bgSvgPattern', '');
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group overflow-hidden ${
                                isSelected ? 'ring-2 ring-white scale-105 shadow-xl border-white/40' : 'opacity-80 hover:opacity-100 border-white/10'
                              }`}
                              style={{
                                background: ct.bgGradientEnd ? `linear-gradient(135deg, ${ct.bgColor} 0%, ${ct.bgGradientEnd} 100%)` : ct.bgColor,
                                color: ct.textColor
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold truncate block pr-2">{ct.name}</span>
                                <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-black/40 border border-white/20">
                                  {ct.cardStyle}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: ct.bgColor }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: ct.cardBgColor }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: ct.accentColor }} />
                                <span className="text-[10px] opacity-75 font-mono ml-1">{ct.fontFamily}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-zinc-400 block mb-2">Curated Presets:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {THEMES_CONFIG.map(t => {
                      const isSelected = !draft.customThemeConfig && draft.themeId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            updateField('themeId', t.id);
                            updateField('customThemeConfig', undefined);
                            updateField('customAccentColor', t.defaultAccent);
                            updateField('bgSvgPattern', '');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${t.bgClass} ${
                            isSelected ? 'ring-2 ring-white scale-105 shadow-xl' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span className="text-xs font-bold block">{t.name}</span>
                          <span className="text-[10px] opacity-75">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Custom Accent Glow Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draft.customAccentColor || '#fafafa'}
                      onChange={e => updateField('customAccentColor', e.target.value)}
                      className="w-12 h-10 rounded-xl bg-neutral-950 border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draft.customAccentColor || '#fafafa'}
                      onChange={e => updateField('customAccentColor', e.target.value)}
                      className="px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PUBLISH PREVIEW */}
            {currentStep === 5 && (
              <div className="glass-panel-elevated p-8 rounded-3xl space-y-6 text-center shadow-2xl py-8">
                <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-white/20 text-white flex items-center justify-center mx-auto shadow-xl">
                  <Rocket className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black font-heading text-white">Your Fest Page is Ready!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Review your live phone mockup on the right. Click publish to launch your page instantly on CampusLink.
                  </p>
                </div>

                <button
                  onClick={handlePublish}
                  className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-sm rounded-2xl shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Rocket className="w-5 h-5 text-emerald-600" />
                  <span>{isEditing ? 'Save Fest Microsite Changes' : 'Publish Fest Microsite Live'}</span>
                </button>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2.5 bg-neutral-900 border border-white/10 text-slate-300 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                disabled={currentStep === 5}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4 text-neutral-950" />
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Phone Preview */}
        <div className={`md:col-span-6 lg:col-span-5 p-6 bg-neutral-950 flex flex-col items-center justify-center border-l border-white/10 relative overflow-hidden ${mobileTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center mb-4 space-y-1 z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10">
              LIVE PREVIEW ENGINE
            </span>
            <p className="text-xs text-slate-400">Updates live as you type</p>
          </div>

          <div className="scale-[0.85] sm:scale-95 transform-gpu transition-all z-10">
            <PhoneMockup urlHandle={`/@${safeCommittee.handle}/${draft.slug || 'my-event'}`}>
              <PublicEventPage isPreview={true} customEvent={{ ...draft, committee: safeCommittee }} />
            </PhoneMockup>
          </div>
        </div>

      </div>

      {/* Custom Theme Creation/Editing Modal */}
      <CustomThemeModal
        isOpen={isThemeModalOpen}
        initialTheme={editingTheme || undefined}
        onClose={() => {
          setIsThemeModalOpen(false);
          setEditingTheme(null);
        }}
        onSave={handleSaveCustomTheme}
      />
    </div>
  );
};
