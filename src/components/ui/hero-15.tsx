import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import { PhoneMockup } from '../phone/PhoneMockup';
import { PublicEventPage } from '../../pages/PublicEventPage';
import { ArrowRight, Sparkles, Globe, Palette, ShieldCheck, Flame, CheckCircle2 } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const softReveal: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 1.2, stiffness: 45, damping: 16 },
  },
};

const navReveal: Variants = {
  hidden: { opacity: 0, y: -16, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 1, stiffness: 50, damping: 14 },
  },
};

const phoneReveal: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.94, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', mass: 1.4, stiffness: 35, damping: 18 },
  },
};

export function Hero15() {
  const navigate = useNavigate();
  const { events, committees } = useCampusLink();
  const demoCommittee = committees[0];

  // Interactive Live Theme Switcher state for Phone Mockup
  const [activeThemeId, setActiveThemeId] = useState<string>('midnight');

  const demoEvent = {
    ...events[0],
    themeId: activeThemeId
  };

  const themeOptions = [
    { id: 'midnight', label: 'Midnight', color: 'bg-purple-600' },
    { id: 'aurora', label: 'Aurora', color: 'bg-indigo-600' },
    { id: 'cyber', label: 'Cyber', color: 'bg-cyan-500' },
    { id: 'festive', label: 'Festive', color: 'bg-amber-500' },
    { id: 'editorial', label: 'Editorial', color: 'bg-stone-500' },
    { id: 'minimal', label: 'Minimal', color: 'bg-slate-400' }
  ];

  return (
    <section className="relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-neutral-950 text-white antialiased">
      {/* ------------------------------------------------------------------- */}
      {/* HERO-15 AMBIENT LUXURY GRADIENT OVERLAY                              */}
      {/* ------------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-white/10 via-neutral-900/30 to-transparent rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[160px]" />
      </div>

      <motion.div
        className="relative flex min-h-screen w-full flex-col overflow-hidden bg-neutral-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >

        {/* ------------------------------------------------------------------- */}
        {/* HERO-15 NAVBAR                                                      */}
        {/* ------------------------------------------------------------------- */}
        <motion.nav
          variants={navReveal}
          className="max-w-7xl relative z-20 mx-auto flex min-h-16 w-full items-center justify-between px-6 py-4 sm:px-10 border-b border-white/10 bg-neutral-950/60 backdrop-blur-xl"
        >
          <Link
            to="/"
            className="group/brand text-md inline-flex items-center gap-2.5 font-bold tracking-tight text-white transition-[opacity,transform] duration-200 ease-out hover:opacity-85 active:scale-[0.96]"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-neutral-950 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,1)]">
              <Sparkles className="w-4 h-4 fill-neutral-950" />
            </div>
            <span className="font-heading text-lg">CampusLink</span>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-white/10 text-zinc-300 rounded-full border border-white/15">
              PRO
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex text-sm font-light text-white/80">
            <Link to={`/@${demoCommittee.handle}/${demoEvent.slug}`} className="hover:text-white transition-colors flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" /> Explore Demo
            </Link>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-zinc-100 px-5 text-xs font-semibold text-neutral-900 shadow-[inset_0_2px_0_0_rgba(255,255,255,1),inset_0_-1px_0_0_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-zinc-200 hover:text-black active:scale-[0.96] cursor-pointer"
          >
            Create Event
          </button>
        </motion.nav>

        {/* ------------------------------------------------------------------- */}
        {/* HERO-15 MAIN CONTENT & TYPOGRAPHY                                   */}
        {/* ------------------------------------------------------------------- */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pt-12 pb-16 text-center sm:px-12 sm:pt-16">
          
          {/* BADGE */}
          <motion.div variants={softReveal} className="mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/12 text-zinc-300 text-xs font-mono font-medium backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>WATERMELON HERO-15 TEMPLATE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </motion.div>

          {/* HEADLINE: LINE 1 SANS + LINE 2 SERIF ITALIC (HERO-15 SIGNATURE) */}
          <motion.div variants={softReveal} className="mx-auto max-w-4xl">
            <h1 className="text-[clamp(2.8rem,5.8vw,4.5rem)] leading-[1.02] font-light tracking-normal text-balance text-white/95">
              <span className="block">One link for your</span>
              <span className="mt-1 block font-serif text-[1.08em] leading-[0.94] font-normal text-white italic">
                entire college event.
              </span>
            </h1>
          </motion.div>

          {/* SUBTITLE */}
          <motion.p
            variants={softReveal}
            className="mt-5 max-w-xl text-sm sm:text-base leading-7 font-light text-pretty text-white/70"
          >
            Stop burying rules in Google Drives and schedule updates in WhatsApp chats. Publish one art-directed link (<span className="font-mono text-zinc-200 font-medium bg-white/10 px-2 py-0.5 rounded border border-white/15">/@technova/technova-2026</span>) hosting registration, rulebooks, venue maps, timelines, and live announcements.
          </motion.p>

          {/* CTA BUTTONS (HERO-15 ZINC & GLASS PULL BUTTONS) */}
          <motion.div
            variants={softReveal}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-7 text-sm font-medium text-neutral-950 shadow-[inset_0_2px_0_0_rgba(255,255,255,1),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_10px_25px_rgba(255,255,255,0.15)] transition-all duration-200 hover:bg-zinc-200 active:scale-[0.96] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Create Your Event — Free</span>
            </button>
            
            <Link
              to={`/@${demoCommittee.handle}/${demoEvent.slug}`}
              className="group/secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-6 text-sm font-light text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200 hover:bg-white/15 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] active:scale-[0.96]"
            >
              <span>View Live Demo</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover/secondary:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* PROOF PILLS */}
          <motion.div
            variants={softReveal}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-light text-white/60"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 6 Art-Directed Themes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Print-Ready Vector QR Suite</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero Visitor App Download</span>
          </motion.div>

          {/* ----------------------------------------------------------------- */}
          {/* HERO-15 ANIMATED PHONE MOCKUP SHOWCASE (WITH MOTION & THEMES)      */}
          {/* ----------------------------------------------------------------- */}
          <motion.div
            variants={phoneReveal}
            className="mt-14 w-full flex flex-col items-center relative z-20"
          >
            {/* Interactive Theme Switcher Bar */}
            <div className="glass-panel px-4 py-2 rounded-2xl border border-white/15 flex items-center gap-2 shadow-2xl mb-6 overflow-x-auto max-w-full backdrop-blur-2xl bg-neutral-900/80">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 px-1 flex items-center gap-1.5 whitespace-nowrap">
                <Palette className="w-3.5 h-3.5 text-zinc-300" /> Theme Switcher:
              </span>
              <div className="flex items-center gap-1.5">
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveThemeId(t.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeThemeId === t.id
                        ? 'bg-zinc-100 text-neutral-950 font-bold shadow-md scale-105'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.color}`} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Mockup Frame */}
            <div className="w-full max-w-[360px] transform hover:scale-[1.015] transition-transform duration-500 shadow-[0_30px_70px_rgba(0,0,0,0.9)]">
              <PhoneMockup urlHandle={`@${demoCommittee.handle}/${demoEvent.slug}`}>
                <PublicEventPage isPreview={true} customEvent={demoEvent} />
              </PhoneMockup>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}

export default Hero15;
