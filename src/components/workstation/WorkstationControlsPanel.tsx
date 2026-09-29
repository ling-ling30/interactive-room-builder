import React, { useState } from 'react';
import { Sliders, Tv, Keyboard, Sparkles } from 'lucide-react';
import type { WorkstationConfig, WorkstationPreset } from '../../types/workstation';
import { sounds } from '../../utils/soundEffects';
import { DeskTab } from './controls/DeskTab';
import { DisplayTab } from './controls/DisplayTab';
import { GearTab } from './controls/GearTab';
import { PresetsTab } from './controls/PresetsTab';

interface WorkstationControlsPanelProps {
  config: WorkstationConfig;
  onChange: (updates: Partial<WorkstationConfig>) => void;
  onApplyPreset: (preset: WorkstationPreset) => void;
}

type TabId = 'desk' | 'display' | 'peripherals' | 'presets';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'desk', label: 'Desk & Lift', icon: <Sliders className="w-3.5 h-3.5" /> },
  { id: 'display', label: 'Displays', icon: <Tv className="w-3.5 h-3.5" /> },
  { id: 'peripherals', label: 'Gear & Light', icon: <Keyboard className="w-3.5 h-3.5" /> },
  { id: 'presets', label: 'Presets', icon: <Sparkles className="w-3.5 h-3.5 text-amber-300" /> },
];

export const WorkstationControlsPanel: React.FC<WorkstationControlsPanelProps> = ({
  config,
  onChange,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('desk');

  return (
    <div className="w-full flex flex-col bg-[#11141c]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Category Tabs */}
      <div className="grid grid-cols-4 p-2 bg-black/40 border-b border-white/10 gap-1.5 text-xs font-bold">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playSelect();
              setActiveTab(tab.id);
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto space-y-5 text-slate-200">
        {activeTab === 'desk' && <DeskTab config={config} onChange={onChange} />}
        {activeTab === 'display' && <DisplayTab config={config} onChange={onChange} />}
        {activeTab === 'peripherals' && <GearTab config={config} onChange={onChange} />}
        {activeTab === 'presets' && <PresetsTab config={config} onChange={onChange} onApplyPreset={onApplyPreset} />}
      </div>
    </div>
  );
};
