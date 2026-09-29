import React from 'react';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers, Grid } from 'lucide-react';

interface PreviewControlsProps {
  showStats: boolean;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  isAutoRotate: boolean;
  isWireframe: boolean;
  isGridOn: boolean;
  onToggleAutoRotate: () => void;
  onToggleWireframe: () => void;
  onToggleGrid: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetCamera: () => void;
}

/** Bottom overlay: dimension pill and the turntable / wireframe / grid / zoom / reset control pill. */
export const PreviewControls: React.FC<PreviewControlsProps> = ({
  showStats,
  widthCm,
  depthCm,
  heightCm,
  isAutoRotate,
  isWireframe,
  isGridOn,
  onToggleAutoRotate,
  onToggleWireframe,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  onResetCamera,
}) => (
  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none z-10">
    {/* Dimension Details Pill */}
    {showStats && (
      <div className="px-2.5 py-1 rounded-xl bg-white/80 backdrop-blur-md border border-stone-300/70 text-[10px] font-mono text-stone-600 flex items-center gap-1.5 shadow-sm">
        <span className="text-cyan-700 font-semibold">W: {widthCm}cm</span>
        <span className="text-stone-400">·</span>
        <span className="text-blue-700 font-semibold">D: {depthCm}cm</span>
        <span className="text-stone-400">·</span>
        <span className="text-emerald-700 font-semibold">H: {heightCm}cm</span>
      </div>
    )}

    {/* Interactive Control Pill */}
    <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md p-1 rounded-xl border border-stone-300/70 pointer-events-auto ml-auto shadow-md">
      {/* Turntable Auto-rotate */}
      <button
        type="button"
        onClick={onToggleAutoRotate}
        className={`apple-press p-1.5 rounded-lg text-xs transition cursor-pointer ${
          isAutoRotate ? 'bg-cyan-500/15 text-cyan-700 border border-cyan-500/40' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/70'
        }`}
        title={isAutoRotate ? 'Pause 360° Turntable' : 'Play 360° Turntable'}
      >
        <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
      </button>

      {/* Wireframe */}
      <button
        type="button"
        onClick={onToggleWireframe}
        className={`apple-press p-1.5 rounded-lg text-xs transition cursor-pointer ${
          isWireframe ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/40' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/70'
        }`}
        title={isWireframe ? 'Shaded Surfaces' : 'Wireframe Mesh'}
      >
        <Layers className="w-3.5 h-3.5" />
      </button>

      {/* Floor Grid Toggle */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`apple-press p-1.5 rounded-lg text-xs transition cursor-pointer ${
          isGridOn ? 'bg-stone-300/60 text-stone-800' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-200/70'
        }`}
        title={isGridOn ? 'Hide Ground Grid' : 'Show Ground Grid'}
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="apple-press p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="apple-press p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* Reset Camera Framing */}
      <button
        type="button"
        onClick={onResetCamera}
        className="apple-press p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition cursor-pointer"
        title="Reset View"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);
