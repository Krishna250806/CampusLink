import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import { Eye, MousePointerClick, UserPlus, TrendingUp, Flame, QrCode, Share2, ExternalLink, Calendar, Plus } from 'lucide-react';

export const OverviewTab: React.FC<{
  onOpenQr: () => void;
  onOpenShare: () => void;
  onOpenPhonePreview: () => void;
}> = ({
  onOpenQr,
  onOpenShare,
  onOpenPhonePreview
}) => {
  const { activeEvent, activeCommittee, analytics } = useCampusLink();
  const navigate = useNavigate();

  if (!activeEvent) {
    return (
      <div className="p-8 sm:p-12 bg-neutral-900 border border-white/10 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-emerald-400">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-heading text-white">Your Workspace is Ready!</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          You don't have any active events in your committee workspace yet. Create your first event to launch your microsite!
        </p>
        <button
          onClick={() => navigate('/dashboard/builder')}
          className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>
    );
  }

  const conversionRate = analytics.totalViews > 0
    ? ((analytics.totalRegClicks / analytics.totalViews) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Active Event Banner Card */}
      <div className="p-6 sm:p-8 bg-neutral-900 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 min-w-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              LIVE EVENT
            </span>
            <span className="text-xs font-mono text-zinc-400 font-semibold">/@{activeCommittee.handle}/{activeEvent.slug}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white truncate">{activeEvent.title}</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium italic">"{activeEvent.tagline}"</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto z-10">
          <button
            onClick={() => navigate(`/dashboard/builder/${activeEvent.id}`)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl shadow-[inset_0_2px_0_0_rgba(255,255,255,1)] transition-all active:scale-95 cursor-pointer"
          >
            Edit Event
          </button>
          
          <button
            onClick={onOpenQr}
            className="p-2.5 glass-panel hover:bg-white/10 text-slate-200 border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-white" /> QR Code
          </button>

          <button
            onClick={onOpenShare}
            className="p-2.5 glass-panel hover:bg-white/10 text-slate-200 border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-white" /> Share
          </button>

          <button
            onClick={onOpenPhonePreview}
            className="p-2.5 glass-panel hover:bg-white/10 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-white" /> View Live Page
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Views Card */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Page Views</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-800 text-white border border-white/10 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white">{analytics.totalViews.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this week
          </span>
        </div>

        {/* Link Clicks */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resource Link Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-800 text-white border border-white/10 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white">{analytics.totalLinkClicks.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-mono">across {activeEvent.links.length} link cards</span>
        </div>

        {/* Registration CTA Clicks */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registration Taps</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white">{analytics.totalRegClicks.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">{conversionRate}% conversion rate</span>
        </div>

        {/* Top Link */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Performing Link</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-white truncate">{analytics.topLinkTitle}</p>
          <span className="text-[11px] text-slate-400 font-mono">0 direct taps</span>
        </div>
      </div>
    </div>
  );
};
