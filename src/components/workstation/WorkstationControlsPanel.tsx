import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import type { WorkstationConfig, WorkstationPreset, DeskStudioSlot } from '../../types/workstation';
import { sounds } from '../../utils/soundEffects';
import { ChairEditor } from './controls/ChairEditor';
import { DeskTab } from './controls/DeskTab';
import { DisplayTab } from './controls/DisplayTab';
import { KeyboardEditor } from './controls/KeyboardEditor';
import { MouseEditor } from './controls/MouseEditor';
import { MousePadEditor } from './controls/MousePadEditor';
import { LampEditor } from './controls/LampEditor';
import { PlantEditor } from './controls/PlantEditor';
import { ExtraAccessoryEditor } from './controls/ExtraAccessoryEditor';
import { PresetsTab } from './controls/PresetsTab';

interface WorkstationControlsPanelProps {
  config: WorkstationConfig;
  selectedSlot?: DeskStudioSlot | null;
  onSelectSlot?: (slot: DeskStudioSlot) => void;
  onChange: (updates: Partial<WorkstationConfig>) => void;
  onApplyPreset: (preset: WorkstationPreset) => void;
}

type PanelView = DeskStudioSlot | 'presets';

interface SlotDefinition {
  id: DeskStudioSlot;
  label: string;
  icon: string;
  category: 'essential' | 'accessory';
  getSummary: (config: WorkstationConfig) => string;
}

const SLOTS: SlotDefinition[] = [
  // Essentials (6)
  {
    id: 'chair',
    label: 'Chair',
    icon: '🪑',
    category: 'essential',
    getSummary: (c) => c.chairName || 'Aeron Remastered',
  },
  {
    id: 'table',
    label: 'Desk Table',
    icon: '🪵',
    category: 'essential',
    getSummary: (c) => `${c.tabletopFinish.replace('_', ' ')} · ${c.deskHeightCm}cm`,
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: '🖥️',
    category: 'essential',
    getSummary: (c) => c.monitorSetup.replace('_', ' '),
  },
  {
    id: 'keyboard',
    label: 'Keyboard',
    icon: '⌨️',
    category: 'essential',
    getSummary: (c) => c.keyboardVariant.replace('_', ' '),
  },
  {
    id: 'mouse',
    label: 'Mouse',
    icon: '🖱️',
    category: 'essential',
    getSummary: (c) => c.mouseVariant.replace('_', ' '),
  },
  {
    id: 'mousepad',
    label: 'Mouse Pad',
    icon: '⬛',
    category: 'essential',
    getSummary: (c) => (c.deskMat === 'none' ? 'Bare Table' : c.deskMat.replace('_', ' ')),
  },
  // Accessories (3)
  {
    id: 'lamp',
    label: 'Desk Lamp',
    icon: '💡',
    category: 'accessory',
    getSummary: (c) => (c.lampVariant === 'none' ? 'No Lamp' : c.lampVariant?.replace('_', ' ') || 'Screenbar'),
  },
  {
    id: 'plant',
    label: 'Small Pot',
    icon: '🪴',
    category: 'accessory',
    getSummary: (c) => (c.plantVariant === 'none' ? 'No Plant' : c.plantVariant),
  },
  {
    id: 'accessory',
    label: 'Audio / Drink',
    icon: '🔊',
    category: 'accessory',
    getSummary: (c) => c.accessorySlot3?.replace('_', ' ') || (c.speakersEnabled ? 'Speakers' : c.hasCoffeeMug ? 'Coffee Mug' : 'None'),
  },
];

export const WorkstationControlsPanel: React.FC<WorkstationControlsPanelProps> = ({
  config,
  selectedSlot,
  onSelectSlot,
  onChange,
  onApplyPreset,
}) => {
  const [internalView, setInternalView] = useState<PanelView>('monitor');
  const [prevSelectedSlot, setPrevSelectedSlot] = useState<DeskStudioSlot | null | undefined>(selectedSlot);

  if (selectedSlot !== prevSelectedSlot) {
    setPrevSelectedSlot(selectedSlot);
    if (selectedSlot) {
      setInternalView(selectedSlot);
    }
  }

  const activeView = internalView;

  const handleSelectSlot = (slot: PanelView) => {
    sounds.playSelect();
    setInternalView(slot);
    if (slot !== 'presets' && onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  // Stepping through slots
  const currentIndex = SLOTS.findIndex((s) => s.id === activeView);
  const handlePrevSlot = () => {
    if (currentIndex > 0) {
      handleSelectSlot(SLOTS[currentIndex - 1].id);
    } else {
      handleSelectSlot(SLOTS[SLOTS.length - 1].id);
    }
  };

  const handleNextSlot = () => {
    if (currentIndex < SLOTS.length - 1 && currentIndex >= 0) {
      handleSelectSlot(SLOTS[currentIndex + 1].id);
    } else {
      handleSelectSlot(SLOTS[0].id);
    }
  };

  const currentSlotDef = SLOTS.find((s) => s.id === activeView);

  return (
    <div className="w-full flex flex-col bg-[#11141c]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header: Slot Categories & Presets Switcher */}
      <div className="p-3 bg-black/40 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-400">
              Workspace Slots
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              6 Essentials + 3 Accessories
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSelectSlot('presets')}
              className={`apple-press flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                activeView === 'presets'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-glow'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Presets</span>
            </button>
          </div>
        </div>

        {/* Slot Grid / Pill Track */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
          {SLOTS.map((slot) => {
            const isActive = activeView === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => handleSelectSlot(slot.id)}
                className={`apple-press flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer relative ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-white shadow-md font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/10'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-base">{slot.icon}</span>
                </div>
                <span className="text-[11px] font-semibold truncate w-full mt-0.5">
                  {slot.label}
                </span>

                {slot.category === 'accessory' && !isActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumb Sub-Header with Next/Prev and Guides */}
      <div className="px-4 py-2.5 bg-black/20 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {currentSlotDef ? (
            <div className="flex items-center gap-2 text-white font-bold">
              <span className="text-base">{currentSlotDef.icon}</span>
              <span>{currentSlotDef.label}</span>
              <span className="text-zinc-500 font-normal">·</span>
              <span className="text-[11px] text-zinc-400 font-normal truncate max-w-[140px] capitalize">
                {currentSlotDef.getSummary(config)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Curated Presets</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle 3D Hotspots */}
          <button
            onClick={() => {
              sounds.playSelect();
              onChange({ showHotspots: !config.showHotspots });
            }}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              config.showHotspots
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-white/5 text-zinc-500 border-white/10'
            }`}
            title="Toggle 3D Hotspot Badges"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Ergonomics Guide */}
          <button
            onClick={() => {
              sounds.playSelect();
              onChange({ showErgonomicsGuide: !config.showErgonomicsGuide });
            }}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              config.showErgonomicsGuide
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                : 'bg-white/5 text-zinc-500 border-white/10'
            }`}
            title="Toggle Ergonomic Posture Alignment Hologram"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          {activeView !== 'presets' && (
            <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
              <button
                onClick={handlePrevSlot}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Previous Slot"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlot}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Next Slot"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Focused Customizer Editor */}
      <div className="p-4 sm:p-5 max-h-[500px] overflow-y-auto space-y-5 text-slate-200">
        {activeView === 'chair' && <ChairEditor config={config} onChange={onChange} />}
        {activeView === 'table' && <DeskTab config={config} onChange={onChange} />}
        {activeView === 'monitor' && <DisplayTab config={config} onChange={onChange} />}
        {activeView === 'keyboard' && <KeyboardEditor config={config} onChange={onChange} />}
        {activeView === 'mouse' && <MouseEditor config={config} onChange={onChange} />}
        {activeView === 'mousepad' && <MousePadEditor config={config} onChange={onChange} />}
        {activeView === 'lamp' && <LampEditor config={config} onChange={onChange} />}
        {activeView === 'plant' && <PlantEditor config={config} onChange={onChange} />}
        {activeView === 'accessory' && <ExtraAccessoryEditor config={config} onChange={onChange} />}
        {activeView === 'presets' && (
          <PresetsTab
            config={config}
            onChange={onChange}
            onApplyPreset={(preset) => {
              onApplyPreset(preset);
              handleSelectSlot('monitor');
            }}
          />
        )}
      </div>
    </div>
  );
};
