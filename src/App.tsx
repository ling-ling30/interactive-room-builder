import { lazy, Suspense, useState, useEffect } from 'react';
import { SIMS_CATALOG, DEFAULT_SIMS_ROOM } from './data/simsCatalog';
import { toModelType } from './data/modelTypes';
import type { SimsProduct, PlacedFurniture } from './data/simsCatalog';
import { AppleShowcase } from './components/showcase/AppleShowcase';
import { DEFAULT_SPACE } from './types/space';
import { buildSetupItems, createSetupFromRoom, type RoomSetup } from './data/roomSetups';
import { useRoomSetups } from './utils/setupStorage';
import { STORAGE_SPACE_KEY } from './utils/storageKeys';
import type { WorkstationConfig } from './types/workstation';

// The 3D studio, CMS and workstation modal pull in Three.js: load them on demand, not with the landing page
const FullscreenSimsWorld = lazy(() => import('./components/sims/FullscreenSimsWorld').then(m => ({ default: m.FullscreenSimsWorld })));
const SimsAdminManager = lazy(() => import('./components/sims/SimsAdminManager').then(m => ({ default: m.SimsAdminManager })));
const WorkstationStationModal = lazy(() => import('./components/workstation/WorkstationStationModal').then(m => ({ default: m.WorkstationStationModal })));

const STORAGE_CATALOG_KEY = 'monis_sims_catalog_v9_scraped';
const STORAGE_ROOM_KEY = 'monis_sims_room_v9_scraped';

export default function App() {
  const [catalog, setCatalog] = useState<SimsProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATALOG_KEY) || localStorage.getItem('monis_sims_catalog_v8_scraped');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only accept saved if it contains the real scraped items with photos
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((p: SimsProduct) => Boolean(p.imageUrl))) {
          // Merge modelUrl and actualDimensions from SIMS_CATALOG for items that don't have custom overrides
          const merged = parsed.map((raw: SimsProduct) => {
            const item: SimsProduct = { ...raw, modelType: toModelType(raw.modelType) };
            const defaultItem = SIMS_CATALOG.find(d => d.id === item.id);
            if (defaultItem) {
              const res = { ...item };
              if (defaultItem.modelUrl && !item.modelUrl) res.modelUrl = defaultItem.modelUrl;
              if (defaultItem.actualDimensions && !item.actualDimensions) res.actualDimensions = defaultItem.actualDimensions;
              if (defaultItem.category && item.category !== defaultItem.category && defaultItem.category === 'accessories') {
                res.category = defaultItem.category;
              }
              return res;
            }
            return item;
          });

          // Include any newly added official items from SIMS_CATALOG
          const existingIds = new Set(merged.map((m: SimsProduct) => m.id));
          const newItems = SIMS_CATALOG.filter(d => !existingIds.has(d.id));
          return [...merged, ...newItems];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return SIMS_CATALOG;
  });

  const [placedItems, setPlacedItems] = useState<PlacedFurniture[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROOM_KEY) || localStorage.getItem('monis_sims_room_v8_scraped');
      if (saved) {
        const parsed = JSON.parse(saved);
        // An empty saved room is a valid choice (the user cleared it): only fall back when nothing usable is stored
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item: PlacedFurniture) => item && typeof item.productId === 'string' && typeof item.instanceId === 'string'
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SIMS_ROOM;
  });

  const STORAGE_UIMODE_KEY = 'monis_sims_uimode_v1';

  // Main UI Mode: 'showcase' (Apple landing), 'fullscreen_sims' (100vw x 100vh 3D room), 'admin' (CMS), or 'desk_studio' (3D Desk Studio)
  const [uiMode, setUiMode] = useState<'showcase' | 'fullscreen_sims' | 'admin' | 'desk_studio'>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.hash === '#desk-studio') return 'desk_studio';
      const saved = localStorage.getItem(STORAGE_UIMODE_KEY);
      if (saved === 'fullscreen_sims' || saved === 'admin' || saved === 'desk_studio') return saved as 'fullscreen_sims' | 'admin' | 'desk_studio';
    } catch (e) {
      console.error(e);
    }
    return 'showcase';
  });

  const [startInWalkMode, setStartInWalkMode] = useState<boolean>(false);
  const [isGlobalStationOpen, setIsGlobalStationOpen] = useState<boolean>(false);

  // Sync to local storage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    } catch (e) {
      console.warn('localStorage catalog save quota reached, saving sanitized metadata:', e);
      try {
        const sanitized = catalog.map(p => ({
          ...p,
          modelUrl: p.modelUrl && p.modelUrl.length > 500000 ? undefined : p.modelUrl,
        }));
        localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(sanitized));
      } catch (err2) {
        console.error('Failed to save catalog to localStorage:', err2);
      }
    }
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(placedItems));
  }, [placedItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_UIMODE_KEY, uiMode);
  }, [uiMode]);

  // Furniture placement & management
  const handlePlaceItem = (item: PlacedFurniture) => {
    setPlacedItems(prev => [...prev, item]);
  };

  const handleUpdateItem = (instanceId: string, updates: Partial<PlacedFurniture>) => {
    setPlacedItems(prev => prev.map(p => p.instanceId === instanceId ? { ...p, ...updates } : p));
  };

  const handleDeleteItem = (instanceId: string) => {
    setPlacedItems(prev => prev.filter(p => p.instanceId !== instanceId));
  };

  const handleDeleteItems = (instanceIds: string[]) => {
    const idSet = new Set(instanceIds);
    setPlacedItems(prev => prev.filter(p => !idSet.has(p.instanceId) && (!p.mountedOnDeskId || !idSet.has(p.mountedOnDeskId))));
  };

  const roomSetups = useRoomSetups();

  // CMS: snapshot the studio room (with the room shell saved by the studio) as a new setup
  const handleSaveCurrentRoomAsSetup = (name: string) => {
    let space = DEFAULT_SPACE;
    try {
      space = { ...DEFAULT_SPACE, ...JSON.parse(localStorage.getItem(STORAGE_SPACE_KEY) || 'null') };
    } catch (e) {
      console.error(e);
    }
    const { width, length, floorStyle, wallColor, wallStyle, backdropColor } = space;
    roomSetups.addSetup(createSetupFromRoom({ name }, { width, length, floorStyle, wallColor, wallStyle, backdropColor }, placedItems, catalog));
  };

  // Landing page bundle: lay the setup out in a 3 x 3 m room and open the 3D studio
  const handleSelectSetup = (setup: RoomSetup) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_SPACE_KEY) || 'null');
      localStorage.setItem(STORAGE_SPACE_KEY, JSON.stringify({ ...DEFAULT_SPACE, ...saved, ...setup.room }));
    } catch (e) {
      console.error(e);
    }
    setPlacedItems(buildSetupItems(setup, catalog));
    setStartInWalkMode(false);
    setUiMode('fullscreen_sims');
  };

  const handleClearRoom = () => {
    setPlacedItems([]);
  };

  // Product management (Outside front UI)
  const handleAddProduct = (newProd: SimsProduct) => {
    setCatalog(prev => [newProd, ...prev]);
  };

  const handleUpdateProduct = (id: string, updates: Partial<SimsProduct>) => {
    setCatalog(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const updatedProd = next.find(p => p.id === id);
      if (updatedProd && updatedProd.category === 'desks') {
        const newDeskH = updatedProd.actualDimensions?.heightM ?? (updatedProd.heightCm ? updatedProd.heightCm / 100 : 0.74);
        setPlacedItems(currentPlaced => {
          const deskIds = new Set(currentPlaced.filter(item => item.productId === id).map(item => item.instanceId));
          return currentPlaced.map(item => {
            if (item.mountedOnDeskId && deskIds.has(item.mountedOnDeskId)) {
              const isMat = item.productId === 'acc-felt-deskpad' || item.productId.includes('mat') || item.productId.includes('pad');
              return {
                ...item,
                surfaceY: Math.round((newDeskH + (isMat ? 0 : 0.005)) * 1000) / 1000,
              };
            }
            return item;
          });
        });
      }
      return next;
    });
  };

  const handleDeleteProduct = (id: string) => {
    setCatalog(prev => prev.filter(p => p.id !== id));
    setPlacedItems(prev => prev.filter(item => item.productId !== id));
  };

  const handleResetCatalog = () => {
    setCatalog(SIMS_CATALOG);
    localStorage.removeItem(STORAGE_CATALOG_KEY);
  };

  const handleExportCatalog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `monis-catalog-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    a.remove();
  };

  const handleImportCatalog = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCatalog(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <div className={`min-h-screen ${uiMode === 'fullscreen_sims' ? 'bg-[#0f121d] text-white' : 'bg-slate-50 text-slate-900'} font-sans antialiased selection:bg-slate-900 selection:text-white`}>
      <Suspense fallback={<div className="fixed inset-0 grid place-items-center text-xs font-mono text-slate-500" role="status">Loading…</div>}>
      {/* 1. Default Showcase: Clean Monis Bali Landing Page */}
      {uiMode === 'showcase' && (
        <AppleShowcase
          onToggleInteractiveWorld={() => {
            setStartInWalkMode(false);
            setUiMode('fullscreen_sims');
          }}
          onWalkInStudio={() => {
            setStartInWalkMode(true);
            setUiMode('fullscreen_sims');
          }}
          onOpenDeskStudio={() => setUiMode('desk_studio')}
          onOpenAdmin={() => setUiMode('admin')}
          onSelectSetup={handleSelectSetup}
          setups={roomSetups.setups}
          catalog={catalog}
        />
      )}

      {/* 2. Fullscreen Interactive 3D World (100vw x 100vh with Apple Glass HUD) */}
      {uiMode === 'fullscreen_sims' && (
        <FullscreenSimsWorld
          catalog={catalog}
          placedItems={placedItems}
          onPlaceItem={handlePlaceItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onDeleteItems={handleDeleteItems}
          onClearRoom={handleClearRoom}
          setups={roomSetups.setups}
          onSaveSetup={roomSetups.addSetup}
          onReplaceRoom={setPlacedItems}
          onExitFullscreen={() => setUiMode('showcase')}
          onOpenAdmin={() => setUiMode('admin')}
          onOpenDeskStudio={() => setUiMode('desk_studio')}
          initialWalkMode={startInWalkMode}
        />
      )}

      {/* 3. Outside Front UI: Dedicated Inventory Product CMS */}
      {uiMode === 'admin' && (
        <div className="min-h-screen bg-slate-50 py-4">
          <SimsAdminManager
            catalog={catalog}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetCatalog={handleResetCatalog}
            onExportCatalog={handleExportCatalog}
            onImportCatalog={handleImportCatalog}
            onBackToSims={() => setUiMode('fullscreen_sims')}
            onBackToShowcase={() => setUiMode('showcase')}
            roomSetups={roomSetups}
            currentRoomItemCount={placedItems.length}
            onSaveCurrentRoomAsSetup={handleSaveCurrentRoomAsSetup}
          />
        </div>
      )}

      {/* 4. Fullscreen 3D Desk Studio Configurator */}
      {(uiMode === 'desk_studio' || isGlobalStationOpen) && (
        <WorkstationStationModal
          catalog={catalog}
          existingPlacedItems={placedItems}
          onClose={() => {
            if (isGlobalStationOpen) setIsGlobalStationOpen(false);
            else setUiMode('showcase');
          }}
          onApplyToRoom={(_config: WorkstationConfig, newPlacedItems: PlacedFurniture[], mode: 'merge' | 'replace' = 'merge') => {
            if (newPlacedItems && newPlacedItems.length > 0) {
              // Safety snapshot so user can never lose work
              try {
                localStorage.setItem('monis_sims_room_backup', JSON.stringify(placedItems));
              } catch (e) {
                console.warn('Room backup failed:', e);
              }

              if (mode === 'replace' || placedItems.length === 0) {
                setPlacedItems(newPlacedItems);
              } else {
                const deskIds = new Set(
                  placedItems
                    .filter(item => {
                      const prod = catalog.find(p => p.id === item.productId);
                      return prod?.category === 'desks';
                    })
                    .map(item => item.instanceId)
                );

                const ambientItems = placedItems.filter(item => {
                  if (item.mountedOnDeskId && deskIds.has(item.mountedOnDeskId)) return false;
                  const prod = catalog.find(p => p.id === item.productId);
                  if (prod?.category === 'desks' || prod?.category === 'chairs') return false;
                  if (item.surfaceY > 0) return false;
                  return true;
                });

                setPlacedItems(ambientItems.length > 0 ? [...ambientItems, ...newPlacedItems] : newPlacedItems);
              }
            }
            setIsGlobalStationOpen(false);
            setUiMode('fullscreen_sims');
          }}
        />
      )}
      </Suspense>
    </div>
  );
}
