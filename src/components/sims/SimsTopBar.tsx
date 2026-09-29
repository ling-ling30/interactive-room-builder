import React from 'react';
import { Sun, Moon, Database, LayoutGrid } from 'lucide-react';

interface SimsTopBarProps {
  isNightMode: boolean;
  onToggleNightMode: () => void;
  itemCount: number;
  viewMode: 'sims' | 'admin';
  onToggleViewMode: () => void;
}

export const SimsTopBar: React.FC<SimsTopBarProps> = ({
  isNightMode,
  onToggleNightMode,
  itemCount,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <header className="w-full bg-[#11141e]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Sims Room Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-glow">
            <span className="font-display font-extrabold text-black text-xl">M</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-white">
                MONIS<span className="text-emerald-400">.SIMS</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                Isometric 3D Room
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sims-Style Interactive Workspace Furniture Builder · Bali
            </p>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {viewMode === 'sims' && (
            <>
              {/* Day / Night Mood Switcher */}
              <button
                onClick={onToggleNightMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isNightMode
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
                title="Toggle Daylight or Night Mood"
              >
                {isNightMode ? (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Night Focus</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Villa Daylight</span>
                  </>
                )}
              </button>

              {/* Items Counter Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                <span>{itemCount} Placed</span>
              </div>
            </>
          )}

          {/* DEDICATED INVENTORY CMS SWITCHER ("Outside of the front UI") */}
          <button
            onClick={onToggleViewMode}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              viewMode === 'admin'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{viewMode === 'admin' ? '← Back to 3D Sims Room' : 'Manage Products (CMS)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
