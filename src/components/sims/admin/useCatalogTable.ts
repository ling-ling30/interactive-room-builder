import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';

export type SortKey = 'name' | 'category' | 'size' | 'monthly' | 'deposit';
export type SortDir = 'asc' | 'desc';
export type LayerFilter = 'all' | 'floor' | 'surface';

export const PAGE_SIZES = [10, 25, 50] as const;
const PAGE_SIZE_KEY = 'monis_cms_page_size_v1';

export interface TableFilters {
  has3d: boolean;
  hasPhoto: boolean;
  layer: LayerFilter;
}

const DEFAULT_FILTERS: TableFilters = { has3d: false, hasPhoto: false, layer: 'all' };

function loadPageSize(): number {
  try {
    const saved = Number(localStorage.getItem(PAGE_SIZE_KEY));
    return (PAGE_SIZES as readonly number[]).includes(saved) ? saved : PAGE_SIZES[0];
  } catch {
    return PAGE_SIZES[0];
  }
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

/** Search, category + attribute filters, sorting and pagination for the CMS catalog table. */
export function useCatalogTable(catalog: SimsProduct[]) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<number>(loadPageSize);

  const filtered = useMemo(() => {
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
  }, [catalog, search, category, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Filters / deletions can shrink the list: never sit on a page that no longer exists
  const currentPage = Math.min(page, pageCount);
  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [page, currentPage]);

  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  const resetPage = useCallback(() => setPage(1), []);

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (filters.has3d ? 1 : 0) +
    (filters.hasPhoto ? 1 : 0) +
    (filters.layer !== 'all' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return {
    search,
    setSearch: (value: string) => { setSearch(value); resetPage(); },
    category,
    setCategory: (value: string) => { setCategory(value); resetPage(); },
    filters,
    updateFilters: (changes: Partial<TableFilters>) => { setFilters(prev => ({ ...prev, ...changes })); resetPage(); },
    sort,
    setSort: (next: { key: SortKey; dir: SortDir } | null) => { setSort(next); resetPage(); },
    /** Header click: asc -> desc -> unsorted. */
    toggleSort: (key: SortKey) => {
      setSort(prev => (prev?.key !== key ? { key, dir: 'asc' } : prev.dir === 'asc' ? { key, dir: 'desc' } : null));
      resetPage();
    },
    page: currentPage,
    setPage,
    pageCount,
    pageSize,
    setPageSize: (size: number) => {
      setPageSizeState(size);
      resetPage();
      try {
        localStorage.setItem(PAGE_SIZE_KEY, String(size));
      } catch {
        // storage unavailable: page size just is not remembered
      }
    },
    totalCount: catalog.length,
    filteredCount: filtered.length,
    pageItems,
    activeFilterCount,
    resetAll: () => {
      setSearch('');
      setCategory('all');
      setFilters(DEFAULT_FILTERS);
      setSort(null);
      resetPage();
    },
  };
}

export type CatalogTable = ReturnType<typeof useCatalogTable>;
