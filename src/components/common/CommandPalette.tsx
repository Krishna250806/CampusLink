import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import {
  Search,
  Plus,
  Palette,
  BarChart3,
  ExternalLink,
  Sparkles,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { activeCommittee, activeEvent } = useCampusLink();

  // Toggle with ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const runCommand = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden glass-panel-elevated">
        <Command className="w-full">
          <div className="flex items-center border-b border-white/10 px-4 py-3">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search actions (⌘K)..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
            />
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">ESC</span>
          </div>

          <Command.List className="max-h-[340px] overflow-y-auto p-2 space-y-1 text-xs">
            <Command.Empty className="p-6 text-center text-slate-400 font-mono text-xs">
              No matching commands found.
            </Command.Empty>

            <Command.Group heading="Organizer Actions" className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-3 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/dashboard/builder'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-indigo-600 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Create / Build New Event</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/dashboard'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-indigo-600 cursor-pointer transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">View Analytics & Traffic</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/dashboard'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-indigo-600 cursor-pointer transition-colors"
              >
                <Palette className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">Customize Theme & Styles</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Shortcuts & Links" className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-3 py-1.5 pt-2">
              <Command.Item
                onSelect={() => runCommand(() => {
                  navigator.clipboard.writeText(`${window.location.origin}/@${activeCommittee.handle}/${activeEvent.slug}`);
                  toast.success("Event public URL copied to clipboard!");
                })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-indigo-600 cursor-pointer transition-colors"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Copy Event Link (/@{activeCommittee.handle}/{activeEvent.slug})</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => {
                  window.open(`/@${activeCommittee.handle}/${activeEvent.slug}`, '_blank');
                })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-indigo-600 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Open Live Microsite Page</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t border-white/10 px-4 py-2 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Tip: Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">⌘K</kbd> anywhere</span>
            <span className="flex items-center gap-1 text-indigo-400"><Sparkles className="w-3 h-3" /> CampusLink Command Bar</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
