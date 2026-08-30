import React from 'react';
import { useCampusLink } from '../../context/CampusLinkContext';
import { Eye, MousePointerClick, UserPlus, ShieldCheck, TrendingUp } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { activeEvent, analytics } = useCampusLink();

  if (!activeEvent) {
    return (
      <div className="p-8 sm:p-12 bg-neutral-900 border border-white/10 rounded-3xl text-center space-y-3 shadow-xl">
        <h3 className="text-lg font-bold font-heading text-white">No Active Event</h3>
        <p className="text-xs text-zinc-400">Build an event first to view visitor analytics and click rates.</p>
      </div>
    );
  }

  const sortedLinks = [...(activeEvent.links || [])].sort(
    (a, b) => (analytics.linkClicksById[b.id] || 0) - (analytics.linkClicksById[a.id] || 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-100">Event Analytics</h2>
          <p className="text-xs text-slate-400">Aggregate engagement stats for {activeEvent.title}.</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacy-First • No Cross-Site Cookies
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Unique Page Views</span>
            <Eye className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-100">{analytics.totalViews.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> High traffic spike on launch
          </span>
        </div>

        <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resource Link Clicks</span>
            <MousePointerClick className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-100">{analytics.totalLinkClicks.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Average 1.8 taps per visitor</span>
        </div>

        <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registration Conversions</span>
            <UserPlus className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-100">{analytics.totalRegClicks.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">{analytics.engagementRate}% overall engagement</span>
        </div>
      </div>

      {/* Per-Link Breakdown Table */}
      <div className="p-6 bg-neutral-900 border border-white/10 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-base font-bold font-heading text-slate-100">Per-Link Tap Performance</h3>

        <div className="space-y-3">
          {sortedLinks.map(link => {
            const clicks = analytics.linkClicksById[link.id] || link.clickCount || 0;
            const percent = analytics.totalLinkClicks > 0
              ? Math.round((clicks / analytics.totalLinkClicks) * 100)
              : 0;

            return (
              <div key={link.id} className="p-4 bg-neutral-950 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-100">{link.title}</span>
                  <span className="font-mono text-zinc-300">{clicks.toLocaleString()} taps ({percent}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div style={{ width: `${percent}%` }} className="h-full bg-zinc-100 rounded-full transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
