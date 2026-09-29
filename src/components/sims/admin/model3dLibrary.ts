import type { ModelType } from '../../../data/modelTypes';
import type { ProductFormValues } from './productForm';

export const PUBLIC_3D_LIBRARY = [
  { value: '', label: 'Select from 3D Library (public/3dObject/)...', description: 'None chosen (use procedural fallback)' },
  { value: '/3dObject/heavy_duty_standing_table.glb', label: 'Heavy Duty Standing Table', description: '5.0MB • Height Adjustable Table' },
  { value: '/3dObject/ergonomic_mesh_office_chair.glb', label: 'Ergonomic Mesh Office Chair', description: '5.6MB • Modern 4D Mesh Chair' },
  { value: '/3dObject/office_chair.glb', label: 'Office Chair Classic', description: '2.8MB • Swivel Office Armchair' },
  { value: '/3dObject/office_chair_gaming_chair.glb', label: 'Office / Gaming Chair', description: '3.3MB • Contoured Racing Cushion' },
  { value: '/3dObject/office_chair _long.glb', label: 'Office Chair High-Back Long', description: '11.4MB • Tall Ergonomic High-Back' },
  { value: '/3dObject/ultrawide_monitor.glb', label: '34" Curved Ultrawide Display', description: '7.8MB • 21:9 Cinema Screen' },
  { value: '/3dObject/dual_monitor.glb', label: 'Dual Monitor Arm Setup', description: '62KB • Lightweight Dual Screens' },
  { value: '/3dObject/xiaomi_led_desk_lamp_1s.glb', label: 'Xiaomi LED Desk Lamp 1S', description: '7.3MB • Slim Architectural Lamp' },
  { value: '/3dObject/tomons_desk_lamp.glb', label: 'Tomons Nordic Desk Lamp', description: '1.1MB • Natural Wood Joint Lamp' },
  { value: '/3dObject/modern_desk_lamp.glb', label: 'Modern Articulated Desk Lamp', description: '14.8MB • Premium Balanced Arm' },
  { value: '/3dObject/custom_-_mechanical_keyboard.glb', label: 'Custom Mechanical Keyboard', description: '3.5MB • Tactile Studio Board' },
  { value: '/3dObject/gaming_keyboard.glb', label: 'Pro RGB Gaming Keyboard', description: '4.3MB • Full Mechanical Board' },
  { value: '/3dObject/computer_mouse_low-poly.glb', label: 'Minimalist Wireless Mouse', description: '58KB • Ultra-light Studio Mouse' },
  { value: '/3dObject/computer_mouse_a4tech_bloody_v7.glb', label: 'A4Tech Bloody V7 Gaming Mouse', description: '6.8MB • Ergonomic Gaming Grip' },
];

export const PROCEDURAL_MODEL_OPTIONS: { value: ModelType; label: string }[] = [
  { value: 'standing_desk', label: 'Motorized Standing Desk' },
  { value: 'executive_desk', label: 'Solid Walnut Executive Desk' },
  { value: 'compact_desk', label: 'Compact Crank Desk' },
  { value: 'highback_chair', label: 'Ergonomic Mesh Chair' },
  { value: 'aeron_chair', label: 'Aeron High-Performance Chair' },
  { value: 'active_stool', label: 'Active Sitting Stool' },
  { value: 'lounge_chair', label: 'Lounge Chair' },
  { value: 'ultrawide_monitor', label: '34" Ultrawide Curved Monitor' },
  { value: 'dual_monitors', label: 'Dual 27" 4K Monitor Arms' },
  { value: 'single_monitor', label: 'Single 27" Studio Monitor' },
  { value: 'laptop_stand', label: 'Laptop Stand' },
  { value: 'screenbar', label: 'Screenbar Light Halo' },
  { value: 'desk_lamp', label: 'Nordic Articulated Lamp' },
  { value: 'floor_lamp', label: 'Floor Lamp' },
  { value: 'monstera_plant', label: 'Potted Monstera Plant' },
  { value: 'jute_rug', label: 'Jute Rug' },
  { value: 'bookshelf', label: 'Bookshelf' },
  { value: 'standing_board', label: 'Mobile Whiteboard' },
  { value: 'mechanical_keyboard', label: 'Mechanical Keyboard' },
  { value: 'gaming_keyboard', label: 'Gaming Keyboard' },
  { value: 'computer_mouse', label: 'Computer Mouse' },
  { value: 'desk_mat', label: 'Desk Mat' },
  { value: 'desk_organizer', label: 'Desk Organizer' },
  { value: 'headphone_stand', label: 'Headphone Stand' },
  { value: 'coffee_mug', label: 'Coffee Mug' },
];

/** Form fields auto-filled (category, layer, footprint, true size, procedural preset) when a library model is picked. */
export function getPresetFieldsForModelPath(path: string): Partial<ProductFormValues> {
  if (!path) return {};

  if (path.includes('chair')) {
    return {
      category: 'chairs', layer: 'floor', widthTiles: 1, depthTiles: 1,
      actualWidthM: 0.65, actualDepthM: 0.65, actualHeightM: 1.05, modelType: 'highback_chair',
    };
  }
  if (path.includes('table') || path.includes('desk')) {
    // "*_desk_lamp.glb" matches here and is intentionally left untouched (pre-existing behavior).
    if (path.includes('lamp')) return {};
    return {
      category: 'desks', layer: 'floor', widthTiles: 1.5, depthTiles: 1,
      actualWidthM: 1.4, actualDepthM: 0.7, actualHeightM: 0.74, modelType: 'standing_desk',
    };
  }
  if (path.includes('keyboard')) {
    return {
      layer: 'surface', category: 'tech', widthTiles: 0.5, depthTiles: 0.5,
      actualWidthM: 0.44, actualDepthM: 0.14, actualHeightM: 0.04,
    };
  }
  if (path.includes('mouse')) {
    return {
      layer: 'surface', category: 'tech', widthTiles: 0.5, depthTiles: 0.5,
      actualWidthM: 0.08, actualDepthM: 0.12, actualHeightM: 0.04,
    };
  }
  if (path.includes('lamp')) {
    return {
      layer: 'surface', category: 'lighting', widthTiles: 0.5, depthTiles: 0.5,
      actualWidthM: 0.35, actualDepthM: 0.18, actualHeightM: 0.45, modelType: 'desk_lamp',
    };
  }
  if (path.includes('monitor')) {
    const isDual = path.includes('dual');
    return {
      layer: 'surface', category: 'tech',
      widthTiles: isDual ? 1.25 : 1, depthTiles: 0.5,
      actualWidthM: isDual ? 1.22 : 0.81, actualDepthM: 0.24, actualHeightM: 0.48,
      modelType: isDual ? 'dual_monitors' : 'ultrawide_monitor',
    };
  }
  return {};
}
