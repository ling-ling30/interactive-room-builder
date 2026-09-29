import * as THREE from 'three';
import { getMaterial } from '../materials';
import type { ModelBuilder } from './types';

export const buildDeskLamp: ModelBuilder = ({ group, primaryMat, darkMetal }) => {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), darkMetal);
  base.position.y = 0.01;
  group.add(base);

  // 2-arm cantilever
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8), primaryMat);
  arm1.position.set(0, 0.15, 0);
  arm1.rotation.z = 0.2;
  group.add(arm1);

  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8), primaryMat);
  arm2.position.set(0.06, 0.34, 0);
  arm2.rotation.z = -0.35;
  group.add(arm2);

  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 12), primaryMat);
  shade.position.set(0.12, 0.42, 0);
  shade.rotation.z = -1.2;
  group.add(shade);
};

export const buildFloorLamp: ModelBuilder = ({ group, primaryMat, darkMetal }) => {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), darkMetal);
  base.position.y = 0.015;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 12), darkMetal);
  pole.position.set(0, 0.9, 0);
  group.add(pole);

  // Sweeping arch
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), primaryMat);
  shade.position.set(0.28, 1.75, 0);
  group.add(shade);
};

export const buildMonsteraPlant: ModelBuilder = ({ group }) => {
  // Terracotta pot
  const potMat = getMaterial('#c2410c', 0.6, 0.05);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.32, 14), potMat);
  pot.position.y = 0.16;
  pot.castShadow = true;
  group.add(pot);

  // Soil
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 14), getMaterial('#291e14', 0.9, 0));
  soil.position.y = 0.31;
  group.add(soil);

  // Tropical Monstera Leaves
  const leafMat = getMaterial('#059669', 0.3, 0.05);
  const angles = [0, 1.2, 2.4, 3.6, 4.8];
  angles.forEach((ang, idx) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35 + idx * 0.05, 6), leafMat);
    stem.position.set(Math.sin(ang) * 0.06, 0.45, Math.cos(ang) * 0.06);
    stem.rotation.z = Math.sin(ang) * 0.35;
    stem.rotation.x = Math.cos(ang) * 0.35;
    group.add(stem);

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.01, 0.28), leafMat);
    leaf.position.set(Math.sin(ang) * 0.2, 0.65 + idx * 0.04, Math.cos(ang) * 0.2);
    leaf.rotation.y = ang;
    leaf.rotation.x = 0.2;
    group.add(leaf);
  });
};

export const buildJuteRug: ModelBuilder = ({ group, color }) => {
  // Flat circular woven rug
  const rugGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.02, 24);
  const rugMat = getMaterial(color, 0.8, 0.0);
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.y = 0.01;
  rug.receiveShadow = true;
  group.add(rug);
};

export const buildBookshelf: ModelBuilder = ({ group, color }) => {
  const shelfMat = getMaterial(color, 0.5, 0.1);
  // Frame: 2 side uprights + 3 horizontal boards
  const width = 1.6;
  const height = 1.3;
  const depth = 0.45;

  [-width / 2 + 0.03, width / 2 - 0.03].forEach(x => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, depth), shelfMat);
    side.position.set(x, height / 2, 0);
    side.castShadow = true;
    group.add(side);
  });

  [0.05, 0.45, 0.85, 1.25].forEach(y => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, depth), shelfMat);
    board.position.set(0, y, 0);
    board.castShadow = true;
    group.add(board);
  });
};

export const buildStandingBoard: ModelBuilder = ({ group }) => {
  // Whiteboard with stand and wheels
  const boardWidth = 1.4;
  const boardHeight = 1.0;
  const standMat = getMaterial('#334155', 0.4, 0.6);
  const whiteMat = getMaterial('#ffffff', 0.1, 0.0);
  const frameMat = getMaterial('#94a3b8', 0.3, 0.8);

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(boardWidth + 0.06, boardHeight + 0.06, 0.04), frameMat);
  frame.position.set(0, 1.25, 0);
  frame.castShadow = true;
  group.add(frame);

  // Whiteboard face
  const face = new THREE.Mesh(new THREE.BoxGeometry(boardWidth, boardHeight, 0.05), whiteMat);
  face.position.set(0, 1.25, 0);
  group.add(face);

  // Marker tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(boardWidth * 0.7, 0.03, 0.1), standMat);
  tray.position.set(0, 1.25 - boardHeight / 2 - 0.02, 0.03);
  group.add(tray);

  // Left & Right legs
  [-boardWidth / 2 + 0.15, boardWidth / 2 - 0.15].forEach(x => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3), standMat);
    leg.position.set(x, 0.65, 0);
    leg.castShadow = true;
    group.add(leg);

    // Base foot with caster wheels
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.5), standMat);
    foot.position.set(x, 0.04, 0);
    foot.castShadow = true;
    group.add(foot);
  });
};

/** Fallback clean bounding block for unknown model types. */
export const buildFallbackBlock: ModelBuilder = ({ group, primaryMat }) => {
  const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), primaryMat);
  fallback.position.y = 0.4;
  group.add(fallback);
};
