import React from 'react';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';

export const ValueProps: React.FC = () => (
  <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Built for Nomads, Remote Founders & Engineers
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-2">
        Why compromise your health when premium workspace gear can be at your door tomorrow?
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
          <Truck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">White-Glove Villa Assembly</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Our professional logistics crew brings everything directly into your villa bedroom or study nook. We unpack, assemble, plug in, and test before leaving.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Weekly Flex & Monthly Saver</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Stay in Bali for 10 days or 6 months? Switch plans seamlessly. Save up to 25% on monthly rentals, and schedule free collection on checkout day.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition">
        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Zero Wear-and-Tear Liability</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Normal tropical villa wear is completely covered. If an ergonomic chair or monitor doesn’t match your body geometry, swap it within 48 hours for free.
        </p>
      </div>
    </div>
  </section>
);
