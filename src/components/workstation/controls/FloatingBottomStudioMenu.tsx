import React, { useRef, useState } from 'react';
import type { DeskStudioSlot, WorkstationConfig, TabletopFinish, VirtualScreenTheme, ChairColor, LightTemperature } from '../../../types/workstation';
import { STUDIO_SLOT_CATALOG, STUDIO_SLOTS_DEF, type StudioSlotItem } from '../data/studioSlotCatalog';
import { Model3DPreview } from '../../sims/ui/Model3DPreview';
import { sounds } from '../../../utils/soundEffects';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  SlidersHorizontal,
  Sun,
  Palette,
  Laptop,
  Ban,
} from 'lucide-react';

interface FloatingBottomStudioMenuProps {
  config: WorkstationConfig;
  selectedSlot: DeskStudioSlot | null;
  onSelectSlot: (slot: DeskStudioSlot) => void;
  onChange: (updates: Partial<WorkstationConfig>) => void;
  totalWeekly: number;
}

const TABLETOP_FINISHES: { id: TabletopFinish; label: string; color: string }[] = [
  { id: 'walnut', label: 'Walnut', color: '#3d2516' },
  { id: 'oak', label: 'Oak', color: '#c49a64' },
  { id: 'carbon_black', label: 'Matte Black', color: '#181a20' },
  { id: 'white', label: 'Arctic White', color: '#f5f6f8' },
  { id: 'bamboo', label: 'Bamboo', color: '#c8985c' },
];

const CHAIR_COLORS: { id: ChairColor; label: string; color: string }[] = [
  { id: 'graphite', label: 'Graphite', color: '#27272a' },
  { id: 'mineral', label: 'Mineral', color: '#cbd5e1' },
  { id: 'onyx', label: 'Onyx', color: '#090a0f' },
  { id: 'tan', label: 'Tan Leather', color: '#b45309' },
];

const SCREEN_THEMES: { id: VirtualScreenTheme; label: string; icon: string }[] = [
  { id: 'cyber_terminal', label: 'Cyber Terminal', icon: '⚡' },
  { id: 'code_ide', label: 'TypeScript IDE', icon: '💻' },
  { id: 'video_editor', label: '4K Timeline', icon: '🎬' },
  { id: 'analytics', label: 'Financial Markets', icon: '📈' },
  { id: 'nature_wallpaper', label: 'Alpine Lake', icon: '🏔️' },
];

const LAMP_TEMPS: { id: LightTemperature; label: string; tempK: string; color: string }[] = [
  { id: 'warm_3000k', label: 'Warm Candle', tempK: '3000K', color: '#ffb56b' },
  { id: 'neutral_4500k', label: 'Studio Neutral', tempK: '4500K', color: '#fff1e0' },
  { id: 'cool_6500k', label: 'Daylight Focus', tempK: '6500K', color: '#eef6ff' },
  { id: 'off', label: 'Turn Off', tempK: 'OFF', color: '#475569' },
];

export const FloatingBottomStudioMenu: React.FC<FloatingBottomStudioMenuProps> = ({
  config,
  selectedSlot,
  onSelectSlot,
  onChange,
  totalWeekly,
}) => {
  const currentSlot: DeskStudioSlot = selectedSlot || 'table';
  const slotItems: StudioSlotItem[] = STUDIO_SLOT_CATALOG[currentSlot] || [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTweaks, setShowTweaks] = useState<boolean>(false);

  const handleScroll = (direction: 'left' | 'right') => {
    sounds.playSelect();
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -260 : 260;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleSelectSlotTab = (slot: DeskStudioSlot) => {
    sounds.playSelect();
    onSelectSlot(slot);
  };

  const handleEquipItem = (item: StudioSlotItem) => {
    sounds.playSelect();
    const updates = item.apply(config);
    onChange(updates);
  };


  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-4xl z-40 select-none pointer-events-auto">
      <div className="rounded-3xl p-3 shadow-2xl border border-slate-200/90 bg-white/92 backdrop-blur-2xl text-slate-900 transition-all">
        {/* 1. Header: 9 Slot Switcher + Tweaks Toggle + Price Pill */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 overflow-x-auto no-scrollbar">
          {/* Left: Slot Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {STUDIO_SLOTS_DEF.map((slot) => {
              const isSelected = slot.id === currentSlot;
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSelectSlotTab(slot.id)}
                  className={`apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold border-emerald-400 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/70 shadow-2xs'
                  }`}
                  title={slot.label}
                >
                  <span className="text-sm leading-none">{slot.icon}</span>
                  <span className="text-[11px]">{slot.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Quick Tweaks & Summary Pill */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                sounds.playSelect();
                setShowTweaks((prev) => !prev);
              }}
              className={`apple-press flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                showTweaks
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80 shadow-2xs'
              }`}
              title="Fine-tune slot attributes (height, colors, themes)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] hidden sm:inline">
                {showTweaks ? 'Close Tweaks' : 'Fine-Tune'}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-mono">
              <span className="text-slate-500">Setup:</span>
              <span className="text-emerald-700 font-bold">${totalWeekly}/wk</span>
            </div>
          </div>
        </div>

        {/* 2. Optional Contextual Tweaks Strip */}
        {showTweaks && (
          <div className="py-2.5 px-3 border border-slate-200/70 animate-fade-in flex flex-wrap items-center justify-between gap-3 bg-slate-50/90 rounded-2xl my-2 text-slate-800">
            {currentSlot === 'table' && (
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Motorized Height Slider */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[11px] font-mono uppercase text-slate-500 font-bold whitespace-nowrap">
                    Height: <strong className="text-emerald-700 font-mono">{config.deskHeightCm.toFixed(1)}cm</strong>
                  </span>
                  <input
                    type="range"
                    min="65"
                    max="130"
                    step="0.5"
                    value={config.deskHeightCm}
                    onChange={(e) => onChange({ deskHeightCm: parseFloat(e.target.value) })}
                    className="w-full max-w-[200px] accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onChange({ deskHeightCm: 72 })}
                      className="apple-press px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 text-[10px] text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      Sit 72
                    </button>
                    <button
                      onClick={() => onChange({ deskHeightCm: 104 })}
                      className="apple-press px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 text-[10px] text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      Stand 104
                    </button>
                  </div>
                </div>

                {/* Tabletop Wood Finish Chips */}
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-600 font-medium">Finish:</span>
                  <div className="flex items-center gap-1">
                    {TABLETOP_FINISHES.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          sounds.playSelect();
                          onChange({ tabletopFinish: f.id });
                        }}
                        style={{ backgroundColor: f.color }}
                        className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                          config.tabletopFinish === f.id
                            ? 'border-emerald-500 scale-125 ring-2 ring-emerald-400/50'
                            : 'border-slate-300 hover:scale-110'
                        }`}
                        title={f.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentSlot === 'chair' && (
              <div className="w-full flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">
                  Chair Colorway & Upholstery
                </span>
                <div className="flex items-center gap-2">
                  {CHAIR_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        sounds.playSelect();
                        onChange({ chairColor: c.id });
                      }}
                      className={`apple-press flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border transition cursor-pointer ${
                        config.chairColor === c.id
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentSlot === 'monitor' && (
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <Laptop className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-600 font-medium whitespace-nowrap">Wallpaper:</span>
                  {SCREEN_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        sounds.playSelect();
                        onChange({ virtualScreenTheme: theme.id });
                      }}
                      className={`apple-press flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap border transition cursor-pointer ${
                        config.virtualScreenTheme === theme.id
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <span>{theme.icon}</span>
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-600 font-medium">Mount:</span>
                  <button
                    onClick={() => onChange({ monitorMount: 'gas_spring_arm' })}
                    className={`apple-press px-2 py-0.5 rounded-md text-[10px] border ${
                      config.monitorMount === 'gas_spring_arm'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                    }`}
                  >
                    Gas Arm
                  </button>
                  <button
                    onClick={() => onChange({ monitorMount: 'stand' })}
                    className={`apple-press px-2 py-0.5 rounded-md text-[10px] border ${
                      config.monitorMount === 'stand'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                    }`}
                  >
                    Desk Stand
                  </button>
                </div>
              </div>
            )}

            {currentSlot === 'lamp' && (
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] text-slate-600 font-medium">Color Temperature:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {LAMP_TEMPS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        sounds.playSelect();
                        onChange({ lightTemperature: t.id });
                      }}
                      className={`apple-press flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border transition cursor-pointer ${
                        config.lightTemperature === t.id
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: t.color }} />
                      <span>{t.label} ({t.tempK})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Horizontal 3D Product Shelf */}
        <div className="relative pt-2.5 flex items-center">
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll('left')}
            className="apple-press absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 flex items-center justify-center shadow-md transition cursor-pointer"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="w-full flex items-stretch gap-3 overflow-x-auto no-scrollbar px-1 py-1 scroll-smooth"
          >
            {slotItems.map((item) => {
              const isEquipped = item.isEquipped(config);
              const isNoneItem =
                item.id.includes('none') ||
                item.id === 'acc-no-mat' ||
                item.name.toLowerCase().startsWith('no ') ||
                item.name.toLowerCase().includes('no lamp') ||
                item.name.toLowerCase().includes('no plant') ||
                item.name.toLowerCase().includes('no extra');

              return (
                <div
                  key={item.id}
                  onClick={() => handleEquipItem(item)}
                  className={`w-44 sm:w-48 flex-shrink-0 rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between group ${
                    isEquipped
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-400/50'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md'
                  }`}
                >
                  {/* Top: 3D Object Render OR Big Stop Sign for None */}
                  <div className="relative w-full h-[88px] rounded-xl overflow-hidden bg-slate-100/90 border border-slate-200/60 flex items-center justify-center mb-2 group-hover:scale-[1.02] transition-transform">
                    {isNoneItem ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-slate-50 to-slate-100/90">
                        <div className="w-11 h-11 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center text-rose-500 shadow-2xs">
                          <Ban className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          None
                        </span>
                      </div>
                    ) : (
                      <Model3DPreview
                        product={item.previewProduct}
                        minimal={true}
                        height={88}
                        autoRotateDefault={false}
                        className="w-full h-full pointer-events-auto"
                      />
                    )}
                    {isEquipped && (
                      <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Title & Brand (No distracting details for None) */}
                  <div>
                    <div
                      className="text-xs font-bold text-slate-900 leading-tight line-clamp-1 group-hover:text-emerald-700 transition-colors"
                      title={item.name}
                    >
                      {isNoneItem
                        ? item.id === 'light-none'
                          ? 'No Lamp'
                          : item.id === 'acc-no-mat'
                          ? 'No Desk Mat'
                          : item.id === 'plant-none'
                          ? 'No Plant'
                          : item.name.split('(')[0].trim()
                        : item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {isNoneItem ? 'Disabled' : item.brand}
                    </div>
                  </div>

                  {/* Bottom: Price & Action */}
                  <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-extrabold text-emerald-700 font-mono">
                        ${item.weeklyPrice}/wk
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        ${item.monthlyPrice}/mo
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquipItem(item);
                      }}
                      className={`apple-press px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        isEquipped
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-400 font-extrabold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/80'
                      }`}
                    >
                      {isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll('right')}
            className="apple-press absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 flex items-center justify-center shadow-md transition cursor-pointer"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
