import React from 'react';
import { Footprints, LayoutGrid, Sparkles } from 'lucide-react';

interface ShowcaseNavProps {
  onToggleInteractiveWorld: () => void;
  onOpenAdmin: () => void;
  onWalkInStudio?: () => void;
  onOpenDeskStudio?: () => void;
}

export const ShowcaseNav: React.FC<ShowcaseNavProps> = ({
  onToggleInteractiveWorld,
  onOpenAdmin,
  onWalkInStudio,
  onOpenDeskStudio,
}) => (
  <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="#" className="flex items-center gap-2 group">
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            monis<span className="text-emerald-600">.rent</span>
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200">
            BALI
          </span>
        </a>
      </div>

      <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
        <a href="#setups" className="hover:text-slate-900 transition">Setups</a>
        <a href="#how-it-works" className="hover:text-slate-900 transition">How It Works</a>
        <a href="#catalog" className="hover:text-slate-900 transition">Equipment Fleet</a>
        <a href="#destinations" className="hover:text-slate-900 transition">Bali Delivery</a>
        <button
          onClick={onOpenAdmin}
          className="text-slate-500 hover:text-slate-900 transition font-mono cursor-pointer"
        >
          CMS Inventory
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenAdmin}
          className="md:hidden apple-press text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          CMS
        </button>

        {onOpenDeskStudio && (
          <button
            onClick={onOpenDeskStudio}
            className="apple-press text-xs font-extrabold px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Open 3D Desk Studio Configurator"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Desk Studio 3D</span>
          </button>
        )}

        {onWalkInStudio && (
          <button
            onClick={onWalkInStudio}
            className="apple-press text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 transition hidden sm:flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Walk inside the 3D Bali Studio"
          >
            <Footprints className="w-3.5 h-3.5 text-white" />
            <span>Walk in Studio</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onToggleInteractiveWorld}
          className="apple-press text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-black transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          <span>Room Builder</span>
        </button>
      </div>
    </div>
  </nav>
);
