import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import type { Event, Committee } from '../../types/campuslink';
import { Download, Printer, Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_FALLBACK_COMMITTEE, DEFAULT_FALLBACK_EVENT } from '../../context/CampusLinkContext';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  committee?: Committee | null;
}

const safeBtoa = (str: string) => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch (e) {
    return '';
  }
};

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  event: inputEvent,
  committee: inputCommittee
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<'minimal' | 'poster' | 'dark'>('poster');

  const event = inputEvent || DEFAULT_FALLBACK_EVENT;
  const committee = inputCommittee || DEFAULT_FALLBACK_COMMITTEE;

  const targetSlug = event.slug || event.id || 'my-event';

  let payloadQuery = '';
  try {
    const minPayload = {
      t: event.title,
      g: event.tagline,
      d: event.description,
      p: event.posterUrl,
      s: event.startDate,
      e: event.endDate,
      v: event.venue,
      a: event.address,
      c: event.primaryCtaText,
      u: event.primaryCtaUrl,
      th: event.themeId,
      ac: event.customAccentColor,
      bg: event.bgSvgPattern && event.bgSvgPattern.length < 100 ? event.bgSvgPattern : '',
      cn: committee.name || '',
      ch: committee.handle || '',
      cl: committee.logoUrl || '',
      l: (event.links || []).map(link => ({
        id: link.id,
        t: link.title,
        u: link.url,
        i: link.icon,
        d: link.description || '',
        tp: link.type || 'custom',
        f: link.featured ? 1 : 0
      }))
    };
    const encoded = safeBtoa(JSON.stringify(minPayload));
    if (encoded) payloadQuery = `?d=${encoded}`;
  } catch (e) {}

  // Clean, high-contrast, instant-scannable public URL for camera scanners
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/events/${targetSlug}${payloadQuery}`
    : `https://campuslink.app/events/${targetSlug}${payloadQuery}`;

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const generateQr = async () => {
      try {
        const qrFn = (QRCode as any)?.toDataURL || (QRCode as any)?.default?.toDataURL;
        if (typeof qrFn === 'function') {
          const url = await qrFn(publicUrl, {
            width: 400,
            margin: 4,
            color: {
              dark: frameStyle === 'dark' ? '#00f0ff' : '#000000',
              light: frameStyle === 'dark' ? '#090d16' : '#ffffff'
            },
            errorCorrectionLevel: 'H'
          });
          if (isMounted) setDataUrl(url);
        } else {
          // Fallback to QR server API if local canvas fails
          const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=4&data=${encodeURIComponent(publicUrl)}`;
          if (isMounted) setDataUrl(fallbackUrl);
        }
      } catch (err) {
        console.error('QR code generation error:', err);
        const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=4&data=${encodeURIComponent(publicUrl)}`;
        if (isMounted) setDataUrl(fallbackUrl);
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
      <div className="space-y-6 text-center">
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
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive ? btnActive : btnInactive
                }`}
              >
                {styleLabel}
              </button>
            );
          })}
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

          <p className="mt-1.5 text-[11px] font-mono opacity-70">
            campuslink.app/@{committee.handle || 'org'}/{targetSlug}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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


