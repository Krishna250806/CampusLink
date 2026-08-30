import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
  title?: string;
  urlHandle?: string;
  themeId?: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  urlHandle = '@my-org/my-event'
}) => {
  return (
    <div className="relative mx-auto w-[330px] h-[670px] sm:w-[370px] sm:h-[730px] bg-neutral-900 rounded-[50px] p-3.5 shadow-2xl ring-1 ring-white/10 flex flex-col justify-between select-none transform transition-all duration-300">
      {/* Outer Frame Ambient Glow */}
      <div className="absolute -inset-1 rounded-[54px] bg-white/5 blur-xl opacity-75 -z-10 pointer-events-none animate-pulse-glow" />

      {/* Titanium Bezel Edge Highlight */}
      <div className="absolute inset-0 rounded-[50px] border border-white/15 pointer-events-none z-30" />

      {/* Dynamic Island / Speaker Notch */}
      <div className="absolute top-4.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md border border-neutral-800">
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 ring-1 ring-neutral-800" />
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Phone Screen Container */}
      <div className="relative w-full h-full bg-neutral-950 rounded-[40px] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        {/* Top Status & URL Bar */}
        <div className="pt-6 pb-2.5 px-4 bg-neutral-950/90 backdrop-blur-xl border-b border-white/10 z-30 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-tight">9:41</span>
          <div className="px-3 py-1 bg-neutral-900 border border-white/10 rounded-full text-[10px] font-mono text-zinc-300 truncate max-w-[170px] text-center shadow-inner">
            {urlHandle}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold font-mono text-zinc-400">5G</span>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="phone-screen flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
};
