import React from 'react';
import { Search, X } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { AppleSelect } from '../ui/AppleSelect';

interface AdminFilterBarProps {
  catalog: SimsProduct[];
  availableCategories: string[];
  search: string;
  onSearchChange: (value: string) => void;
  activeCategory: string;
  onCategoryChange: (value: string) => void;
}

const countInCategory = (catalog: SimsProduct[], cat: string) =>
  catalog.filter(c => c.category?.toLowerCase() === cat.toLowerCase()).length;

/** Search box, category dropdown and category pills. */
export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  catalog,
  availableCategories,
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}) => (
  <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
    <div className="flex items-center gap-2.5 flex-1 max-w-xl">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, brand, category, or material..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-2xs transition"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Apple-style Category Dropdown Filter */}
      <AppleSelect
        value={activeCategory}
        onChange={onCategoryChange}
        options={[
          { value: 'all', label: 'All Categories', count: catalog.length },
          ...availableCategories.map((cat) => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: countInCategory(catalog, cat),
          })),
        ]}
        size="md"
        className="min-w-[165px] shrink-0"
        buttonClassName="rounded-2xl bg-white border-slate-200"
      />
    </div>

    {/* Dynamic Category Filter Pills */}
    <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <button
        onClick={() => onCategoryChange('all')}
        className={`apple-press px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
          activeCategory === 'all'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
        }`}
      >
        All Items ({catalog.length})
      </button>

      {availableCategories.map(cat => {
        const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`apple-press px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat} ({countInCategory(catalog, cat)})
          </button>
        );
      })}
    </div>
  </div>
);
