import React, { useState } from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import { DynamicIcon } from '../../components/common/DynamicIcon';
import type { LinkType } from '../../types/campuslink';
import { Plus, ArrowUp, ArrowDown, Eye, EyeOff, Star, Trash2 } from 'lucide-react';

export const LinksTab: React.FC = () => {
  const { activeEvent, addLink, updateLink, deleteLink, reorderLinks } = useCampusLink();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LinkType>('registration');
  const [featured, setFeatured] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    addLink(activeEvent.id, {
      title,
      url,
      description,
      icon: 'Link',
      type,
      featured,
      visible: true,
      sortOrder: activeEvent.links.length + 1
    });

    setTitle('');
    setUrl('');
    setDescription('');
    setShowAddForm(false);
  };

  const sortedLinks = [...activeEvent.links].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100">Links & Resources</h2>
          <p className="text-xs text-slate-400">Reorder cards using up/down buttons, toggle visibility, or highlight featured CTAs.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-950" /> Add New Resource Link
        </button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold font-heading text-white">Create Resource Card</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 📜 Rulebook & Guidelines"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target URL *</label>
              <input
                type="text"
                required
                placeholder="https://... or #rulebook"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100 focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Short Subtitle / Description</label>
            <input
              type="text"
              placeholder="e.g. Code of conduct, submission formats, and rubrics"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Link Category</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as LinkType)}
                  className="px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-200"
                >
                  <option value="registration">Registration</option>
                  <option value="schedule">Schedule</option>
                  <option value="rulebook">Rulebook</option>
                  <option value="venue">Venue Map</option>
                  <option value="whatsapp">WhatsApp Group</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube Teaser</option>
                  <option value="contact">Contact Support</option>
                  <option value="custom">Custom Link</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer pt-4">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="rounded bg-neutral-950 border-white/10 text-zinc-100"
                />
                <span>Highlight as Featured Link</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Save Link Card
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Links Reorder List */}
      <div className="space-y-3">
        {sortedLinks.map((link, index) => (
          <div
            key={link.id}
            className={`p-4 bg-neutral-900 border rounded-2xl transition-all flex items-center justify-between gap-4 border-white/10 ${
              !link.visible ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Up / Down Controls */}
              <div className="flex flex-col gap-1 text-slate-400">
                <button
                  disabled={index === 0}
                  onClick={() => reorderLinks(activeEvent.id, link.id, 'up')}
                  className="p-1 hover:text-white hover:bg-neutral-800 rounded disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === sortedLinks.length - 1}
                  onClick={() => reorderLinks(activeEvent.id, link.id, 'down')}
                  className="p-1 hover:text-white hover:bg-neutral-800 rounded disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-center text-white flex-shrink-0">
                <DynamicIcon name={link.icon} className="w-4.5 h-4.5" />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100 truncate">{link.title}</h4>
                  {link.featured && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-400 truncate">{link.url}</p>
              </div>
            </div>

            {/* Actions: Visibility toggle, Featured toggle, Delete */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 hidden sm:inline">{link.clickCount} taps</span>

              <button
                onClick={() => updateLink(activeEvent.id, link.id, { featured: !link.featured })}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  link.featured ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400' : 'bg-neutral-950 border-white/10 text-white/70 hover:text-amber-300'
                }`}
                title="Toggle Featured"
              >
                <Star className="w-4 h-4" />
              </button>

              <button
                onClick={() => updateLink(activeEvent.id, link.id, { visible: !link.visible })}
                className="p-2 bg-neutral-950 border border-white/10 text-slate-400 hover:text-slate-100 rounded-xl"
                title="Toggle Visibility"
              >
                {link.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
              </button>

              <button
                onClick={() => deleteLink(activeEvent.id, link.id)}
                className="p-2 bg-neutral-950 border border-white/10 text-slate-400 hover:text-rose-400 rounded-xl"
                title="Delete Link"
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
