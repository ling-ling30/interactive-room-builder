import React from 'react';
import { sounds } from '../../../utils/soundEffects';
import {
  CHAIR_OPTIONS,
  CHAIR_COLORS,
  type ControlsTabProps,
} from './controlOptions';

export const ChairEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentModel = config.chairModel || 'aeron_mesh';
  const currentColor = config.chairColor || 'graphite';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Seating Ergonomics & Model
        </label>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold">Essential Slot 1</span>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CHAIR_OPTIONS.map((chair) => {
          const isSel = currentModel === chair.id;
          return (
            <button
              key={chair.id}
              onClick={() => {
                sounds.playSelect();
                onChange({
                  chairModel: chair.id,
                  chairName: chair.label,
                });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow ring-1 ring-emerald-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{chair.icon}</span>
                <span className="font-bold text-xs">{chair.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{chair.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Color / Upholstery Finishes */}
      <div className="pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
          Upholstery & Frame Finish
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHAIR_COLORS.map((col) => {
            const isSel = currentColor === col.id;
            return (
              <button
                key={col.id}
                onClick={() => {
                  sounds.playSelect();
                  onChange({ chairColor: col.id });
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isSel
                    ? 'border-emerald-400 bg-emerald-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: col.hex }}
                />
                <span className="truncate">{col.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ergonomic Posture Specs info */}
      <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-zinc-400 space-y-1">
        <div className="text-slate-300 font-bold flex items-center gap-1.5">
          <span>✓</span>
          <span>Ergonomic Spec Checklist:</span>
        </div>
        <p>• Waterfall front seat pan eliminates pressure behind knees</p>
        <p>• 5-star arched base with dual-wheel casters for hardwood or carpet</p>
        <p>• Synchronized tilt mechanism with pneumatic gas lift height adjustment</p>
      </div>
    </div>
  );
};
