import { useCallback, useEffect, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { SpaceParameters } from '../../../types/space';
import {
  generateFloorTexture,
  createRoomGrid,
  createSkirting,
  createWindow,
  createPlumbob,
  createWalls,
} from '../three/roomArchitecture';
import {
  addSceneLights,
  animatePlumbob,
  applySceneBackground,
  createHoverIndicator,
  disposeGeometries,
  disposeMeshes,
  getWallColorHex,
  trackSelectionBubble,
  updateSceneTheme,
} from '../three/sceneHelpers';
import type { SimsRoomRefs } from './useSimsRoomRefs';
import type { useSimsCamera } from './useSimsCamera';

type CameraApi = ReturnType<typeof useSimsCamera>;

interface UseRoomSceneParams {
  refs: SimsRoomRefs;
  space: SpaceParameters;
  roomWidth: number;
  roomLength: number;
  isNightMode: boolean;
  camera: Pick<CameraApi, 'cameraRef' | 'updateCameraPosition' | 'fitRoomInView'>;
  /** Latest-value refs read by the 60FPS render loop. */
  isWalkModeRef: MutableRefObject<boolean>;
  walkMoveRef: MutableRefObject<CameraApi['walkMove']>;
  roomWidthRef: MutableRefObject<number>;
  roomLengthRef: MutableRefObject<number>;
  selectedInstanceIdsRef: MutableRefObject<string[]>;
}

/**
 * Owns the Three.js scene lifecycle: one-time renderer/scene/light/room setup + render loop,
 * and live updates of the room architecture when dimensions, style or day/night mode change.
 * Returns a `sceneReady` counter that bumps whenever meshes need re-syncing (scene built, model loaded).
 */
export function useRoomScene({
  refs,
  space,
  roomWidth,
  roomLength,
  isNightMode,
  camera: { cameraRef, updateCameraPosition, fitRoomInView },
  isWalkModeRef,
  walkMoveRef,
  roomWidthRef,
  roomLengthRef,
  selectedInstanceIdsRef,
}: UseRoomSceneParams) {
  const [sceneReady, setSceneReady] = useState<number>(0);
  const bumpSceneReady = useCallback(() => setSceneReady(prev => prev + 1), []);

  const {
    mountRef,
    bubbleRef,
    sceneRef,
    rendererRef,
    floorMeshRef,
    gridGroupRef,
    skirtingGroupRef,
    wallsGroupRef,
    windowGroupRef,
    plumbobRef,
    plumbobBaseYRef,
    itemMeshesRef,
    ghostMeshRef,
    hoverIndicatorRef,
    keysRef,
    lastTimeRef,
  } = refs;

  // Initialize Three.js Scene ONCE on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    itemMeshesRef.current.clear();

    const maxDim = Math.max(roomWidth, roomLength);
    applySceneBackground(scene, isNightMode, space.backdropColor);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.2, Math.max(500, maxDim * 12));
    cameraRef.current = camera;
    updateCameraPosition();
    fitRoomInView(roomWidth, roomLength);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    addSceneLights(scene, maxDim, isNightMode);

    // Floor
    const floorTexture = generateFloorTexture(space.floorStyle, roomWidth, roomLength, isNightMode);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.45, metalness: 0.05 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomLength), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
    floorMeshRef.current = floor;

    // Grid Overlay
    const grid = createRoomGrid(roomWidth, roomLength, isNightMode);
    scene.add(grid);
    gridGroupRef.current = grid;

    // Skirting
    const skirting = createSkirting(roomWidth, roomLength, isNightMode);
    scene.add(skirting);
    skirtingGroupRef.current = skirting;

    // Architectural Walls (Sims Cutaway / Low / Full)
    const walls = createWalls(roomWidth, roomLength, getWallColorHex(space, isNightMode), space.wallStyle || 'cutaway');
    scene.add(walls);
    wallsGroupRef.current = walls;

    // Window
    const windowGroup = createWindow(roomWidth, roomLength, isNightMode);
    windowGroup.visible = space.hasWindow !== false;
    scene.add(windowGroup);
    windowGroupRef.current = windowGroup;

    // Plumbob
    const plumbob = createPlumbob();
    scene.add(plumbob);
    plumbobRef.current = plumbob;

    // Hover Indicator
    const hoverIndicator = createHoverIndicator();
    scene.add(hoverIndicator);
    hoverIndicatorRef.current = hoverIndicator;

    // Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Walk Mode continuous movement
      const now = performance.now();
      const dt = Math.min(0.06, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (isWalkModeRef.current) {
        let fwd = 0;
        let strafe = 0;
        const k = keysRef.current;
        if (k['KeyW'] || k['ArrowUp']) fwd += 1;
        if (k['KeyS'] || k['ArrowDown']) fwd -= 1;
        if (k['KeyD'] || k['ArrowRight']) strafe += 1;
        if (k['KeyA'] || k['ArrowLeft']) strafe -= 1;

        const rw = roomWidthRef.current;
        const rl = roomLengthRef.current;
        // Furniture is walk-through: only the room walls limit movement (no obstacles passed)
        // Call walkMove every frame to preserve kinematic damping and active tweens
        walkMoveRef.current(fwd, strafe, dt, rw, rl, []);
      }

      if (plumbobRef.current && plumbobRef.current.visible) {
        animatePlumbob(plumbobRef.current, plumbobBaseYRef, selectedInstanceIdsRef.current, itemMeshesRef.current);
      }

      renderer.render(scene, camera);

      // 60FPS tracking of the floating action pill over the selected furniture
      if (bubbleRef.current && cameraRef.current && mountRef.current) {
        trackSelectionBubble(
          bubbleRef.current,
          cameraRef.current,
          mountRef.current,
          selectedInstanceIdsRef.current,
          itemMeshesRef.current
        );
      }
    };
    animate();
    bumpSceneReady();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const itemMeshes = itemMeshesRef.current;
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      renderer.forceContextLoss();
      itemMeshes.clear();
      ghostMeshRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount

  // Update room architecture on parameter changes
  useEffect(() => {
    if (!sceneRef.current || !floorMeshRef.current || !wallsGroupRef.current) return;
    const scene = sceneRef.current;
    const maxDim = Math.max(roomWidth, roomLength);

    // Floor
    floorMeshRef.current.geometry.dispose();
    floorMeshRef.current.geometry = new THREE.PlaneGeometry(roomWidth, roomLength);

    const mat = floorMeshRef.current.material as THREE.MeshStandardMaterial;
    if (mat.map) mat.map.dispose();
    mat.map = generateFloorTexture(space.floorStyle, roomWidth, roomLength, isNightMode);
    mat.needsUpdate = true;

    // Grid
    if (gridGroupRef.current) {
      scene.remove(gridGroupRef.current);
      disposeGeometries(gridGroupRef.current);
    }
    const newGrid = createRoomGrid(roomWidth, roomLength, isNightMode);
    scene.add(newGrid);
    gridGroupRef.current = newGrid;

    // Skirting
    if (skirtingGroupRef.current) {
      scene.remove(skirtingGroupRef.current);
      skirtingGroupRef.current.traverse(c => {
        if (c instanceof THREE.Mesh) c.geometry.dispose();
      });
    }
    const newSkirting = createSkirting(roomWidth, roomLength, isNightMode);
    scene.add(newSkirting);
    skirtingGroupRef.current = newSkirting;

    // Walls
    if (wallsGroupRef.current) {
      scene.remove(wallsGroupRef.current);
      disposeMeshes(wallsGroupRef.current);
    }
    const newWalls = createWalls(roomWidth, roomLength, getWallColorHex(space, isNightMode), space.wallStyle || 'cutaway');
    scene.add(newWalls);
    wallsGroupRef.current = newWalls;

    // Window
    if (windowGroupRef.current) {
      scene.remove(windowGroupRef.current);
      disposeMeshes(windowGroupRef.current);
    }
    const newWindow = createWindow(roomWidth, roomLength, isNightMode);
    newWindow.visible = space.hasWindow !== false;
    scene.add(newWindow);
    windowGroupRef.current = newWindow;

    updateSceneTheme(scene, maxDim, isNightMode, space.backdropColor);

    // Auto-fit camera framing smoothly to new room dimensions
    fitRoomInView(roomWidth, roomLength);
  }, [space, isNightMode, roomWidth, roomLength, space.wallColor, space.hasWindow, space.floorStyle, space.wallStyle, space.backdropColor, fitRoomInView]);

  return { sceneReady, bumpSceneReady };
}
