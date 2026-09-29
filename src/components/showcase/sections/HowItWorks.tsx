import React from 'react';

export const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
    <div className="text-center max-w-2xl mx-auto mb-14">
      <div className="text-[11px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
        Simple 3-Step Process
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
        How Monis Works in Bali
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-2">
        From virtual blueprint to your villa work session in less than 24 hours
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 relative">
        <div className="text-3xl font-extrabold font-mono text-slate-200 mb-3">01</div>
        <h3 className="text-base font-bold text-slate-900">Design in 3D Space</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Set your villa bedroom or study dimensions in meters. Place desks, chairs, and monitors. Our smart magnetic center-snapping ensures everything fits before checkout.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 relative">
        <div className="text-3xl font-extrabold font-mono text-emerald-600/30 mb-3">02</div>
        <h3 className="text-base font-bold text-slate-900">Next-Day Delivery & Setup</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Monis crew arrives at your villa on schedule. We assemble the standing desk, adjust chair lumbar support, mount monitors, and handle all trash and packaging.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 relative">
        <div className="text-3xl font-extrabold font-mono text-slate-200 mb-3">03</div>
        <h3 className="text-base font-bold text-slate-900">Focus, Extend, or Return</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          Work at peak productivity during your Bali stay. Need to extend? Just ping us on WhatsApp. Moving to another villa or flying out? We pick up effortlessly.
        </p>
      </div>
    </div>
  </section>
);
