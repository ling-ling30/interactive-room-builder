import { useCallback, useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import { pickFurnitureHit } from '../three/pointerPicking';
import type { SimsRoomRefs } from './useSimsRoomRefs';
import type { useSimsCamera } from './useSimsCamera';
import { useLatest } from '../../../hooks/useLatest';

/** Furniture further than this from the eye cannot be targeted with the crosshair. */
const REACH_M = 4.5;

interface UseWalkInteractParams {
  refs: SimsRoomRefs;
  cameraRef: ReturnType<typeof useSimsCamera>['cameraRef'];
  isWalkMode: boolean;
  heldProduct: SimsProduct | null;
  placedItems: PlacedFurniture[];
  catalog: SimsProduct[];
  handlePickupItem: (item: PlacedFurniture) => void;
  handleDirectPlace: (targetTile?: { x: number; z: number }) => void;
  updatePointer: (clientX: number, clientY: number) => void;
  hoverTile: { x: number; z: number } | null;
  /** Turns the walking camera by mouse-movement pixels. */
  walkLook: (dx: number, dy: number) => void;
  onSwapItem?: (item: PlacedFurniture) => void;
  isSwapDrawerOpen: boolean;
}

/**
 * Walk mode has two sub-modes:
 * - look (default): the pointer is locked and the camera follows the mouse. The crosshair targets
 *   furniture: E swaps it, R picks it up so it follows the crosshair (click or R again to drop).
 * - interact (F): free cursor to select / drag furniture; the camera does not turn.
 * Losing pointer lock (Esc) also drops into interact mode.
 */
export function useWalkInteract({
  refs,
  cameraRef,
  isWalkMode,
  heldProduct,
  placedItems,
  catalog,
  handlePickupItem,
  handleDirectPlace,
  updatePointer,
  hoverTile,
  walkLook,
  onSwapItem,
  isSwapDrawerOpen,
}: UseWalkInteractParams) {
  const { mountRef, raycasterRef, itemMeshesRef, lookSteerRef } = refs;
  const [isWalkInteract, setIsWalkInteract] = useState<boolean>(false);
  // Touch screens cannot lock the pointer: look is drag-based and stays in look mode
  const isTouchRef = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  /** Furniture currently under the crosshair (look mode only). */
  const [walkTarget, setWalkTarget] = useState<PlacedFurniture | null>(null);

  const isWalkInteractRef = useLatest(isWalkInteract);
  const isWalkModeRef = useLatest(isWalkMode);
  const placedItemsRef = useLatest(placedItems);
  const catalogRef = useLatest(catalog);
  const walkTargetRef = useLatest(walkTarget);
  // 'pending' = E pressed, waiting for the swap drawer to open; 'open' = drawer seen open; null = no swap in progress
  const swapPhaseRef = useRef<'pending' | 'open' | null>(null);

  const centerOfView = useCallback(() => {
    const mount = mountRef.current;
    if (!mount) return null;
    const rect = mount.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, [mountRef]);

  // Leaving walk mode always resets the sub-mode (adjusted during render, not in an effect)
  const [wasWalkMode, setWasWalkMode] = useState(isWalkMode);
  if (wasWalkMode !== isWalkMode) {
    setWasWalkMode(isWalkMode);
    if (!isWalkMode) {
      setIsWalkInteract(false);
      setWalkTarget(null);
    }
  }
  useEffect(() => {
    if (!isWalkMode) swapPhaseRef.current = null;
  }, [isWalkMode]);

  // Lock the pointer while looking around, release it while interacting
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (isWalkMode && !isWalkInteract) {
      if (isTouchRef.current) return;
      try {
        const result = mount.requestPointerLock?.() as unknown;
        // A refused lock is fine: the mouse position steers instead (see the steering loop below)
        if (result instanceof Promise) result.catch(() => undefined);
      } catch {
        // Browser refused pointer lock: drag-to-look fallback stays active
      }
    } else if (document.pointerLockElement === mount) {
      document.exitPointerLock();
    }
    return () => {
      if (document.pointerLockElement === mount) document.exitPointerLock();
    };
  }, [isWalkMode, isWalkInteract, mountRef]);

  // Esc / alt-tab releases the lock: switch to interact mode so the cursor is usable
  useEffect(() => {
    const onLockChange = () => {
      if (!isTouchRef.current && isWalkModeRef.current && !isWalkInteractRef.current && document.pointerLockElement !== mountRef.current) {
        setIsWalkInteract(true);
      }
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [mountRef, isWalkModeRef, isWalkInteractRef]);

  // After the swap drawer closes (an option was chosen, or it was dismissed) go back to mouse-look
  useEffect(() => {
    if (swapPhaseRef.current === 'pending' && isSwapDrawerOpen) swapPhaseRef.current = 'open';
    else if (swapPhaseRef.current === 'open' && !isSwapDrawerOpen) {
      swapPhaseRef.current = null;
      setIsWalkInteract(false);
    }
  }, [isSwapDrawerOpen]);

  // Look mode hides the cursor: the mouse only gives a direction (locked movement, or steering by position)
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !isWalkMode) return;
    mount.style.cursor = isWalkInteract ? 'crosshair' : 'none';
    return () => {
      mount.style.cursor = 'crosshair';
    };
  }, [isWalkMode, isWalkInteract, mountRef]);

  // Steering fallback (no pointer lock, mouse): the further from the view centre, the faster the turn
  const walkLookRef = useLatest(walkLook);
  useEffect(() => {
    if (!isWalkMode || isWalkInteract || isTouchRef.current) return;
    lookSteerRef.current = { x: 0, y: 0 };
    const DEADZONE = 0.12;
    const MAX_PX_PER_TICK = 16;
    const timer = setInterval(() => {
      if (document.pointerLockElement === mountRef.current) return;
      const { x, y } = lookSteerRef.current;
      const ax = Math.abs(x) > DEADZONE ? Math.sign(x) * (Math.abs(x) - DEADZONE) / (1 - DEADZONE) : 0;
      const ay = Math.abs(y) > DEADZONE ? Math.sign(y) * (Math.abs(y) - DEADZONE) / (1 - DEADZONE) : 0;
      if (ax !== 0 || ay !== 0) walkLookRef.current(ax * MAX_PX_PER_TICK, ay * MAX_PX_PER_TICK);
    }, 16);
    return () => clearInterval(timer);
  }, [isWalkMode, isWalkInteract, mountRef, lookSteerRef, walkLookRef]);

  // Look mode: keep track of the furniture under the crosshair, or move the carried item with it
  useEffect(() => {
    if (!isWalkMode || isWalkInteract) return;
    const cache: { placed: unknown; catalog: unknown; meshCount: number; targetable: Map<string, THREE.Group> } = {
      placed: null, catalog: null, meshCount: -1, targetable: new Map(),
    };
    const timer = setInterval(() => {
      const camera = cameraRef.current;
      const mount = mountRef.current;
      const center = centerOfView();
      if (!camera || !mount || !center) return;

      if (heldProduct) {
        // Carrying: the ghost follows the crosshair
        updatePointer(center.x, center.y);
        if (walkTargetRef.current) setWalkTarget(null);
        return;
      }

      // Rugs and mats lie on the floor: never target them, so the crosshair reaches the furniture on top
      // Only rebuild when the scene items, placement list or catalog actually changed
      const meshes = itemMeshesRef.current;
      if (cache.placed !== placedItemsRef.current || cache.catalog !== catalogRef.current || cache.meshCount !== meshes.size) {
        const next = new Map<string, THREE.Group>();
        meshes.forEach((group, id) => {
          const placed = placedItemsRef.current.find(p => p.instanceId === id);
          const product = placed ? catalogRef.current.find(c => c.id === placed.productId) : undefined;
          const isFlat = product && (product.modelType === 'jute_rug' || (product.actualDimensions?.heightM ?? 1) <= 0.05);
          if (!isFlat) next.set(id, group);
        });
        cache.targetable = next;
        cache.placed = placedItemsRef.current;
        cache.catalog = catalogRef.current;
        cache.meshCount = meshes.size;
      }
      const targetable = cache.targetable;
      const hit = pickFurnitureHit(raycasterRef.current, camera, mount, center.x, center.y, targetable);
      const item = hit && hit.distance <= REACH_M
        ? placedItemsRef.current.find(p => p.instanceId === hit.instanceId) ?? null
        : null;
      if ((item?.instanceId ?? null) !== (walkTargetRef.current?.instanceId ?? null)) setWalkTarget(item);
    }, 80);
    return () => {
      clearInterval(timer);
      setWalkTarget(null);
    };
  }, [isWalkMode, isWalkInteract, heldProduct, cameraRef, mountRef, raycasterRef, itemMeshesRef, centerOfView, updatePointer, walkTargetRef, catalogRef, placedItemsRef]);

  /** F: toggle the free cursor. Nothing is picked up: moving furniture is R (crosshair) or drag (free cursor). */
  const onWalkAction = useCallback(() => {
    if (!isWalkModeRef.current || heldProduct) return;
    setIsWalkInteract(prev => !prev);
  }, [heldProduct, isWalkModeRef]);

  /** E (look mode): open the swap drawer for the targeted furniture. Returns true when handled. */
  const onWalkSwap = useCallback((): boolean => {
    if (!isWalkModeRef.current || isWalkInteractRef.current || heldProduct) return false;
    const item = walkTargetRef.current;
    if (!item || !onSwapItem) return true;
    swapPhaseRef.current = 'pending';
    onSwapItem(item);
    // The swap drawer needs a cursor until it closes
    setIsWalkInteract(true);
    return true;
  }, [heldProduct, onSwapItem, walkTargetRef, isWalkInteractRef, isWalkModeRef]);

  /** R (look mode): pick up the targeted furniture, or drop the carried one at the crosshair. Returns true when handled. */
  const onWalkMove = useCallback((): boolean => {
    if (!isWalkModeRef.current || isWalkInteractRef.current) return false;
    if (heldProduct) {
      handleDirectPlace(hoverTile ?? undefined);
      return true;
    }
    const item = walkTargetRef.current;
    if (item) handlePickupItem(item);
    return true;
  }, [heldProduct, hoverTile, handleDirectPlace, handlePickupItem, walkTargetRef, isWalkInteractRef, isWalkModeRef]);

  return { isWalkInteract, isWalkInteractRef, walkTarget, onWalkAction, onWalkSwap, onWalkMove };
}
