import React from 'react';
import { ArrowRight, ArrowUpRight, Sparkles, MessageCircle, Box, Footprints, Sliders } from 'lucide-react';

interface ShowcaseHeroProps {
  onToggleInteractiveWorld: () => void;
  onWalkInStudio?: () => void;
  onOpenDeskStudio?: () => void;
}

export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({
  onToggleInteractiveWorld,
  onWalkInStudio,
  onOpenDeskStudio,
}) => (
  <header className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/70">
    <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
      {/* Bali Villa Delivery Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-6 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Next-day white glove delivery to Canggu, Pererenan, Ubud & Uluwatu</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 max-w-4xl leading-[1.08]">
        Work from your Bali villa <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-emerald-700">
          without the back pain.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mt-5 font-normal leading-relaxed">
        Stop hunched-over laptop work on uncomfortable dining chairs. Rent motorized standing desks,
        Herman Miller seating, and 4K displays on flexible weekly or monthly subscriptions.
      </p>

      {/* Action Triggers */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {onOpenDeskStudio && (
          <button
            onClick={onOpenDeskStudio}
            className="apple-press group w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
            <span>Build Desk Studio (3D)</span>
            <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <button
          onClick={onToggleInteractiveWorld}
          className="apple-press group w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-950 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Room Builder</span>
        </button>

        {onWalkInStudio && (
          <button
            onClick={onWalkInStudio}
            className="apple-press w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Footprints className="w-4 h-4 text-emerald-200" />
            <span>Walk in 3D Studio</span>
          </button>
        )}

        <a
          href="https://wa.me/6281234567890?text=Hi%20Monis%20Team!%20I%20am%20interested%20in%20renting%20ergonomic%20workstation%20equipment%20for%20my%20villa."
          target="_blank"
          rel="noopener noreferrer"
          className="apple-press w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Chat WhatsApp</span>
        </a>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">✓ No deposit lock-in</span>
        <span>·</span>
        <span className="flex items-center gap-1">✓ Assembled in 15 mins</span>
        <span>·</span>
        <span className="flex items-center gap-1">✓ Free ergonomic swap</span>
      </div>

      {/* Interactive 3D Teaser Card */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Open the interactive 3D room builder"
        onClick={onToggleInteractiveWorld}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleInteractiveWorld();
          }
        }}
        className="apple-press group relative w-full max-w-4xl mt-12 sm:mt-16 rounded-3xl overflow-hidden bg-white border border-slate-200 cursor-pointer shadow-xl transition hover:shadow-2xl hover:border-slate-300"
      >
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-black" />

          {/* Grid Lines Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content Overlay */}
          <div className="relative z-10 text-center space-y-3 px-6 py-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
              🏡
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold mb-2">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>INTERACTIVE 3D SIMULATOR</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Test Fits & Furniture Spacing Before You Rent
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 font-medium">
                Customize your room width and length, drag and drop standing desks, chairs, and monitors with smart magnetic centering.
              </p>
            </div>

            <div className="pt-2">
              <span className="apple-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs shadow-md group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                <span>Click to Enter 3D Room Builder</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Bottom Feature Badges */}
          <div className="absolute bottom-4 left-4 right-4 hidden sm:flex items-center justify-between text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <Box className="w-3 h-3 text-cyan-400" />
              <span>¼-Tile (25cm) Precision Grid</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Real Scraped Monis Fleet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);
