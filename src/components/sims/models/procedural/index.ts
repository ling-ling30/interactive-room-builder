import * as THREE from 'three';
import type { SimsProduct } from '../../../../data/simsCatalog';
import { getMaterial } from '../materials';
import type { ModelBuilder } from './types';
import { buildStandingDesk, buildCompactDesk, buildExecutiveDesk } from './desks';
import { buildAeronChair, buildHighbackChair, buildActiveStool, buildLoungeChair } from './chairs';
import {
  buildDualMonitors,
  buildUltrawideMonitor,
  buildSingleMonitor,
  buildLaptopStand,
  buildScreenbar,
} from './monitors';
import {
  buildKeyboard,
  buildComputerMouse,
  buildDeskMat,
  buildDeskOrganizer,
  buildHeadphoneStand,
  buildCoffeeMug,
} from './peripherals';
import {
  buildDeskLamp,
  buildFloorLamp,
  buildMonsteraPlant,
  buildJuteRug,
  buildBookshelf,
  buildStandingBoard,
  buildFallbackBlock,
} from './decor';

/** modelType -> procedural builder. Add new furniture types here. */
const PROCEDURAL_BUILDERS: Record<string, ModelBuilder> = {
  standing_desk: buildStandingDesk,
  compact_desk: buildCompactDesk,
  executive_desk: buildExecutiveDesk,
  aeron_chair: buildAeronChair,
  highback_chair: buildHighbackChair,
  active_stool: buildActiveStool,
  lounge_chair: buildLoungeChair,
  dual_monitors: buildDualMonitors,
  ultrawide_monitor: buildUltrawideMonitor,
  single_monitor: buildSingleMonitor,
  laptop_stand: buildLaptopStand,
  screenbar: buildScreenbar,
  desk_lamp: buildDeskLamp,
  floor_lamp: buildFloorLamp,
  monstera_plant: buildMonsteraPlant,
  jute_rug: buildJuteRug,
  bookshelf: buildBookshelf,
  coffee_mug: buildCoffeeMug,
  standing_board: buildStandingBoard,
  mechanical_keyboard: buildKeyboard,
  gaming_keyboard: buildKeyboard,
  computer_mouse: buildComputerMouse,
  desk_mat: buildDeskMat,
  desk_organizer: buildDeskOrganizer,
  headphone_stand: buildHeadphoneStand,
};

/** Scales non-desk procedural models to the product's real-world dimensions and re-seats them on the floor. */
function fitToActualDimensions(group: THREE.Group, product: SimsProduct) {
  const isDesk = product.category === 'desks' || product.modelType?.includes('desk') || product.modelType?.includes('table');
  if (isDesk || !product.actualDimensions) return;

  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.x > 0.001 && size.y > 0.001 && size.z > 0.001) {
    const targetW = product.actualDimensions.widthM;
    const targetD = product.actualDimensions.depthM;
    const targetH = product.actualDimensions.heightM;
    const mult = product.scaleMultiplier ?? 1.0;
    if (product.fitMode === 'exact') {
      group.scale.set((targetW / size.x) * mult, (targetH / size.y) * mult, (targetD / size.z) * mult);
    } else {
      const sX = targetW / size.x;
      const sY = targetH ? (targetH / size.y) : sX;
      const sZ = targetD / size.z;
      const uniform = Math.min(sX, sY, sZ) * mult;
      group.scale.setScalar(uniform);
    }
    // Re-align to sit flat on floor
    const updated = new THREE.Box3().setFromObject(group);
    group.position.y -= updated.min.y;
  }
}

/** Stylized Sims-style furniture built from primitives (used when no .glb is attached). */
export function createProceduralFurnitureMesh(product: SimsProduct, activeColor?: string): THREE.Group {
  const group = new THREE.Group();
  group.name = product.id;

  const color = activeColor || product.color;
  const ctx = {
    group,
    product,
    color,
    darkMetal: getMaterial('#1e293b', 0.5, 0.4),
    chromeMetal: getMaterial('#cbd5e1', 0.2, 0.8),
    primaryMat: getMaterial(color, 0.4, 0.05),
  };

  const build = PROCEDURAL_BUILDERS[product.modelType] ?? buildFallbackBlock;
  build(ctx);

  fitToActualDimensions(group, product);
  return group;
}
