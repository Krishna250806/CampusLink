import React from 'react';
import { GraduationCap, Calendar, LayoutDashboard, LogIn, ArrowRight } from 'lucide-react';
import type { UserSession } from '../../types/campuslink';

interface NavbarProps {
  currentView: 'landing' | 'public' | 'dashboard' | 'auth';
  onNavigate: (view: 'landing' | 'public' | 'dashboard' | 'auth') => void;
  session: UserSession;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, session, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex cursor-pointer items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-neutral-950 shadow-md shadow-white/10 group-hover:scale-105 transition-transform border border-white/20">
            <GraduationCap className="h-5 w-5 text-neutral-950 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white font-['Space_Grotesk']">
                Campus<span className="text-zinc-400">Link</span>
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-white/15">
                v2.0 PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">One link for your entire college fest</p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Public Demo Hub Link */}
          <button
            onClick={() => onNavigate('public')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
              currentView === 'public'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span>Live Demo</span>
          </button>

          {/* Organizer Dashboard Link */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
              currentView === 'dashboard'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 text-zinc-300" />
            <span className="hidden sm:inline">Organizer</span> Dashboard
          </button>

          {/* Auth State Button */}
          {session.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 font-mono">
                👤 {session.name}
              </span>
              <button
                onClick={onLogout}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs sm:text-sm font-bold text-neutral-950 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <LogIn className="h-4 w-4 text-neutral-950" />
              <span>Login / Create</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-950 hidden sm:inline" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
