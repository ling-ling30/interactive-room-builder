import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import type { ProductCategory, Product } from '../../types/product';
import { Check, Plus } from 'lucide-react';

export const ProductPickerDrawer: React.FC = () => {
  const {
    products,
    config,
    selectProduct,
    toggleAccessory,
    setActiveTab,
  } = useCatalog();

  const [activeCategory, setActiveCategory] = useState<ProductCategory>('desks');

  const CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'desks', label: 'Standing Desks', icon: '🪑' },
    { id: 'chairs', label: 'Ergonomic Chairs', icon: '🛋️' },
    { id: 'monitors', label: 'Displays & Arms', icon: '🖥️' },
    { id: 'lighting', label: 'Studio Lighting', icon: '💡' },
    { id: 'accessories', label: 'Accessories & Flora', icon: '⌨️' },
  ];

  const categoryProducts = products.filter(p => p.category === activeCategory);

  const isSelected = (product: Product) => {
    switch (product.category) {
      case 'desks': return config.deskId === product.id;
      case 'chairs': return config.chairId === product.id;
      case 'monitors': return config.monitorId === product.id;
      case 'lighting': return config.lightingId === product.id;
      case 'accessories': return config.accessoryIds.includes(product.id);
      default: return false;
    }
  };

  const handleSelect = (product: Product) => {
    if (product.category === 'accessories') {
      toggleAccessory(product.id);
    } else {
      selectProduct(product.category, product.id);
    }
  };

  return (
    <div className="bg-[#14171f] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      {/* Category Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Modular Workspace Catalog</span>
            <span className="text-xs bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
              {categoryProducts.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Hot-swap equipment to instantly test ergonomics and live rental pricing
          </p>
        </div>

        {/* Quick link to Admin CMS */}
        <button
          onClick={() => setActiveTab('admin')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Furniture to Catalog</span>
        </button>
      </div>

      {/* Category Horizontal Pill Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          const count = products.filter(p => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black shadow-glow'
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

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
        {categoryProducts.map(product => {
          const active = isSelected(product);
          return (
            <div
              key={product.id}
              onClick={() => handleSelect(product)}
              className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                active
                  ? 'bg-gradient-to-b from-[#1b2230] to-[#141924] border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/40'
                  : 'bg-[#10131a] border-slate-800 hover:border-slate-700 hover:bg-[#161a24]'
              }`}
            >
              <div>
                {/* Top Image Preview & Badges */}
                <div className="relative w-full h-32 rounded-lg bg-neutral-900 overflow-hidden mb-3 border border-slate-800/80">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                  {/* Brand Tag */}
                  <span className="absolute top-2 left-2 text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md text-slate-200 px-2 py-0.5 rounded border border-white/10">
                    {product.brand}
                  </span>

                  {/* Active Selected Check Badge */}
                  {active && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded-full shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Dimensions badge */}
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-300 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    {product.dimensions}
                  </span>
                </div>

                {/* Name & Short Description */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {product.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700/60 px-1.5 py-0.5 rounded font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Price & Select Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ${product.weeklyPrice}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">/wk</span>
                    <span className="text-slate-600 mx-1">·</span>
                    <span className="text-xs font-mono text-slate-300">
                      ${product.monthlyPrice}/mo
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Deposit: ${product.deposit} (refundable)
                  </span>
                </div>

                <button
                  type="button"
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    active
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-800 text-slate-200 group-hover:bg-slate-700'
                  }`}
                >
                  {active ? (product.category === 'accessories' ? 'Equipped' : 'Selected') : 'Equip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
