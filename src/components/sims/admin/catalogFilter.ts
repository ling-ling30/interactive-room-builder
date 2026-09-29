import type { SimsProduct } from '../../../data/simsCatalog';

export type SortKey = 'name' | 'category' | 'size' | 'monthly' | 'deposit';
export type SortDir = 'asc' | 'desc';
export type LayerFilter = 'all' | 'floor' | 'surface';

export interface TableFilters {
  has3d: boolean;
  hasPhoto: boolean;
  layer: LayerFilter;
}

export const DEFAULT_FILTERS: TableFilters = { has3d: false, hasPhoto: false, layer: 'all' };

export interface CatalogQuery {
  search: string;
  category: string;
  filters: TableFilters;
  sort: { key: SortKey; dir: SortDir } | null;
}

const sortValue = (p: SimsProduct, key: SortKey): string | number => {
  switch (key) {
    case 'name': return p.name.toLowerCase();
    case 'category': return (p.category || '').toLowerCase();
    case 'size': return (p.actualDimensions?.widthM ?? p.footprint.width) * (p.actualDimensions?.depthM ?? p.footprint.depth);
    case 'monthly': return p.monthlyRent || 0;
    case 'deposit': return p.deposit || 0;
  }
};

/** Search + category / attribute filters + sort for the CMS table (pure, no pagination). */
export function filterAndSortCatalog(catalog: SimsProduct[], { search, category, filters, sort }: CatalogQuery): SimsProduct[] {
  const q = search.trim().toLowerCase();
  const rows = catalog.filter(item => {
    if (category !== 'all' && item.category?.toLowerCase() !== category.toLowerCase()) return false;
    if (filters.has3d && !item.modelUrl) return false;
    if (filters.hasPhoto && !item.imageUrl) return false;
    if (filters.layer !== 'all' && item.layer !== filters.layer) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      Boolean(item.material && item.material.toLowerCase().includes(q))
    );
  });
  if (!sort) return rows;
  const dir = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, sort.key);
    const bv = sortValue(b, sort.key);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}
