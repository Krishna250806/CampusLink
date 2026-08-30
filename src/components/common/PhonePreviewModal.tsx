import React from 'react';
import { Modal } from './Modal';
import { PhoneMockup } from '../phone/PhoneMockup';
import { PublicEventPage } from '../../pages/PublicEventPage';
import type { Event, Committee } from '../../types/campuslink';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PhonePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  committee: Committee;
}

export const PhonePreviewModal: React.FC<PhonePreviewModalProps> = ({
  isOpen,
  onClose,
  event,
  committee
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !event) return null;

  const liveUrl = `${window.location.origin}/events/${event?.slug || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    toast.success('Live event URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Mobile Phone View" maxWidth="lg">
      <div className="space-y-6 text-center">
        <p className="text-xs text-zinc-400">
          This is how attendees will see your event on their mobile devices when scanning your QR code or visiting your link.
        </p>

        {/* Live Phone Frame Container */}
        <div className="flex justify-center py-4 bg-neutral-950/80 rounded-3xl border border-white/10 shadow-inner">
          <PhoneMockup urlHandle={`/@${committee?.handle || 'my-org'}/${event?.slug || 'my-event'}`}>
            <PublicEventPage isPreview={true} customEvent={event} />
          </PhoneMockup>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Live Link'}
          </button>

          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            <ExternalLink className="w-4 h-4" /> Open Fullscreen Tab
          </a>
        </div>
      </div>
    </Modal>
  );
};
