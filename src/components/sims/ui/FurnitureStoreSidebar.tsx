import React, { useState } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';
import {
  ShoppingBag,
  Search,
  X,
  ChevronRight,
  Check,
  ExternalLink,
} from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import { AppleSelect } from './AppleSelect';
import { SetupQuickPicks } from './SetupQuickPicks';
import type { RoomSetup } from '../../../data/roomSetups';

interface FurnitureStoreSidebarProps {
  catalog: SimsProduct[];
  heldProduct: SimsProduct | null;
  onSelectProduct: (product: SimsProduct | null) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  setups: RoomSetup[];
  onPickSetup: (setup: RoomSetup) => void;
  onSeeAllSetups: () => void;
}

const DEFAULT_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '🏷️' },
  { id: 'desks', label: 'Desks', icon: '🪵' },
  { id: 'chairs', label: 'Chairs', icon: '🪑' },
  { id: 'tech', label: 'Displays & Tech', icon: '🖥️' },
  { id: 'accessories', label: 'Keyboards & Accessories', icon: '⌨️' },
  { id: 'lighting', label: 'Lighting', icon: '💡' },
  { id: 'decor', label: 'Decor & Boards', icon: '🌿' },
];

export const FurnitureStoreSidebar: React.FC<FurnitureStoreSidebarProps> = ({
  catalog,
  heldProduct,
  onSelectProduct,
  isOpen,
  onToggleOpen,
  setups,
  onPickSetup,
  onSeeAllSetups,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Map of productId -> selected variantId
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});

  // Dynamic categories including any custom categories created via CMS
  const categories = React.useMemo(() => {
    const known = new Set(['desks', 'chairs', 'tech', 'accessories', 'lighting', 'decor']);
    const customCats = Array.from(new Set(catalog.map(p => p.category))).filter(c => !known.has(c));
    const extraPills = customCats.map(c => ({
      id: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
      icon: '📦',
    }));
    return [...DEFAULT_CATEGORIES, ...extraPills];
  }, [catalog]);

  // Filter products by category and search query
  const filteredProducts = catalog.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.dimensionsText && item.dimensionsText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectVariant = (productId: string, variantId: number) => {
    sounds.playSelect();
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  return (
    <>
      {/* Floating Trigger Button when Sidebar is Closed (Monis Clean Style) */}
      {!isOpen && (
        <button
          onClick={() => {
            sounds.playSelect();
            onToggleOpen();
          }}
          className="fixed right-4 top-20 z-30 apple-press bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xl hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full text-slate-900 text-xs font-bold transition group cursor-pointer"
          title="Open Furniture Catalog"
        >
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold flex items-center gap-1.5 leading-tight text-slate-900">
              Furniture Store
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {catalog.length} Monis items
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
        </button>
      )}

      {/* Main Furniture Store Sidebar (Monis Clean Light Theme) */}
      <aside
        data-catalog-dock="true"
        aria-label="Monis Furniture Store Sidebar"
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Monis Store
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                    BALI · ID
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Official rental workspace equipment
                </p>
              </div>
            </div>

            {/* Close / Collapse Button */}
            <button
              onClick={() => {
                sounds.playSelect();
                onToggleOpen();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Close catalog sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box & Category Dropdown */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1 flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-full pl-9 pr-8 py-2 text-xs font-medium focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Apple Fluid Category Popover Select */}
            <AppleSelect
              value={activeCategory}
              onChange={setActiveCategory}
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.label,
                icon: cat.icon,
                count: cat.id === 'all'
                  ? catalog.length
                  : catalog.filter((p) => p.category?.toLowerCase() === cat.id.toLowerCase()).length,
              }))}
              size="sm"
              align="right"
              buttonClassName="rounded-full max-w-[135px] bg-slate-100/90 border-slate-200/80 hover:bg-white"
            />
          </div>

          {/* Category Filter Pills (Monis Pill Style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-0.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playSelect();
                    setActiveCategory(cat.id);
                  }}
                  className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <span className="text-xs leading-none">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ready-made setups (3 x 3 m bundles) */}
        <SetupQuickPicks setups={setups} catalog={catalog} onPickSetup={onPickSetup} onSeeAll={onSeeAllSetups} />

        {/* Drag Hint Banner */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Drag items directly into the room canvas</span>
          </div>
          <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full font-bold">
            {filteredProducts.length} items
          </span>
        </div>

        {/* Product Cards List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
          {filteredProducts.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 text-center px-4">
              <span>No items found matching "{searchQuery}"</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-slate-900 font-bold hover:underline mt-1 cursor-pointer"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            filteredProducts.map((item) => {
              const isHeld = heldProduct?.id === item.id;

              // Handle active variant calculation
              const activeVariantId = selectedVariants[item.id] || (item.variants && item.variants[0]?.id);
              const activeVariant = item.variants?.find((v) => v.id === activeVariantId);
              const displayWeeklyPrice = activeVariant ? activeVariant.weeklyPrice : item.weeklyRent;
              const displayMonthlyPrice = activeVariant ? activeVariant.monthlyPrice : item.monthlyRent;

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
                  className={`group relative apple-press flex flex-col p-3.5 rounded-2xl transition-all text-left cursor-grab active:cursor-grabbing select-none ${
                    isHeld
                      ? 'bg-emerald-50/70 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  {/* Top: Image & Header Details */}
                  <div className="flex gap-3">
                    {/* Real Monis Photography Preview */}
                    <div className="relative w-24 h-24 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          loading="lazy"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-200 pointer-events-none select-none"
                        />
                      ) : (
                        <div className="text-3xl">{item.icon}</div>
                      )}
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/85 text-white">
                        {item.actualDimensions
                          ? `${item.actualDimensions.widthM}×${item.actualDimensions.depthM}m`
                          : `${item.footprint.width}×${item.footprint.depth}m`}
                      </span>
                    </div>

                    {/* Meta Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider truncate">
                            {item.brand || 'Monis'}
                          </span>
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-slate-900 transition p-0.5"
                              title="View on monis.rent"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-black transition line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                      </div>

                      {/* Dimensions Tag */}
                      {item.dimensionsText && (
                        <div className="text-[11px] text-slate-600 line-clamp-1 mt-1 font-mono font-medium">
                          📏 {item.dimensionsText}
                        </div>
                      )}

                      {/* Price Strip */}
                      <div className="flex items-baseline gap-2 mt-1.5 pt-1.5 border-t border-slate-100">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base font-extrabold font-mono text-emerald-700">
                            ${displayWeeklyPrice}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/wk</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono font-medium">
                          (${displayMonthlyPrice}/mo)
                        </span>
                        {item.deposit !== undefined && (
                          <span className="text-[10px] text-slate-500 ml-auto font-mono bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            dep ${item.deposit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size & Model Variants Chips (High-Contrast Buttons) */}
                  {item.variants && item.variants.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">
                        Available Sizes / Variants:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.variants.map((v) => {
                          const isVariantSelected =
                            (selectedVariants[item.id] || item.variants![0].id) === v.id;
                          return (
                            <button
                              key={v.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectVariant(item.id, v.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                                isVariantSelected
                                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium'
                              }`}
                            >
                              <span>{v.name}</span>
                              <span className={`ml-1 font-bold ${isVariantSelected ? 'text-emerald-300' : 'text-slate-500'}`}>
                                (${v.weeklyPrice}/wk)
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Drag Action Footer */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      {isHeld ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Selected (drag to place)
                        </span>
                      ) : (
                        <span>Drag into room or tap to place</span>
                      )}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full transition shadow-xs ${
                        isHeld
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-900 text-white group-hover:bg-black'
                      }`}
                    >
                      {isHeld ? 'Holding' : 'Place →'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
