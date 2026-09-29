import { useRef } from 'react';
import * as THREE from 'three';
import type { PlacedFurniture } from '../../../data/simsCatalog';
import type { MovingGroupState } from '../simsRoomTypes';

/**
 * Every mutable ref shared between the room canvas hooks (scene, placement, pointer, keyboard).
 * Refs are used (instead of state) wherever the 60FPS loop or DOM event handlers need the latest value.
 */
export function useSimsRoomRefs() {
  // DOM & renderer
  const mountRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Architecture
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const skirtingGroupRef = useRef<THREE.Group | null>(null);
  const wallsGroupRef = useRef<THREE.Group | null>(null);
  const windowGroupRef = useRef<THREE.Group | null>(null);
  const plumbobRef = useRef<THREE.Group | null>(null);
  const plumbobBaseYRef = useRef<number>(1.2);

  // Mesh registries
  const itemMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const itemMeshSignatureMapRef = useRef<Map<string, string>>(new Map());
  const ghostMeshRef = useRef<THREE.Group | null>(null);
  const hoverIndicatorRef = useRef<THREE.Mesh | null>(null);

  // Relocation tracking & origin backup for safe reversion
  const movingGroupRef = useRef<MovingGroupState | null>(null);
  const movingInstanceIdRef = useRef<string | null>(null);
  const originBackupRef = useRef<PlacedFurniture | null>(null);
  const isCopiedGroupRef = useRef<boolean>(false);
  const isDirectDraggingRef = useRef<boolean>(false);
  const pointerHitFurnitureRef = useRef<{ instanceId: string; clientX: number; clientY: number } | null>(null);

  // Pointer / gesture tracking
  const raycasterRef = useRef(new THREE.Raycaster());
  const isOrbitingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragModeRef = useRef<'orbit' | 'pan' | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const isSpacePressedRef = useRef<boolean>(false);

  // Walk mode input / animation clock
  const keysRef = useRef<{ [code: string]: boolean }>({});
  const lastTimeRef = useRef<number>(0);
  // Walk look without pointer lock: mouse offset from the view centre (-1..1) steers the camera
  const lookSteerRef = useRef({ x: 0, y: 0 });

  return {
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
    itemMeshSignatureMapRef,
    ghostMeshRef,
    hoverIndicatorRef,
    movingGroupRef,
    movingInstanceIdRef,
    originBackupRef,
    isCopiedGroupRef,
    isDirectDraggingRef,
    pointerHitFurnitureRef,
    raycasterRef,
    isOrbitingRef,
    didDragRef,
    dragModeRef,
    pointerStartRef,
    lastPointerPosRef,
    isSpacePressedRef,
    keysRef,
    lastTimeRef,
    lookSteerRef,
  };
}

export type SimsRoomRefs = ReturnType<typeof useSimsRoomRefs>;
