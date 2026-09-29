import React from 'react';
import { Eye } from 'lucide-react';
import { WORKSTATION_PRESETS, type WorkstationPreset } from '../../../types/workstation';
import { sounds } from '../../../utils/soundEffects';
import type { ControlsTabProps } from './controlOptions';

interface PresetsTabProps extends ControlsTabProps {
  onApplyPreset: (preset: WorkstationPreset) => void;
}

/** TAB 4: ergonomics guide toggle and preset archetypes. */
export const PresetsTab: React.FC<PresetsTabProps> = ({ config, onChange, onApplyPreset }) => (
  <div className="space-y-4 animate-fade-in">
    {/* Ergonomics Guide Switcher */}
    <div className="bg-[#0c0e15] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Interactive Posture Alignment Guide
          </span>
        </div>
        <div className="text-[11px] text-zinc-400 mt-0.5">
          Displays eye-level gaze ray, 90° typing angle, and 65cm viewing distance
        </div>
      </div>
      <button
        onClick={() => {
          sounds.playSelect();
          onChange({ showErgonomicsGuide: !config.showErgonomicsGuide });
        }}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
          config.showErgonomicsGuide
            ? 'bg-sky-500 text-slate-950 border-sky-400'
            : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
        }`}
      >
        {config.showErgonomicsGuide ? 'Active' : 'Show Guide'}
      </button>
    </div>

    {/* Presets Grid */}
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
        Workstation Presets
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WORKSTATION_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{preset.icon}</span>
                  <span className="font-bold text-xs text-white">{preset.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {preset.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-xs font-mono font-bold text-emerald-400">
                ${preset.weeklyRent}/wk
              </div>
              <button
                onClick={() => {
                  sounds.playPlace();
                  onApplyPreset(preset);
                }}
                className="apple-press text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white transition cursor-pointer"
              >
                Apply Setup
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
