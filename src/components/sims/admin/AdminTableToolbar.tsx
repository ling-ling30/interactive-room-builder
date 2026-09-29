import React from 'react';
import { Box, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { AppleSelect } from '../ui/AppleSelect';
import type { CatalogTable, LayerFilter, SortKey } from './useCatalogTable';

const SORT_OPTIONS = [
  { value: 'default', label: 'Sort: Default' },
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'name:desc', label: 'Name Z → A' },
  { value: 'monthly:asc', label: 'Price low → high' },
  { value: 'monthly:desc', label: 'Price high → low' },
  { value: 'deposit:desc', label: 'Deposit high → low' },
  { value: 'size:desc', label: 'Largest first' },
  { value: 'size:asc', label: 'Smallest first' },
  { value: 'category:asc', label: 'Category A → Z' },
];

const LAYERS: { id: LayerFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'floor', label: 'Floor' },
  { id: 'surface', label: 'Desk top' },
];

const chipClass = (active: boolean) =>
  `apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
    active
      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
  }`;

/** Second toolbar row: attribute filters, sorting, result count and reset. */
export const AdminTableToolbar: React.FC<{ table: CatalogTable }> = ({ table }) => {
  const { filters, updateFilters, sort, setSort, filteredCount, totalCount, activeFilterCount, resetAll } = table;
  const sortValue = sort ? `${sort.key}:${sort.dir}` : 'default';

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4" role="toolbar" aria-label="Table filters">
      <button type="button" onClick={() => updateFilters({ has3d: !filters.has3d })} aria-pressed={filters.has3d} className={chipClass(filters.has3d)}>
        <Box className="w-3.5 h-3.5" />
        <span>3D model</span>
      </button>
      <button type="button" onClick={() => updateFilters({ hasPhoto: !filters.hasPhoto })} aria-pressed={filters.hasPhoto} className={chipClass(filters.hasPhoto)}>
        <ImageIcon className="w-3.5 h-3.5" />
        <span>Has photo</span>
      </button>

      {/* Placement layer segmented control */}
      <div className="flex items-center p-0.5 bg-white border border-slate-200 rounded-full" role="group" aria-label="Placement layer">
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            type="button"
            onClick={() => updateFilters({ layer: layer.id })}
            aria-pressed={filters.layer === layer.id}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              filters.layer === layer.id ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <AppleSelect
        value={sortValue}
        onChange={(v) => {
          if (v === 'default') setSort(null);
          else {
            const [key, dir] = v.split(':') as [SortKey, 'asc' | 'desc'];
            setSort({ key, dir });
          }
        }}
        options={SORT_OPTIONS}
        size="md"
        className="min-w-[170px]"
        buttonClassName="rounded-full bg-white border-slate-200"
      />

      <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
        <span className="font-mono tabular-nums" aria-live="polite">
          {filteredCount === totalCount ? `${totalCount} items` : `${filteredCount} of ${totalCount} items`}
        </span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="apple-press flex items-center gap-1 px-2.5 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
