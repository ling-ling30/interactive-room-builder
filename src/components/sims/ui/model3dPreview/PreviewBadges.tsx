import React from 'react';
import { Maximize2, Box, Loader2 } from 'lucide-react';

interface PreviewBadgesProps {
  hasGlbAsset: boolean;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  scalePercent: number;
  triangleCount: number;
  isLoading: boolean;
  onOpenExpanded?: () => void;
}

/** Top overlay: asset source, live physical dimensions, scale, triangle count, loading state, expand button. */
export const PreviewBadges: React.FC<PreviewBadgesProps> = ({
  hasGlbAsset,
  widthCm,
  depthCm,
  heightCm,
  scalePercent,
  triangleCount,
  isLoading,
  onOpenExpanded,
}) => (
  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200 font-semibold flex items-center gap-1 shadow-sm">
        <Box className="w-3 h-3 text-cyan-400" />
        <span>{hasGlbAsset ? 'GLB Asset' : 'Procedural 3D'}</span>
      </span>

      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1 shadow-sm">
        <span>{widthCm}×{depthCm}×{heightCm} cm</span>
      </span>

      {scalePercent !== 100 && (
        <span className="px-2 py-0.5 rounded-full bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold shadow-sm">
          {scalePercent}%
        </span>
      )}

      {triangleCount > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400 font-medium shadow-sm hidden sm:inline-block">
          {triangleCount.toLocaleString()} tris
        </span>
      )}
    </div>

    <div className="flex items-center gap-1.5 pointer-events-auto">
      {isLoading && (
        <div className="px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-medium flex items-center gap-1.5 shadow-sm">
          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
          <span>Loading 3D asset...</span>
        </div>
      )}

      {onOpenExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenExpanded();
          }}
          className="apple-press p-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md transition cursor-pointer shadow-md"
          title="Open Fullscreen 3D Inspection Studio"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);
