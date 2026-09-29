import React, { useState } from 'react';
import type { SimsProduct, SimsCategory } from '../../../data/simsCatalog';
import {
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Maximize2,
  Minimize2,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';

export type SheetHeightState = 'collapsed' | 'half' | 'full';

interface FurnitureStoreSheetProps {
  catalog: SimsProduct[];
  heldProduct: SimsProduct | null;
  onSelectProduct: (product: SimsProduct | null) => void;
  isOpen?: boolean;
}

const CATEGORIES: { id: SimsCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '✨' },
  { id: 'desks', label: 'Desks', icon: '🪵' },
  { id: 'chairs', label: 'Chairs', icon: '🪑' },
  { id: 'tech', label: 'Displays & Tech', icon: '🖥️' },
  { id: 'accessories', label: 'Keyboards & Accessories', icon: '⌨️' },
  { id: 'lighting', label: 'Lighting', icon: '💡' },
  { id: 'decor', label: 'Decor & Plants', icon: '🌿' },
];

export const FurnitureStoreSheet: React.FC<FurnitureStoreSheetProps> = ({
  catalog,
  heldProduct,
  onSelectProduct,
}) => {
  const [sheetState, setSheetState] = useState<SheetHeightState>('half');
  const [activeCategory, setActiveCategory] = useState<SimsCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by category and search
  const filteredProducts = catalog.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = () => {
    sounds.playSelect();
    if (sheetState === 'collapsed') {
      setSheetState('half');
    } else if (sheetState === 'half') {
      setSheetState('full');
    } else {
      setSheetState('half');
    }
  };

  const toggleCollapse = () => {
    sounds.playSelect();
    if (sheetState === 'full') {
      setSheetState('half');
    } else {
      setSheetState('collapsed');
    }
  };

  return (
    <aside
      data-catalog-dock="true"
      aria-label="Furniture Store Sheet"
      className={`fixed bottom-0 inset-x-0 z-30 transition-all duration-300 ease-out select-none flex flex-col ${
        sheetState === 'collapsed'
          ? 'h-14 sm:h-16'
          : sheetState === 'half'
          ? 'h-[360px] sm:h-[380px]'
          : 'h-[75vh]'
      }`}
    >
      <div className="w-full h-full bg-[#0c0f18]/94 backdrop-blur-2xl border-t border-white/[0.14] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] rounded-t-[28px] sm:rounded-t-[36px] flex flex-col overflow-hidden">
        {/* Grabber Handle & Header Strip */}
        <div
          onClick={sheetState === 'collapsed' ? toggleExpand : undefined}
          className={`shrink-0 flex flex-col items-center pt-2 pb-2 px-4 sm:px-8 border-b border-white/[0.08] ${
            sheetState === 'collapsed' ? 'cursor-pointer hover:bg-white/[0.03]' : ''
          }`}
        >
          {/* iOS Style Grabber Pill */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (sheetState === 'collapsed') setSheetState('half');
              else if (sheetState === 'half') setSheetState('collapsed');
              else setSheetState('half');
            }}
            className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-emerald-400 transition cursor-pointer mb-2"
            title="Drag or click to resize sheet"
          />

          <div className="w-full flex items-center justify-between gap-3">
            {/* Left: Store Title & Count */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Furniture Store</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono px-1.5 py-0.2 rounded-full font-normal">
                      {catalog.length} items
                    </span>
                  </h3>
                </div>
                <p className="text-[10px] text-zinc-400 hidden sm:block">
                  Drag items straight into the room or tap to place
                </p>
              </div>
            </div>

            {/* Center Quick Notice for Collapsed State */}
            {sheetState === 'collapsed' && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-zinc-200">Tap to open catalog</span>
              </div>
            )}

            {/* Right: Expand/Collapse & Close controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {sheetState !== 'collapsed' && (
                <>
                  <button
                    onClick={toggleExpand}
                    className="p-1.5 rounded-xl apple-press text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                    title={sheetState === 'full' ? 'Collapse to half view' : 'Expand full view'}
                  >
                    {sheetState === 'full' ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-xl apple-press text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                    title="Minimize sheet"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </>
              )}

              {sheetState === 'collapsed' && (
                <button
                  onClick={toggleExpand}
                  className="apple-press flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white text-xs font-semibold cursor-pointer border border-white/10"
                >
                  <span>Open</span>
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Sheet Content (Visible when not collapsed) */}
        {sheetState !== 'collapsed' && (
          <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-8 py-3">
            {/* Toolbar: Category Pills & Search */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5 pb-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sounds.playSelect();
                        setActiveCategory(cat.id);
                      }}
                      className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-white text-black font-bold shadow-md'
                          : 'text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06]'
                      }`}
                    >
                      <span className="text-sm leading-none">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search furniture..."
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-full pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Products Layout */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 pb-4">
              {filteredProducts.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-xs gap-1">
                  <span>No furniture found matching "{searchQuery}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="text-emerald-400 hover:underline mt-1 cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    sheetState === 'full'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
                  }
                >
                  {filteredProducts.map((item) => {
                    const isHeld = heldProduct?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onPointerDown={(e) => {
                          if (e.button === 0) {
                            sounds.playSelect();
                            onSelectProduct(item);
                          }
                        }}
                        onClick={() => {
                          if (isHeld) {
                            onSelectProduct(null);
                          } else {
                            sounds.playSelect();
                            onSelectProduct(item);
                          }
                        }}
                        className={`group relative apple-press flex flex-col justify-between p-3 rounded-2xl border transition text-left cursor-grab active:cursor-grabbing select-none ${
                          isHeld
                            ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/50 shadow-glow'
                            : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.18]'
                        }`}
                      >
                        {/* Top: Icon & Category Tag */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0">
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 capitalize">
                            {item.footprint.width}×{item.footprint.depth} tiles
                          </span>
                        </div>

                        {/* Middle: Name & Brand */}
                        <div className="mb-2">
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition leading-snug line-clamp-2">
                            {item.name}
                          </div>
                          {item.brand && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              {item.brand}
                            </div>
                          )}
                        </div>

                        {/* Bottom: Rent Price & Drag Hint */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-emerald-400 font-bold font-mono">
                              ${item.weeklyRent}
                            </span>
                            <span className="text-[10px] text-zinc-400">/wk</span>
                          </div>

                          <div className="text-[10px] text-zinc-400 group-hover:text-white flex items-center gap-1 font-mono">
                            <span>Drag</span>
                            <span>→</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
