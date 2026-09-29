import React from 'react';
import type { SpaceParameters, FloorStyle } from '../../types/space';
import { SPACE_PRESETS } from '../../types/space';
import { Maximize2, X, Check } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SpaceDesignerPanelProps {
  spaceParams: SpaceParameters;
  onChangeSpace: (updated: Partial<SpaceParameters>) => void;
  onClose: () => void;
}

export const SpaceDesignerPanel: React.FC<SpaceDesignerPanelProps> = ({
  spaceParams,
  onChangeSpace,
  onClose,
}) => {
  const sqMeters = (spaceParams.width * spaceParams.length).toFixed(1);
  const sqFeet = Math.round(spaceParams.width * spaceParams.length * 10.764);

  const FLOOR_OPTIONS: { id: FloorStyle; label: string; previewColor: string; desc: string }[] = [
    { id: 'wood', label: 'Bali Teak Plank', previewColor: '#c89d66', desc: 'Warm natural tropical hardwood' },
    { id: 'terrazzo', label: 'Villa Terrazzo', previewColor: '#d6c8b4', desc: 'Hand-cast micro aggregate fleck' },
    { id: 'concrete', label: 'Micro-Cement', previewColor: '#9ca3af', desc: 'Minimalist smooth loft stone' },
    { id: 'marble', label: 'Carrara Marble', previewColor: '#f1f5f9', desc: 'Cool polished architectural stone' },
  ];

  const WALL_COLORS = [
    { color: '#f8f6f0', name: 'Villa Cream' },
    { color: '#e5e7eb', name: 'Soft Gray' },
    { color: '#dcfce7', name: 'Sage Linen' },
    { color: '#1c1f26', name: 'Studio Dark' },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white/98 text-slate-900 border-r border-slate-200 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Design Room Space</h3>
              <p className="text-[11px] text-slate-500 font-medium">Step 1: Set room layout & materials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="apple-press p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Space Dimension Indicators */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Floor Surface Area</div>
            <div className="text-xl font-extrabold font-mono text-slate-900">
              {sqMeters} <span className="text-xs text-slate-500 font-normal">m²</span>
              <span className="text-xs text-slate-400 font-normal ml-2">({sqFeet} sq ft)</span>
            </div>
          </div>
          <div className="text-right font-mono font-bold text-xs text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {spaceParams.width}m × {spaceParams.length}m
          </div>
        </div>

        {/* Room Presets */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider font-mono">
            Room Size Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SPACE_PRESETS.map(preset => {
              const isSelected = spaceParams.width === preset.width && spaceParams.length === preset.length;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    sounds.playSelect();
                    onChangeSpace({
                      width: preset.width,
                      length: preset.length,
                      floorStyle: preset.floorStyle,
                      wallColor: preset.wallColor,
                    });
                  }}
                  className={`apple-press p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.name}</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {preset.width}×{preset.length}m
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension Sliders & Direct Inputs (Up to 50m x 50m) */}
        <div className="space-y-4 mb-6 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5 font-bold">
              <span>Room Width (3m - 50m)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="3"
                  max="50"
                  value={Math.round(spaceParams.width)}
                  onChange={(e) => {
                    const val = Math.max(3, Math.min(50, parseInt(e.target.value, 10) || 3));
                    onChangeSpace({ width: val });
                  }}
                  className="w-14 px-2 py-0.5 text-right font-mono font-extrabold text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
                <span className="font-mono text-slate-500 font-bold text-xs">m</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="50"
              step="1"
              value={Math.round(spaceParams.width)}
              onChange={(e) => onChangeSpace({ width: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5 font-bold">
              <span>Room Length (3m - 50m)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="3"
                  max="50"
                  value={Math.round(spaceParams.length)}
                  onChange={(e) => {
                    const val = Math.max(3, Math.min(50, parseInt(e.target.value, 10) || 3));
                    onChangeSpace({ length: val });
                  }}
                  className="w-14 px-2 py-0.5 text-right font-mono font-extrabold text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
                <span className="font-mono text-slate-500 font-bold text-xs">m</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="50"
              step="1"
              value={Math.round(spaceParams.length)}
              onChange={(e) => onChangeSpace({ length: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        </div>

        {/* Wall Architecture & Cutaway Mode */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider font-mono">
            Wall Perspective Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'cutaway', label: 'Cutaway', desc: 'Sims unblocked' },
              { id: 'low', label: 'Low Rim', desc: 'Open loft / campus' },
              { id: 'full', label: 'Full Walls', desc: 'Enclosed room' },
            ].map(w => {
              const currentStyle = spaceParams.wallStyle || 'cutaway';
              const isSel = currentStyle === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    sounds.playSelect();
                    onChangeSpace({ wallStyle: w.id as 'cutaway' | 'low' | 'full' });
                  }}
                  className={`apple-press p-2 rounded-xl border text-center transition cursor-pointer ${
                    isSel
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{w.label}</div>
                  <div className={`text-[9px] font-mono mt-0.5 ${isSel ? 'text-slate-300' : 'text-slate-400'}`}>
                    {w.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flooring Style Options */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider font-mono">
            Floor Material Finish
          </label>
          <div className="space-y-2">
            {FLOOR_OPTIONS.map(floor => {
              const isSelected = spaceParams.floorStyle === floor.id;
              return (
                <button
                  key={floor.id}
                  onClick={() => {
                    sounds.playSelect();
                    onChangeSpace({ floorStyle: floor.id });
                  }}
                  className={`apple-press w-full flex items-center justify-between p-2.5 rounded-2xl border transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-lg border border-black/20 shadow-xs shrink-0"
                      style={{ backgroundColor: floor.previewColor }}
                    />
                    <div>
                      <div className="text-xs font-bold">{floor.label}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{floor.desc}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wall Color Options */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider font-mono">
            Wall Color Tone
          </label>
          <div className="flex items-center gap-3">
            {WALL_COLORS.map(wc => (
              <button
                key={wc.color}
                onClick={() => {
                  sounds.playSelect();
                  onChangeSpace({ wallColor: wc.color });
                }}
                className={`apple-press flex flex-col items-center gap-1 p-1 rounded-xl transition cursor-pointer ${
                  spaceParams.wallColor === wc.color ? 'scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 shadow-sm"
                  style={{
                    backgroundColor: wc.color,
                    borderColor: spaceParams.wallColor === wc.color ? '#0f172a' : '#cbd5e1'
                  }}
                />
                <span className="text-[9px] font-bold text-slate-600">{wc.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Done Button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={onClose}
          className="apple-press w-full py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <span>Done & Add Furniture →</span>
        </button>
      </div>
    </div>
  );
};
