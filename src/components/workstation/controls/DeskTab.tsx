import React from 'react';
import { Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import {
  DESK_HEIGHT_MAX_CM,
  DESK_HEIGHT_MIN_CM,
  DESK_WIDTHS_CM,
  FINISH_OPTIONS,
  FRAME_OPTIONS,
  HEIGHT_PRESETS,
  type ControlsTabProps,
} from './controlOptions';

/** TAB 1: desk motorized height, tabletop finish, frame color and width. */
export const DeskTab: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const isStanding = config.deskHeightCm >= 95;

  const nudgeHeight = (delta: number) => {
    sounds.playRotate();
    const next = Math.min(
      DESK_HEIGHT_MAX_CM,
      Math.max(DESK_HEIGHT_MIN_CM, Math.round((config.deskHeightCm + delta) * 10) / 10)
    );
    onChange({ deskHeightCm: next });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Height Elevation Banner & Digital Readout */}
      <div className="bg-[#0c0e15] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Dual-Motor Elevation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {isStanding ? 'Standing Mode' : 'Sitting Mode'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Synchronized motorized lift with soft stop collision safety
          </div>
        </div>

        {/* Digital LED Readout with Nudge Buttons */}
        <div className="flex items-center gap-3 bg-black/60 px-3.5 py-2 rounded-xl border border-white/15">
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400 tracking-wider">
              {config.deskHeightCm.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-zinc-500 ml-1">cm</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-white/10 pl-2">
            <button
              onClick={() => nudgeHeight(0.5)}
              disabled={config.deskHeightCm >= DESK_HEIGHT_MAX_CM}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition cursor-pointer"
              title="Raise 0.5 cm"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => nudgeHeight(-0.5)}
              disabled={config.deskHeightCm <= DESK_HEIGHT_MIN_CM}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition cursor-pointer"
              title="Lower 0.5 cm"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Range Slider */}
      <div>
        <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
          <span>70 cm (Sitting Min)</span>
          <span className="text-emerald-400 font-bold">{config.deskHeightCm} cm</span>
          <span>118 cm (Standing Max)</span>
        </div>
        <input
          type="range"
          min="70"
          max="118"
          step="0.5"
          value={config.deskHeightCm}
          onChange={(e) => {
            sounds.playSelect();
            onChange({ deskHeightCm: parseFloat(e.target.value) });
          }}
          className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
        />
      </div>

      {/* Height Memory Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {HEIGHT_PRESETS.map((p) => {
          const isActive = Math.abs(config.deskHeightCm - p.height) < 1;
          return (
            <button
              key={p.label}
              onClick={() => {
                sounds.playPlace();
                onChange({ deskHeightCm: p.height });
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/70 text-emerald-300 shadow-glow'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </span>
              <span className="font-mono text-[11px] text-zinc-400">{p.height}cm</span>
            </button>
          );
        })}
      </div>

      {/* Tabletop Wood & Finish Selector */}
      <div className="pt-2 border-t border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
          Tabletop Finish & Material
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FINISH_OPTIONS.map((finish) => {
            const isSel = config.tabletopFinish === finish.id;
            return (
              <button
                key={finish.id}
                onClick={() => {
                  sounds.playSelect();
                  onChange({ tabletopFinish: finish.id });
                }}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition cursor-pointer ${
                  isSel
                    ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow'
                    : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-lg border shadow-inner flex-shrink-0"
                  style={{ backgroundColor: finish.bg, borderColor: finish.border }}
                />
                <span className="font-semibold truncate">{finish.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Color & Desk Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
            Lifting Frame Color
          </label>
          <div className="flex gap-2">
            {FRAME_OPTIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sounds.playSelect();
                  onChange({ frameColor: f.id });
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                  config.frameColor === f.id
                    ? 'border-emerald-400 bg-emerald-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: f.color }} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
            Worksurface Width
          </label>
          <div className="flex gap-2">
            {DESK_WIDTHS_CM.map((w) => (
              <button
                key={w}
                onClick={() => {
                  sounds.playSelect();
                  onChange({ deskWidthCm: w });
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                  config.deskWidthCm === w
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {w} cm
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
