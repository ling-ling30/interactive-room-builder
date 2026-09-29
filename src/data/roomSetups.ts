import type { SimsProduct, PlacedFurniture } from './simsCatalog';
import type { SpaceParameters } from '../types/space';

/**
 * Where an item goes in a setup. Positions are computed from each product's real dimensions
 * (see `layoutSetup`) instead of being hand-typed coordinates:
 * - desk: against the back wall, shifted right of centre
 * - chair: front-left of the desk, pulled out a little
 * - monitor / monitor2: centred on the desk's back edge (monitor2 sits next to monitor)
 * - laptop: on the desk, left of the monitor
 * - keyboard / mouse / mat: front of the desk, mat under both
 * - right / left: small desk items stacked from the right / left end inward
 * - corner: floor item (plant) in the back-left corner
 * - rug: floor rug in front of the desk
 */
export type SetupRole =
  | 'desk'
  | 'chair'
  | 'monitor'
  | 'monitor2'
  | 'laptop'
  | 'keyboard'
  | 'mouse'
  | 'mat'
  | 'right'
  | 'left'
  | 'corner'
  | 'rug'
  /** Saved from a real room: uses the stored coordinates instead of the dimension-based layout. */
  | 'manual';

export interface SetupItem {
  productId: string;
  role: SetupRole;
  /** manual items: footprint top-left grid position and rotation. */
  x?: number;
  z?: number;
  rotation?: number;
  /** manual items: index (in `items`) of the desk this item sits on. */
  mountedTo?: number;
}

export interface RoomSetup {
  id: string;
  name: string;
  desc: string;
  /** Short tag shown on the card (e.g. "Trader Choice"). */
  badge: string;
  /** Bundle discount applied to the summed weekly / monthly rent. */
  discountPercent: number;
  /** Room shell applied together with the furniture. */
  room: Pick<SpaceParameters, 'width' | 'length' | 'floorStyle' | 'wallColor' | 'wallStyle' | 'backdropColor'>;
  items: SetupItem[];
  /** Saved from the studio / CMS (editable) instead of built in. */
  isCustom?: boolean;
}

const ROOM_3X3 = { width: 3, length: 3, wallStyle: 'cutaway' as const };

/** Bundle-style workspace setups laid out in a compact 3 × 3 m room, modelled on the monis.rent bundle photos. */
export const DEFAULT_ROOM_SETUPS: RoomSetup[] = [
  {
    id: 'essentials',
    name: 'The Essentials',
    desc: 'Standing desk and ergonomic chair — the foundation of any home office.',
    badge: 'Best Value',
    discountPercent: 20,
    room: { ...ROOM_3X3, floorStyle: 'concrete', wallColor: '#f4ece0', backdropColor: '#f0ece1' },
    items: [
      { productId: 'monis-elec-desk-28', role: 'desk' },
      { productId: 'monis-ergo-chair-6', role: 'chair' },
      { productId: 'decor-jute-rug', role: 'rug' },
      { productId: 'decor-monstera', role: 'corner' },
    ],
  },
  {
    id: 'trading',
    name: 'The Trading Setup',
    desc: 'Full trading station: ultrawide curved monitor, desk, chair, peripherals and desk lamp.',
    badge: 'Trader Choice',
    discountPercent: 20,
    room: { ...ROOM_3X3, floorStyle: 'concrete', wallColor: '#f4ece0', backdropColor: '#e8e2d4' },
    items: [
      { productId: 'monis-dual-motor-203', role: 'desk' },
      { productId: 'monis-ergo-chair-6', role: 'chair' },
      { productId: 'monis-curved-34', role: 'monitor' },
      { productId: 'acc-felt-deskpad', role: 'mat' },
      { productId: 'monis-mech-keyboard', role: 'keyboard' },
      { productId: 'monis-precision-mouse', role: 'mouse' },
      { productId: 'monis-lamp-151', role: 'right' },
      { productId: 'acc-wood-organizer', role: 'right' },
      { productId: 'decor-jute-rug', role: 'rug' },
      { productId: 'decor-monstera', role: 'corner' },
    ],
  },
  {
    id: 'founders',
    name: 'The Founders Setup',
    desc: 'Efficient power setup: 27" monitor plus a laptop on a stand, desk, chair and peripherals.',
    badge: 'Remote Work',
    discountPercent: 20,
    room: { ...ROOM_3X3, floorStyle: 'concrete', wallColor: '#f4ece0', backdropColor: '#f0ece1' },
    items: [
      { productId: 'monis-dual-motor-203', role: 'desk' },
      { productId: 'monis-ergo-chair-6', role: 'chair' },
      { productId: 'monis-grading-27', role: 'monitor' },
      { productId: 'tech-laptop-stand', role: 'laptop' },
      { productId: 'acc-felt-deskpad', role: 'mat' },
      { productId: 'monis-mech-keyboard', role: 'keyboard' },
      { productId: 'monis-precision-mouse', role: 'mouse' },
      { productId: 'acc-wood-organizer', role: 'right' },
      { productId: 'decor-jute-rug', role: 'rug' },
      { productId: 'decor-monstera', role: 'corner' },
    ],
  },
  {
    id: 'studio',
    name: 'The Studio Setup',
    desc: 'Premium studio desk: 27" display, keyboard and mouse, desk mat, lamp and headphone stand.',
    badge: 'Creator Pick',
    discountPercent: 20,
    room: { ...ROOM_3X3, floorStyle: 'concrete', wallColor: '#f4ece0', backdropColor: '#ece7d8' },
    items: [
      { productId: 'monis-elec-desk-28', role: 'desk' },
      { productId: 'monis-ergo-chair-6', role: 'chair' },
      { productId: 'monis-grading-27', role: 'monitor' },
      { productId: 'acc-leather-deskmat', role: 'mat' },
      { productId: 'monis-mech-keyboard', role: 'keyboard' },
      { productId: 'monis-precision-mouse', role: 'mouse' },
      { productId: 'monis-lamp-151', role: 'right' },
      { productId: 'acc-headphone-stand', role: 'left' },
      { productId: 'decor-jute-rug', role: 'rug' },
      { productId: 'decor-monstera', role: 'corner' },
    ],
  },
  {
    id: 'dual-screen',
    name: 'The Dual Screen Setup',
    desc: 'Dual 27" 4K displays on gas-spring arms with full peripherals for multitasking.',
    badge: 'Multitasker',
    discountPercent: 20,
    room: { ...ROOM_3X3, floorStyle: 'concrete', wallColor: '#f4ece0', backdropColor: '#e8e2d4' },
    items: [
      { productId: 'monis-dual-motor-203', role: 'desk' },
      { productId: 'monis-ergo-chair-6', role: 'chair' },
      { productId: 'tech-dual-4k', role: 'monitor' },
      { productId: 'acc-felt-deskpad', role: 'mat' },
      { productId: 'monis-mech-keyboard', role: 'keyboard' },
      { productId: 'monis-precision-mouse', role: 'mouse' },
      { productId: 'monis-lamp-151', role: 'right' },
      { productId: 'decor-jute-rug', role: 'rug' },
      { productId: 'decor-monstera', role: 'corner' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Layout from real dimensions
// ---------------------------------------------------------------------------

/** Gap between the desk's back edge and the wall (m). */
const WALL_GAP = 0.04;
/** Gap between neighbouring desk items (m). */
const ITEM_GAP = 0.07;

interface Size {
  w: number;
  d: number;
}

interface Placement {
  /** Centre of the item in room-corner metres. */
  cx: number;
  cz: number;
  rotation: number;
  /** Rests on the desk surface. */
  onDesk: boolean;
}

/** Real-world size in metres (falls back to the tile footprint). */
function sizeOf(p: SimsProduct): Size {
  return {
    w: p.actualDimensions?.widthM ?? p.footprint.width,
    d: p.actualDimensions?.depthM ?? p.footprint.depth,
  };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * Computes an item centre for every role from product dimensions.
 * Items whose product is missing from the catalog are skipped.
 */
function layoutSetup(setup: RoomSetup, byId: Map<string, SimsProduct>): Map<SetupItem, Placement> {
  const roomW = setup.room.width;
  const result = new Map<SetupItem, Placement>();
  const items = setup.items.filter(i => i.role !== 'manual' && byId.has(i.productId));
  const find = (role: SetupRole) => items.find(i => i.role === role);
  const size = (item: SetupItem) => sizeOf(byId.get(item.productId)!);

  const deskItem = find('desk');
  if (!deskItem) return result;

  // Desk against the back wall, shifted right of centre so the chair has room on the left
  const dS = size(deskItem);
  const deskCx = clamp(roomW / 2 + 0.35, dS.w / 2 + 0.1, roomW - dS.w / 2 - 0.1);
  const deskCz = WALL_GAP + dS.d / 2;
  const deskLeft = deskCx - dS.w / 2;
  const deskRight = deskCx + dS.w / 2;
  const deskBack = deskCz - dS.d / 2;
  const deskFront = deskCz + dS.d / 2;
  result.set(deskItem, { cx: deskCx, cz: deskCz, rotation: 0, onDesk: false });

  // Chair: front-left of the desk, pulled out slightly, facing the desk
  const chairItem = find('chair');
  if (chairItem) {
    const cS = size(chairItem);
    result.set(chairItem, { cx: deskCx - 0.35, cz: deskFront + cS.d / 2 + 0.02, rotation: 180, onDesk: false });
  }

  // Monitor(s): centred on the back edge, slightly right of desk centre
  const monitorItem = find('monitor');
  const monitor2Item = find('monitor2');
  let screensLeft = deskCx;
  let screensCx = deskCx;
  if (monitorItem) {
    const mS = size(monitorItem);
    const totalW = mS.w + (monitor2Item ? size(monitor2Item).w + ITEM_GAP : 0);
    screensCx = clamp(deskCx + 0.05, deskLeft + totalW / 2 + 0.03, deskRight - totalW / 2 - 0.03);
    screensLeft = screensCx - totalW / 2;
    result.set(monitorItem, { cx: screensLeft + mS.w / 2, cz: deskBack + mS.d / 2 + 0.06, rotation: 0, onDesk: true });
    if (monitor2Item) {
      const m2S = size(monitor2Item);
      result.set(monitor2Item, {
        cx: screensLeft + mS.w + ITEM_GAP + m2S.w / 2,
        cz: deskBack + m2S.d / 2 + 0.06,
        rotation: 0,
        onDesk: true,
      });
    }
  }

  // Laptop: on the desk, left of the screens (never past the desk's left edge)
  const laptopItem = find('laptop');
  if (laptopItem) {
    const lS = size(laptopItem);
    const lCx = Math.max(deskLeft + lS.w / 2 + 0.03, screensLeft - ITEM_GAP - lS.w / 2);
    result.set(laptopItem, { cx: lCx, cz: deskBack + lS.d / 2 + 0.06, rotation: 0, onDesk: true });
  }

  // Keyboard + mouse in front, mat centred under both
  const keyboardItem = find('keyboard');
  const mouseItem = find('mouse');
  const matItem = find('mat');
  const kS = keyboardItem ? size(keyboardItem) : { w: 0, d: 0 };
  const moS = mouseItem ? size(mouseItem) : { w: 0, d: 0 };
  const matS = matItem ? size(matItem) : { w: 0, d: 0 };
  const rowD = Math.max(kS.d, moS.d, matS.d);
  const rowCz = deskFront - rowD / 2 - 0.04;
  const kbCx = screensCx - 0.06;
  const kbLeft = kbCx - kS.w / 2;
  const mouseCx = kbCx + kS.w / 2 + ITEM_GAP + moS.w / 2;
  const mouseRight = mouseItem ? mouseCx + moS.w / 2 : kbCx + kS.w / 2;
  if (keyboardItem) result.set(keyboardItem, { cx: kbCx, cz: rowCz, rotation: 0, onDesk: true });
  if (mouseItem) result.set(mouseItem, { cx: mouseCx, cz: rowCz, rotation: 0, onDesk: true });
  if (matItem) {
    const matCx = clamp((kbLeft + mouseRight) / 2, deskLeft + matS.w / 2 + 0.02, deskRight - matS.w / 2 - 0.02);
    result.set(matItem, { cx: matCx, cz: deskFront - matS.d / 2 - 0.04, rotation: 0, onDesk: true });
  }

  // Small desk items stacked inward from the right / left end
  let rightCursor = deskRight - 0.08;
  for (const item of items.filter(i => i.role === 'right')) {
    const s = size(item);
    result.set(item, { cx: rightCursor - s.w / 2, cz: deskBack + s.d / 2 + 0.08, rotation: 0, onDesk: true });
    rightCursor -= s.w + ITEM_GAP;
  }
  let leftCursor = deskLeft + 0.08;
  for (const item of items.filter(i => i.role === 'left')) {
    const s = size(item);
    result.set(item, { cx: leftCursor + s.w / 2, cz: deskBack + s.d / 2 + 0.08, rotation: 0, onDesk: true });
    leftCursor += s.w + ITEM_GAP;
  }

  // Floor plant in the back-left corner
  const cornerItem = find('corner');
  if (cornerItem) {
    const s = size(cornerItem);
    result.set(cornerItem, { cx: 0.14 + s.w / 2, cz: 0.14 + s.d / 2, rotation: 0, onDesk: false });
  }

  // Rug in front of the desk under the chair
  const rugItem = find('rug');
  if (rugItem) {
    const s = size(rugItem);
    const chairCx = chairItem ? deskCx - 0.35 : deskCx;
    result.set(rugItem, { cx: chairCx + 0.1, cz: deskFront + s.d * 0.4, rotation: 0, onDesk: false });
  }

  return result;
}

/** Products of a setup that exist in the current catalog (unknown products are ignored everywhere). */
export function getSetupProducts(setup: RoomSetup, catalog: SimsProduct[]): SimsProduct[] {
  const byId = new Map(catalog.map(p => [p.id, p]));
  return setup.items.flatMap(i => {
    const p = byId.get(i.productId);
    return p ? [p] : [];
  });
}

export interface SetupPricing {
  weekly: number;
  monthly: number;
  discountedWeekly: number;
  discountedMonthly: number;
  deposit: number;
  itemCount: number;
}

export function getSetupPricing(setup: RoomSetup, catalog: SimsProduct[]): SetupPricing {
  const products = getSetupProducts(setup, catalog);
  const weekly = products.reduce((sum, p) => sum + (p.weeklyRent || 0), 0);
  const monthly = products.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
  const deposit = products.reduce((sum, p) => sum + (p.deposit || 0), 0);
  const factor = 1 - setup.discountPercent / 100;
  return {
    weekly,
    monthly,
    discountedWeekly: Math.round(weekly * factor),
    discountedMonthly: Math.round(monthly * factor),
    deposit,
    itemCount: products.length,
  };
}

/** Resolves a setup into placeable furniture (dimension-based layout, or stored coordinates for saved rooms). */
export function buildSetupItems(setup: RoomSetup, catalog: SimsProduct[]): PlacedFurniture[] {
  const stamp = Date.now();
  const byId = new Map(catalog.map(p => [p.id, p]));
  const layout = layoutSetup(setup, byId);
  const idFor = (index: number) => `inst-${setup.id}-${index}-${stamp}`;
  const heightOf = (p: SimsProduct | undefined) => p?.actualDimensions?.heightM ?? (p?.heightCm ? p.heightCm / 100 : 0.74);
  const deskIndex = setup.items.findIndex(i => i.role === 'desk');

  const placed: PlacedFurniture[] = [];
  setup.items.forEach((item, index) => {
    const product = byId.get(item.productId);
    if (!product) return;

    // Manual (saved) items keep their stored position and rotation
    if (item.role === 'manual') {
      const mountedTo = item.mountedTo !== undefined ? setup.items[item.mountedTo] : undefined;
      const deskProduct = mountedTo ? byId.get(mountedTo.productId) : undefined;
      placed.push({
        instanceId: idFor(index),
        productId: product.id,
        gridX: item.x ?? 0,
        gridZ: item.z ?? 0,
        rotation: item.rotation ?? 0,
        color: product.color,
        surfaceY: deskProduct ? heightOf(deskProduct) : 0,
        ...(deskProduct && item.mountedTo !== undefined ? { mountedOnDeskId: idFor(item.mountedTo) } : {}),
      });
      return;
    }

    const spot = layout.get(item);
    if (!spot) return;
    const desk = deskIndex >= 0 ? byId.get(setup.items[deskIndex].productId) : undefined;

    // Grid coordinates are the footprint's top-left corner; the mesh is centred on the footprint
    // (a footprint larger than the real item may hang slightly past the wall, the real edge never does)
    const fp = product.footprint;
    const real = sizeOf(product);
    const minX = -Math.max(0, fp.width - real.w) / 2;
    const minZ = -Math.max(0, fp.depth - real.d) / 2;
    placed.push({
      instanceId: idFor(index),
      productId: product.id,
      gridX: Math.round(Math.max(minX, spot.cx - fp.width / 2) * 1000) / 1000,
      gridZ: Math.round(Math.max(minZ, spot.cz - fp.depth / 2) * 1000) / 1000,
      rotation: spot.rotation,
      color: product.color,
      surfaceY: spot.onDesk ? heightOf(desk) : 0,
      ...(spot.onDesk && deskIndex >= 0 ? { mountedOnDeskId: idFor(deskIndex) } : {}),
    });
  });
  return placed;
}

/** Snapshot of the current room as a new custom setup (positions are stored as they are). */
export function createSetupFromRoom(
  input: { name: string; desc?: string; badge?: string; discountPercent?: number },
  room: RoomSetup['room'],
  placedItems: PlacedFurniture[],
  catalog: SimsProduct[]
): RoomSetup {
  const known = placedItems.filter(p => catalog.some(c => c.id === p.productId));
  const items: SetupItem[] = known.map(p => ({
    productId: p.productId,
    role: 'manual' as const,
    x: p.gridX,
    z: p.gridZ,
    rotation: p.rotation,
    mountedTo: p.mountedOnDeskId ? known.findIndex(k => k.instanceId === p.mountedOnDeskId) : undefined,
  })).map(i => (i.mountedTo === undefined || i.mountedTo < 0 ? { ...i, mountedTo: undefined } : i));
  return {
    id: `custom-${Date.now()}`,
    name: input.name.trim() || 'My Setup',
    desc: input.desc?.trim() || `Saved room · ${items.length} items`,
    badge: input.badge?.trim() || 'Custom',
    discountPercent: input.discountPercent ?? 0,
    room,
    items,
    isCustom: true,
  };
}
