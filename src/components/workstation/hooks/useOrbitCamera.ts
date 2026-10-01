import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import type { DeskStudioSlot } from '../../../types/workstation';

export interface CameraPreset {
  radius: number;
  theta: number; // Azimuth angle (radians)
  phi: number;   // Polar elevation angle (radians)
  target: THREE.Vector3;
}

const CAMERA_PRESETS: Record<string, CameraPreset> = {
  overview: {
    radius: 3.65, // Generous wide-angle studio overview, comfortably framed
    theta: 1.28, // Tangent to front desk edge (~73.3 degrees azimuth)
    phi: 1.00,   // Elevated angle looking down across the desk surface
    target: new THREE.Vector3(0, 0.75, 0.05),
  },
  table: {
    radius: 2.95, // Comfortable desk focus with full perimeter
    theta: 1.25,
    phi: 1.02,
    target: new THREE.Vector3(0, 0.75, 0),
  },
  monitor: {
    radius: 1.85,
    theta: 0.16,
    phi: 1.18,
    target: new THREE.Vector3(0, 0.95, -0.15),
  },
  chair: {
    radius: 2.05,
    theta: 2.10,
    phi: 1.22,
    target: new THREE.Vector3(0, 0.55, 0.85),
  },
  keyboard: {
    radius: 1.35,
    theta: 0.35,
    phi: 0.82,
    target: new THREE.Vector3(-0.06, 0.76, 0.08),
  },
  mouse: {
    radius: 1.25,
    theta: 0.45,
    phi: 0.82,
    target: new THREE.Vector3(0.24, 0.76, 0.08),
  },
  mousepad: {
    radius: 1.55,
    theta: 0.32,
    phi: 0.80,
    target: new THREE.Vector3(0.04, 0.76, 0.06),
  },
  lamp: {
    radius: 1.65,
    theta: -0.65,
    phi: 1.15,
    target: new THREE.Vector3(-0.45, 0.88, -0.1),
  },
  plant: {
    radius: 1.45,
    theta: 0.75,
    phi: 1.15,
    target: new THREE.Vector3(0.48, 0.82, 0.12),
  },
  accessory: {
    radius: 1.55,
    theta: -0.72,
    phi: 1.15,
    target: new THREE.Vector3(-0.46, 0.8, 0.12),
  },
};

/** Spherical orbit camera state plus pointer / wheel handlers and smooth slot focusing. */
export function useOrbitCamera() {
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const activeSlotRef = useRef<DeskStudioSlot | 'overview'>('overview');

  const sphericalRef = useRef({
    radius: 3.65,
    theta: 1.28,
    phi: 1.00,
  });
  const targetCenterRef = useRef(new THREE.Vector3(0, 0.75, 0.05));

  const desiredSphericalRef = useRef({
    radius: 3.65,
    theta: 1.28,
    phi: 1.00,
  });
  const desiredTargetCenterRef = useRef(new THREE.Vector3(0, 0.75, 0.05));

  /** Focus camera smoothly on a specific desk slot or overview */
  const focusSlot = useCallback((slot: DeskStudioSlot | 'overview') => {
    activeSlotRef.current = slot;
    const preset = CAMERA_PRESETS[slot] || CAMERA_PRESETS.overview;
    desiredSphericalRef.current = {
      radius: preset.radius,
      theta: preset.theta,
      phi: preset.phi,
    };
    desiredTargetCenterRef.current.copy(preset.target);
  }, []);

  /** Reset camera to studio overview perspective */
  const resetCamera = useCallback(() => {
    focusSlot('overview');
  }, [focusSlot]);

  /** Places `camera` on the orbit sphere around the current target and aims it at the target. Tracks table height elevation. */
  const updateCamera = useCallback((camera: THREE.PerspectiveCamera | null, currentHeightM: number = 0.74) => {
    if (!camera) return;

    // Table elevation offset: all items on tabletop rise with currentHeightM
    const heightDelta = currentHeightM - 0.74;
    const activeSlot = activeSlotRef.current;
    const slotYOffset = activeSlot === 'chair' ? 0 : heightDelta;
    const baseTarget = (CAMERA_PRESETS[activeSlot] || CAMERA_PRESETS.overview).target;

    desiredTargetCenterRef.current.y = baseTarget.y + slotYOffset;

    // Smoothly lerp towards desired state when user is not manually dragging
    if (!isPointerDownRef.current) {
      const lerpSpeed = 0.08;
      sphericalRef.current.radius += (desiredSphericalRef.current.radius - sphericalRef.current.radius) * lerpSpeed;
      sphericalRef.current.theta += (desiredSphericalRef.current.theta - sphericalRef.current.theta) * lerpSpeed;
      sphericalRef.current.phi += (desiredSphericalRef.current.phi - sphericalRef.current.phi) * lerpSpeed;

      targetCenterRef.current.lerp(desiredTargetCenterRef.current, lerpSpeed);
    } else {
      // When dragging, smoothly follow vertical elevation change
      targetCenterRef.current.y += (desiredTargetCenterRef.current.y - targetCenterRef.current.y) * 0.12;
    }

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

      // Keep desired in sync during manual drag
      desiredSphericalRef.current.theta = sphericalRef.current.theta;
      desiredSphericalRef.current.phi = sphericalRef.current.phi;
    },
    onPointerUp: () => {
      isPointerDownRef.current = false;
    },
    onWheel: (e: React.WheelEvent) => {
      sphericalRef.current.radius = Math.max(0.8, Math.min(5.2, sphericalRef.current.radius + e.deltaY * 0.002));
      desiredSphericalRef.current.radius = sphericalRef.current.radius;
    },
  };

  return { targetCenterRef, updateCamera, handlers, focusSlot, resetCamera };
}
