import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import type { SpaceParameters } from '../../types/space';

export type LifecycleState = 'IDLE' | 'SELECTED' | 'DRAGGING_NEW' | 'DRAGGING_MOVE';

export type SnapStep = 0.125 | 0.25 | 0.5 | 1.0;

export interface CenterSnapInfo {
  isSnapped: boolean;
  targetDeskName?: string;
}

export interface MovingGroupItem {
  instanceId: string;
  product: SimsProduct;
  deltaGridX: number;
  deltaGridZ: number;
  rotation: number;
  color?: string;
  surfaceY?: number;
  mountedOnDeskId?: string;
  originalItem: PlacedFurniture;
}

export interface MovingGroupState {
  primaryInstanceId: string;
  primaryProduct: SimsProduct;
  items: MovingGroupItem[];
  minDeltaX: number;
  maxDeltaX: number;
  minDeltaZ: number;
  maxDeltaZ: number;
}

export interface SimsRoomCanvasProps {
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  spaceParams: SpaceParameters;
  onPlaceItem: (item: PlacedFurniture) => void;
  onUpdateItem: (instanceId: string, updates: Partial<PlacedFurniture>) => void;
  onDeleteItem: (instanceId: string) => void;
  onDeleteItems?: (instanceIds: string[]) => void;
  heldProduct: SimsProduct | null;
  onCancelHeld: () => void;
  onPickupItem?: (product: SimsProduct, initialRotation: number) => void;
  isNightMode: boolean;
  isSpaceDesignerOpen?: boolean;
  onSwapItem?: (item: PlacedFurniture) => void;
  /** The swap drawer is open (walk mode returns to mouse-look when it closes). */
  isSwapDrawerOpen?: boolean;
  onOpenCart?: () => void;
  initialWalkMode?: boolean;
  onWalkModeChange?: (isWalk: boolean) => void;
  walkToggleTrigger?: number;
  eyeHeight?: number;
  onSetEyeHeight?: (h: number) => void;
}
