import React from 'react';
import { sounds } from '../../../utils/soundEffects';
import {
  DESK_MAT_OPTIONS,
  type ControlsTabProps,
} from './controlOptions';

export const MousePadEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentMat = config.deskMat || 'felt_charcoal';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Desk Mat & Surface Protection
        </label>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold">Essential Slot 6</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {DESK_MAT_OPTIONS.map((m) => {
          const isSel = currentMat === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ deskMat: m.id });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow ring-1 ring-emerald-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-4 h-4 rounded-md border border-white/20 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: m.col }}
                />
                <span className="font-bold text-xs">{m.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-zinc-400">
        <p className="text-slate-300 font-bold mb-1">📐 Extended Desk Mat Dimension:</p>
        <p>Generous 84cm × 38cm profile anchors your keyboard and mouse while dampening keystroke vibrations against solid wood.</p>
      </div>
    </div>
  );
};
