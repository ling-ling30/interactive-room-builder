import React from 'react';
import { Layers, Monitor } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import { MONITOR_SETUPS, SCREEN_THEMES, type ControlsTabProps } from './controlOptions';

/** TAB 2: monitor array, virtual screen content and mounting system. */
export const DisplayTab: React.FC<ControlsTabProps> = ({ config, onChange }) => (
  <div className="space-y-4 animate-fade-in">
    {/* Monitor Array Layout Selector */}
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
        Display Setup & Array
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MONITOR_SETUPS.map((setup) => {
          const isSel = config.monitorSetup === setup.id;
          return (
            <button
              key={setup.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ monitorSetup: setup.id });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{setup.icon}</span>
                <span className="font-bold text-xs">{setup.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{setup.desc}</div>
            </button>
          );
        })}
      </div>
    </div>

    {/* Virtual Screen Content Selector */}
    <div className="pt-2 border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Virtual Desktop Screen Content
        </label>
        <span className="text-[10px] text-emerald-400 font-mono">Rendered Live on 3D Monitor</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SCREEN_THEMES.map((theme) => {
          const isSel = config.virtualScreenTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ virtualScreenTheme: theme.id });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${theme.color}25`, color: theme.color }}
              >
                {theme.icon}
              </div>
              <div>
                <div className="text-xs font-bold">{theme.label}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{theme.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>

    {/* Mounting Option: Arm vs Pedestal */}
    <div className="pt-2 border-t border-white/10">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">
        Monitor Mounting System
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            sounds.playSelect();
            onChange({ monitorMount: 'gas_spring_arm' });
          }}
          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
            config.monitorMount === 'gas_spring_arm'
              ? 'border-emerald-400 bg-emerald-500/15 text-white'
              : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dual Gas-Spring Arms</span>
        </button>

        <button
          onClick={() => {
            sounds.playSelect();
            onChange({ monitorMount: 'stand' });
          }}
          className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
            config.monitorMount === 'stand'
              ? 'border-emerald-400 bg-emerald-500/15 text-white'
              : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
          <span>Heavy Desktop Pedestals</span>
        </button>
      </div>
    </div>
  </div>
);
