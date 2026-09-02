import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import type { Event, Committee } from '../../types/campuslink';
import { Download, Printer, Copy, Check, QrCode, Wifi, Settings2, Zap, Package } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_FALLBACK_COMMITTEE, DEFAULT_FALLBACK_EVENT } from '../../context/CampusLinkContext';
import { encodeEventPayload } from '../../utils/urlPayload';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  committee?: Committee | null;
}

const STORAGE_KEY_CUSTOM_HOST = 'campuslink_qr_custom_host';

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  event: inputEvent,
  committee: inputCommittee
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<'minimal' | 'poster' | 'dark'>('poster');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [qrMode, setQrMode] = useState<'fast' | 'payload'>('fast');

  // Custom Base Host / Domain setting (remembered in localStorage)
  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const [customHost, setCustomHost] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultOrigin;
    return localStorage.getItem(STORAGE_KEY_CUSTOM_HOST) || defaultOrigin;
  });

  const event = inputEvent || DEFAULT_FALLBACK_EVENT;
  const committee = inputCommittee || DEFAULT_FALLBACK_COMMITTEE;

  const targetSlug = event.slug || event.id || 'my-event';
  const encodedPayload = encodeEventPayload(event, committee);
  const payloadQuery = encodedPayload ? `?d=${encodedPayload}` : '';

  // Clean base URL without trailing slashes
  const cleanBaseHost = (customHost.trim() || defaultOrigin).replace(/\/+$/, '');
  const publicUrl = `${cleanBaseHost}/events/${targetSlug}${payloadQuery}`;

  const isLocalhost = cleanBaseHost.includes('localhost') || cleanBaseHost.includes('127.0.0.1');

  // Save custom host when updated
  const handleHostChange = (newHost: string) => {
    setCustomHost(newHost);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CUSTOM_HOST, newHost);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const generateQr = async () => {
      try {
        const toDataURL = (QRCode as any)?.toDataURL || (QRCode as any)?.default?.toDataURL;
        const toString = (QRCode as any)?.toString || (QRCode as any)?.default?.toString;

        const darkColor = frameStyle === 'dark' ? '#00f0ff' : '#000000';
        const lightColor = frameStyle === 'dark' ? '#090d16' : '#ffffff';

        const opts = {
          width: 600,
          margin: 4,
          color: { dark: darkColor, light: lightColor },
          errorCorrectionLevel: 'M' as const
        };

        let generatedUrl = '';

        // Engine 1: High-Res Canvas PNG Data URL
        if (typeof toDataURL === 'function') {
          try {
            generatedUrl = await toDataURL(publicUrl, opts);
          } catch (e) {}
        }

        // Engine 2: Vector SVG Data URL (Pure local offline fallback)
        if (!generatedUrl && typeof toString === 'function') {
          try {
            const svgStr = await toString(publicUrl, { ...opts, type: 'svg' });
            generatedUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
          } catch (e) {}
        }

        if (isMounted && generatedUrl) {
          setDataUrl(generatedUrl);
        }
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    };

    generateQr();

    return () => {
      isMounted = false;
    };
  }, [isOpen, publicUrl, frameStyle, qrMode]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${committee.handle || 'org'}-${targetSlug}-qr.png`;
    link.href = dataUrl;
    link.click();
    toast.success(`Downloaded high-res ${frameStyle} QR poster PNG!`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Event URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print-Ready Event QR Code" maxWidth="md">
      <div className="space-y-5 text-center">
        
        {/* QR Mode & Frame Style Selectors */}
        <div className="space-y-2">
          {/* Fast Scan vs Offline Payload Mode Toggle */}
          <div className="flex justify-center gap-2 p-1 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner max-w-sm mx-auto">
            <button
              onClick={() => setQrMode('fast')}
              className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                qrMode === 'fast'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Instant camera scan with minimal QR density"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Instant Camera Scan
            </button>
            <button
              onClick={() => setQrMode('payload')}
              className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                qrMode === 'payload'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Includes full Base64 offline payload in URL"
            >
              <Package className="w-3.5 h-3.5" /> Full Offline Payload
            </button>
          </div>

          {/* Frame Style & Settings Header */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex justify-center gap-1.5 flex-1">
              {(['poster', 'minimal', 'dark'] as const).map(style => {
                const isActive = frameStyle === style;
                const styleLabel = style === 'poster' ? 'Poster Frame' : style === 'minimal' ? 'Minimal White' : 'Cyber Dark';
                return (
                  <button
                    key={style}
                    onClick={() => setFrameStyle(style)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {styleLabel}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                showSettings ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-neutral-900 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Configure Target Host / IP"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Host / IP Configuration Panel */}
        {showSettings && (
          <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl text-left space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-amber-400" /> Mobile & Local Network Host Settings
              </span>
              <button
                onClick={() => handleHostChange(defaultOrigin)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono"
              >
                Reset to Current Origin
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Base URL or Wi-Fi IP</label>
              <input
                type="text"
                value={customHost}
                onChange={e => handleHostChange(e.target.value)}
                placeholder="e.g. http://192.168.1.15:5173 or https://your-site.vercel.app"
                className="w-full px-3.5 py-2 bg-neutral-900 border border-white/15 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              💡 <strong>Scanning from phone on Wi-Fi?</strong> Enter your computer's local IP address (e.g. <code>http://192.168.1.x:5173</code>) or deployed live site URL so mobile cameras connect instantly.
            </p>
          </div>
        )}

        {/* Localhost Mobile Warning Banner */}
        {isLocalhost && !showSettings && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-[11px] flex items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Scanning from a mobile phone? Enter your Wi-Fi IP or deployed URL.</span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold rounded-lg text-[10px] transition-colors whitespace-nowrap cursor-pointer"
            >
              Configure Host
            </button>
          </div>
        )}

        {/* Printable Card Area */}
        <div
          id="qr-print-area"
          className={`p-6 sm:p-8 rounded-3xl transition-all border shadow-2xl ${
            frameStyle === 'poster'
              ? 'bg-slate-900 border-indigo-500/40 text-white'
              : frameStyle === 'dark'
              ? 'bg-slate-950 border-cyan-400/50 text-cyan-400'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
        >
          {/* Header in QR Frame */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <img
              src={committee.logoUrl || DEFAULT_FALLBACK_COMMITTEE.logoUrl}
              alt={committee.name || 'Committee'}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
            />
            <div className="text-left">
              <p className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">{committee.name || 'Student Committee'}</p>
              <h4 className="text-xl font-black font-heading leading-tight">{event.title || 'Event Page'}</h4>
            </div>
          </div>

          {/* QR Code Canvas/Image */}
          <div className="inline-block p-4 bg-white rounded-2xl shadow-inner border border-slate-200/60">
            {dataUrl ? (
              <img src={dataUrl} alt="CampusLink Event QR" className="w-56 h-56 mx-auto rounded-xl image-rendering-pixelated shadow-sm" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 font-mono text-xs">Generating QR...</div>
            )}
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-90">
            <QrCode className="w-4 h-4 text-cyan-300" /> Scan to Register & View Details
          </p>

          <p className="mt-1.5 text-[11px] font-mono opacity-70 truncate max-w-sm mx-auto">
            {cleanBaseHost}/events/{targetSlug}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download High-Res PNG
          </button>
          
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4.5 py-3 glass-panel hover:bg-white/10 text-slate-200 font-bold text-xs rounded-xl border border-white/15 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link!' : 'Copy Public URL'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4.5 py-3 glass-panel hover:bg-white/10 text-slate-200 font-bold text-xs rounded-xl border border-white/15 transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Poster QR
          </button>
        </div>
      </div>
    </Modal>
  );
};
