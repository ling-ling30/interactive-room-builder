import * as THREE from 'three';
import type { SimsProduct } from '../../../../data/simsCatalog';

/** Fills the gaps of a partial product so the mesh factories always get a complete SimsProduct. */
export function buildPreviewProduct(product: Partial<SimsProduct>, activeColor: string): SimsProduct {
  return {
    id: product.id || 'preview-product',
    name: product.name || 'Preview Item',
    brand: product.brand || 'Monis Studio',
    category: product.category || 'desks',
    footprint: product.footprint || { width: 1.2, depth: 0.6 },
    actualDimensions: product.actualDimensions || {
      widthM: product.footprint?.width || 1.2,
      depthM: product.footprint?.depth || 0.6,
      heightM: 0.74,
    },
    weeklyRent: product.weeklyRent || 10,
    monthlyRent: product.monthlyRent || 30,
    deposit: product.deposit || 20,
    layer: product.layer || 'floor',
    color: activeColor,
    colorOptions: product.colorOptions || [activeColor],
    modelType: product.modelType || 'standing_desk',
    icon: product.icon || '📦',
    description: product.description || '',
    material: product.material || '',
    imageUrl: product.imageUrl,
    modelUrl: product.modelUrl,
    scaleMultiplier: product.scaleMultiplier ?? 1.0,
    fitMode: product.fitMode ?? 'exact',
  };
}

export interface PreviewStage {
  turntable: THREE.Group;
  shadowPlane: THREE.Mesh;
  gridHelper: THREE.GridHelper;
  /** Disposes the shadow plane resources (geometry, material, texture). */
  dispose: () => void;
}

/** Turntable with soft ground shadow + reference grid, and Apple-style studio lighting added to `scene`. */
export function createPreviewStage(scene: THREE.Scene): PreviewStage {
  // Turntable Group (Model and shadow spin synchronously)
  const turntable = new THREE.Group();
  scene.add(turntable);

  // Apple-style Realistic Soft Ambient Ground Drop Shadow
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.10)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(1, 1);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.001; // Rest flat on ground
  turntable.add(shadowPlane);

  // Clean subtle reference grid
  const gridHelper = new THREE.GridHelper(3.6, 36, 0x475569, 0x1e293b);
  gridHelper.position.y = 0.0005;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.25;
  turntable.add(gridHelper);

  // Apple Studio Balanced Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 1.3));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
  keyLight.position.set(3, 5, 3.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.75);
  fillLight.position.set(-3.5, 3, -2.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
  rimLight.position.set(0, 4, -3.5);
  scene.add(rimLight);

  return {
    turntable,
    shadowPlane,
    gridHelper,
    dispose: () => {
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
    },
  };
}

export function countTriangles(group: THREE.Object3D): number {
  let tris = 0;
  group.traverse((c) => {
    if (c instanceof THREE.Mesh && c.geometry) {
      if (c.geometry.index) {
        tris += c.geometry.index.count / 3;
      } else if (c.geometry.attributes.position) {
        tris += c.geometry.attributes.position.count / 3;
      }
    }
  });
  return Math.round(tris);
}

/** Toggles wireframe rendering on every mesh material under `root`. */
export function setWireframe(root: THREE.Object3D, wire: boolean) {
  root.traverse((c) => {
    if (c instanceof THREE.Mesh && c.material) {
      if (Array.isArray(c.material)) {
        c.material.forEach((m) => { m.wireframe = wire; });
      } else {
        c.material.wireframe = wire;
      }
    }
  });
}

export function disposeMeshTree(root: THREE.Object3D) {
  root.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      c.geometry.dispose();
      if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
      else c.material.dispose();
    }
  });
}
