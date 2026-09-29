import * as THREE from 'three';
import type { PlacedFurniture, SimsProduct } from '../../../data/simsCatalog';

export interface FootprintDimensions {
  width: number;
  depth: number;
}

/**
 * Canonical 9-direction furniture orientation preset definition.
 * Models a 3x3 directional compass pad (Numpad 7..9, 4..6, 1..3)
 * with 8 compass octants plus center/reset.
 */
export interface FurnitureDirectionPreset {
  id: string;
  name: string;
  shortLabel: string;
  angle: number;
  arrow: string;
  numpad: number;
  row: number;
  col: number;
  description: string;
}

export const FURNITURE_9_DIRECTIONS: FurnitureDirectionPreset[] = [
  { id: 'nw', name: 'North-West (315°)', shortLabel: 'NW', angle: 315, arrow: '↖', numpad: 7, row: 0, col: 0, description: 'Facing North-West diagonal (315°)' },
  { id: 'n',  name: 'North / Back (0°)', shortLabel: 'N', angle: 0, arrow: '↑', numpad: 8, row: 0, col: 1, description: 'Facing North / Back wall (0°)' },
  { id: 'ne', name: 'North-East (45°)', shortLabel: 'NE', angle: 45, arrow: '↗', numpad: 9, row: 0, col: 2, description: 'Facing North-East diagonal (45°)' },
  { id: 'w',  name: 'West / Left (270°)', shortLabel: 'W', angle: 270, arrow: '←', numpad: 4, row: 1, col: 0, description: 'Facing West / Left wall (270°)' },
  { id: 'center', name: 'Reset / Front (0°)', shortLabel: 'Front', angle: 0, arrow: '⊙', numpad: 5, row: 1, col: 1, description: 'Reset to default front orientation (0°)' },
  { id: 'e',  name: 'East / Right (90°)', shortLabel: 'E', angle: 90, arrow: '→', numpad: 6, row: 1, col: 2, description: 'Facing East / Right wall (90°)' },
  { id: 'sw', name: 'South-West (225°)', shortLabel: 'SW', angle: 225, arrow: '↙', numpad: 1, row: 2, col: 0, description: 'Facing South-West diagonal (225°)' },
  { id: 's',  name: 'South / Forward (180°)', shortLabel: 'S', angle: 180, arrow: '↓', numpad: 2, row: 2, col: 1, description: 'Facing South / Forward (180°)' },
  { id: 'se', name: 'South-East (135°)', shortLabel: 'SE', angle: 135, arrow: '↘', numpad: 3, row: 2, col: 2, description: 'Facing South-East diagonal (135°)' },
];

/**
 * Returns the closest canonical 9-direction preset for a given angle in degrees.
 */
export function getClosestFurnitureDirection(rotation: number): FurnitureDirectionPreset {
  const norm = ((Math.round(rotation) % 360) + 360) % 360;
  const match = FURNITURE_9_DIRECTIONS.find(d => d.id !== 'center' && d.angle === norm);
  if (match) return match;
  if (norm === 0) return FURNITURE_9_DIRECTIONS[1]; // N

  let closest = FURNITURE_9_DIRECTIONS[1];
  let minDiff = 360;
  for (const d of FURNITURE_9_DIRECTIONS) {
    if (d.id === 'center') continue;
    const diff = Math.min(Math.abs(d.angle - norm), 360 - Math.abs(d.angle - norm));
    if (diff < minDiff) {
      minDiff = diff;
      closest = d;
    }
  }
  return closest;
}

/**
 * Steps the rotation by 5° in clockwise ('cw') or counter-clockwise ('ccw') direction.
 */
export function stepFurnitureRotation(currentAngle: number, direction: 'cw' | 'ccw' = 'cw', stepDegrees: number = 5): number {
  const norm = ((Math.round(currentAngle) % 360) + 360) % 360;
  const step = direction === 'cw' ? stepDegrees : -stepDegrees;
  return ((norm + step) % 360 + 360) % 360;
}

/**
 * Calculates effective footprint dimensions accounting for rotation (e.g. 15 deg increments).
 */
export function getEffectiveFootprint(product: SimsProduct | null, rotation: number): FootprintDimensions {
  if (!product) return { width: 1, depth: 1 };
  const normRot = ((Math.round(rotation) % 360) + 360) % 360;

  if (normRot === 0 || normRot === 180) {
    return {
      width: product.footprint.width,
      depth: product.footprint.depth,
    };
  }

  if (normRot === 90 || normRot === 270) {
    return {
      width: product.footprint.depth,
      depth: product.footprint.width,
    };
  }

  if (product.footprint.width === product.footprint.depth) {
    return {
      width: product.footprint.width,
      depth: product.footprint.depth,
    };
  }

  // Intermediate rotation angles (15°, 30°, 45°, 60°, 75°, etc.)
  const rad = (normRot * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const bboxW = Math.round((product.footprint.width * cos + product.footprint.depth * sin) * 4) / 4;
  const bboxD = Math.round((product.footprint.width * sin + product.footprint.depth * cos) * 4) / 4;
  return {
    width: Math.max(0.5, bboxW),
    depth: Math.max(0.5, bboxD),
  };
}

/**
 * Converts grid tile coordinates to centered Three.js world space coordinates.
 */
export function gridToWorld(
  gridX: number,
  gridZ: number,
  fpW: number,
  fpD: number,
  roomWidth: number,
  roomLength: number
): { x: number; z: number } {
  return {
    x: (gridX - roomWidth / 2) + (fpW / 2),
    z: (gridZ - roomLength / 2) + (fpD / 2),
  };
}

/**
 * Determines whether a product is considered a small surface item or accessory,
 * which benefits from finer 1/8 tile (0.125m) snap points.
 */
export function isSmallItem(product: SimsProduct | null): boolean {
  if (!product) return false;
  return Boolean(
    product.layer === 'surface' ||
    product.category === 'accessories' ||
    (product.footprint.width <= 0.5 && product.footprint.depth <= 0.5) ||
    (product.actualDimensions && product.actualDimensions.widthM <= 0.5 && product.actualDimensions.depthM <= 0.5)
  );
}

/**
 * Returns the effective snap step, providing fine 1/8 tile (0.125m) resolution
 * for small items / accessories while respecting manual user overrides.
 */
export function getEffectiveSnapStep(product: SimsProduct | null, baseSnapStep: number): number {
  if (isSmallItem(product)) {
    // For small items (keyboards, mice, desk accessories, lamps), snap to 1/8 tile (0.125m)
    return Math.min(baseSnapStep, 0.125);
  }
  return baseSnapStep;
}

/**
 * Clamps grid coordinates to ensure the furniture footprint stays fully within room bounds
 * and snaps to the configured step (0.125 for 1/8 tile, 0.25 for quarter-grid, etc.).
 */
export function clampGridCoords(
  gx: number,
  gz: number,
  fpW: number,
  fpD: number,
  roomWidth: number,
  roomLength: number,
  step = 0.25
): { x: number; z: number } {
  // Snap to step (e.g. 0.125 for 1/8 tile, 0.25 for quarter-grid, 0.5 for half-grid, 1.0 for whole grid)
  let snappedX = Math.round(gx / step) * step;
  let snappedZ = Math.round(gz / step) * step;

  const maxX = Math.max(0, roomWidth - fpW);
  const maxZ = Math.max(0, roomLength - fpD);

  snappedX = Math.max(0, Math.min(maxX, snappedX));
  snappedZ = Math.max(0, Math.min(maxZ, snappedZ));

  // Round to 3 decimal places to preserve 1/8 tile increments (0.125, 0.375, 0.625, 0.875) without floating point drift
  snappedX = Math.round(snappedX * 1000) / 1000;
  snappedZ = Math.round(snappedZ * 1000) / 1000;

  return { x: snappedX, z: snappedZ };
}

export interface CenterSnapResult {
  x: number;
  z: number;
  isSnapped: boolean;
  snappedDesk?: PlacedFurniture;
  snapAxis?: 'x' | 'z' | 'both';
  targetDeskName?: string;
}

/**
 * Intelligent Magnetic Center Snap:
 * When placing chairs, monitors, or items near desks/tables, automatically centers
 * the item along the desk's center-line. This solves odd-grid vs even-grid misalignment
 * (e.g., a 1.0m chair on a 1.5m desk or 2.0m chair on a 3.0m table) with zero friction.
 */
export function findNearestCenterSnap(
  targetGx: number,
  targetGz: number,
  fp: FootprintDimensions,
  placedItems: PlacedFurniture[],
  catalog: SimsProduct[],
  excludeInstanceId?: string | null,
  threshold = 0.35
): CenterSnapResult {
  let bestX = targetGx;
  let bestZ = targetGz;
  let isSnapped = false;
  let snapAxis: 'x' | 'z' | 'both' | undefined = undefined;
  let snappedDesk: PlacedFurniture | undefined = undefined;
  let targetDeskName: string | undefined = undefined;

  for (const item of placedItems) {
    if (excludeInstanceId && item.instanceId === excludeInstanceId) continue;
    const prod = catalog.find(p => p.id === item.productId);
    if (!prod || prod.category !== 'desks') continue;

    const deskFp = getEffectiveFootprint(prod, item.rotation);
    const dW = deskFp.width;
    const dD = deskFp.depth;

    const deskCenterX = item.gridX + dW / 2;
    const deskCenterZ = item.gridZ + dD / 2;

    // Desired coordinate for held item to be centered with the desk
    const alignedX = deskCenterX - fp.width / 2;
    const alignedZ = deskCenterZ - fp.depth / 2;

    // Proximity checks
    const diffX = Math.abs(targetGx - alignedX);
    const isInZBand = targetGz >= (item.gridZ - 1.6) && targetGz <= (item.gridZ + dD + 1.6);

    if (diffX <= threshold && isInZBand) {
      bestX = Math.round(alignedX * 1000) / 1000;
      isSnapped = true;
      snapAxis = 'x';
      snappedDesk = item;
      targetDeskName = prod.name;
    }

    const diffZ = Math.abs(targetGz - alignedZ);
    const isInXBand = targetGx >= (item.gridX - 1.6) && targetGx <= (item.gridX + dW + 1.6);

    if (diffZ <= threshold && isInXBand) {
      bestZ = Math.round(alignedZ * 1000) / 1000;
      if (isSnapped && snapAxis === 'x') {
        snapAxis = 'both';
      } else {
        isSnapped = true;
        snapAxis = 'z';
        snappedDesk = item;
        targetDeskName = prod.name;
      }
    }
  }

  return {
    x: bestX,
    z: bestZ,
    isSnapped,
    snappedDesk,
    snapAxis,
    targetDeskName,
  };
}

/**
 * Performs a 2D bounding-box overlap test to locate any desk beneath the given target coordinates.
 * Accurately supports any desk dimensions (e.g. 2x2, 3x2, 4x2) and rotations.
 */
export function findDeskUnder(
  placedItems: PlacedFurniture[],
  catalog: SimsProduct[],
  targetX: number,
  targetZ: number,
  width = 1,
  depth = 1,
  excludeInstanceId?: string | null
): PlacedFurniture | undefined {
  return placedItems.find(item => {
    if (excludeInstanceId && item.instanceId === excludeInstanceId) return false;
    const prod = catalog.find(p => p.id === item.productId);
    if (prod?.category !== 'desks') return false;

    const deskFp = getEffectiveFootprint(prod, item.rotation);
    const dW = deskFp.width;
    const dD = deskFp.depth;

    // True 2D box overlap test
    const overlapX = targetX < item.gridX + dW && (targetX + width) > item.gridX;
    const overlapZ = targetZ < item.gridZ + dD && (targetZ + depth) > item.gridZ;
    return overlapX && overlapZ;
  });
}

/**
 * Accurately measures the physical surface height (tabletop Y) beneath an item.
 * Queries the real 3D mesh bounding box if available, or falls back to product dimensions.
 * Also checks if sitting atop a desk pad / mat to add appropriate offset (+5mm).
 */
export function getTableSurfaceYUnder(
  gridX: number,
  gridZ: number,
  fpW: number,
  fpD: number,
  placedItems: PlacedFurniture[],
  catalog: SimsProduct[],
  itemMeshes?: Map<string, THREE.Group> | null,
  mountedOnDeskId?: string,
  excludeInstanceId?: string | null
): { surfaceY: number; deskId?: string } {
  let desk: PlacedFurniture | undefined = undefined;
  if (mountedOnDeskId) {
    desk = placedItems.find(p => p.instanceId === mountedOnDeskId);
  }
  if (!desk) {
    desk = findDeskUnder(placedItems, catalog, gridX, gridZ, fpW, fpD, excludeInstanceId);
  }

  if (!desk) {
    return { surfaceY: 0 };
  }

  let tableHeight = 0;
  if (itemMeshes) {
    const deskMesh = itemMeshes.get(desk.instanceId);
    if (deskMesh) {
      const box = new THREE.Box3().setFromObject(deskMesh);
      if (isFinite(box.max.y) && box.max.y > 0.3) {
        tableHeight = Math.round(box.max.y * 1000) / 1000;
      }
    }
  }

  if (tableHeight === 0) {
    const deskProd = catalog.find(p => p.id === desk.productId);
    tableHeight = deskProd?.actualDimensions?.heightM ?? (deskProd?.heightCm ? deskProd.heightCm / 100 : 0.74);
  }

  // Check if there is also a desk mat/pad underneath this item
  const matUnder = placedItems.find(item => {
    if (item.instanceId === excludeInstanceId || item.instanceId === desk?.instanceId) return false;
    const prod = catalog.find(p => p.id === item.productId);
    if (!prod) return false;
    const isMat = prod.id === 'acc-felt-deskpad' || prod.id.includes('mat') || prod.id.includes('pad') ||
      prod.name.toLowerCase().includes('mat') || prod.name.toLowerCase().includes('pad');
    if (!isMat) return false;

    const matFp = getEffectiveFootprint(prod, item.rotation);
    const mW = matFp.width;
    const mD = matFp.depth;

    const overlapX = gridX < item.gridX + mW && (gridX + fpW) > item.gridX;
    const overlapZ = gridZ < item.gridZ + mD && (gridZ + fpD) > item.gridZ;
    return overlapX && overlapZ;
  });

  if (matUnder) {
    // Elevate slightly above the desk mat so it doesn't z-fight or sink into the mat
    tableHeight += 0.005;
  }

  return { surfaceY: Math.round(tableHeight * 1000) / 1000, deskId: desk.instanceId };
}

