import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

export const HeightControlSlider: React.FC = () => {
  const { config, updateConfig } = useCatalog();
  const height = config.deskHeightCm;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ deskHeightCm: parseFloat(e.target.value) });
  };

  const nudgeHeight = (delta: number) => {
    const next = Math.min(115, Math.max(72, Math.round((height + delta) * 10) / 10));
    updateConfig({ deskHeightCm: next });
  };

  const PRESETS = [
    { label: 'Ergo Sit', height: 74, icon: '🪑' },
    { label: 'Deep Focus', height: 78, icon: '💻' },
    { label: 'Active Stand', height: 104, icon: '🧍' },
    { label: 'Tall Stand', height: 112, icon: '⚡' },
  ];

  const isStanding = height >= 95;

  return (
    <div className="bg-[#14171f] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-slate-200">
              Motorized Height Control
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              Dual-Motor Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ergonomic elevation simulation with collision safety
          </p>
        </div>

        {/* Big Digital LED Readout */}
        <div className="flex items-center gap-2 bg-[#0c0e14] px-4 py-2 rounded-xl border border-slate-700/80 shadow-inner">
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400 tracking-wider">
              {height.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono ml-1">cm</span>
          </div>
          <div className="flex flex-col gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={() => nudgeHeight(0.5)}
              disabled={height >= 115}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 transition"
              title="Raise 0.5 cm"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => nudgeHeight(-0.5)}
              disabled={height <= 72}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 transition"
              title="Lower 0.5 cm"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Range Slider */}
      <div className="relative mb-5">
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>72 cm (Sitting Minimum)</span>
          <span className="text-emerald-400 font-semibold">{isStanding ? 'Standing Height' : 'Sitting Height'}</span>
          <span>115 cm (Standing Maximum)</span>
        </div>
        <input
          type="range"
          min="72"
          max="115"
          step="0.5"
          value={height}
          onChange={handleSliderChange}
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
        />
        {/* Visual tick marks */}
        <div className="flex justify-between px-1 mt-1 text-[9px] font-mono text-slate-400">
          <span>| 72</span>
          <span>| 80</span>
          <span>| 90 (Transition)</span>
          <span>| 100</span>
          <span>| 110</span>
          <span>| 115</span>
        </div>
      </div>

      {/* Height Memory Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const isActive = Math.abs(height - preset.height) < 1;
          return (
            <button
              key={preset.label}
              onClick={() => updateConfig({ deskHeightCm: preset.height })}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-glow'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">{preset.height}cm</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
