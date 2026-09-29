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
        map.delete(id);
      }
    });

    placedItems.forEach(item => {
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
      let safeSurfaceY = typeof item.surfaceY === 'number' && !isNaN(item.surfaceY) ? item.surfaceY : 0;
      const safeRotation = typeof item.rotation === 'number' && !isNaN(item.rotation) ? item.rotation : 0;

      const fp = getEffectiveFootprint(product, safeRotation);

      // Dynamically measure physical desk surface height so accessories never sink
      if (isSurfaceItem(product)) {
        const detected = getTableSurfaceYUnder(
          safeGridX,
          safeGridZ,
          fp.width,
          fp.depth,
          placedItems,
          catalog,
          map,
          item.mountedOnDeskId,
          item.instanceId
        );
        if (detected.surfaceY > 0) {
          safeSurfaceY = detected.surfaceY;
        }
      }

      const worldPos = gridToWorld(safeGridX, safeGridZ, fp.width, fp.depth, roomWidth, roomLength);

      group.position.set(worldPos.x, safeSurfaceY, worldPos.z);
      group.rotation.y = (safeRotation * Math.PI) / 180;

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
