import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampusLink } from '../../context/CampusLinkContext';
import { OverviewTab } from './OverviewTab';
import { EventsTab } from './EventsTab';
import { LinksTab } from './LinksTab';
import { AppearanceTab } from './AppearanceTab';
import { AnnouncementsTab } from './AnnouncementsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { TeamTab } from './TeamTab';
import { SettingsTab } from './SettingsTab';
import { QrModal } from '../../components/common/QrModal';
import { ShareModal } from '../../components/common/ShareModal';
import {
  LayoutDashboard,
  Calendar,
  Link as LinkIcon,
  Palette,
  Megaphone,
  BarChart3,
  Users,
  Settings,
  Plus,
  Sparkles,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, activeCommittee, activeEvent, events, setActiveEventId, logout } = useCampusLink();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'links' | 'appearance' | 'announcements' | 'analytics' | 'team' | 'settings'>('overview');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  const committeeEvents = events.filter(e => e.committeeId === activeCommittee.id);

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-white/10 flex flex-col justify-between flex-shrink-0 backdrop-blur-2xl">
        <div className="p-5 space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-zinc-100 text-neutral-950 flex items-center justify-center shadow-lg shadow-white/10 group-hover:scale-105 transition-transform border border-white/20">
                <Sparkles className="w-4.5 h-4.5 fill-neutral-950 text-neutral-950" />
              </div>
              <span className="text-lg font-black font-heading tracking-tight text-white">CampusLink</span>
            </Link>

            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-white/10 text-zinc-300 rounded-full border border-white/15">
              v2.0 PRO
            </span>
          </div>

          {/* Committee Switcher / Info */}
          <div className="p-3 bg-neutral-900/80 border border-white/10 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={activeCommittee.logoUrl} alt={activeCommittee.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate text-slate-100">{activeCommittee.name}</h4>
                <p className="text-[10px] font-mono text-zinc-400 truncate">/@{activeCommittee.handle}</p>
              </div>
            </div>
            {activeCommittee.verified && <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          </div>

          {/* Active Event Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="w-full p-3 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-2xl text-xs font-bold text-left flex items-center justify-between gap-2 shadow-sm transition-all cursor-pointer"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">Target Event</span>
                <span className="truncate block text-slate-100 font-semibold">{activeEvent.title}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showEventDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl z-40 p-1.5 space-y-1 backdrop-blur-xl">
                {committeeEvents.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setActiveEventId(evt.id);
                      setShowEventDropdown(false);
                    }}
                    className={`w-full p-2.5 text-left text-xs font-semibold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      evt.id === activeEvent.id ? 'bg-zinc-100 text-neutral-950 font-bold' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{evt.title}</span>
                    <span className="text-[10px] opacity-70 font-mono uppercase">{evt.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1.5 pt-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'links', label: 'Links & Modules', icon: LinkIcon },
              { id: 'appearance', label: 'Theme & Style', icon: Palette },
              { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-100 text-neutral-950 shadow-lg shadow-white/10 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatarUrl || activeCommittee.logoUrl}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Organizer'}</h4>
              <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email || 'organizer@campus.edu'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/12 shadow-sm">
              ORGANIZER DASHBOARD
            </span>
            <h1 className="text-2xl font-black font-heading text-slate-100 capitalize mt-1">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/builder')}
              className="px-4.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-[inset_0_2px_0_0_rgba(255,255,255,1),inset_0_-1px_0_0_rgba(0,0,0,0.2)] transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-neutral-950" /> Build New Event
            </button>

            <a
              href={`/@${activeCommittee.handle}/${activeEvent.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 glass-panel hover:bg-white/10 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> View Public Page
            </a>
          </div>
        </div>

        {/* Tab Router Render */}
        {activeTab === 'overview' && <OverviewTab onOpenQr={() => setIsQrOpen(true)} onOpenShare={() => setIsShareOpen(true)} />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'links' && <LinksTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'settings' && <SettingsTab />}

      </main>

      {/* QR Code & Share Modals */}
      <QrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} event={activeEvent} committee={activeCommittee} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} event={activeEvent} committee={activeCommittee} />

    </div>
  );
};

