import React, { useState } from 'react';
import type { SimsProduct, SimsCategory } from '../../data/simsCatalog';
import { Plus } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface SimsCatalogBarProps {
  catalog: SimsProduct[];
  heldProduct: SimsProduct | null;
  onPickProduct: (product: SimsProduct) => void;
  onCancelHeld: () => void;
  onApplyPreset: (presetType: 'coder' | 'creator' | 'minimal' | 'clear') => void;
  onOpenAdmin: () => void;
}

export const SimsCatalogBar: React.FC<SimsCatalogBarProps> = ({
  catalog,
  heldProduct,
  onPickProduct,
  onCancelHeld,
  onApplyPreset,
  onOpenAdmin,
}) => {
  const [activeCategory, setActiveCategory] = useState<SimsCategory>('desks');

  const CATEGORIES: { id: SimsCategory; label: string; icon: string }[] = [
    { id: 'desks', label: 'Desks', icon: '🪵' },
    { id: 'chairs', label: 'Chairs', icon: '🪑' },
    { id: 'tech', label: 'Tech & Displays', icon: '🖥️' },
    { id: 'accessories', label: 'Keyboards & Accessories', icon: '⌨️' },
    { id: 'lighting', label: 'Lighting', icon: '💡' },
    { id: 'decor', label: 'Plants & Decor', icon: '🌿' },
  ];

  const categoryItems = catalog.filter(item => item.category === activeCategory);

  return (
    <div className="bg-[#131722] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
      {/* Top Header: Categories & Room Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = catalog.filter(c => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playSelect();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-glow font-bold scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Room Presets & Admin Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Quick Presets */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-slate-500 px-1.5">Presets:</span>
            <button
              onClick={() => {
                sounds.playPlace();
                onApplyPreset('coder');
              }}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Dual Coder
            </button>
            <button
              onClick={() => {
                sounds.playPlace();
                onApplyPreset('creator');
              }}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Ultrawide
            </button>
            <button
              onClick={() => {
                sounds.playDelete();
                onApplyPreset('clear');
              }}
              className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
              title="Clear all furniture"
            >
              Clear
            </button>
          </div>

          {/* Add product button leading to Admin */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Furniture</span>
          </button>
        </div>
      </div>

      {/* Furniture Buy Catalog Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-3">
        {categoryItems.map(item => {
          const isHeld = heldProduct?.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (isHeld) {
                  onCancelHeld();
                } else {
                  sounds.playSelect();
                  onPickProduct(item);
                }
              }}
              className={`group relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                isHeld
                  ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]'
                  : 'bg-[#0f121a] border-slate-800 hover:border-slate-700 hover:bg-[#161a25]'
              }`}
            >
              <div>
                {/* Top Icon & Footprint badge */}
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60 block">
                      {item.footprint.width}×{item.footprint.depth} tiles
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400/80 block mt-0.5">
                      {item.layer === 'surface' ? 'Desktop' : 'Floor'}
                    </span>
                  </div>
                </div>

                {/* Name & Brand */}
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {item.name}
                </h4>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {item.brand}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    ${item.weeklyRent}
                    <span className="text-[10px] text-slate-400 font-normal">/wk</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ${item.monthlyRent}/mo
                  </div>
                </div>

                <button
                  type="button"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    isHeld
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-200 group-hover:bg-emerald-500 group-hover:text-black'
                  }`}
                >
                  {isHeld ? 'Cancel' : 'Place'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
