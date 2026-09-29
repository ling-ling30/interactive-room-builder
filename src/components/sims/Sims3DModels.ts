import * as THREE from 'three';
import type { SimsProduct } from '../../data/simsCatalog';
import { createProceduralFurnitureMesh } from './models/procedural';
import { getCachedRawScene, loadCustomGltfModel } from './models/gltfLoader';
import { applyDimensionsToGltfModel } from './models/gltfDimensions';

export { applyDimensionsToGltfModel, updateMeshDimensions } from './models/gltfDimensions';
export { loadCustomGltfModel } from './models/gltfLoader';

/**
 * Build a furniture mesh: an uploaded .glb / .gltf when `product.modelUrl` is set
 * (procedural placeholder until it loads), otherwise a procedural Sims-style model.
 */
export function createFurnitureMesh(product: SimsProduct, activeColor?: string, onLoaded?: () => void): THREE.Group {
  // If product has a custom uploaded 3D model (.glb / .gltf)
  if (product.modelUrl) {
    const group = new THREE.Group();
    group.name = product.id;

    // Check if raw scene is already cached for zero-latency synchronous rendering
    const cachedScene = getCachedRawScene(product.modelUrl);
    if (cachedScene) {
      const model = applyDimensionsToGltfModel(cachedScene.clone(true), product);
      group.add(model);
      if (onLoaded) {
        setTimeout(onLoaded, 0);
      }
      return group;
    }

    // Show temporary procedural placeholder while model loads in background
    const placeholder = createProceduralFurnitureMesh(product, activeColor);
    placeholder.name = '__placeholder__';
    group.add(placeholder);

    loadCustomGltfModel(product.modelUrl, product)
      .then((loadedModel) => {
        // Swap out placeholder cleanly
        while (group.children.length > 0) {
          group.remove(group.children[0]);
        }
        group.add(loadedModel);
        if (onLoaded) {
          onLoaded();
        }
      })
      .catch((err) => {
        console.warn(`Failed to load uploaded GLTF model for "${product.name}", using procedural:`, err);
        if (onLoaded) {
          onLoaded();
        }
      });

    return group;
  }

  const procGroup = createProceduralFurnitureMesh(product, activeColor);
  if (onLoaded) {
    setTimeout(onLoaded, 0);
  }
  return procGroup;
}
