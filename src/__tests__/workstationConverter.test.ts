import { describe, expect, it } from 'vitest';
import { SIMS_CATALOG } from '../data/simsCatalog';
import { DEFAULT_WORKSTATION_CONFIG } from '../types/workstation';
import { buildWorkstationPlacedItems } from '../utils/workstationSetupConverter';

describe('buildWorkstationPlacedItems', () => {
  it('converts default workstation configuration to valid placed items', () => {
    const items = buildWorkstationPlacedItems(DEFAULT_WORKSTATION_CONFIG, SIMS_CATALOG);
    expect(items.length).toBeGreaterThan(0);

    // Verify desk exists
    const desk = items.find((i) => {
      const prod = SIMS_CATALOG.find((p) => p.id === i.productId);
      return prod?.category === 'desks';
    });
    expect(desk).toBeDefined();

    // Verify desk rests flat on the floor (surfaceY = 0)
    expect(desk?.surfaceY).toBe(0);

    // Verify mounted items exist and have surfaceY set to desk tabletop height (0.74m)
    const mountedItems = items.filter((i) => i.mountedOnDeskId === desk?.instanceId);
    expect(mountedItems.length).toBeGreaterThan(0);
    for (const item of mountedItems) {
      expect(item.surfaceY).toBe(0.74);
    }
  });

  it('ensures desk always rests flat on floor even with standing desk configuration', () => {
    const standingConfig = {
      ...DEFAULT_WORKSTATION_CONFIG,
      deskHeightCm: 110,
    };
    const items = buildWorkstationPlacedItems(standingConfig, SIMS_CATALOG);
    const desk = items.find((i) => {
      const prod = SIMS_CATALOG.find((p) => p.id === i.productId);
      return prod?.category === 'desks';
    });
    // Desk must never float; feet always on floor
    expect(desk?.surfaceY).toBe(0);

    const mounted = items.filter((i) => i.mountedOnDeskId === desk?.instanceId);
    expect(mounted.length).toBeGreaterThan(0);
    for (const item of mounted) {
      expect(item.surfaceY).toBe(0.74);
    }
  });
});
