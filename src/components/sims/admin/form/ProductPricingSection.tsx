import React from 'react';
import type { ProductFormApi } from '../useProductForm';

/** 4. Rental rates and deposit (USD). */
export const ProductPricingSection: React.FC<{ form: ProductFormApi }> = ({ form }) => {
  const { values, set } = form;
  const { monthlyRent, weeklyRent, deposit } = values;

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
        4. Rental Rates & Deposit (USD)
      </h4>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Monthly Rate ($/mo) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={monthlyRent}
            onChange={(e) => set('monthlyRent', parseFloat(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Weekly Rate ($/wk) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={weeklyRent}
            onChange={(e) => set('weeklyRent', parseFloat(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Refundable Deposit ($)
          </label>
          <input
            type="number"
            min="0"
            value={deposit}
            onChange={(e) => set('deposit', parseFloat(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
