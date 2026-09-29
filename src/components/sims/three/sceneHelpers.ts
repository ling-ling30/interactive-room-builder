import * as THREE from 'three';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import type { SpaceParameters } from '../../../types/space';
import type { WalkObstacle } from '../hooks/useSimsCamera';
import type { MovingGroupState } from '../simsRoomTypes';
import { getEffectiveFootprint, gridToWorld, isSmallItem, type FootprintDimensions } from './spatialMath';

export const DEFAULT_SPACE: SpaceParameters = {
  width: 5,
  length: 5,
  floorStyle: 'wood',
  wallColor: '#f8f6f0',
  hasWindow: true,
  roomName: 'Bali Villa Studio',
};

/** Items that rest on desks rather than the floor. */
export function isSurfaceItem(product: SimsProduct): boolean {
  return product.layer === 'surface' || product.category === 'accessories' || isSmallItem(product);
}

export function getWallColorHex(space: SpaceParameters, isNightMode: boolean): number {
  return isNightMode ? 0x181e2b : parseInt((space.wallColor || '#f8f6f0').replace('#', '0x'));
}

const backgroundHex = (isNightMode: boolean) => (isNightMode ? 0x090c15 : 0xf0ece1);

function sunShadowExtent(maxDim: number) {
  return maxDim * 0.75 + 6;
}

/** Adds ambient, sun (shadow casting) and fill lights to the scene. */
export function addSceneLights(scene: THREE.Scene, maxDim: number, isNightMode: boolean) {
  const ambientLight = new THREE.AmbientLight(
    isNightMode ? 0x22324d : 0xfffaf2,
    isNightMode ? 1.0 : 1.8
  );
  ambientLight.name = 'ambient';
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(
    isNightMode ? 0x38bdf8 : 0xffedd5,
    isNightMode ? 0.9 : 1.6
  );
  sunLight.name = 'sunLight';
  sunLight.position.set(maxDim * 0.8 + 3, maxDim * 1.5 + 8, maxDim * 0.7 + 3);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = Math.max(60, maxDim * 4);
  const d = sunShadowExtent(maxDim);
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0002;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xfffaed, 0.8);
  fillLight.position.set(-maxDim * 0.8 - 3, maxDim * 1.2 + 5, -maxDim * 0.8 - 3);
  scene.add(fillLight);
}

export function applySceneBackground(scene: THREE.Scene, maxDim: number, isNightMode: boolean) {
  scene.background = new THREE.Color(backgroundHex(isNightMode));
  scene.fog = new THREE.Fog(backgroundHex(isNightMode), maxDim * 2.2, maxDim * 7);
}

/** Re-tints fog, background and lights when room size or day/night mode changes. */
export function updateSceneTheme(scene: THREE.Scene, maxDim: number, isNightMode: boolean) {
  if (scene.fog && scene.fog instanceof THREE.Fog) {
    scene.fog.color.setHex(backgroundHex(isNightMode));
    scene.fog.near = maxDim * 2.2;
    scene.fog.far = maxDim * 7;
  }
  scene.background = new THREE.Color(backgroundHex(isNightMode));

  const ambient = scene.getObjectByName('ambient') as THREE.AmbientLight | null;
  if (ambient) {
    ambient.color.setHex(isNightMode ? 0x22324d : 0xfffaf2);
    ambient.intensity = isNightMode ? 1.0 : 1.8;
  }
  const sun = scene.getObjectByName('sunLight') as THREE.DirectionalLight | null;
  if (sun) {
    sun.color.setHex(isNightMode ? 0x38bdf8 : 0xffedd5);
    sun.intensity = isNightMode ? 0.9 : 1.6;
    sun.position.set(maxDim * 0.8 + 3, maxDim * 1.5 + 8, maxDim * 0.7 + 3);
    const d = sunShadowExtent(maxDim);
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.camera.far = Math.max(60, maxDim * 4);
    sun.shadow.camera.updateProjectionMatrix();
  }
}

/** Disposes geometries only (grid / skirting use shared materials). */
export function disposeGeometries(root: THREE.Object3D) {
  root.traverse(c => {
    if (c instanceof THREE.Mesh || c instanceof THREE.LineSegments || c instanceof THREE.Line || c instanceof THREE.Points) {
      c.geometry.dispose();
    }
  });
}

/** Disposes geometries and materials of every mesh under `root`. */
export function disposeMeshes(root: THREE.Object3D) {
  root.traverse(c => {
    if (c instanceof THREE.Mesh) {
      c.geometry.dispose();
      if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
      else c.material.dispose();
    }
  });
}

export function createHoverIndicator(): THREE.Mesh {
  const hoverGeo = new THREE.PlaneGeometry(1, 1);
  const hoverMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const hoverIndicator = new THREE.Mesh(hoverGeo, hoverMat);
  hoverIndicator.rotation.x = -Math.PI / 2;
  hoverIndicator.position.y = 0.008;
  hoverIndicator.visible = false;
  return hoverIndicator;
}

/**
 * Positions the green footprint tile. For a multi-item group the tile covers the
 * group's bounding box, otherwise the single item's footprint.
 */
export function positionHoverIndicator(
  indicator: THREE.Mesh,
  opts: {
    gx: number;
    gz: number;
    footprint: FootprintDimensions;
    group: MovingGroupState | null;
    roomWidth: number;
    roomLength: number;
    y: number;
  }
) {
  const { gx, gz, footprint, group, roomWidth, roomLength, y } = opts;
  indicator.visible = true;
  if (group && group.items.length > 1) {
    const groupW = Math.max(0.5, group.maxDeltaX - group.minDeltaX);
    const groupD = Math.max(0.5, group.maxDeltaZ - group.minDeltaZ);
    const centerX = gx + group.minDeltaX + groupW / 2 - roomWidth / 2;
    const centerZ = gz + group.minDeltaZ + groupD / 2 - roomLength / 2;
    indicator.scale.set(groupW, groupD, 1);
    indicator.position.set(centerX, y, centerZ);
  } else {
    const worldPos = gridToWorld(gx, gz, footprint.width, footprint.depth, roomWidth, roomLength);
    indicator.scale.set(footprint.width, footprint.depth, 1);
    indicator.position.set(worldPos.x, y, worldPos.z);
  }
}

/** Floor furniture that blocks first-person walking (rugs / mats / surface items excluded). */
export function collectWalkObstacles(
  items: PlacedFurniture[],
  catalog: SimsProduct[],
  roomWidth: number,
  roomLength: number
): WalkObstacle[] {
  const obstacles: WalkObstacle[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const prod = catalog.find(p => p.id === item.productId);
    if (!prod) continue;
    if (prod.layer === 'surface' || prod.category === 'accessories') continue;

    // Exclude rugs and floor mats so the player can freely walk directly on them
    const isRugOrMat =
      prod.modelType === 'jute_rug' ||
      prod.category === 'rug' ||
      prod.id.includes('rug') ||
      prod.name.toLowerCase().includes('rug') ||
      prod.name.toLowerCase().includes('carpet') ||
      (prod.name.toLowerCase().includes('mat') && prod.layer === 'floor') ||
      (prod.actualDimensions?.heightM !== undefined && prod.actualDimensions.heightM <= 0.05);
    if (isRugOrMat) continue;

    const fp = getEffectiveFootprint(prod, item.rotation);
    const worldPos = gridToWorld(item.gridX, item.gridZ, fp.width, fp.depth, roomWidth, roomLength);
    obstacles.push({ x: worldPos.x, z: worldPos.z, width: fp.width, depth: fp.depth });
  }
  return obstacles;
}

/** Spins & bobs the plumbob, keeping it above the last selected furniture. */
export function animatePlumbob(
  plumbob: THREE.Group,
  baseYRef: { current: number },
  selectedIds: string[],
  itemMeshes: Map<string, THREE.Group>
) {
  plumbob.rotation.y += 0.035;
  if (selectedIds.length > 0) {
    const activeId = selectedIds[selectedIds.length - 1];
    const group = activeId ? itemMeshes.get(activeId) : undefined;
    if (group) {
      const b = new THREE.Box3().setFromObject(group);
      if (isFinite(b.max.y) && b.max.y > -900) {
        baseYRef.current = b.max.y + 0.16;
      }
    }
  }
  plumbob.position.y = baseYRef.current + Math.sin(Date.now() * 0.004) * 0.035;
}

/** Projects the selection's top-centre to screen space and moves the floating action pill there. */
export function trackSelectionBubble(
  bubbleEl: HTMLDivElement,
  camera: THREE.Camera,
  mountEl: HTMLElement,
  selectedIds: string[],
  itemMeshes: Map<string, THREE.Group>
) {
  if (selectedIds.length === 0) {
    bubbleEl.style.visibility = 'hidden';
    return;
  }

  const unionBox = new THREE.Box3();
  let count = 0;
  for (const id of selectedIds) {
    const group = itemMeshes.get(id);
    if (group) {
      unionBox.expandByObject(group);
      count++;
    }
  }

  if (count === 0 || unionBox.isEmpty()) {
    bubbleEl.style.visibility = 'hidden';
    return;
  }

  const center = new THREE.Vector3();
  unionBox.getCenter(center);
  const topY = isFinite(unionBox.max.y) && unionBox.max.y > -900 ? unionBox.max.y : 0.8;

  const projected = new THREE.Vector3(center.x, topY + 0.32, center.z).project(camera);
  if (projected.z >= 1.0) {
    bubbleEl.style.visibility = 'hidden';
    return;
  }

  const w = mountEl.clientWidth;
  const h = mountEl.clientHeight;
  const rawX = (projected.x * 0.5 + 0.5) * w;
  const rawY = (-(projected.y * 0.5) + 0.5) * h;

  // Safe viewport bounds clamping
  const sx = Math.max(170, Math.min(w - 170, rawX));
  const sy = Math.max(90, Math.min(h - 130, rawY));

  bubbleEl.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
  bubbleEl.style.visibility = 'visible';
  bubbleEl.style.opacity = '1';
}

/** Clones materials of a mesh tree and makes them translucent (ghost preview). */
export function makeGhostTranslucent(root: THREE.Object3D, opacity = 0.7) {
  root.traverse(child => {
    if (child instanceof THREE.Mesh && child.material) {
      child.material = (child.material as THREE.Material).clone();
      child.material.transparent = true;
      child.material.opacity = opacity;
    }
  });
}

export function setSelectionEmissive(root: THREE.Object3D, isSelected: boolean) {
  root.traverse(child => {
    if (child instanceof THREE.Mesh && child.material) {
      // Clone the material on first use so emissive changes are instance-local
      // and don't bleed into every other mesh sharing the same cached material.
      if (!child.userData.__ownMaterial) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m: THREE.Material) => m.clone());
        } else {
          child.material = (child.material as THREE.Material).clone();
        }
        child.userData.__ownMaterial = true;
      }

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial;
        if (typeof std.emissive !== 'undefined') {
          if (isSelected) {
            std.emissive = new THREE.Color(0x10b981);
            std.emissiveIntensity = 0.35;
          } else {
            std.emissive = new THREE.Color(0x000000);
            std.emissiveIntensity = 0;
          }
        }
      }
    }
  });
}
