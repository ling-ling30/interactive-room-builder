import React, { useState } from 'react';
import { Package, ChevronDown } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { buildSetupItems, getSetupPricing, type RoomSetup } from '../../../data/roomSetups';
import { RoomLayoutPreview } from './RoomLayoutPreview';

interface SetupQuickPicksProps {
  setups: RoomSetup[];
  catalog: SimsProduct[];
  onPickSetup: (setup: RoomSetup) => void;
  onSeeAll: () => void;
}

/** "Start from a setup" block at the top of the furniture store: collapsible 2 x 2 grid of bundle cards. */
export const SetupQuickPicks: React.FC<SetupQuickPicksProps> = ({ setups, catalog, onPickSetup, onSeeAll }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="px-4 py-3 bg-[#faf6ec] border-b border-[#e2d7bd] shrink-0">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 cursor-pointer"
        >
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          <span>Start from a setup</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
        >
          See all →
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          {setups.slice(0, 4).map((setup) => {
            const pricing = getSetupPricing(setup, catalog);
            return (
              <button
                key={setup.id}
                type="button"
                onClick={() => onPickSetup(setup)}
                className="apple-press text-left p-2 rounded-xl bg-white border border-[#e2d7bd] hover:border-slate-400 hover:shadow-sm transition cursor-pointer flex items-center gap-2.5"
              >
                <div className="w-12 shrink-0">
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
                    className="!rounded-md"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 leading-tight truncate">{setup.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    ${pricing.discountedWeekly}/wk
                    <span className="ml-1 text-emerald-700 font-bold">−{setup.discountPercent}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
