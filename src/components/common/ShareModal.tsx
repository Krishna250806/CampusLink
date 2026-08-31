import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Event, Committee } from '../../types/campuslink';
import { Copy, Check, MessageCircle, ShieldAlert, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  committee: Committee;
}

const safeBtoa = (str: string) => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch (e) {
    return '';
  }
};

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  event,
  committee
}) => {
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');

  if (!isOpen || !event) return null;

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
      cn: committee?.name || '',
      ch: committee?.handle || '',
      cl: committee?.logoUrl || '',
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

  const publicUrl = `${window.location.origin}/events/${targetSlug}${payloadQuery}`;
  const whatsappText = encodeURIComponent(
    `Check out ${event?.title || 'Event'} by ${committee?.name || 'Committee'}!\n"${event?.tagline || ''}"\n\nRegister & Details: ${publicUrl}`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Event link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReported(true);
    toast.info("Report submitted to moderation team.");
    setTimeout(() => {
      setReported(false);
      setShowReportForm(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Event Link" maxWidth="md">
      <div className="space-y-6">
        {/* Social Card Preview */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
            Social Card Preview (WhatsApp / iMessage / Meta)
          </p>
          <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex gap-3.5 items-center shadow-lg">
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-20 h-20 rounded-xl object-cover border border-white/15 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400">
                campuslink.app/@{committee.handle}
              </span>
              <h4 className="text-sm font-black font-heading text-white truncate">{event.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{event.tagline} — {event.venue}</p>
            </div>
          </div>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Shareable Direct URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-400"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-neutral-950" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Quick Social Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://api.whatsapp.com/send?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-2xl font-bold text-xs transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
          </a>

          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast.success('Link copied! Ready to paste into Instagram Story sticker.');
            }}
            className="flex items-center justify-center gap-2 p-3.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 rounded-2xl font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4 text-white" /> Instagram Story
          </button>
        </div>

        {/* Trust & Abuse Moderation */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Verified CampusLink Page</span>
          {!showReportForm && (
            <button
              onClick={() => setShowReportForm(true)}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Report Page
            </button>
          )}
        </div>

        {showReportForm && (
          <form onSubmit={handleSendReport} className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl space-y-3">
            <p className="text-xs text-rose-300 font-bold">Report Inappropriate Content or Spam</p>
            <textarea
              required
              rows={2}
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Describe the issue (e.g., misleading information, spam)..."
              className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                {reported ? 'Report Submitted' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
