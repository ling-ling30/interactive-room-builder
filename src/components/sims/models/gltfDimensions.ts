import * as THREE from 'three';
import type { SimsProduct } from '../../../data/simsCatalog';

interface RawSize {
  x: number;
  y: number;
  z: number;
}

/**
 * Category-aware scaling that fits a raw model of `rawSize` to the product's
 * real-world dimensions.
 *
 * - **Desks / tables**: exact per-axis scale so tabletop hits the right W×D×H.
 * - **Chairs / stools**: proportional scale anchored to **height** so seat
 *   height and armrests land at ergonomic positions without distortion.
 * - **Monitors**: proportional scale anchored to **width** so 16:9 / 21:9
 *   aspect ratios are preserved.
 * - **Accessories / lamps / everything else with `fitMode === 'exact'`**:
 *   independent per-axis. Otherwise proportional anchored to height.
 */
function computeTargetScale(product: SimsProduct, rawSize: RawSize) {
  const targetW = product.actualDimensions?.widthM ?? product.footprint?.width ?? 1.2;
  const targetD = product.actualDimensions?.depthM ?? product.footprint?.depth ?? 0.6;
  const targetH = product.actualDimensions?.heightM ?? (product.heightCm ? product.heightCm / 100 : 0.74);
  const scaleMult = product.scaleMultiplier ?? 1.0;
  const fitMode = product.fitMode; // undefined → auto-detect from category

  let scaleX = (targetW / rawSize.x) * scaleMult;
  let scaleY = (targetH / rawSize.y) * scaleMult;
  let scaleZ = (targetD / rawSize.z) * scaleMult;

  // Explicit fitMode overrides auto-detection
  if (fitMode === 'exact') {
    return { scaleX, scaleY, scaleZ };
  }
  if (fitMode === 'proportional') {
    // Legacy proportional: uniform from height (was Math.min — the root cause
    // of chairs being crushed). Anchoring to height is the safe default.
    const uniform = scaleY;
    return { scaleX: uniform, scaleY: uniform, scaleZ: uniform };
  }

  // Auto-detect from category / modelType
  const cat = product.category ?? '';
  const mt = product.modelType ?? '';

  const isDesk = cat === 'desks' || mt.includes('desk') || mt.includes('table');
  const isChair = cat === 'chairs' || mt.includes('chair') || mt.includes('stool');
  const isMonitor = cat === 'monitors' || mt.includes('monitor') || mt.includes('laptop');

  if (isDesk) {
    // Desks: exact per-axis so tabletop dimensions are precise
    return { scaleX, scaleY, scaleZ };
  }

  if (isChair) {
    // Chairs: proportional anchored to HEIGHT.
    // Height is the ergonomic anchor (seat height ≈ 0.48m, armrest ≈ 0.65m).
    // The bounding-box width/depth includes the 5-star wheeled base which is
    // always wider than the cataloged seat-cushion width, so scaling by width
    // would crush the chair.
    const uniform = scaleY;
    return { scaleX: uniform, scaleY: uniform, scaleZ: uniform };
  }

  if (isMonitor) {
    // Monitors: proportional anchored to WIDTH to preserve screen aspect ratio
    const uniform = scaleX;
    return { scaleX: uniform, scaleY: uniform, scaleZ: uniform };
  }

  // Default for accessories, lamps, plants, etc.: exact per-axis
  return { scaleX, scaleY, scaleZ };
}

/**
 * Apply true-to-life physical dimensions (Width, Depth, Height, Scale Factor) to a GLTF model.
 * The model is wrapped in a normalized root container:
 * - Centered at X=0, Z=0
 * - Base bottom resting flat on floor Y=0
 * - Scaled on X, Y, Z to match product.actualDimensions in world meters.
 */
export function applyDimensionsToGltfModel(rawModel: THREE.Group, product: SimsProduct): THREE.Group {
  // Reset previous transforms to measure raw unscaled geometry
  rawModel.position.set(0, 0, 0);
  rawModel.rotation.set(0, 0, 0);
  rawModel.scale.set(1, 1, 1);
  rawModel.updateMatrixWorld(true);

  // Measure raw geometry bounding box
  const rawBox = new THREE.Box3().setFromObject(rawModel);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);

  // Safeguard against zero/infinite size
  if (rawSize.x < 0.0001) rawSize.x = 1.0;
  if (rawSize.y < 0.0001) rawSize.y = 1.0;
  if (rawSize.z < 0.0001) rawSize.z = 1.0;

  const isMouse = product.modelType?.includes('mouse') || product.id?.includes('mouse');
  // Auto-orient mouse if model was authored with length along X
  if (isMouse && rawSize.x > rawSize.z * 1.25) {
    rawModel.rotation.y = Math.PI / 2;
    rawModel.updateMatrixWorld(true);
    rawBox.setFromObject(rawModel);
    rawBox.getSize(rawSize);
  }

  const rawCenter = new THREE.Vector3();
  rawBox.getCenter(rawCenter);

  const { scaleX, scaleY, scaleZ } = computeTargetScale(product, rawSize);

  // Create clean outer container
  const container = new THREE.Group();
  container.name = `__scaled_model_${product.id}__`;

  // Center raw model inside container so base is at Y=0 and center is at X=0, Z=0
  rawModel.position.set(-rawCenter.x, -rawBox.min.y, -rawCenter.z);
  container.add(rawModel);

  // Apply real-world physical dimensions
  container.scale.set(scaleX, scaleY, scaleZ);
  container.updateMatrixWorld(true);

  // Store metadata for instant 0ms dynamic scaling without re-instantiation
  container.userData = {
    isScaledContainer: true,
    rawModel,
    rawSize: { x: rawSize.x, y: rawSize.y, z: rawSize.z },
    rawCenter: { x: rawCenter.x, y: rawCenter.y, z: rawCenter.z },
    rawMinY: rawBox.min.y,
  };

  return container;
}

/**
 * Update the dimensions of an already-loaded furniture mesh instantly (60fps)
 */
export function updateMeshDimensions(group: THREE.Group, product: SimsProduct): boolean {
  if (!group) return false;

  let container: THREE.Group | null = null;
  if (group.userData?.isScaledContainer) {
    container = group;
  } else {
    group.traverse((c) => {
      if (!container && c instanceof THREE.Group && c.userData?.isScaledContainer) {
        container = c;
      }
    });
  }

  if (!container || !container.userData?.rawSize) {
    return false;
  }

  const { scaleX, scaleY, scaleZ } = computeTargetScale(product, container.userData.rawSize);
  container.scale.set(scaleX, scaleY, scaleZ);
  container.updateMatrixWorld(true);
  return true;
}
