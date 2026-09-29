import { useRef } from 'react';

/** Spherical orbit / zoom state (smoothed by the render loop) and pointer handlers for the preview viewport. */
export function usePreviewOrbit() {
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ x: 0.38, y: -0.45 });
  const targetOrbitAngleRef = useRef({ x: 0.38, y: -0.45 });
  const zoomDistRef = useRef<number>(2.4);
  const targetZoomDistRef = useRef<number>(2.4);

  const handleZoom = (factor: number) => {
    targetZoomDistRef.current = Math.max(0.4, Math.min(10.0, targetZoomDistRef.current * factor));
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      isPointerDownRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };

      targetOrbitAngleRef.current.y -= dx * 0.008;
      targetOrbitAngleRef.current.x = Math.max(0.08, Math.min(1.4, targetOrbitAngleRef.current.x + dy * 0.008));
    },
    onPointerUp: (e: React.PointerEvent) => {
      isPointerDownRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    },
    onWheel: (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleZoom(e.deltaY < 0 ? 0.9 : 1.1);
    },
  };

  return {
    isPointerDownRef,
    orbitAngleRef,
    targetOrbitAngleRef,
    zoomDistRef,
    targetZoomDistRef,
    handleZoom,
    handlers,
  };
}

export type PreviewOrbit = ReturnType<typeof usePreviewOrbit>;
