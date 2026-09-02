import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampusLink, DEFAULT_FALLBACK_COMMITTEE } from '../context/CampusLinkContext';
import { ShieldCheck, Calendar, ExternalLink, ArrowLeft, Sparkles, Globe, MessageSquare, Share2, Search } from 'lucide-react';

export const PublicCommitteePage: React.FC = () => {
  const { handle } = useParams<{ handle?: string }>();
  const { committees, events, allCommittees, allEvents, activeCommittee } = useCampusLink();
  const [activeTab, setActiveTab] = useState<'events' | 'about'>('events');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-refetch trigger on visibility / focus / periodic interval so open tabs stay 100% synced with dashboard edits
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);
    const timer = setInterval(handleUpdate, 3000);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const targetHandle = (handle || '').toLowerCase().replace(/^@/, '');
  const committeeList = allCommittees && allCommittees.length > 0 ? allCommittees : committees;
  const eventList = allEvents && allEvents.length > 0 ? allEvents : events;

  const committee = committeeList.find(c => c.handle.toLowerCase() === targetHandle)
    || (activeCommittee && activeCommittee.handle.toLowerCase() === targetHandle ? activeCommittee : undefined)
    || committeeList.find(c => c.id !== 'comm_main')
    || activeCommittee
    || committeeList[0]
    || DEFAULT_FALLBACK_COMMITTEE;

  const rawLogo = committee?.logoUrl || DEFAULT_FALLBACK_COMMITTEE.logoUrl;
  const committeeLogo = (rawLogo && rawLogo.startsWith('http'))
    ? `${rawLogo}${rawLogo.includes('?') ? '&' : '?'}v=${committee?.updatedAt || Date.now()}`
    : (rawLogo || DEFAULT_FALLBACK_COMMITTEE.logoUrl);

  const committeeEvents = eventList.filter(e => 
    (e.committeeId === committee.id || (committee.handle && e.slug?.startsWith(committee.handle))) && 
    (e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 pb-20">
      {/* Cover Header */}
      <div className="relative h-64 sm:h-80 w-full bg-neutral-900 overflow-hidden border-b border-white/10">
        {committee.coverUrl && (
          <img src={committee.coverUrl} alt={committee.name} className="w-full h-full object-cover opacity-40 mix-blend-overlay transform scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
        <div className="absolute top-4 left-4 right-4 max-w-4xl mx-auto flex items-center justify-between z-20">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950/80 hover:bg-neutral-900 backdrop-blur-xl rounded-full text-xs font-bold text-slate-200 border border-white/10 transition-all shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CampusLink
          </Link>
          <span className="px-3 py-1 bg-white/10 text-zinc-300 border border-white/15 rounded-full text-xs font-mono font-bold backdrop-blur-md">
            Verified Organization
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 -mt-24 relative z-10 space-y-8">
        {/* Profile Card Header */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={committeeLogo}
                alt={committee.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_COMMITTEE.logoUrl;
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-2xl bg-neutral-900"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-zinc-100 text-neutral-950 flex items-center justify-center shadow-lg border border-white/20">
                <Sparkles className="w-4 h-4 text-neutral-950 fill-neutral-950" />
              </div>
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">{committee.name}</h1>
                {committee.verified && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
              </div>
              <p className="text-xs font-mono text-zinc-400 font-bold">campuslink.app/@{committee.handle}</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium italic">{committee.tagline}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-4 border-t border-white/10 font-sans">
            {committee.description}
          </p>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
            {committee.socials.instagram && (
              <a
                href={committee.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-slate-200 rounded-xl transition-all border border-white/10 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-300" /> Instagram
              </a>
            )}
            {committee.socials.linkedin && (
              <a
                href={committee.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-slate-200 rounded-xl transition-all border border-white/10 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-300" /> LinkedIn
              </a>
            )}
            {committee.socials.website && (
              <a
                href={committee.socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-slate-200 rounded-xl transition-all border border-white/10 shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Website
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'events' ? 'bg-zinc-100 text-neutral-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Events ({committeeEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'about' ? 'bg-zinc-100 text-neutral-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              About Committee
            </button>
          </div>

          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {committeeEvents.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-3xl space-y-2">
                <Calendar className="w-8 h-8 text-zinc-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Events Published</h3>
                <p className="text-xs text-slate-400">This organization has not published any active fest pages yet.</p>
              </div>
            ) : (
              committeeEvents.map(evt => (
                <Link
                  key={evt.id}
                  to={`/@${committee.handle}/${evt.slug}`}
                  className="p-5 glass-panel rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-white/20 transition-all block border border-white/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">PUBLISHED</span>
                      <span className="text-[10px] font-mono text-zinc-400">{new Date(evt.startDate).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">{evt.title}</h3>
                    <p className="text-xs text-slate-300 italic">{evt.tagline}</p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1 group-hover:scale-105 transition-transform flex-shrink-0">
                    <span>View Event</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-950" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-white">About {committee.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{committee.description}</p>
            <div className="pt-2 text-xs font-mono text-zinc-400">
              <span>Handle: /@{committee.handle}</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
