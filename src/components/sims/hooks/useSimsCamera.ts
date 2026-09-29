import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../../utils/soundEffects';

export interface CameraPreset {
  name: string;
  shortLabel: string;
  theta: number;
  phi: number;
}

export interface WalkObstacle {
  x: number;
  z: number;
  width: number;
  depth: number;
}

interface WalkTween {
  startX: number;
  startZ: number;
  startY: number;
  targetX: number;
  targetZ: number;
  targetY: number;
  startYaw: number;
  targetYaw: number;
  startPitch: number;
  targetPitch: number;
  startTime: number;
  duration: number;
}

export const CAMERA_ANGLES: CameraPreset[] = [
  { name: 'Front (South)', shortLabel: 'S', theta: 0, phi: 0.85 },
  { name: 'Front-Right (SE)', shortLabel: 'SE', theta: Math.PI / 4, phi: 0.8 },
  { name: 'Right (East)', shortLabel: 'E', theta: Math.PI / 2, phi: 0.85 },
  { name: 'Back-Right (NE)', shortLabel: 'NE', theta: (3 * Math.PI) / 4, phi: 0.8 },
  { name: 'Back (North)', shortLabel: 'N', theta: Math.PI, phi: 0.85 },
  { name: 'Back-Left (NW)', shortLabel: 'NW', theta: (5 * Math.PI) / 4, phi: 0.8 },
  { name: 'Left (West)', shortLabel: 'W', theta: (3 * Math.PI) / 2, phi: 0.85 },
  { name: 'Front-Left (SW)', shortLabel: 'SW', theta: (7 * Math.PI) / 4, phi: 0.8 },
  { name: 'Top-Down (Plan)', shortLabel: 'Top', theta: 0, phi: 0.05 },
];

export function useSimsCamera(initialWalkMode = false) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [cameraAngleIndex, setCameraAngleIndex] = useState<number>(1);
  const cameraOrbitRef = useRef({ theta: Math.PI / 4, phi: 0.8, radius: 15 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.5, 0));
  // Furthest the orbit camera may zoom out; follows the room size (set by fitRoomInView)
  const maxRadiusRef = useRef<number>(40);
  const touchStartDistRef = useRef<number | null>(null);
  const touchLastCenterRef = useRef<{ x: number; y: number } | null>(null);

  // --- Walk Mode (First-Person Walkthrough Inside Room) ---
  const [isWalkMode, setIsWalkMode] = useState<boolean>(initialWalkMode);
  const [eyeHeight, setEyeHeight] = useState<number>(1.65); // 1.65m standing, 1.15m sitting
  const playerPosRef = useRef({ x: 0, y: 1.65, z: 2.0 });
  const playerLookRef = useRef({ yaw: 0, pitch: -0.1 });
  const headBobRef = useRef(0);
  const lastFootstepCycleRef = useRef(0);
  const velocityRef = useRef({ x: 0, z: 0 });
  const walkTweenRef = useRef<WalkTween | null>(null);
  const walkSpeed = 2.6; // base meters per second

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;

    if (isWalkMode) {
      // First-person walk camera with biomechanical vertical bob & subtle lateral sway
      const pos = playerPosRef.current;
      const { yaw, pitch } = playerLookRef.current;

      const bobY = Math.abs(Math.sin(headBobRef.current)) * 0.016;
      const swayX = Math.sin(headBobRef.current * 0.5) * 0.008;

      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);

      const finalPosX = pos.x + rightX * swayX;
      const finalPosY = pos.y + bobY;
      const finalPosZ = pos.z + rightZ * swayX;

      cameraRef.current.position.set(finalPosX, finalPosY, finalPosZ);

      // Look direction vector from yaw & pitch
      const dirX = -Math.sin(yaw) * Math.cos(pitch);
      const dirY = Math.sin(pitch);
      const dirZ = -Math.cos(yaw) * Math.cos(pitch);

      cameraRef.current.lookAt(finalPosX + dirX, finalPosY + dirY, finalPosZ + dirZ);
    } else {
      // Orbit camera
      const { theta, phi, radius } = cameraOrbitRef.current;
      const target = cameraTargetRef.current;

      cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.position.y = target.y + radius * Math.cos(phi);
      cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.lookAt(target.x, target.y, target.z);
    }
  }, [isWalkMode]);

  const walkMove = useCallback((
    moveForward: number,
    moveStrafe: number,
    deltaSec: number,
    roomWidth: number,
    roomLength: number,
    obstacles: WalkObstacle[] = [],
    isSprinting = false
  ) => {
    if (!cameraRef.current || !isWalkMode) return;

    // Handle Active Cinematic Walk Tween (e.g. "Walk to Desk")
    if (walkTweenRef.current) {
      const tween = walkTweenRef.current;
      const now = performance.now();
      const elapsed = now - tween.startTime;
      const progress = Math.min(1.0, elapsed / tween.duration);
      // Cubic Hermite smoothstep S(t) = 3t^2 - 2t^3
      const ease = progress * progress * (3 - 2 * progress);

      playerPosRef.current.x = tween.startX + (tween.targetX - tween.startX) * ease;
      playerPosRef.current.z = tween.startZ + (tween.targetZ - tween.startZ) * ease;
      playerPosRef.current.y = tween.startY + (tween.targetY - tween.startY) * ease;

      // Shortest angular arc interpolation for yaw
      const yawDiff = ((tween.targetYaw - tween.startYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
      playerLookRef.current.yaw = tween.startYaw + yawDiff * ease;
      playerLookRef.current.pitch = tween.startPitch + (tween.targetPitch - tween.startPitch) * ease;

      updateCameraPosition();

      if (progress >= 1.0) {
        walkTweenRef.current = null;
      }
      return;
    }

    const inputLen = Math.hypot(moveForward, moveStrafe);

    // Cancel tween if user issues direct WASD movement
    if (inputLen > 0.05) {
      walkTweenRef.current = null;
    }

    // 1. Locomotion Vector Normalization (guarantees diagonal speed equals straight speed)
    const normFwd = inputLen > 0 ? (moveForward / inputLen) * Math.min(1.0, inputLen) : 0;
    const normStrafe = inputLen > 0 ? (moveStrafe / inputLen) * Math.min(1.0, inputLen) : 0;

    const currentMaxSpeed = isSprinting ? walkSpeed * 1.45 : walkSpeed;
    const { yaw } = playerLookRef.current;
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);

    const targetVx = (forwardX * normFwd + rightX * normStrafe) * currentMaxSpeed;
    const targetVz = (forwardZ * normFwd + rightZ * normStrafe) * currentMaxSpeed;

    // 2. Kinematic Velocity Damping (Exponential Decay Filter)
    const isBraking = inputLen < 0.05;
    const lambda = isBraking ? 18.0 : 14.0;
    const dt = Math.min(deltaSec, 0.1);
    const alpha = 1.0 - Math.exp(-lambda * dt);

    velocityRef.current.x += (targetVx - velocityRef.current.x) * alpha;
    velocityRef.current.z += (targetVz - velocityRef.current.z) * alpha;

    if (isBraking && Math.hypot(velocityRef.current.x, velocityRef.current.z) < 0.015) {
      velocityRef.current.x = 0;
      velocityRef.current.z = 0;
    }

    const curSpeed = Math.hypot(velocityRef.current.x, velocityRef.current.z);

    // 3. Candidate Displacement
    const dx = velocityRef.current.x * dt;
    const dz = velocityRef.current.z * dt;

    const cur = playerPosRef.current;
    let candX = cur.x + dx;
    let candZ = cur.z + dz;

    // 4. Room Wall Boundaries (with safety margin)
    const wallMargin = 0.35;
    const halfW = roomWidth / 2 - wallMargin;
    const halfL = roomLength / 2 - wallMargin;

    if (candX < -halfW) {
      candX = -halfW;
      velocityRef.current.x = 0;
    } else if (candX > halfW) {
      candX = halfW;
      velocityRef.current.x = 0;
    }

    if (candZ < -halfL) {
      candZ = -halfL;
      velocityRef.current.z = 0;
    } else if (candZ > halfL) {
      candZ = halfL;
      velocityRef.current.z = 0;
    }

    // 5. Furniture Obstacle Collision with Tangential Surface Sliding
    const playerRadius = 0.28;
    for (const obs of obstacles) {
      const halfBoxW = obs.width / 2 + playerRadius;
      const halfBoxD = obs.depth / 2 + playerRadius;

      const diffX = candX - obs.x;
      const diffZ = candZ - obs.z;

      if (Math.abs(diffX) < halfBoxW && Math.abs(diffZ) < halfBoxD) {
        // Collision detected: push out along axis of least penetration & slide
        const penX = halfBoxW - Math.abs(diffX);
        const penZ = halfBoxD - Math.abs(diffZ);

        if (penX < penZ) {
          const sign = diffX >= 0 ? 1 : -1;
          candX = obs.x + sign * halfBoxW;
          velocityRef.current.x = 0; // slide along Z
        } else {
          const sign = diffZ >= 0 ? 1 : -1;
          candZ = obs.z + sign * halfBoxD;
          velocityRef.current.z = 0; // slide along X
        }
      }
    }

    cur.x = candX;
    cur.z = candZ;
    cur.y = eyeHeight;

    // 6. Biomechanical Head Oscillation & Soft Footstep Audio
    if (curSpeed > 0.1) {
      headBobRef.current += dt * (curSpeed * 3.8 + 2.4);

      const stepInterval = Math.PI;
      const currCycle = Math.floor(headBobRef.current / stepInterval);
      if (currCycle > lastFootstepCycleRef.current) {
        lastFootstepCycleRef.current = currCycle;
        sounds.playFootstep(isSprinting ? 0.08 : 0.05);
      }
    }

    updateCameraPosition();
  }, [isWalkMode, eyeHeight, updateCameraPosition]);

  const walkLook = useCallback((deltaYaw: number, deltaPitch: number) => {
    if (!isWalkMode) return;
    walkTweenRef.current = null; // User mouse look overrides automated tween
    playerLookRef.current.yaw -= deltaYaw * 0.0036;
    playerLookRef.current.pitch = Math.max(-1.15, Math.min(1.15, playerLookRef.current.pitch - deltaPitch * 0.0036));
    updateCameraPosition();
  }, [isWalkMode, updateCameraPosition]);

  const toggleWalkMode = useCallback((_roomWidth: number, roomLength: number) => {
    setIsWalkMode(prev => {
      const next = !prev;
      if (next) {
        walkTweenRef.current = null;
        velocityRef.current = { x: 0, z: 0 };
        // Entering walk mode: spawn near room entrance facing center / desk
        playerPosRef.current = {
          x: 0,
          y: eyeHeight,
          z: Math.max(0.8, roomLength / 2 - 0.7),
        };
        playerLookRef.current = { yaw: 0, pitch: -0.1 }; // Look straight ahead into room
        headBobRef.current = 0;
      }
      return next;
    });
  }, [eyeHeight]);

  const walkToItem = useCallback((
    worldX: number,
    worldZ: number,
    roomLength = 5,
    itemRotation = 0,
    itemDepth = 0.8
  ) => {
    setIsWalkMode(true);
    walkTweenRef.current = null;

    // Compute optimal front-facing normal based on desk rotation
    // 0 deg: faces +Z, 90 deg: faces +X, 180 deg: faces -Z, 270 deg: faces -X
    const rad = (itemRotation * Math.PI) / 180;
    const nx = Math.sin(rad);
    const nz = Math.cos(rad);

    // Ergonomic reach distance: sitting at desk surface with natural monitor distance
    const reachDistance = Math.max(0.88, (itemDepth / 2) + 0.44);
    const targetX = worldX + nx * reachDistance;
    const targetZ = worldZ + nz * reachDistance;

    const margin = 0.38;
    const halfL = roomLength / 2 - margin;
    const clampedZ = Math.max(-halfL, Math.min(halfL, targetZ));
    const clampedX = Math.max(-roomLength / 2 + margin, Math.min(roomLength / 2 - margin, targetX));

    // Target yaw faces directly at desk center from the approaching vantage point
    const lookVecX = worldX - clampedX;
    const lookVecZ = worldZ - clampedZ;
    const targetYaw = Math.atan2(-lookVecX, -lookVecZ);
    const targetPitch = -0.16; // Tilted slightly down toward workstation surface

    // Initiate smooth 750ms cinematic camera glide
    walkTweenRef.current = {
      startX: playerPosRef.current.x,
      startZ: playerPosRef.current.z,
      startY: playerPosRef.current.y,
      targetX: clampedX,
      targetZ: clampedZ,
      targetY: eyeHeight,
      startYaw: playerLookRef.current.yaw,
      targetYaw,
      startPitch: playerLookRef.current.pitch,
      targetPitch,
      startTime: performance.now(),
      duration: 750,
    };

    updateCameraPosition();
  }, [eyeHeight, updateCameraPosition]);

  const getHeading = useCallback(() => {
    const rawDeg = ((-playerLookRef.current.yaw * 180) / Math.PI) % 360;
    const deg = (rawDeg + 360) % 360;
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(deg / 45) % 8;
    return { degrees: Math.round(deg), cardinal: cardinals[idx] };
  }, []);

  const panBy = useCallback((deltaScreenX: number, deltaScreenY: number, containerHeight = 800) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const radius = cameraOrbitRef.current.radius;

    // Calculate 1:1 screen-to-world factor based on camera fov and distance
    const fovRad = (camera.fov * Math.PI) / 180;
    const factor = (2 * Math.tan(fovRad / 2) * radius) / Math.max(containerHeight, 400);

    // Extract camera's screen-space right and up vectors in world space
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.matrix.extractBasis(right, up, new THREE.Vector3());

    // Pan target point along camera view plane
    cameraTargetRef.current.addScaledVector(right, -deltaScreenX * factor);
    cameraTargetRef.current.addScaledVector(up, deltaScreenY * factor);

    updateCameraPosition();
  }, [updateCameraPosition]);

  const resetPan = useCallback(() => {
    cameraTargetRef.current.set(0, 0.5, 0);
    updateCameraPosition();
  }, [updateCameraPosition]);

  const setCameraPreset = useCallback((idx: number) => {
    setCameraAngleIndex(idx);
    const preset = CAMERA_ANGLES[idx];
    cameraOrbitRef.current.theta = preset.theta;
    cameraOrbitRef.current.phi = preset.phi;
    updateCameraPosition();
  }, [updateCameraPosition]);

  const rotateStep = useCallback((direction: 'left' | 'right') => {
    setCameraAngleIndex(prev => {
      let nextIdx: number;
      if (prev >= 8) {
        nextIdx = direction === 'right' ? 1 : 7;
      } else {
        const delta = direction === 'right' ? 1 : -1;
        nextIdx = (prev + delta + 8) % 8;
      }
      const preset = CAMERA_ANGLES[nextIdx];
      cameraOrbitRef.current.theta = preset.theta;
      cameraOrbitRef.current.phi = preset.phi;
      updateCameraPosition();
      return nextIdx;
    });
  }, [updateCameraPosition]);

  const zoomIn = useCallback((delta = 2) => {
    cameraOrbitRef.current.radius = Math.max(4, cameraOrbitRef.current.radius - delta);
    updateCameraPosition();
  }, [updateCameraPosition]);

  const zoomOut = useCallback((delta = 2) => {
    cameraOrbitRef.current.radius = Math.min(maxRadiusRef.current, cameraOrbitRef.current.radius + delta);
    updateCameraPosition();
  }, [updateCameraPosition]);

  const fitRoomInView = useCallback((roomWidth: number, roomLength: number) => {
    const maxDim = Math.max(roomWidth, roomLength);
    const targetRadius = Math.max(12, Math.min(150, maxDim * 2.2));
    maxRadiusRef.current = Math.min(160, Math.max(18, maxDim * 3.5));
    cameraOrbitRef.current.radius = targetRadius;
    cameraTargetRef.current.set(0, 0.5, 0); // Re-center on room center
    updateCameraPosition();
  }, [updateCameraPosition]);

  const orbitBy = useCallback((deltaX: number, deltaY: number) => {
    cameraOrbitRef.current.theta -= deltaX * 0.008;
    cameraOrbitRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraOrbitRef.current.phi - deltaY * 0.008));
    updateCameraPosition();
  }, [updateCameraPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchLastCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 1. Two-finger pinch zoom
      if (touchStartDistRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = touchStartDistRef.current - dist;
        cameraOrbitRef.current.radius = Math.max(4, Math.min(maxRadiusRef.current, cameraOrbitRef.current.radius + delta * 0.05));
        touchStartDistRef.current = dist;
      }

      // 2. Two-finger pan X & Y
      if (touchLastCenterRef.current !== null) {
        const curCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const curCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const panDeltaX = curCenterX - touchLastCenterRef.current.x;
        const panDeltaY = curCenterY - touchLastCenterRef.current.y;
        touchLastCenterRef.current = { x: curCenterX, y: curCenterY };
        panBy(panDeltaX, panDeltaY, window.innerHeight);
      } else {
        updateCameraPosition();
      }
    }
  }, [panBy, updateCameraPosition]);

  const handleTouchEnd = useCallback(() => {
    touchStartDistRef.current = null;
    touchLastCenterRef.current = null;
  }, []);

  return {
    cameraRef,
    cameraAngleIndex,
    cameraOrbitRef,
    cameraTargetRef,
    setCameraPreset,
    rotateStep,
    updateCameraPosition,
    zoomIn,
    zoomOut,
    fitRoomInView,
    orbitBy,
    panBy,
    resetPan,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    // Walk Mode
    isWalkMode,
    setIsWalkMode,
    toggleWalkMode,
    walkToItem,
    walkMove,
    walkLook,
    eyeHeight,
    setEyeHeight,
    playerPosRef,
    getHeading,
    velocityRef,
  };
}
