import React, { useState } from 'react';
import type { WorkstationConfig, WorkstationPreset } from '../../types/workstation';
import { DEFAULT_WORKSTATION_CONFIG } from '../../types/workstation';
import { WorkstationCanvas3D } from './WorkstationCanvas3D';
import { WorkstationControlsPanel } from './WorkstationControlsPanel';
import {
  ArrowLeft,
  Sparkles,
  Check,
  Truck
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface WorkstationStationModalProps {
  initialConfig?: Partial<WorkstationConfig>;
  onClose: () => void;
  onApplyToRoom?: (config: WorkstationConfig) => void;
}

export const WorkstationStationModal: React.FC<WorkstationStationModalProps> = ({
  initialConfig,
  onClose,
  onApplyToRoom,
}) => {
  const [config, setConfig] = useState<WorkstationConfig>(() => ({
    ...DEFAULT_WORKSTATION_CONFIG,
    ...initialConfig,
  }));

  const [activePresetName, setActivePresetName] = useState<string>('Creative 4K Video Editor');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleConfigChange = (updates: Partial<WorkstationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleApplyPreset = (preset: WorkstationPreset) => {
    setConfig((prev) => ({ ...prev, ...preset.config }));
    setActivePresetName(preset.name);
  };

  const handleSaveAndSync = () => {
    sounds.playPlace();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
    });
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      if (onApplyToRoom) {
        onApplyToRoom(config);
      }
      onClose();
    }, 900);
  };

  // Calculate live weekly rental pricing based on chosen options
  const calculateTotalWeekly = (): number => {
    let price = 35; // Base electric standing desk
    if (config.deskWidthCm === 160) price += 6;
    if (config.monitorSetup === 'ultrawide_34') price += 24;
    else if (config.monitorSetup === 'dual_27') price += 28;
    else if (config.monitorSetup === 'laptop_plus_27') price += 18;
    else price += 14;

    if (config.monitorMount === 'gas_spring_arm') price += 5;
    if (config.lightTemperature !== 'off') price += 4;
    if (config.speakersEnabled) price += 6;
    if (config.deskMat !== 'none') price += 3;
    if (config.keyboardVariant.includes('mechanical')) price += 5;
    if (config.mouseVariant === 'ergonomic_vertical') price += 4;

    return price;
  };

  const totalWeekly = calculateTotalWeekly();
  const totalMonthly = Math.round(totalWeekly * 3.75); // ~15% monthly discount

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#080a10] flex flex-col overflow-hidden select-none font-sans">
      {/* 1. Header Navigation Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/10 bg-[#0d1017]/90 backdrop-blur-xl flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="apple-press flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Station</span>
          </button>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
              Virtual Desktop Editing Station
            </span>
            <span className="hidden md:inline text-xs text-zinc-400 font-medium">
              · {activePresetName}
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              PRO STUDIO
            </span>
          </div>
        </div>

        {/* Right Action: Live Pricing & Apply Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <div className="text-xs font-bold text-emerald-400 font-mono">
              ${totalWeekly}/week <span className="text-zinc-400 font-normal">(${totalMonthly}/mo)</span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1">
              <Truck className="w-3 h-3 text-emerald-400" />
              <span>Free Delivery in Bali</span>
            </div>
          </div>

          <button
            onClick={handleSaveAndSync}
            disabled={showSavedFeedback}
            className="apple-press flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-glow transition cursor-pointer"
          >
            {showSavedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Station Configured!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply to 3D Room</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Studio Split Area */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Interactive 3D Workstation Stage */}
        <div className="flex-1 relative h-[50vh] lg:h-full w-full">
          <WorkstationCanvas3D config={config} className="w-full h-full" />

          {/* Interactive Hint Overlay */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Click & drag to inspect 360° · Scroll to zoom</span>
          </div>

          {/* Height Indicator Badge floating in 3D viewport */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-400 font-bold">Motorized Elevation</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {config.deskHeightCm.toFixed(1)} cm
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-400 font-bold">Display Layout</div>
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                {config.monitorSetup.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Workstation HUD & Customizer Controls */}
        <div className="w-full lg:w-[480px] xl:w-[520px] p-4 lg:p-6 bg-[#0a0d14]/90 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto flex-shrink-0 z-20 flex flex-col justify-start">
          <WorkstationControlsPanel
            config={config}
            onChange={handleConfigChange}
            onApplyPreset={handleApplyPreset}
          />
        </div>
      </div>
    </div>
  );
};
