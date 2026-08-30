import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#07090c] py-12 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-white font-['Space_Grotesk']">CampusLink</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              The ultimate single link hub for college fest committees, technical clubs, esports tournaments, and campus events. Replaces scattered Google Forms & PDFs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All Systems Operational • Live v2.4</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="font-semibold text-white text-sm font-['Space_Grotesk'] mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#demo" className="hover:text-white transition-colors">Public Link Hub (@handle)</a></li>
              <li><a href="#dashboard" className="hover:text-white transition-colors">Organizer Admin Panel</a></li>
              <li><a href="#qr" className="hover:text-white transition-colors">Digital QR Pass Generator</a></li>
              <li><a href="#scanner" className="hover:text-white transition-colors">Entry Door Scanner</a></li>
              <li><a href="#theme" className="hover:text-white transition-colors">Custom Themes & Branding</a></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="font-semibold text-white text-sm font-['Space_Grotesk'] mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#rulebooks" className="hover:text-white transition-colors">Sample Rulebooks</a></li>
              <li><a href="#whatsapp" className="hover:text-white transition-colors">WhatsApp Hub Integration</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">Fest Organizer Playbook</a></li>
              <li><a href="#support" className="hover:text-white transition-colors">Campus Ambassador Network</a></li>
            </ul>
          </div>

          {/* Col 4: Socials & Tech */}
          <div>
            <h4 className="font-semibold text-white text-sm font-['Space_Grotesk'] mb-3">Connect</h4>
            <div className="flex gap-3 text-gray-400 mb-4">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
            <p className="text-[11px] text-gray-500">Built with React, Vite & Tailwind CSS for student communities.</p>
          </div>

        </div>

        <div className="mt-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 CampusLink Technologies. Empowering college student leaders everywhere.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
            <span>for tech fests & campus clubs.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
