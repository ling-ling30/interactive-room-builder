import React from 'react';
import { X, Package, ArrowRight, Save } from 'lucide-react';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import {
  buildSetupItems,
  getSetupPricing,
  getSetupProducts,
  type RoomSetup,
} from '../../../data/roomSetups';
import { sounds } from '../../../utils/soundEffects';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { RoomLayoutPreview } from './RoomLayoutPreview';

interface SetupPresetsSheetProps {
  setups: RoomSetup[];
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  /** Applies (and confirms, when the room has furniture) a setup. */
  onApplySetup: (setup: RoomSetup) => void;
  /** Saves the current room as a new custom setup. */
  onSaveCurrentRoom: (name: string) => void;
  onClose: () => void;
}

/** Bottom sheet of bundle-style workspace setups; each is laid out in its own virtual room. */
export const SetupPresetsSheet: React.FC<SetupPresetsSheetProps> = ({
  setups,
  catalog,
  placedItems,
  onApplySetup,
  onSaveCurrentRoom,
  onClose,
}) => {
  useEscapeKey(true, onClose);

  const apply = (setup: RoomSetup) => {
    onApplySetup(setup);
    onClose();
  };

  const saveCurrent = () => {
    const name = window.prompt('Name for this setup:', 'My Setup');
    if (name === null) return;
    sounds.playPlace();
    onSaveCurrentRoom(name);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] animate-fade-in" onPointerDown={(e) => e.stopPropagation()}>
      <div className="mx-auto max-w-6xl bg-[#faf6ec]/98 backdrop-blur-xl border border-[#e2d7bd] border-b-0 rounded-t-3xl shadow-2xl px-4 sm:px-6 pt-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Workspace Setups</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Pick a ready-made room, or save yours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={saveCurrent}
              disabled={placedItems.length === 0}
              className="apple-press px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-[#e2d7bd] hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer"
              title="Save the current room as a new setup"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save current room</span>
            </button>
            <button
              onClick={onClose}
              className="apple-press p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-[#ece2c9] transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
          {setups.map((setup) => {
            const pricing = getSetupPricing(setup, catalog);
            const products = getSetupProducts(setup, catalog);
            return (
              <div
                key={setup.id}
                className="snap-start shrink-0 w-[210px] sm:w-[230px] rounded-2xl bg-white border border-[#e2d7bd] p-3 flex flex-col shadow-2xs hover:shadow-md transition"
              >
                <div className="relative">
                  <RoomLayoutPreview
                    width={setup.room.width}
                    length={setup.room.length}
                    floorStyle={setup.room.floorStyle}
                    wallColor={setup.room.wallColor}
                    backdropColor={setup.room.backdropColor}
                    items={buildSetupItems(setup, catalog)}
                    catalog={catalog}
                    showGrid={false}
                    showLabel={false}
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 border border-stone-300/70 text-stone-700">
                    {setup.badge}
                  </span>
                  <span className="absolute top-2 right-2 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    −{setup.discountPercent}%
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 mt-2.5">{setup.name}</h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-3">{setup.desc}</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {products.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#f3ecdb] text-stone-600 truncate max-w-[110px]"
                      title={p.name}
                    >
                      {p.icon} {p.name}
                    </span>
                  ))}
                  {products.length > 3 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#f3ecdb] text-stone-500">
                      +{products.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 line-through">${pricing.weekly}/wk</div>
                    <div className="font-mono text-base font-extrabold text-slate-950">
                      ${pricing.discountedWeekly}
                      <span className="text-[10px] text-slate-500 font-normal"> /wk</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                      ${pricing.discountedMonthly} /mo · {pricing.itemCount} items
                    </div>
                  </div>
                  <button
                    onClick={() => apply(setup)}
                    className="apple-press px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
