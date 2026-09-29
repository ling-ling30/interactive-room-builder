import { Compass, ZoomIn, ZoomOut, Grid, Hand, RotateCw, RotateCcw, Crosshair, Footprints } from 'lucide-react';
import { CAMERA_ANGLES } from '../hooks/useSimsCamera';

interface CameraControlsHudProps {
  cameraAngleIndex: number;
  onSetPreset: (index: number) => void;
  onRotateStep?: (direction: 'left' | 'right') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  snapStep?: number;
  onToggleSnap?: () => void;
  isOffset?: boolean;
  isPanMode?: boolean;
  onTogglePanMode?: () => void;
  onResetPan?: () => void;
  isWalkMode?: boolean;
  onToggleWalkMode?: () => void;
}

export function CameraControlsHud({
  cameraAngleIndex,
  onSetPreset,
  onRotateStep,
  onZoomIn,
  onZoomOut,
  snapStep = 0.25,
  onToggleSnap,
  isOffset = false,
  isPanMode = false,
  onTogglePanMode,
  onResetPan,
  isWalkMode = false,
  onToggleWalkMode,
}: CameraControlsHudProps) {
  return (
    <div
      data-hud="true"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-20 ${isOffset ? 'left-4 sm:left-[405px]' : 'left-4'} z-20 flex flex-wrap items-center gap-2 pointer-events-auto select-none transition-all duration-300`}
    >
      {/* Walk Mode Toggle Button */}
      {onToggleWalkMode && (
        <button
          onClick={onToggleWalkMode}
          className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-2xl apple-glass text-[11px] shadow-lg border transition cursor-pointer ${
            isWalkMode
              ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-glow'
              : 'text-zinc-200 hover:text-white border-white/10 hover:border-emerald-400/40'
          }`}
          title="Walk into the room in first-person mode (WASD / Arrow keys)"
        >
          <Footprints className="w-3.5 h-3.5 text-emerald-400" />
          <span>Walk Mode</span>
        </button>
      )}

      {/* 9 Directional Camera Presets (8 cardinal/corners + 1 Top-Down) */}
      <div className="flex items-center gap-0.5 apple-glass p-1 rounded-2xl text-xs shadow-lg">
        {onRotateStep && (
          <button
            onClick={() => onRotateStep('left')}
            className="apple-press p-1.5 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Rotate View Left 45° [Hotkey: Q]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
        <Compass className="w-3.5 h-3.5 text-emerald-400 ml-1 mr-0.5" />
        {CAMERA_ANGLES.map((angle, idx) => (
          <button
            key={angle.name}
            onClick={() => onSetPreset(idx)}
            className={`px-2 py-1 rounded-xl font-mono text-[11px] font-medium transition cursor-pointer ${
              cameraAngleIndex === idx
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title={`Rotate to ${angle.name}`}
          >
            {angle.shortLabel}
          </button>
        ))}
        {onRotateStep && (
          <button
            onClick={() => onRotateStep('right')}
            className="apple-press p-1.5 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Rotate View Right 45° [Hotkey: E]"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}
      </div>

      {/* Orbit vs Pan Mode Toggle */}
      {onTogglePanMode && (
        <div className="flex items-center gap-0.5 apple-glass p-1 rounded-2xl text-xs shadow-lg">
          <button
            onClick={onTogglePanMode}
            className={`apple-press flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              isPanMode
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white/10 text-zinc-300 hover:text-white'
            }`}
            title="Pan Camera X & Y (or hold Right-click / Shift+Drag / Space+Drag)"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Pan</span>
          </button>
          <button
            onClick={onTogglePanMode}
            className={`apple-press flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
              !isPanMode
                ? 'bg-white text-black shadow-xs'
                : 'bg-white/10 text-zinc-300 hover:text-white'
            }`}
            title="Orbit / Rotate Camera (Left-drag on empty space)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Orbit</span>
          </button>
        </div>
      )}

      {/* Re-center pan button */}
      {onResetPan && (
        <button
          onClick={onResetPan}
          className="apple-press apple-glass p-2 rounded-2xl text-zinc-300 hover:text-white transition shadow-lg cursor-pointer"
          title="Recenter Room View [Reset Pan]"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      )}

      {/* Zoom In / Out */}
      <div className="hidden sm:flex items-center gap-1 apple-glass p-1 rounded-2xl text-xs shadow-lg">
        <button
          onClick={onZoomIn}
          className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Snap Step Pill */}
      {onToggleSnap && (
        <button
          onClick={onToggleSnap}
          className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-2xl apple-glass text-[11px] shadow-lg border border-white/10 hover:border-emerald-400/40 transition cursor-pointer text-zinc-200 hover:text-white"
          title="Toggle Grid Snap: 0.125 (⅛ Tile) / 0.25 (¼ Tile) / 0.5 (½ Tile) / 1.0 (Full Tile) [Hotkey: G]"
        >
          <Grid className="w-3.5 h-3.5 text-emerald-400" />
          <span>Snap: <strong className="text-emerald-400 font-bold">{snapStep === 0.125 ? '⅛ Tile' : (snapStep === 0.25 ? '¼ Tile' : (snapStep === 0.5 ? '½ Tile' : '1 Tile'))}</strong></span>
        </button>
      )}
    </div>
  );
}
