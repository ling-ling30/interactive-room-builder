import React from 'react';
import type { SimsProduct } from '../../../../data/simsCatalog';
import { AppleSelect } from '../../ui/AppleSelect';
import type { ProductFormApi } from '../useProductForm';

interface ProductInfoSectionProps {
  form: ProductFormApi;
  catalog: SimsProduct[];
  availableCategories: string[];
  isCustomCategory: boolean;
  onCustomCategoryChange: (value: boolean) => void;
}

/** 1. Product name, brand and category (existing, quick-pick or brand-new). */
export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  form,
  catalog,
  availableCategories,
  isCustomCategory,
  onCustomCategoryChange,
}) => {
  const { values, set } = form;
  const { name, brand, category } = values;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
        1. Product Information
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Ergonomic Standing Desk Pro"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Brand / Manufacturer
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => set('brand', e.target.value)}
            placeholder="e.g. Monis Pro / Herman Miller"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Category with Dropdown */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700">
            Category *
          </label>
          <button
            type="button"
            onClick={() => {
              onCustomCategoryChange(!isCustomCategory);
              if (!isCustomCategory) set('category', '');
              else set('category', availableCategories[0] || 'desks');
            }}
            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold transition cursor-pointer"
          >
            {isCustomCategory ? '← Choose Existing' : '+ New Category'}
          </button>
        </div>

        {!isCustomCategory ? (
          <AppleSelect
            value={category}
            onChange={(val) => {
              set('category', val);
              onCustomCategoryChange(false);
            }}
            allowCustom={true}
            customButtonText="+ Create New Category..."
            customPlaceholder="Type new category & press Enter..."
            onAddCustom={(newCat) => {
              set('category', newCat.toLowerCase());
              onCustomCategoryChange(false);
            }}
            options={availableCategories.map(cat => ({
              value: cat.toLowerCase(),
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              count: catalog.filter(c => c.category?.toLowerCase() === cat.toLowerCase()).length,
            }))}
            className="w-full"
            buttonClassName="bg-slate-50 border-slate-200 py-2.5 rounded-xl text-xs font-semibold"
          />
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Type new category name e.g. audio, storage, lounge..."
              autoFocus
              className="flex-1 bg-white border-2 border-emerald-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                onCustomCategoryChange(false);
                set('category', availableCategories[0] || 'desks');
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Quick Pill Selector */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] text-slate-400 font-mono">Quick picks:</span>
          {availableCategories.slice(0, 8).map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => {
                onCustomCategoryChange(false);
                set('category', cat);
              }}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition cursor-pointer capitalize ${
                !isCustomCategory && category.toLowerCase() === cat.toLowerCase()
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
