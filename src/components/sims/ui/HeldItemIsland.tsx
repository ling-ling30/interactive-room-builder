import type { SimsProduct } from '../../../data/simsCatalog';
import { CheckCircle2, X, RotateCcw, RotateCw, Layers } from 'lucide-react';

interface HeldItemIslandProps {
  heldProduct: SimsProduct;
  isMovingExisting: boolean;
  hoverTile: { x: number; z: number } | null;
  heldRotation?: number;
  snapStep?: number;
  isCenterSnapped?: boolean;
  centerTargetName?: string;
  movingGroupCount?: number;
  onToggleSnap?: () => void;
  onDrop: () => void;
  onRotate?: () => void;
  onRotateStep?: (dir: 'cw' | 'ccw') => void;
  onCancel: () => void;
}

export function HeldItemIsland({
  heldProduct,
  isMovingExisting,
  hoverTile,
  heldRotation = 0,
  snapStep = 0.25,
  isCenterSnapped = false,
  centerTargetName,
  movingGroupCount = 1,
  onToggleSnap,
  onDrop,
  onRotate,
  onRotateStep,
  onCancel,
}: HeldItemIslandProps) {
  const isGroup = movingGroupCount > 1;

  return (
    <div
      data-hud="true"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-[104px] sm:top-20 left-1/2 -translate-x-1/2 z-30 apple-glass rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 border transition-colors duration-200 pointer-events-auto select-none ${
        isCenterSnapped ? 'border-cyan-400 bg-cyan-950/40 shadow-cyan-500/20' : 'border-emerald-400/60'
      }`}
    >
      <div className="flex items-center gap-2 pr-2 border-r border-white/[0.1]">
        {isGroup ? (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Layers className="w-5 h-5" />
          </div>
        ) : (
          <span className="text-2xl">{heldProduct.icon}</span>
        )}
        <div>
          <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
            <span>
              {isGroup
                ? `Moving Group (${movingGroupCount} Items)`
                : isMovingExisting
                ? `Moving: ${heldProduct.name}`
                : heldProduct.name}
            </span>
            {isCenterSnapped && (
              <span className="text-[9px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                🎯 Centered
              </span>
            )}
            {isGroup && (
              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded font-mono font-bold">
                Batch Move
              </span>
            )}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {isCenterSnapped ? (
              <span className="text-cyan-300 font-semibold">
                Magnetically centered with {centerTargetName ? centerTargetName.slice(0, 18) + '...' : 'Desk'}
              </span>
            ) : hoverTile ? (
              isGroup ? `Target Tile [${hoverTile.x}, ${hoverTile.z}] • moving ${movingGroupCount} items` : `Target Tile [${hoverTile.x}, ${hoverTile.z}]`
            ) : (
              isGroup ? 'Tap/Click floor to place entire group' : 'Tap/Click floor or desk to place'
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onDrop}
        disabled={!hoverTile}
        className={`apple-press px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
          hoverTile
            ? isCenterSnapped
              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-glow cursor-pointer'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow cursor-pointer'
            : 'bg-white/10 text-zinc-500 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{isGroup ? `Drop Group (${movingGroupCount})` : 'Drop Here'}</span>
      </button>

      {/* 5-Degree Furniture Rotation Controls */}
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
            {((Math.round(heldRotation) % 360) + 360) % 360}°
          </span>
        </button>
      </div>

      {onToggleSnap && (
        <button
          onClick={onToggleSnap}
          className="apple-press flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono cursor-pointer border border-white/10"
          title="Toggle Grid Snap: 0.125 (⅛) / 0.25 (¼) / 0.5 (½) / 1.0 (1) [Hotkey: G]"
        >
          <span className="text-zinc-400 text-[10px]">Snap</span>
          <span className="text-emerald-300 font-bold text-[11px]">
            {snapStep === 0.125 ? '⅛ Tile' : (snapStep === 0.25 ? '¼ Tile' : (snapStep === 0.5 ? '½ Tile' : '1 Tile'))}
          </span>
        </button>
      )}

      <button
        onClick={onCancel}
        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
        title="Cancel (Esc)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
