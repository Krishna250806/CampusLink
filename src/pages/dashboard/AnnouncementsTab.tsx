import React, { useState } from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import { Megaphone, Plus, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';

export const AnnouncementsTab: React.FC = () => {
  const { activeEvent, addAnnouncement, toggleAnnouncement, deleteAnnouncement } = useCampusLink();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addAnnouncement(activeEvent.id, {
      title,
      description,
      url,
      date: new Date().toISOString().slice(0, 10),
      active: true
    });

    setTitle('');
    setDescription('');
    setUrl('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-100">Event Announcements</h2>
        <p className="text-xs text-slate-400">Post urgent updates, schedule changes, or prize reveals as a compact 📢 banner on your public event page.</p>
      </div>

      {/* New Announcement Form */}
      <form onSubmit={handleCreate} className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold font-heading text-slate-200 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-400" /> Create Announcement Banner
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. 📢 Hackathon Submissions Extended by 2 Hours!"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Details *</label>
          <textarea
            required
            rows={2}
            placeholder="e.g. Final deadline for Devpost commits is now 6:00 PM."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Optional Action Link URL</label>
          <input
            type="text"
            placeholder="https://devpost.com/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100 focus:border-zinc-400"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-neutral-950" /> Broadcast Announcement
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Broadcasting History ({activeEvent.announcements.length})
        </h3>

        {activeEvent.announcements.map(ann => (
          <div
            key={ann.id}
            className={`p-4 bg-neutral-900 border rounded-2xl flex items-start justify-between gap-4 border-white/10 ${
              ann.active ? 'bg-amber-950/20 border-amber-500/30' : 'opacity-60'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100 truncate">{ann.title}</h4>
                {ann.active && (
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Active Banner
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-500">{ann.date}</span>
              </div>
              <p className="text-xs text-slate-300">{ann.description}</p>
              {ann.url && (
                <a href={ann.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-300 hover:underline flex items-center gap-1">
                  Link attached <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleAnnouncement(activeEvent.id, ann.id)}
                className="p-2 bg-neutral-950 border border-white/10 text-slate-400 hover:text-slate-100 rounded-xl cursor-pointer"
                title="Toggle Banner Visibility"
              >
                {ann.active ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              </button>
              <button
                onClick={() => deleteAnnouncement(activeEvent.id, ann.id)}
                className="p-2 bg-neutral-950 border border-white/10 text-slate-400 hover:text-rose-400 rounded-xl cursor-pointer"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
