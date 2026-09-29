import React from 'react';
import { Sun, Volume2, VolumeX, Coffee, Leaf } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import {
  DESK_MAT_OPTIONS,
  KEYBOARD_OPTIONS,
  LIGHT_TEMPERATURES,
  MOUSE_OPTIONS,
  type ControlsTabProps,
} from './controlOptions';

/** TAB 3: screenbar lighting, desk mat, keyboard / mouse and quick accessory toggles. */
export const GearTab: React.FC<ControlsTabProps> = ({ config, onChange }) => (
  <div className="space-y-4 animate-fade-in">
    {/* Screenbar Light Bar */}
    <div className="bg-[#0c0e15] border border-white/10 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Screenbar Illumination
          </span>
        </div>
        <div className="flex gap-1.5">
          {LIGHT_TEMPERATURES.map((t) => (
            <button
              key={t}
              onClick={() => {
                sounds.playSelect();
                onChange({ lightTemperature: t });
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                config.lightTemperature === t
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {config.lightTemperature !== 'off' && (
        <div className="pt-2 border-t border-white/10">
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Downlight Intensity</span>
            <span className="font-mono text-amber-400">{config.lightBrightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={config.lightBrightness}
            onChange={(e) => onChange({ lightBrightness: parseInt(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      )}
    </div>

    {/* Desk Mat & Surface Texture */}
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
        Desk Mat & Surface Protection
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DESK_MAT_OPTIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              sounds.playSelect();
              onChange({ deskMat: m.id });
            }}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              config.deskMat === m.id
                ? 'border-emerald-400 bg-emerald-500/15 text-white'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-md border border-white/20" style={{ backgroundColor: m.col }} />
            <span className="truncate">{m.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Input Devices: Keyboard & Mouse */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
          Keyboard Variant
        </label>
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_OPTIONS.map((k) => (
            <button
              key={k.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ keyboardVariant: k.id });
              }}
              className={`py-1.5 px-2.5 rounded-xl text-xs text-left transition cursor-pointer border ${
                config.keyboardVariant === k.id
                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 font-semibold'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
          Ergonomic Mouse
        </label>
        <div className="flex flex-col gap-1.5">
          {MOUSE_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ mouseVariant: m.id });
              }}
              className={`py-1.5 px-2.5 rounded-xl text-xs text-left transition cursor-pointer border ${
                config.mouseVariant === m.id
                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 font-semibold'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Quick Accessories Toggles */}
    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
      <button
        onClick={() => {
          sounds.playSelect();
          onChange({ speakersEnabled: !config.speakersEnabled });
        }}
        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
          config.speakersEnabled
            ? 'border-emerald-400 bg-emerald-500/15 text-white'
            : 'border-white/10 bg-white/5 text-zinc-400'
        }`}
      >
        {config.speakersEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>Studio Speakers</span>
      </button>

      <button
        onClick={() => {
          sounds.playSelect();
          onChange({ plantVariant: config.plantVariant === 'none' ? 'monstera' : 'none' });
        }}
        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
          config.plantVariant !== 'none'
            ? 'border-emerald-400 bg-emerald-500/15 text-white'
            : 'border-white/10 bg-white/5 text-zinc-400'
        }`}
      >
        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
        <span>Potted Plant</span>
      </button>

      <button
        onClick={() => {
          sounds.playSelect();
          onChange({ hasCoffeeMug: !config.hasCoffeeMug });
        }}
        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
          config.hasCoffeeMug
            ? 'border-emerald-400 bg-emerald-500/15 text-white'
            : 'border-white/10 bg-white/5 text-zinc-400'
        }`}
      >
        <Coffee className="w-3.5 h-3.5 text-amber-400" />
        <span>Ceramic Coffee Mug</span>
      </button>
    </div>
  </div>
);
