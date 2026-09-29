import React from 'react';
import { NumberInput } from '../../../ui/NumberInput';
import type { ProductFormApi } from '../useProductForm';
import { FieldError } from './FieldError';
import { fieldBorder } from './fieldStyles';

const inputClass = (error: string | undefined, tone: string) =>
  `w-full bg-slate-50 border ${fieldBorder(error)} rounded-xl px-3 py-2 text-xs font-mono font-bold ${tone} focus:bg-white focus:outline-none`;

/** 4. Rental rates and deposit (USD). */
export const ProductPricingSection: React.FC<{ form: ProductFormApi }> = ({ form }) => {
  const { values, set, errors } = form;
  const { monthlyRent, weeklyRent, deposit } = values;

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
        4. Rental Rates & Deposit (USD)
      </h4>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="pf-monthly" className="text-[11px] font-bold text-slate-700 block mb-1">
            Monthly Rate ($/mo) *
          </label>
          <NumberInput
            id="pf-monthly"
            value={monthlyRent}
            onChange={(v) => set('monthlyRent', v)}
            aria-invalid={Boolean(errors.monthlyRent)}
            className={inputClass(errors.monthlyRent, 'text-emerald-700')}
          />
          <FieldError message={errors.monthlyRent} />
        </div>

        <div>
          <label htmlFor="pf-weekly" className="text-[11px] font-bold text-slate-700 block mb-1">
            Weekly Rate ($/wk) *
          </label>
          <NumberInput
            id="pf-weekly"
            value={weeklyRent}
            onChange={(v) => set('weeklyRent', v)}
            aria-invalid={Boolean(errors.weeklyRent)}
            className={inputClass(errors.weeklyRent, 'text-emerald-700')}
          />
          <FieldError message={errors.weeklyRent} />
        </div>

        <div>
          <label htmlFor="pf-deposit" className="text-[11px] font-bold text-slate-700 block mb-1">
            Refundable Deposit ($)
          </label>
          <NumberInput
            id="pf-deposit"
            value={deposit}
            onChange={(v) => set('deposit', v)}
            placeholder="0"
            aria-invalid={Boolean(errors.deposit)}
            className={inputClass(errors.deposit, 'text-slate-900')}
          />
          <FieldError message={errors.deposit} />
        </div>
      </div>
    </div>
  );
};
