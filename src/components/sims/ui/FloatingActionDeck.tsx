import { forwardRef } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { Trash2, X, Move, Copy, Footprints, ArrowRightLeft, Layers, RotateCcw, RotateCw } from 'lucide-react';

interface FloatingActionDeckProps {
  selectedProduct?: SimsProduct | null;
  selectedCount?: number;
  totalWeeklyRent?: number;
  currentRotation?: number;
  onMove?: () => void;
  onRotate?: (newAngle?: number) => void;
  onRotateStep?: (dir: 'cw' | 'ccw') => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  onWalkToItem?: () => void;
  onSwap?: () => void;
}

export const FloatingActionDeck = forwardRef<HTMLDivElement, FloatingActionDeckProps>(
  (
    {
      selectedProduct,
      selectedCount = 1,
      totalWeeklyRent = 0,
      currentRotation = 0,
      onMove,
      onRotate,
      onRotateStep,
      onDuplicate,
      onDelete,
      onClose,
      onWalkToItem,
      onSwap,
    },
    ref
  ) => {
    const isMulti = selectedCount > 1;
    const isDesk = selectedProduct?.category === 'desks';

    return (
      <div
        ref={ref}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform' }}
        className="z-40 pointer-events-auto flex flex-col items-center select-none"
      >
        <div className="apple-glass rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 border border-emerald-400/60 backdrop-blur-2xl bg-black/90 animate-fade-in ring-1 ring-white/10">
          {/* Info Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 border-r border-white/15">
            {isMulti ? (
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Layers className="w-4 h-4" />
              </div>
            ) : (
              <span className="text-lg leading-none">{selectedProduct?.icon || '🪑'}</span>
            )}
            <div className="pr-1">
              <div className="text-xs font-bold text-white max-w-[150px] truncate leading-tight flex items-center gap-1.5">
                <span>{isMulti ? `${selectedCount} Items Selected` : selectedProduct?.name}</span>
                {isMulti && (
                  <span className="text-[9px] font-mono px-1 py-0.5 bg-emerald-500/30 text-emerald-300 rounded font-semibold">
                    Group
                  </span>
                )}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-medium">
                ${isMulti ? totalWeeklyRent : (selectedProduct?.weeklyRent ?? 0)}/wk{isMulti ? ' total' : ''}
              </div>
            </div>
          </div>

          {/* Single Item: Walk To Desk Button */}
          {!isMulti && onWalkToItem && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWalkToItem();
              }}
              className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-glow transition"
              title={isDesk ? "Walk up directly to this desk in first person" : "Walk up to this item in first person"}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{isDesk ? "Walk to Desk" : "Walk Here"}</span>
            </button>
          )}
          {/* Swap / Replace Button (Single Item Only) */}
          {!isMulti && onSwap && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwap();
              }}
              className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-glow transition"
              title="Swap / Replace with another piece of furniture"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          )}

          {/* Move Button (Single or Multi Group) */}
          {onMove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove();
              }}
              className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer shadow-glow transition"
              title={isMulti ? `Move all ${selectedCount} items together (M)` : "Move / Relocate item to another tile (M)"}
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isMulti ? `Move (${selectedCount})` : "Move"}</span>
            </button>
          )}

          {/* 5-Degree Furniture Rotation Controls (Single or Multi Group) */}
          <div className="flex items-center bg-white/[0.08] border border-white/10 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRotateStep) {
                  onRotateStep('ccw');
                } else if (onRotate) {
                  onRotate();
                }
              }}
              className="apple-press p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Rotate counter-clockwise 5° (Shift+R)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRotateStep) {
                  onRotateStep('cw');
                } else if (onRotate) {
                  onRotate();
                }
              }}
              className="apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition cursor-pointer text-xs font-semibold"
              title="Rotate clockwise 5° (R)"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rotate 5°</span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                {((Math.round(currentRotation) % 360) + 360) % 360}°
              </span>
            </button>
          </div>

          {/* Duplicate / Copy Button (Single or Multi Group) */}
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] text-zinc-200 hover:text-white transition cursor-pointer border border-white/10 font-semibold text-xs"
              title={isMulti ? `Copy all ${selectedCount} items together (Ctrl+D / +)` : "Copy item (Ctrl+D / +)"}
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMulti ? `Copy (${selectedCount})` : "Copy"}</span>
            </button>
          )}

          {/* Delete Button (Single or Multi Group) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/35 hover:text-rose-100 transition cursor-pointer border border-rose-500/30 font-semibold text-xs"
              title={isMulti ? `Remove all ${selectedCount} items together (Del)` : "Remove item (Del)"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isMulti && <span>Delete ({selectedCount})</span>}
            </button>
          )}

          {/* Close / Deselect Button */}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isMulti ? "Deselect All (Esc)" : "Close (Esc)"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Multi-Select Shortcut Helper */}
        {isMulti && (
          <div className="mt-1.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-emerald-500/30 text-[10px] text-zinc-300 flex items-center gap-2 shadow-lg animate-fade-in font-mono">
            <span className="text-emerald-400 font-bold">Shift+Click</span>
            <span className="text-zinc-500">•</span>
            <span className="text-sky-300">Move (M)</span>
            <span className="text-zinc-500">•</span>
            <span className="text-amber-300">Copy (+)</span>
            <span className="text-zinc-500">•</span>
            <span className="text-rose-300">Del</span>
          </div>
        )}
      </div>
    );
  }
);

FloatingActionDeck.displayName = 'FloatingActionDeck';
