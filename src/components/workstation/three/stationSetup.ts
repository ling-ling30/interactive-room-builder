import * as THREE from 'three';

/** Adds studio 3-point lighting, floor, pedestal grid and contact-shadow disc. */
export function addStudioEnvironment(scene: THREE.Scene) {
  scene.background = new THREE.Color(0x0c0f17);
  scene.fog = new THREE.Fog(0x0c0f17, 3.5, 9);

  // Studio 3-Point Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));

  const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
  keyLight.position.set(2.5, 3.8, 2.2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 10;
  keyLight.shadow.camera.left = -1.8;
  keyLight.shadow.camera.right = 1.8;
  keyLight.shadow.camera.top = 1.8;
  keyLight.shadow.camera.bottom = -1.8;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
  fillLight.position.set(-2.5, 2.2, -1.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
  rimLight.position.set(0, 2.5, -2.8);
  scene.add(rimLight);

  // Floor Platform
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x111520, roughness: 0.85, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor Pedestal Grid Ring
  const gridHelper = new THREE.GridHelper(4.5, 18, 0x1e2638, 0x151a26);
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  // Ambient Contact Shadow Disc underneath the desk
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 1.6),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
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
  ergoGroup: THREE.Group;
  deskSpot: THREE.SpotLight;
}

/** Creates the groups the station geometry is rebuilt into (moving desk top, legs, ergonomics guide) and the desk spotlight. */
export function createStationGroups(scene: THREE.Scene): StationGroups {
  const movingGroup = new THREE.Group();
  scene.add(movingGroup);

  const legsGroup = new THREE.Group();
  scene.add(legsGroup);

  const monitorsGroup = new THREE.Group();
  movingGroup.add(monitorsGroup);

  const accessoriesGroup = new THREE.Group();
  movingGroup.add(accessoriesGroup);

  const ergoGroup = new THREE.Group();
  scene.add(ergoGroup);

  // Downward Desk SpotLight (Screenbar light cone)
  const deskSpot = new THREE.SpotLight(0xfff1dc, 2.5, 2.5, Math.PI / 4, 0.4, 1);
  deskSpot.position.set(0, 0.5, 0.1);
  deskSpot.target.position.set(0, -0.2, 0);
  movingGroup.add(deskSpot);
  movingGroup.add(deskSpot.target);

  return { movingGroup, legsGroup, monitorsGroup, accessoriesGroup, ergoGroup, deskSpot };
}

/** Removes every child of `group` (geometry/materials are left to GC like before). */
export function clearGroup(group: THREE.Group) {
  while (group.children.length > 0) group.remove(group.children[0]);
}
