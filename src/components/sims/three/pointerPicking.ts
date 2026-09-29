import * as THREE from 'three';

/** Client coordinates -> normalized device coordinates inside `el`. */
export function clientToNdc(clientX: number, clientY: number, el: HTMLElement): THREE.Vector2 {
  const rect = el.getBoundingClientRect();
  return new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1
  );
}

/** Walks up the parent chain until a registered furniture group is found. */
export function findFurnitureInstanceId(
  obj: THREE.Object3D | null,
  itemMeshes: Map<string, THREE.Group>
): string | null {
  let cur = obj;
  while (cur && !itemMeshes.has(cur.name)) {
    cur = cur.parent;
  }
  return cur && itemMeshes.has(cur.name) ? cur.name : null;
}

/** Raycasts against all placed furniture and returns the closest hit instance id. */
export function pickFurnitureAt(
  raycaster: THREE.Raycaster,
  camera: THREE.Camera,
  mountEl: HTMLElement,
  clientX: number,
  clientY: number,
  itemMeshes: Map<string, THREE.Group>
): string | null {
  raycaster.setFromCamera(clientToNdc(clientX, clientY, mountEl), camera);
  const hits = raycaster.intersectObjects(Array.from(itemMeshes.values()), true);
  if (hits.length === 0) return null;
  return findFurnitureInstanceId(hits[0].object, itemMeshes);
}
