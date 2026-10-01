import * as THREE from 'three';
import type { WorkstationConfig, DeskStudioSlot } from '../../../types/workstation';
import { getVirtualScreenTexture } from './VirtualScreenTextures';
import { createFurnitureMesh } from '../../sims/Sims3DModels';
import { SIMS_CATALOG } from '../../../data/simsCatalog';

const DESK_THICKNESS = 0.028;
/** Height of monitors above the tabletop. */
export const MONITOR_ELEVATION_Y = 0.26;

/** Desk-relative dimensions derived from config, shared by all builders. */
export interface StationDims {
  deskW: number;
  deskD: number;
  deskT: number;
  monitorDepthZ: number;
}

export function getStationDims(config: WorkstationConfig): StationDims {
  const deskD = config.deskDepthCm / 100;
  return {
    deskW: config.deskWidthCm / 100,
    deskD,
    deskT: DESK_THICKNESS,
    monitorDepthZ: -deskD * 0.28,
  };
}

/** Tags an object and all its children with a slot identifier for raycasting */
export function tagSlot(object: THREE.Object3D, slot: DeskStudioSlot, name: string) {
  object.userData = { slot, name };
  object.traverse((child) => {
    child.userData = { slot, name };
  });
}

const PRODUCT_3D_MODELS: Record<string, {
  name: string;
  category: string;
  modelType: string;
  modelUrl: string;
  actualDimensions?: { widthM: number; depthM: number; heightM: number };
  scaleMultiplier?: number;
  fitMode?: 'exact' | 'proportional';
}> = {
  // Chairs
  'monis-ergo-chair-6': {
    name: 'OCA259PRO Ergonomic Chair',
    category: 'chairs',
    modelType: 'aeron_chair',
    modelUrl: '/3dObject/ergonomic_mesh_office_chair.glb',
    actualDimensions: { widthM: 0.68, depthM: 0.68, heightM: 1.05 },
    scaleMultiplier: 1.0,
  },
  'monis-furradec-111': {
    name: 'Furradec Haru Plus Executive',
    category: 'chairs',
    modelType: 'highback_chair',
    modelUrl: '/3dObject/office_chair.glb',
    actualDimensions: { widthM: 0.66, depthM: 0.66, heightM: 1.10 },
    scaleMultiplier: 1.0,
  },
  'monis-anya-112': {
    name: 'Modena Anya Gaming Pro',
    category: 'chairs',
    modelType: 'highback_chair',
    modelUrl: '/3dObject/office_chair_gaming_chair.glb',
    actualDimensions: { widthM: 0.68, depthM: 0.68, heightM: 1.25 },
    scaleMultiplier: 1.0,
  },
  'monis-jarv-176': {
    name: 'JÄRVFJÄLLET High-Back Chair',
    category: 'chairs',
    modelType: 'highback_chair',
    modelUrl: '/3dObject/office_chair _long.glb',
    actualDimensions: { widthM: 0.68, depthM: 0.68, heightM: 1.28 },
    scaleMultiplier: 1.0,
  },
  // Desks
  'monis-elec-desk-28': {
    name: 'Electrical Adjustable Standing Desk',
    category: 'desks',
    modelType: 'standing_desk',
    modelUrl: '/3dObject/heavy_duty_standing_table.glb',
    actualDimensions: { widthM: 1.40, depthM: 0.70, heightM: 0.74 },
  },
  'monis-dual-motor-203': {
    name: 'Dual-Motor Standing Desk Pro',
    category: 'desks',
    modelType: 'standing_desk',
    modelUrl: '/3dObject/heavy_duty_standing_table.glb',
    actualDimensions: { widthM: 1.60, depthM: 0.80, heightM: 0.75 },
  },
  'monis-mech-desk-7': {
    name: 'Trotten Studio Desk',
    category: 'desks',
    modelType: 'compact_desk',
    modelUrl: '/3dObject/heavy_duty_standing_table.glb',
    actualDimensions: { widthM: 1.40, depthM: 0.70, heightM: 0.74 },
  },
  // Monitors
  'monis-curved-34': {
    name: '34" Curved Ultrawide Cinema',
    category: 'tech',
    modelType: 'ultrawide_monitor',
    modelUrl: '/3dObject/ultrawide_monitor.glb',
    actualDimensions: { widthM: 0.82, depthM: 0.24, heightM: 0.50 },
  },
  'acc-dual-monitor-arm': {
    name: 'Dual 27" 4K Displays on Gas Arm',
    category: 'tech',
    modelType: 'dual_monitors',
    modelUrl: '/3dObject/dual_monitor.glb',
    actualDimensions: { widthM: 1.22, depthM: 0.25, heightM: 0.52 },
  },
  'tech-dual-4k': {
    name: 'Dual 27" 4K Displays on Gas Arm',
    category: 'tech',
    modelType: 'dual_monitors',
    modelUrl: '/3dObject/dual_monitor.glb',
    actualDimensions: { widthM: 1.22, depthM: 0.25, heightM: 0.52 },
  },
  // Keyboards
  'monis-mech-keyboard': {
    name: 'Keychron Q1 Pro Mechanical',
    category: 'accessories',
    modelType: 'mechanical_keyboard',
    modelUrl: '/3dObject/custom_-_mechanical_keyboard.glb',
    actualDimensions: { widthM: 0.34, depthM: 0.14, heightM: 0.038 },
  },
  'monis-gaming-keyboard': {
    name: 'Razer Huntsman Pro RGB',
    category: 'accessories',
    modelType: 'gaming_keyboard',
    modelUrl: '/3dObject/gaming_keyboard.glb',
    actualDimensions: { widthM: 0.44, depthM: 0.15, heightM: 0.038 },
  },
  // Mice
  'monis-precision-mouse': {
    name: 'Logitech MX Master 3S',
    category: 'accessories',
    modelType: 'computer_mouse',
    modelUrl: '/3dObject/computer_mouse_low-poly.glb',
    actualDimensions: { widthM: 0.08, depthM: 0.12, heightM: 0.048 },
  },
  'acc-minimal-mouse': {
    name: 'Studio Optical Mouse',
    category: 'accessories',
    modelType: 'computer_mouse',
    modelUrl: '/3dObject/computer_mouse_low-poly.glb',
    actualDimensions: { widthM: 0.075, depthM: 0.115, heightM: 0.04 },
  },
  'monis-gaming-mouse-a4': {
    name: 'A4Tech Bloody V7 Gaming Mouse',
    category: 'accessories',
    modelType: 'computer_mouse',
    modelUrl: '/3dObject/computer_mouse_a4tech_bloody_v7.glb',
    actualDimensions: { widthM: 0.08, depthM: 0.12, heightM: 0.042 },
  },
  // Lamps
  'monis-lamp-151': {
    name: 'Smart LED Desk Lamp 1S',
    category: 'lighting',
    modelType: 'desk_lamp',
    modelUrl: '/3dObject/xiaomi_led_desk_lamp_1s.glb',
    actualDimensions: { widthM: 0.16, depthM: 0.16, heightM: 0.46 },
  },
  'light-tomons': {
    name: 'Tomons Scandinavian Wood Swing-Arm',
    category: 'lighting',
    modelType: 'desk_lamp',
    modelUrl: '/3dObject/tomons_desk_lamp.glb',
    actualDimensions: { widthM: 0.20, depthM: 0.20, heightM: 0.48 },
  },
  'monis-modern-desk-lamp': {
    name: 'Modern Architect Drafting Lamp',
    category: 'lighting',
    modelType: 'desk_lamp',
    modelUrl: '/3dObject/modern_desk_lamp.glb',
    actualDimensions: { widthM: 0.22, depthM: 0.22, heightM: 0.52 },
  },
};

/** Helper to load and mount a real .glb / 3D model from SIMS_CATALOG if available, tagging with slot data */
export function tryLoad3DModel(
  productId: string | undefined,
  slot: DeskStudioSlot,
  parentGroup: THREE.Group,
  position: [number, number, number],
  rotation?: [number, number, number],
  activeColor?: string
): THREE.Group | null {
  if (!productId) return null;

  let product = SIMS_CATALOG.find((p) => p.id === productId);
  if (!product || !product.modelUrl) {
    const override = PRODUCT_3D_MODELS[productId];
    if (override) {
      product = {
        id: productId,
        name: override.name,
        category: override.category,
        modelType: override.modelType as any,
        modelUrl: override.modelUrl,
        weeklyRent: 10,
        monthlyRent: 30,
        deposit: 10,
        brand: 'Monis',
        layer: 'surface',
        color: '#1e293b',
        description: '',
        icon: '📦',
        footprint: { width: 1, depth: 1 },
        actualDimensions: override.actualDimensions,
        scaleMultiplier: override.scaleMultiplier,
        fitMode: override.fitMode,
      };
    }
  }

  if (!product || !product.modelUrl) return null;

  const modelGroup = createFurnitureMesh(product, activeColor, () => {
    tagSlot(modelGroup, slot, product.name);
  });
  modelGroup.name = `${slot}_${product.id}`;
  modelGroup.position.set(position[0], position[1], position[2]);
  if (rotation) {
    modelGroup.rotation.set(rotation[0], rotation[1], rotation[2]);
  }
  tagSlot(modelGroup, slot, product.name);
  parentGroup.add(modelGroup);
  return modelGroup;
}

function createTabletopMaterial(finish: WorkstationConfig['tabletopFinish']) {
  switch (finish) {
    case 'walnut':
      return new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.38, metalness: 0.05 });
    case 'bamboo':
      return new THREE.MeshStandardMaterial({ color: 0xc8985c, roughness: 0.42, metalness: 0.02 });
    case 'carbon_black':
      return new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.55, metalness: 0.2 });
    case 'white':
      return new THREE.MeshStandardMaterial({ color: 0xf5f6f8, roughness: 0.3, metalness: 0.02 });
    case 'oak':
    default:
      return new THREE.MeshStandardMaterial({ color: 0xc49a64, roughness: 0.45, metalness: 0.05 });
  }
}

function createFrameMaterial(color: WorkstationConfig['frameColor']) {
  switch (color) {
    case 'white':
      return new THREE.MeshStandardMaterial({ color: 0xededf2, roughness: 0.35, metalness: 0.3 });
    case 'space_grey':
      return new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.6 });
    case 'black':
    default:
      return new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.5, metalness: 0.4 });
  }
}

/** Tabletop, edge trim, crossbar, keypad and telescopic legs. Returns the tabletop mesh. */
export function buildDesk(
  config: WorkstationConfig,
  dims: StationDims,
  movingGroup: THREE.Group,
  legsGroup: THREE.Group
): THREE.Mesh {
  const { deskW, deskD, deskT } = dims;
  const frameMat = createFrameMaterial(config.frameColor);
  const tabletopMat = createTabletopMaterial(config.tabletopFinish);

  // 1. Clean up any previous desk structure meshes from movingGroup
  ['tabletop', 'edgeTrim', 'crossbar', 'keypad', 'keypadLed'].forEach((name) => {
    const prev = movingGroup.getObjectByName(name);
    if (prev) {
      movingGroup.remove(prev);
      if ((prev as THREE.Mesh).geometry) (prev as THREE.Mesh).geometry.dispose();
    }
  });

  // Tabletop with selected architectural finish
  const tabletop = new THREE.Mesh(new THREE.BoxGeometry(deskW, deskT, deskD), tabletopMat);
  tabletop.name = 'tabletop';
  tabletop.position.set(0, -deskT / 2, 0);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  tagSlot(tabletop, 'table', 'Motorized Standing Desk');
  movingGroup.add(tabletop);

  // Dual Motor Under-Desk Crossbar Beam
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(deskW * 0.78, 0.04, 0.06), frameMat);
  crossbar.name = 'crossbar';
  crossbar.position.set(0, -deskT - 0.02, 0);
  tagSlot(crossbar, 'table', 'Desk Motor Frame');
  movingGroup.add(crossbar);

  // Motorized Control Keypad on front right edge
  const keypadMat = new THREE.MeshStandardMaterial({ color: 0x090a0f, roughness: 0.2, metalness: 0.8 });
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.045), keypadMat);
  keypad.name = 'keypad';
  keypad.position.set(deskW / 2 - 0.12, -deskT - 0.008, deskD / 2 - 0.015);
  tagSlot(keypad, 'table', 'Motorized Elevation Keypad');
  movingGroup.add(keypad);

  // Digital LED display on keypad
  const led = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.01), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  led.name = 'keypadLed';
  led.rotation.x = Math.PI / 2;
  led.position.set(deskW / 2 - 0.14, -deskT + 0.001, deskD / 2 - 0.015);
  movingGroup.add(led);

  // 2. Telescopic Motorized Lifting Legs (Stationary Ground Legs + Extending Inner Leg)
  const legSpacingX = deskW * 0.42;
  const outerLegH = 0.42;
  const outerGeo = new THREE.BoxGeometry(0.07, outerLegH, 0.08);
  const footGeo = new THREE.BoxGeometry(0.08, 0.025, deskD * 0.85);

  [-legSpacingX, legSpacingX].forEach((lx, i) => {
    // Steel Foot
    const foot = new THREE.Mesh(footGeo, frameMat);
    foot.position.set(lx, 0.013, 0);
    foot.castShadow = true;
    foot.receiveShadow = true;
    tagSlot(foot, 'table', 'Steel Desk Foot');
    legsGroup.add(foot);

    // Levelling Glides
    const glideGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.008, 12);
    const glideMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const glide1 = new THREE.Mesh(glideGeo, glideMat);
    glide1.position.set(lx, 0.004, deskD * 0.35);
    const glide2 = new THREE.Mesh(glideGeo, glideMat);
    glide2.position.set(lx, 0.004, -deskD * 0.35);
    legsGroup.add(glide1);
    legsGroup.add(glide2);

    // Stationary Outer Column
    const outerLeg = new THREE.Mesh(outerGeo, frameMat);
    outerLeg.position.set(lx, outerLegH / 2, 0);
    outerLeg.castShadow = true;
    outerLeg.receiveShadow = true;
    tagSlot(outerLeg, 'table', 'Lifting Column');
    legsGroup.add(outerLeg);

    // Telescopic Inner Column (Scales and moves with elevation)
    const innerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.7, 0.068), frameMat);
    innerLeg.name = i === 0 ? 'innerLegL' : 'innerLegR';
    innerLeg.castShadow = true;
    innerLeg.position.set(lx, outerLegH + 0.2, 0);
    tagSlot(innerLeg, 'table', 'Telescopic Leg');
    legsGroup.add(innerLeg);
  });

  return tabletop;
}

/** Builds the ergonomic chair seated in front of the desk */
export function buildChair(
  config: WorkstationConfig,
  dims: StationDims,
  chairGroup: THREE.Group
) {
  const { deskD } = dims;
  const chairModel = config.chairModel || 'aeron_mesh';
  const chairColor = config.chairColor || 'graphite';
  const CHAIR_HEX_MAP: Record<string, string> = {
    graphite: '#262b35',
    mineral: '#e2e8f0',
    onyx: '#0f172a',
    tan: '#b48a60',
  };
  const activeColorHex = CHAIR_HEX_MAP[chairColor] || (chairColor.startsWith('#') ? chairColor : '#262b35');

  // 1. Position chair back in open studio staging facing workspace so it never blocks the desk
  const chairZ = deskD * 0.5 + 0.72;
  const chairRotY = Math.PI - 0.28;

  // 2. Direct 3D model loading for selected chair item
  const chairProductId = config.chairProductId || config.chairModelId || (
    chairModel === 'office_executive' ? 'monis-furradec-111' :
    chairModel === 'gaming_racing' ? 'monis-jarv-176' :
    'monis-ergo-chair-6'
  );

  const model = tryLoad3DModel(
    chairProductId,
    'chair',
    chairGroup,
    [0, 0, chairZ],
    [0, chairRotY, 0],
    activeColorHex
  );
  if (model) return;

  // Palette based on chairColor
  let frameColorHex = 0x1e222b;
  let seatColorHex = 0x282e3b;
  let accentColorHex = 0x475569;

  if (chairColor === 'mineral') {
    frameColorHex = 0xcbd5e1;
    seatColorHex = 0xe2e8f0;
    accentColorHex = 0x94a3b8;
  } else if (chairColor === 'onyx') {
    frameColorHex = 0x0f1117;
    seatColorHex = 0x171922;
    accentColorHex = 0x27272a;
  } else if (chairColor === 'tan') {
    frameColorHex = 0x1c1917;
    seatColorHex = 0x92400e; // warm saddle brown leather
    accentColorHex = 0xb45309;
  }

  const baseMat = new THREE.MeshStandardMaterial({ color: frameColorHex, roughness: 0.35, metalness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd8dadf, roughness: 0.15, metalness: 0.9 });
  const seatMat = new THREE.MeshStandardMaterial({
    color: seatColorHex,
    roughness: chairModel === 'office_executive' ? 0.35 : 0.65,
    metalness: chairModel === 'office_executive' ? 0.1 : 0.05
  });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColorHex, roughness: 0.4, metalness: 0.2 });

  const root = new THREE.Group();
  root.name = 'chairRoot';

  // 1. 5-Star Caster Base
  const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16);
  const hub = new THREE.Mesh(hubGeo, baseMat);
  hub.position.y = 0.06;
  hub.castShadow = true;
  root.add(hub);

  const casterLegLength = 0.32;
  const casterWheelGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.016, 12);
  const casterMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.6 });

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const legArm = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.02, casterLegLength), baseMat);
    legArm.position.set(
      Math.sin(angle) * (casterLegLength * 0.46),
      0.05,
      Math.cos(angle) * (casterLegLength * 0.46)
    );
    legArm.rotation.y = angle;
    legArm.rotation.x = -0.06; // slight downward arch
    legArm.castShadow = true;
    root.add(legArm);

    // Wheel at tip
    const wheel = new THREE.Mesh(casterWheelGeo, casterMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(
      Math.sin(angle) * (casterLegLength * 0.92),
      0.024,
      Math.cos(angle) * (casterLegLength * 0.92)
    );
    wheel.castShadow = true;
    root.add(wheel);
  }

  // 2. Telescopic Pneumatic Cylinder
  const cylOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.16, 16), baseMat);
  cylOuter.position.y = 0.15;
  cylOuter.castShadow = true;
  root.add(cylOuter);

  const cylInner = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 16), chromeMat);
  cylInner.position.y = 0.28;
  cylInner.castShadow = true;
  root.add(cylInner);

  // 3. Under-seat Tilt Mechanism
  const mech = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.2), baseMat);
  mech.position.y = 0.38;
  mech.castShadow = true;
  root.add(mech);

  // 4. Ergonomic Seat Pan (Molded Waterfall Cushion / Pellicle Mesh)
  const seatHeightY = 0.44;
  const seatFrame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, 0.46), baseMat);
  seatFrame.position.y = seatHeightY;
  seatFrame.castShadow = true;
  root.add(seatFrame);

  const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.045, 0.42), seatMat);
  seatCushion.position.set(0, seatHeightY + 0.02, -0.01);
  seatCushion.castShadow = true;
  root.add(seatCushion);

  // 5. Lumbar Spine & Backrest
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.45, 0.035), baseMat);
  spine.position.set(0, seatHeightY + 0.24, 0.21);
  spine.rotation.x = -0.08;
  spine.castShadow = true;
  root.add(spine);

  // Lumbar Pad
  const lumbar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.03), accentMat);
  lumbar.position.set(0, seatHeightY + 0.22, 0.18);
  lumbar.castShadow = true;
  root.add(lumbar);

  // Backrest Frame & Mesh
  const backW = chairModel === 'gaming_racing' ? 0.44 : 0.46;
  const backH = chairModel === 'gaming_racing' ? 0.62 : 0.52;
  const backFrame = new THREE.Mesh(new THREE.BoxGeometry(backW, backH, 0.028), baseMat);
  backFrame.position.set(0, seatHeightY + 0.34, 0.2);
  backFrame.rotation.x = -0.08;
  backFrame.castShadow = true;
  root.add(backFrame);

  const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(backW - 0.05, backH - 0.05), seatMat);
  backMesh.position.set(0, seatHeightY + 0.34, 0.185);
  backMesh.rotation.x = -0.08;
  root.add(backMesh);

  // 6. Adjustable 3D Armrests
  [-0.24, 0.24].forEach((ax) => {
    // Vertical Arm Upright
    const armUp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.04), baseMat);
    armUp.position.set(ax, seatHeightY + 0.11, -0.02);
    armUp.castShadow = true;
    root.add(armUp);

    // Soft Polyurethane Arm Pad
    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.022, 0.22), accentMat);
    armPad.position.set(ax, seatHeightY + 0.21, -0.02);
    armPad.castShadow = true;
    root.add(armPad);
  });

  // 7. Headrest (for Aeron, Highback, and Gaming models)
  if (chairModel !== 'office_executive') {
    const headrestPost = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 12), baseMat);
    headrestPost.position.set(0, seatHeightY + 0.58, 0.22);
    root.add(headrestPost);

    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.13, 0.045), seatMat);
    headrest.position.set(0, seatHeightY + 0.65, 0.2);
    headrest.rotation.x = -0.06;
    headrest.castShadow = true;
    root.add(headrest);
  }

  // Tag every mesh with chair slot
  tagSlot(root, 'chair', config.chairName || 'Ergonomic Office Chair');

  // Position chair farther back in open studio staging facing the workspace (-Z)
  root.position.set(0, 0, deskD * 0.5 + 0.65);
  root.rotation.y = Math.PI - 0.22;

  chairGroup.add(root);
}

/** Monitor setup (single / dual / ultrawide / laptop + 27") with virtual screen textures. */
export function buildMonitors(config: WorkstationConfig, dims: StationDims, monitorsGroup: THREE.Group) {
  const { deskD, monitorDepthZ } = dims;

  // 1. Direct 3D model loading for selected monitor item (e.g. 34" Ultrawide or Dual 27" on arm)
  const monitorProductId = config.monitorProductId || (
    config.monitorSetup === 'ultrawide_34' ? 'monis-curved-34' :
    config.monitorSetup === 'dual_27' ? 'acc-dual-monitor-arm' :
    undefined
  );

  const model = tryLoad3DModel(
    monitorProductId,
    'monitor',
    monitorsGroup,
    [0, 0, monitorDepthZ]
  );
  if (model) return;

  const screenTexture = getVirtualScreenTexture(config.virtualScreenTheme);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f1117, roughness: 0.4, metalness: 0.8 });
  const monitorArmMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.35, metalness: 0.7 });

  // Single 16:9 monitor
  const buildMonitor16_9 = (wM = 0.62, hM = 0.36, posX = 0, rotY = 0) => {
    const monGroup = new THREE.Group();
    monGroup.position.set(posX, MONITOR_ELEVATION_Y, monitorDepthZ);
    monGroup.rotation.y = rotY;

    // Bezel Frame
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(wM + 0.014, hM + 0.014, 0.02), bezelMat);
    bezel.castShadow = true;
    monGroup.add(bezel);

    // Screen Face
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(wM, hM), screenMat);
    screen.position.set(0, 0, 0.011);
    monGroup.add(screen);

    // Rear Housing & Ambient Glow
    const rear = new THREE.Mesh(new THREE.BoxGeometry(wM * 0.6, hM * 0.6, 0.035), bezelMat);
    rear.position.set(0, 0, -0.018);
    monGroup.add(rear);

    // Stand vs Gas Spring Arm
    if (config.monitorMount === 'stand') {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, MONITOR_ELEVATION_Y, 16), monitorArmMat);
      post.position.set(0, -MONITOR_ELEVATION_Y / 2, -0.02);
      post.castShadow = true;
      monGroup.add(post);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.008, 0.18), monitorArmMat);
      base.position.set(0, -MONITOR_ELEVATION_Y + 0.004, -0.02);
      base.castShadow = true;
      monGroup.add(base);
    }

    tagSlot(monGroup, 'monitor', '4K Studio Display');
    return monGroup;
  };

  // 34" Ultrawide Curved Display (21:9)
  const buildUltrawide34 = () => {
    const monGroup = new THREE.Group();
    monGroup.position.set(0, MONITOR_ELEVATION_Y + 0.02, monitorDepthZ);

    const uwW = 0.84;
    const uwH = 0.38;

    // Curved Screen approximation with 3 segments
    const segW = uwW / 3;
    const centerBezelGeo = new THREE.BoxGeometry(segW, uwH, 0.02);
    const centerBezel = new THREE.Mesh(centerBezelGeo, bezelMat);
    centerBezel.castShadow = true;
    monGroup.add(centerBezel);

    const centerScreenGeo = new THREE.PlaneGeometry(segW, uwH - 0.01);
    const centerScreen = new THREE.Mesh(centerScreenGeo, screenMat);
    centerScreen.position.set(0, 0, 0.011);
    monGroup.add(centerScreen);

    // Angled wings for subtle 1800R curvature
    const wingAngle = 0.14; // ~8 deg
    [-1, 1].forEach((dir) => {
      const wingBezel = new THREE.Mesh(centerBezelGeo, bezelMat);
      wingBezel.position.set(dir * (segW * 0.98), 0, -0.01);
      wingBezel.rotation.y = -dir * wingAngle;
      wingBezel.castShadow = true;
      monGroup.add(wingBezel);

      const wingScreen = new THREE.Mesh(centerScreenGeo, screenMat);
      wingScreen.position.set(dir * (segW * 0.98), 0, -0.01 + 0.011);
      wingScreen.rotation.y = -dir * wingAngle;
      monGroup.add(wingScreen);
    });

    // Gas-Spring Arm or Stand
    if (config.monitorMount === 'gas_spring_arm') {
      const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 12), monitorArmMat);
      arm1.rotation.x = Math.PI / 4;
      arm1.position.set(0, -0.1, -0.12);
      arm1.castShadow = true;
      monGroup.add(arm1);

      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.07), monitorArmMat);
      clamp.position.set(0, -MONITOR_ELEVATION_Y - 0.01, -deskD * 0.2);
      clamp.castShadow = true;
      monGroup.add(clamp);
    } else {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, MONITOR_ELEVATION_Y + 0.02, 16), monitorArmMat);
      post.position.set(0, -(MONITOR_ELEVATION_Y + 0.02) / 2, -0.04);
      post.castShadow = true;
      monGroup.add(post);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.01, 0.2), monitorArmMat);
      base.position.set(0, -(MONITOR_ELEVATION_Y + 0.02) + 0.005, -0.04);
      base.castShadow = true;
      monGroup.add(base);
    }

    tagSlot(monGroup, 'monitor', '34" Ultrawide Curved Display');
    return monGroup;
  };

  // Primary 27" on the right + laptop on a riser stand on the left
  const buildLaptopPlus27 = () => {
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-0.35, 0.14, monitorDepthZ + 0.05);
    laptopGroup.rotation.y = 0.22;

    // Aluminum Stand
    const standRiserMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3, metalness: 0.8 });
    const standRiser = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.18), standRiserMat);
    standRiser.position.y = -0.06;
    standRiser.castShadow = true;
    laptopGroup.add(standRiser);

    // Laptop Base
    const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.008, 0.22), standRiserMat);
    lapBase.castShadow = true;
    laptopGroup.add(lapBase);

    // Laptop Display Lid
    const lapLid = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.2, 0.006), standRiserMat);
    lapLid.position.set(0, 0.1, -0.1);
    lapLid.rotation.x = -0.25;
    laptopGroup.add(lapLid);

    // Laptop Screen
    const lapScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.18), screenMat);
    lapScreen.position.set(0, 0.1, -0.096);
    lapScreen.rotation.x = -0.25;
    laptopGroup.add(lapScreen);

    tagSlot(laptopGroup, 'monitor', 'Laptop Sidecar');
    return laptopGroup;
  };

  switch (config.monitorSetup) {
    case 'ultrawide_34':
      monitorsGroup.add(buildUltrawide34());
      break;
    case 'dual_27':
      monitorsGroup.add(buildMonitor16_9(0.58, 0.35, -0.31, 0.18));
      monitorsGroup.add(buildMonitor16_9(0.58, 0.35, 0.31, -0.18));
      break;
    case 'laptop_plus_27':
      monitorsGroup.add(buildMonitor16_9(0.62, 0.36, 0.18, -0.08));
      monitorsGroup.add(buildLaptopPlus27());
      break;
    case 'single_27':
    default:
      monitorsGroup.add(buildMonitor16_9(0.62, 0.36, 0, 0));
      break;
  }
}

/** Desk Lamp / Screenbar with interactive light cone spotlight */
export function buildLightBar(
  config: WorkstationConfig,
  dims: StationDims,
  monitorsGroup: THREE.Group,
  deskSpot: THREE.SpotLight | null
) {
  const { deskW, monitorDepthZ, deskD } = dims;
  const lampVariant = config.lampVariant || 'screenbar';

  if (config.lightTemperature === 'off' || lampVariant === 'none') {
    if (deskSpot) deskSpot.visible = false;
    return;
  }

  // Light beam emissive strip color
  const lightCol =
    config.lightTemperature === 'warm_3000k'
      ? 0xffedd5
      : config.lightTemperature === 'cool_6500k'
      ? 0xbae6fd
      : 0xfef3c7;

  // 1. Direct 3D model loading for selected lamp item
  const lampProductId = config.lampProductId || (
    lampVariant === 'xiaomi_led_1s' ? 'monis-lamp-151' :
    lampVariant === 'tomons_wooden' ? 'light-tomons' :
    lampVariant === 'modern_architect' ? 'monis-modern-desk-lamp' :
    undefined
  );

  if (lampProductId && lampVariant !== 'screenbar') {
    const lampModel = tryLoad3DModel(
      lampProductId,
      'lamp',
      monitorsGroup,
      [-deskW * 0.42, 0, -deskD * 0.22],
      [0, 0.4, 0]
    );
    if (lampModel) {
      if (deskSpot) {
        deskSpot.visible = true;
        deskSpot.color.setHex(lightCol);
        deskSpot.intensity = (config.lightBrightness / 100) * 3.8;
        deskSpot.position.set(-deskW * 0.42 + 0.1, 0.45, -deskD * 0.22 + 0.1);
        deskSpot.target.position.set(0, 0, 0);
      }
      return;
    }
  }

  if (lampVariant === 'screenbar') {
    const barW = config.monitorSetup === 'ultrawide_34' ? 0.48 : 0.42;
    const barMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.3, metalness: 0.9 });
    const screenbar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, barW, 16), barMat);
    screenbar.rotation.z = Math.PI / 2;
    screenbar.position.set(0, MONITOR_ELEVATION_Y + 0.22, monitorDepthZ + 0.02);
    tagSlot(screenbar, 'lamp', 'Screenbar Light');
    monitorsGroup.add(screenbar);

    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(barW - 0.04, 0.008),
      new THREE.MeshBasicMaterial({ color: lightCol })
    );
    strip.rotation.x = Math.PI / 2;
    strip.position.set(0, MONITOR_ELEVATION_Y + 0.208, monitorDepthZ + 0.02);
    tagSlot(strip, 'lamp', 'Screenbar Light');
    monitorsGroup.add(strip);

    if (deskSpot) {
      deskSpot.visible = true;
      deskSpot.color.setHex(lightCol);
      deskSpot.intensity = (config.lightBrightness / 100) * 3.8;
      deskSpot.position.set(0, MONITOR_ELEVATION_Y + 0.2, monitorDepthZ + 0.05);
      deskSpot.target.position.set(0, 0, 0);
    }
  } else if (lampVariant === 'xiaomi_led_1s') {
    // Xiaomi Minimalist Smart LED Desk Lamp 1S
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-deskW * 0.42, 0, -deskD * 0.22);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25 });
    const redAccentMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Round base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.012, 24), whiteMat);
    base.position.y = 0.006;
    base.castShadow = true;
    lampGroup.add(base);

    // Vertical Stem
    const stemH = 0.42;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, stemH, 16), whiteMat);
    stem.position.y = stemH / 2;
    stem.castShadow = true;
    lampGroup.add(stem);

    // Red wire accent loop at pivot
    const wire = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.003, 8, 16), redAccentMat);
    wire.position.set(0, stemH - 0.02, 0.015);
    lampGroup.add(wire);

    // Articulated Arm angled forward
    const armL = 0.38;
    const armGroup = new THREE.Group();
    armGroup.position.set(0, stemH, 0);
    armGroup.rotation.x = -0.35; // angled down towards center
    armGroup.rotation.y = -0.4;

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, armL, 16), whiteMat);
    arm.rotation.x = Math.PI / 2;
    arm.position.z = armL / 2;
    arm.castShadow = true;
    armGroup.add(arm);

    // Emissive light strip underneath arm
    const lampStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.008, armL * 0.8), new THREE.MeshBasicMaterial({ color: lightCol }));
    lampStrip.rotation.x = Math.PI / 2;
    lampStrip.position.set(0, -0.007, armL / 2);
    armGroup.add(lampStrip);

    lampGroup.add(armGroup);
    tagSlot(lampGroup, 'lamp', 'Xiaomi Smart LED Lamp 1S');
    monitorsGroup.add(lampGroup);

    if (deskSpot) {
      deskSpot.visible = true;
      deskSpot.color.setHex(lightCol);
      deskSpot.intensity = (config.lightBrightness / 100) * 4.0;
      deskSpot.position.set(-deskW * 0.42 + 0.15, 0.45, -deskD * 0.22 + 0.15);
      deskSpot.target.position.set(-0.05, 0, 0.05);
    }
  } else if (lampVariant === 'tomons_wooden') {
    // Tomons Scandinavian Wooden Articulated Lamp
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-deskW * 0.42, 0, -deskD * 0.2);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.45 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.8 });

    // Round metal base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.015, 24), metalMat);
    base.position.y = 0.008;
    base.castShadow = true;
    lampGroup.add(base);

    // Lower wooden arm
    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 0.02), woodMat);
    lowerArm.position.set(0, 0.12, 0);
    lowerArm.rotation.z = -0.15;
    lowerArm.castShadow = true;
    lampGroup.add(lowerArm);

    // Middle brass joint
    const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 12), brassMat);
    joint.rotation.z = Math.PI / 2;
    joint.position.set(0.035, 0.23, 0);
    lampGroup.add(joint);

    // Upper wooden arm angled forward
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.02), woodMat);
    upperArm.position.set(0.08, 0.32, 0.05);
    upperArm.rotation.x = -0.3;
    upperArm.rotation.z = 0.2;
    upperArm.castShadow = true;
    lampGroup.add(upperArm);

    // Painted conical lampshade
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.11, 16, 1, true), metalMat);
    shade.rotation.x = Math.PI / 2 + 0.4;
    shade.position.set(0.12, 0.4, 0.14);
    shade.castShadow = true;
    lampGroup.add(shade);

    // Emissive bulb inside shade
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), new THREE.MeshBasicMaterial({ color: lightCol }));
    bulb.position.set(0.12, 0.39, 0.14);
    lampGroup.add(bulb);

    tagSlot(lampGroup, 'lamp', 'Tomons Nordic Wooden Lamp');
    monitorsGroup.add(lampGroup);

    if (deskSpot) {
      deskSpot.visible = true;
      deskSpot.color.setHex(lightCol);
      deskSpot.intensity = (config.lightBrightness / 100) * 3.6;
      deskSpot.position.set(-deskW * 0.42 + 0.12, 0.4, -deskD * 0.2 + 0.14);
      deskSpot.target.position.set(-0.05, 0, 0.05);
    }
  } else if (lampVariant === 'modern_architect') {
    // Modern Architect Swing-Arm Desk Lamp
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-deskW * 0.42, 0, -deskD * 0.22);

    const blackSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e222b, roughness: 0.35, metalness: 0.6 });

    // Table Clamp
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), blackSteelMat);
    clamp.position.y = 0.02;
    lampGroup.add(clamp);

    // Articulated dual struts
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.28, 12), blackSteelMat);
    arm1.position.set(0, 0.15, 0);
    arm1.rotation.z = -0.25;
    lampGroup.add(arm1);

    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.28, 12), blackSteelMat);
    arm2.position.set(0.06, 0.36, 0.08);
    arm2.rotation.x = -0.35;
    lampGroup.add(arm2);

    // Dome shade
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 16), blackSteelMat);
    shade.rotation.x = Math.PI / 2 + 0.3;
    shade.position.set(0.1, 0.46, 0.16);
    lampGroup.add(shade);

    tagSlot(lampGroup, 'lamp', 'Modern Architect Lamp');
    monitorsGroup.add(lampGroup);

    if (deskSpot) {
      deskSpot.visible = true;
      deskSpot.color.setHex(lightCol);
      deskSpot.intensity = (config.lightBrightness / 100) * 3.8;
      deskSpot.position.set(-deskW * 0.42 + 0.1, 0.46, -deskD * 0.22 + 0.16);
      deskSpot.target.position.set(-0.05, 0, 0.05);
    }
  }
}

/** Desk mat, keyboard, mouse, plant, audio & extras */
export function buildAccessories(config: WorkstationConfig, dims: StationDims, accessoriesGroup: THREE.Group) {
  const { deskW, monitorDepthZ } = dims;

  // 1. Desk Mat (Mouse Pad)
  if (config.deskMat !== 'none') {
    const matColors: Record<string, number> = {
      felt_charcoal: 0x27272a,
      felt_grey: 0x52525b,
      leather_tan: 0x92400e,
      leather_black: 0x18181b,
    };
    const matMaterial = new THREE.MeshStandardMaterial({
      color: matColors[config.deskMat] || 0x27272a,
      roughness: config.deskMat.includes('felt') ? 0.9 : 0.45,
      metalness: 0.05,
    });
    const deskMat = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.004, 0.38), matMaterial);
    deskMat.position.set(0, 0.002, 0.05);
    deskMat.receiveShadow = true;
    tagSlot(deskMat, 'mousepad', 'Executive Desk Mat');
    accessoriesGroup.add(deskMat);
  }

  // 2. Keyboard
  const keyboardProductId = config.keyboardProductId || (
    config.keyboardVariant === 'mechanical_compact' ? 'monis-mech-keyboard' :
    config.keyboardVariant === 'gaming_rgb' ? 'monis-gaming-keyboard' :
    undefined
  );
  const kb3d = tryLoad3DModel(
    keyboardProductId,
    'keyboard',
    accessoriesGroup,
    [-0.06, 0, 0.08],
    [0, 0, 0]
  );

  if (!kb3d) {
    const kbW =
      config.keyboardVariant === 'mechanical_full'
        ? 0.44
        : config.keyboardVariant === 'apple_magic'
        ? 0.28
        : 0.33;
    const kbD = config.keyboardVariant === 'apple_magic' ? 0.11 : 0.13;

    // Keycap theme color mapping
    const keycapTheme = config.keycapTheme || 'stealth_dark';
    let bodyColorHex = 0x181a22;
    let keycapColorHex = 0x262933;

    if (keycapTheme === 'chalk_white') {
      bodyColorHex = 0xe2e8f0;
      keycapColorHex = 0xf8fafc;
    } else if (keycapTheme === 'cyber_neon') {
      bodyColorHex = 0x0f172a;
      keycapColorHex = 0x0284c7;
    } else if (keycapTheme === 'retro_beige') {
      bodyColorHex = 0xd6cbb8;
      keycapColorHex = 0xbdb09e;
    }

    const kbBodyMat = new THREE.MeshStandardMaterial({ color: bodyColorHex, roughness: 0.35, metalness: 0.3 });
    const kbKeyMat = new THREE.MeshStandardMaterial({ color: keycapColorHex, roughness: 0.45, metalness: 0.1 });

    const keyboardGroup = new THREE.Group();
    keyboardGroup.position.set(-0.06, 0.007, 0.08);

    const kbBase = new THREE.Mesh(new THREE.BoxGeometry(kbW, 0.012, kbD), kbBodyMat);
    kbBase.castShadow = true;
    keyboardGroup.add(kbBase);

    // Keycaps block
    const kbKeys = new THREE.Mesh(new THREE.BoxGeometry(kbW - 0.016, 0.006, kbD - 0.016), kbKeyMat);
    kbKeys.position.y = 0.008;
    keyboardGroup.add(kbKeys);

    // Accent Return key
    const accentKeyMat = new THREE.MeshBasicMaterial({
      color: keycapTheme === 'cyber_neon' ? 0xf43f5e : keycapTheme === 'retro_beige' ? 0x991b1b : 0x06b6d4,
    });
    const accentKey = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.007, 0.018), accentKeyMat);
    accentKey.position.set(kbW * 0.36, 0.0085, 0.01);
    keyboardGroup.add(accentKey);

    tagSlot(keyboardGroup, 'keyboard', 'Mechanical Keyboard');
    accessoriesGroup.add(keyboardGroup);
  }

  // 3. Mouse
  const mouseProductId = config.mouseProductId || (
    config.mouseVariant === 'bloody_gaming' ? 'monis-gaming-mouse-a4' :
    config.mouseVariant === 'precision_mx' ? 'monis-precision-mouse' :
    config.mouseVariant === 'low_poly_clean' ? 'acc-minimal-mouse' :
    undefined
  );
  const mouse3d = tryLoad3DModel(
    mouseProductId,
    'mouse',
    accessoriesGroup,
    [0.25, 0, 0.08],
    [0, 0, 0]
  );

  if (!mouse3d) {
    const mouseGroup = new THREE.Group();
    mouseGroup.position.set(0.25, 0.012, 0.08);

    const mouseH = config.mouseVariant === 'ergonomic_vertical' ? 0.048 : 0.024;
    const mouseMat = new THREE.MeshStandardMaterial({
      color: config.mouseVariant === 'bloody_gaming' ? 0x0f172a : 0x1e293b,
      roughness: 0.3,
      metalness: 0.2,
    });

    const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.065, mouseH, 0.11), mouseMat);
    mouseBody.castShadow = true;
    mouseGroup.add(mouseBody);

    // Metal knurled scroll wheel
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.2, metalness: 0.9 });
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 12), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, mouseH / 2 + 0.002, -0.02);
    mouseGroup.add(wheel);

    tagSlot(mouseGroup, 'mouse', 'Precision Mouse');
    accessoriesGroup.add(mouseGroup);
  }

  // 4. Accessory Slot 2: Potted Plant / Small Pot
  const plantVariant = config.plantVariant || 'monstera';
  if (plantVariant !== 'none') {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(deskW * 0.41, 0, 0.12);

    if (plantVariant === 'succulent') {
      // Minimalist Ceramic Succulent
      const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.075, 16), potMat);
      pot.position.y = 0.038;
      pot.castShadow = true;
      plantGroup.add(pot);

      // Dark volcanic soil
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.01, 16), new THREE.MeshStandardMaterial({ color: 0x261e1b }));
      soil.position.y = 0.072;
      plantGroup.add(soil);

      // Succulent Rosette
      const succulentMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
      const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), succulentMat);
      rosette.scale.set(1, 0.65, 1);
      rosette.position.y = 0.092;
      rosette.castShadow = true;
      plantGroup.add(rosette);
    } else if (plantVariant === 'cactus') {
      // Terracotta Desert Cactus
      const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 0.08, 16), potMat);
      pot.position.y = 0.04;
      pot.castShadow = true;
      plantGroup.add(pot);

      // Cactus Column
      const cactusMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
      const cactus = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.12, 12), cactusMat);
      cactus.position.y = 0.13;
      cactus.castShadow = true;
      plantGroup.add(cactus);

      // Pink flower on top
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      flower.position.y = 0.195;
      plantGroup.add(flower);
    } else if (plantVariant === 'bonsai') {
      // Zen Japanese Bonsai
      const potMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
      const pot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.08), potMat);
      pot.position.y = 0.018;
      pot.castShadow = true;
      plantGroup.add(pot);

      // Gnarled Trunk
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.8 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.018, 0.11, 8), trunkMat);
      trunk.position.set(-0.01, 0.08, 0);
      trunk.rotation.z = -0.2;
      trunk.castShadow = true;
      plantGroup.add(trunk);

      // Cloud foliage pads
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.65 });
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), foliageMat);
      foliage1.scale.set(1.4, 0.6, 1.2);
      foliage1.position.set(0.02, 0.13, 0);
      plantGroup.add(foliage1);
    } else {
      // Monstera Deliciosa
      const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16), potMat);
      pot.position.y = 0.045;
      pot.castShadow = true;
      plantGroup.add(pot);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), leafMat);
      foliage.scale.set(1, 1.3, 0.9);
      foliage.position.y = 0.12;
      foliage.castShadow = true;
      plantGroup.add(foliage);
    }

    tagSlot(plantGroup, 'plant', 'Potted Plant');
    accessoriesGroup.add(plantGroup);
  }

  // 5. Accessory Slot 3: Speakers, Coffee Mug, or Studio Headphones
  const slot3 = config.accessorySlot3 || (config.speakersEnabled ? 'speakers' : config.hasCoffeeMug ? 'coffee_mug' : 'none');

  if (slot3 === 'speakers' || config.speakersEnabled) {
    const spkD = 0.13;
    const spkH = 0.18;
    const spkGeo = new THREE.BoxGeometry(0.11, spkH, spkD);
    const spkMat = new THREE.MeshStandardMaterial({ color: 0x0f1117, roughness: 0.4, metalness: 0.4 });
    const coneGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });

    [-deskW * 0.42, deskW * 0.42].forEach((sx, idx) => {
      const spkGroup = new THREE.Group();
      spkGroup.position.set(sx, spkH / 2 + 0.002, monitorDepthZ + 0.05);
      spkGroup.rotation.y = idx === 0 ? 0.25 : -0.25;

      const speakerBox = new THREE.Mesh(spkGeo, spkMat);
      speakerBox.castShadow = true;
      spkGroup.add(speakerBox);

      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.rotation.x = Math.PI / 2;
      cone.position.set(0, -0.01, spkD / 2 + 0.002);
      spkGroup.add(cone);

      tagSlot(spkGroup, 'accessory', 'Studio Monitor Speakers');
      accessoriesGroup.add(spkGroup);
    });
  }

  if (slot3 === 'coffee_mug' || config.hasCoffeeMug) {
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25, metalness: 0.1 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.08, 16), mugMat);
    mug.position.set(-deskW * 0.38, 0.04, 0.14);
    mug.castShadow = true;

    // Coffee liquid inside
    const coffeeLiquid = new THREE.Mesh(new THREE.CircleGeometry(0.034, 16), new THREE.MeshBasicMaterial({ color: 0x2b1810 }));
    coffeeLiquid.rotation.x = -Math.PI / 2;
    coffeeLiquid.position.set(-deskW * 0.38, 0.075, 0.14);
    accessoriesGroup.add(coffeeLiquid);

    tagSlot(mug, 'accessory', 'Artisan Coffee Mug');
    accessoriesGroup.add(mug);
  }

  if (slot3 === 'headphones') {
    // Studio Monitor Headphones on Aluminum Stand
    const hpGroup = new THREE.Group();
    hpGroup.position.set(-deskW * 0.42, 0, 0.04);

    const aluMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.25, metalness: 0.85 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

    // Stand base
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 20), aluMat);
    standBase.position.y = 0.004;
    standBase.castShadow = true;
    hpGroup.add(standBase);

    // Stand upright rod
    const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 16), aluMat);
    standRod.position.y = 0.11;
    standRod.castShadow = true;
    hpGroup.add(standRod);

    // Stand hanger curve
    const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), aluMat);
    hanger.rotation.x = Math.PI / 2;
    hanger.position.y = 0.22;
    hpGroup.add(hanger);

    // Headband
    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.01, 8, 16, Math.PI), leatherMat);
    headband.position.set(0, 0.21, 0);
    headband.rotation.y = Math.PI / 2;
    hpGroup.add(headband);

    // Earcups
    [-0.045, 0.045].forEach((ey) => {
      const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 16), leatherMat);
      earcup.rotation.z = Math.PI / 2;
      earcup.position.set(0, 0.15, ey);
      earcup.castShadow = true;
      hpGroup.add(earcup);
    });

    tagSlot(hpGroup, 'accessory', 'Studio Headphones');
    accessoriesGroup.add(hpGroup);
  }
}
