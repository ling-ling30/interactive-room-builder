import React, { useRef } from 'react';
import type { WorkstationConfig } from '../../types/workstation';
import { useOrbitCamera } from './hooks/useOrbitCamera';
import { useStationScene } from './hooks/useStationScene';
import { useStationGeometry } from './hooks/useStationGeometry';

interface WorkstationCanvas3DProps {
  config: WorkstationConfig;
  className?: string;
}

export const WorkstationCanvas3D: React.FC<WorkstationCanvas3DProps> = ({ config, className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const orbit = useOrbitCamera();
  const sceneRefs = useStationScene(mountRef, config.deskHeightCm, orbit);
  useStationGeometry(config, sceneRefs);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none ${className}`}
      onPointerDown={orbit.handlers.onPointerDown}
      onPointerMove={orbit.handlers.onPointerMove}
      onPointerUp={orbit.handlers.onPointerUp}
      onPointerCancel={orbit.handlers.onPointerUp}
      onWheel={orbit.handlers.onWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
