import { useCallback, useRef } from 'react';
import * as THREE from 'three';

/** Spherical orbit camera state plus pointer / wheel handlers for a container element. */
export function useOrbitCamera() {
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({
    radius: 2.1,
    theta: Math.PI / 4, // 45 deg azimuth
    phi: Math.PI / 3,   // 60 deg elevation
  });
  const targetCenterRef = useRef(new THREE.Vector3(0, 0.85, 0));

  /** Places `camera` on the orbit sphere around the current target and aims it at the target. */
  const updateCamera = useCallback((camera: THREE.PerspectiveCamera | null) => {
    if (!camera) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.set(
      targetCenterRef.current.x + x,
      targetCenterRef.current.y + y,
      targetCenterRef.current.z + z
    );
    camera.lookAt(targetCenterRef.current);
  }, []);

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      isPointerDownRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.007;
      sphericalRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - dy * 0.007));
    },
    onPointerUp: () => {
      isPointerDownRef.current = false;
    },
    onWheel: (e: React.WheelEvent) => {
      sphericalRef.current.radius = Math.max(1.2, Math.min(3.8, sphericalRef.current.radius + e.deltaY * 0.0018));
    },
  };

  return { targetCenterRef, updateCamera, handlers };
}
