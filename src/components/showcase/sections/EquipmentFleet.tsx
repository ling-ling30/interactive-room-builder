import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';

interface EquipmentFleetProps {
  catalog: SimsProduct[];
  onToggleInteractiveWorld: () => void;
}

/** Curated equipment grid with category filter tabs (shows the first 6 matches). */
export const EquipmentFleet: React.FC<EquipmentFleetProps> = ({ catalog, onToggleInteractiveWorld }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter products for catalog section
  const displayProducts = catalog.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  }).slice(0, 6);

  return (
    <section id="catalog" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
              Official Monis Fleet
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Curated Ergonomic Equipment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sanitized, calibrated, and ready for immediate delivery in Bali
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Equipment' },
              { id: 'desks', label: 'Standing Desks' },
              { id: 'chairs', label: 'Ergonomic Chairs' },
              { id: 'tech', label: 'Displays & Tech' },
              { id: 'lighting', label: 'Lighting & Decor' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`apple-press px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map(p => (
            <div
              key={p.id}
              className="group rounded-3xl p-5 bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Photo Container */}
                <div className="aspect-[4/3] w-full rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center p-4 mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-5xl">{p.icon}</span>
                  )}

                  <span className="absolute top-3 left-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 capitalize">
                    {p.category}
                  </span>

                  {p.modelUrl && (
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                      3D Model
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                  {p.brand}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-emerald-700 transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                  {p.description}
                </p>

                {p.dimensionsText && (
                  <div className="mt-2 text-[10px] font-mono text-slate-400">
                    📐 {p.dimensionsText}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-mono text-base font-extrabold text-slate-950">
                    ${p.monthlyRent} <span className="text-xs text-slate-500 font-normal">/mo</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                    ${p.weeklyRent} /week
                  </div>
                </div>

                <button
                  onClick={onToggleInteractiveWorld}
                  className="apple-press px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Place in 3D</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onToggleInteractiveWorld}
            className="apple-press inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition shadow-sm cursor-pointer"
          >
            <span>Explore All {catalog.length} Items in 3D Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
