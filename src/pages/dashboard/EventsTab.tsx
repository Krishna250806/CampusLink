import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import { Plus, Edit3, Trash2, MapPin, ExternalLink, CheckCircle2, QrCode } from 'lucide-react';
import { QrModal } from '../../components/common/QrModal';
import type { Event } from '../../types/campuslink';

export const EventsTab: React.FC = () => {
  const { events, activeCommittee, activeEvent, setActiveEventId, deleteEvent } = useCampusLink();
  const navigate = useNavigate();

  const [selectedQrEvent, setSelectedQrEvent] = useState<Event | null>(null);

  const committeeEvents = events.filter(e => e.committeeId === activeCommittee.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100">Committee Events</h2>
          <p className="text-xs text-slate-400">Manage, create, and publish event microsites for @{activeCommittee.handle}.</p>
        </div>

        <button
          onClick={() => navigate('/dashboard/builder')}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-950" /> Create New Event
        </button>
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {committeeEvents.map(evt => {
          const isActive = evt.id === activeEvent.id;
          return (
            <div
              key={evt.id}
              onClick={() => {
                setActiveEventId(evt.id);
                navigate(`/dashboard/builder/${evt.id}`);
              }}
              className={`p-5 rounded-3xl border transition-all cursor-pointer hover:border-white/30 ${
                isActive
                  ? 'bg-neutral-900 border-white/20 ring-1 ring-white/20 shadow-xl'
                  : 'bg-neutral-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={evt.posterUrl}
                  alt={evt.title}
                  className="w-24 h-24 rounded-2xl object-cover border border-white/10 flex-shrink-0 bg-neutral-950"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                      isActive ? 'bg-zinc-100 text-neutral-950 shadow-sm' : 'bg-neutral-800 text-white/70'
                    }`}>
                      {isActive ? 'Active Target' : evt.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(evt.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-100 truncate group-hover:text-emerald-400 transition-colors">{evt.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{evt.tagline}</p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                {!isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEventId(evt.id);
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
                  >
                    Set Active
                  </button>
                )}
                {isActive && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Active Target
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQrEvent(evt);
                    }}
                    className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Get Event QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <a
                    href={`/events/${evt.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title="View Live Event"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/builder/${evt.id}`);
                    }}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                    title="Edit Event Builder"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${evt.title}?`)) {
                        deleteEvent(evt.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded QR Modal */}
      <QrModal
        isOpen={selectedQrEvent !== null}
        onClose={() => setSelectedQrEvent(null)}
        event={selectedQrEvent}
        committee={activeCommittee}
      />
    </div>
  );
};
