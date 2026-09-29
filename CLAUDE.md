# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (typecheck is part of build)
npm run lint      # oxlint (not ESLint; config in .oxlintrc.json) — currently 0 warnings, keep it that way
npm test          # vitest run (unit tests in src/__tests__)
npx vitest run src/__tests__/roomSetups.test.ts   # single test file
npx tsc -b        # typecheck only
```

`scratch/` holds throwaway Node scripts (`*.cjs`) that crawl monis.rent for product data; they are excluded from lint and not part of the app.

## Architecture

Vite + React 19 + TypeScript + Tailwind + Three.js (raw, no react-three-fiber). Product is a Bali furniture/desk rental configurator ("Monis") with a Sims-style 3D room builder.

### App shell (`src/App.tsx`)
`App` owns all state and switches between three `uiMode`s: `showcase` (`AppleShowcase` landing), `fullscreen_sims` (`FullscreenSimsWorld`), `admin` (`SimsAdminManager`). The studio, CMS and `WorkstationStationModal` are `React.lazy` chunks inside one `Suspense`; keep new heavy screens lazy too. Catalog (`SimsProduct[]`), placed furniture (`PlacedFurniture[]`) and `uiMode` are persisted to `localStorage` under versioned keys (`monis_sims_*_v9_scraped`; space key in `utils/storageKeys.ts`). On load, the saved catalog is merged with `SIMS_CATALOG` defaults (new official items appended; `modelUrl` / `actualDimensions` backfilled; `modelType` normalised through `toModelType`). Bump the key version when changing saved shape.

`main.tsx` wraps the app in `DialogProvider`. Never use `window.alert/confirm/prompt`: call `useDialogs()` (`hooks/useDialogs.ts`) which returns promise-based `alert` / `confirm` / `prompt` rendered as focus-trapped `role="alertdialog"`.

### Sims room canvas (`src/components/sims/`)
`SimsRoomCanvas.tsx` is a thin composition root; logic is split into hooks in `hooks/` and pure helpers in `three/`. Read `src/components/sims/SIMS_ROOM_CANVAS.md` before editing it (layout, data flow, shortcuts, gotchas). Key points:
- Grid coordinates (`gridX`/`gridZ`, room-corner origin, metres, footprint top-left) vs world coordinates (room-centred): convert with `gridToWorld` in `three/spatialMath.ts`. The mesh is centred on the footprint tile while the real size comes from `actualDimensions`, so a footprint may overhang a wall even though the body is inside.
- Furniture on desks uses `surfaceY` + `mountedOnDeskId`; height comes from `getTableSurfaceYUnder` measuring actual meshes.
- Moving/copying items goes through `movingGroupRef` / `movingInstanceIdRef` / `originBackupRef` (refs in `useSimsRoomRefs`) so cancel can revert. Render code must not read these refs; use state (`isMovingExisting` in `usePlacementState`).
- The Three.js init effect in `useRoomScene` runs once; room changes flow through its separate update effect. Keep `space` stable (`DEFAULT_SPACE`).
- Never mutate refs, groups or meshes inside a `setState` updater: React StrictMode runs updaters twice (this caused double rotation).
- Latest-value refs for animation loops / window handlers use `hooks/useLatest.ts` (never assign `ref.current = x` during render).
- Removed items are disposed with `disposeMeshes` (`three/sceneHelpers.ts`); materials are per-instance clones so this is safe. Renderer cleanup must remove its canvas and call `forceContextLoss()` (StrictMode/HMR otherwise stack canvases).
- Walk mode: `useWalkInteract` (look vs free-cursor sub-modes, crosshair target, E swap / R move, `swapPhaseRef`), `useWalkModeSync`. Crosshair targets skip rugs/flat items and the target map is cached until placed items / catalog / mesh count change.
- Meshes are built by `Sims3DModels.ts` (`createFurnitureMesh`): GLB from `product.modelUrl` (files in `public/3dObject/`, custom uploads via `utils/modelStorage.ts`) or procedural fallback by `modelType`.

### Data and types
- `data/simsCatalog.ts` (`SimsProduct`, `PlacedFurniture`, default catalog fed by the large scraped `data/monis*Products.json`; avoid reading those whole).
- `data/modelTypes.ts`: `MODEL_TYPES` / `ModelType` union. `PROCEDURAL_BUILDERS` is `Record<ModelType, ModelBuilder>`, so adding a type means updating the union, the builder map and `PROCEDURAL_MODEL_OPTIONS` in `admin/model3dLibrary.ts`. Stored legacy values are mapped by `toModelType`.
- `data/roomSetups.ts`: 3×3 m preset bundles. `layoutSetup` places items from real dimensions by role (desk, chair, monitor, ...); `manual` role stores exact coordinates for setups saved from a room (`createSetupFromRoom`). Custom setups persist via `utils/setupStorage.ts` (`useRoomSetups`, key `monis_sims_setups_v1`).
- `data/deliveryZones.ts` (Bali delivery zones), `utils/ids.ts` (`newId(prefix)`, use instead of `Date.now()`/`Math.random()`), `utils/whatsapp.ts` (`buildWhatsAppUrl`).

### Other split modules
Large components were split into hooks/helpers; entry files are thin composition roots:
- `sims/SimsAdminManager.tsx` -> `sims/admin/` (header, KPI strip, filter bar, catalog table + pagination, setups section, `ProductFormModal` + `form/*`; table state in `useCatalogTable` over the pure `catalogFilter.ts`, form state in `useProductForm`, field mapping in `productForm.ts`).
- `sims/Sims3DModels.ts` (facade) -> `sims/models/` (`gltfLoader`, `gltfDimensions`, `materials`, `procedural/*`).
- `sims/FullscreenSimsWorld.tsx` studio shell + `sims/ui/*` (swap drawer, setups sheet, walk HUD, controls modal, previews).
- `workstation/WorkstationCanvas3D.tsx` -> `workstation/hooks/*` + `three/*`; `showcase/AppleShowcase.tsx` -> `showcase/sections/*`.

### Accessibility conventions
Modals: `role="dialog"` + `aria-modal`, `useEscapeKey` (stacked, topmost closes) and `useFocusTrap` (traps Tab, restores focus). Clickable things are `<button>`s (or `role="button"` + Enter/Space handling when they must contain buttons).

## Tests
Vitest, node environment, files in `src/__tests__/`: spatial math, setup layout / pricing / save-room, catalog filter + sort. Put new pure logic in modules that can be imported without React to keep it testable.
