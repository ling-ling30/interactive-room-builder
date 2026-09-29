import React, { useRef } from 'react';
import { Upload, CheckCircle2, Image as ImageIcon, Box, Eye, Ruler } from 'lucide-react';
import type { SimsProduct } from '../../../../data/simsCatalog';
import { sounds } from '../../../../utils/soundEffects';
import { saveModelToStorage } from '../../../../utils/modelStorage';
import { AppleSelect } from '../../ui/AppleSelect';
import { Model3DPreview } from '../../ui/Model3DPreview';
import { AppleDimensionAdjuster, type DimensionValues } from '../../ui/AppleDimensionAdjuster';
import { CollapsibleSection } from './CollapsibleSection';
import { PUBLIC_3D_LIBRARY, getPresetFieldsForModelPath } from '../model3dLibrary';
import type { ShowStatus } from '../useAdminStatus';
import type { ProductFormApi } from '../useProductForm';

interface ProductMediaSectionProps {
  form: ProductFormApi;
  editingItem: SimsProduct | null;
  previewProduct: SimsProduct;
  showStatus: ShowStatus;
  onInspectPreview: () => void;
}

/** 2. Real photo, 3D model (library / upload / URL) with live preview + dimension calibrator, icon and tint. */
export const ProductMediaSection: React.FC<ProductMediaSectionProps> = ({
  form,
  editingItem,
  previewProduct,
  showStatus,
  onInspectPreview,
}) => {
  const { values, set, patch } = form;
  const {
    imageUrl, icon, color, modelUrl, modelFileName, category,
    actualWidthM, actualDepthM, actualHeightM, scaleMultiplier, fitMode,
  } = values;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // Convert to Data URL so the photo persists seamlessly in state & storage
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showStatus('Image file is too large (max 5MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      set('imageUrl', event.target?.result as string);
      showStatus(`Loaded photo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // 3D model upload (.glb binary, stored in IndexedDB)
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb') {
      showStatus('Please upload a self-contained 3D model in .glb format', 'error');
      return;
    }

    try {
      showStatus(`Attaching ${file.name}...`);
      const targetId = editingItem?.id || `prod-${Date.now()}`;
      const blobUrl = await saveModelToStorage(targetId, file, file.name);

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      patch({ modelUrl: blobUrl, modelFileName: `${file.name} (${sizeMB} MB GLB)` });
      showStatus(`Attached 3D model: ${file.name} (${sizeMB} MB)`);
    } catch (saveErr) {
      console.error('Failed to save 3D model to IndexedDB:', saveErr);
      showStatus('Failed to process 3D model file', 'error');
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
        2. Visual Assets & 3D Model
      </h4>

      {/* Real Photo Upload & URL */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-700" />
            <span>Product Photo (Real Image)</span>
          </label>
          <span className="text-[10px] text-emerald-700 font-medium font-mono">Replaces emoji icon</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Image Preview Box */}
          <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-contain p-1" />
            ) : (
              <div className="text-center text-slate-400">
                <span className="text-2xl">{icon || '📷'}</span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="apple-press px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo File</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => set('imageUrl', '')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="Or paste image URL (https://...)"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3D Model Asset & Interactive Preview */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-cyan-600" />
            <span>3D Model Asset & Live Studio Preview</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-700 font-mono font-semibold px-2 py-0.5 bg-cyan-100/60 rounded-full border border-cyan-200">
              {modelUrl ? 'Custom .GLB Asset' : 'Procedural 3D Fallback'}
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onInspectPreview();
              }}
              className="apple-press text-[11px] text-slate-600 hover:text-cyan-700 font-semibold flex items-center gap-1 cursor-pointer"
              title="Open Fullscreen 3D Inspection Studio"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-600" />
              <span>Theater Mode</span>
            </button>
          </div>
        </div>

        {/* Live 3D Viewport */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-gradient-to-b from-[#f8f3e6] via-[#f3ecdb] to-[#ece2c9] relative">
          <Model3DPreview
            product={previewProduct}
            colorOverride={color}
            height={240}
            showControls={true}
            showStats={true}
            onOpenExpanded={onInspectPreview}
          />
        </div>

        {/* Advanced 3D Settings: true-to-life dimensions, scale and fit (collapsed by default) */}
        <CollapsibleSection
          title="Advanced 3D Settings"
          icon={<Ruler className="w-3.5 h-3.5 text-cyan-600" />}
          badge="Live 3D Scaling"
        >
          <AppleDimensionAdjuster
            dimensions={{
              widthM: actualWidthM,
              depthM: actualDepthM,
              heightM: actualHeightM,
              scaleMultiplier,
              fitMode,
            }}
            className="!bg-[#faf6ec] !border-[#e2d7bd] !shadow-none"
          category={category}
            onChange={(updated: DimensionValues) => {
              patch({
                actualWidthM: updated.widthM,
                actualDepthM: updated.depthM,
                actualHeightM: updated.heightM,
                ...(updated.scaleMultiplier !== undefined && { scaleMultiplier: updated.scaleMultiplier }),
                ...(updated.fitMode !== undefined && { fitMode: updated.fitMode }),
                // Auto-sync tile footprint
                widthTiles: Math.max(0.5, Math.round(updated.widthM * 4) / 4),
                depthTiles: Math.max(0.5, Math.round(updated.depthM * 4) / 4),
              });
            }}
          />
        </CollapsibleSection>

        {/* Asset Source Controls */}
        <div className="space-y-2.5 pt-1">
          {/* Select from Built-in 3D Assets Library */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
              <span>Preset 3D Models (public/3dObject/)</span>
              <span className="text-[9px] font-mono text-cyan-600 font-semibold">14 Ready Models</span>
            </label>
            <AppleSelect
              value={modelUrl}
              onChange={(selectedPath) => {
                const asset = PUBLIC_3D_LIBRARY.find(a => a.value === selectedPath);
                patch({
                  modelUrl: selectedPath,
                  modelFileName: asset ? asset.label : '',
                  ...getPresetFieldsForModelPath(selectedPath),
                });
              }}
              options={PUBLIC_3D_LIBRARY}
              className="w-full"
              size="sm"
              buttonClassName="bg-white border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => modelInputRef.current?.click()}
              className="apple-press px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-600" />
              <span>Upload Custom .glb</span>
            </button>
            <input
              ref={modelInputRef}
              type="file"
              accept=".glb"
              onChange={handleModelUpload}
              className="hidden"
            />
            {modelUrl && (
              <button
                type="button"
                onClick={() => patch({ modelUrl: '', modelFileName: '' })}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
              >
                Remove 3D File (Use Procedural)
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-500 leading-snug">
            Use self-contained <strong>.glb</strong> format (all geometry, materials, and textures packed into one single file). Or leave empty to use procedural fallback.
          </p>

          <input
            type="text"
            value={modelUrl}
            onChange={(e) => patch({
              modelUrl: e.target.value,
              modelFileName: e.target.value ? 'Remote 3D URL' : '',
            })}
            placeholder="Or paste public 3D .glb URL (https://.../model.glb)"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
          />

          {modelFileName && (
            <div className="text-[10px] text-cyan-700 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-600" />
              <span>{modelFileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fallback Icon & Procedural Color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Fallback Emoji Icon
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => set('icon', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-center font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Material Tint Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => set('color', e.target.value)}
              className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => set('color', e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
