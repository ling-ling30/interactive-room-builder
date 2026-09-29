import React, { useState, useEffect } from 'react';
import type { SimsProduct, PlacedFurniture } from '../../data/simsCatalog';
import type { SpaceParameters } from '../../types/space';
import { DEFAULT_SPACE } from '../../types/space';
import { SimsRoomCanvas } from './SimsRoomCanvas';
import { SpaceDesignerPanel } from './SpaceDesignerPanel';
import { CartReviewModal } from './CartReviewModal';
import { FurnitureStoreSidebar } from './ui/FurnitureStoreSidebar';
import { FurnitureSwapperDrawer } from './ui/FurnitureSwapperDrawer';
import {
  Sun, Moon, ArrowLeft, ShoppingBag,
  Maximize2, Armchair, Footprints, RotateCcw, Compass
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface FullscreenSimsWorldProps {
  catalog: SimsProduct[];
  placedItems: PlacedFurniture[];
  onPlaceItem: (item: PlacedFurniture) => void;
  onUpdateItem: (instanceId: string, updates: Partial<PlacedFurniture>) => void;
  onDeleteItem: (instanceId: string) => void;
  onDeleteItems?: (instanceIds: string[]) => void;
  onClearRoom: () => void;
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
  onExitFullscreen,
  onOpenAdmin,
  initialWalkMode = false,
}) => {
  const STORAGE_SPACE_KEY = 'monis_sims_space_v2';

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
  const [isFurnitureStoreOpen, setIsFurnitureStoreOpen] = useState<boolean>(true);
  const [isWalkMode, setIsWalkMode] = useState<boolean>(Boolean(initialWalkMode));
  const [walkToggleTrigger, setWalkToggleTrigger] = useState<number>(0);
  const [eyeHeight, setEyeHeight] = useState<number>(1.65);
  const [headingInfo, setHeadingInfo] = useState<{ degrees: number; cardinal: string }>({ degrees: 0, cardinal: 'N' });
  const [swappingItem, setSwappingItem] = useState<PlacedFurniture | null>(null);
  const [heldProduct, setHeldProduct] = useState<SimsProduct | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

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

    setSwappingItem(null);
  };

  // Price calculation for floating pill
  const itemsWithProduct = placedItems.map(item => ({
    ...item,
    product: catalog.find(p => p.id === item.productId),
  })).filter(item => Boolean(item.product));

  const totalWeekly = itemsWithProduct.reduce((sum, item) => sum + (item.product?.weeklyRent || 0), 0);

  const handleUpdateSpace = (updates: Partial<SpaceParameters>) => {
    setSpaceParams(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#0b0e15] overflow-hidden select-none touch-none">
      {/* 1. Fullscreen Three.js 3D Room Canvas */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <SimsRoomCanvas
          catalog={catalog}
          placedItems={placedItems}
          spaceParams={spaceParams}
          onPlaceItem={onPlaceItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onDeleteItems={onDeleteItems}
          heldProduct={heldProduct}
          onCancelHeld={() => setHeldProduct(null)}
          onPickupItem={(product) => setHeldProduct(product)}
          isNightMode={isNightMode}
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
          onHeadingChange={(info) => setHeadingInfo(info)}
        />
      </div>

      {/* 2. Monis Dynamic Floating Top Navigation */}
      <header className="absolute top-4 inset-x-4 sm:inset-x-8 z-30 pointer-events-none flex items-center justify-between">
        {/* Left: Exit button, Space Designer Trigger & Walk in Studio Trigger */}
        <div className="pointer-events-auto flex items-center gap-2">
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
            <span>Room: {spaceParams.width}m × {spaceParams.length}m</span>
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
                <span>Return to Orbit</span>
              </>
            ) : (
              <>
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                <span>Walk in Studio</span>
              </>
            )}
          </button>



          {/* When in Walk Mode: Compass Heading Chip */}
          {isWalkMode && headingInfo && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#0c1017]/85 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 text-xs shadow-md font-mono text-zinc-300 animate-fade-in">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">{headingInfo.cardinal}</span>
              <span className="text-[10px] text-zinc-400">{headingInfo.degrees}°</span>
            </div>
          )}
        </div>

        {/* Right: Store Toggle, Lighting, CMS & Step 3 Cart Pill */}
        <div className="pointer-events-auto flex items-center gap-2">
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

          {/* Day / Night toggle */}
          <button
            onClick={() => setIsNightMode(prev => !prev)}
            className="apple-press bg-white/95 hover:bg-white p-2.5 rounded-full text-slate-700 border border-slate-200/90 transition shadow-md cursor-pointer"
            title="Toggle Day/Night"
          >
            {isNightMode ? <Moon className="w-4 h-4 text-sky-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
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
      />

      {/* 4. Step 1: Space Designer Drawer */}
      {isSpacePanelOpen && (
        <SpaceDesignerPanel
          spaceParams={spaceParams}
          onChangeSpace={handleUpdateSpace}
          onClose={() => setIsSpacePanelOpen(false)}
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
        onClose={() => setSwappingItem(null)}
        onSwapProduct={handleSwapProduct}
      />
    </div>
  );
};
