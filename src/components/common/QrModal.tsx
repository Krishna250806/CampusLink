import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from './Modal';
import type { Event, Committee } from '../../types/campuslink';
import { Download, Printer, Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  committee: Committee;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  event,
  committee
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [frameStyle, setFrameStyle] = useState<'minimal' | 'poster' | 'dark'>('poster');

  const publicUrl = `${window.location.origin}/events/${event.slug}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: frameStyle === 'dark' ? '#00f0ff' : '#0f172a',
        light: frameStyle === 'dark' ? '#090d16' : '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        setDataUrl(url);
      })
      .catch(err => {
        console.error('QR code generation failed:', err);
      });
  }, [isOpen, publicUrl, frameStyle]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${committee.handle}-${event.slug}-qr.png`;
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
              src={committee.logoUrl}
              alt={committee.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
            />
            <div className="text-left">
              <p className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">{committee.name}</p>
              <h4 className="text-xl font-black font-heading leading-tight">{event.title}</h4>
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
            campuslink.app/@{committee.handle}/{event.slug}
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
            className="flex items-center gap-2 px-4.5 py-3 glass-panel hover:bg-white/10 text-slate-200 font-bold text-xs rounded-xl border border-white/15 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link!' : 'Copy Public URL'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4.5 py-3 glass-panel hover:bg-white/10 text-slate-200 font-bold text-xs rounded-xl border border-white/15 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print Poster QR
          </button>
        </div>
      </div>
    </Modal>
  );
};

