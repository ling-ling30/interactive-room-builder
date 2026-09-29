# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (typecheck is part of build)
npm run lint      # oxlint (not ESLint; config in .oxlintrc.json)
npx tsc -b        # typecheck only
```

No test framework is configured. `scratch/` holds throwaway Node scripts (`*.cjs`) that crawl monis.rent for product data; they are excluded from lint and not part of the app.

`tsc -b` currently reports pre-existing errors in `SimsAdminManager.tsx` (`sounds.playClick` missing from `SoundSystem`) and unused imports in `Model3DInspectModal.tsx`; check against these before assuming your change broke the build.

## Architecture

Vite + React + TypeScript + Tailwind + Three.js (raw, no react-three-fiber). Product is a Bali furniture/desk rental configurator ("Monis") with a Sims-style 3D room builder.

### App shell (`src/App.tsx`)
`App` owns all state and switches between three `uiMode`s: `showcase` (`AppleShowcase` landing), `fullscreen_sims` (`FullscreenSimsWorld`), `admin` (`SimsAdminManager`). Catalog (`SimsProduct[]`), placed furniture (`PlacedFurniture[]`) and `uiMode` are persisted to `localStorage` under versioned keys (`monis_sims_*_v9_scraped`). On load, saved catalog is merged with `SIMS_CATALOG` defaults (new official items appended; `modelUrl` / `actualDimensions` backfilled). Bump the key version when changing saved shape.

`src/context/CatalogContext.tsx`, `components/studio/*`, `components/admin/AdminPortal.tsx` and `data/defaultCatalog.ts` belong to an older "studio" flow that `App` does not mount (no provider in `main.tsx`). The live path is `data/simsCatalog.ts` + `components/sims/*`. `WorkstationStationModal` / `components/workstation/*` is a separate desk-configurator modal launched from `App`.

### Sims room canvas (`src/components/sims/`)
`SimsRoomCanvas.tsx` is a thin composition root; logic is split into hooks in `hooks/` and pure helpers in `three/`. Read `src/components/sims/SIMS_ROOM_CANVAS.md` before editing it (layout, data flow, shortcuts, gotchas). Key points:
- Grid coordinates (`gridX`/`gridZ`, room-corner origin, metres) vs world coordinates (room-centred): convert with `gridToWorld` in `three/spatialMath.ts`.
- Furniture on desks uses `surfaceY` + `mountedOnDeskId`; height comes from `getTableSurfaceYUnder` measuring actual meshes.
- Moving/copying items goes through `movingGroupRef` / `movingInstanceIdRef` / `originBackupRef` (refs in `useSimsRoomRefs`) so cancel can revert.
- The Three.js init effect in `useRoomScene` runs once; room changes flow through its separate update effect. Keep `space` stable (`DEFAULT_SPACE`).
- Meshes are built by `Sims3DModels.ts` (`createFurnitureMesh`): GLB from `product.modelUrl` (files in `public/3dObject/`, custom uploads via `utils/modelStorage.ts`) or procedural fallback by `modelType`.

### Other split modules
Large components were split into hooks/helpers; entry files are thin composition roots:
- `sims/SimsAdminManager.tsx` -> `sims/admin/` (header, KPI strip, filter bar, catalog table, `ProductFormModal` + `form/*` sections; form state in `useProductForm`, field mapping in `productForm.ts`, library/presets in `model3dLibrary.ts`).
- `sims/Sims3DModels.ts` (facade: `createFurnitureMesh`) -> `sims/models/` (`gltfLoader`, `gltfDimensions`, `materials`, `procedural/*` builders registered by `modelType` in `procedural/index.ts`; add new furniture types there).
- `workstation/WorkstationCanvas3D.tsx` -> `workstation/hooks/*` + `three/stationSetup|stationBuilders`; `WorkstationControlsPanel.tsx` -> `workstation/controls/*Tab.tsx`; screen textures in `three/screens/*`.
- `showcase/AppleShowcase.tsx` -> `showcase/sections/*`; `sims/ui/Model3DPreview.tsx` -> `sims/ui/model3dPreview/*`.

### Data
`data/monis*Products.json` are large scraped catalogs (hundreds of KB) feeding `simsCatalog.ts`; avoid reading them whole.
