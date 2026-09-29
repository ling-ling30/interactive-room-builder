import { useEffect } from 'react';
import * as THREE from 'three';
import type { SimsProduct } from '../../../data/simsCatalog';
import { createFurnitureMesh } from '../Sims3DModels';
import { getEffectiveFootprint, gridToWorld } from '../three/spatialMath';
import { makeGhostTranslucent, positionHoverIndicator } from '../three/sceneHelpers';
import type { SimsRoomRefs } from './useSimsRoomRefs';

interface UseGhostMeshParams {
  refs: SimsRoomRefs;
  heldProduct: SimsProduct | null;
  heldRotation: number;
  hoverTile: { x: number; z: number } | null;
  roomWidth: number;
  roomLength: number;
}

/** Builds the translucent preview mesh (single item or composite group) for the held product. */
export function useGhostMesh({ refs, heldProduct, heldRotation, hoverTile, roomWidth, roomLength }: UseGhostMeshParams) {
  const { sceneRef, ghostMeshRef, hoverIndicatorRef, movingGroupRef, originBackupRef } = refs;

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (ghostMeshRef.current) {
      scene.remove(ghostMeshRef.current);
      ghostMeshRef.current = null;
    }

    if (!heldProduct) return;

    const rootGhost = new THREE.Group();
    rootGhost.name = '__ghost_mesh_root__';

    let initGx = hoverTile?.x;
    let initGz = hoverTile?.z;
    let initSurfaceY = 0;

    const group = movingGroupRef.current;
    if (group && group.items.length > 0) {
      const prim = group.items[0];
      if (initGx === undefined) initGx = prim.originalItem.gridX;
      if (initGz === undefined) initGz = prim.originalItem.gridZ;
      initSurfaceY = prim.surfaceY || 0;
    } else if (originBackupRef.current) {
      if (initGx === undefined) initGx = originBackupRef.current.gridX;
      if (initGz === undefined) initGz = originBackupRef.current.gridZ;
      initSurfaceY = originBackupRef.current.surfaceY || 0;
    }

    if (group && group.items.length > 1) {
      // Multi-item composite ghost group
      const primaryFp = getEffectiveFootprint(group.primaryProduct, heldRotation);

      group.items.forEach(it => {
        const itemFp = getEffectiveFootprint(it.product, it.rotation);
        const childMesh = createFurnitureMesh(it.product, it.color);

        const relX = it.deltaGridX + (itemFp.width - primaryFp.width) / 2;
        const relZ = it.deltaGridZ + (itemFp.depth - primaryFp.depth) / 2;
        const relY = (it.surfaceY ?? 0) - (group.items[0].surfaceY ?? 0);

        childMesh.position.set(relX, relY, relZ);
        childMesh.rotation.y = (it.rotation * Math.PI) / 180;
        makeGhostTranslucent(childMesh);
        rootGhost.add(childMesh);
      });
    } else {
      const ghost = createFurnitureMesh(heldProduct);
      makeGhostTranslucent(ghost);
      rootGhost.add(ghost);
    }

    if (initGx !== undefined && initGz !== undefined) {
      const fp = getEffectiveFootprint(heldProduct, heldRotation);
      const worldPos = gridToWorld(initGx, initGz, fp.width, fp.depth, roomWidth, roomLength);
      rootGhost.position.set(worldPos.x, initSurfaceY, worldPos.z);
      rootGhost.rotation.y = !group || group.items.length <= 1 ? (heldRotation * Math.PI) / 180 : 0;
      rootGhost.visible = true;

      if (hoverIndicatorRef.current) {
        positionHoverIndicator(hoverIndicatorRef.current, {
          gx: initGx,
          gz: initGz,
          footprint: fp,
          group,
          roomWidth,
          roomLength,
          y: initSurfaceY + 0.008,
        });
        (hoverIndicatorRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
      }
    } else {
      rootGhost.position.set(0, -999, 0);
      rootGhost.visible = false;
    }

    scene.add(rootGhost);
    ghostMeshRef.current = rootGhost;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldProduct, heldRotation, roomWidth, roomLength]);
}
