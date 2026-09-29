import React, { useState, useEffect, useMemo } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import { DEFAULT_SIMS_ROOM } from '../../data/simsCatalog';
import type { SpaceParameters } from '../../types/space';
import { buildSetupItems, createSetupFromRoom, type RoomSetup } from '../../data/roomSetups';
import { DEFAULT_SPACE } from '../../types/space';
import { SimsRoomCanvas } from './SimsRoomCanvas';
import { SpaceDesignerPanel } from './SpaceDesignerPanel';
import { CartReviewModal } from './CartReviewModal';
import { SetupPresetsSheet } from './ui/SetupPresetsSheet';
import { ControlsHelpModal } from './ui/ControlsHelpModal';
import { FurnitureStoreSidebar } from './ui/FurnitureStoreSidebar';
import { FurnitureSwapperDrawer } from './ui/FurnitureSwapperDrawer';
import {
  ArrowLeft, Keyboard, ShoppingBag,
  Maximize2, Package, Armchair, Footprints, RotateCcw
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { STORAGE_SPACE_KEY } from '../../utils/storageKeys';
import { useDialogs } from '../../hooks/useDialogs';

interface FullscreenSimsWorldProps {
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  onPlaceItem: (item: PlacedFurniture) => void;
  onUpdateItem: (instanceId: string, updates: Partial<PlacedFurniture>) => void;
  onDeleteItem: (instanceId: string) => void;
  onDeleteItems?: (instanceIds: string[]) => void;
  onClearRoom: () => void;
  /** Built-in + saved room setups, and saving the current room as a new one. */
  setups: RoomSetup[];
  onSaveSetup: (setup: RoomSetup) => void;
  /** Replaces every placed item (used when applying a room setup). */
  onReplaceRoom: (items: PlacedFurniture[]) => void;
  onExitFullscreen: () => void;
  onOpenAdmin: () => void;
  initialWalkMode?: boolean;
}

export const FullscreenSimsWorld: React.FC<FullscreenSimsWorldProps> = ({
  catalog,
  placedItems,
  onPlaceItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteItems,
  onClearRoom,
  setups,
  onSaveSetup,
  onReplaceRoom,
  onExitFullscreen,
  onOpenAdmin,
  initialWalkMode = false,
}) => {

  const [spaceParams, setSpaceParams] = useState<SpaceParameters>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SPACE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.width === 'number' && typeof parsed.length === 'number') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SPACE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_SPACE_KEY, JSON.stringify(spaceParams));
  }, [spaceParams]);

  const [isSpacePanelOpen, setIsSpacePanelOpen] = useState<boolean>(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
  const [isSetupSheetOpen, setIsSetupSheetOpen] = useState<boolean>(false);
  const STORAGE_CONTROLS_SEEN_KEY = 'monis_sims_controls_seen_v1';
  // Show the controls popup automatically the first time the studio opens
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(STORAGE_CONTROLS_SEEN_KEY);
    } catch {
      return false;
    }
  });

  const closeControls = () => {
    setIsControlsOpen(false);
    try {
      localStorage.setItem(STORAGE_CONTROLS_SEEN_KEY, '1');
    } catch {
      // storage unavailable: popup simply shows again next time
    }
  };

  // "?" opens the controls popup from anywhere in the studio
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === '?') setIsControlsOpen(prev => !prev);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const [isFurnitureStoreOpen, setIsFurnitureStoreOpen] = useState<boolean>(false);
  const [isWalkMode, setIsWalkMode] = useState<boolean>(Boolean(initialWalkMode));
  const [walkToggleTrigger, setWalkToggleTrigger] = useState<number>(0);
  const [eyeHeight, setEyeHeight] = useState<number>(1.65);
  const [swappingItem, setSwappingItem] = useState<PlacedFurniture | null>(null);
  // Swap drawer live preview: the hovered option is rendered in place without touching the saved room
  const [swapPreview, setSwapPreview] = useState<{ instanceId: string; product: SimsProduct } | null>(null);
  const [heldProduct, setHeldProduct] = useState<SimsProduct | null>(null);

  // Quick swap handler: swap product while keeping coordinates and updating desk-mounted accessories
  const handleSwapProduct = (instanceId: string, newProduct: SimsProduct) => {
    const existingItem = placedItems.find(i => i.instanceId === instanceId);
    if (!existingItem) return;

    sounds.playPlace();

    // 1. Update the item's product ID & color
    onUpdateItem(instanceId, {
      productId: newProduct.id,
      color: newProduct.color,
    });

    // 2. If swapping a desk, update all items mounted on this desk to match new desk height
    const prevProduct = catalog.find(p => p.id === existingItem.productId);
    if (newProduct.category === 'desks' || prevProduct?.category === 'desks') {
      const newHeight = newProduct.actualDimensions?.heightM || (newProduct.heightCm ? newProduct.heightCm / 100 : 0.75);
      const mountedItems = placedItems.filter(i => i.mountedOnDeskId === instanceId);
      mountedItems.forEach(item => {
        onUpdateItem(item.instanceId, { surfaceY: newHeight });
      });
    }

    setSwapPreview(null);
    setSwappingItem(null);
  };

  // Items as the 3D room shows them: the previewed swap option replaces the item (and re-seats desk accessories)
  const displayItems = useMemo(() => {
    if (!swapPreview) return placedItems;
    const { instanceId, product } = swapPreview;
    const deskHeight = product.actualDimensions?.heightM ?? (product.heightCm ? product.heightCm / 100 : 0.75);
    return placedItems.map(item => {
      if (item.instanceId === instanceId) return { ...item, productId: product.id, color: product.color };
      if (product.category === 'desks' && item.mountedOnDeskId === instanceId) return { ...item, surfaceY: deskHeight };
      return item;
    });
  }, [placedItems, swapPreview]);

  // Price calculation for floating pill
  const itemsWithProduct = placedItems.map(item => ({
    ...item,
    product: catalog.find(p => p.id === item.productId),
  })).filter(item => Boolean(item.product));

  const totalWeekly = itemsWithProduct.reduce((sum, item) => sum + (item.product?.weeklyRent || 0), 0);

  const handleUpdateSpace = (updates: Partial<SpaceParameters>) => {
    setSpaceParams(prev => ({ ...prev, ...updates }));
  };

  // Resize the virtual room to the setup's shell and lay out its furniture
  const { confirm } = useDialogs();

  const handleQuickReset = async () => {
    if (!(await confirm({ title: 'Quick reset', message: 'Reset the room to the default layout? Your current furniture will be replaced.', confirmLabel: 'Reset', danger: true }))) return;
    sounds.playSelect();
    setSpaceParams(DEFAULT_SPACE);
    onReplaceRoom(DEFAULT_SIMS_ROOM.map(item => ({ ...item })));
  };

  // Confirms before replacing furniture, then lays out the setup
  const requestApplySetup = async (setup: RoomSetup) => {
    if (placedItems.length > 0 && !(await confirm({ title: 'Apply setup', message: `Replace the furniture in your room with "${setup.name}"?`, confirmLabel: 'Replace' }))) return;
    sounds.playPlace();
    handleApplySetup(setup);
  };

  const handleSaveCurrentRoom = (name: string) => {
    const { width, length, floorStyle, wallColor, wallStyle, backdropColor } = spaceParams;
    onSaveSetup(createSetupFromRoom({ name }, { width, length, floorStyle, wallColor, wallStyle, backdropColor }, placedItems, catalog));
  };

  const handleApplySetup = (setup: RoomSetup) => {
    setSpaceParams(prev => ({ ...prev, ...setup.room }));
    onReplaceRoom(buildSetupItems(setup, catalog));
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0b0e15] overflow-hidden select-none touch-none">
      {/* 1. Fullscreen Three.js 3D Room Canvas */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <SimsRoomCanvas
          catalog={catalog}
          placedItems={displayItems}
          isSwapDrawerOpen={Boolean(swappingItem)}
          spaceParams={spaceParams}
          onPlaceItem={onPlaceItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onDeleteItems={onDeleteItems}
          heldProduct={heldProduct}
          onCancelHeld={() => setHeldProduct(null)}
          onPickupItem={(product) => setHeldProduct(product)}
          isNightMode={false}
          isSpaceDesignerOpen={isSpacePanelOpen}
          onSwapItem={(item) => {
            sounds.playSelect();
            setSwappingItem(item);
          }}
          onOpenCart={() => {
            sounds.playSelect();
            setIsCartModalOpen(true);
          }}
          initialWalkMode={initialWalkMode}
          onWalkModeChange={(w) => setIsWalkMode(w)}
          walkToggleTrigger={walkToggleTrigger}
          eyeHeight={eyeHeight}
          onSetEyeHeight={(h) => setEyeHeight(h)}
        />
      </div>

      {/* 2. Monis Dynamic Floating Top Navigation */}
      <header className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-8 z-30 pointer-events-none flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Exit button, Space Designer Trigger & Walk in Studio Trigger */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onExitFullscreen}
            className="apple-press bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 shadow-md flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Studio</span>
          </button>

          {/* Step 1 Button: Design Room Space */}
          <button
            onClick={() => {
              sounds.playSelect();
              setIsSpacePanelOpen(true);
            }}
            className="apple-press bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 shadow-md flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
            <span className="sm:hidden whitespace-nowrap">{spaceParams.width}×{spaceParams.length}</span>
            <span className="hidden sm:inline">Room: {spaceParams.width}m × {spaceParams.length}m</span>
          </button>

          {/* Workspace Setups: bundle presets laid out in a virtual room */}
          <button
            onClick={() => {
              sounds.playSelect();
              setIsSetupSheetOpen(prev => !prev);
            }}
            className={`apple-press border shadow-md flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              isSetupSheetOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200/90'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Setups</span>
          </button>

          {/* Walk in Studio / Return to Orbit Trigger Button */}
          <button
            onClick={() => {
              sounds.playSelect();
              setWalkToggleTrigger(prev => prev + 1);
            }}
            className={`apple-press border shadow-md flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition cursor-pointer ${
              isWalkMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow'
                : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200/90'
            }`}
            title={isWalkMode ? "Click to return to Orbit view" : "Walk inside the room in first-person mode (WASD / Arrow keys)"}
          >
            {isWalkMode ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">Orbit</span>
                  <span className="hidden sm:inline">Return to Orbit</span>
                </span>
              </>
            ) : (
              <>
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">Walk</span>
                  <span className="hidden sm:inline">Walk in Studio</span>
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right: Store Toggle, Controls, Reset, CMS & Step 3 Cart Pill (second row on phones) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
          {/* Toggle Furniture Store Sidebar */}
          <button
            onClick={() => {
              sounds.playSelect();
              setIsFurnitureStoreOpen(prev => !prev);
            }}
            className={`apple-press flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-md cursor-pointer ${
              isFurnitureStoreOpen
                ? 'bg-slate-900 text-white'
                : 'bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90'
            }`}
            title="Toggle Monis Furniture Catalog Sidebar"
          >
            <Armchair className={`w-3.5 h-3.5 ${isFurnitureStoreOpen ? 'text-emerald-400' : 'text-slate-700'}`} />
            <span className="hidden sm:inline">Furniture Store</span>
          </button>

          {/* Controls popup */}
          <button
            onClick={() => {
              sounds.playSelect();
              setIsControlsOpen(true);
            }}
            className="apple-press bg-white/95 hover:bg-white flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-slate-700 border border-slate-200/90 transition shadow-md cursor-pointer"
            title="Show controls (?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Controls</span>
          </button>

          {/* Quick reset: restore the default room and layout */}
          <button
            onClick={handleQuickReset}
            className="apple-press bg-white/95 hover:bg-white flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-slate-700 border border-slate-200/90 transition shadow-md cursor-pointer"
            title="Quick reset: restore the default room and layout"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Quick Reset</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="apple-press bg-white/95 hover:bg-white hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-slate-700 border border-slate-200/90 transition shadow-md cursor-pointer"
          >
            <span>CMS</span>
          </button>

          {/* Step 3: View Cart & Checkout Button */}
          <button
            onClick={() => {
              sounds.playSelect();
              setIsCartModalOpen(true);
            }}
            className="apple-press bg-slate-900 hover:bg-black flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold text-white transition shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-300 font-bold">${totalWeekly}/wk</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-white">
              {placedItems.length}
            </span>
            <span className="hidden md:inline text-slate-200">View Cart →</span>
          </button>
        </div>
      </header>

      {/* 3. Step 2: Monis Furniture Store Sidebar (Right Sheet Drawer) */}
      <FurnitureStoreSidebar
        catalog={catalog}
        heldProduct={heldProduct}
        onSelectProduct={setHeldProduct}
        isOpen={isFurnitureStoreOpen}
        onToggleOpen={() => setIsFurnitureStoreOpen(prev => !prev)}
        setups={setups}
        onPickSetup={requestApplySetup}
        onSeeAllSetups={() => setIsSetupSheetOpen(true)}
      />

      {/* 4. Step 1: Space Designer Drawer */}
      {isSpacePanelOpen && (
        <SpaceDesignerPanel
          spaceParams={spaceParams}
          onChangeSpace={handleUpdateSpace}
          onClose={() => setIsSpacePanelOpen(false)}
        />
      )}

      {/* Controls popup */}
      {isControlsOpen && <ControlsHelpModal onClose={closeControls} />}

      {/* 4b. Workspace Setup bundles */}
      {isSetupSheetOpen && (
        <SetupPresetsSheet
          setups={setups}
          catalog={catalog}
          placedItems={placedItems}
          onApplySetup={requestApplySetup}
          onSaveCurrentRoom={handleSaveCurrentRoom}
          onClose={() => setIsSetupSheetOpen(false)}
        />
      )}

      {/* 5. Step 3: Cart Review Modal */}
      {isCartModalOpen && (
        <CartReviewModal
          catalog={catalog}
          placedItems={placedItems}
          spaceParams={spaceParams}
          onRemoveItem={onDeleteItem}
          onClearAll={onClearRoom}
          onClose={() => setIsCartModalOpen(false)}
        />
      )}

      {/* 6. Quick In-Place Furniture Swapper Drawer */}
      <FurnitureSwapperDrawer
        selectedItem={swappingItem}
        catalog={catalog}
        isOpen={Boolean(swappingItem)}
        onClose={() => {
          setSwapPreview(null);
          setSwappingItem(null);
        }}
        onSwapProduct={handleSwapProduct}
        onPreviewProduct={(instanceId, product) => setSwapPreview(product ? { instanceId, product } : null)}
      />
    </div>
  );
};
