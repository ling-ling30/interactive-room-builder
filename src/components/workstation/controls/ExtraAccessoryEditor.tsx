import React from 'react';
import { sounds } from '../../../utils/soundEffects';
import {
  ACCESSORY_OPTIONS,
  type ControlsTabProps,
} from './controlOptions';

export const ExtraAccessoryEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentSlot3 =
    config.accessorySlot3 ||
    (config.speakersEnabled ? 'speakers' : config.hasCoffeeMug ? 'coffee_mug' : 'none');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Audio & Personal Gear
        </label>
        <span className="text-[10px] text-cyan-400 font-mono font-semibold">Accessory Slot 3</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ACCESSORY_OPTIONS.map((opt) => {
          const isSel = currentSlot3 === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                sounds.playSelect();
                onChange({
                  accessorySlot3: opt.id,
                  speakersEnabled: opt.id === 'speakers',
                  hasCoffeeMug: opt.id === 'coffee_mug',
                });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-cyan-400/80 bg-cyan-500/10 text-white shadow-glow ring-1 ring-cyan-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{opt.icon}</span>
                <span className="font-bold text-xs">{opt.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{opt.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-zinc-400">
        <p className="text-cyan-300 font-semibold mb-1">⚡ Setup Flow Tip:</p>
        <p>Studio monitors provide flat-frequency response acoustic staging; headphones keep your villa calls crystal-clear without room echo.</p>
      </div>
    </div>
  );
};
