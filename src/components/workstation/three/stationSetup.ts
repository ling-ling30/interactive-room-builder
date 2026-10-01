import * as THREE from 'three';

/** Adds studio lighting, warm architectural floor, pedestal grid and contact-shadow disc. */
export function addStudioEnvironment(scene: THREE.Scene) {
  // Warm Bali linen/cream architectural backdrop matching the landing page and 3D studio
  scene.background = new THREE.Color(0xf0ece1);
  scene.fog = new THREE.Fog(0xf0ece1, 5, 14);

  // Warm Studio Daylight 3-Point Lighting
  scene.add(new THREE.AmbientLight(0xfffaf2, 1.4));

  // Warm Sun Key Light
  const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
  keyLight.position.set(2.8, 4.2, 2.4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0003;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 12;
  keyLight.shadow.camera.left = -2.2;
  keyLight.shadow.camera.right = 2.2;
  keyLight.shadow.camera.top = 2.2;
  keyLight.shadow.camera.bottom = -2.2;
  scene.add(keyLight);

  // Soft Warm Daylight Fill
  const fillLight = new THREE.DirectionalLight(0xfffaed, 0.85);
  fillLight.position.set(-2.8, 2.5, -1.8);
  scene.add(fillLight);

  // Warm Sun Rim / Edge Light
  const rimLight = new THREE.DirectionalLight(0xfff5ea, 0.55);
  rimLight.position.set(0, 3.0, -3.0);
  scene.add(rimLight);

  // Floor Platform (warm birch/light oak material matching the villa studio)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({ color: 0xede8dc, roughness: 0.65, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor Pedestal Grid Ring (subtle warm sand architectural lines)
  const gridHelper = new THREE.GridHelper(5, 20, 0xd8d1c2, 0xe4ded3);
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  // Ambient Contact Shadow Disc underneath the desk (soft warm contact shadow)
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.8),
    new THREE.MeshBasicMaterial({ color: 0x4a4036, transparent: true, opacity: 0.22 })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.set(0, 0.003, 0);
  scene.add(shadowDisc);
}

export interface StationGroups {
  movingGroup: THREE.Group;
  legsGroup: THREE.Group;
  monitorsGroup: THREE.Group;
  accessoriesGroup: THREE.Group;
  chairGroup: THREE.Group;
  ergoGroup: THREE.Group;
  deskSpot: THREE.SpotLight;
}

/** Creates the groups the station geometry is rebuilt into (moving desk top, legs, ergonomics guide, chair) and the desk spotlight. */
export function createStationGroups(scene: THREE.Scene): StationGroups {
  const movingGroup = new THREE.Group();
  scene.add(movingGroup);

  const legsGroup = new THREE.Group();
  scene.add(legsGroup);

  const monitorsGroup = new THREE.Group();
  movingGroup.add(monitorsGroup);

  const accessoriesGroup = new THREE.Group();
  movingGroup.add(accessoriesGroup);

  const chairGroup = new THREE.Group();
  chairGroup.name = 'chairGroup';
  scene.add(chairGroup);

  const ergoGroup = new THREE.Group();
  scene.add(ergoGroup);

  // Downward Desk SpotLight (Screenbar light cone)
  const deskSpot = new THREE.SpotLight(0xfff1dc, 2.5, 2.5, Math.PI / 4, 0.4, 1);
  deskSpot.position.set(0, 0.5, 0.1);
  deskSpot.target.position.set(0, -0.2, 0);
  movingGroup.add(deskSpot);
  movingGroup.add(deskSpot.target);

  return { movingGroup, legsGroup, monitorsGroup, accessoriesGroup, chairGroup, ergoGroup, deskSpot };
}

/** Removes every child of `group` (geometry/materials are left to GC like before). */
export function clearGroup(group: THREE.Group) {
  while (group.children.length > 0) group.remove(group.children[0]);
}
