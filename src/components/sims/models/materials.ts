import * as THREE from 'three';

// Shared materials cache for high performance
const materialCache: Record<string, THREE.Material> = {};

/** Returns a fresh clone of a cached standard material for the given color / roughness / metalness. */
export function getMaterial(colorHex: string, roughness = 0.4, metalness = 0.1): THREE.MeshStandardMaterial {
  const key = `${colorHex}-${roughness}-${metalness}`;
  if (!materialCache[key]) {
    materialCache[key] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness,
      metalness,
    });
  }
  return (materialCache[key] as THREE.MeshStandardMaterial).clone();
}
