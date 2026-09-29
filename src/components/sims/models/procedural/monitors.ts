import * as THREE from 'three';
import { getMaterial } from '../materials';
import type { ModelBuilder } from './types';

export const buildDualMonitors: ModelBuilder = ({ group, darkMetal }) => {
  // Dual 27" screens mounted on gas arms
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), darkMetal);
  arm.position.set(0, 0.11, 0);
  group.add(arm);

  const screenGeo = new THREE.BoxGeometry(0.9, 0.52, 0.03);
  const ideScreenMat = getMaterial('#090d16', 0.1, 0.3);

  // Left monitor angled slightly
  const leftScreen = new THREE.Mesh(screenGeo, ideScreenMat);
  leftScreen.position.set(-0.48, 0.36, 0);
  leftScreen.rotation.y = 0.14;
  leftScreen.castShadow = true;
  group.add(leftScreen);

  // Right monitor angled slightly
  const rightScreen = new THREE.Mesh(screenGeo, ideScreenMat);
  rightScreen.position.set(0.48, 0.36, 0);
  rightScreen.rotation.y = -0.14;
  rightScreen.castShadow = true;
  group.add(rightScreen);
};

export const buildUltrawideMonitor: ModelBuilder = ({ group, product, darkMetal }) => {
  const screenW = product.actualDimensions?.widthM ?? 0.81;
  const screenH = 0.36;

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), darkMetal);
  stand.position.set(0, 0.11, 0);
  group.add(stand);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.015, 14), darkMetal);
  base.position.y = 0.01;
  group.add(base);

  // Wide curved body
  const screen = new THREE.Mesh(new THREE.BoxGeometry(screenW, screenH, 0.03), getMaterial('#0f172a', 0.1, 0.4));
  screen.position.set(0, 0.32, 0);
  screen.castShadow = true;
  group.add(screen);

  // Display face
  const displayFace = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW - 0.02, screenH - 0.02),
    new THREE.MeshStandardMaterial({ color: 0x0d1b2a, roughness: 0.1 })
  );
  displayFace.position.set(0, 0.32, 0.016);
  group.add(displayFace);
};

export const buildSingleMonitor: ModelBuilder = ({ group, product, darkMetal }) => {
  const screenW = product.actualDimensions?.widthM ?? 0.61;
  const screenH = 0.35;

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8), darkMetal);
  stand.position.set(0, 0.09, 0);
  group.add(stand);

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.16), darkMetal);
  base.position.y = 0.01;
  group.add(base);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(screenW, screenH, 0.025), getMaterial('#111827', 0.1, 0.3));
  screen.position.set(0, 0.3, 0);
  screen.castShadow = true;
  group.add(screen);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW - 0.02, screenH - 0.02),
    new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.1 })
  );
  face.position.set(0, 0.3, 0.014);
  group.add(face);
};

export const buildLaptopStand: ModelBuilder = ({ group, darkMetal, chromeMetal }) => {
  // Aluminum riser
  const riser = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.28), chromeMetal);
  riser.rotation.x = -0.2;
  riser.position.set(0, 0.08, 0);
  group.add(riser);

  // Laptop keyboard & screen
  const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.01), darkMetal);
  laptopScreen.position.set(0, 0.24, -0.12);
  laptopScreen.rotation.x = -0.15;
  group.add(laptopScreen);
};

export const buildScreenbar: ModelBuilder = ({ group, darkMetal }) => {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8), darkMetal);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.64, 0);
  group.add(bar);

  // Warm glow emitter
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.01, 0.02), getMaterial('#fef08a', 0.1, 0.0));
  glow.position.set(0, 0.63, 0.01);
  group.add(glow);
};
