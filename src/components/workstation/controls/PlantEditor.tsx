import React from 'react';
import { sounds } from '../../../utils/soundEffects';
import {
  PLANT_OPTIONS,
  type ControlsTabProps,
} from './controlOptions';

export const PlantEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentPlant = config.plantVariant || 'monstera';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Small Pot & Desktop Botany
        </label>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold">Accessory Slot 2</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PLANT_OPTIONS.map((plant) => {
          const isSel = currentPlant === plant.id;
          return (
            <button
              key={plant.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ plantVariant: plant.id });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow ring-1 ring-emerald-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{plant.icon}</span>
                <span className="font-bold text-xs">{plant.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{plant.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-zinc-400">
        <p className="text-emerald-300 font-semibold mb-1">🌿 Biophilic Workspace Benefits:</p>
        <p>Adding indoor greenery to your desk setup has been shown to reduce screen fatigue and improve focus during deep work blocks.</p>
      </div>
    </div>
  );
};
