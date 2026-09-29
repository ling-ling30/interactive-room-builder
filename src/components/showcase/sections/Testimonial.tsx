import React from 'react';
import { Star } from 'lucide-react';

export const Testimonial: React.FC = () => (
  <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
    <div className="inline-flex items-center gap-1 text-amber-500 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
    <blockquote className="text-lg sm:text-2xl font-extrabold text-slate-900 max-w-3xl mx-auto leading-snug">
      "Having an authentic dual-motor standing desk and Aeron chair delivered right to our villa in Pererenan made a 2-month engineering sprint actually healthy."
    </blockquote>
    <div className="mt-4 text-xs text-slate-600 font-medium">
      <strong className="text-slate-900">Julian K.</strong> — Remote Staff Engineer, Pererenan Villa
    </div>
  </section>
);
