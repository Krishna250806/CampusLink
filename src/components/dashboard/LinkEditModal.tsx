import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { EventLink } from '../../types/campuslink';

interface LinkEditModalProps {
  links: EventLink[];
  onClose: () => void;
  onSave: (updatedLinks: EventLink[]) => void;
}

const urlPattern = /^(https?:\/\/)?(www\.)?[^\s]+$/i;

const LinkEditModal: React.FC<LinkEditModalProps> = ({ links, onClose, onSave }) => {
  const [editedLinks, setEditedLinks] = useState<EventLink[]>(links);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, field: keyof EventLink, value: string) => {
    setEditedLinks(prev =>
      prev.map(l => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleSave = () => {
    // simple validation for URLs
    for (const l of editedLinks) {
      if (!urlPattern.test(l.url)) {
        setError('One or more URLs are invalid. Include http(s):// or www.');
        return;
      }
    }
    setError(null);
    onSave(editedLinks);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-96 max-w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Edit Links</h3>
        {editedLinks.map(link => (
          <div key={link.id} className="mb-3 space-y-1">
            <input
              type="text"
              value={link.title}
              onChange={e => handleChange(link.id, 'title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100"
              placeholder="Link title"
            />
            <input
              type="text"
              value={link.url}
              onChange={e => handleChange(link.id, 'url', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-100"
              placeholder="URL (http:// or https:// or www.)"
            />
          </div>
        ))}
        {error && <p className="text-rose-400 text-sm mb-2">{error}</p>}
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
};

export default LinkEditModal;
