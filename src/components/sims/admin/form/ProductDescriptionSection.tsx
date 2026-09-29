import React from 'react';
import type { ProductFormApi } from '../useProductForm';

/** 5. Material and customer-facing description. */
export const ProductDescriptionSection: React.FC<{ form: ProductFormApi }> = ({ form }) => {
  const { values, set } = form;

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Material & Build
          </label>
          <input
            type="text"
            value={values.material}
            onChange={(e) => set('material', e.target.value)}
            placeholder="e.g. Aluminum chassis, solid oak tabletop"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Product Description
          </label>
          <input
            type="text"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief customer-facing feature overview"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
