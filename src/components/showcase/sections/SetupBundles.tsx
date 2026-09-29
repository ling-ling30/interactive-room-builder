import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';
import {
  buildSetupItems,
  getSetupPricing,
  getSetupProducts,
  type RoomSetup,
} from '../../../data/roomSetups';
import { RoomLayoutPreview } from '../../sims/ui/RoomLayoutPreview';

interface SetupBundlesProps {
  setups: RoomSetup[];
  catalog: SimsProduct[];
  /** Opens the 3D studio with this setup laid out in a 3 x 3 m room. */
  onSelectSetup: (setup: RoomSetup) => void;
}

/** Landing page bundle cards: pick a ready-made workspace setup and preview it in the 3D studio. */
export const SetupBundles: React.FC<SetupBundlesProps> = ({ setups, catalog, onSelectSetup }) => (
  <section id="setups" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
    <div className="text-center max-w-2xl mx-auto mb-10">
      <div className="text-[11px] font-mono uppercase text-emerald-700 font-bold tracking-wider">
        Workspace Bundles
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
        Choose a Ready-Made Setup
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-2">
        Every bundle comes laid out in a virtual room. Pick one, then tweak it in the 3D studio.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {setups.map((setup) => {
        const pricing = getSetupPricing(setup, catalog);
        const products = getSetupProducts(setup, catalog);
        return (
          <div
            key={setup.id}
            className="group rounded-3xl p-4 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition flex flex-col"
          >
            <div className="relative">
              <RoomLayoutPreview
                width={setup.room.width}
                length={setup.room.length}
                floorStyle={setup.room.floorStyle}
                wallColor={setup.room.wallColor}
                backdropColor={setup.room.backdropColor}
                items={buildSetupItems(setup, catalog)}
                catalog={catalog}
                showGrid={false}
                showLabel={false}
              />
              <span className="absolute top-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 border border-stone-300/70 text-stone-700">
                {setup.badge}
              </span>
              <span className="absolute top-2 right-2 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                −{setup.discountPercent}%
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-3">{setup.name}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{setup.desc}</p>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              {products.length} items · {setup.room.width} × {setup.room.length} m room
            </div>

            <div className="mt-auto pt-4 flex items-end justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono text-slate-400 line-through">${pricing.weekly}/wk</div>
                <div className="font-mono text-lg font-extrabold text-slate-950">
                  ${pricing.discountedWeekly}
                  <span className="text-xs text-slate-500 font-normal"> /week</span>
                </div>
              </div>
              <button
                onClick={() => onSelectSetup(setup)}
                className="apple-press px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>View Setup</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
