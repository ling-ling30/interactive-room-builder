import type { Dispatch, MutableRefObject, PointerEvent as ReactPointerEvent, SetStateAction, WheelEvent as ReactWheelEvent } from 'react';
import * as THREE from 'three';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import { sounds } from '../../../utils/soundEffects';
import {
  clampGridCoords,
  findNearestCenterSnap,
  getEffectiveFootprint,
  getEffectiveSnapStep,
  isNearWall,
  isSmallItem,
} from '../three/spatialMath';
import { clientToNdc, pickFurnitureAt } from '../three/pointerPicking';
import type { SimsRoomRefs } from './useSimsRoomRefs';
import type { PlacementState } from './usePlacementState';
import type { useSimsCamera } from './useSimsCamera';

type CameraApi = ReturnType<typeof useSimsCamera>;

interface UseCanvasPointerHandlersParams {
  refs: SimsRoomRefs;
  placement: PlacementState;
  camera: Pick<CameraApi, 'cameraRef' | 'orbitBy' | 'panBy' | 'zoomIn' | 'zoomOut' | 'walkLook'>;
  heldProduct: SimsProduct | null;
  placedItems: PlacedFurniture[];
  catalog: SimsProduct[];
  roomWidth: number;
  roomLength: number;
  isWalkModeRef: MutableRefObject<boolean>;
  /** Walk sub-mode: true = free cursor (select / move objects), false = mouse-look. */
  isWalkInteractRef: MutableRefObject<boolean>;
  isPanModeRef: MutableRefObject<boolean>;
  placedItemsRef: MutableRefObject<PlacedFurniture[]>;
  selectedInstanceIdsRef: MutableRefObject<string[]>;
  setSelectedInstanceIds: Dispatch<SetStateAction<string[]>>;
  updatePointer: (clientX: number, clientY: number) => void;
  handleDirectPlace: (targetTile?: { x: number; z: number }) => void;
  handlePickupGroup: (groupItems: PlacedFurniture[], primaryItem: PlacedFurniture) => void;
  handlePickupItem: (item: PlacedFurniture) => void;
  stepHeldRotation: (dir: 'cw' | 'ccw') => void;
}

/** DOM pointer / wheel handlers for the canvas wrapper: orbit, pan, select, drag-to-move, drop. */
export function useCanvasPointerHandlers({
  refs,
  placement,
  camera: { cameraRef, orbitBy, panBy, zoomIn, zoomOut, walkLook },
  heldProduct,
  placedItems,
  catalog,
  roomWidth,
  roomLength,
  isWalkModeRef,
  isWalkInteractRef,
  isPanModeRef,
  placedItemsRef,
  selectedInstanceIdsRef,
  setSelectedInstanceIds,
  updatePointer,
  handleDirectPlace,
  handlePickupGroup,
  handlePickupItem,
  stepHeldRotation,
}: UseCanvasPointerHandlersParams) {
  const {
    mountRef,
    floorMeshRef,
    raycasterRef,
    itemMeshesRef,
    hoverIndicatorRef,
    ghostMeshRef,
    movingInstanceIdRef,
    pointerHitFurnitureRef,
    isDirectDraggingRef,
    isOrbitingRef,
    didDragRef,
    dragModeRef,
    pointerStartRef,
    lastPointerPosRef,
    isSpacePressedRef,
    lookSteerRef,
  } = refs;
  const { heldRotation, snapStep, hoverTile, setHoverTile } = placement;

  const pickAt = (clientX: number, clientY: number) => {
    if (!cameraRef.current || !mountRef.current) return null;
    return pickFurnitureAt(raycasterRef.current, cameraRef.current, mountRef.current, clientX, clientY, itemMeshesRef.current);
  };

  const applySelectionClick = (targetId: string, additive: boolean) => {
    sounds.playSelect();
    if (additive) {
      setSelectedInstanceIds(prev =>
        prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
      );
    } else {
      setSelectedInstanceIds([targetId]);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    didDragRef.current = false;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    const inWalk = isWalkModeRef.current;
    // Walk mouse-look: no picking or dragging
    if (inWalk && !isWalkInteractRef.current) return;
    if (heldProduct) return;

    // Shift+Left Click is reserved for multi-select; Ctrl (or Space / H / right / middle button) pans the camera
    const shouldPan = !inWalk && (e.button === 2 || e.button === 1 || e.ctrlKey || isSpacePressedRef.current || isPanModeRef.current);

    const hitInstanceId = shouldPan ? null : pickAt(e.clientX, e.clientY);

    if (hitInstanceId) {
      pointerHitFurnitureRef.current = { instanceId: hitInstanceId, clientX: e.clientX, clientY: e.clientY };
      isOrbitingRef.current = false;
      return;
    }

    pointerHitFurnitureRef.current = null;

    // Walking with a free cursor never orbits or pans the camera
    if (inWalk) return;

    if (shouldPan) {
      dragModeRef.current = 'pan';
      isOrbitingRef.current = true;
      if (mountRef.current) mountRef.current.style.cursor = 'grabbing';
    } else if (e.button === 0) {
      dragModeRef.current = 'orbit';
      isOrbitingRef.current = true;
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (isWalkModeRef.current && !isWalkInteractRef.current) {
      // Pointer locked: the camera turns with the mouse, no dragging needed
      if (document.pointerLockElement === mountRef.current) {
        walkLook(e.movementX, e.movementY);
        return;
      }
      // Pointer lock unavailable: the mouse position steers the view (the cursor stays hidden)
      if (e.pointerType === 'mouse' && mountRef.current) {
        const rect = mountRef.current.getBoundingClientRect();
        lookSteerRef.current = {
          x: Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2))),
          y: Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2))),
        };
        return;
      }
      // Touch / pen: drag to look
      if (pointerStartRef.current) {
        const deltaX = e.clientX - lastPointerPosRef.current.x;
        const deltaY = e.clientY - lastPointerPosRef.current.y;
        if (Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y) > 6) {
          didDragRef.current = true;
        }
        walkLook(deltaX, deltaY);
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      }
      return;
    }

    if (pointerStartRef.current) {
      const dist = Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y);
      if (dist > 14) {
        didDragRef.current = true;

        if (pointerHitFurnitureRef.current && !heldProduct && !e.shiftKey) {
          const hit = pointerHitFurnitureRef.current;
          pointerHitFurnitureRef.current = null;

          isDirectDraggingRef.current = true;

          if (selectedInstanceIdsRef.current.length > 1 && selectedInstanceIdsRef.current.includes(hit.instanceId)) {
            // Dragging an item inside a multi-selection: pick up the entire group together!
            const groupItems = placedItemsRef.current.filter(p => selectedInstanceIdsRef.current.includes(p.instanceId));
            const primaryItem = groupItems.find(p => p.instanceId === hit.instanceId) || groupItems[0];
            handlePickupGroup(groupItems, primaryItem);
            return;
          }

          const item = placedItemsRef.current.find(p => p.instanceId === hit.instanceId);
          if (item) {
            handlePickupItem(item);
            return;
          }
        }
      }
    }

    if (isOrbitingRef.current && didDragRef.current) {
      const deltaX = e.clientX - lastPointerPosRef.current.x;
      const deltaY = e.clientY - lastPointerPosRef.current.y;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      if (dragModeRef.current === 'pan') {
        panBy(deltaX, deltaY, mountRef.current?.clientHeight || window.innerHeight);
      } else {
        orbitBy(deltaX, deltaY);
      }
      return;
    }

    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    updatePointer(e.clientX, e.clientY);
  };

  /** Drop fallback when no hover tile is cached: raycast the floor and snap like updatePointer does. */
  const dropAtFloorUnderPointer = (e: ReactPointerEvent, product: SimsProduct) => {
    if (!cameraRef.current || !mountRef.current || !floorMeshRef.current) return;
    raycasterRef.current.setFromCamera(clientToNdc(e.clientX, e.clientY, mountRef.current), cameraRef.current);
    const hits = raycasterRef.current.intersectObject(floorMeshRef.current);

    let pt: THREE.Vector3 | null = hits.length > 0 ? hits[0].point : null;

    // Y=0 plane fallback when floor mesh raycast misses near walls
    if (!pt) {
      const ray = raycasterRef.current.ray;
      if (Math.abs(ray.direction.y) > 1e-6) {
        const t = -ray.origin.y / ray.direction.y;
        if (t > 0) {
          pt = new THREE.Vector3(ray.origin.x + ray.direction.x * t, 0, ray.origin.z + ray.direction.z * t);
        }
      }
    }
    if (!pt) return;

    const fp = getEffectiveFootprint(product, heldRotation);
    const targetGx = (pt.x + roomWidth / 2) - fp.width / 2;
    const targetGz = (pt.z + roomLength / 2) - fp.depth / 2;
    const effectiveStep = getEffectiveSnapStep(product, snapStep);
    const { x: clampedX, z: clampedZ } = clampGridCoords(targetGx, targetGz, fp.width, fp.depth, roomWidth, roomLength, effectiveStep);
    let gx = clampedX;
    let gz = clampedZ;
    const snapThreshold = isSmallItem(product) ? 0.12 : 0.35;
    // Wall placement wins over the magnetic desk-centre snap
    const snapResult = isNearWall(gx, gz, fp.width, fp.depth, roomWidth, roomLength)
      ? null
      : findNearestCenterSnap(gx, gz, fp, placedItems, catalog, movingInstanceIdRef.current, snapThreshold);
    if (snapResult?.isSnapped) {
      gx = snapResult.x;
      gz = snapResult.z;
    }
    handleDirectPlace({ x: gx, z: gz });
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const wasDragging = didDragRef.current;
    const hitCandidate = pointerHitFurnitureRef.current;
    const isDirectDragging = isDirectDraggingRef.current;
    isDirectDraggingRef.current = false;
    pointerHitFurnitureRef.current = null;
    isOrbitingRef.current = false;
    const lastDragMode = dragModeRef.current;
    dragModeRef.current = null;
    pointerStartRef.current = null;
    didDragRef.current = false;

    if (mountRef.current) {
      mountRef.current.style.cursor = isPanModeRef.current || isSpacePressedRef.current ? 'grab' : 'crosshair';
    }

    if (isWalkModeRef.current && !isWalkInteractRef.current) {
      // Carrying furniture at the crosshair: a click drops it where the ghost is
      if (heldProduct) {
        if (hoverTile) handleDirectPlace(hoverTile);
        return;
      }
      // Look mode without pointer lock: a plain click still selects furniture
      if (!wasDragging && document.pointerLockElement !== mountRef.current) {
        const targetId = pickAt(e.clientX, e.clientY);
        if (targetId) {
          applySelectionClick(targetId, e.shiftKey);
          return;
        }
        if (!e.shiftKey) {
          setSelectedInstanceIds([]);
        }
      }
      return;
    }

    // 1. If currently in Move Mode (heldProduct active)
    if (heldProduct) {
      if (isDirectDragging || !wasDragging) {
        if (hoverTile) {
          handleDirectPlace(hoverTile);
          return;
        }
        dropAtFloorUnderPointer(e, heldProduct);
      }
      return;
    }

    // 2. Camera Pan Protection: Panning camera must NEVER clear selection!
    const isPanAction = lastDragMode === 'pan' || isPanModeRef.current || isSpacePressedRef.current || e.button === 1 || e.button === 2;
    if (isPanAction) return;

    // 3. Orbit Drag Protection: Releasing after dragging camera orbit must not clear selection
    if (wasDragging) return;

    // 4. Clicked furniture selection / Shift-toggle
    const targetInstanceId = hitCandidate?.instanceId || pickAt(e.clientX, e.clientY);
    if (targetInstanceId) {
      applySelectionClick(targetInstanceId, e.shiftKey);
      return;
    }

    // 5. Clicked empty floor without Shift -> clear selection
    if (!e.shiftKey) {
      setSelectedInstanceIds([]);
    }
  };

  const onPointerLeave = () => {
    if (isWalkModeRef.current && !isWalkInteractRef.current) return;
    if (hoverIndicatorRef.current) hoverIndicatorRef.current.visible = false;
    if (ghostMeshRef.current) ghostMeshRef.current.visible = false;
    setHoverTile(null);
  };

  const onPointerCancel = () => {
    isOrbitingRef.current = false;
    pointerStartRef.current = null;
    pointerHitFurnitureRef.current = null;
  };

  const onWheel = (e: ReactWheelEvent) => {
    // Walking: the wheel rotates a carried item and never zooms
    if (isWalkModeRef.current) {
      if (heldProduct) stepHeldRotation(e.deltaY < 0 ? 'cw' : 'ccw');
      return;
    }
    if (e.shiftKey) {
      panBy(-e.deltaY, 0, mountRef.current?.clientHeight || window.innerHeight);
    } else if (e.deltaY < 0) {
      zoomIn(1.5);
    } else {
      zoomOut(1.5);
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onPointerCancel, onWheel };
}
