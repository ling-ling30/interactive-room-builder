import React, { useState, useEffect, useMemo } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { Model3DPreview } from './Model3DPreview';
import { AppleDimensionAdjuster, type DimensionValues } from './AppleDimensionAdjuster';
import { X, Box, Edit3, Copy, Layers, Ruler, Palette, Check, Save } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Model3DInspectModalProps {
  product: SimsProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: SimsProduct) => void;
  onDuplicate?: (product: SimsProduct) => void;
  onUpdateDimensions?: (productId: string, dimensions: DimensionValues) => void;
}

const PREVIEW_PALETTE = [
  { name: 'Natural Oak', hex: '#d4a373' },
  { name: 'Deep Walnut', hex: '#5c4033' },
  { name: 'Matte Charcoal', hex: '#1e293b' },
  { name: 'Studio Silver', hex: '#cbd5e1' },
  { name: 'Alpine White', hex: '#f8fafc' },
  { name: 'Cobalt Blue', hex: '#2563eb' },
  { name: 'Emerald Studio', hex: '#059669' },
];

export const Model3DInspectModal: React.FC<Model3DInspectModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onUpdateDimensions,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calibrate' | 'specs'>('calibrate');
  const [liveDimensions, setLiveDimensions] = useState<DimensionValues>({
    widthM: 1.2,
    depthM: 0.6,
    heightM: 0.74,
    scaleMultiplier: 1.0,
    fitMode: 'proportional',
  });
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Sync initial dimensions when product opens
  useEffect(() => {
    if (product) {
      setSelectedColor(null);
      setLiveDimensions({
        widthM: product.actualDimensions?.widthM ?? product.footprint.width ?? 1.2,
        depthM: product.actualDimensions?.depthM ?? product.footprint.depth ?? 0.6,
        heightM: product.actualDimensions?.heightM ?? (product.heightCm ? product.heightCm / 100 : 0.74),
        scaleMultiplier: product.scaleMultiplier ?? 1.0,
        fitMode: product.fitMode ?? (product.category === 'desks' ? 'exact' : 'proportional'),
      });
      setHasChanges(false);
    }
  }, [product]);

  const currentColor = selectedColor || product?.color || '#d4a373';

  // Construct calibrated product for 3D preview
  const calibratedProduct = useMemo<SimsProduct | null>(() => {
    if (!product) return null;
    return {
      ...product,
      color: currentColor,
      actualDimensions: {
        widthM: liveDimensions.widthM,
        depthM: liveDimensions.depthM,
        heightM: liveDimensions.heightM,
      },
      scaleMultiplier: liveDimensions.scaleMultiplier,
      fitMode: liveDimensions.fitMode,
    };
  }, [product, currentColor, liveDimensions]);

  useEscapeKey(isOpen && Boolean(product), onClose);

  if (!isOpen || !product || !calibratedProduct) return null;

  const handleDimensionChange = (updated: DimensionValues) => {
    setLiveDimensions(updated);
    setHasChanges(true);
  };

  const handleSaveDimensions = () => {
    sounds.playPlace();
    if (onUpdateDimensions) {
      onUpdateDimensions(product.id, liveDimensions);
    }
    setHasChanges(false);
  };

  const handleOpenEdit = () => {
    onClose();
    if (onEdit) {
      onEdit(calibratedProduct);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="3D model inspector"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="bg-[#0f141f] border border-white/15 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row text-white max-h-[94vh]">
        {/* Left: 3D Turntable Studio Viewport */}
        <div className="flex-1 min-h-[380px] md:min-h-[560px] relative bg-gradient-to-b from-[#f8f3e6] via-[#f3ecdb] to-[#ece2c9] flex flex-col">
          <Model3DPreview
            product={calibratedProduct}
            colorOverride={currentColor}
            height="100%"
            autoRotateDefault={true}
            minimal
            className="flex-1 !rounded-none !border-none"
          />

          {/* Color Switcher Bar below 3D canvas */}
          <div className="p-3 bg-[#f3ecdb] border-t border-[#e2d7bd] flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-cyan-600 ml-1" />
              <span className="text-[11px] font-mono text-stone-600 font-semibold">Finish:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PREVIEW_PALETTE.map((pal) => {
                  const isCur = currentColor.toLowerCase() === pal.hex.toLowerCase();
                  return (
                    <button
                      key={pal.hex}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedColor(pal.hex);
                      }}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        isCur
                          ? 'border-cyan-400 scale-110 shadow-glow'
                          : 'border-white/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: pal.hex }}
                      title={pal.name}
                    >
                      {isCur && <Check className="w-3 h-3 text-white drop-shadow-md stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedColor && selectedColor !== product.color && (
              <button
                type="button"
                onClick={() => setSelectedColor(null)}
                className="text-[10px] text-stone-500 hover:text-stone-900 underline cursor-pointer font-mono"
              >
                Reset Finish
              </button>
            )}
          </div>
        </div>

        {/* Right: Dimension Calibrator & Technical Specifications */}
        <div className="w-full md:w-[420px] p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-[#0c1018] overflow-y-auto">
          <div className="space-y-4">
            {/* Header with Title and Close Button */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    {product.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {product.brand}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white leading-snug">
                  {product.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="apple-press p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Apple-Style Segmented Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.05] border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('calibrate');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'calibrate'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Adjust Dimensions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('specs');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'specs'
                    ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Specifications</span>
              </button>
            </div>

            {/* Tab 1: Apple Dimension Adjuster */}
            {activeTab === 'calibrate' && (
              <div className="space-y-3">
                <AppleDimensionAdjuster
                  dimensions={liveDimensions}
                  category={product.category}
                  onChange={handleDimensionChange}
                  className="!border-white/10 !bg-white/[0.03] !text-white"
                />

                {/* Save Calibrated Dimensions Button */}
                {hasChanges && onUpdateDimensions && (
                  <button
                    type="button"
                    onClick={handleSaveDimensions}
                    className="apple-press w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg animate-fade-in"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply & Save True-to-Life Dimensions</span>
                  </button>
                )}
              </div>
            )}

            {/* Tab 2: Technical Specifications & Rental Rates */}
            {activeTab === 'specs' && (
              <div className="space-y-4 animate-fade-in">
                {/* Price & Deposit Stats */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 font-mono">Weekly Rental</div>
                    <div className="text-xl font-extrabold font-mono text-emerald-400">
                      ${product.weeklyRent}<span className="text-xs text-zinc-400 font-normal">/wk</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 font-mono">Monthly Rate</div>
                    <div className="text-lg font-bold font-mono text-white">
                      ${product.monthlyRent}<span className="text-xs text-zinc-400 font-normal">/mo</span>
                    </div>
                  </div>
                  <div className="text-right pl-3 border-l border-white/10">
                    <div className="text-[10px] text-zinc-400 font-mono">Deposit</div>
                    <div className="text-sm font-bold font-mono text-zinc-300">
                      ${product.deposit}
                    </div>
                  </div>
                </div>

                {/* Spatial & Physical Specs */}
                <div className="space-y-2 text-xs">
                  <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                    Spatial Specifications
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-zinc-500 text-[10px] flex items-center gap-1 mb-0.5">
                        <Ruler className="w-3 h-3 text-cyan-400" />
                        <span>Grid Footprint</span>
                      </div>
                      <div className="text-white font-bold">
                        {product.footprint.width} × {product.footprint.depth} tiles
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-zinc-500 text-[10px] flex items-center gap-1 mb-0.5">
                        <Layers className="w-3 h-3 text-emerald-400" />
                        <span>Placement Layer</span>
                      </div>
                      <div className="text-white font-bold capitalize">
                        {product.layer === 'surface' ? 'Desk Surface' : 'Floor Level'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 col-span-2">
                      <div className="text-zinc-500 text-[10px] flex items-center gap-1 mb-0.5">
                        <Box className="w-3 h-3 text-amber-400" />
                        <span>True Physical Size</span>
                      </div>
                      <div className="text-white font-bold">
                        {Math.round(liveDimensions.widthM * 100)} × {Math.round(liveDimensions.depthM * 100)} × {Math.round(liveDimensions.heightM * 100)} cm
                        <span className="text-zinc-500 font-normal ml-2">
                          ({liveDimensions.widthM.toFixed(2)}m × {liveDimensions.depthM.toFixed(2)}m)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Asset Source */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                    3D Asset Model
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 font-mono text-[11px] flex items-center gap-2">
                    <Box className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {product.modelUrl ? product.modelUrl : `Procedural fallback (${product.modelType})`}
                    </span>
                  </div>
                </div>

                {/* Description & Material */}
                {(product.description || product.material) && (
                  <div className="text-xs text-zinc-400 leading-relaxed space-y-1 border-t border-white/10 pt-3">
                    {product.material && (
                      <p className="font-medium text-zinc-300">
                        <strong className="text-zinc-500">Material:</strong> {product.material}
                      </p>
                    )}
                    {product.description && <p>{product.description}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 mt-3">
            {onEdit && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="apple-press flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-800" />
                <span>Edit in CMS</span>
              </button>
            )}

            {onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  onDuplicate(calibratedProduct);
                }}
                className="apple-press py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition cursor-pointer"
                title="Duplicate this item"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copy</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
