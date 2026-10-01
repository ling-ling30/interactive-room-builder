import React from 'react';
import { Volume2 } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import {
  KEYBOARD_OPTIONS,
  KEYCAP_THEMES,
  type ControlsTabProps,
} from './controlOptions';

export const KeyboardEditor: React.FC<ControlsTabProps> = ({ config, onChange }) => {
  const currentVariant = config.keyboardVariant || 'mechanical_compact';
  const currentKeycap = config.keycapTheme || 'stealth_dark';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Mechanical Keyboard Layout
        </label>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold">Essential Slot 4</span>
      </div>

      {/* Keyboard Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {KEYBOARD_OPTIONS.map((kb) => {
          const isSel = currentVariant === kb.id;
          return (
            <button
              key={kb.id}
              onClick={() => {
                sounds.playSelect();
                onChange({ keyboardVariant: kb.id });
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                isSel
                  ? 'border-emerald-400/80 bg-emerald-500/10 text-white shadow-glow ring-1 ring-emerald-400/50'
                  : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{kb.icon}</span>
                <span className="font-bold text-xs">{kb.label}</span>
              </div>
              <div className="text-[11px] text-zinc-400 leading-tight">{kb.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Keycap Color Themes */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            PBT Keycap Colorway
          </label>
          <button
            onClick={() => {
              sounds.playPlace();
            }}
            className="apple-press text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Switch Acoustic</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KEYCAP_THEMES.map((theme) => {
            const isSel = currentKeycap === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  sounds.playSelect();
                  onChange({ keycapTheme: theme.id });
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isSel
                    ? 'border-emerald-400 bg-emerald-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-md border border-white/20 shadow-sm"
                  style={{ backgroundColor: theme.hex }}
                />
                <span className="truncate">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
