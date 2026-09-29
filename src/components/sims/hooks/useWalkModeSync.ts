import { useEffect, type MutableRefObject } from 'react';
import type { useSimsCamera } from './useSimsCamera';

type CameraApi = ReturnType<typeof useSimsCamera>;

interface UseWalkModeSyncParams {
  camera: Pick<CameraApi, 'isWalkMode' | 'toggleWalkMode' | 'eyeHeight' | 'setEyeHeight' | 'getHeading'>;
  roomWidthRef: MutableRefObject<number>;
  roomLengthRef: MutableRefObject<number>;
  eyeHeight?: number;
  walkToggleTrigger: number;
  onWalkModeChange?: (isWalk: boolean) => void;
  onSetEyeHeight?: (h: number) => void;
}

/** Keeps walk mode, eye height, compass heading and the external toggle in sync with the parent. */
export function useWalkModeSync({
  camera: { isWalkMode, toggleWalkMode, eyeHeight, setEyeHeight },
  roomWidthRef,
  roomLengthRef,
  eyeHeight: propEyeHeight,
  walkToggleTrigger,
  onWalkModeChange,
  onSetEyeHeight,
}: UseWalkModeSyncParams) {
  // Synchronize walk mode with parent container
  useEffect(() => {
    onWalkModeChange?.(isWalkMode);
  }, [isWalkMode, onWalkModeChange]);

  // Synchronize eyeHeight with parent
  useEffect(() => {
    if (propEyeHeight !== undefined && Math.abs(propEyeHeight - eyeHeight) > 0.05) {
      setEyeHeight(propEyeHeight);
    }
  }, [propEyeHeight, eyeHeight, setEyeHeight]);

  useEffect(() => {
    onSetEyeHeight?.(eyeHeight);
  }, [eyeHeight, onSetEyeHeight]);

  // Respond to external walk toggle trigger from top navigation
  useEffect(() => {
    if (walkToggleTrigger && walkToggleTrigger > 0) {
      toggleWalkMode(roomWidthRef.current, roomLengthRef.current);
    }
  }, [walkToggleTrigger, toggleWalkMode, roomLengthRef, roomWidthRef]);
}
