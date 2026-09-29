import React, { useRef, useState } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { sounds } from '../../../utils/soundEffects';
import { buildPreviewProduct } from './model3dPreview/previewHelpers';
import { usePreviewOrbit } from './model3dPreview/usePreviewOrbit';
import { useModelPreviewScene } from './model3dPreview/useModelPreviewScene';
import { PreviewBadges } from './model3dPreview/PreviewBadges';
import { PreviewControls } from './model3dPreview/PreviewControls';

interface Model3DPreviewProps {
  product: Partial<SimsProduct>;
  colorOverride?: string;
  height?: number | string;
  autoRotateDefault?: boolean;
  showControls?: boolean;
  showStats?: boolean;
  className?: string;
  onOpenExpanded?: () => void;
}

export const Model3DPreview: React.FC<Model3DPreviewProps> = ({
  product,
  colorOverride,
  height = 240,
  autoRotateDefault = true,
  showControls = true,
  showStats = true,
  className = '',
  onOpenExpanded,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(autoRotateDefault);
  const [isGridOn, setIsGridOn] = useState<boolean>(true);

  // Latest-value refs read by the render loop / model loader
  const autoRotateRef = useRef(isAutoRotate);
  autoRotateRef.current = isAutoRotate;
  const isWireframeRef = useRef(isWireframe);
  isWireframeRef.current = isWireframe;

  // Build full synthetic SimsProduct for mesh generation
  const activeColor = colorOverride || product.color || '#d4a373';
  const effectiveProduct = buildPreviewProduct(product, activeColor);

  const targetW = effectiveProduct.actualDimensions?.widthM ?? 1.2;
  const targetD = effectiveProduct.actualDimensions?.depthM ?? 0.6;
  const targetH = effectiveProduct.actualDimensions?.heightM ?? 0.74;

  const orbit = usePreviewOrbit();
  const { isLoading, triangleCount, applyWireframe, resetCamera } = useModelPreviewScene({
    mountRef,
    height,
    product: effectiveProduct,
    activeColor,
    isGridOn,
    autoRotateRef,
    isWireframeRef,
    orbit,
  });

  const toggleWireframe = () => {
    sounds.playClick();
    setIsWireframe((prev) => {
      const next = !prev;
      applyWireframe(next);
      return next;
    });
  };

  const widthCm = Math.round(targetW * 100);
  const depthCm = Math.round(targetD * 100);
  const heightCm = Math.round(targetH * 100);
  const scalePercent = Math.round((effectiveProduct.scaleMultiplier ?? 1.0) * 100);

  return (
    <div
      ref={mountRef}
      onPointerDown={orbit.handlers.onPointerDown}
      onPointerMove={orbit.handlers.onPointerMove}
      onPointerUp={orbit.handlers.onPointerUp}
      onPointerCancel={orbit.handlers.onPointerUp}
      onWheel={orbit.handlers.onWheel}
      className={`relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ height }}
    >
      <PreviewBadges
        hasGlbAsset={Boolean(effectiveProduct.modelUrl)}
        widthCm={widthCm}
        depthCm={depthCm}
        heightCm={heightCm}
        scalePercent={scalePercent}
        triangleCount={triangleCount}
        isLoading={isLoading}
        onOpenExpanded={onOpenExpanded}
      />

      {showControls && (
        <PreviewControls
          showStats={showStats}
          widthCm={widthCm}
          depthCm={depthCm}
          heightCm={heightCm}
          isAutoRotate={isAutoRotate}
          isWireframe={isWireframe}
          isGridOn={isGridOn}
          onToggleAutoRotate={() => setIsAutoRotate((prev) => !prev)}
          onToggleWireframe={toggleWireframe}
          onToggleGrid={() => {
            sounds.playClick();
            setIsGridOn((prev) => !prev);
          }}
          onZoomIn={() => orbit.handleZoom(0.85)}
          onZoomOut={() => orbit.handleZoom(1.15)}
          onResetCamera={() => {
            sounds.playClick();
            resetCamera();
          }}
        />
      )}
    </div>
  );
};
