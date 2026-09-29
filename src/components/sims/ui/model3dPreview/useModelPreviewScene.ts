import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import * as THREE from 'three';
import type { SimsProduct } from '../../../../data/simsCatalog';
import { createFurnitureMesh, updateMeshDimensions } from '../../Sims3DModels';
import { countTriangles, createPreviewStage, disposeMeshTree, setWireframe } from './previewHelpers';
import type { PreviewOrbit } from './usePreviewOrbit';

interface UseModelPreviewSceneParams {
  mountRef: RefObject<HTMLDivElement | null>;
  height: number | string;
  product: SimsProduct;
  activeColor: string;
  isGridOn: boolean;
  hideGroundShadow?: boolean;
  autoRotateRef: MutableRefObject<boolean>;
  isWireframeRef: MutableRefObject<boolean>;
  orbit: PreviewOrbit;
}

/**
 * Turntable preview scene: builds the stage once, loads / re-colors the product mesh,
 * live-updates its dimensions, and exposes loading + triangle stats and camera helpers.
 */
export function useModelPreviewScene({
  mountRef,
  height,
  product,
  activeColor,
  isGridOn,
  hideGroundShadow = false,
  autoRotateRef,
  isWireframeRef,
  orbit,
}: UseModelPreviewSceneParams) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const hasInitialFramedRef = useRef<boolean>(false);
  const lastLoadedModelKeyRef = useRef<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [triangleCount, setTriangleCount] = useState<number>(0);

  const { isPointerDownRef, orbitAngleRef, targetOrbitAngleRef, zoomDistRef, targetZoomDistRef } = orbit;

  const targetW = product.actualDimensions?.widthM ?? 1.2;
  const targetD = product.actualDimensions?.depthM ?? 0.6;
  const targetH = product.actualDimensions?.heightM ?? 0.74;

  // Re-frame camera comfortably around the product
  const reframeModel = useCallback((group: THREE.Group, forceRefit = false) => {
    if (!cameraRef.current) return;
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty() || !isFinite(box.min.x)) return;

    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 0.4);
    const fitDistance = maxDim * 2.1;

    // Only auto-zoom on initial frame or explicit reset so dimension adjustments visibly expand against grid
    if (!hasInitialFramedRef.current || forceRefit) {
      zoomDistRef.current = fitDistance;
      targetZoomDistRef.current = fitDistance;
      hasInitialFramedRef.current = true;
    }

    setTriangleCount(countTriangles(group));
  }, [zoomDistRef, targetZoomDistRef]);

  const applyWireframe = useCallback((wire: boolean) => {
    if (modelGroupRef.current) setWireframe(modelGroupRef.current, wire);
  }, []);

  const resetCamera = () => {
    targetOrbitAngleRef.current = { x: 0.38, y: -0.45 };
    if (modelGroupRef.current) {
      reframeModel(modelGroupRef.current, true);
    }
  };

  // Initialize Three.js Scene, Studio Lighting & Soft Shadow Floor
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const canvasHeight = typeof height === 'number' ? height : container.clientHeight || 240;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / canvasHeight, 0.1, 50);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, canvasHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const stage = createPreviewStage(scene);
    turntableGroupRef.current = stage.turntable;
    shadowMeshRef.current = stage.shadowPlane;
    gridHelperRef.current = stage.gridHelper;

    // Render loop
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Auto-rotation around turntable Y axis
      if (autoRotateRef.current && !isPointerDownRef.current && turntableGroupRef.current) {
        turntableGroupRef.current.rotation.y += dt * 0.45;
      }

      // Smooth camera interpolation
      orbitAngleRef.current.x += (targetOrbitAngleRef.current.x - orbitAngleRef.current.x) * 0.12;
      orbitAngleRef.current.y += (targetOrbitAngleRef.current.y - orbitAngleRef.current.y) * 0.12;
      zoomDistRef.current += (targetZoomDistRef.current - zoomDistRef.current) * 0.12;

      const pitch = orbitAngleRef.current.x;
      const yaw = orbitAngleRef.current.y;
      const dist = zoomDistRef.current;

      const camX = dist * Math.cos(pitch) * Math.sin(yaw);
      const camY = Math.max(0.15, dist * Math.sin(pitch));
      const camZ = dist * Math.cos(pitch) * Math.cos(yaw);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, targetH * 0.45, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = typeof height === 'number' ? height : mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      stage.dispose();
      scene.clear();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      turntableGroupRef.current = null;
      modelGroupRef.current = null;
      shadowMeshRef.current = null;
      gridHelperRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  // Load or Update 3D Model dynamically
  useEffect(() => {
    if (!sceneRef.current || !turntableGroupRef.current) return;

    const turntable = turntableGroupRef.current;
    const currentModelKey = `${product.id}:${product.modelUrl || 'proc'}:${product.modelType}:${activeColor}`;

    // Scale ground contact shadow smoothly to match the product footprint
    const syncShadowScale = () => {
      if (shadowMeshRef.current) {
        shadowMeshRef.current.scale.set(targetW * 1.35, targetD * 1.35, 1);
      }
    };

    // If the model asset & color are already loaded, update dimensions dynamically at 60 FPS
    if (modelGroupRef.current && lastLoadedModelKeyRef.current === currentModelKey) {
      updateMeshDimensions(modelGroupRef.current, product);
      syncShadowScale();
      return;
    }

    // Otherwise, load/instantiate new model mesh
    setIsLoading(true);
    lastLoadedModelKeyRef.current = currentModelKey;

    // Remove existing model if any
    if (modelGroupRef.current) {
      turntable.remove(modelGroupRef.current);
      disposeMeshTree(modelGroupRef.current);
      modelGroupRef.current = null;
    }

    const meshGroup = createFurnitureMesh(product, activeColor, () => {
      setIsLoading(false);
      reframeModel(meshGroup, !hasInitialFramedRef.current);
      applyWireframe(isWireframeRef.current);
      syncShadowScale();
    });

    meshGroup.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    turntable.add(meshGroup);
    modelGroupRef.current = meshGroup;

    reframeModel(meshGroup, !hasInitialFramedRef.current);
    applyWireframe(isWireframeRef.current);
    syncShadowScale();

    if (!product.modelUrl) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    product.id,
    product.modelUrl,
    product.modelType,
    product.category,
    activeColor,
    product.actualDimensions?.widthM,
    product.actualDimensions?.depthM,
    product.actualDimensions?.heightM,
    product.scaleMultiplier,
    product.fitMode,
    targetW,
    targetD,
    reframeModel,
    applyWireframe,
  ]);

  // Toggle floor grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = isGridOn;
    }
  }, [isGridOn]);

  // Toggle ground contact shadow visibility
  useEffect(() => {
    if (shadowMeshRef.current) {
      shadowMeshRef.current.visible = !hideGroundShadow;
    }
  }, [hideGroundShadow]);

  return { isLoading, triangleCount, applyWireframe, resetCamera };
}
