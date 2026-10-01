import { useEffect } from 'react';
import * as THREE from 'three';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import { createFurnitureMesh } from '../Sims3DModels';
import { getEffectiveFootprint, getTableSurfaceYUnder, gridToWorld } from '../three/spatialMath';
import { disposeMeshes, isSurfaceItem, setSelectionEmissive } from '../three/sceneHelpers';
import type { SimsRoomRefs } from './useSimsRoomRefs';

interface UsePlacedItemsSyncParams {
  refs: SimsRoomRefs;
  placedItems: PlacedFurniture[];
  catalog: SimsProduct[];
  selectedInstanceIds: string[];
  sceneReady: number;
  bumpSceneReady: () => void;
  roomWidth: number;
  roomLength: number;
}

/** Mirrors `placedItems` into Three.js meshes, highlights the selection and parks the plumbob. */
export function usePlacedItemsSync({
  refs,
  placedItems,
  catalog,
  selectedInstanceIds,
  sceneReady,
  bumpSceneReady,
  roomWidth,
  roomLength,
}: UsePlacedItemsSyncParams) {
  const { sceneRef, itemMeshesRef, itemMeshSignatureMapRef, movingInstanceIdRef, movingGroupRef, plumbobRef, plumbobBaseYRef } = refs;

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const map = itemMeshesRef.current;

    const activeIds = new Set(placedItems.map(p => p.instanceId));
    map.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        disposeMeshes(mesh);
        map.delete(id);
      }
    });

    const isDeskPad = (prod: SimsProduct) =>
      prod.id === 'acc-felt-deskpad' || prod.id.includes('mat') || prod.id.includes('pad') ||
      prod.name.toLowerCase().includes('mat') || prod.name.toLowerCase().includes('pad');

    // Partition items into 3 deterministic passes:
    // Pass 1: Base floor furniture (desks, tables, chairs, rugs, cabinets, plants)
    // Pass 2: Desk mats / pads
    // Pass 3: Surface accessories (keyboards, mice, monitors, lamps, mugs)
    const baseItems: PlacedFurniture[] = [];
    const matItems: PlacedFurniture[] = [];
    const surfaceItems: PlacedFurniture[] = [];

    placedItems.forEach(item => {
      const prod = catalog.find(p => p.id === item.productId);
      if (!prod) return;
      if (!isSurfaceItem(prod)) {
        baseItems.push(item);
      } else if (isDeskPad(prod)) {
        matItems.push(item);
      } else {
        surfaceItems.push(item);
      }
    });

    const orderedItems = [...baseItems, ...matItems, ...surfaceItems];

    orderedItems.forEach(item => {
      const product = catalog.find(p => p.id === item.productId);
      if (!product) return;

      const sig = `${item.productId}_${product.modelUrl || ''}_${item.color || ''}_${product.modelType}`;
      let group = map.get(item.instanceId);

      // If product 3D model or color changed, remove old mesh and re-instantiate
      if (group && itemMeshSignatureMapRef.current.get(item.instanceId) !== sig) {
        scene.remove(group);
        disposeMeshes(group);
        map.delete(item.instanceId);
        group = undefined;
      }

      if (!group) {
        group = createFurnitureMesh(product, item.color, bumpSceneReady);
        group.name = item.instanceId;
        scene.add(group);
        map.set(item.instanceId, group);
        itemMeshSignatureMapRef.current.set(item.instanceId, sig);
      } else if (group.parent !== scene) {
        scene.add(group);
      }

      const isBeingMoved = movingInstanceIdRef.current === item.instanceId ||
        Boolean(movingGroupRef.current?.items.some(it => it.instanceId === item.instanceId));
      group.visible = !isBeingMoved;

      const safeGridX = typeof item.gridX === 'number' && !isNaN(item.gridX) ? item.gridX : 0;
      const safeGridZ = typeof item.gridZ === 'number' && !isNaN(item.gridZ) ? item.gridZ : 0;
      let safeSurfaceY = 0;
      const safeRotation = typeof item.rotation === 'number' && !isNaN(item.rotation) ? item.rotation : 0;

      const fp = getEffectiveFootprint(product, safeRotation);

      // Floor furniture (desks, tables, chairs, bookshelves, rugs, plants) ALWAYS rests flat on the floor (Y = 0).
      // Only surface items (items resting ON a desk/table, like laptops, monitors, mousepads, lamps) use surfaceY.
      if (isSurfaceItem(product)) {
        safeSurfaceY = typeof item.surfaceY === 'number' && !isNaN(item.surfaceY) ? item.surfaceY : 0;
        const detected = getTableSurfaceYUnder(
          safeGridX,
          safeGridZ,
          fp.width,
          fp.depth,
          placedItems,
          catalog,
          map,
          item.mountedOnDeskId,
          item.instanceId,
          roomWidth,
          roomLength
        );
        if (detected.surfaceY > 0) {
          safeSurfaceY = detected.surfaceY;
        }
      } else {
        safeSurfaceY = 0;
      }

      const worldPos = gridToWorld(safeGridX, safeGridZ, fp.width, fp.depth, roomWidth, roomLength);

      group.position.set(worldPos.x, safeSurfaceY, worldPos.z);
      group.rotation.y = (safeRotation * Math.PI) / 180;
      group.updateMatrixWorld(true);

      setSelectionEmissive(group, selectedInstanceIds.includes(item.instanceId));
    });

    // Update Plumbob position over selected furniture
    if (plumbobRef.current) {
      const lastId = selectedInstanceIds[selectedInstanceIds.length - 1];
      const selGroup = lastId ? map.get(lastId) : undefined;
      if (selGroup) {
        const b = new THREE.Box3().setFromObject(selGroup);
        const topY = isFinite(b.max.y) && b.max.y > -900 ? b.max.y : (selGroup.position.y + 0.6);

        plumbobBaseYRef.current = topY + 0.16;
        plumbobRef.current.position.set(selGroup.position.x, plumbobBaseYRef.current, selGroup.position.z);
        plumbobRef.current.visible = true;
      } else {
        plumbobRef.current.visible = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneReady, placedItems, catalog, selectedInstanceIds, roomWidth, roomLength]);
}
