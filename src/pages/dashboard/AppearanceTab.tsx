import React from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import type { ThemeId } from '../../types/campuslink';
import { Palette, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { PhoneMockup } from '../../components/phone/PhoneMockup';
import { PublicEventPage } from '../PublicEventPage';
import { SVG_BACKGROUND_PRESETS } from '../../utils/svgBackgrounds';
import { toast } from 'sonner';

const THEMES: { id: ThemeId; name: string; tag: string; bgStyle: string }[] = [
  { id: 'popbrutalist', name: 'Neo-Brutalist Pop', tag: 'Vibrant Yellow & Hard Drop Shadows', bgStyle: 'bg-yellow-400 border-2 border-black text-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
  { id: 'crimson', name: 'Crimson Maroon', tag: 'Luxury Dark Velvet Maroon & Gold', bgStyle: 'bg-[#2b080c] border-rose-900/60 text-rose-100 font-bold' },
  { id: 'scarlet', name: 'Scarlet Rose', tag: 'Energetic Light Rose & Crimson', bgStyle: 'bg-rose-50 border-rose-300 text-rose-950 font-bold' },
  { id: 'midnight', name: 'Midnight', tag: 'Monochromatic Obsidian', bgStyle: 'bg-neutral-900 border-white/20 text-white' },
  { id: 'aurora', name: 'Aurora', tag: 'Soft Dark Titanium', bgStyle: 'bg-neutral-900 border-white/15 text-zinc-300' },
  { id: 'cyber', name: 'Cyber', tag: 'Sharp Tech Minimal', bgStyle: 'bg-neutral-900 border-white/15 text-zinc-200' },
  { id: 'editorial', name: 'Editorial', tag: 'Ivory Serif & Clean Minimal', bgStyle: 'bg-amber-50 border-stone-400 text-amber-950' },
  { id: 'festive', name: 'Festive', tag: 'Vibrant Party Highlight', bgStyle: 'bg-neutral-900 border-amber-400/40 text-amber-300' },
  { id: 'minimal', name: 'Minimal', tag: 'Clean Slate & Graphite', bgStyle: 'bg-slate-100 border-slate-300 text-slate-800' }
];

export const AppearanceTab: React.FC = () => {
  const { activeEvent, activeCommittee, updateEvent } = useCampusLink();

  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          updateEvent(activeEvent.id, { bgSvgPattern: evt.target.result as string });
          toast.success('Custom SVG background pattern loaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Settings Form */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100">Theme System & Styling</h2>
          <p className="text-xs text-slate-400">Select a theme preset, pick an SVG background asset pattern, and customize your colors.</p>
        </div>

        {/* Themes Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Theme Presets ({THEMES.length} Available)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map(theme => {
              const isSelected = activeEvent.themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => updateEvent(activeEvent.id, { themeId: theme.id })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${theme.bgStyle} ${
                    isSelected ? 'ring-2 ring-white shadow-xl scale-[1.02]' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold">{theme.name}</h4>
                    <p className="text-[10px] opacity-75 font-mono">{theme.tag}</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-current" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* SVG Background Asset Selector */}
        <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-heading">SVG Asset Background Patterns</h3>
              <p className="text-xs text-slate-400">Select an SVG asset from local storage or upload your own pattern.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {SVG_BACKGROUND_PRESETS.map(preset => {
              const isSelected = (activeEvent.bgSvgPattern || '') === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => updateEvent(activeEvent.id, { bgSvgPattern: preset.url })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-zinc-100 text-neutral-950 font-bold border-white ring-2 ring-white/50 scale-[1.02] shadow-xl'
                      : 'bg-neutral-950 border-white/10 text-slate-300 hover:bg-neutral-800 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between z-10 w-full">
                    <span className="text-xs font-bold leading-tight truncate">{preset.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  </div>
                  {preset.url ? (
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-12 rounded-xl object-fill border border-white/20 shadow-md z-10"
                    />
                  ) : (
                    <div className="w-full h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-500 z-10">
                      Solid Color
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 border border-white/15 text-xs font-bold text-slate-200 hover:bg-neutral-800 transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Custom SVG Background File</span>
              <input type="file" accept=".svg,image/svg+xml,image/*" onChange={handleSvgFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Custom Accent Color Picker */}
        <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-heading">Custom Accent Color Overlay</h3>
              <p className="text-xs text-slate-400 font-sans">Layer your club's brand accent color onto any theme preset.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
              type="color"
              value={activeEvent.customAccentColor || (activeEvent.themeId === 'popbrutalist' ? '#ffe600' : '#fafafa')}
              onChange={e => updateEvent(activeEvent.id, { customAccentColor: e.target.value })}
              className="w-14 h-12 rounded-2xl bg-neutral-950 border border-white/10 cursor-pointer"
            />
            <div className="flex-1 space-y-1">
              <span className="text-xs font-mono text-slate-400">Selected Color Code</span>
              <input
                type="text"
                value={activeEvent.customAccentColor || (activeEvent.themeId === 'popbrutalist' ? '#ffe600' : '#fafafa')}
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
