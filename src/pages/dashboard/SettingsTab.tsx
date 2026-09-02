import React, { useState, useEffect } from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import { Save, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '../../utils/imageCompressor';

const RESERVED_HANDLES = ['admin', 'api', 'dashboard', 'login', 'signup', 'auth', 'settings', 'help', 'app'];

export const SettingsTab: React.FC = () => {
  const { activeCommittee, updateCommittee } = useCampusLink();

  const [name, setName] = useState(activeCommittee.name);
  const [handle, setHandle] = useState(activeCommittee.handle);
  const [tagline, setTagline] = useState(activeCommittee.tagline);
  const [logoUrl, setLogoUrl] = useState(activeCommittee.logoUrl);
  const [coverUrl, setCoverUrl] = useState(activeCommittee.coverUrl || '');
  const [description, setDescription] = useState(activeCommittee.description);
  const [instagram, setInstagram] = useState(activeCommittee.socials.instagram || '');
  const [website, setWebsite] = useState(activeCommittee.socials.website || '');
  
  const [handleError, setHandleError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeCommittee) {
      setName(activeCommittee.name || '');
      setHandle(activeCommittee.handle || '');
      setTagline(activeCommittee.tagline || '');
      setLogoUrl(activeCommittee.logoUrl || '');
      setCoverUrl(activeCommittee.coverUrl || '');
      setDescription(activeCommittee.description || '');
      setInstagram(activeCommittee.socials?.instagram || '');
      setWebsite(activeCommittee.socials?.website || '');
    }
  }, [activeCommittee.id, activeCommittee.name, activeCommittee.handle, activeCommittee.logoUrl]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    maxW = 400,
    maxH = 400
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, maxW, maxH);
        setter(compressed);
        toast.success('Image uploaded & optimized successfully!');
      } catch (err) {
        console.error('Image compression failed:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setter(event.target.result as string);
            toast.success('Local image uploaded!');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (RESERVED_HANDLES.includes(cleanHandle)) {
      setHandleError(`"${cleanHandle}" is a reserved system handle and cannot be used.`);
      return;
    }
    setHandleError('');

    updateCommittee(activeCommittee.id, {
      name,
      handle: cleanHandle,
      tagline,
      logoUrl,
      coverUrl,
      description,
      socials: {
        ...activeCommittee.socials,
        instagram,
        website
      }
    });

    setSaved(true);
    toast.success('Committee profile saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-100">Committee Profile Settings</h2>
        <p className="text-xs text-slate-400">Configure your permanent campus org handle (`/@{activeCommittee.handle}`), logo, cover image, and socials.</p>
      </div>

      <form onSubmit={handleSave} className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Committee Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Unique Org Handle (@handle) *</label>
            <div className="flex">
              <span className="px-3 py-2.5 bg-neutral-950 border border-r-0 border-white/10 rounded-l-xl text-xs font-mono text-slate-400">
                /@
              </span>
              <input
                type="text"
                required
                value={handle}
                onChange={e => setHandle(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-r-xl text-xs font-mono text-slate-100 focus:border-zinc-400"
              />
            </div>
            {handleError && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {handleError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline / Motto</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
          />
        </div>

        {/* Local File Upload + URL for Committee Logo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Committee Logo Image</label>
          <div className="flex items-center gap-3">
            <img
              src={logoUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="%236366f1" style="background:%2309090b;padding:24px;border-radius:24px"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'}
              alt="Logo preview"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="%236366f1" style="background:%2309090b;padding:24px;border-radius:24px"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';
              }}
              className="w-14 h-14 rounded-2xl object-cover border border-white/20 flex-shrink-0 bg-black"
            />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://... or upload local image"
                className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm">
                <Upload className="w-3.5 h-3.5 text-neutral-950" />
                <span>Upload Logo From Computer</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFileUpload(e, setLogoUrl)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Local File Upload + URL for Cover Banner */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Committee Cover Banner Image</label>
          <div className="space-y-2">
            {coverUrl && <img src={coverUrl} alt="Cover preview" className="w-full h-24 rounded-2xl object-cover border border-white/10" />}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                placeholder="Banner Image URL or upload local file"
                className="flex-1 px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border border-white/10">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-300" />
                <span>Upload Cover Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFileUpload(e, setCoverUrl)}
                />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">About / Bio Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-slate-100 focus:border-zinc-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram URL</label>
            <input
              type="text"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100 focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs font-mono text-slate-100 focus:border-zinc-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 text-neutral-950" /> {saved ? 'Settings Saved!' : 'Save Committee Settings'}
          </button>
        </div>
      </form>

    </div>
  );
};
