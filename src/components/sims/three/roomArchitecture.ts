import * as THREE from 'three';
import type { FloorStyle } from '../../../types/space';

/**
 * Procedurally generates a seamless repeating architectural tile texture.
 * Generates a 2x2 meter tile pattern (512x512) and repeats it across the room.
 * This guarantees ultra-crisp resolution, immediate loading, and zero GPU memory
 * bloat even when scaled to 50m x 50m!
 */
export function generateFloorTexture(
  floorStyle: FloorStyle,
  width: number,
  length: number,
  isNight: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const tileSize = 256; // 2x2 tiles in the 512 canvas

  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  let baseColor = '#c89d66'; // Warm Bali Teak
  let altColor = '#bfa178';
  let groutColor = 'rgba(54, 38, 22, 0.45)';
  let highlightColor = 'rgba(255, 255, 255, 0.35)';

  if (isNight) {
    baseColor = '#151b29';
    altColor = '#111622';
    groutColor = 'rgba(56, 189, 248, 0.4)';
    highlightColor = 'rgba(255, 255, 255, 0.12)';
  } else if (floorStyle === 'terrazzo') {
    baseColor = '#ded6c8';
    altColor = '#d3c9b8';
    groutColor = 'rgba(80, 70, 58, 0.45)';
    highlightColor = 'rgba(255, 255, 255, 0.45)';
  } else if (floorStyle === 'concrete') {
    baseColor = '#a8b0bc';
    altColor = '#9da5b1';
    groutColor = 'rgba(45, 52, 62, 0.45)';
    highlightColor = 'rgba(255, 255, 255, 0.3)';
  } else if (floorStyle === 'marble') {
    baseColor = '#f5f7fa';
    altColor = '#eceef2';
    groutColor = 'rgba(90, 100, 115, 0.35)';
    highlightColor = 'rgba(255, 255, 255, 0.6)';
  }

  // Draw 2x2 tiles
  for (let x = 0; x < 2; x++) {
    for (let z = 0; z < 2; z++) {
      const px = x * tileSize;
      const pz = z * tileSize;

      const isAlt = (x + z) % 2 === 1;
      ctx.fillStyle = isAlt ? altColor : baseColor;
      ctx.fillRect(px, pz, tileSize, tileSize);

      // Wood plank streaks
      if (floorStyle === 'wood' && !isNight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let p = 1; p < 4; p++) {
          ctx.fillRect(px, pz + p * (tileSize / 4), tileSize, 1.5);
        }
      }

      // Terrazzo aggregate flecks
      if (floorStyle === 'terrazzo') {
        const fleckColors = ['#8c7b6c', '#605448', '#b5a594', '#dcd2c4'];
        for (let i = 0; i < 28; i++) {
          ctx.fillStyle = fleckColors[i % fleckColors.length];
          const fx = px + Math.sin(i * 99 + x) * 110 + 120;
          const fz = pz + Math.cos(i * 77 + z) * 110 + 120;
          const rad = (i % 3) + 1.2;
          ctx.beginPath();
          ctx.arc(fx, fz, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Bevel highlights
      ctx.fillStyle = highlightColor;
      ctx.fillRect(px + 2, pz + 2, tileSize - 4, 1.5);
      ctx.fillRect(px + 2, pz + 2, 1.5, tileSize - 4);

      // Bevel shadow
      ctx.fillStyle = isNight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(px + 2, pz + tileSize - 3.5, tileSize - 4, 1.5);
      ctx.fillRect(px + tileSize - 3.5, pz + 2, 1.5, tileSize - 4);

      // Tile grout seam
      ctx.strokeStyle = groutColor;
      ctx.lineWidth = 2.0;
      ctx.strokeRect(px + 1, pz + 1, tileSize - 2, tileSize - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Canvas is 2x2 tiles (2m x 2m), so repeat is width / 2 and length / 2
  texture.repeat.set(width / 2, length / 2);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  return texture;
}

/**
 * Creates 3D grid overlay lines with boundary markers.
 * Scales cleanly from 3m up to 50m rooms.
 */
export function createRoomGrid(width: number, length: number, isNight: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'roomGrid';

  const halfW = width / 2;
  const halfL = length / 2;

  // 1. Primary 1-meter grid lines
  const points: THREE.Vector3[] = [];

  for (let x = 0; x <= width; x++) {
    const wx = -halfW + x;
    points.push(new THREE.Vector3(wx, 0.004, -halfL));
    points.push(new THREE.Vector3(wx, 0.004, halfL));
  }

  for (let z = 0; z <= length; z++) {
    const wz = -halfL + z;
    points.push(new THREE.Vector3(-halfW, 0.004, wz));
    points.push(new THREE.Vector3(halfW, 0.004, wz));
  }

  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial({
    color: isNight ? 0x38bdf8 : 0xffffff,
    transparent: true,
    opacity: isNight ? 0.65 : 0.45,
  });
  const gridLines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(gridLines);

  // 2. Half-grid subdivision lines (0.5m spacing) for rooms <= 20m
  if (Math.max(width, length) <= 20) {
    const halfPoints: THREE.Vector3[] = [];
    for (let x = 0.5; x < width; x += 1) {
      const wx = -halfW + x;
      halfPoints.push(new THREE.Vector3(wx, 0.0035, -halfL));
      halfPoints.push(new THREE.Vector3(wx, 0.0035, halfL));
    }
    for (let z = 0.5; z < length; z += 1) {
      const wz = -halfL + z;
      halfPoints.push(new THREE.Vector3(-halfW, 0.0035, wz));
      halfPoints.push(new THREE.Vector3(halfW, 0.0035, wz));
    }
    const halfLineGeo = new THREE.BufferGeometry().setFromPoints(halfPoints);
    const halfLineMat = new THREE.LineBasicMaterial({
      color: isNight ? 0x38bdf8 : 0xffffff,
      transparent: true,
      opacity: isNight ? 0.25 : 0.18,
    });
    const halfGridLines = new THREE.LineSegments(halfLineGeo, halfLineMat);
    group.add(halfGridLines);
  }

  // 3. Perimeter outer border line
  const borderPoints = [
    new THREE.Vector3(-halfW, 0.005, -halfL),
    new THREE.Vector3(halfW, 0.005, -halfL),
    new THREE.Vector3(halfW, 0.005, halfL),
    new THREE.Vector3(-halfW, 0.005, halfL),
    new THREE.Vector3(-halfW, 0.005, -halfL),
  ];
  const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
  const borderMat = new THREE.LineBasicMaterial({
    color: isNight ? 0x60a5fa : 0x4a3728,
    transparent: true,
    opacity: 0.9,
  });
  const border = new THREE.Line(borderGeo, borderMat);
  group.add(border);

  // 4. Intersection points/dots (adaptive step to stay high performance on 50m rooms)
  const step = Math.max(width, length) > 20 ? 2 : 1;
  const dotPoints: THREE.Vector3[] = [];
  for (let x = 0; x <= width; x += step) {
    for (let z = 0; z <= length; z += step) {
      dotPoints.push(new THREE.Vector3(-halfW + x, 0.006, -halfL + z));
    }
  }
  const dotGeo = new THREE.BufferGeometry().setFromPoints(dotPoints);
  const dotMat = new THREE.PointsMaterial({
    color: isNight ? 0x38bdf8 : 0x10b981,
    size: 4,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.85,
  });
  const dots = new THREE.Points(dotGeo, dotMat);
  group.add(dots);

  return group;
}

/**
 * Creates baseboard skirting trim along walls.
 */
export function createSkirting(width: number, length: number, isNight: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'skirtingGroup';
  const skirtMat = new THREE.MeshStandardMaterial({
    color: isNight ? 0x111624 : 0x362f27,
    roughness: 0.6,
  });

  // North wall skirting
  const northSkirt = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.1, 0.03), skirtMat);
  northSkirt.position.set(0, 0.05, -length / 2 + 0.015);
  northSkirt.receiveShadow = true;
  group.add(northSkirt);

  // West wall skirting
  const westSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, length + 0.2), skirtMat);
  westSkirt.position.set(-width / 2 + 0.015, 0.05, 0);
  westSkirt.receiveShadow = true;
  group.add(westSkirt);

  return group;
}

/**
 * Creates Scandinavian architectural windows flush on North wall.
 * Supports multiple window panes for wide spaces.
 */
export function createWindow(roomWidth: number, roomLength: number, isNight: boolean): THREE.Group {
  const group = new THREE.Group();
  group.name = 'windowGroup';

  const frameMat = new THREE.MeshStandardMaterial({
    color: isNight ? 0x334155 : 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });

  const sillMat = new THREE.MeshStandardMaterial({
    color: isNight ? 0x1e293b : 0xd4a373,
    roughness: 0.4,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: isNight ? 0x0f172a : 0xbae6fd,
    roughness: 0.1,
    metalness: 0.15,
    transparent: true,
    opacity: isNight ? 0.75 : 0.85,
  });

  const singleWidth = 2.4;
  const frameHeight = 1.5;
  const borderThickness = 0.06;
  const frameDepth = 0.035;

  // Calculate window count based on room width (1 window per ~5 meters, up to 5)
  const windowCount = Math.min(5, Math.max(1, Math.floor(roomWidth / 5.5)));
  const spacing = Math.min(4.5, roomWidth / (windowCount + 1));

  for (let i = 0; i < windowCount; i++) {
    const winSub = new THREE.Group();
    const posX = (i - (windowCount - 1) / 2) * spacing;
    winSub.position.set(posX, 1.7, -roomLength / 2 + 0.02);

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(singleWidth, borderThickness, frameDepth), frameMat);
    topBar.position.set(0, frameHeight / 2 - borderThickness / 2, 0);
    winSub.add(topBar);

    const btmBar = new THREE.Mesh(new THREE.BoxGeometry(singleWidth, borderThickness, frameDepth), frameMat);
    btmBar.position.set(0, -frameHeight / 2 + borderThickness / 2, 0);
    winSub.add(btmBar);

    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, frameHeight, frameDepth), frameMat);
    leftBar.position.set(-singleWidth / 2 + borderThickness / 2, 0, 0);
    winSub.add(leftBar);

    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, frameHeight, frameDepth), frameMat);
    rightBar.position.set(singleWidth / 2 - borderThickness / 2, 0, 0);
    winSub.add(rightBar);

    const midVert = new THREE.Mesh(new THREE.BoxGeometry(0.025, frameHeight, frameDepth * 0.8), frameMat);
    winSub.add(midVert);

    const midHoriz = new THREE.Mesh(new THREE.BoxGeometry(singleWidth, 0.025, frameDepth * 0.8), frameMat);
    winSub.add(midHoriz);

    const sill = new THREE.Mesh(new THREE.BoxGeometry(singleWidth + 0.2, 0.04, 0.12), sillMat);
    sill.position.set(0, -frameHeight / 2 - 0.02, 0.05);
    sill.receiveShadow = true;
    winSub.add(sill);

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(singleWidth - 0.08, frameHeight - 0.08), glassMat);
    glass.position.set(0, 0, 0.005);
    winSub.add(glass);

    group.add(winSub);
  }

  return group;
}

/**
 * Creates single green ambient hovering pointer marker pointing down at selected item
 */
export function createPlumbob(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'plumbobGroup';

  const geom = new THREE.ConeGeometry(0.16, 0.38, 6);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.1,
  });

  const pointer = new THREE.Mesh(geom, mat);
  // Point tip downward directly towards the selected item
  pointer.rotation.x = Math.PI;
  pointer.position.y = 0;
  group.add(pointer);

  return group;
}

/**
 * Creates architectural walls with cutaway support.
 * 'cutaway' keeps the back North wall full height and steps down the side West wall
 * so it never blocks the camera view or sticks into the screen.
 * 'low' creates a modern 0.45m open floorplan perimeter rim (ideal for large 15-50m rooms).
 * 'full' creates full height 2.8m walls.
 */
export function createWalls(
  roomWidth: number,
  roomLength: number,
  wallColorHex: number,
  wallStyle: 'cutaway' | 'low' | 'full' = 'cutaway'
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wallsGroup';

  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColorHex || 0xf8f6f0,
    roughness: 0.8,
  });

  const wallThick = 0.18;
  const fullH = 2.6;
  const lowH = 0.45;

  if (wallStyle === 'low') {
    // Both walls are sleek architectural low curbs (0.45m)
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth + wallThick, lowH, wallThick), wallMat);
    northWall.position.set(0, lowH / 2, -roomLength / 2 - wallThick / 2);
    northWall.receiveShadow = true;
    group.add(northWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, lowH, roomLength + wallThick), wallMat);
    westWall.position.set(-roomWidth / 2 - wallThick / 2, lowH / 2, 0);
    westWall.receiveShadow = true;
    group.add(westWall);
  } else if (wallStyle === 'full') {
    // Both walls full height
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth + wallThick, fullH, wallThick), wallMat);
    northWall.position.set(0, fullH / 2, -roomLength / 2 - wallThick / 2);
    northWall.receiveShadow = true;
    group.add(northWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, fullH, roomLength + wallThick), wallMat);
    westWall.position.set(-roomWidth / 2 - wallThick / 2, fullH / 2, 0);
    westWall.receiveShadow = true;
    group.add(westWall);
  } else {
    // 'cutaway' (Classic Sims Architectural Cutaway):
    // 1. Back North wall is full height
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth + wallThick, fullH, wallThick), wallMat);
    northWall.position.set(0, fullH / 2, -roomLength / 2 - wallThick / 2);
    northWall.receiveShadow = true;
    group.add(northWall);

    // 2. West wall is cutaway:
    // Back corner section (anchoring the corner with North wall):
    const cornerLen = Math.min(2.5, Math.max(1.2, roomLength * 0.28));
    const westCorner = new THREE.Mesh(new THREE.BoxGeometry(wallThick, fullH, cornerLen), wallMat);
    westCorner.position.set(
      -roomWidth / 2 - wallThick / 2,
      fullH / 2,
      -roomLength / 2 + cornerLen / 2
    );
    westCorner.receiveShadow = true;
    group.add(westCorner);

    // Front low section: steps down to 0.45m so the room is completely visible and open
    const frontLen = roomLength - cornerLen + wallThick;
    if (frontLen > 0.1) {
      const westFront = new THREE.Mesh(new THREE.BoxGeometry(wallThick, lowH, frontLen), wallMat);
      westFront.position.set(
        -roomWidth / 2 - wallThick / 2,
        lowH / 2,
        -roomLength / 2 + cornerLen + frontLen / 2 - wallThick / 2
      );
      westFront.receiveShadow = true;
      group.add(westFront);
    }
  }

  return group;
}

