import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Armchair
} from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';

interface WalkModeHudProps {
  activeKeys: { [key: string]: boolean };
  onVirtualWalk: (forward: number, strafe: number) => void;
  onOpenStore?: () => void;
}

export const WalkModeHud: React.FC<WalkModeHudProps> = ({
  activeKeys,
  onVirtualWalk,
  onOpenStore,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none flex flex-col justify-end p-4 sm:p-6">
      {/* Center Reticle / Crosshair Indicator for Looking & Interacting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full border border-white/60 bg-white/30 backdrop-blur-xs shadow-xs" />
      </div>

      {/* Bottom Walk Controls & HUD */}
      <div
        data-hud="true"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 w-full pointer-events-auto"
      >
        {/* Left: Desktop Controls Guide / Touch D-pad */}
        <div className="flex items-center gap-3">
          {/* Virtual D-pad for mobile / touch or quick click */}
          <div className="apple-glass rounded-2xl p-2 shadow-2xl flex flex-col items-center gap-1 border border-white/10">
            <button
              onPointerDown={() => onVirtualWalk(1, 0)}
              onPointerUp={() => onVirtualWalk(0, 0)}
              onPointerLeave={() => onVirtualWalk(0, 0)}
              className="apple-press w-9 h-9 rounded-xl bg-white/10 active:bg-emerald-500 active:text-slate-950 text-white flex items-center justify-center transition cursor-pointer"
              title="Walk Forward (W)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              <button
                onPointerDown={() => onVirtualWalk(0, -1)}
                onPointerUp={() => onVirtualWalk(0, 0)}
                onPointerLeave={() => onVirtualWalk(0, 0)}
                className="apple-press w-9 h-9 rounded-xl bg-white/10 active:bg-emerald-500 active:text-slate-950 text-white flex items-center justify-center transition cursor-pointer"
                title="Strafe Left (A)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onPointerDown={() => onVirtualWalk(-1, 0)}
                onPointerUp={() => onVirtualWalk(0, 0)}
                onPointerLeave={() => onVirtualWalk(0, 0)}
                className="apple-press w-9 h-9 rounded-xl bg-white/10 active:bg-emerald-500 active:text-slate-950 text-white flex items-center justify-center transition cursor-pointer"
                title="Walk Backward (S)"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onPointerDown={() => onVirtualWalk(0, 1)}
                onPointerUp={() => onVirtualWalk(0, 0)}
                onPointerLeave={() => onVirtualWalk(0, 0)}
                className="apple-press w-9 h-9 rounded-xl bg-white/10 active:bg-emerald-500 active:text-slate-950 text-white flex items-center justify-center transition cursor-pointer"
                title="Strafe Right (D)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Keyboard Keys Guide */}
          <div className="hidden md:flex flex-col bg-[#0c1017]/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs shadow-xl">
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-300">
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  activeKeys['KeyW'] || activeKeys['ArrowUp']
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                W
              </span>
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  activeKeys['KeyA'] || activeKeys['ArrowLeft']
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                A
              </span>
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  activeKeys['KeyS'] || activeKeys['ArrowDown']
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                S
              </span>
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  activeKeys['KeyD'] || activeKeys['ArrowRight']
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                D
              </span>
              <span>Walk</span>
              <span className="text-zinc-500">·</span>
              <span
                className={`px-1.5 py-0.5 rounded border ${
                  activeKeys['ShiftLeft'] || activeKeys['ShiftRight']
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : 'bg-white/10 border-white/15'
                }`}
              >
                Shift
              </span>
              <span>Sprint</span>
              <span className="text-zinc-500">·</span>
              <span className="text-emerald-400">Drag to Look</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Collision & edge sliding active · Click any desk to Walk & Swap up close
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        {onOpenStore && (
          <button
            onClick={() => {
              sounds.playSelect();
              onOpenStore();
            }}
            className="apple-press bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-2xl px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition cursor-pointer"
          >
            <Armchair className="w-4 h-4 text-emerald-600" />
            <span>Browse Catalog</span>
          </button>
        )}
      </div>
    </div>
  );
};
