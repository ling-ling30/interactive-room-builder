import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { SimsProduct } from '../../../data/simsCatalog';
import { getModelBlobUrl, getCompanionFileUrl } from '../../../utils/modelStorage';
import { applyDimensionsToGltfModel } from './gltfDimensions';

// In-memory cache for raw, unscaled parsed GLTF scenes (Group)
const rawGltfSceneCache = new Map<string, THREE.Group>();
const rawGltfLoadingPromises = new Map<string, Promise<THREE.Group>>();

/**
 * Retrieve a raw parsed GLTF scene if already cached (for zero-latency synchronous rendering)
 */
export function getCachedRawScene(url: string): THREE.Group | null {
  let resolved = url;
  if (!resolved.startsWith('blob:') && !resolved.startsWith('data:') && !resolved.startsWith('idb://')) {
    resolved = encodeURI(resolved);
  }
  return rawGltfSceneCache.get(resolved) || rawGltfSceneCache.get(url) || null;
}

/**
 * Fetch and parse a raw GLTF/GLB file into an unscaled THREE.Group
 */
async function loadRawGltfScene(url: string, productId: string): Promise<THREE.Group> {
  let resolvedUrl = url;

  if (url.startsWith('idb://')) {
    const liveBlob = await getModelBlobUrl(productId);
    if (liveBlob) resolvedUrl = liveBlob;
  } else if (!resolvedUrl.startsWith('blob:') && !resolvedUrl.startsWith('data:')) {
    resolvedUrl = encodeURI(resolvedUrl);
  }

  if (rawGltfSceneCache.has(resolvedUrl)) {
    return rawGltfSceneCache.get(resolvedUrl)!;
  }
  if (rawGltfLoadingPromises.has(resolvedUrl)) {
    return rawGltfLoadingPromises.get(resolvedUrl)!;
  }

  const promise = (async () => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((requestUrl) => {
      const filename = requestUrl.split('/').pop()?.split('#')[0].split('?')[0] || requestUrl;
      const compUrl = getCompanionFileUrl(productId, filename);
      if (compUrl) return compUrl;
      return requestUrl;
    });

    const loader = new GLTFLoader(manager);
    const gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.load(resolvedUrl, resolve, undefined, reject);
    });

    const scene = gltf.scene;

    // Ensure double-sided materials, shadows, and correct color space
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.side = THREE.DoubleSide;
              m.needsUpdate = true;
            });
          } else {
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      }
    });

    rawGltfSceneCache.set(resolvedUrl, scene);
    rawGltfSceneCache.set(url, scene);
    return scene;
  })();

  rawGltfLoadingPromises.set(resolvedUrl, promise);
  try {
    return await promise;
  } finally {
    rawGltfLoadingPromises.delete(resolvedUrl);
  }
}

/**
 * Load and normalize an uploaded GLTF/GLB model with live true-to-life dimensions
 */
export async function loadCustomGltfModel(url: string, product: SimsProduct): Promise<THREE.Group> {
  const rawScene = await loadRawGltfScene(url, product.id);
  const model = rawScene.clone(true);
  return applyDimensionsToGltfModel(model, product);
}
