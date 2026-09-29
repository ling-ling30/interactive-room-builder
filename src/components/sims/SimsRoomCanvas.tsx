import React, { useRef, useState } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import { sounds } from '../../utils/soundEffects';
import { getEffectiveFootprint, gridToWorld, stepFurnitureRotation } from './three/spatialMath';
import { DEFAULT_SPACE } from './three/sceneHelpers';
import { useSimsCamera } from './hooks/useSimsCamera';
import { useSimsRoomRefs } from './hooks/useSimsRoomRefs';
import { useSimsSelection } from './hooks/useSimsSelection';
import { usePlacementState } from './hooks/usePlacementState';
import { useWalkModeSync } from './hooks/useWalkModeSync';
import { useRoomScene } from './hooks/useRoomScene';
import { usePlacedItemsSync } from './hooks/usePlacedItemsSync';
import { useGhostMesh } from './hooks/useGhostMesh';
import { useFurnitureActions } from './hooks/useFurnitureActions';
import { useHeldPlacementPointer } from './hooks/useHeldPlacementPointer';
import { useCanvasPointerHandlers } from './hooks/useCanvasPointerHandlers';
import { useSimsKeyboard } from './hooks/useSimsKeyboard';
import { CameraControlsHud } from './ui/CameraControlsHud';
import { FloatingActionDeck } from './ui/FloatingActionDeck';
import { HeldItemIsland } from './ui/HeldItemIsland';
import { HoverHintPill } from './ui/HoverHintPill';
import { WalkModeHud } from './ui/WalkModeHud';
import type { SimsRoomCanvasProps } from './simsRoomTypes';

export type { LifecycleState, MovingGroupItem, MovingGroupState } from './simsRoomTypes';

export const SimsRoomCanvas: React.FC<SimsRoomCanvasProps> = ({
  catalog,
  placedItems,
  spaceParams,
  onPlaceItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteItems,
  heldProduct,
  onCancelHeld,
  onPickupItem,
  isNightMode,
  isSpaceDesignerOpen,
  onSwapItem,
  onOpenCart: _onOpenCart,
  initialWalkMode = false,
  onWalkModeChange,
  walkToggleTrigger = 0,
  eyeHeight: propEyeHeight,
  onSetEyeHeight,
  onHeadingChange,
}) => {
  const refs = useSimsRoomRefs();
  const { mountRef, bubbleRef, movingInstanceIdRef, movingGroupRef } = refs;

  const camera = useSimsCamera(initialWalkMode);
  const { cameraRef, isWalkMode, walkMove, walkToItem, toggleWalkMode } = camera;

  const selection = useSimsSelection(placedItems, catalog);
  const { selectedInstanceIds, setSelectedInstanceIds, selectedItems, selectedItem, selectedProduct, totalWeeklyRent } = selection;

  const placement = usePlacementState();
  const { movingGroupCount, hoverTile, heldRotation, snapStep, centerSnapInfo, hoveredInstanceId, toggleSnapStep } = placement;

  const [isPanMode, setIsPanMode] = useState<boolean>(false);

  // Room dimensions
  const space = spaceParams || DEFAULT_SPACE;
  const roomWidth = Math.max(3, Math.round(space.width || 5));
  const roomLength = Math.max(3, Math.round(space.length || 5));

  // Latest-value refs for the 60FPS loop and window-level event handlers
  const isWalkModeRef = useRef<boolean>(isWalkMode);
  isWalkModeRef.current = isWalkMode;
  const isPanModeRef = useRef<boolean>(false);
  isPanModeRef.current = isPanMode;
  const walkMoveRef = useRef(walkMove);
  walkMoveRef.current = walkMove;
  const roomWidthRef = useRef(roomWidth);
  roomWidthRef.current = roomWidth;
  const roomLengthRef = useRef(roomLength);
  roomLengthRef.current = roomLength;
  const placedItemsRef = useRef<PlacedFurniture[]>(placedItems);
  placedItemsRef.current = placedItems;
  const catalogRef = useRef<SimsProduct[]>(catalog);
  catalogRef.current = catalog;
  const selectedInstanceIdsRef = useRef<string[]>([]);
  selectedInstanceIdsRef.current = selectedInstanceIds;

  useWalkModeSync({
    camera,
    roomWidthRef,
    roomLengthRef,
    eyeHeight: propEyeHeight,
    walkToggleTrigger,
    onWalkModeChange,
    onSetEyeHeight,
    onHeadingChange,
  });

  // Three.js scene + room architecture
  const { sceneReady, bumpSceneReady } = useRoomScene({
    refs,
    space,
    roomWidth,
    roomLength,
    isNightMode,
    camera,
    isWalkModeRef,
    walkMoveRef,
    placedItemsRef,
    catalogRef,
    roomWidthRef,
    roomLengthRef,
    selectedInstanceIdsRef,
  });

  usePlacedItemsSync({ refs, placedItems, catalog, selectedInstanceIds, sceneReady, bumpSceneReady, roomWidth, roomLength });

  useGhostMesh({ refs, heldProduct, heldRotation, hoverTile, roomWidth, roomLength });

  // Furniture actions (pick up / drop / cancel / duplicate / delete / rotate)
  const {
    handlePickupGroup,
    handlePickupItem,
    handleCancelPlacement,
    handleDirectPlace,
    duplicateSelected,
    deleteSelected,
    stepHeldRotation,
  } = useFurnitureActions({
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
  });

  // Pointer -> grid tile / hover, plus catalog drag-and-drop
  const { updatePointer } = useHeldPlacementPointer({
    refs,
    placement,
    cameraRef,
    heldProduct,
    placedItems,
    catalog,
    roomWidth,
    roomLength,
    handleDirectPlace,
  });

  const pointerHandlers = useCanvasPointerHandlers({
    refs,
    placement,
    camera,
    heldProduct,
    placedItems,
    catalog,
    roomWidth,
    roomLength,
    isWalkModeRef,
    isPanModeRef,
    placedItemsRef,
    selectedInstanceIdsRef,
    setSelectedInstanceIds,
    updatePointer,
    handleDirectPlace,
    handlePickupGroup,
    handlePickupItem,
  });

  const { activeKeys } = useSimsKeyboard({
    refs,
    placement,
    camera,
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
    stepHeldRotation,
  });

  const rotateSelected = (dir: 'cw' | 'ccw') => {
    sounds.playRotate();
    selectedItems.forEach((item: PlacedFurniture) => {
      onUpdateItem(item.instanceId, { rotation: stepFurnitureRotation(item.rotation, dir) });
    });
  };

  const walkToSelectedItem = () => {
    if (selectedItems.length === 1 && selectedProduct) {
      sounds.playSelect();
      const fp = getEffectiveFootprint(selectedProduct, selectedItems[0].rotation);
      const worldPos = gridToWorld(selectedItems[0].gridX, selectedItems[0].gridZ, fp.width, fp.depth, roomWidth, roomLength);
      walkToItem(worldPos.x, worldPos.z, roomLength, selectedItems[0].rotation, fp.depth);
      setSelectedInstanceIds([]);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none touch-none"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={pointerHandlers.onPointerDown}
      onPointerMove={pointerHandlers.onPointerMove}
      onPointerUp={pointerHandlers.onPointerUp}
      onPointerLeave={pointerHandlers.onPointerLeave}
      onPointerCancel={pointerHandlers.onPointerCancel}
      onTouchStart={camera.handleTouchStart}
      onTouchMove={camera.handleTouchMove}
      onTouchEnd={camera.handleTouchEnd}
      onWheel={pointerHandlers.onWheel}
    >
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Camera Angle & Zoom HUD with Pan Support & Walk Mode Toggle (Orbit mode only) */}
      {!isWalkMode && (
        <CameraControlsHud
          cameraAngleIndex={camera.cameraAngleIndex}
          onSetPreset={camera.setCameraPreset}
          onRotateStep={camera.rotateStep}
          onZoomIn={() => camera.zoomIn(2)}
          onZoomOut={() => camera.zoomOut(2)}
          snapStep={snapStep}
          onToggleSnap={toggleSnapStep}
          isOffset={Boolean(isSpaceDesignerOpen)}
          isPanMode={isPanMode}
          onTogglePanMode={() => setIsPanMode(prev => !prev)}
          onResetPan={camera.resetPan}
          isWalkMode={isWalkMode}
          onToggleWalkMode={() => toggleWalkMode(roomWidth, roomLength)}
        />
      )}

      {/* Walk Mode HUD: first-person reticle and bottom controls guide & mobile D-pad */}
      {isWalkMode && (
        <WalkModeHud
          activeKeys={activeKeys}
          onVirtualWalk={(fwd, strafe) => walkMove(fwd, strafe, 0.05, roomWidth, roomLength)}
        />
      )}

      {/* Hover Tooltip when pointer hovers over furniture (IDLE state) */}
      {hoveredInstanceId && selectedInstanceIds.length === 0 && !heldProduct && !isWalkMode && <HoverHintPill />}

      {/* Floating 3D Action Pill directly ON TOP of the furniture (SELECTED state, single or multi) */}
      {selectedInstanceIds.length > 0 && !heldProduct && (
        <FloatingActionDeck
          ref={bubbleRef}
          selectedProduct={selectedProduct}
          selectedCount={selectedInstanceIds.length}
          totalWeeklyRent={totalWeeklyRent}
          currentRotation={selectedItem?.rotation ?? (selectedItems[0]?.rotation || 0)}
          onMove={() => {
            if (selectedItems.length > 0) {
              handlePickupGroup(selectedItems, selectedItems[0]);
            }
          }}
          onRotateStep={rotateSelected}
          onRotate={() => rotateSelected('cw')}
          onSwap={() => {
            if (selectedItems.length === 1 && onSwapItem) {
              onSwapItem(selectedItems[0]);
            }
          }}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onClose={() => setSelectedInstanceIds([])}
          onWalkToItem={walkToSelectedItem}
        />
      )}

      {/* Held Item Top Floating Island (During DRAGGING_NEW or DRAGGING_MOVE) */}
      {heldProduct && (
        <HeldItemIsland
          heldProduct={heldProduct}
          isMovingExisting={Boolean(movingInstanceIdRef.current || movingGroupRef.current)}
          movingGroupCount={movingGroupCount}
          hoverTile={hoverTile}
          heldRotation={heldRotation}
          snapStep={snapStep}
          isCenterSnapped={centerSnapInfo.isSnapped}
          centerTargetName={centerSnapInfo.targetDeskName}
          onToggleSnap={toggleSnapStep}
          onDrop={() => handleDirectPlace()}
          onRotateStep={stepHeldRotation}
          onRotate={() => stepHeldRotation('cw')}
          onCancel={handleCancelPlacement}
        />
      )}
    </div>
  );
};
