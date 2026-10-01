import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { WorkstationConfig, DeskStudioSlot } from '../../types/workstation';
import { useOrbitCamera } from './hooks/useOrbitCamera';
import { useStationScene } from './hooks/useStationScene';
import { useStationGeometry } from './hooks/useStationGeometry';
import { sounds } from '../../utils/soundEffects';
import {
  RotateCcw,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface WorkstationCanvas3DProps {
  config: WorkstationConfig;
  selectedSlot?: DeskStudioSlot | null;
  onSelectSlot?: (slot: DeskStudioSlot | null) => void;
  showHotspots?: boolean;
  className?: string;
}

interface HotspotItem {
  slot: DeskStudioSlot;
  label: string;
  icon: string;
  position: THREE.Vector3;
}

export const WorkstationCanvas3D: React.FC<WorkstationCanvas3DProps> = ({
  config,
  selectedSlot = null,
  onSelectSlot,
  showHotspots = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const clickStartRef = useRef<{ x: number; y: number } | null>(null);

  const [hoveredSlot, setHoveredSlot] = useState<{ slot: DeskStudioSlot; name: string; x: number; y: number } | null>(null);
  const [screenHotspots, setScreenHotspots] = useState<{ slot: DeskStudioSlot; label: string; icon: string; x: number; y: number; visible: boolean }[]>([]);

  const orbit = useOrbitCamera();
  const sceneRefs = useStationScene(mountRef, config.deskHeightCm, orbit);
  useStationGeometry(config, sceneRefs);

  // Raycast helper to find slot from mouse coordinates
  const getSlotAtPoint = useCallback((clientX: number, clientY: number): { slot: DeskStudioSlot; name: string } | null => {
    if (!mountRef.current || !sceneRefs.cameraRef.current || !sceneRefs.sceneRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), sceneRefs.cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRefs.sceneRef.current.children, true);
    for (const hit of intersects) {
      let cur: THREE.Object3D | null = hit.object;
      while (cur) {
        if (cur.userData && cur.userData.slot) {
          return {
            slot: cur.userData.slot as DeskStudioSlot,
            name: (cur.userData.name as string) || 'Workspace Item',
          };
        }
        cur = cur.parent;
      }
    }
    return null;
  }, [sceneRefs]);

  // Pointer down: record click start coordinate
  const handlePointerDown = (e: React.PointerEvent) => {
    clickStartRef.current = { x: e.clientX, y: e.clientY };
    orbit.handlers.onPointerDown(e);
  };

  // Pointer move: update orbit if dragging, else raycast hover
  const handlePointerMove = (e: React.PointerEvent) => {
    orbit.handlers.onPointerMove(e);

    // If not dragging, check hover
    if (!clickStartRef.current) {
      const hit = getSlotAtPoint(e.clientX, e.clientY);
      if (hit) {
        const rect = mountRef.current?.getBoundingClientRect();
        setHoveredSlot({
          slot: hit.slot,
          name: hit.name,
          x: e.clientX - (rect?.left || 0),
          y: e.clientY - (rect?.top || 0),
        });
      } else {
        setHoveredSlot(null);
      }
    }
  };

  // Pointer up: detect click (< 6px movement) vs orbit drag
  const handlePointerUp = (e: React.PointerEvent) => {
    orbit.handlers.onPointerUp();
    if (clickStartRef.current) {
      const dist = Math.hypot(e.clientX - clickStartRef.current.x, e.clientY - clickStartRef.current.y);
      clickStartRef.current = null;

      if (dist < 6) {
        const hit = getSlotAtPoint(e.clientX, e.clientY);
        if (hit && onSelectSlot) {
          sounds.playSelect();
          onSelectSlot(hit.slot);
          orbit.focusSlot(hit.slot);
        }
      }
    }
  };

  // Synchronize camera focus when selectedSlot prop changes from external floating menu
  const prevSlotRef = useRef<DeskStudioSlot | null>(selectedSlot);
  useEffect(() => {
    if (selectedSlot !== prevSlotRef.current) {
      if (selectedSlot) {
        orbit.focusSlot(selectedSlot);
      } else {
        orbit.resetCamera();
      }
      prevSlotRef.current = selectedSlot;
    }
  }, [selectedSlot, orbit]);

  // Project 3D Hotspot positions to 2D screen coordinates
  useEffect(() => {
    if (!showHotspots) {
      return;
    }

    let rafId: number;
    const updateHotspots = () => {
      if (!mountRef.current || !sceneRefs.cameraRef.current) {
        rafId = requestAnimationFrame(updateHotspots);
        return;
      }

      const container = mountRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const camera = sceneRefs.cameraRef.current;

      const deskH = config.deskHeightCm / 100;
      const deskW = config.deskWidthCm / 100;
      const deskD = config.deskDepthCm / 100;

      const hotspots: HotspotItem[] = [
        { slot: 'chair', label: 'Chair', icon: '🪑', position: new THREE.Vector3(0, 0.62, deskD * 0.5 + 0.65) },
        { slot: 'table', label: 'Desk', icon: '🪵', position: new THREE.Vector3(deskW * 0.44, deskH, -deskD * 0.4) },
        { slot: 'monitor', label: 'Display', icon: '🖥️', position: new THREE.Vector3(0, deskH + 0.34, -deskD * 0.28) },
        { slot: 'keyboard', label: 'Keyboard', icon: '⌨️', position: new THREE.Vector3(-0.06, deskH + 0.04, 0.08) },
        { slot: 'mouse', label: 'Mouse', icon: '🖱️', position: new THREE.Vector3(0.25, deskH + 0.04, 0.08) },
        { slot: 'mousepad', label: 'Desk Mat', icon: '⬛', position: new THREE.Vector3(-0.25, deskH + 0.015, 0.05) },
      ];

      // Add accessories if present
      if (config.lampVariant !== 'none') {
        const lampX = config.lampVariant === 'screenbar' ? 0 : -deskW * 0.42;
        const lampY = config.lampVariant === 'screenbar' ? deskH + 0.48 : deskH + 0.35;
        const lampZ = config.lampVariant === 'screenbar' ? -deskD * 0.28 : -deskD * 0.22;
        hotspots.push({ slot: 'lamp', label: 'Lamp', icon: '💡', position: new THREE.Vector3(lampX, lampY, lampZ) });
      }

      if (config.plantVariant !== 'none') {
        hotspots.push({ slot: 'plant', label: 'Plant', icon: '🪴', position: new THREE.Vector3(deskW * 0.41, deskH + 0.12, 0.12) });
      }

      const slot3 = config.accessorySlot3 || (config.speakersEnabled ? 'speakers' : config.hasCoffeeMug ? 'coffee_mug' : 'none');
      if (slot3 !== 'none') {
        const icon = slot3 === 'speakers' ? '🔊' : slot3 === 'headphones' ? '🎧' : '☕';
        const label = slot3 === 'speakers' ? 'Audio' : slot3 === 'headphones' ? 'Audio' : 'Drink';
        hotspots.push({ slot: 'accessory', label, icon, position: new THREE.Vector3(-deskW * 0.38, deskH + 0.1, 0.14) });
      }

      const projected = hotspots.map((h) => {
        const v = h.position.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * width;
        const y = (-v.y * 0.5 + 0.5) * height;
        const visible = v.z < 1 && x > 20 && x < width - 20 && y > 20 && y < height - 20;
        return {
          slot: h.slot,
          label: h.label,
          icon: h.icon,
          x,
          y,
          visible,
        };
      });

      setScreenHotspots(projected);
      rafId = requestAnimationFrame(updateHotspots);
    };

    rafId = requestAnimationFrame(updateHotspots);
    return () => cancelAnimationFrame(rafId);
  }, [config, showHotspots, sceneRefs]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none select-none touch-none ${className}`}>
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full h-full ${hoveredSlot ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={orbit.handlers.onWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* 3D Floating Hotspot Badges */}
      {showHotspots &&
        screenHotspots.map((h) => {
          if (!h.visible) return null;
          const isSelected = selectedSlot === h.slot;
          return (
            <button
              key={h.slot}
              style={{
                left: `${h.x}px`,
                top: `${h.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                sounds.playSelect();
                if (onSelectSlot) onSelectSlot(h.slot);
                orbit.focusSlot(h.slot);
              }}
              className={`absolute z-20 pointer-events-auto apple-press flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md transition-all shadow-md cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-white shadow-emerald-500/30 ring-2 ring-emerald-400 scale-105'
                  : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200/90 hover:border-emerald-500 hover:scale-105 shadow-sm'
              }`}
            >
              <span>{h.icon}</span>
              <span className="capitalize">{h.label}</span>
            </button>
          );
        })}

      {/* Floating Hover Tooltip */}
      {hoveredSlot && (
        <div
          style={{
            left: `${hoveredSlot.x + 16}px`,
            top: `${hoveredSlot.y - 16}px`,
          }}
          className="absolute z-30 pointer-events-none flex items-center gap-2 bg-white/95 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/90 backdrop-blur-md shadow-2xl transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Click to customize <strong className="text-emerald-700">{hoveredSlot.name}</strong></span>
        </div>
      )}

      {/* Top Left: 3D Camera Focus Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 text-xs text-slate-800 shadow-md">
        <button
          onClick={() => {
            sounds.playSelect();
            orbit.resetCamera();
            if (onSelectSlot) onSelectSlot(null);
          }}
          className={`apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium border ${
            !selectedSlot ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300 shadow-2xs' : 'hover:bg-slate-100 text-slate-700 border-transparent'
          }`}
          title="Reset to 360° Studio Overview"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Overview</span>
        </button>

        <div className="h-4 w-px bg-slate-200" />

        <button
          onClick={() => {
            sounds.playSelect();
            orbit.focusSlot('monitor');
            if (onSelectSlot) onSelectSlot('monitor');
          }}
          className={`apple-press px-2.5 py-1.5 rounded-xl transition cursor-pointer text-[11px] font-medium border ${
            selectedSlot === 'monitor' ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300 shadow-2xs' : 'hover:bg-slate-100 text-slate-600 border-transparent'
          }`}
        >
          🖥️ Screens
        </button>

        <button
          onClick={() => {
            sounds.playSelect();
            orbit.focusSlot('keyboard');
            if (onSelectSlot) onSelectSlot('keyboard');
          }}
          className={`apple-press px-2.5 py-1.5 rounded-xl transition cursor-pointer text-[11px] font-medium border ${
            selectedSlot === 'keyboard' || selectedSlot === 'mouse' || selectedSlot === 'mousepad'
              ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300 shadow-2xs'
              : 'hover:bg-slate-100 text-slate-600 border-transparent'
          }`}
        >
          ⌨️ Gear
        </button>

        <button
          onClick={() => {
            sounds.playSelect();
            orbit.focusSlot('chair');
            if (onSelectSlot) onSelectSlot('chair');
          }}
          className={`apple-press px-2.5 py-1.5 rounded-xl transition cursor-pointer text-[11px] font-medium border ${
            selectedSlot === 'chair' ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-300 shadow-2xs' : 'hover:bg-slate-100 text-slate-600 border-transparent'
          }`}
        >
          🪑 Seating
        </button>
      </div>

      {/* Bottom Left: Desk Motorized Height Readout */}
      <div className="absolute bottom-48 sm:bottom-44 left-4 z-20 pointer-events-none bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-md flex items-center gap-3 text-slate-800">
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Motorized Height</div>
          <div className="text-base font-bold font-mono text-emerald-700 flex items-center gap-1.5">
            <span>{config.deskHeightCm.toFixed(1)} cm</span>
            <span className="text-[10px] text-slate-500 font-normal">
              {config.deskHeightCm > 95 ? '(Standing Mode)' : '(Sitting Mode)'}
            </span>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Tabletop</div>
          <div className="text-xs font-semibold text-slate-900 capitalize">
            {config.tabletopFinish.replace('_', ' ')} · {config.deskWidthCm}cm
          </div>
        </div>
      </div>

      {/* Floating 360 Guidance */}
      <div className="absolute bottom-48 sm:bottom-44 right-4 z-20 pointer-events-none hidden md:flex items-center gap-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 text-[11px] text-slate-600 shadow-sm">
        <Maximize2 className="w-3 h-3 text-emerald-600" />
        <span>Click any 3D item to customize · Drag 360° to inspect</span>
      </div>
    </div>
  );
};
