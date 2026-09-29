import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface ShowcaseFooterProps {
  onToggleInteractiveWorld: () => void;
  onOpenAdmin: () => void;
}

export const ShowcaseFooter: React.FC<ShowcaseFooterProps> = ({ onToggleInteractiveWorld, onOpenAdmin }) => (
  <footer className="mt-auto bg-slate-900 text-white pt-14 pb-10 px-4 sm:px-8 border-t border-slate-800">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-black text-2xl tracking-tight text-white">
            monis<span className="text-emerald-400">.rent</span>
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
            BALI · ID
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          The premier ergonomic workspace rental service in Bali. Motorized desks, Herman Miller seating, and studio displays.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggleInteractiveWorld}
          className="apple-press px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition cursor-pointer flex items-center gap-2"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
          <span>Enter 3D Room Builder</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className="apple-press px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
        >
          Manage CMS
        </button>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
      <div>© {new Date().getFullYear()} Monis Bali Technologies. All rights reserved.</div>
      <div className="flex items-center gap-4 text-slate-400">
        <span>Canggu</span>
        <span>·</span>
        <span>Seminyak</span>
        <span>·</span>
        <span>Pererenan</span>
        <span>·</span>
        <span>Ubud</span>
        <span>·</span>
        <span>Uluwatu</span>
      </div>
    </div>
  </footer>
);
