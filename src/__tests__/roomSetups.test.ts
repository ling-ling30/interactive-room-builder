import { describe, expect, it } from 'vitest';
import { SIMS_CATALOG } from '../data/simsCatalog';
import {
  DEFAULT_ROOM_SETUPS,
  buildSetupItems,
  createSetupFromRoom,
  getSetupPricing,
} from '../data/roomSetups';

describe('DEFAULT_ROOM_SETUPS', () => {
  it('reference only products that exist in the catalog', () => {
    const ids = new Set(SIMS_CATALOG.map(p => p.id));
    for (const setup of DEFAULT_ROOM_SETUPS) {
      for (const item of setup.items) expect(ids.has(item.productId), `${setup.id}: ${item.productId}`).toBe(true);
    }
  });
});

describe('buildSetupItems', () => {
  for (const setup of DEFAULT_ROOM_SETUPS) {
    it(`${setup.id}: places every item body inside the room with unique ids`, () => {
      const items = buildSetupItems(setup, SIMS_CATALOG);
      expect(items.length).toBe(setup.items.length);
      expect(new Set(items.map(i => i.instanceId)).size).toBe(items.length);
      // gridX/gridZ are the footprint's top-left; the real body (actualDimensions) must be inside the room
      for (const it of items) {
        const p = SIMS_CATALOG.find(c => c.id === it.productId)!;
        const quarter = Math.round(it.rotation / 90) % 2 !== 0;
        const w = (p.actualDimensions?.widthM ?? p.footprint.width);
        const d = (p.actualDimensions?.depthM ?? p.footprint.depth);
        const halfX = (quarter ? d : w) / 2;
        const halfZ = (quarter ? w : d) / 2;
        const cx = it.gridX + p.footprint.width / 2;
        const cz = it.gridZ + p.footprint.depth / 2;
        const eps = 1e-6;
        expect(cx - halfX).toBeGreaterThanOrEqual(-eps);
        expect(cz - halfZ).toBeGreaterThanOrEqual(-eps);
        expect(cx + halfX).toBeLessThanOrEqual(setup.room.width + eps);
        expect(cz + halfZ).toBeLessThanOrEqual(setup.room.length + eps);
      }
    });
  }

  it('ignores products that are not in the catalog', () => {
    const base = DEFAULT_ROOM_SETUPS[0];
    const setup = { ...base, items: [...base.items, { productId: 'nope', role: 'right' as const }] };
    const items = buildSetupItems(setup, SIMS_CATALOG);
    expect(items.every(i => i.productId !== 'nope')).toBe(true);
  });
});

describe('getSetupPricing', () => {
  it('applies the bundle discount to weekly and monthly totals', () => {
    const setup = { ...DEFAULT_ROOM_SETUPS[0], discountPercent: 10 };
    const p = getSetupPricing(setup, SIMS_CATALOG);
    expect(p.itemCount).toBe(setup.items.length);
    expect(p.discountedWeekly).toBe(Math.round(p.weekly * 0.9));
    expect(p.discountedMonthly).toBe(Math.round(p.monthly * 0.9));
  });
  it('counts nothing for an empty catalog', () => {
    expect(getSetupPricing(DEFAULT_ROOM_SETUPS[0], []).itemCount).toBe(0);
  });
});

describe('createSetupFromRoom', () => {
  const base = DEFAULT_ROOM_SETUPS[0];
  const placed = buildSetupItems(base, SIMS_CATALOG);

  it('snapshots the room as manual custom items', () => {
    const saved = createSetupFromRoom({ name: '  Mine  ' }, base.room, placed, SIMS_CATALOG);
    expect(saved.name).toBe('Mine');
    expect(saved.isCustom).toBe(true);
    expect(saved.items.every(i => i.role === 'manual')).toBe(true);
    expect(saved.items.length).toBe(placed.length);
  });
  it('falls back to a default name and drops unknown products', () => {
    const withUnknown = [...placed, { ...placed[0], instanceId: 'x', productId: 'gone' }];
    const saved = createSetupFromRoom({ name: '' }, base.room, withUnknown, SIMS_CATALOG);
    expect(saved.name).toBe('My Setup');
    expect(saved.items.length).toBe(placed.length);
  });
  it('round-trips positions', () => {
    const saved = createSetupFromRoom({ name: 'x' }, base.room, placed, SIMS_CATALOG);
    const rebuilt = buildSetupItems(saved, SIMS_CATALOG);
    expect(rebuilt.map(r => [r.gridX, r.gridZ, r.rotation])).toEqual(placed.map(p => [p.gridX, p.gridZ, p.rotation]));
  });
});
