import React from 'react';
import { Sun, Power } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import {
  LAMP_OPTIONS,
  LIGHT_TEMPERATURES,
  type ControlsTabProps,
} from './controlOptions';

export const LampEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentLamp = config.lampVariant || 'screenbar';
  const isOff = config.lightTemperature === 'off' || currentLamp === 'none';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Desk Lamp & Illumination
        </label>
        <span className="text-[10px] text-amber-400 font-mono font-semibold">Accessory Slot 1</span>
      </div>

      {/* Lamp Model Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {LAMP_OPTIONS.map((lamp) => {
          const isSel = currentLamp === lamp.id;
          return (
            <button
              key={lamp.id}
              onClick={() => {
                sounds.playSelect();
                onChange({
                  lampVariant: lamp.id,
                  lightTemperature: lamp.id === 'none' ? 'off' : config.lightTemperature === 'off' ? 'warm_3000k' : config.lightTemperature,
                });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-amber-400/80 bg-amber-500/10 text-white shadow-glow ring-1 ring-amber-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{lamp.icon}</span>
                <span className="font-bold text-xs">{lamp.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{lamp.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Lighting Controls (When lamp is active) */}
      {currentLamp !== 'none' && (
        <div className="bg-[#0c0e15] border border-white/10 rounded-2xl p-4 space-y-3.5">
          {/* Header with Power Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className={`w-4 h-4 ${isOff ? 'text-zinc-600' : 'text-amber-400 animate-pulse'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Desk Spotlight
              </span>
            </div>

            <button
              onClick={() => {
                sounds.playSelect();
                onChange({
                  lightTemperature: isOff ? 'warm_3000k' : 'off',
                });
              }}
              className={`apple-press flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                isOff
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                  : 'bg-amber-400 text-slate-950 border-amber-300 shadow-glow'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOff ? 'Turn On' : 'Light On'}</span>
            </button>
          </div>

          {!isOff && (
            <>
              {/* Kelvin Temperature Selector */}
              <div>
                <label className="text-[11px] font-mono text-zinc-400 mb-2 block uppercase">
                  Light Color Temperature (Kelvin)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LIGHT_TEMPERATURES.filter((t) => t.id !== 'off').map((temp) => {
                    const isSel = config.lightTemperature === temp.id;
                    return (
                      <button
                        key={temp.id}
                        onClick={() => {
                          sounds.playSelect();
                          onChange({ lightTemperature: temp.id });
                        }}
                        className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                          isSel
                            ? 'border-amber-400 bg-amber-500/15 text-white shadow-glow'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-1 border border-white/20"
                          style={{ backgroundColor: temp.color }}
                        />
                        <div className="text-xs font-bold">{temp.label}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{temp.kelvin}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brightness Slider */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
                  <span>Beam Brightness</span>
                  <span className="text-amber-400 font-bold">{config.lightBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={config.lightBrightness}
                  onChange={(e) => {
                    onChange({ lightBrightness: parseInt(e.target.value) });
                  }}
                  className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
