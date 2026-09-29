import * as THREE from 'three';
import { getMaterial } from '../materials';
import type { ModelBuilder } from './types';

export const buildAeronChair: ModelBuilder = ({ group, primaryMat, darkMetal, chromeMetal }) => {
  // 5-Star Caster Base
  const starGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.35), darkMetal);
    arm.position.set(Math.sin(angle) * 0.18, 0.05, Math.cos(angle) * 0.18);
    arm.rotation.y = angle;
    starGroup.add(arm);

    // Wheel
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), darkMetal);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(Math.sin(angle) * 0.35, 0.03, Math.cos(angle) * 0.35);
    starGroup.add(wheel);
  }
  group.add(starGroup);

  // Cylinder stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12), chromeMetal);
  stem.position.y = 0.22;
  stem.castShadow = true;
  group.add(stem);

  // Seat Pan
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.52), primaryMat);
  seat.position.set(0, 0.42, 0);
  seat.castShadow = true;
  group.add(seat);

  // Mesh Backrest (curved upwards)
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), primaryMat);
  back.position.set(0, 0.72, -0.24);
  back.rotation.x = 0.08;
  back.castShadow = true;
  group.add(back);

  // PostureFit lumbar pad
  const lumbar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.04), getMaterial('#10b981', 0.3, 0.2));
  lumbar.position.set(0, 0.6, -0.26);
  group.add(lumbar);

  // 4D Armrests
  [-0.3, 0.3].forEach(x => {
    const armPillar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), darkMetal);
    armPillar.position.set(x, 0.5, -0.05);
    group.add(armPillar);

    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.24), darkMetal);
    armPad.position.set(x, 0.62, -0.05);
    armPad.castShadow = true;
    group.add(armPad);
  });
};

export const buildHighbackChair: ModelBuilder = ({ group, primaryMat, darkMetal }) => {
  // Base & stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 12), darkMetal);
  stem.position.y = 0.2;
  group.add(stem);

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.54), primaryMat);
  seat.position.set(0, 0.43, 0);
  seat.castShadow = true;
  group.add(seat);

  // High back
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.06), primaryMat);
  back.position.set(0, 0.78, -0.24);
  back.castShadow = true;
  group.add(back);

  // Ergonomic headrest
  const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.08), getMaterial('#334155', 0.4, 0.1));
  headrest.position.set(0, 1.15, -0.26);
  headrest.castShadow = true;
  group.add(headrest);
};

export const buildActiveStool: ModelBuilder = ({ group, primaryMat, darkMetal, chromeMetal }) => {
  // Wobble base
  const base = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8), darkMetal);
  base.scale.set(1, 0.25, 1);
  base.position.y = 0.06;
  group.add(base);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.55, 12), chromeMetal);
  stem.position.y = 0.35;
  group.add(stem);

  const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.12, 16), primaryMat);
  cushion.position.y = 0.65;
  cushion.castShadow = true;
  group.add(cushion);
};

export const buildLoungeChair: ModelBuilder = ({ group, primaryMat }) => {
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.8), primaryMat);
  seat.position.set(0, 0.26, 0);
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.16), primaryMat);
  back.position.set(0, 0.55, -0.35);
  back.rotation.x = 0.15;
  back.castShadow = true;
  group.add(back);

  // Wooden arms & legs
  const woodMat = getMaterial('#854d0e', 0.4, 0.1);
  [-0.48, 0.48].forEach(x => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.8), woodMat);
    arm.position.set(x, 0.45, 0);
    group.add(arm);
  });
};
