import * as THREE from 'three';
import type { WorkstationConfig } from '../../../types/workstation';
import { getVirtualScreenTexture } from './VirtualScreenTextures';

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

function createTabletopMaterial(finish: WorkstationConfig['tabletopFinish']) {
  switch (finish) {
    case 'walnut':
      return new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.38, metalness: 0.05 });
    case 'bamboo':
      return new THREE.MeshStandardMaterial({ color: 0xc8985c, roughness: 0.42, metalness: 0.02 });
    case 'carbon_black':
      return new THREE.MeshStandardMaterial({ color: 0x1b1d24, roughness: 0.6, metalness: 0.15 });
    case 'white':
      return new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.3, metalness: 0.02 });
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

  // 1. Tabletop (clean up existing one first)
  const prevTabletop = movingGroup.getObjectByName('tabletop');
  if (prevTabletop) movingGroup.remove(prevTabletop);

  const tabletop = new THREE.Mesh(new THREE.BoxGeometry(deskW, deskT, deskD), tabletopMat);
  tabletop.name = 'tabletop';
  tabletop.position.set(0, -deskT / 2, 0);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  movingGroup.add(tabletop);

  // Beveled Edge Trim highlight
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x1e232f, roughness: 0.4, metalness: 0.8 });
  const edgeTrim = new THREE.Mesh(new THREE.BoxGeometry(deskW + 0.002, 0.004, deskD + 0.002), edgeMat);
  edgeTrim.position.set(0, -deskT / 2, 0);
  movingGroup.add(edgeTrim);

  // Dual Motor Under-Desk Crossbar Beam
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(deskW * 0.78, 0.04, 0.06), frameMat);
  crossbar.position.set(0, -deskT - 0.02, 0);
  movingGroup.add(crossbar);

  // Motorized Control Keypad on front right edge
  const keypadMat = new THREE.MeshStandardMaterial({ color: 0x090a0f, roughness: 0.2, metalness: 0.8 });
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.045), keypadMat);
  keypad.position.set(deskW / 2 - 0.12, -deskT - 0.008, deskD / 2 - 0.015);
  movingGroup.add(keypad);

  // Digital LED display on keypad
  const led = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.01), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
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
    legsGroup.add(outerLeg);

    // Telescopic Inner Column (Scales and moves with elevation)
    const innerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.7, 0.068), frameMat);
    innerLeg.name = i === 0 ? 'innerLegL' : 'innerLegR';
    innerLeg.castShadow = true;
    innerLeg.position.set(lx, outerLegH + 0.2, 0);
    legsGroup.add(innerLeg);
  });

  return tabletop;
}

/** Monitor setup (single / dual / ultrawide / laptop + 27") with virtual screen textures. */
export function buildMonitors(config: WorkstationConfig, dims: StationDims, monitorsGroup: THREE.Group) {
  const { deskD, monitorDepthZ } = dims;

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

    return laptopGroup;
  };

  switch (config.monitorSetup) {
    case 'ultrawide_34':
      monitorsGroup.add(buildUltrawide34());
      break;
    case 'dual_27':
      // Two side-by-side monitors angled 12 degrees
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

/** Screenbar light on top of the monitors; also drives the desk spotlight color / intensity / visibility. */
export function buildLightBar(
  config: WorkstationConfig,
  dims: StationDims,
  monitorsGroup: THREE.Group,
  deskSpot: THREE.SpotLight | null
) {
  const { monitorDepthZ } = dims;

  if (config.lightTemperature === 'off') {
    if (deskSpot) deskSpot.visible = false;
    return;
  }

  const barW = config.monitorSetup === 'ultrawide_34' ? 0.48 : 0.42;
  const barMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.3, metalness: 0.9 });
  const screenbar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, barW, 16), barMat);
  screenbar.rotation.z = Math.PI / 2;
  screenbar.position.set(0, MONITOR_ELEVATION_Y + 0.22, monitorDepthZ + 0.02);
  monitorsGroup.add(screenbar);

  // Light beam emissive strip
  const lightCol =
    config.lightTemperature === 'warm_3000k'
      ? 0xffedd5
      : config.lightTemperature === 'cool_6500k'
      ? 0xbae6fd
      : 0xfef3c7;
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(barW - 0.04, 0.008),
    new THREE.MeshBasicMaterial({ color: lightCol })
  );
  strip.rotation.x = Math.PI / 2;
  strip.position.set(0, MONITOR_ELEVATION_Y + 0.208, monitorDepthZ + 0.02);
  monitorsGroup.add(strip);

  // Update Desk SpotLight color & intensity
  if (deskSpot) {
    deskSpot.visible = true;
    deskSpot.color.setHex(lightCol);
    deskSpot.intensity = (config.lightBrightness / 100) * 3.5;
    deskSpot.position.set(0, MONITOR_ELEVATION_Y + 0.2, monitorDepthZ + 0.05);
  }
}

/** Desk mat, keyboard, mouse, speakers, plant and coffee mug. */
export function buildAccessories(config: WorkstationConfig, dims: StationDims, accessoriesGroup: THREE.Group) {
  const { deskW, monitorDepthZ } = dims;

  // Desk Mat
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
    accessoriesGroup.add(deskMat);
  }

  // Keyboard
  const kbW = config.keyboardVariant === 'mechanical_full' ? 0.44 : config.keyboardVariant === 'apple_magic' ? 0.28 : 0.33;
  const kbD = config.keyboardVariant === 'apple_magic' ? 0.11 : 0.13;
  const kbMat = new THREE.MeshStandardMaterial({
    color: config.keyboardVariant === 'apple_magic' ? 0xe2e8f0 : 0x181a22,
    roughness: 0.4,
    metalness: 0.2,
  });
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(kbW, 0.014, kbD), kbMat);
  keyboard.position.set(-0.06, 0.011, 0.08);
  keyboard.castShadow = true;
  accessoriesGroup.add(keyboard);

  // Mouse
  const mouseGeo = new THREE.BoxGeometry(0.065, config.mouseVariant === 'ergonomic_vertical' ? 0.045 : 0.024, 0.11);
  const mouseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.2 });
  const mouse = new THREE.Mesh(mouseGeo, mouseMat);
  mouse.position.set(0.25, 0.012, 0.08);
  mouse.castShadow = true;
  accessoriesGroup.add(mouse);

  // Studio Speakers (Left & Right)
  if (config.speakersEnabled) {
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

      accessoriesGroup.add(spkGroup);
    });
  }

  // Potted Plant
  if (config.plantVariant !== 'none') {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(deskW * 0.41, 0, 0.12);

    // Ceramic Pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16), potMat);
    pot.position.y = 0.045;
    pot.castShadow = true;
    plantGroup.add(pot);

    // Foliage / Leaves
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), leafMat);
    foliage.scale.set(1, 1.3, 0.9);
    foliage.position.y = 0.12;
    foliage.castShadow = true;
    plantGroup.add(foliage);

    accessoriesGroup.add(plantGroup);
  }

  // Coffee Mug
  if (config.hasCoffeeMug) {
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.25, metalness: 0.1 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.08, 16), mugMat);
    mug.position.set(-deskW * 0.38, 0.04, 0.14);
    mug.castShadow = true;
    accessoriesGroup.add(mug);
  }
}

/** Ergonomic posture alignment guide hologram (gaze ray, viewing distance ring, forearm plane). */
export function buildErgonomicsGuide(config: WorkstationConfig, dims: StationDims, ergoGroup: THREE.Group) {
  const { monitorDepthZ } = dims;

  const guideMat = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 2,
  });

  const currentDeskY = config.deskHeightCm / 100;
  const eyeY = currentDeskY + 0.48; // Nominal eye level
  const eyeZ = 0.65; // Nominal user distance

  // Eye to Monitor Top 1/3 gaze ray
  const gazePoints = [
    new THREE.Vector3(0, eyeY, eyeZ),
    new THREE.Vector3(0, currentDeskY + MONITOR_ELEVATION_Y + 0.12, monitorDepthZ),
  ];
  const gazeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(gazePoints), guideMat);
  gazeLine.computeLineDistances();
  ergoGroup.add(gazeLine);

  // Viewing Distance Indicator Circle
  const distRing = new THREE.Mesh(
    new THREE.RingGeometry(0.04, 0.048, 24),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  distRing.position.set(0, eyeY, eyeZ);
  ergoGroup.add(distRing);

  // Forearm 90-degree typing indicator plane
  const elbowPlaneMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const elbowPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), elbowPlaneMat);
  elbowPlane.rotation.x = -Math.PI / 2;
  elbowPlane.position.set(0, currentDeskY + 0.015, 0.12);
  ergoGroup.add(elbowPlane);
}
