import React, { useState, useEffect } from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import type { ThemeId, CustomThemeConfig } from '../../types/campuslink';
import { Palette, Check, Sparkles, RotateCcw, Plus, Edit2, Trash2 } from 'lucide-react';
import { PhoneMockup } from '../../components/phone/PhoneMockup';
import { PublicEventPage } from '../PublicEventPage';
import { CustomThemeModal } from '../../components/common/CustomThemeModal';

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
  const [customThemes, setCustomThemes] = useState<CustomThemeConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomThemeConfig | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('campuslink_custom_themes');
      if (stored) {
        const loaded: CustomThemeConfig[] = JSON.parse(stored);
        setCustomThemes(loaded);
        if (activeEvent && (activeEvent.themeId === 'custom' || activeEvent.themeId?.startsWith('custom_')) && !activeEvent.customThemeConfig) {
          const match = loaded.find(t => t.id === activeEvent.themeId) || loaded[0];
          if (match) {
            updateEvent(activeEvent.id, {
              customThemeConfig: match,
              customAccentColor: match.accentColor
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load custom themes from storage', e);
    }
  }, []);

  const saveCustomTheme = (themeConfig: CustomThemeConfig) => {
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
      console.error('Failed to save custom themes to storage', e);
    }

    // Automatically apply to active event
    if (activeEvent) {
      updateEvent(activeEvent.id, {
        themeId: themeConfig.id,
        customThemeConfig: themeConfig,
        customAccentColor: themeConfig.accentColor,
        bgSvgPattern: ''
      });
    }
    setIsModalOpen(false);
    setEditingTheme(null);
  };

  const deleteCustomTheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customThemes.filter(t => t.id !== id);
    setCustomThemes(updated);
    try {
      localStorage.setItem('campuslink_custom_themes', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to remove custom theme from storage', err);
    }

    if (activeEvent?.themeId === id) {
      updateEvent(activeEvent.id, {
        themeId: 'midnight',
        customThemeConfig: undefined,
        customAccentColor: '#fafafa'
      });
    }
  };

  if (!activeEvent) {
    return (
      <div className="p-8 sm:p-12 bg-neutral-900 border border-white/10 rounded-3xl text-center space-y-3 shadow-xl">
        <h3 className="text-lg font-bold font-heading text-white">No Active Event</h3>
        <p className="text-xs text-zinc-400">Build an event first to customize theme styling and colors.</p>
      </div>
    );
  }

  const currentThemePreset = THEMES.find(t => t.id === activeEvent.themeId) || THEMES[0];
  const isCustomActive = activeEvent.themeId === 'custom' || activeEvent.themeId?.startsWith('custom_') || !!activeEvent.customThemeConfig;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Settings Form */}
      <div className="lg:col-span-7 space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
              <span>Theme Studio</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Choose from 9 handcrafted presets or design your own custom theme template.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTheme(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold font-sans flex items-center gap-1.5 shadow-lg hover:bg-neutral-200 transition-transform active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Theme</span>
          </button>
        </div>

        {/* Custom Themes Section (if any created) */}
        {customThemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Your Custom Theme Templates</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                  {customThemes.length}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customThemes.map(ct => {
                const isSelected = activeEvent.themeId === ct.id;
                return (
                  <div
                    key={ct.id}
                    onClick={() => updateEvent(activeEvent.id, {
                      themeId: ct.id,
                      customThemeConfig: ct,
                      customAccentColor: ct.accentColor,
                      bgSvgPattern: ''
                    })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 relative group overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-white shadow-xl scale-[1.02] border-white/40'
                        : 'border-white/10 opacity-90 hover:opacity-100 hover:scale-[1.01] bg-neutral-900/80'
                    }`}
                    style={{
                      background: ct.bgGradientEnd ? `linear-gradient(135deg, ${ct.bgColor} 0%, ${ct.bgGradientEnd} 100%)` : ct.bgColor,
                      color: ct.textColor
                    }}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold truncate">{ct.name}</h4>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/30 border border-white/15">
                          {ct.cardStyle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: ct.bgColor }} title="Background" />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: ct.cardBgColor }} title="Card surface" />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm" style={{ backgroundColor: ct.accentColor }} title="Accent" />
                        <span className="text-[10px] opacity-75 font-mono ml-1">{ct.fontFamily}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isSelected && <Check className="w-5 h-5 text-current flex-shrink-0" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTheme(ct);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/90 transition-colors"
                        title="Edit theme template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => deleteCustomTheme(ct.id, e)}
                        className="p-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/60 text-red-200 transition-colors"
                        title="Delete theme template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Predefined Themes Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Curated Theme Presets ({THEMES.length} Available)
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">Designed for contrast</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map(theme => {
              const isSelected = !isCustomActive && activeEvent.themeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => updateEvent(activeEvent.id, {
                    themeId: theme.id,
                    customThemeConfig: undefined,
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

        {/* Custom Accent Color Fine-Tuning */}
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
              onClick={() => {
                const defAccent = isCustomActive && activeEvent.customThemeConfig
                  ? activeEvent.customThemeConfig.accentColor
                  : currentThemePreset.defaultAccent;
                updateEvent(activeEvent.id, { customAccentColor: defAccent });
              }}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-950 border border-white/10 transition-colors"
              title="Reset to theme default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
              type="color"
              value={activeEvent.customAccentColor || (isCustomActive && activeEvent.customThemeConfig ? activeEvent.customThemeConfig.accentColor : currentThemePreset.defaultAccent)}
              onChange={e => {
                const val = e.target.value;
                updateEvent(activeEvent.id, {
                  customAccentColor: val,
                  ...(activeEvent.customThemeConfig ? {
                    customThemeConfig: {
                      ...activeEvent.customThemeConfig,
                      accentColor: val
                    }
                  } : {})
                });
              }}
              className="w-14 h-12 rounded-2xl bg-neutral-950 border border-white/10 cursor-pointer"
            />
            <div className="flex-1 space-y-1">
              <span className="text-xs font-mono text-slate-400">Selected Color Code</span>
              <input
                type="text"
                value={activeEvent.customAccentColor || (isCustomActive && activeEvent.customThemeConfig ? activeEvent.customThemeConfig.accentColor : currentThemePreset.defaultAccent)}
                onChange={e => {
                  const val = e.target.value;
                  updateEvent(activeEvent.id, {
                    customAccentColor: val,
                    ...(activeEvent.customThemeConfig ? {
                      customThemeConfig: {
                        ...activeEvent.customThemeConfig,
                        accentColor: val
                      }
                    } : {})
                  });
                }}
                className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-neutral-950 border border-white/10 rounded-3xl shadow-2xl sticky top-6">
        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase mb-3">INSTANT THEME PREVIEW</span>
        <PhoneMockup urlHandle={`@${activeCommittee.handle}/${activeEvent.slug}`}>
          <PublicEventPage isPreview={true} customEvent={activeEvent} />
        </PhoneMockup>
      </div>

      {/* Custom Theme Creation/Editing Modal */}
      <CustomThemeModal
        isOpen={isModalOpen}
        initialTheme={editingTheme || undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTheme(null);
        }}
        onSave={saveCustomTheme}
      />
    </div>
  );
};

