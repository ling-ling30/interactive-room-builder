import * as THREE from 'three';
import { getMaterial } from '../materials';
import type { ModelBuilder } from './types';

export const buildStandingDesk: ModelBuilder = ({ group, product, primaryMat, darkMetal }) => {
  // Dimensions: accurate length and depth from scraped Monis specs
  const width = product.actualDimensions?.widthM ?? 1.4;
  const depth = product.actualDimensions?.depthM ?? 0.7;
  const height = product.actualDimensions?.heightM ?? 0.74;

  // Tabletop: positioned so top surface is exactly at height (0.74m)
  const topThick = 0.04;
  const topGeo = new THREE.BoxGeometry(width, topThick, depth);
  const topMesh = new THREE.Mesh(topGeo, primaryMat);
  topMesh.position.y = height - topThick / 2;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  // Smart LED control pad on right front edge
  const padGeo = new THREE.BoxGeometry(0.12, 0.015, 0.06);
  const padMat = getMaterial('#09090b', 0.2, 0.5);
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.set(width / 2 - 0.12, height - 0.02, depth / 2 - 0.01);
  group.add(padMesh);

  // Telescoping Motorized Legs (Left and Right)
  const legInset = Math.min(0.2, width * 0.16);
  [-width / 2 + legInset, width / 2 - legInset].forEach(x => {
    // Upper sleeve
    const legUpper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.1), darkMetal);
    legUpper.position.set(x, height - 0.22, 0);
    legUpper.castShadow = true;
    group.add(legUpper);

    // Lower column
    const legLower = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.38, 0.09), darkMetal);
    legLower.position.set(x, 0.19, 0);
    legLower.castShadow = true;
    group.add(legLower);

    // Floor foot bar
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, depth * 0.8), darkMetal);
    foot.position.set(x, 0.015, 0);
    foot.castShadow = true;
    foot.receiveShadow = true;
    group.add(foot);
  });
};

export const buildCompactDesk: ModelBuilder = ({ group, product, primaryMat }) => {
  const width = product.actualDimensions?.widthM ?? 0.9;
  const depth = product.actualDimensions?.depthM ?? 0.6;
  const height = product.actualDimensions?.heightM ?? 0.72;

  const topThick = 0.03;
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, topThick, depth), primaryMat);
  top.position.y = height - topThick / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // 4 tapered legs
  const legGeo = new THREE.CylinderGeometry(0.025, 0.018, height, 8);
  const legMat = getMaterial('#e2e8f0', 0.3, 0.2);
  const xInset = width * 0.12;
  const zInset = depth * 0.15;
  [
    [-width / 2 + xInset, -depth / 2 + zInset],
    [width / 2 - xInset, -depth / 2 + zInset],
    [-width / 2 + xInset, depth / 2 - zInset],
    [width / 2 - xInset, depth / 2 - zInset],
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, height / 2, z);
    leg.castShadow = true;
    group.add(leg);
  });
};

export const buildExecutiveDesk: ModelBuilder = ({ group, product, primaryMat }) => {
  const width = product.actualDimensions?.widthM ?? 1.6;
  const depth = product.actualDimensions?.depthM ?? 0.8;
  const height = product.actualDimensions?.heightM ?? 0.76;

  const topThick = 0.05;
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, topThick, depth), primaryMat);
  top.position.y = height - topThick / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Pedestal drawer cabinet on right
  const cabMat = getMaterial('#1e232d', 0.5, 0.1);
  const cabW = Math.min(0.45, width * 0.28);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(cabW, height - 0.04, depth * 0.85), cabMat);
  cab.position.set(width / 2 - cabW / 2 - 0.04, (height - 0.04) / 2, 0);
  cab.castShadow = true;
  group.add(cab);

  // Left solid panel leg
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, height - 0.04, depth * 0.85), primaryMat);
  leftLeg.position.set(-width / 2 + 0.06, (height - 0.04) / 2, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
};
