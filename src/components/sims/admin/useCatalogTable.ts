import { useCallback, useMemo, useState } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';

import { DEFAULT_FILTERS, filterAndSortCatalog, type SortDir, type SortKey, type TableFilters } from './catalogFilter';

export type { LayerFilter, SortDir, SortKey, TableFilters } from './catalogFilter';

export const PAGE_SIZES = [10, 25, 50] as const;
const PAGE_SIZE_KEY = 'monis_cms_page_size_v1';

function loadPageSize(): number {
  try {
    const saved = Number(localStorage.getItem(PAGE_SIZE_KEY));
    return (PAGE_SIZES as readonly number[]).includes(saved) ? saved : PAGE_SIZES[0];
  } catch {
    return PAGE_SIZES[0];
  }
}

/** Search, category + attribute filters, sorting and pagination for the CMS catalog table. */
export function useCatalogTable(catalog: SimsProduct[]) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<number>(loadPageSize);

  const filtered = useMemo(
    () => filterAndSortCatalog(catalog, { search, category, filters, sort }),
    [catalog, search, category, filters, sort]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Filters / deletions can shrink the list: never sit on a page that no longer exists
  const currentPage = Math.min(page, pageCount);

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
