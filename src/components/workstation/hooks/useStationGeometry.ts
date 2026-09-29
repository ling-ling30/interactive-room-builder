import { useEffect } from 'react';
import type { WorkstationConfig } from '../../../types/workstation';
import { clearGroup } from '../three/stationSetup';
import {
  buildAccessories,
  buildDesk,
  buildErgonomicsGuide,
  buildLightBar,
  buildMonitors,
  getStationDims,
} from '../three/stationBuilders';
import type { StationSceneRefs } from './useStationScene';

/** Rebuilds the desk, monitors, peripherals and ergonomics guide whenever the workstation config changes. */
export function useStationGeometry(config: WorkstationConfig, refs: StationSceneRefs) {
  const {
    sceneRef,
    movingDeskGroupRef,
    legsGroupRef,
    monitorsGroupRef,
    accessoriesGroupRef,
    ergonomicsGroupRef,
    tabletopMeshRef,
    deskLightRef,
  } = refs;

  useEffect(() => {
    if (!sceneRef.current || !movingDeskGroupRef.current || !legsGroupRef.current || !monitorsGroupRef.current || !accessoriesGroupRef.current) return;

    const movingGroup = movingDeskGroupRef.current;
    const legsGroup = legsGroupRef.current;
    const monitorsGroup = monitorsGroupRef.current;
    const accessoriesGroup = accessoriesGroupRef.current;
    const ergoGroup = ergonomicsGroupRef.current;

    // Clear previous children
    clearGroup(monitorsGroup);
    clearGroup(accessoriesGroup);
    clearGroup(legsGroup);
    if (ergoGroup) clearGroup(ergoGroup);

    const dims = getStationDims(config);

    tabletopMeshRef.current = buildDesk(config, dims, movingGroup, legsGroup);
    buildMonitors(config, dims, monitorsGroup);
    buildLightBar(config, dims, monitorsGroup, deskLightRef.current);
    buildAccessories(config, dims, accessoriesGroup);

    // Ergonomic Posture Alignment Guide Hologram
    if (config.showErgonomicsGuide && ergoGroup) {
      buildErgonomicsGuide(config, dims, ergoGroup);
    }
  }, [config, ergonomicsGroupRef, sceneRef, monitorsGroupRef, tabletopMeshRef, deskLightRef, legsGroupRef, accessoriesGroupRef, movingDeskGroupRef]);
}
