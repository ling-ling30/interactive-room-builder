# SimsRoomCanvas architecture

`SimsRoomCanvas.tsx` (~310 lines) only composes hooks and renders JSX. Logic lives in hooks and helpers under `src/components/sims/`.

## Layout

```
sims/
├── SimsRoomCanvas.tsx          # composition root + JSX
├── simsRoomTypes.ts            # props, LifecycleState, MovingGroup*, SnapStep, CenterSnapInfo
├── hooks/
│   ├── useSimsCamera.ts        # orbit / pan / zoom / walk camera (pre-existing)
│   ├── useSimsRoomRefs.ts      # all shared mutable refs
│   ├── useSimsSelection.ts     # selectedInstanceIds + derived items/product/rent
│   ├── usePlacementState.ts    # hoverTile, heldRotation, snapStep, centerSnapInfo, hover hint
│   ├── useWalkModeSync.ts      # sync walk mode / eye height / heading / toggle with parent
│   ├── useRoomScene.ts         # scene, lights, renderer, render loop, room architecture updates
│   ├── usePlacedItemsSync.ts   # placedItems -> meshes, selection glow, plumbob
│   ├── useGhostMesh.ts         # translucent preview of held item / group
│   ├── useFurnitureActions.ts  # pickup, cancel, drop, duplicate, delete, rotate
│   ├── useHeldPlacementPointer.ts # pointer -> snapped tile, desk surface, catalog drag-drop
│   ├── useCanvasPointerHandlers.ts # DOM pointer/wheel handlers (orbit, pan, select, drag-move)
│   └── useSimsKeyboard.ts      # keyboard shortcuts, returns active walk keys
├── three/
│   ├── roomArchitecture.ts     # floor, walls, window, skirting, grid, plumbob (pre-existing)
│   ├── spatialMath.ts          # footprints, snapping, desk surface (pre-existing)
│   ├── sceneHelpers.ts         # lights, theme, disposal, hover tile, walk obstacles, bubble tracking
│   └── pointerPicking.ts       # NDC conversion + furniture raycast picking
└── ui/
    └── HoverHintPill.tsx       # idle hover tooltip
```

## Data flow

1. `useSimsRoomRefs` creates every ref once; `SimsRoomCanvas` passes `refs` to hooks.
2. State hooks (`useSimsSelection`, `usePlacementState`) own React state.
3. Latest-value refs (`isWalkModeRef`, `placedItemsRef`, `catalogRef`, `selectedInstanceIdsRef`, room size refs) are assigned during render so the 60FPS loop and window listeners never read stale values.
4. `useRoomScene` builds Three.js once on mount and returns `sceneReady`, a counter bumped when meshes need re-syncing (scene built, GLB loaded).
5. `useFurnitureActions` mutates moving-group refs and calls parent callbacks (`onPlaceItem`, `onUpdateItem`, ...).
6. `useHeldPlacementPointer` and `useCanvasPointerHandlers` translate input into tiles, selection, drags.

## Keyboard shortcuts

| Key | Action |
|---|---|
| R / Shift+R | rotate 5° CW / CCW |
| M | move selection |
| Esc | cancel held / clear selection / exit walk mode |
| Del / Backspace | delete selection |
| Ctrl+D, Ctrl+C, + | duplicate selection |
| G | cycle snap step |
| Space (hold) / H | pan |
| Q / E | orbit step (nothing held or selected) |
| Numpad 1-9 | set orientation |
| WASD / arrows / Shift | walk mode move / sprint |

## Gotchas

- Effects in `useRoomScene` (init) and `useGhostMesh` intentionally use narrow dependency lists. Do not add deps without checking for scene rebuilds or ghost flicker.
- Init effect runs once; room changes go through the architecture-update effect.
- `space` falls back to `DEFAULT_SPACE` (stable object). Do not inline a new object, it retriggers the architecture effect every render.
- `disposeGeometries` (grid) vs `disposeMeshes` (walls, window, furniture): grid and skirting materials are not disposed.
- Held rotation for groups: use `stepHeldRotation`, it also rotates each group item and its ghost child.
- Surface items (desk accessories) go through `isSurfaceItem` + `getTableSurfaceYUnder` for height.

## Adding features

- New shortcut: `useSimsKeyboard.ts`.
- New pointer gesture: `useCanvasPointerHandlers.ts`.
- New furniture operation: `useFurnitureActions.ts`.
- New scene object: create in `three/`, add in `useRoomScene.ts` init, dispose in the update effect.
- New HUD element: component in `ui/`, mount in `SimsRoomCanvas.tsx`.
