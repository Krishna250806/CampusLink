import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import { PhoneMockup } from '../phone/PhoneMockup';
import { PublicEventPage } from '../../pages/PublicEventPage';
import {
  Sparkles,
  ArrowRight,
  Globe,
  Flame,
  Palette,
  QrCode,
  CheckCircle2,
  Calendar,
  Zap,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const Hero37: React.FC = () => {
  const navigate = useNavigate();
  const { events, committees } = useCampusLink();
  const demoCommittee = committees[0];

  // Interactive Live Theme Switcher state
  const [activeThemeId, setActiveThemeId] = useState<string>('midnight');

  const demoEvent = {
    ...events[0],
    themeId: activeThemeId
  };

  const themeOptions = [
    { id: 'midnight', label: 'Midnight', color: 'from-violet-500 to-purple-600' },
    { id: 'aurora', label: 'Aurora', color: 'from-indigo-500 to-pink-500' },
    { id: 'cyber', label: 'Cyber', color: 'from-cyan-400 to-blue-600' },
    { id: 'festive', label: 'Festive', color: 'from-amber-400 to-rose-500' },
    { id: 'editorial', label: 'Editorial', color: 'from-stone-400 to-stone-600' },
    { id: 'minimal', label: 'Minimal', color: 'from-slate-300 to-slate-500' }
  ];

  return (
    <div className="relative min-h-[90vh] bg-mesh-dark overflow-hidden text-slate-100 flex flex-col items-center justify-center pt-12 pb-24 px-4 sm:px-6">
      {/* ------------------------------------------------------------------- */}
      {/* BACKGROUND SPIRAL MOTIF & AMBIENT NEON GLOW                         */}
      {/* ------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10">
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/20 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[130px]" />

        {/* HERO 37 SIGNATURE SPIRAL SVG MOTIF */}
        <svg
          className="w-[900px] h-[900px] opacity-25 animate-spin-slow text-violet-500/40"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hero37-spiral-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="hero37-ring-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Concentric Spiral Lines */}
          {[60, 110, 160, 210, 260, 310, 360, 410, 460].map((radius, idx) => (
            <circle
              key={idx}
              cx="400"
              cy="400"
              r={radius}
              stroke="url(#hero37-spiral-grad)"
              strokeWidth={idx % 2 === 0 ? "1.5" : "1"}
              strokeDasharray={idx % 2 === 0 ? "12 8 4 8" : "6 6"}
            />
          ))}

          {/* Swirling Spiral Archimedean Arc */}
          <path
            d="M 400 400 
               C 420 380, 440 430, 470 410 
               C 510 380, 450 310, 370 330 
               C 270 350, 320 500, 460 520 
               C 620 540, 640 300, 480 220 
               C 280 120, 180 440, 400 640 
               C 660 840, 840 280, 380 100"
            stroke="url(#hero37-ring-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Geometric Background Grid Mesh */}
        <div 
          className="absolute inset-0 bg-grid-theme opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* HERO CONTENT CONTAINER (CENTERED ALIGNMENT AS PER HERO 37)          */}
      {/* ------------------------------------------------------------------- */}
      <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">

        {/* TOP BADGE */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-950/80 border border-violet-600/40 text-violet-300 text-xs font-mono font-bold shadow-xl shadow-violet-950/40 backdrop-blur-md">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>CAMPUSLINK HERO 37 TEMPLATE</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* HERO TITLE */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tight leading-[1.08] text-white">
          One link for your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(139,92,246,0.35)]">
            entire college event.
          </span>
        </h1>

        {/* HERO SUBTITLE */}
        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-sans font-normal">
          Stop burying rules in Google Drives & schedule updates in WhatsApp groups. Publish one art-directed link (<span className="font-mono text-violet-300 font-semibold bg-violet-950/70 px-2.5 py-1 rounded border border-violet-700/50">/@technova/technova-2026</span>) hosting registration, rulebooks, venue maps, schedule timelines, and live announcements.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Create Your Event — Free</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <Link
            to={`/@${demoCommittee.handle}/${demoEvent.slug}`}
            className="px-7 py-4 glass-panel hover:bg-white/10 text-slate-200 font-bold text-sm rounded-2xl border border-white/15 transition-all flex items-center gap-2 shadow-lg"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>View Live Demo</span>
          </Link>
        </div>

        {/* QUICK TRUST PROOF FEATURE PILLS */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>6 Art-Directed Themes</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Print-Ready Vector QR Suite</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Visitor App Download</span>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TRIPLE HANDSET / PHONE SHOWCASE STACK (HERO 37 SIGNATURE DISPLAY)   */}
      {/* ------------------------------------------------------------------- */}
      <div className="w-full max-w-6xl mx-auto mt-16 relative flex flex-col items-center z-10">

        {/* THEME SWITCHER TOOLBAR ABOVE STACK */}
        <div className="glass-panel px-4 py-2.5 rounded-2xl border border-violet-500/30 flex items-center gap-2 shadow-2xl z-30 mb-8 overflow-x-auto max-w-full">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-300 px-2 flex items-center gap-1.5 whitespace-nowrap">
            <Palette className="w-3.5 h-3.5 text-violet-400" /> Live Theme Switcher:
          </span>
          <div className="flex items-center gap-1.5">
            {themeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThemeId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeThemeId === t.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/40 ring-1 ring-white/40 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${t.color}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* HANDSET STACK CONTAINER */}
        <div className="relative w-full flex items-center justify-center min-h-[580px]">

          {/* LEFT HANDSET (FLOATING 3D CARDS / SCHEDULE PREVIEW) */}
          <div className="hidden lg:block absolute left-4 xl:left-12 top-10 w-[300px] transform -rotate-6 scale-90 opacity-90 hover:opacity-100 hover:scale-95 transition-all duration-500 z-10 pointer-events-none">
            <div className="glass-panel-elevated p-5 rounded-3xl border border-violet-500/30 shadow-2xl space-y-4 bg-slate-950/90">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Event Schedule</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Technova '26</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Live</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-violet-300 font-bold">10:00 AM</span>
                  <span className="text-slate-200">Keynote & Inauguration</span>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-950/60 border border-violet-500/30 flex justify-between items-center">
                  <span className="text-cyan-300 font-bold">02:00 PM</span>
                  <span className="text-slate-100">Hackathon Finals</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <span className="text-violet-300 font-bold">06:00 PM</span>
                  <span className="text-slate-200">EDM Night & Awards</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Instant Sync</span>
                <span>Audit Verified</span>
              </div>
            </div>
          </div>

          {/* CENTER PRIMARY HANDSET (MAIN INTERACTIVE PHONE MOCKUP) */}
          <div className="z-20 w-full max-w-[360px] transform hover:scale-[1.02] transition-transform duration-500 drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
            <PhoneMockup urlHandle={`@${demoCommittee.handle}/${demoEvent.slug}`}>
              <PublicEventPage isPreview={true} customEvent={demoEvent} />
            </PhoneMockup>
          </div>

          {/* RIGHT HANDSET (FLOATING 3D CARDS / QR PASS & ANNOUNCEMENT PREVIEW) */}
          <div className="hidden lg:block absolute right-4 xl:right-12 top-10 w-[300px] transform rotate-6 scale-90 opacity-90 hover:opacity-100 hover:scale-95 transition-all duration-500 z-10 pointer-events-none">
            <div className="glass-panel-elevated p-5 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-4 bg-slate-950/90">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Poster QR Suite</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Print-Ready Vector</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">SVG / PNG</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-2">
                <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                  <QrCode className="w-full h-full text-slate-950" />
                </div>
                <p className="text-[11px] font-mono text-slate-300">Scan for Official Rulebook & Venue Map</p>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> High-DPI Vector</span>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-violet-400" /> 6 Color Variants</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
