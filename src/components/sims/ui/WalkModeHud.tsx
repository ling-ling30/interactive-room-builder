import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Armchair
} from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';

interface WalkModeHudProps {
  /** Free-cursor mode (select / move objects) instead of mouse-look. */
  isInteractMode: boolean;
  /** Furniture under the crosshair (look mode). */
  target: PlacedFurniture | null;
  /** An item is being carried at the crosshair. */
  isCarrying: boolean;
  catalog: SimsProduct[];
  /** Touch shortcuts that mirror the E / R keys. */
  onSwap: () => void;
  onMove: () => void;
  onCancelCarry: () => void;
  onRotateCarry: () => void;
  activeKeys: { [key: string]: boolean };
  onVirtualWalk: (forward: number, strafe: number) => void;
  onOpenStore?: () => void;
}

export const WalkModeHud: React.FC<WalkModeHudProps> = ({
  isInteractMode,
  target,
  isCarrying,
  catalog,
  onSwap,
  onMove,
  onCancelCarry,
  onRotateCarry,
  activeKeys,
  onVirtualWalk,
  onOpenStore,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none flex flex-col justify-end p-4 sm:p-6">
      {/* Center Reticle / Crosshair Indicator for Looking & Interacting */}
      {!isInteractMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full border border-white/60 bg-white/30 backdrop-blur-xs shadow-xs" />
        </div>
      )}

      {/* Crosshair target: name, price and the keys that act on it */}
      {!isInteractMode && target && (() => {
        const product = catalog.find(p => p.id === target.productId);
        if (!product) return null;
        return (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-5 pointer-events-none animate-fade-in max-w-[calc(100vw-16px)]">
            <div className="apple-glass rounded-full pl-3 sm:pl-4 pr-2 py-1.5 border border-white/15 shadow-xl flex items-center gap-2 sm:gap-3 whitespace-nowrap">
              <span className="text-xs font-bold text-white max-w-[110px] sm:max-w-[220px] truncate">{product.name}</span>
              <span className="text-[11px] font-mono text-emerald-300">${product.weeklyRent}/wk</span>
              <span className="hidden [@media(pointer:fine)]:flex items-center gap-1 text-[10px] text-zinc-300">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white/15 font-mono font-bold text-white">E</kbd>Swap
                <kbd className="px-1.5 py-0.5 rounded-md bg-white/15 font-mono font-bold text-white ml-1">R</kbd>Move
              </span>
              <span className="hidden [@media(pointer:coarse)]:flex items-center gap-1.5 pointer-events-auto">
                <button data-hud="true" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={onSwap} className="apple-press px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold">Swap</button>
                <button data-hud="true" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={onMove} className="apple-press px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold">Move</button>
              </span>
            </div>
          </div>
        );
      })()}

      {/* Carrying furniture at the crosshair */}
      {!isInteractMode && isCarrying && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-6 pointer-events-none animate-fade-in">
          <div className="apple-glass rounded-2xl px-3.5 py-2 border border-emerald-400/40 shadow-xl text-[10px] text-zinc-200 text-center">
            <span className="hidden [@media(pointer:fine)]:inline">
              Click or <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/10 font-mono font-bold">R</kbd> to place ·
              Scroll to rotate · <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/10 font-mono font-bold">Esc</kbd> to cancel
            </span>
            <span className="hidden [@media(pointer:coarse)]:flex items-center gap-1.5 pointer-events-auto">
              <button data-hud="true" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={onMove} className="apple-press px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-extrabold">Place</button>
              <button data-hud="true" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={onRotateCarry} className="apple-press px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold">Rotate</button>
              <button data-hud="true" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={onCancelCarry} className="apple-press px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold">Cancel</button>
            </span>
          </div>
        </div>
      )}

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
              {!isInteractMode && (
                <>
                  <span className="px-1.5 py-0.5 rounded border bg-white/10 border-white/15">Mouse</span>
                  <span className="text-emerald-400">Look</span>
                  <span className="text-zinc-500">·</span>
                </>
              )}
              <span className="px-1.5 py-0.5 rounded border bg-white/10 border-white/15">E</span>
              <span className="text-emerald-400">Swap</span>
              <span className="text-zinc-500">·</span>
              <span className="px-1.5 py-0.5 rounded border bg-white/10 border-white/15">R</span>
              <span className="text-emerald-400">Move</span>
              <span className="text-zinc-500">·</span>
              <span className="px-1.5 py-0.5 rounded border bg-white/10 border-white/15">F</span>
              <span className={isInteractMode ? 'text-amber-300' : 'text-zinc-300'}>
                {isInteractMode ? 'Back to Look' : 'Free Cursor'}
              </span>
            </div>
            {isInteractMode && (
              <div className="text-[10px] text-zinc-400 mt-1">Click to select, drag to move furniture</div>
            )}
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
