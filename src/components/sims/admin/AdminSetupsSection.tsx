import React from 'react';
import { Package, Save, Copy, Trash2 } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { buildSetupItems, getSetupPricing, type RoomSetup } from '../../../data/roomSetups';
import { sounds } from '../../../utils/soundEffects';
import { useDialogs } from '../../../hooks/useDialogs';
import { RoomLayoutPreview } from '../ui/RoomLayoutPreview';

interface AdminSetupsSectionProps {
  setups: RoomSetup[];
  catalog: SimsProduct[];
  /** Items currently placed in the studio room (the source for "Save current room"). */
  currentRoomItemCount: number;
  onSaveCurrentRoom: (name: string) => void;
  onUpdate: (id: string, changes: Partial<Pick<RoomSetup, 'name' | 'badge' | 'discountPercent'>>) => void;
  onDuplicate: (setup: RoomSetup) => void;
  onDelete: (id: string) => void;
}

const INPUT_CLASS =
  'w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900';

/** CMS block: save the studio room as a setup, rename / re-price custom setups, duplicate or delete them. */
export const AdminSetupsSection: React.FC<AdminSetupsSectionProps> = ({
  setups,
  catalog,
  currentRoomItemCount,
  onSaveCurrentRoom,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const { confirm, prompt } = useDialogs();

  const saveCurrent = async () => {
    const name = await prompt({ title: 'Save setup', message: 'Name for this setup (saved from the current studio room):', defaultValue: 'My Setup' });
    if (name === null) return;
    sounds.playPlace();
    onSaveCurrentRoom(name);
  };

  return (
    <section className="mt-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Room Setups</h2>
            <p className="text-xs text-slate-500">
              Presets shown on the landing page and in the studio. Save the current studio room as a new one.
            </p>
          </div>
        </div>
        <button
          onClick={saveCurrent}
          disabled={currentRoomItemCount === 0}
          className="apple-press px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          title={currentRoomItemCount === 0 ? 'The studio room is empty' : 'Save the current studio room as a setup'}
        >
          <Save className="w-4 h-4" />
          <span>Save Current Room ({currentRoomItemCount} items)</span>
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {setups.map((setup) => {
          const pricing = getSetupPricing(setup, catalog);
          const isCustom = Boolean(setup.isCustom);
          return (
            <li key={setup.id} className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_auto] gap-3 sm:gap-4 items-center p-4">
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

              <div className="min-w-0 space-y-1.5">
                {isCustom ? (
                  <div className="grid grid-cols-[1fr_84px] sm:grid-cols-[1fr_130px_84px] gap-2">
                    <input
                      className={INPUT_CLASS}
                      value={setup.name}
                      onChange={(e) => onUpdate(setup.id, { name: e.target.value })}
                      aria-label="Setup name"
                    />
                    <input
                      className={`${INPUT_CLASS} hidden sm:block`}
                      value={setup.badge}
                      onChange={(e) => onUpdate(setup.id, { badge: e.target.value })}
                      aria-label="Badge"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <input
                        type="number"
                        min={0}
                        max={90}
                        className={INPUT_CLASS}
                        value={setup.discountPercent}
                        onChange={(e) => onUpdate(setup.id, { discountPercent: Math.max(0, Math.min(90, Number(e.target.value) || 0)) })}
                        aria-label="Discount percent"
                      />
                      %
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{setup.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Built-in
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">−{setup.discountPercent}%</span>
                  </div>
                )}
                <div className="text-[11px] font-mono text-slate-500">
                  {setup.room.width}×{setup.room.length} m · {pricing.itemCount} items ·{' '}
                  <span className="text-slate-900 font-bold">${pricing.discountedWeekly}/wk</span>
                  {pricing.discountedWeekly !== pricing.weekly && (
                    <span className="line-through ml-1 text-slate-400">${pricing.weekly}</span>
                  )}
                  <span className="ml-1">· ${pricing.discountedMonthly}/mo</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onDuplicate(setup)}
                  className="apple-press p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Duplicate as an editable setup"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {isCustom && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (await confirm({ title: 'Delete setup', message: `Delete the setup "${setup.name}"?`, confirmLabel: 'Delete', danger: true })) {
                        sounds.playDelete();
                        onDelete(setup.id);
                      }
                    }}
                    className="apple-press p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete setup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
