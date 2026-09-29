import type * as THREE from 'three';
import type { SimsProduct } from '../../../../data/simsCatalog';

/** Everything a procedural furniture builder needs; builders add meshes to `group`. */
export interface BuildContext {
  group: THREE.Group;
  product: SimsProduct;
  /** Active color (variant override or product default). */
  color: string;
  primaryMat: THREE.MeshStandardMaterial;
  darkMetal: THREE.MeshStandardMaterial;
  chromeMetal: THREE.MeshStandardMaterial;
}

export type ModelBuilder = (ctx: BuildContext) => void;
