import { useCallback, useEffect } from 'react';
import * as THREE from 'three';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import {
  clampGridCoords,
  findNearestCenterSnap,
  getEffectiveFootprint,
  getEffectiveSnapStep,
  getTableSurfaceYUnder,
  gridToWorld,
  isSmallItem,
} from '../three/spatialMath';
import { clientToNdc, findFurnitureInstanceId } from '../three/pointerPicking';
import { isSurfaceItem, positionHoverIndicator } from '../three/sceneHelpers';
import type { SimsRoomRefs } from './useSimsRoomRefs';
import type { PlacementState } from './usePlacementState';
import type { useSimsCamera } from './useSimsCamera';

interface UseHeldPlacementPointerParams {
  refs: SimsRoomRefs;
  placement: PlacementState;
  cameraRef: ReturnType<typeof useSimsCamera>['cameraRef'];
  heldProduct: SimsProduct | null;
  placedItems: PlacedFurniture[];
  catalog: SimsProduct[];
  roomWidth: number;
  roomLength: number;
  handleDirectPlace: (targetTile?: { x: number; z: number }) => void;
}

/**
 * Turns pointer position into a snapped grid tile while an item is held (ghost, hover tile,
 * magnetic desk-centre snap, desk-surface elevation), or into a hover highlight when idle.
 * Also wires window-level drag-from-catalog-into-room drop support.
 */
export function useHeldPlacementPointer({
  refs,
  placement,
  cameraRef,
  heldProduct,
  placedItems,
  catalog,
  roomWidth,
  roomLength,
  handleDirectPlace,
}: UseHeldPlacementPointerParams) {
  const {
    mountRef,
    floorMeshRef,
    raycasterRef,
    itemMeshesRef,
    hoverIndicatorRef,
    ghostMeshRef,
    movingGroupRef,
    movingInstanceIdRef,
    isCopiedGroupRef,
  } = refs;
  const { heldRotation, snapStep, setHoverTile, setCenterSnapInfo, setHoveredInstanceId } = placement;

  // Pointer position calculation with parallax-free desk surface raycasting
  const updatePointer = useCallback((clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current || !floorMeshRef.current) return;

    raycasterRef.current.setFromCamera(clientToNdc(clientX, clientY, mountRef.current), cameraRef.current);

    // Idle: highlight furniture under the cursor
    if (!heldProduct) {
      const meshes = Array.from(itemMeshesRef.current.values());
      const hits = raycasterRef.current.intersectObjects(meshes, true);
      const hoveredId = hits.length > 0 ? findFurnitureInstanceId(hits[0].object, itemMeshesRef.current) : null;
      if (hoveredId) {
        setHoveredInstanceId(hoveredId);
        mountRef.current.style.cursor = 'pointer';
        return;
      }
      setHoveredInstanceId(null);
      mountRef.current.style.cursor = 'crosshair';
      return;
    }

    let pt: THREE.Vector3 | null = null;
    let targetSurfaceY = 0;
    let matchedDesk: PlacedFurniture | null = null;

    // Parallax resolution: When placing surface items, test desk geometry directly first
    if (isSurfaceItem(heldProduct)) {
      const deskObjects: THREE.Object3D[] = [];
      placedItems.forEach(item => {
        const prod = catalog.find(p => p.id === item.productId);
        if (prod?.category === 'desks' && item.instanceId !== movingInstanceIdRef.current) {
          const mesh = itemMeshesRef.current.get(item.instanceId);
          if (mesh && mesh.visible) deskObjects.push(mesh);
        }
      });

      if (deskObjects.length > 0) {
        const deskHits = raycasterRef.current.intersectObjects(deskObjects, true);
        if (deskHits.length > 0) {
          pt = deskHits[0].point;
          const deskId = findFurnitureInstanceId(deskHits[0].object, itemMeshesRef.current);
          const found = deskId ? placedItems.find(p => p.instanceId === deskId) : undefined;
          if (found) {
            matchedDesk = found;
            targetSurfaceY = getTableSurfaceYUnder(
              found.gridX,
              found.gridZ,
              1,
              1,
              placedItems,
              catalog,
              itemMeshesRef.current,
              found.instanceId
            ).surfaceY;
          }
        }
      }
    }

    // If didn't hit a desk mesh directly, intersect room floor
    if (!pt) {
      const floorIntersects = raycasterRef.current.intersectObject(floorMeshRef.current);
      if (floorIntersects.length > 0) {
        pt = floorIntersects[0].point;
      }
    }

    if (!pt) {
      if (hoverIndicatorRef.current) hoverIndicatorRef.current.visible = false;
      if (ghostMeshRef.current) ghostMeshRef.current.visible = false;
      setHoverTile(null);
      return;
    }

    const fp = getEffectiveFootprint(heldProduct, heldRotation);
    // Center furniture footprint on the pointer cursor and snap to step (0.125 for small items, or user snapStep)
    let targetGx = (pt.x + roomWidth / 2) - fp.width / 2;
    let targetGz = (pt.z + roomLength / 2) - fp.depth / 2;
    const effectiveStep = getEffectiveSnapStep(heldProduct, snapStep);
    const group = movingGroupRef.current;
    let gx: number, gz: number;

    if (group && group.items.length > 1) {
      // Multi-item group: clamp entire group bounding box inside room walls
      const minX = -group.minDeltaX;
      const maxX = roomWidth - group.maxDeltaX;
      const minZ = -group.minDeltaZ;
      const maxZ = roomLength - group.maxDeltaZ;

      targetGx = Math.max(minX, Math.min(maxX, targetGx));
      targetGz = Math.max(minZ, Math.min(maxZ, targetGz));

      gx = Math.round(targetGx / effectiveStep) * effectiveStep;
      gz = Math.round(targetGz / effectiveStep) * effectiveStep;

      gx = Math.max(minX, Math.min(maxX, Math.round(gx * 1000) / 1000));
      gz = Math.max(minZ, Math.min(maxZ, Math.round(gz * 1000) / 1000));
      setCenterSnapInfo({ isSnapped: false });
    } else {
      const clamped = clampGridCoords(targetGx, targetGz, fp.width, fp.depth, roomWidth, roomLength, effectiveStep);
      gx = clamped.x;
      gz = clamped.z;

      // Intelligent Magnetic Center Snap: perfectly centers chairs and monitors on desks
      // Small items (keyboards, mice, accessories) use a tighter threshold so corner/edge placement is effortless
      const snapThreshold = isSmallItem(heldProduct) ? 0.12 : 0.35;
      const snapResult = findNearestCenterSnap(
        gx,
        gz,
        fp,
        placedItems,
        catalog,
        movingInstanceIdRef.current,
        snapThreshold
      );

      if (snapResult.isSnapped) {
        gx = snapResult.x;
        gz = snapResult.z;
        setCenterSnapInfo({ isSnapped: true, targetDeskName: snapResult.targetDeskName });
      } else {
        setCenterSnapInfo({ isSnapped: false });
      }
    }

    // Dynamic physical desk surface elevation
    if (isSurfaceItem(heldProduct)) {
      const surfaceRes = getTableSurfaceYUnder(
        gx,
        gz,
        fp.width,
        fp.depth,
        placedItems,
        catalog,
        itemMeshesRef.current,
        matchedDesk?.instanceId,
        movingInstanceIdRef.current
      );
      if (surfaceRes.surfaceY > 0) {
        targetSurfaceY = surfaceRes.surfaceY;
      } else if (!matchedDesk) {
        targetSurfaceY = 0;
      }
    }

    setHoverTile({ x: gx, z: gz });

    const worldPos = gridToWorld(gx, gz, fp.width, fp.depth, roomWidth, roomLength);

    if (hoverIndicatorRef.current) {
      positionHoverIndicator(hoverIndicatorRef.current, {
        gx,
        gz,
        footprint: fp,
        group,
        roomWidth,
        roomLength,
        y: targetSurfaceY > 0 ? targetSurfaceY + 0.005 : 0.008,
      });

      const isOutOfBounds = (gx + fp.width > roomWidth) || (gz + fp.depth > roomLength);
      (hoverIndicatorRef.current.material as THREE.MeshBasicMaterial).color.setHex(isOutOfBounds ? 0xef4444 : 0x10b981);
    }

    if (ghostMeshRef.current) {
      ghostMeshRef.current.position.set(worldPos.x, targetSurfaceY, worldPos.z);
      ghostMeshRef.current.rotation.y = !group || group.items.length <= 1 ? (heldRotation * Math.PI) / 180 : 0;
      ghostMeshRef.current.visible = true;
    }
  }, [roomWidth, roomLength, heldProduct, heldRotation, snapStep, placedItems, catalog, cameraRef]);

  // Support direct drag-and-drop from the bottom furniture store shelf into the 3D room
  useEffect(() => {
    if (!heldProduct) return;

    let hasDraggedDistance = false;
    let initialPos: { x: number; y: number } | null = null;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!initialPos) {
        initialPos = { x: e.clientX, y: e.clientY };
      } else if (Math.hypot(e.clientX - initialPos.x, e.clientY - initialPos.y) > 10) {
        hasDraggedDistance = true;
      }
      updatePointer(e.clientX, e.clientY);
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (!mountRef.current) return;
      const target = e.target as HTMLElement | null;
      const isOverDock = Boolean(target?.closest('[data-catalog-dock="true"]'));
      const isOverSidebar = Boolean(target?.closest('aside'));
      const isOverHud = Boolean(target?.closest('[data-hud="true"]') || target?.closest('[role="dialog"]'));

      // If moving existing item, group, or copied items: do NOT auto-drop on drag release!
      // They are locked into Move Mode and wait for an intentional drop click!
      const isMovingOrCopy = Boolean(movingGroupRef.current || movingInstanceIdRef.current || isCopiedGroupRef.current);
      if (isMovingOrCopy) {
        return;
      }

      // If user dragged a NEW item away from the store into the 3D room: commit drop!
      if (hasDraggedDistance && !isOverDock && !isOverSidebar && !isOverHud) {
        handleDirectPlace();
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [heldProduct, updatePointer, handleDirectPlace]);

  return { updatePointer };
}
