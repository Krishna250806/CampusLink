import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import type { Event, Committee } from '../../types/campuslink';
import { Download, Printer, Copy, Check, QrCode, Globe, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_FALLBACK_COMMITTEE, DEFAULT_FALLBACK_EVENT } from '../../context/CampusLinkContext';
import { encodeEventPayload } from '../../utils/urlPayload';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  committee?: Committee | null;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  event: inputEvent,
  committee: inputCommittee
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<'minimal' | 'poster' | 'dark'>('poster');
  const [domainMode, setDomainMode] = useState<'production' | 'origin'>('production');

  const event = inputEvent || DEFAULT_FALLBACK_EVENT;
  const committee = inputCommittee || DEFAULT_FALLBACK_COMMITTEE;

  const targetSlug = event.slug || event.id || 'my-event';

  const encodedPayload = encodeEventPayload(event, committee);
  const payloadQuery = encodedPayload ? `?d=${encodedPayload}` : '';

  // Public URL calculation: default to production domain so mobile phone cameras can scan cleanly
  const publicUrl = domainMode === 'production'
    ? `https://campuslink.app/events/${targetSlug}${payloadQuery}`
    : (typeof window !== 'undefined'
        ? `${window.location.origin}/events/${targetSlug}${payloadQuery}`
        : `https://campuslink.app/events/${targetSlug}${payloadQuery}`);

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
          width: 400,
          margin: 4,
          color: { dark: darkColor, light: lightColor },
          errorCorrectionLevel: 'M' as const
        };

        let generatedUrl = '';

        // Primary: Canvas PNG Data URL
        if (typeof toDataURL === 'function') {
          try {
            generatedUrl = await toDataURL(publicUrl, opts);
          } catch (e) {}
        }

        // Secondary Fallback: Pure Vector SVG Data URL (works 100% locally without canvas context)
        if (!generatedUrl && typeof toString === 'function') {
          try {
            const svgStr = await toString(publicUrl, { ...opts, type: 'svg' });
            generatedUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
          } catch (e) {}
        }

        if (isMounted) {
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
  }, [isOpen, publicUrl, frameStyle]);

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
    toast.success("Event link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print-Ready Event QR Code" maxWidth="md">
      <div className="space-y-5 text-center">
        
        {/* Domain Mode & Frame Style Selectors */}
        <div className="space-y-2">
          {/* Domain Mode Switcher */}
          <div className="flex justify-center gap-2 p-1 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner max-w-xs mx-auto">
            <button
              onClick={() => setDomainMode('production')}
              className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                domainMode === 'production'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Scannable by any mobile camera anywhere"
            >
              <Globe className="w-3.5 h-3.5" /> Mobile Live Domain
            </button>
            <button
              onClick={() => setDomainMode('origin')}
              className={`flex-1 py-1.5 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                domainMode === 'origin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Local dev origin for local browser testing"
            >
              <Monitor className="w-3.5 h-3.5" /> Local Dev URL
            </button>
          </div>

          {/* Frame Style Selector */}
          <div className="flex justify-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner">
            {(['poster', 'minimal', 'dark'] as const).map(style => {
              const isActive = frameStyle === style;
              const styleLabel = style === 'poster' ? 'Poster Frame' : style === 'minimal' ? 'Minimal White' : 'Cyber Dark';
              const btnActive = 'bg-indigo-600 text-white shadow-md';
              const btnInactive = 'text-slate-300 hover:text-white';
              return (
                <button
                  key={style}
                  onClick={() => setFrameStyle(style)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isActive ? btnActive : btnInactive
                  }`}
                >
                  {styleLabel}
                </button>
              );
            })}
          </div>
        </div>

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
              <img src={dataUrl} alt="CampusLink Event QR" className="w-56 h-56 mx-auto rounded-xl" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 font-mono text-xs">Generating QR...</div>
            )}
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-90">
            <QrCode className="w-4 h-4 text-cyan-300" /> Scan to Register & View Details
          </p>

          <p className="mt-1.5 text-[11px] font-mono opacity-70 truncate max-w-sm mx-auto">
            {domainMode === 'production' ? 'campuslink.app' : 'localhost'}/events/{targetSlug}
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
