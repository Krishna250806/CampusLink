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
  Star,
  Zap
} from 'lucide-react';

export const Hero38: React.FC = () => {
  const navigate = useNavigate();
  const { events, committees } = useCampusLink();
  const demoCommittee = committees[0];

  // Interactive Live Theme Switcher state for Hero 38
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
    <div className="relative min-h-[92vh] bg-mesh-dark overflow-hidden text-slate-100 flex flex-col justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      {/* ------------------------------------------------------------------- */}
      {/* DOTTED SPIRAL ART BACKGROUND & AMBIENT GLOW                         */}
      {/* ------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10">
        {/* Background Radial Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-violet-600/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[150px]" />

        {/* HERO 38 DOTTED SPIRAL ART SVG */}
        <svg
          className="w-[950px] h-[950px] opacity-35 animate-spin-slow text-violet-400"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hero38-dotted-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dotted Concentric Circles */}
          {[80, 140, 200, 260, 320, 380, 440, 500].map((radius, idx) => (
            <circle
              key={idx}
              cx="500"
              cy="500"
              r={radius}
              stroke="url(#hero38-dotted-grad)"
              strokeWidth={idx % 2 === 0 ? "2.5" : "1.8"}
              strokeDasharray={idx % 2 === 0 ? "2 14" : "3 18"}
              strokeLinecap="round"
            />
          ))}

          {/* Dotted Archimedean Spiral Path */}
          <path
            d="M 500 500 
               C 530 470, 560 540, 600 510 
               C 650 470, 580 380, 470 410 
               C 340 440, 400 620, 580 650 
               C 780 680, 810 370, 600 270 
               C 350 140, 220 560, 500 810 
               C 830 1060, 1050 350, 470 120"
            stroke="url(#hero38-dotted-grad)"
            strokeWidth="3"
            strokeDasharray="2 16"
            strokeLinecap="round"
          />

          {/* Decorative Dot Nodes */}
          <circle cx="500" cy="500" r="8" fill="#a855f7" />
          <circle cx="600" cy="510" r="5" fill="#6366f1" />
          <circle cx="470" cy="410" r="6" fill="#06b6d4" />
          <circle cx="580" cy="650" r="7" fill="#ec4899" />
          <circle cx="600" cy="270" r="5" fill="#38bdf8" />
        </svg>

        {/* Ambient Grid Pattern */}
        <div
          className="absolute inset-0 bg-grid-theme opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.25) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* HERO 38 SPLIT GRID (LEFT: CONTENT & CTAS, RIGHT: FRAMED PHOTOS)     */}
      {/* ------------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">

        {/* LEFT COLUMN: HERO 38 SPLIT COPY */}
        <div className="lg:col-span-7 space-y-7 text-center lg:text-left">

          {/* BADGE */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-950/80 border border-violet-600/40 text-violet-300 text-xs font-mono font-bold shadow-lg shadow-violet-950/40 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>HERO 38 • SPLIT DOTTED ART TEMPLATE</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* HEADLINE */}
          <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black font-heading tracking-tight leading-[1.08] text-white">
            One link for your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(139,92,246,0.35)]">
              entire college fest.
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans font-normal">
            Stop burying rules in Google Drive and schedule changes in WhatsApp chats. Publish one art-directed microsite link (<span className="font-mono text-violet-300 font-semibold bg-violet-950/70 px-2 py-0.5 rounded border border-violet-700/40">/@technova/2026</span>) combining registrations, rulebook PDFs, schedule timelines, and live alerts.
          </p>

          {/* CTAS */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-white/20"
            >
              <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Create Your Event — Free</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <Link
              to={`/@${demoCommittee.handle}/${demoEvent.slug}`}
              className="px-7 py-4 glass-panel hover:bg-white/10 text-slate-200 font-bold text-sm rounded-2xl border border-white/15 transition-all flex items-center gap-2 shadow-lg"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Explore Demo</span>
            </Link>
          </div>

          {/* SOCIAL PROOF & STUDENT RATING STACK */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-300 border-t border-white/10">
            {/* Avatar Group */}
            <div className="flex items-center -space-x-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Student" className="w-9 h-9 rounded-full object-cover border-2 border-slate-950" />
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80" alt="Student" className="w-9 h-9 rounded-full object-cover border-2 border-slate-950" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" alt="Student" className="w-9 h-9 rounded-full object-cover border-2 border-slate-950" />
              <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80" alt="Student" className="w-9 h-9 rounded-full object-cover border-2 border-slate-950" />
              <div className="w-9 h-9 rounded-full bg-violet-600 text-white font-mono font-bold text-[10px] flex items-center justify-center border-2 border-slate-950">
                +50
              </div>
            </div>

            {/* Rating Stars */}
            <div className="flex flex-col items-center sm:items-start space-y-0.5">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
                <span className="text-white font-mono font-bold text-xs ml-1">5.0 / 5.0</span>
              </div>
              <span className="text-[11px] text-slate-400">Trusted by 50+ Top Campus Committees</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HERO 38 FRAMED PHOTOS & DEVICE STACK */}
        <div className="lg:col-span-5 flex flex-col items-center relative space-y-6">

          {/* THEME SWITCHER TOOLBAR ABOVE FRAMED ART */}
          <div className="glass-panel px-3.5 py-2 rounded-2xl border border-violet-500/30 flex items-center gap-2 shadow-2xl z-30 max-w-full overflow-x-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-300 px-1 flex items-center gap-1 whitespace-nowrap">
              <Palette className="w-3.5 h-3.5 text-violet-400" /> Theme:
            </span>
            <div className="flex items-center gap-1">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThemeId(t.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    activeThemeId === t.id
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/40 ring-1 ring-white/40 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${t.color}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* HERO 38 SIGNATURE FRAMED PHOTO COMPOSITION */}
          <div className="relative w-full max-w-[420px] h-[520px] flex items-center justify-center">

            {/* TOP RIGHT FRAMED PHOTO (CONCERT / STAGE) */}
            <div className="absolute top-0 right-0 w-[240px] transform rotate-6 hover:rotate-3 hover:scale-105 transition-all duration-500 z-10 shadow-2xl">
              <div className="glass-panel-elevated p-2 rounded-3xl border border-violet-500/40 bg-slate-950/90 overflow-hidden group">
                <div className="relative h-32 rounded-2xl overflow-hidden">
                  <img
                    src="/hero38_concert.jpg"
                    alt="Fest Concert Stage"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-violet-950/90 border border-violet-500/50 text-[10px] font-mono font-bold text-violet-200 flex items-center gap-1 shadow">
                    <Flame className="w-3 h-3 text-amber-400" /> EDM Night Stage
                  </span>
                </div>
              </div>
            </div>

            {/* CENTER INTERACTIVE PHONE MOCKUP */}
            <div className="z-20 w-full max-w-[310px] transform hover:scale-[1.02] transition-transform duration-500 drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)]">
              <PhoneMockup urlHandle={`@${demoCommittee.handle}/${demoEvent.slug}`}>
                <PublicEventPage isPreview={true} customEvent={demoEvent} />
              </PhoneMockup>
            </div>

            {/* BOTTOM LEFT FRAMED PHOTO (HACKATHON TEAM) */}
            <div className="absolute bottom-2 left-0 w-[230px] transform -rotate-6 hover:-rotate-2 hover:scale-105 transition-all duration-500 z-30 shadow-2xl">
              <div className="glass-panel-elevated p-2 rounded-3xl border border-cyan-500/40 bg-slate-950/90 overflow-hidden group">
                <div className="relative h-32 rounded-2xl overflow-hidden">
                  <img
                    src="/hero38_hackathon.jpg"
                    alt="Hackathon Team"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-200 flex items-center gap-1 shadow">
                    <Zap className="w-3 h-3 text-cyan-400" /> Hackathon Finals
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
