import { useCallback, useState } from 'react';
import { sounds } from '../../../utils/soundEffects';
import type { CenterSnapInfo, SnapStep } from '../simsRoomTypes';

const NEXT_SNAP: Record<SnapStep, SnapStep> = { 0.125: 0.25, 0.25: 0.5, 0.5: 1.0, 1.0: 0.125 };

/** React state for the "held item" placement flow (hover tile, rotation, snap step, hover hint). */
export function usePlacementState() {
  const [movingGroupCount, setMovingGroupCount] = useState<number>(1);
  /** True while an already placed item (or group) is being carried, as opposed to a new one from the store. */
  const [isMovingExisting, setIsMovingExisting] = useState<boolean>(false);
  const [hoverTile, setHoverTile] = useState<{ x: number; z: number } | null>(null);
  const [heldRotation, setHeldRotation] = useState<number>(0);
  const [snapStep, setSnapStep] = useState<SnapStep>(0.25);
  const [centerSnapInfo, setCenterSnapInfo] = useState<CenterSnapInfo>({ isSnapped: false });
  const [hoveredInstanceId, setHoveredInstanceId] = useState<string | null>(null);

  const toggleSnapStep = useCallback(() => {
    sounds.playRotate();
    setSnapStep(prev => NEXT_SNAP[prev]);
  }, []);

  return {
    movingGroupCount,
    setMovingGroupCount,
    isMovingExisting,
    setIsMovingExisting,
    hoverTile,
    setHoverTile,
    heldRotation,
    setHeldRotation,
    snapStep,
    centerSnapInfo,
    setCenterSnapInfo,
    hoveredInstanceId,
    setHoveredInstanceId,
    toggleSnapStep,
  };
}

export type PlacementState = ReturnType<typeof usePlacementState>;
