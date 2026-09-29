import { describe, expect, it } from 'vitest';
import type { SimsProduct } from '../data/simsCatalog';
import { DEFAULT_FILTERS, filterAndSortCatalog } from '../components/sims/admin/catalogFilter';

const make = (over: Partial<SimsProduct>): SimsProduct => ({
  id: 'p', name: 'Item', brand: 'Monis', category: 'desks', footprint: { width: 1, depth: 1 },
  weeklyRent: 1, monthlyRent: 10, deposit: 5, layer: 'floor', color: '#fff', colorOptions: [],
  modelType: 'standing_desk', icon: '', description: '', ...over,
} as SimsProduct);

const catalog = [
  make({ id: 'a', name: 'Alpha Desk', monthlyRent: 30, modelUrl: '/a.glb', imageUrl: 'a.jpg' }),
  make({ id: 'b', name: 'Beta Chair', category: 'chairs', monthlyRent: 10 }),
  make({ id: 'c', name: 'Gamma Lamp', category: 'lighting', layer: 'surface', monthlyRent: 20, material: 'Brass' }),
];
const q = (over = {}) => ({ search: '', category: 'all', filters: DEFAULT_FILTERS, sort: null, ...over });
const ids = (rows: SimsProduct[]) => rows.map(r => r.id);

describe('filterAndSortCatalog', () => {
  it('returns everything by default', () => {
    expect(ids(filterAndSortCatalog(catalog, q()))).toEqual(['a', 'b', 'c']);
  });
  it('searches name, category and material', () => {
    expect(ids(filterAndSortCatalog(catalog, q({ search: 'gamma' })))).toEqual(['c']);
    expect(ids(filterAndSortCatalog(catalog, q({ search: 'brass' })))).toEqual(['c']);
    expect(ids(filterAndSortCatalog(catalog, q({ search: 'chairs' })))).toEqual(['b']);
  });
  it('filters by category case-insensitively', () => {
    expect(ids(filterAndSortCatalog(catalog, q({ category: 'CHAIRS' })))).toEqual(['b']);
  });
  it('filters by 3D, photo and layer', () => {
    expect(ids(filterAndSortCatalog(catalog, q({ filters: { ...DEFAULT_FILTERS, has3d: true } })))).toEqual(['a']);
    expect(ids(filterAndSortCatalog(catalog, q({ filters: { ...DEFAULT_FILTERS, hasPhoto: true } })))).toEqual(['a']);
    expect(ids(filterAndSortCatalog(catalog, q({ filters: { ...DEFAULT_FILTERS, layer: 'surface' } })))).toEqual(['c']);
  });
  it('sorts asc / desc without mutating the input', () => {
    const before = ids(catalog);
    expect(ids(filterAndSortCatalog(catalog, q({ sort: { key: 'monthly', dir: 'asc' } })))).toEqual(['b', 'c', 'a']);
    expect(ids(filterAndSortCatalog(catalog, q({ sort: { key: 'name', dir: 'desc' } })))).toEqual(['c', 'b', 'a']);
    expect(ids(catalog)).toEqual(before);
  });
});
