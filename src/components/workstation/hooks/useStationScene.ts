import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { addStudioEnvironment, createStationGroups } from '../three/stationSetup';
import type { useOrbitCamera } from './useOrbitCamera';

type OrbitCamera = ReturnType<typeof useOrbitCamera>;

/**
 * Creates the renderer / camera / studio scene once and runs the render loop, which also animates
 * the motorized desk height (lerp toward `deskHeightCm`) and the telescoping legs.
 * Returns refs to the groups that `useStationGeometry` rebuilds.
 */
export function useStationScene(
  mountRef: RefObject<HTMLDivElement | null>,
  deskHeightCm: number,
  orbit: Pick<OrbitCamera, 'targetCenterRef' | 'updateCamera'>
) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Dynamic mesh references for height animation & dynamic updates
  const movingDeskGroupRef = useRef<THREE.Group | null>(null);
  const legsGroupRef = useRef<THREE.Group | null>(null);
  const monitorsGroupRef = useRef<THREE.Group | null>(null);
  const accessoriesGroupRef = useRef<THREE.Group | null>(null);
  const ergonomicsGroupRef = useRef<THREE.Group | null>(null);
  const tabletopMeshRef = useRef<THREE.Mesh | null>(null);
  const deskLightRef = useRef<THREE.SpotLight | null>(null);

  // Animated height state
  const currentHeightMRef = useRef<number>(deskHeightCm / 100);
  const targetHeightMRef = useRef<number>(deskHeightCm / 100);

  useEffect(() => {
    targetHeightMRef.current = deskHeightCm / 100;
  }, [deskHeightCm]);

  const { targetCenterRef, updateCamera } = orbit;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    addStudioEnvironment(scene);

    const groups = createStationGroups(scene);
    movingDeskGroupRef.current = groups.movingGroup;
    legsGroupRef.current = groups.legsGroup;
    monitorsGroupRef.current = groups.monitorsGroup;
    accessoriesGroupRef.current = groups.accessoriesGroup;
    ergonomicsGroupRef.current = groups.ergoGroup;
    deskLightRef.current = groups.deskSpot;

    updateCamera(cameraRef.current);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth elevation lerp for motorized lift
      const diff = targetHeightMRef.current - currentHeightMRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentHeightMRef.current += diff * 0.12;
      } else {
        currentHeightMRef.current = targetHeightMRef.current;
      }

      const h = currentHeightMRef.current;
      if (movingDeskGroupRef.current) {
        movingDeskGroupRef.current.position.y = h;
      }

      // Telescopic Legs Extension
      if (legsGroupRef.current) {
        // Legs base is at y=0, telescopic inner column extends to match h
        const innerLegL = legsGroupRef.current.getObjectByName('innerLegL');
        const innerLegR = legsGroupRef.current.getObjectByName('innerLegR');
        const columnBaseH = 0.42; // Outer stationary column height
        const extension = Math.max(0.01, h - columnBaseH);
        if (innerLegL && innerLegR) {
          innerLegL.scale.y = extension / 0.7;
          innerLegL.position.y = columnBaseH + extension / 2;
          innerLegR.scale.y = extension / 0.7;
          innerLegR.position.y = columnBaseH + extension / 2;
        }
      }

      // Update target focus center slightly based on height
      targetCenterRef.current.y = h * 0.6 + 0.35;
      updateCamera(cameraRef.current);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const he = container.clientHeight;
      cameraRef.current.aspect = w / he;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, he);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      renderer.forceContextLoss();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sceneRef,
    movingDeskGroupRef,
    legsGroupRef,
    monitorsGroupRef,
    accessoriesGroupRef,
    ergonomicsGroupRef,
    tabletopMeshRef,
    deskLightRef,
  };
}

export type StationSceneRefs = ReturnType<typeof useStationScene>;
