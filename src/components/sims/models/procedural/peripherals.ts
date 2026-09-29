import * as THREE from 'three';
import { getMaterial } from '../materials';
import type { ModelBuilder } from './types';

/** Shared by 'mechanical_keyboard' and 'gaming_keyboard' (RGB variant). */
export const buildKeyboard: ModelBuilder = ({ group, product }) => {
  const isRGB = product.modelType === 'gaming_keyboard';
  const width = product.actualDimensions?.widthM ?? 0.38;
  const depth = product.actualDimensions?.depthM ?? 0.14;
  const height = product.actualDimensions?.heightM ?? 0.035;

  // CNC aluminum base chassis
  const baseMat = getMaterial('#1e293b', 0.4, 0.6);
  const base = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.6, depth), baseMat);
  base.position.y = (height * 0.6) / 2;
  base.castShadow = true;
  group.add(base);

  // Keycap matrix
  const keycapMat = isRGB
    ? new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, emissive: 0x06b6d4, emissiveIntensity: 0.25 })
    : getMaterial('#475569', 0.6, 0.1);
  const keyBed = new THREE.Mesh(new THREE.BoxGeometry(width - 0.02, height * 0.45, depth - 0.02), keycapMat);
  keyBed.position.y = height * 0.7;
  keyBed.castShadow = true;
  group.add(keyBed);

  // Accent Spacebar
  const spaceMat = isRGB
    ? new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, emissive: 0x10b981, emissiveIntensity: 0.4 })
    : getMaterial('#f59e0b', 0.5, 0.1);
  const spacebar = new THREE.Mesh(new THREE.BoxGeometry(width * 0.28, height * 0.5, 0.02), spaceMat);
  spacebar.position.set(0, height * 0.72, depth / 2 - 0.03);
  group.add(spacebar);
};

export const buildComputerMouse: ModelBuilder = ({ group, product }) => {
  const length = product.actualDimensions?.depthM ?? 0.115;
  const width = product.actualDimensions?.widthM ?? 0.07;
  const height = product.actualDimensions?.heightM ?? 0.04;

  // Ergonomic contoured mouse body
  const mouseMat = getMaterial('#1e293b', 0.3, 0.2);
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.8, length), mouseMat);
  body.position.y = (height * 0.8) / 2;
  body.castShadow = true;
  group.add(body);

  // Scroll wheel
  const wheelMat = getMaterial('#94a3b8', 0.2, 0.8);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 12), wheelMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, height * 0.7, -length * 0.2);
  group.add(wheel);
};

export const buildDeskMat: ModelBuilder = ({ group, product }) => {
  const width = product.actualDimensions?.widthM ?? 0.85;
  const depth = product.actualDimensions?.depthM ?? 0.38;
  const matMat = getMaterial(product.color || '#334155', 0.85, 0.05);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(width, 0.006, depth), matMat);
  pad.position.y = 0.003;
  pad.receiveShadow = true;
  group.add(pad);
};

export const buildDeskOrganizer: ModelBuilder = ({ group, product }) => {
  const width = product.actualDimensions?.widthM ?? 0.28;
  const depth = product.actualDimensions?.depthM ?? 0.12;
  const woodMat = getMaterial('#5c3a21', 0.6, 0.1);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(width, 0.025, depth), woodMat);
  tray.position.y = 0.0125;
  tray.castShadow = true;
  group.add(tray);

  // Brass Pen
  const brassMat = getMaterial('#f59e0b', 0.2, 0.9);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, width * 0.65, 8), brassMat);
  pen.rotation.z = Math.PI / 2;
  pen.position.set(0, 0.026, 0);
  group.add(pen);
};

export const buildHeadphoneStand: ModelBuilder = ({ group }) => {
  // Aluminum round base
  const standMat = getMaterial('#1e293b', 0.3, 0.7);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 16), standMat);
  base.position.y = 0.0075;
  group.add(base);

  // Vertical stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 10), standMat);
  stem.position.y = 0.13;
  group.add(stem);

  // Top cradle
  const cradle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.04), standMat);
  cradle.position.y = 0.255;
  group.add(cradle);

  // Headphones resting on cradle
  const phoneMat = getMaterial('#0f172a', 0.4, 0.3);
  [-0.05, 0.05].forEach(x => {
    const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 14), phoneMat);
    earcup.rotation.z = Math.PI / 2;
    earcup.position.set(x, 0.21, 0);
    group.add(earcup);
  });
};

export const buildCoffeeMug: ModelBuilder = ({ group }) => {
  const mugMat = getMaterial('#f8fafc', 0.2, 0.1);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 10), mugMat);
  mug.position.y = 0.04;
  group.add(mug);

  // Cork coaster
  const coaster = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 12), getMaterial('#b45309', 0.8, 0));
  coaster.position.y = 0.005;
  group.add(coaster);
};
