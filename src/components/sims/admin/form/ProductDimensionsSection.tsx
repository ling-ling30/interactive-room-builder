import React from 'react';
import { toModelType } from '../../../../data/modelTypes';
import { NumberInput, type NumberValue } from '../../../ui/NumberInput';
import { AppleSelect } from '../../ui/AppleSelect';
import { PROCEDURAL_MODEL_OPTIONS } from '../model3dLibrary';
import type { ProductFormApi } from '../useProductForm';
import { FieldError } from './FieldError';
import { fieldBorder } from './fieldStyles';

const inputClass = (error?: string) =>
  `w-full bg-slate-50 border ${fieldBorder(error)} rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none`;

/** Snap a metre value to the nearest quarter tile (min half a tile). */
const metresToTiles = (m: number) => Math.max(0.5, Math.round(m * 4) / 4);

/** 3. Grid footprint, physical size, placement layer and procedural preset. */
export const ProductDimensionsSection: React.FC<{ form: ProductFormApi }> = ({ form }) => {
  const { values, set, patch, errors } = form;
  const { widthTiles, depthTiles, actualWidthM, actualDepthM, actualHeightM, layer, modelType } = values;

  /** Real size drives the tile footprint while it holds a usable number. */
  const setMetres = (key: 'actualWidthM' | 'actualDepthM', tilesKey: 'widthTiles' | 'depthTiles', v: NumberValue) => {
    patch(v !== '' && v > 0 ? { [key]: v, [tilesKey]: metresToTiles(v) } : { [key]: v });
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
        3. Dimensions & Spatial Footprint
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <label htmlFor="pf-width-tiles" className="text-[11px] font-bold text-slate-700 block mb-1">
            Grid Width (Tiles)
          </label>
          <NumberInput
            id="pf-width-tiles"
            value={widthTiles}
            onChange={(v) => set('widthTiles', v)}
            aria-invalid={Boolean(errors.widthTiles)}
            className={inputClass(errors.widthTiles)}
          />
          <FieldError message={errors.widthTiles} />
        </div>

        <div>
          <label htmlFor="pf-depth-tiles" className="text-[11px] font-bold text-slate-700 block mb-1">
            Grid Depth (Tiles)
          </label>
          <NumberInput
            id="pf-depth-tiles"
            value={depthTiles}
            onChange={(v) => set('depthTiles', v)}
            aria-invalid={Boolean(errors.depthTiles)}
            className={inputClass(errors.depthTiles)}
          />
          <FieldError message={errors.depthTiles} />
        </div>

        <div>
          <label htmlFor="pf-width-m" className="text-[11px] font-bold text-slate-700 block mb-1">
            Width (m)
          </label>
          <NumberInput
            id="pf-width-m"
            value={actualWidthM}
            onChange={(v) => setMetres('actualWidthM', 'widthTiles', v)}
            aria-invalid={Boolean(errors.actualWidthM)}
            className={inputClass(errors.actualWidthM)}
          />
          <FieldError message={errors.actualWidthM} />
        </div>

        <div>
          <label htmlFor="pf-depth-m" className="text-[11px] font-bold text-slate-700 block mb-1">
            Depth (m)
          </label>
          <NumberInput
            id="pf-depth-m"
            value={actualDepthM}
            onChange={(v) => setMetres('actualDepthM', 'depthTiles', v)}
            aria-invalid={Boolean(errors.actualDepthM)}
            className={inputClass(errors.actualDepthM)}
          />
          <FieldError message={errors.actualDepthM} />
        </div>

        <div>
          <label htmlFor="pf-height-m" className="text-[11px] font-bold text-slate-700 block mb-1">
            Height (m)
          </label>
          <NumberInput
            id="pf-height-m"
            value={actualHeightM}
            onChange={(v) => set('actualHeightM', v)}
            aria-invalid={Boolean(errors.actualHeightM)}
            className={inputClass(errors.actualHeightM)}
          />
          <FieldError message={errors.actualHeightM} />
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
