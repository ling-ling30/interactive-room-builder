import React from 'react';

interface AdminKpiStripProps {
  totalItems: number;
  categoryCount: number;
  totalMonthlyFleet: number;
  itemsWithPhotos: number;
}

export const AdminKpiStrip: React.FC<AdminKpiStripProps> = ({
  totalItems,
  categoryCount,
  totalMonthlyFleet,
  itemsWithPhotos,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Fleet Items</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalItems}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">Ready for Bali delivery</div>
    </div>

    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active Categories</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1">{categoryCount}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">Extendable on the fly</div>
    </div>

    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Monthly Rental Potential</div>
      <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">${totalMonthlyFleet}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">Across all models</div>
    </div>

    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Items with Real Photos</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1">
        {itemsWithPhotos}
        <span className="text-xs text-slate-400 font-normal"> / {totalItems}</span>
      </div>
      <div className="text-[11px] text-emerald-600 font-medium mt-0.5">High visual fidelity</div>
    </div>
  </div>
);
