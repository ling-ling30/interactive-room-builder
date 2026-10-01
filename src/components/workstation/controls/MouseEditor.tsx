import React from 'react';
import { sounds } from '../../../utils/soundEffects';
import {
  MOUSE_OPTIONS,
  type ControlsTabProps,
} from './controlOptions';

export const MouseEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentVariant = config.mouseVariant || 'precision_mx';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Ergonomic Pointer & Mouse
        </label>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold">Essential Slot 5</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MOUSE_OPTIONS.map((m) => {
          const isSel = currentVariant === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ mouseVariant: m.id });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow ring-1 ring-emerald-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{m.icon}</span>
                <span className="font-bold text-xs">{m.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-zinc-400 space-y-1">
        <div className="text-slate-300 font-bold">🖐️ Forearm Health Insight:</div>
        <p>Vertical mice rotate your wrist by 57° to a natural handshake position, releasing pressure from your carpal tunnel and median nerve during full-day work sessions.</p>
      </div>
    </div>
  );
};
