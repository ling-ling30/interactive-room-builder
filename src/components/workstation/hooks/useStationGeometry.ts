import { useEffect } from 'react';
import type { WorkstationConfig } from '../../../types/workstation';
import { clearGroup } from '../three/stationSetup';
import {
  buildAccessories,
  buildChair,
  buildDesk,
  buildLightBar,
  buildMonitors,
  getStationDims,
} from '../three/stationBuilders';
import type { StationSceneRefs } from './useStationScene';

/** Rebuilds the desk, chair, monitors, peripherals, and lamp whenever the workstation config changes. */
export function useStationGeometry(config: WorkstationConfig, refs: StationSceneRefs) {
  const {
    sceneRef,
    movingDeskGroupRef,
    legsGroupRef,
    monitorsGroupRef,
    accessoriesGroupRef,
    chairGroupRef,
    tabletopMeshRef,
    deskLightRef,
  } = refs;

  useEffect(() => {
    if (
      !sceneRef.current ||
      !movingDeskGroupRef.current ||
      !legsGroupRef.current ||
      !monitorsGroupRef.current ||
      !accessoriesGroupRef.current ||
      !chairGroupRef.current
    )
      return;

    const movingGroup = movingDeskGroupRef.current;
    const legsGroup = legsGroupRef.current;
    const monitorsGroup = monitorsGroupRef.current;
    const accessoriesGroup = accessoriesGroupRef.current;
    const chairGroup = chairGroupRef.current;

    // Clear previous children
    clearGroup(monitorsGroup);
    clearGroup(accessoriesGroup);
    clearGroup(legsGroup);
    clearGroup(chairGroup);

    const dims = getStationDims(config);

    tabletopMeshRef.current = buildDesk(config, dims, movingGroup, legsGroup);
    buildChair(config, dims, chairGroup);
    buildMonitors(config, dims, monitorsGroup);
    buildLightBar(config, dims, monitorsGroup, deskLightRef.current);
    buildAccessories(config, dims, accessoriesGroup);
  }, [
    config,
    sceneRef,
    monitorsGroupRef,
    tabletopMeshRef,
    deskLightRef,
    legsGroupRef,
    accessoriesGroupRef,
    chairGroupRef,
    movingDeskGroupRef,
  ]);
}
