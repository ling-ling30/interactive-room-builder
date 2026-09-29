import { toModelType } from '../../../../data/modelTypes';
import React from 'react';
import { AppleSelect } from '../../ui/AppleSelect';
import { PROCEDURAL_MODEL_OPTIONS } from '../model3dLibrary';
import type { ProductFormApi } from '../useProductForm';

const NUMBER_INPUT_CLASS =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900';

/** Snap a metre value to the nearest quarter tile (min half a tile). */
const metresToTiles = (m: number) => Math.max(0.5, Math.round(m * 4) / 4);

/** 3. Grid footprint, physical size, placement layer and procedural preset. */
export const ProductDimensionsSection: React.FC<{ form: ProductFormApi }> = ({ form }) => {
  const { values, set, patch } = form;
  const { widthTiles, depthTiles, actualWidthM, actualDepthM, actualHeightM, layer, modelType } = values;

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
        3. Dimensions & Spatial Footprint
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Grid Width (Tiles)
          </label>
          <input
            type="number"
            step="0.25"
            min="0.5"
            max="10"
            value={widthTiles}
            onChange={(e) => set('widthTiles', parseFloat(e.target.value))}
            className={NUMBER_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Grid Depth (Tiles)
          </label>
          <input
            type="number"
            step="0.25"
            min="0.5"
            max="10"
            value={depthTiles}
            onChange={(e) => set('depthTiles', parseFloat(e.target.value))}
            className={NUMBER_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Width (m)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.05"
            value={actualWidthM}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0.1;
              patch({ actualWidthM: val, widthTiles: metresToTiles(val) });
            }}
            className={NUMBER_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Depth (m)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.05"
            value={actualDepthM}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0.1;
              patch({ actualDepthM: val, depthTiles: metresToTiles(val) });
            }}
            className={NUMBER_INPUT_CLASS}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Height (m)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.02"
            value={actualHeightM}
            onChange={(e) => set('actualHeightM', parseFloat(e.target.value) || 0.1)}
            className={NUMBER_INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Placement Layer
          </label>
          <AppleSelect
            value={layer}
            onChange={(v) => set('layer', v as 'floor' | 'surface')}
            options={[
              { value: 'floor', label: 'Floor Level', description: 'Desks, Chairs, Pods' },
              { value: 'surface', label: 'Desk Surface', description: 'Monitors, Lamps, Tech' },
            ]}
            className="w-full"
            size="sm"
            buttonClassName="bg-slate-50 border-slate-200"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Procedural Preset (if no 3D file)
          </label>
          <AppleSelect
            value={modelType}
            onChange={(v) => set('modelType', toModelType(v))}
            options={PROCEDURAL_MODEL_OPTIONS}
            className="w-full"
            size="sm"
            align="right"
            buttonClassName="bg-slate-50 border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
