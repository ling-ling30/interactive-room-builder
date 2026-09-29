import React, { useState } from 'react';
import type { SimsProduct, PlacedFurniture, SimsCategory } from '../../../data/simsCatalog';
import {
  X,
  ArrowRightLeft,
  Check,
  Box,
} from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';

interface FurnitureSwapperDrawerProps {
  selectedItem: PlacedFurniture | null;
  catalog: SimsProduct[];
  isOpen: boolean;
  onClose: () => void;
  onSwapProduct: (instanceId: string, newProduct: SimsProduct) => void;
}

export const FurnitureSwapperDrawer: React.FC<FurnitureSwapperDrawerProps> = ({
  selectedItem,
  catalog,
  isOpen,
  onClose,
  onSwapProduct,
}) => {
  const currentProduct = selectedItem ? catalog.find((p) => p.id === selectedItem.productId) : null;
  const currentCategory = currentProduct?.category || 'desks';

  const [categoryOverride, setCategoryOverride] = useState<SimsCategory | null>(null);
  const activeCategory = categoryOverride || currentCategory;

  if (!isOpen || !selectedItem) return null;

  // Available categories
  const CATEGORIES: { id: SimsCategory; label: string; icon: string }[] = [
    { id: 'desks', label: 'Desks', icon: '🪵' },
    { id: 'chairs', label: 'Chairs', icon: '🪑' },
    { id: 'tech', label: 'Tech & Displays', icon: '🖥️' },
    { id: 'lighting', label: 'Lighting', icon: '💡' },
    { id: 'accessories', label: 'Accessories', icon: '⌨️' },
    { id: 'decor', label: 'Decor & Plants', icon: '🪴' },
  ];

  // Filter products by selected category
  const availableProducts = catalog.filter((p) => {
    if (activeCategory === 'accessories') {
      return p.category === 'accessories' || p.category === 'decor';
    }
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleSelectProduct = (newProd: SimsProduct) => {
    if (newProd.id === selectedItem.productId) return;
    sounds.playPlace();
    onSwapProduct(selectedItem.instanceId, newProd);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto transition-opacity"
      />

      {/* Slide-in Drawer */}
      <div className="relative pointer-events-auto w-full max-w-md sm:max-w-lg h-full bg-[#0c1017]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col z-10 animate-slide-left text-white select-none">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white">Swap Furniture</h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Instant Replace
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Currently equipped: <strong className="text-white">{currentProduct?.name || 'Selected Item'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="apple-press p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Swapper"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Header */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-black/20 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          {CATEGORIES.map((cat) => {
            const isSel = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playSelect();
                  setCategoryOverride(cat.id);
                }}
                className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSel
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {availableProducts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No products found in this category.
            </div>
          ) : (
            availableProducts.map((prod) => {
              const isEquipped = prod.id === selectedItem.productId;
              const has3DModel = Boolean(prod.modelUrl);

              return (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className={`p-3.5 rounded-2xl border transition flex gap-3.5 items-center cursor-pointer ${
                    isEquipped
                      ? 'bg-emerald-500/10 border-emerald-500/60 shadow-glow ring-1 ring-emerald-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  {/* Thumbnail / 3D Icon */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback to emoji icon
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-3xl">{prod.icon}</span>
                    )}

                    {has3DModel && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-black/75 text-emerald-300 border border-white/10 flex items-center gap-0.5">
                        <Box className="w-2.5 h-2.5" />
                        <span>3D</span>
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                        {prod.brand}
                      </span>
                      {isEquipped && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-slate-950">
                          CURRENT
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white truncate mt-0.5">
                      {prod.name}
                    </h3>

                    {prod.dimensionsText && (
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                        {prod.dimensionsText}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          ${prod.weeklyRent}/wk
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          (${prod.monthlyRent}/mo)
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(prod);
                        }}
                        disabled={isEquipped}
                        className={`apple-press px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Equipped</span>
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Swap</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Status / Summary */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-zinc-400">
          <span>{availableProducts.length} options available</span>
          <button
            onClick={onClose}
            className="apple-press px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
