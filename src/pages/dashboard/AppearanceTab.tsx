import React from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import type { ThemeId } from '../../types/campuslink';
import { Palette, Check, Sparkles, RotateCcw } from 'lucide-react';
import { PhoneMockup } from '../../components/phone/PhoneMockup';
import { PublicEventPage } from '../PublicEventPage';

const THEMES: { id: ThemeId; name: string; tag: string; bgStyle: string; defaultAccent: string }[] = [
  { id: 'midnight', name: 'Midnight', tag: 'Monochromatic Obsidian Glass', bgStyle: 'bg-[#09090b] border-white/20 text-white', defaultAccent: '#fafafa' },
  { id: 'aurora', name: 'Aurora', tag: 'Deep Cosmic Violet & Soft Glow', bgStyle: 'bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border-purple-500/30 text-purple-100', defaultAccent: '#c084fc' },
  { id: 'cyber', name: 'Cyber', tag: 'Sleek Tech Minimal & Neon Cyan', bgStyle: 'bg-[#080b11] border-cyan-500/30 text-cyan-300 font-mono', defaultAccent: '#00f0ff' },
  { id: 'editorial', name: 'Editorial', tag: 'Warm Alabaster & Serif Type', bgStyle: 'bg-[#faf7f2] border-stone-300 text-stone-900', defaultAccent: '#1c1917' },
  { id: 'festive', name: 'Festive', tag: 'Royal Amethyst & Warm Gold', bgStyle: 'bg-gradient-to-br from-[#180b26] to-[#2d124d] border-amber-400/40 text-amber-200', defaultAccent: '#f59e0b' },
  { id: 'minimal', name: 'Minimal', tag: 'Modern Architect Slate', bgStyle: 'bg-[#f8fafc] border-slate-300 text-slate-900', defaultAccent: '#0f172a' },
  { id: 'popbrutalist', name: 'Neo-Brutalist Pop', tag: 'Warm Butter Canvas & Bold Drop Shadows', bgStyle: 'bg-[#fffde7] border-2 border-black text-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]', defaultAccent: '#ffd600' },
  { id: 'crimson', name: 'Crimson Maroon', tag: 'Luxury Velvet Maroon & Soft Rose', bgStyle: 'bg-[#180407] border-rose-900/60 text-rose-100 font-bold', defaultAccent: '#f43f5e' },
  { id: 'scarlet', name: 'Scarlet Rose', tag: 'Delicate Blush & Energetic Crimson', bgStyle: 'bg-[#fff5f5] border-rose-300 text-rose-950 font-bold', defaultAccent: '#e11d48' },
];

export const AppearanceTab: React.FC = () => {
  const { activeEvent, activeCommittee, updateEvent } = useCampusLink();

  if (!activeEvent) {
    return (
      <div className="p-8 sm:p-12 bg-neutral-900 border border-white/10 rounded-3xl text-center space-y-3 shadow-xl">
        <h3 className="text-lg font-bold font-heading text-white">No Active Event</h3>
        <p className="text-xs text-zinc-400">Build an event first to customize theme styling and colors.</p>
      </div>
    );
  }

  const currentThemePreset = THEMES.find(t => t.id === activeEvent.themeId) || THEMES[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Settings Form */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
            <span>Theme System & Styling</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Select a curated theme preset. Each theme is tailored with high-contrast typography and harmonious palettes.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Theme Presets ({THEMES.length} Available)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map(theme => {
              const isSelected = activeEvent.themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => updateEvent(activeEvent.id, {
                    themeId: theme.id,
                    customAccentColor: theme.defaultAccent,
                    bgSvgPattern: ''
                  })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${theme.bgStyle} ${
                    isSelected
                      ? 'ring-2 ring-white shadow-xl scale-[1.02]'
                      : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{theme.name}</h4>
                    <p className="text-[10px] opacity-80 font-mono mt-0.5">{theme.tag}</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-current flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Accent Color Picker */}
        <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-heading">Theme Accent & Button Color</h3>
                <p className="text-xs text-slate-400 font-sans">
                  Fine-tune the primary CTA button and focus highlight.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateEvent(activeEvent.id, { customAccentColor: currentThemePreset.defaultAccent })}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-950 border border-white/10 transition-colors"
              title="Reset to theme preset default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
              type="color"
              value={activeEvent.customAccentColor || currentThemePreset.defaultAccent}
              onChange={e => updateEvent(activeEvent.id, { customAccentColor: e.target.value })}
              className="w-14 h-12 rounded-2xl bg-neutral-950 border border-white/10 cursor-pointer"
            />
            <div className="flex-1 space-y-1">
              <span className="text-xs font-mono text-slate-400">Selected Color Code</span>
              <input
                type="text"
                value={activeEvent.customAccentColor || currentThemePreset.defaultAccent}
                onChange={e => updateEvent(activeEvent.id, { customAccentColor: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl">
        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase mb-3">INSTANT THEME PREVIEW</span>
        <PhoneMockup urlHandle={`@${activeCommittee.handle}/${activeEvent.slug}`}>
          <PublicEventPage isPreview={true} customEvent={activeEvent} />
        </PhoneMockup>
      </div>
    </div>
  );
};
