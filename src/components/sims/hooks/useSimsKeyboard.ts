import { useEffect, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import { sounds } from '../../../utils/soundEffects';
import { stepFurnitureRotation } from '../three/spatialMath';
import type { SimsRoomRefs } from './useSimsRoomRefs';
import type { PlacementState } from './usePlacementState';
import type { useSimsCamera } from './useSimsCamera';

const WALK_KEY_CODES = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// Optional Numpad 1–9 quick cardinal orientation shortcuts
const NUMPAD_9_MAP: Record<string, number> = {
  Numpad7: 315, // NW
  Numpad8: 0,   // N
  Numpad9: 45,  // NE
  Numpad4: 270, // W
  Numpad5: 0,   // Reset Front
  Numpad6: 90,  // E
  Numpad1: 225, // SW
  Numpad2: 180, // S
  Numpad3: 135, // SE
};

type CameraApi = ReturnType<typeof useSimsCamera>;

interface UseSimsKeyboardParams {
  refs: SimsRoomRefs;
  placement: PlacementState;
  camera: Pick<CameraApi, 'rotateStep' | 'toggleWalkMode'>;
  heldProduct: SimsProduct | null;
  placedItems: PlacedFurniture[];
  selectedInstanceIds: string[];
  setSelectedInstanceIds: Dispatch<SetStateAction<string[]>>;
  isWalkModeRef: MutableRefObject<boolean>;
  isPanModeRef: MutableRefObject<boolean>;
  setIsPanMode: Dispatch<SetStateAction<boolean>>;
  roomWidthRef: MutableRefObject<number>;
  roomLengthRef: MutableRefObject<number>;
  onUpdateItem: (instanceId: string, updates: Partial<PlacedFurniture>) => void;
  handleCancelPlacement: () => void;
  handlePickupGroup: (groupItems: PlacedFurniture[], primaryItem: PlacedFurniture) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  /** F key while walking: toggle the free-cursor interact mode. */
  onWalkAction: () => void;
  /** E while walking (look mode): swap the furniture under the crosshair. Returns true when handled. */
  onWalkSwap: () => boolean;
  /** R while walking (look mode): pick up / drop furniture at the crosshair. Returns true when handled. */
  onWalkMove: () => boolean;
  /** Rotates held item(s); shared with the on-screen rotate buttons. */
  stepHeldRotation: (dir: 'cw' | 'ccw') => void;
}

/**
 * Keyboard shortcuts: R rotate (Shift+R CCW), M move, Esc revert, Del remove, Ctrl+D / + duplicate,
 * G snap step, Space/H pan, Q/E orbit step, Numpad 1–9 orientation, WASD/arrows/Shift walk mode.
 * Returns the currently pressed walk keys so the walk HUD can highlight them.
 */
export function useSimsKeyboard({
  refs,
  placement,
  camera: { rotateStep, toggleWalkMode },
  heldProduct,
  placedItems,
  selectedInstanceIds,
  setSelectedInstanceIds,
  isWalkModeRef,
  isPanModeRef,
  setIsPanMode,
  roomWidthRef,
  roomLengthRef,
  onUpdateItem,
  handleCancelPlacement,
  handlePickupGroup,
  duplicateSelected,
  deleteSelected,
  onWalkAction,
  onWalkSwap,
  onWalkMove,
  stepHeldRotation,
}: UseSimsKeyboardParams) {
  const { mountRef, keysRef, isSpacePressedRef } = refs;
  const { setHeldRotation, toggleSnapStep } = placement;
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const isTextInput = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      return Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isTextInput(e);

      // Walk Mode WASD & Arrow Key Tracking (including Shift for Sprint)
      if (isWalkModeRef.current && !isInput) {
        if (WALK_KEY_CODES.includes(e.code)) {
          keysRef.current[e.code] = true;
          setActiveKeys({ ...keysRef.current });
        }
        if (e.key === 'Escape') {
          if (heldProduct) {
            handleCancelPlacement();
            return;
          }
          toggleWalkMode(roomWidthRef.current, roomLengthRef.current);
          return;
        }
        if ((e.key === 'e' || e.key === 'E') && !e.repeat && onWalkSwap()) {
          e.preventDefault();
          return;
        }
        if ((e.key === 'r' || e.key === 'R') && !e.repeat && onWalkMove()) {
          e.preventDefault();
          return;
        }
        if ((e.key === 'f' || e.key === 'F') && !e.repeat) {
          e.preventDefault();
          onWalkAction();
          return;
        }
      }

      // Hold Ctrl to pan the camera (same modifier state as Space)
      if (e.key === 'Control' && !e.repeat && !isInput) {
        isSpacePressedRef.current = true;
        if (mountRef.current) mountRef.current.style.cursor = 'grab';
        return;
      }

      if (e.code === 'Space' && !e.repeat && !isInput) {
        e.preventDefault();
        isSpacePressedRef.current = true;
        if (mountRef.current) mountRef.current.style.cursor = 'grab';
        return;
      }

      if ((e.key === 'h' || e.key === 'H') && !isInput) {
        setIsPanMode(prev => !prev);
        return;
      }

      // Q and E camera angle step rotation (9-direction orbit)
      if (!isWalkModeRef.current && !isInput && !heldProduct && selectedInstanceIds.length === 0) {
        if (e.key === 'q' || e.key === 'Q') {
          sounds.playSelect();
          rotateStep('left');
          return;
        }
        if (e.key === 'e' || e.key === 'E') {
          sounds.playSelect();
          rotateStep('right');
          return;
        }
      }

      if (!isWalkModeRef.current && !isInput && (heldProduct || selectedInstanceIds.length > 0) && NUMPAD_9_MAP[e.code] !== undefined) {
        e.preventDefault();
        const targetAngle = NUMPAD_9_MAP[e.code];
        sounds.playRotate();
        if (heldProduct) {
          setHeldRotation(targetAngle);
        } else {
          selectedInstanceIds.forEach(id => {
            onUpdateItem(id, { rotation: targetAngle });
          });
        }
        return;
      }

      // 'R' - Rotate item by 5° step (Shift+R for CCW -5°)
      if ((e.key === 'r' || e.key === 'R') && !isInput) {
        e.preventDefault();
        const stepDir = e.shiftKey ? 'ccw' : 'cw';
        if (heldProduct) {
          stepHeldRotation(stepDir);
        } else if (selectedInstanceIds.length > 0) {
          sounds.playRotate();
          selectedInstanceIds.forEach(id => {
            const item = placedItems.find(p => p.instanceId === id);
            if (item) {
              onUpdateItem(id, { rotation: stepFurnitureRotation(item.rotation, stepDir) });
            }
          });
        }
      } else if ((e.key === 'm' || e.key === 'M') && !isInput && !heldProduct) {
        if (selectedInstanceIds.length > 0) {
          e.preventDefault();
          const itemsToMove = placedItems.filter(p => selectedInstanceIds.includes(p.instanceId));
          if (itemsToMove.length > 0) {
            handlePickupGroup(itemsToMove, itemsToMove[0]);
          }
        }
      } else if (
        ((e.key === '+' || e.key === '=') || ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D' || e.key === 'c' || e.key === 'C'))) &&
        !isInput && selectedInstanceIds.length > 0 && !heldProduct
      ) {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'g' || e.key === 'G') {
        toggleSnapStep();
      } else if (e.key === 'Escape') {
        if (heldProduct) {
          handleCancelPlacement();
        } else if (selectedInstanceIds.length > 0) {
          setSelectedInstanceIds([]);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isInput && selectedInstanceIds.length > 0 && !heldProduct) {
          e.preventDefault();
          deleteSelected();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isWalkModeRef.current && !isTextInput(e)) {
        if (WALK_KEY_CODES.includes(e.code)) {
          delete keysRef.current[e.code];
          setActiveKeys({ ...keysRef.current });
        }
      }

      if (e.code === 'Space' || e.key === 'Control') {
        isSpacePressedRef.current = false;
        if (mountRef.current) {
          mountRef.current.style.cursor = isPanModeRef.current ? 'grab' : 'crosshair';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    heldProduct,
    selectedInstanceIds,
    placedItems,
    onUpdateItem,
    handleCancelPlacement,
    handlePickupGroup,
    duplicateSelected,
    deleteSelected,
    toggleSnapStep,
    toggleWalkMode,
    rotateStep,
    stepHeldRotation,
    onWalkAction,
    onWalkSwap,
    onWalkMove,
  ]);

  return { activeKeys };
}
