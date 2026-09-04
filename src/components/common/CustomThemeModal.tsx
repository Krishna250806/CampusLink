import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { CustomThemeConfig } from '../../types/campuslink';
import { Sparkles, Type, Layers, Check, Rocket } from 'lucide-react';

interface CustomThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTheme?: CustomThemeConfig | null;
  onSave: (theme: CustomThemeConfig) => void;
}

const STARTER_PRESETS: { label: string; config: Omit<CustomThemeConfig, 'id' | 'name'> }[] = [
  {
    label: 'Cosmic Emerald',
    config: {
      mode: 'dark',
      bgColor: '#06130d',
      bgGradientEnd: '#092419',
      cardBgColor: '#0a2e20',
      cardBorderColor: '#10b98144',
      accentColor: '#10b981',
      fontFamily: 'display',
      cardStyle: 'glass',
      borderRadius: 'rounded-2xl'
    }
  },
  {
    label: 'Velvet Sunset',
    config: {
      mode: 'dark',
      bgColor: '#170611',
      bgGradientEnd: '#290b20',
      cardBgColor: '#360e2b',
      cardBorderColor: '#f43f5e44',
      accentColor: '#f43f5e',
      fontFamily: 'sans',
      cardStyle: 'glass',
      borderRadius: 'rounded-2xl'
    }
  },
  {
    label: 'Electric Cobalt',
    config: {
      mode: 'dark',
      bgColor: '#050b1a',
      bgGradientEnd: '#0b1938',
      cardBgColor: '#0f234f',
      cardBorderColor: '#38bdf844',
      accentColor: '#38bdf8',
      fontFamily: 'mono',
      cardStyle: 'glass',
      borderRadius: 'rounded-2xl'
    }
  },
  {
    label: 'Vanilla Cream',
    config: {
      mode: 'light',
      bgColor: '#faf6ee',
      bgGradientEnd: '#f5edd9',
      cardBgColor: '#ffffff',
      cardBorderColor: '#e5ded0',
      accentColor: '#451a03',
      fontFamily: 'serif',
      cardStyle: 'flat',
      borderRadius: 'rounded-2xl'
    }
  },
  {
    label: 'Neo Pop Cyan',
    config: {
      mode: 'light',
      bgColor: '#e0f7fa',
      cardBgColor: '#ffffff',
      cardBorderColor: '#000000',
      accentColor: '#00e5ff',
      fontFamily: 'display',
      cardStyle: 'brutalist',
      borderRadius: 'rounded-2xl'
    }
  }
];

export const getLuminance = (hex: string): number => {
  let clean = (hex || '#ffffff').replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export const CustomThemeModal: React.FC<CustomThemeModalProps> = ({
  isOpen,
  onClose,
  initialTheme,
  onSave
}) => {
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string | null>(STARTER_PRESETS[0].label);
  const [name, setName] = useState('Cosmic Emerald 101');
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [bgColor, setBgColor] = useState('#06130d');
  const [hasGradient, setHasGradient] = useState(true);
  const [bgGradientEnd, setBgGradientEnd] = useState('#092419');
  const [cardBgColor, setCardBgColor] = useState('#0a2e20');
  const [cardBorderColor, setCardBorderColor] = useState('#10b98144');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [fontFamily, setFontFamily] = useState<'sans' | 'display' | 'serif' | 'mono'>('display');
  const [cardStyle, setCardStyle] = useState<'glass' | 'flat' | 'bordered' | 'brutalist'>('glass');
  const [borderRadius, setBorderRadius] = useState<'rounded-xl' | 'rounded-2xl' | 'rounded-3xl'>('rounded-2xl');

  useEffect(() => {
    if (initialTheme) {
      setName(initialTheme.name);
      setMode(initialTheme.mode || 'dark');
      setBgColor(initialTheme.bgColor);
      setHasGradient(Boolean(initialTheme.bgGradientEnd));
      setBgGradientEnd(initialTheme.bgGradientEnd || '#16102e');
      setCardBgColor(initialTheme.cardBgColor);
      setCardBorderColor(initialTheme.cardBorderColor);
      setAccentColor(initialTheme.accentColor);
      setFontFamily(initialTheme.fontFamily);
      setCardStyle(initialTheme.cardStyle);
      setBorderRadius(initialTheme.borderRadius);
      setSelectedPresetLabel(null);
    } else if (isOpen) {
      const defaultPreset = STARTER_PRESETS[0];
      setName(`${defaultPreset.label} ${Math.floor(Math.random() * 900) + 100}`);
      setMode(defaultPreset.config.mode);
      setBgColor(defaultPreset.config.bgColor);
      setHasGradient(Boolean(defaultPreset.config.bgGradientEnd));
      setBgGradientEnd(defaultPreset.config.bgGradientEnd || defaultPreset.config.bgColor);
      setCardBgColor(defaultPreset.config.cardBgColor);
      setCardBorderColor(defaultPreset.config.cardBorderColor);
      setAccentColor(defaultPreset.config.accentColor);
      setFontFamily(defaultPreset.config.fontFamily);
      setCardStyle(defaultPreset.config.cardStyle);
      setBorderRadius(defaultPreset.config.borderRadius);
      setSelectedPresetLabel(defaultPreset.label);
    }
  }, [initialTheme, isOpen]);

  // Auto-derived text and button contrast colors
  const cardLum = getLuminance(cardBgColor);
  const isCardDark = cardLum < 0.55;
  const textColor = isCardDark ? '#ffffff' : '#09090b';
  const subtextColor = isCardDark ? '#cbd5e1' : '#475569';
  const buttonLum = getLuminance(accentColor);
  const buttonTextColor = buttonLum > 0.55 ? '#09090b' : '#ffffff';

  const applyPreset = (preset: typeof STARTER_PRESETS[0]) => {
    setMode(preset.config.mode);
    setBgColor(preset.config.bgColor);
    setHasGradient(Boolean(preset.config.bgGradientEnd));
    setBgGradientEnd(preset.config.bgGradientEnd || preset.config.bgColor);
    setCardBgColor(preset.config.cardBgColor);
    setCardBorderColor(preset.config.cardBorderColor);
    setAccentColor(preset.config.accentColor);
    setFontFamily(preset.config.fontFamily);
    setCardStyle(preset.config.cardStyle);
    setBorderRadius(preset.config.borderRadius);
  };

  const handleSave = () => {
    const finalTheme: CustomThemeConfig = {
      id: initialTheme?.id || `custom_${Date.now()}`,
      name: name.trim() || 'Custom Theme',
      mode,
      bgColor,
      bgGradientEnd: hasGradient ? bgGradientEnd : undefined,
      cardBgColor,
      cardBorderColor,
      accentColor,
      textColor,
      subtextColor,
      fontFamily,
      cardStyle,
      borderRadius
    };
    onSave(finalTheme);
    onClose();
  };

  // Font family preview class
  const fontClass = {
    sans: 'font-sans',
    display: 'font-heading',
    serif: 'font-serif-heading',
    mono: 'font-mono'
  }[fontFamily];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Theme Studio" maxWidth="xl">
      <div className="space-y-6">
        {/* Starter Presets Bar */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Starter Presets (One-Click Base)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STARTER_PRESETS.map(p => {
              const isSelected = selectedPresetLabel === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    applyPreset(p);
                    setSelectedPresetLabel(p.label);
                    setName(`${p.label} ${Math.floor(Math.random() * 900) + 100}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 border-2 border-white text-white shadow-lg scale-105'
                      : 'bg-neutral-900 border border-white/10 hover:border-white/30 text-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.config.accentColor }} />
                  <span>{p.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Mini Preview Box */}
        <div
          className="p-5 rounded-3xl transition-all duration-300 relative overflow-hidden border border-white/10 shadow-xl"
          style={{
            background: hasGradient
              ? `linear-gradient(135deg, ${bgColor} 0%, ${bgGradientEnd} 100%)`
              : bgColor
          }}
        >
          <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-wider opacity-75" style={{ color: textColor }}>
            <span>Live Interactive Preview</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">Contrast Safe</span>
          </div>

          <div
            className={`p-4 transition-all duration-200 ${borderRadius} ${fontClass}`}
            style={{
              backgroundColor: cardBgColor,
              border: cardStyle === 'brutalist' ? '3px solid #000000' : `1px solid ${cardBorderColor}`,
              boxShadow: cardStyle === 'brutalist'
                ? '5px 5px 0px #000000'
                : cardStyle === 'glass'
                ? '0 10px 30px -10px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight" style={{ color: textColor }}>
                  {name || 'Custom Theme Title'}
                </h4>
                <p className="text-xs font-medium mt-0.5 opacity-80" style={{ color: subtextColor }}>
                  "Build. Connect. Innovate."
                </p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${accentColor}25`,
                  color: accentColor,
                  border: `1px solid ${accentColor}50`
                }}
              >
                Featured
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: subtextColor }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                <span>Venue & Schedule</span>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-transform"
                style={{
                  backgroundColor: accentColor,
                  color: buttonTextColor
                }}
              >
                <Rocket className="w-3.5 h-3.5" style={{ color: buttonTextColor }} />
                <span>Register Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme Name */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-300">Theme Template Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Cyberpunk Hackathon, Spring Gala, Minimal Slate"
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-semibold text-slate-100 focus:border-purple-400 outline-none"
            />
          </div>

          {/* Background Color */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-white/10">
            <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Background Color</span>
              <span className="text-[10px] font-mono text-zinc-400">{bgColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-10 h-9 rounded-xl bg-neutral-950 border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-200"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] font-medium text-slate-400 cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={hasGradient}
                  onChange={e => setHasGradient(e.target.checked)}
                  className="rounded border-white/20 bg-neutral-950"
                />
                <span>Enable Ambient Gradient</span>
              </label>
            </div>

            {hasGradient && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={bgGradientEnd}
                  onChange={e => setBgGradientEnd(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-neutral-950 border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={bgGradientEnd}
                  onChange={e => setBgGradientEnd(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-neutral-950 border border-white/10 rounded-lg text-xs font-mono text-slate-300"
                  placeholder="Gradient End Color"
                />
              </div>
            )}
          </div>

          {/* Card Color */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-white/10">
            <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Card Background Color</span>
              <span className="text-[10px] font-mono text-zinc-400">{cardBgColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cardBgColor.startsWith('#') ? cardBgColor.slice(0, 7) : '#15162a'}
                onChange={e => setCardBgColor(e.target.value)}
                className="w-10 h-9 rounded-xl bg-neutral-950 border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={cardBgColor}
                onChange={e => setCardBgColor(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-200"
              />
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Card Border Tint</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cardBorderColor.startsWith('#') ? cardBorderColor.slice(0, 7) : '#8b5cf6'}
                  onChange={e => setCardBorderColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-neutral-950 border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={cardBorderColor}
                  onChange={e => setCardBorderColor(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-neutral-950 border border-white/10 rounded-lg text-xs font-mono text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-white/10">
            <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Primary Accent & Button Color</span>
              <span className="text-[10px] font-mono text-zinc-400">{accentColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="w-10 h-9 rounded-xl bg-neutral-950 border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={e => setAccentColor(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-white/10">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Typography Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sans', name: 'Sans', sample: 'Modern Inter' },
                { id: 'display', name: 'Display', sample: 'Punchy Outfit' },
                { id: 'serif', name: 'Serif', sample: 'Luxury Editorial' },
                { id: 'mono', name: 'Mono', sample: 'Sharp Cyber' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontFamily(f.id as any)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    fontFamily === f.id
                      ? 'bg-purple-950/40 border-purple-400 text-purple-200 font-bold'
                      : 'bg-neutral-950 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs block font-bold">{f.name}</span>
                  <span className="text-[10px] opacity-75 block">{f.sample}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Style & Elevation */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-white/10">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Card Surface Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'glass', name: 'Frosted Glass', desc: 'Blur & translucent' },
                { id: 'flat', name: 'Clean Flat', desc: 'Minimal shadow' },
                { id: 'bordered', name: 'Outline Border', desc: 'Crisp stroke' },
                { id: 'brutalist', name: 'Neo-Brutalist', desc: 'Solid offset shadow' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCardStyle(s.id as any)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    cardStyle === s.id
                      ? 'bg-amber-950/40 border-amber-400 text-amber-200 font-bold'
                      : 'bg-neutral-950 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs block font-bold">{s.name}</span>
                  <span className="text-[10px] opacity-75 block">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900 border border-white/10">
            <label className="block text-xs font-bold text-slate-300">Corner Rounding</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded-xl', name: 'Subtle', desc: '12px' },
                { id: 'rounded-2xl', name: 'Rounded', desc: '16px' },
                { id: 'rounded-3xl', name: 'Super Soft', desc: '24px' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setBorderRadius(r.id as any)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    borderRadius === r.id
                      ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-neutral-950 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs block font-bold">{r.name}</span>
                  <span className="text-[10px] opacity-75 block">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-neutral-950 hover:bg-zinc-200 shadow-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Save Theme Template</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
