import React from 'react';
import type { SimsProduct, PlacedFurniture } from '../../../data/simsCatalog';
import type { FloorStyle } from '../../../types/space';
import { getEffectiveFootprint } from '../three/spatialMath';

const FLOOR_COLORS: Record<FloorStyle, string> = {
  wood: '#d9b98a',
  terrazzo: '#e4d9c6',
  concrete: '#c4c7cc',
  marble: '#eef1f5',
};

const CATEGORY_COLORS: Record<string, string> = {
  desks: '#b08356',
  chairs: '#475569',
  tech: '#1e293b',
  accessories: '#64748b',
  lighting: '#f59e0b',
  decor: '#059669',
};

interface RoomLayoutPreviewProps {
  width: number;
  length: number;
  floorStyle: FloorStyle;
  wallColor?: string;
  backdropColor?: string;
  items: PlacedFurniture[];
  catalog: SimsProduct[];
  className?: string;
  showGrid?: boolean;
  showLabel?: boolean;
}

/** Top-down virtual room: floor, 1 m grid and every furniture footprint (surface items drawn on top of desks). */
export const RoomLayoutPreview: React.FC<RoomLayoutPreviewProps> = ({
  width,
  length,
  floorStyle,
  wallColor = '#f8f6f0',
  backdropColor = '#f0ece1',
  items,
  catalog,
  className = '',
  showGrid = true,
  showLabel = true,
}) => {
  const byId = new Map(catalog.map(p => [p.id, p]));
  const PAD = 0.18;
  const isRug = (item: PlacedFurniture) => byId.get(item.productId)?.modelType === 'jute_rug';
  // Rugs first, then floor items, then desk items on top
  const sorted = [...items].sort((a, b) => Number(isRug(b)) - Number(isRug(a)) || (a.surfaceY || 0) - (b.surfaceY || 0));

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${width + PAD * 2} ${length + PAD * 2}`}
      className={`w-full h-auto rounded-xl ${className}`}
      style={{ backgroundColor: backdropColor }}
      role="img"
      aria-label={`Top-down layout of a ${width} by ${length} metre room`}
    >
      {/* Walls */}
      <rect x={-PAD / 2} y={-PAD / 2} width={width + PAD} height={length + PAD} rx={0.06} fill={wallColor} stroke="#a8a29e" strokeWidth={0.03} />
      {/* Floor */}
      <rect x={0} y={0} width={width} height={length} fill={FLOOR_COLORS[floorStyle]} />

      {showGrid && Array.from({ length: Math.max(0, Math.floor(width) - 1) }, (_, i) => (
        <line key={`vx${i}`} x1={i + 1} y1={0} x2={i + 1} y2={length} stroke="#00000018" strokeWidth={0.015} />
      ))}
      {showGrid && Array.from({ length: Math.max(0, Math.floor(length) - 1) }, (_, i) => (
        <line key={`hz${i}`} x1={0} y1={i + 1} x2={width} y2={i + 1} stroke="#00000018" strokeWidth={0.015} />
      ))}

      {sorted.map(item => {
        const product = byId.get(item.productId);
        if (!product) return null;
        const fp = getEffectiveFootprint(product, item.rotation);
        const isSurface = (item.surfaceY || 0) > 0;
        // Draw the real-world size, centred on the footprint the 3D engine centres the mesh on
        const swap = ((Math.round(item.rotation) % 180) + 180) % 180 === 90;
        const realW = product.actualDimensions?.widthM ?? product.footprint.width;
        const realD = product.actualDimensions?.depthM ?? product.footprint.depth;
        const w = swap ? realD : realW;
        const d = swap ? realW : realD;
        const cx = item.gridX + fp.width / 2;
        const cz = item.gridZ + fp.depth / 2;
        const fill = isRug(item) ? '#c9a878' : CATEGORY_COLORS[product.category] ?? '#78716c';
        const fillOpacity = isRug(item) ? 0.7 : isSurface ? 0.95 : 0.85;
        return isRug(item) ? (
          <ellipse key={item.instanceId} cx={cx} cy={cz} rx={w / 2} ry={d / 2} fill={fill} fillOpacity={fillOpacity}>
            <title>{product.name}</title>
          </ellipse>
        ) : (
          <rect
            key={item.instanceId}
            x={cx - w / 2}
            y={cz - d / 2}
            width={w}
            height={d}
            rx={0.04}
            fill={fill}
            fillOpacity={fillOpacity}
            stroke={isSurface ? '#ffffffcc' : '#00000033'}
            strokeWidth={0.02}
          >
            <title>{product.name}</title>
          </rect>
        );
      })}

      {showLabel && (
        <text x={width / 2} y={length + PAD * 0.75} textAnchor="middle" fontSize={0.16} fill="#57534e" fontFamily="monospace">
          {width} × {length} m
        </text>
      )}
    </svg>
  );
};
