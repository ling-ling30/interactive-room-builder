import React from 'react';

/** Idle-state hint shown while the pointer hovers over placeable furniture. */
export const HoverHintPill: React.FC = () => (
  <div className="absolute top-[104px] sm:top-20 left-1/2 -translate-x-1/2 z-20 apple-glass rounded-full px-4 py-1.5 text-xs text-zinc-300 flex items-center gap-2 animate-fade-in border border-white/15 shadow-xl pointer-events-none">
    <span className="text-emerald-400 font-bold">👆 Click to Select</span>
    <span className="text-zinc-500">·</span>
    <span className="text-emerald-300 font-semibold font-mono">⇧ Shift+Click Multi-Select</span>
    <span className="text-zinc-500">·</span>
    <span className="text-sky-300">Drag to Move</span>
  </div>
);
