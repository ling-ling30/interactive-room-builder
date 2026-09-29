import React from 'react';
import { BALI_DELIVERY_ZONES } from '../../../data/defaultCatalog';

export const DeliveryZones: React.FC = () => (
  <section id="destinations" className="py-14 px-4 sm:px-8 bg-slate-100/70 border-t border-slate-200">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900">Covered Delivery Zones Across Bali</h3>
        <p className="text-xs text-slate-500 mt-1">Daily routes with verified villa access</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {BALI_DELIVERY_ZONES.map(z => (
          <div key={z.id} className="p-3 bg-white rounded-2xl border border-slate-200 text-center shadow-2xs">
            <div className="font-bold text-slate-900">{z.name.split('&')[0]}</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              {z.fee === 0 ? 'FREE Delivery' : `+$${z.fee}`}
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">{z.time.split('·')[1]}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
