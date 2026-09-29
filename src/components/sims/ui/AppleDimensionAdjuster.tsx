import React, { useState } from 'react';
import { Ruler, Lock, Unlock, RotateCcw, Sparkles, Check } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';

export interface DimensionValues {
  widthM: number;
  depthM: number;
  heightM: number;
  scaleMultiplier?: number;
  fitMode?: 'proportional' | 'exact';
}

interface AppleDimensionAdjusterProps {
  dimensions: DimensionValues;
  category?: string;
  onChange: (updated: DimensionValues) => void;
  className?: string;
}

export const AppleDimensionAdjuster: React.FC<AppleDimensionAdjusterProps> = ({
  dimensions,
  onChange,
  className = '',
}) => {
  const [unit, setUnit] = useState<'cm' | 'm'>('cm');
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(false);

  // Convert current dimensions to cm
  const widthCm = Math.round(dimensions.widthM * 100);
  const depthCm = Math.round(dimensions.depthM * 100);
  const heightCm = Math.round(dimensions.heightM * 100);
  const scalePercent = Math.round((dimensions.scaleMultiplier ?? 1.0) * 100);
  const fitMode = dimensions.fitMode ?? 'proportional';
  const handleWidthChange = (newWidthCm: number) => {
    const clampedW = Math.max(5, Math.min(400, newWidthCm));
    const newWidthM = clampedW / 100;
    
    if (isRatioLocked && widthCm > 0) {
      const ratio = clampedW / widthCm;
      const newDepthM = Math.max(0.05, Math.min(4.0, (depthCm * ratio) / 100));
      const newHeightM = Math.max(0.02, Math.min(3.0, (heightCm * ratio) / 100));
      onChange({
        ...dimensions,
        widthM: Number(newWidthM.toFixed(3)),
        depthM: Number(newDepthM.toFixed(3)),
        heightM: Number(newHeightM.toFixed(3)),
      });
    } else {
      onChange({
        ...dimensions,
        widthM: Number(newWidthM.toFixed(3)),
      });
    }
  };

  const handleDepthChange = (newDepthCm: number) => {
    const clampedD = Math.max(5, Math.min(400, newDepthCm));
    const newDepthM = clampedD / 100;

    if (isRatioLocked && depthCm > 0) {
      const ratio = clampedD / depthCm;
      const newWidthM = Math.max(0.05, Math.min(4.0, (widthCm * ratio) / 100));
      const newHeightM = Math.max(0.02, Math.min(3.0, (heightCm * ratio) / 100));
      onChange({
        ...dimensions,
        widthM: Number(newWidthM.toFixed(3)),
        depthM: Number(newDepthM.toFixed(3)),
        heightM: Number(newHeightM.toFixed(3)),
      });
    } else {
      onChange({
        ...dimensions,
        depthM: Number(newDepthM.toFixed(3)),
      });
    }
  };

  const handleHeightChange = (newHeightCm: number) => {
    const clampedH = Math.max(2, Math.min(300, newHeightCm));
    const newHeightM = clampedH / 100;

    if (isRatioLocked && heightCm > 0) {
      const ratio = clampedH / heightCm;
      const newWidthM = Math.max(0.05, Math.min(4.0, (widthCm * ratio) / 100));
      const newDepthM = Math.max(0.05, Math.min(4.0, (depthCm * ratio) / 100));
      onChange({
        ...dimensions,
        widthM: Number(newWidthM.toFixed(3)),
        depthM: Number(newDepthM.toFixed(3)),
        heightM: Number(newHeightM.toFixed(3)),
      });
    } else {
      onChange({
        ...dimensions,
        heightM: Number(newHeightM.toFixed(3)),
      });
    }
  };

  const handleScaleMultiplierChange = (newScalePercent: number) => {
    const clamped = Math.max(30, Math.min(250, newScalePercent));
    onChange({
      ...dimensions,
      scaleMultiplier: Number((clamped / 100).toFixed(2)),
    });
  };

  const handleFitModeChange = (mode: 'proportional' | 'exact') => {
    sounds.playClick();
    onChange({
      ...dimensions,
      fitMode: mode,
    });
  };
  const handleReset = () => {
    sounds.playClick();
    onChange({
      widthM: 1.4,
      depthM: 0.7,
      heightM: 0.74,
      scaleMultiplier: 1.0,
      fitMode: 'proportional',
    });
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-xl overflow-hidden transition-all duration-300 text-slate-800 dark:text-slate-100 ${className}`}
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.25)',
      }}
    >
      {/* Apple-style Header Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Physical Dimensions & Scale</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                1:1 True-to-Life
              </span>
            </h3>
          </div>
        </div>

        {/* Apple Segmented Controls for Units & Ratio Lock */}
        <div className="flex items-center gap-1.5">
          {/* Lock Aspect Ratio Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsRatioLocked(prev => !prev);
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
              isRatioLocked
                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isRatioLocked ? 'Aspect Ratio Locked (Proportional)' : 'Aspect Ratio Unlocked (Free Stretch)'}
          >
            {isRatioLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Unit Toggle: cm vs m */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setUnit('cm');
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                unit === 'cm'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setUnit('m');
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                unit === 'm'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              m
            </button>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Reset to 140x70x74cm standard"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Apple Segmented Fit Mode: Proportional vs Exact */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider text-[10px] font-bold">Scaling Geometry Engine</span>
            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
              {fitMode === 'proportional' ? 'Preserves 1:1 Mesh Ratio' : 'Exact Non-Uniform Stretch'}
            </span>
          </div>

          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 gap-1">
            <button
              type="button"
              onClick={() => handleFitModeChange('proportional')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                fitMode === 'proportional'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>Proportional Fit</span>
              {fitMode === 'proportional' && <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
            </button>

            <button
              type="button"
              onClick={() => handleFitModeChange('exact')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                fitMode === 'exact'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>Exact Box Match</span>
              {fitMode === 'exact' && <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Dimensional Sliders & Steppers (Direct 1:1 Manipulation) */}
        <div className="space-y-3.5">
          {/* Width (X) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Width (X)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {unit === 'cm' ? `${widthCm} cm` : `${dimensions.widthM.toFixed(2)} m`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleWidthChange(widthCm - 5)}
                    className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWidthChange(widthCm + 5)}
                    className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={10}
              max={300}
              step={1}
              value={widthCm}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Depth (Z) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>Depth (Z)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {unit === 'cm' ? `${depthCm} cm` : `${dimensions.depthM.toFixed(2)} m`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDepthChange(depthCm - 5)}
                    className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDepthChange(depthCm + 5)}
                    className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={10}
              max={250}
              step={1}
              value={depthCm}
              onChange={(e) => handleDepthChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Height (Y) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Height (Y)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {unit === 'cm' ? `${heightCm} cm` : `${dimensions.heightM.toFixed(2)} m`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleHeightChange(heightCm - 2)}
                    className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHeightChange(heightCm + 2)}
                    className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={2}
              max={240}
              step={1}
              value={heightCm}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Scale Multiplier Slider (Fine-tune GLB Asset Scaling) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Asset Scale Multiplier</span>
              </span>
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {scalePercent}% ({dimensions.scaleMultiplier?.toFixed(2) ?? '1.00'}x)
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={1}
              value={scalePercent}
              onChange={(e) => handleScaleMultiplierChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
