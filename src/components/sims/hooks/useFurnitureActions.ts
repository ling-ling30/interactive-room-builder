import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import * as THREE from 'three';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import { sounds } from '../../../utils/soundEffects';
import {
  clampGridCoords,
  getEffectiveFootprint,
  getEffectiveSnapStep,
  getTableSurfaceYUnder,
  stepFurnitureRotation,
} from '../three/spatialMath';
import { isSurfaceItem, positionHoverIndicator } from '../three/sceneHelpers';
import type { MovingGroupItem } from '../simsRoomTypes';
import type { SimsRoomRefs } from './useSimsRoomRefs';
import type { PlacementState } from './usePlacementState';

interface UseFurnitureActionsParams {
  refs: SimsRoomRefs;
  placement: PlacementState;
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  heldProduct: SimsProduct | null;
  roomWidth: number;
  roomLength: number;
  selectedInstanceIds: string[];
  setSelectedInstanceIds: Dispatch<SetStateAction<string[]>>;
  onPlaceItem: (item: PlacedFurniture) => void;
  onUpdateItem: (instanceId: string, updates: Partial<PlacedFurniture>) => void;
  onDeleteItem: (instanceId: string) => void;
  onDeleteItems?: (instanceIds: string[]) => void;
  onCancelHeld: () => void;
  onPickupItem?: (product: SimsProduct, initialRotation: number) => void;
}

/** Pick up / cancel / drop / duplicate / delete / rotate flows for furniture. */
export function useFurnitureActions({
  refs,
  placement,
  catalog,
  placedItems,
  heldProduct,
  roomWidth,
  roomLength,
  selectedInstanceIds,
  setSelectedInstanceIds,
  onPlaceItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteItems,
  onCancelHeld,
  onPickupItem,
}: UseFurnitureActionsParams) {
  const {
    itemMeshesRef,
    hoverIndicatorRef,
    ghostMeshRef,
    movingGroupRef,
    movingInstanceIdRef,
    originBackupRef,
    isCopiedGroupRef,
    isDirectDraggingRef,
  } = refs;
  const { hoverTile, heldRotation, snapStep, setMovingGroupCount, setHeldRotation, setHoverTile } = placement;

  // Pick up single or multiple items as a coordinated group
  const handlePickupGroup = useCallback((groupItems: PlacedFurniture[], primaryItem: PlacedFurniture) => {
    if (groupItems.length === 0) return;
    sounds.playSelect();

    const primaryProd = catalog.find(p => p.id === primaryItem.productId);
    if (!primaryProd) return;

    const items: MovingGroupItem[] = [];
    let minDx = 0;
    let maxDx = 0;
    let minDz = 0;
    let maxDz = 0;

    groupItems.forEach(item => {
      const prod = catalog.find(p => p.id === item.productId);
      if (!prod) return;

      const dx = Math.round((item.gridX - primaryItem.gridX) * 1000) / 1000;
      const dz = Math.round((item.gridZ - primaryItem.gridZ) * 1000) / 1000;
      const itemFp = getEffectiveFootprint(prod, item.rotation);

      minDx = Math.min(minDx, dx);
      maxDx = Math.max(maxDx, dx + itemFp.width);
      minDz = Math.min(minDz, dz);
      maxDz = Math.max(maxDz, dz + itemFp.depth);

      // Hide original mesh in scene while moving
      const origMesh = itemMeshesRef.current.get(item.instanceId);
      if (origMesh) origMesh.visible = false;

      // Measure current live physical tabletop height if surface item so ghost mesh and group hold true height
      let liveSurfaceY = item.surfaceY ?? 0;
      let liveDeskId = item.mountedOnDeskId;
      if (isSurfaceItem(prod)) {
        const liveSurf = getTableSurfaceYUnder(
          item.gridX,
          item.gridZ,
          itemFp.width,
          itemFp.depth,
          placedItems,
          catalog,
          itemMeshesRef.current,
          item.mountedOnDeskId,
          item.instanceId,
          roomWidth,
          roomLength
        );
        if (liveSurf.surfaceY > 0) {
          liveSurfaceY = liveSurf.surfaceY;
          liveDeskId = liveSurf.deskId;
        }
      }

      items.push({
        instanceId: item.instanceId,
        product: prod,
        deltaGridX: dx,
        deltaGridZ: dz,
        rotation: item.rotation,
        color: item.color,
        surfaceY: liveSurfaceY,
        mountedOnDeskId: liveDeskId,
        originalItem: { ...item },
      });
    });

    movingGroupRef.current = {
      primaryInstanceId: primaryItem.instanceId,
      primaryProduct: primaryProd,
      items,
      minDeltaX: minDx,
      maxDeltaX: maxDx,
      minDeltaZ: minDz,
      maxDeltaZ: maxDz,
    };

    movingInstanceIdRef.current = primaryItem.instanceId;
    originBackupRef.current = { ...primaryItem };
    setMovingGroupCount(items.length);
    setHeldRotation(primaryItem.rotation);

    // Lock initial tile coordinates to primaryItem's grid location so items never vanish
    setHoverTile({ x: primaryItem.gridX, z: primaryItem.gridZ });

    if (hoverIndicatorRef.current) {
      positionHoverIndicator(hoverIndicatorRef.current, {
        gx: primaryItem.gridX,
        gz: primaryItem.gridZ,
        footprint: getEffectiveFootprint(primaryProd, primaryItem.rotation),
        group: movingGroupRef.current,
        roomWidth,
        roomLength,
        y: (primaryItem.surfaceY || 0) + 0.008,
      });
      (hoverIndicatorRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
    }

    if (onPickupItem) {
      onPickupItem(primaryProd, primaryItem.rotation);
    }
    setSelectedInstanceIds([]);
  }, [catalog, onPickupItem, roomWidth, roomLength]);

  // Move / pick up a single existing placed item back into hand
  const handlePickupItem = useCallback((item: PlacedFurniture) => {
    handlePickupGroup([item], item);
  }, [handlePickupGroup]);

  // Safe reversion on cancel (Esc / Cancel button)
  const handleCancelPlacement = useCallback(() => {
    const group = movingGroupRef.current;
    if (group) {
      if (isCopiedGroupRef.current) {
        // If user copied items and cancelled before dropping, clean up duplicate items
        const idsToDelete = group.items.map(i => i.instanceId);
        if (onDeleteItems) {
          onDeleteItems(idsToDelete);
        } else {
          idsToDelete.forEach(id => onDeleteItem(id));
        }
      } else {
        group.items.forEach(it => {
          onUpdateItem(it.instanceId, it.originalItem);
          const origMesh = itemMeshesRef.current.get(it.instanceId);
          if (origMesh) origMesh.visible = true;
        });
      }
      movingGroupRef.current = null;
      movingInstanceIdRef.current = null;
      originBackupRef.current = null;
      setMovingGroupCount(1);
    } else if (movingInstanceIdRef.current) {
      const movingId = movingInstanceIdRef.current;
      const backup = originBackupRef.current;
      if (backup) {
        onUpdateItem(movingId, backup);
      }
      const origMesh = itemMeshesRef.current.get(movingId);
      if (origMesh) origMesh.visible = true;

      movingInstanceIdRef.current = null;
      originBackupRef.current = null;
    }
    isCopiedGroupRef.current = false;
    isDirectDraggingRef.current = false;
    onCancelHeld();
    setSelectedInstanceIds([]);
  }, [onCancelHeld, onUpdateItem, onDeleteItems, onDeleteItem]);

  // Resolve the desk surface height a held/placed item should rest on
  const resolveSurface = useCallback((
    product: SimsProduct,
    gx: number,
    gz: number,
    fp: { width: number; depth: number },
    ignoreInstanceId?: string
  ) => {
    if (!isSurfaceItem(product)) return { surfaceY: 0, mountedOnDeskId: undefined as string | undefined };
    const res = getTableSurfaceYUnder(
      gx,
      gz,
      fp.width,
      fp.depth,
      placedItems,
      catalog,
      itemMeshesRef.current,
      undefined,
      ignoreInstanceId,
      roomWidth,
      roomLength
    );
    return res.surfaceY > 0
      ? { surfaceY: res.surfaceY, mountedOnDeskId: res.deskId as string | undefined }
      : { surfaceY: 0, mountedOnDeskId: undefined as string | undefined };
  }, [placedItems, catalog, roomWidth, roomLength]);

  // Direct drop / commit placement handler
  const handleDirectPlace = useCallback((targetTile?: { x: number; z: number }) => {
    const tile = targetTile || hoverTile;
    if (!heldProduct || !tile) return;

    // Moving existing item(s) as a group or single
    const group = movingGroupRef.current;
    if (group && group.items.length > 0) {
      sounds.playPlace();
      const movedIds: string[] = [];

      group.items.forEach(it => {
        const itGx = Math.round((tile.x + it.deltaGridX) * 1000) / 1000;
        const itGz = Math.round((tile.z + it.deltaGridZ) * 1000) / 1000;
        const itFp = getEffectiveFootprint(it.product, it.rotation);

        let finalSurfaceY = it.surfaceY ?? 0;
        let finalMountedDeskId = it.mountedOnDeskId;

        if (isSurfaceItem(it.product)) {
          // Check if a desk in this moving group is underneath this accessory
          const deskInGroup = group.items.find(g => g.product.category === 'desks');
          if (deskInGroup) {
            const deskProd = deskInGroup.product;
            const deskMesh = itemMeshesRef.current.get(deskInGroup.instanceId);
            let deskH = deskProd.actualDimensions?.heightM ?? (deskProd.heightCm ? deskProd.heightCm / 100 : 0.74);
            if (deskMesh) {
              deskMesh.updateWorldMatrix(true, true);
              const b = new THREE.Box3().setFromObject(deskMesh);
              if (isFinite(b.max.y) && b.max.y > 0.3) {
                deskH = Math.round(b.max.y * 1000) / 1000;
              }
            }
            finalSurfaceY = deskH;
            finalMountedDeskId = deskInGroup.instanceId;
          } else {
            const surf = resolveSurface(it.product, itGx, itGz, itFp, it.instanceId);
            finalSurfaceY = surf.surfaceY;
            finalMountedDeskId = surf.mountedOnDeskId;
          }
        }

        onUpdateItem(it.instanceId, {
          gridX: itGx,
          gridZ: itGz,
          // A single moved item takes the held rotation (also changed by the Numpad shortcuts)
          rotation: group.items.length === 1 ? heldRotation : it.rotation,
          surfaceY: finalSurfaceY,
          mountedOnDeskId: finalMountedDeskId,
        });

        const origMesh = itemMeshesRef.current.get(it.instanceId);
        if (origMesh) origMesh.visible = true;

        movedIds.push(it.instanceId);
      });

      movingGroupRef.current = null;
      movingInstanceIdRef.current = null;
      originBackupRef.current = null;
      isCopiedGroupRef.current = false;
      isDirectDraggingRef.current = false;
      setMovingGroupCount(1);
      onCancelHeld();
      setSelectedInstanceIds(movedIds);
      return;
    }

    const fp = getEffectiveFootprint(heldProduct, heldRotation);
    const effectiveStep = getEffectiveSnapStep(heldProduct, snapStep);
    const { x: gx, z: gz } = clampGridCoords(tile.x, tile.z, fp.width, fp.depth, roomWidth, roomLength, effectiveStep);

    if (movingInstanceIdRef.current) {
      const movingId = movingInstanceIdRef.current;
      movingInstanceIdRef.current = null;
      originBackupRef.current = null;

      const { surfaceY, mountedOnDeskId } = resolveSurface(heldProduct, gx, gz, fp, movingId);
      onUpdateItem(movingId, { gridX: gx, gridZ: gz, rotation: heldRotation, surfaceY, mountedOnDeskId });

      const origMesh = itemMeshesRef.current.get(movingId);
      if (origMesh) origMesh.visible = true;

      sounds.playPlace();
      isCopiedGroupRef.current = false;
      isDirectDraggingRef.current = false;
      setSelectedInstanceIds([movingId]);
      onCancelHeld();
      return;
    }

    // Placing a brand new item (dragging new from catalog)
    isCopiedGroupRef.current = false;
    isDirectDraggingRef.current = false;
    const { surfaceY, mountedOnDeskId } = resolveSurface(heldProduct, gx, gz, fp);

    const newPlaced: PlacedFurniture = {
      instanceId: `inst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: heldProduct.id,
      gridX: gx,
      gridZ: gz,
      rotation: heldRotation,
      color: heldProduct.color,
      surfaceY,
      mountedOnDeskId,
    };

    sounds.playPlace();
    onPlaceItem(newPlaced);
    setSelectedInstanceIds([newPlaced.instanceId]);
    onCancelHeld();
  }, [hoverTile, heldProduct, heldRotation, roomWidth, roomLength, snapStep, placedItems, catalog, onPlaceItem, onUpdateItem, onCancelHeld, resolveSurface]);

  // Duplicate selected item(s) together and immediately enter Move Mode
  const duplicateSelected = useCallback(() => {
    if (selectedInstanceIds.length === 0) return;
    const itemsToDuplicate = placedItems.filter(p => selectedInstanceIds.includes(p.instanceId));
    if (itemsToDuplicate.length === 0) return;

    sounds.playPlace();
    const idMap = new Map<string, string>();

    itemsToDuplicate.forEach((item, idx) => {
      idMap.set(item.instanceId, `inst-${Date.now()}-${Math.floor(Math.random() * 10000)}-${idx}`);
    });

    const newPlacedItems: PlacedFurniture[] = [];

    itemsToDuplicate.forEach((item) => {
      const prod = catalog.find(p => p.id === item.productId);
      if (!prod) return;

      const newPlaced: PlacedFurniture = {
        instanceId: idMap.get(item.instanceId)!,
        productId: prod.id,
        gridX: item.gridX,
        gridZ: item.gridZ,
        rotation: item.rotation,
        color: item.color,
        surfaceY: item.surfaceY,
        mountedOnDeskId: item.mountedOnDeskId && idMap.has(item.mountedOnDeskId)
          ? idMap.get(item.mountedOnDeskId)
          : item.mountedOnDeskId,
      };

      onPlaceItem(newPlaced);
      newPlacedItems.push(newPlaced);
    });

    isCopiedGroupRef.current = true;
    isDirectDraggingRef.current = false;
    // Automatically enter move mode with newly copied items, waiting for drop click!
    handlePickupGroup(newPlacedItems, newPlacedItems[0]);
  }, [selectedInstanceIds, placedItems, catalog, onPlaceItem, handlePickupGroup]);

  // Delete selected item(s) together atomically
  const deleteSelected = useCallback(() => {
    if (selectedInstanceIds.length === 0) return;
    sounds.playDelete();
    if (onDeleteItems) {
      onDeleteItems(selectedInstanceIds);
    } else {
      selectedInstanceIds.forEach(id => onDeleteItem(id));
    }
    setSelectedInstanceIds([]);
  }, [selectedInstanceIds, onDeleteItems, onDeleteItem]);

  // Rotate the held item (and every member of a moving group) one step; plays the rotate sound
  // Latest held rotation, so rapid presses and re-renders never step from a stale value.
  // The group / ghost mutation must live outside the state updater: updaters can run twice
  // (StrictMode), which stepped moving-group items two times and left the dropped item rotated wrongly.
  const heldRotationRef = useRef(heldRotation);
  heldRotationRef.current = heldRotation;

  const stepHeldRotation = useCallback((dir: 'cw' | 'ccw') => {
    sounds.playRotate();
    const nextRot = stepFurnitureRotation(heldRotationRef.current, dir);
    heldRotationRef.current = nextRot;
    setHeldRotation(nextRot);

    const group = movingGroupRef.current;
    if (group) {
      group.items.forEach(it => {
        it.rotation = stepFurnitureRotation(it.rotation, dir);
      });
      if (ghostMeshRef.current) {
        ghostMeshRef.current.children.forEach((child, idx) => {
          const it = group.items[idx];
          if (it) {
            child.rotation.y = (it.rotation * Math.PI) / 180;
          }
        });
      }
    }
  }, []);

  return {
    handlePickupGroup,
    handlePickupItem,
    handleCancelPlacement,
    handleDirectPlace,
    duplicateSelected,
    deleteSelected,
    stepHeldRotation,
  };
}
