import React, { useState } from 'react';
import type { WorkstationConfig, WorkstationPreset, DeskStudioSlot } from '../../types/workstation';
import { DEFAULT_WORKSTATION_CONFIG, WORKSTATION_PRESETS } from '../../types/workstation';
import { WorkstationCanvas3D } from './WorkstationCanvas3D';
import { FloatingBottomStudioMenu } from './controls/FloatingBottomStudioMenu';
import {
  ArrowLeft,
  Sparkles,
  Check,
  Truck,
  Copy,
  Eye,
  ChevronDown,
  ShoppingBag,
  Layers,
  X,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import { SIMS_CATALOG } from '../../data/simsCatalog';
import type { SpaceParameters } from '../../types/space';
import { DEFAULT_SPACE } from '../../types/space';
import { CartReviewModal } from '../sims/CartReviewModal';
import { buildWorkstationPlacedItems } from '../../utils/workstationSetupConverter';

interface WorkstationStationModalProps {
  initialConfig?: Partial<WorkstationConfig>;
  catalog?: SimsProduct[];
  spaceParams?: SpaceParameters;
  existingPlacedItems?: PlacedFurniture[];
  onClose: () => void;
  onApplyToRoom?: (config: WorkstationConfig, placedItems: PlacedFurniture[], mode?: 'merge' | 'replace') => void;
}

export const WorkstationStationModal: React.FC<WorkstationStationModalProps> = ({
  initialConfig,
  catalog,
  spaceParams,
  existingPlacedItems,
  onClose,
  onApplyToRoom,
}) => {
  const [config, setConfig] = useState<WorkstationConfig>(() => ({
    ...DEFAULT_WORKSTATION_CONFIG,
    ...initialConfig,
  }));

  const [selectedSlot, setSelectedSlot] = useState<DeskStudioSlot | null>(null);
  const [activePresetName, setActivePresetName] = useState<string>('Creative 4K Video Editor');
  const [showPresetsMenu, setShowPresetsMenu] = useState<boolean>(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmApplyOpen, setIsConfirmApplyOpen] = useState(false);
  const [applyMode, setApplyMode] = useState<'merge' | 'replace'>('merge');

  const effectiveCatalog = catalog && catalog.length > 0 ? catalog : SIMS_CATALOG;
  const effectiveSpaceParams = spaceParams || DEFAULT_SPACE;

  const handleConfigChange = (updates: Partial<WorkstationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleApplyPreset = (preset: WorkstationPreset) => {
    sounds.playSelect();
    setConfig((prev) => ({ ...prev, ...preset.config }));
    setActivePresetName(preset.name);
    setShowPresetsMenu(false);
  };

  const handleApplyClick = () => {
    sounds.playSelect();
    if (existingPlacedItems && existingPlacedItems.length > 0) {
      setIsConfirmApplyOpen(true);
    } else {
      executeApply('replace');
    }
  };

  const executeApply = (mode: 'merge' | 'replace') => {
    setIsConfirmApplyOpen(false);
    sounds.playPlace();
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.75 },
    });
    setShowSavedFeedback(true);
    const placedItems = buildWorkstationPlacedItems(config, effectiveCatalog);
    setTimeout(() => {
      setShowSavedFeedback(false);
      if (onApplyToRoom) {
        onApplyToRoom(config, placedItems, mode);
      }
      onClose();
    }, 850);
  };

  const handleCopySpec = () => {
    sounds.playSelect();
    const spec = [
      `Desk Studio Setup: ${activePresetName}`,
      `• Desk: ${config.tabletopFinish.toUpperCase()} tabletop (${config.deskWidthCm}cm × ${config.deskDepthCm}cm), height ${config.deskHeightCm}cm`,
      `• Chair: ${config.chairName || 'Ergonomic Office Chair'} (${config.chairColor || 'graphite'})`,
      `• Display: ${config.monitorSetup.replace('_', ' ')} (${config.virtualScreenTheme})`,
      `• Keyboard: ${config.keyboardVariant.replace('_', ' ')} · Mouse: ${config.mouseVariant.replace('_', ' ')}`,
      `• Lamp: ${config.lampVariant || 'screenbar'} · Plant: ${config.plantVariant}`,
    ].join('\n');

    navigator.clipboard?.writeText(spec).then(() => {
      setShowCopiedFeedback(true);
      setTimeout(() => setShowCopiedFeedback(false), 2000);
    }).catch(() => {
      // fallback
    });
  };

  // Calculate live weekly rental pricing based on chosen options
  const calculateTotalWeekly = (): number => {
    let price = 35; // Base electric standing desk

    // Width
    if (config.deskWidthCm === 160) price += 6;
    else if (config.deskWidthCm === 180) price += 12;

    // Chair
    const chair = config.chairModel || 'aeron_mesh';
    if (chair === 'aeron_mesh') price += 28;
    else if (chair === 'office_executive') price += 24;
    else if (chair === 'gaming_racing') price += 20;
    else price += 22;

    // Monitors
    if (config.monitorSetup === 'ultrawide_34') price += 24;
    else if (config.monitorSetup === 'dual_27') price += 28;
    else if (config.monitorSetup === 'laptop_plus_27') price += 18;
    else price += 14;

    if (config.monitorMount === 'gas_spring_arm') price += 5;

    // Lamp
    const lamp = config.lampVariant || 'screenbar';
    if (lamp !== 'none' && config.lightTemperature !== 'off') price += 5;

    // Extras
    const slot3 = config.accessorySlot3 || (config.speakersEnabled ? 'speakers' : 'none');
    if (slot3 === 'speakers' || config.speakersEnabled) price += 6;
    if (slot3 === 'headphones') price += 5;

    // Mat & Peripherals
    if (config.deskMat !== 'none') price += 3;
    if (config.keyboardVariant.includes('mechanical') || config.keyboardVariant.includes('gaming')) price += 5;
    if (config.mouseVariant === 'ergonomic_vertical' || config.mouseVariant === 'precision_mx') price += 4;

    return price;
  };

  const totalWeekly = calculateTotalWeekly();
  const totalMonthly = Math.round(totalWeekly * 3.75); // ~15% monthly discount

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#f0ece1] flex flex-col overflow-hidden select-none font-sans text-slate-900">
      {/* 1. Refined Apple Top Header Navigation Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl flex items-center justify-between z-30 flex-shrink-0 shadow-2xs">
        {/* Left: Back + Title + Presets Popover */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="apple-press flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200/80 shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Studio</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="relative">
            <button
              onClick={() => {
                sounds.playSelect();
                setShowPresetsMenu((prev) => !prev);
              }}
              className="apple-press flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/80 transition cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-bold leading-none">
                  Desk Studio Pro
                </span>
                <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1 mt-0.5">
                  <span>{activePresetName}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </button>

            {/* Presets Dropdown */}
            {showPresetsMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl p-2 border border-slate-200/90 shadow-2xl z-50 animate-fade-in text-slate-900">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1 font-bold">
                  Curated Studio Presets
                </div>
                <div className="space-y-1">
                  {WORKSTATION_PRESETS.map((preset) => {
                    const isActive = preset.name === activePresetName;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`apple-press w-full text-left p-2 rounded-xl transition flex items-center justify-between cursor-pointer border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-900 font-bold border-emerald-300 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{preset.icon}</span>
                          <div>
                            <div className="text-xs font-semibold leading-tight text-slate-900">{preset.name}</div>
                            <div className="text-[10px] text-emerald-600 font-mono font-medium">${preset.weeklyRent}/wk</div>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Viewport Overlays (Hotspots Toggle) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-full border border-slate-200/80">
          <button
            onClick={() => {
              sounds.playSelect();
              handleConfigChange({ showHotspots: config.showHotspots === false });
            }}
            className={`apple-press flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
              config.showHotspots !== false
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
            title="Toggle floating 3D slot hotspot badges"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hotspots</span>
          </button>
        </div>

        {/* Right: Live Pricing + Copy Spec + Checkout + Apply CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <div className="text-xs font-bold text-emerald-600 font-mono">
              ${totalWeekly}/week <span className="text-slate-400 font-normal">(${totalMonthly}/mo)</span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
              <Truck className="w-3 h-3 text-emerald-600" />
              <span>White-Glove Bali Delivery</span>
            </div>
          </div>

          <button
            onClick={handleCopySpec}
            className="apple-press hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200/80 transition cursor-pointer shadow-2xs"
            title="Copy Setup Specification"
          >
            {showCopiedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{showCopiedFeedback ? 'Copied!' : 'Copy Spec'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playSelect();
              setIsCheckoutOpen(true);
            }}
            className="apple-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition cursor-pointer"
            title="Review Equipment & Rent Online"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Checkout</span>
          </button>

          <button
            onClick={handleApplyClick}
            disabled={showSavedFeedback}
            className="apple-press flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-md transition cursor-pointer"
          >
            {showSavedFeedback ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Station Configured!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Apply to 3D Villa Room</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Full-Screen Interactive 3D Workstation Stage */}
      <main className="flex-1 relative w-full h-full overflow-hidden bg-[#f0ece1]">
        <WorkstationCanvas3D
          config={config}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          showHotspots={config.showHotspots !== false && !isConfirmApplyOpen && !isCheckoutOpen}
          className="w-full h-full"
        />

        {/* 3. Floating Bottom Studio Menu (renders 3D object, name, price, tweaks) */}
        <FloatingBottomStudioMenu
          config={config}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          onChange={handleConfigChange}
          totalWeekly={totalWeekly}
        />
      </main>

      {/* 4. Rental Checkout Modal for Desk Studio */}
      {isCheckoutOpen && (
        <CartReviewModal
          catalog={effectiveCatalog}
          placedItems={buildWorkstationPlacedItems(config, effectiveCatalog)}
          spaceParams={effectiveSpaceParams}
          onRemoveItem={() => {}}
          onClearAll={() => setIsCheckoutOpen(false)}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* 5. Room Preservation Confirmation Modal */}
      {isConfirmApplyOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200/90 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Apply to Villa Room</h3>
                  <p className="text-xs text-slate-500">
                    Your room currently has <span className="font-semibold text-slate-800">{existingPlacedItems?.length} items</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmApplyOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Option 1: Update Workstation Only (Merge) */}
              <button
                type="button"
                onClick={() => setApplyMode('merge')}
                className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                  applyMode === 'merge'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                  applyMode === 'merge' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                }`}>
                  {applyMode === 'merge' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Update Workstation Only</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Preserves existing sofas, beds, rugs, plants, and shelving. Only replaces the desk, chair, monitors, and peripherals.
                  </p>
                </div>
              </button>

              {/* Option 2: Replace All */}
              <button
                type="button"
                onClick={() => setApplyMode('replace')}
                className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                  applyMode === 'replace'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                  applyMode === 'replace' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                }`}>
                  {applyMode === 'replace' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Replace Entire Room</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Clears other furniture and places this workstation setup on a clean canvas.
                  </p>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmApplyOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeApply(applyMode)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm & Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
