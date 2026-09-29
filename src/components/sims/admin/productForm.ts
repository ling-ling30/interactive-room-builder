import type { SimsProduct, SimsCategory } from '../../../data/simsCatalog';
import type { ModelType } from '../../../data/modelTypes';
import { newId } from '../../../utils/ids';

export interface ProductFormValues {
  name: string;
  brand: string;
  category: string;
  widthTiles: number;
  depthTiles: number;
  actualWidthM: number;
  actualDepthM: number;
  actualHeightM: number;
  weeklyRent: number;
  monthlyRent: number;
  deposit: number;
  layer: 'floor' | 'surface';
  color: string;
  modelType: ModelType;
  icon: string;
  description: string;
  material: string;
  imageUrl: string;
  modelUrl: string;
  modelFileName: string;
  scaleMultiplier: number;
  fitMode: 'proportional' | 'exact';
}

/** Defaults shown when opening "Add New Item". */
export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: '',
  brand: 'Monis Studio',
  category: 'desks',
  widthTiles: 1.5,
  depthTiles: 1,
  actualWidthM: 1.4,
  actualDepthM: 0.7,
  actualHeightM: 0.74,
  weeklyRent: 12,
  monthlyRent: 32,
  deposit: 20,
  layer: 'floor',
  color: '#d4a373',
  modelType: 'standing_desk',
  icon: '🪵',
  description: '',
  material: 'Steel frame, solid natural wood top',
  imageUrl: '',
  modelUrl: '',
  modelFileName: '',
  scaleMultiplier: 1.0,
  fitMode: 'proportional',
};

export function formFromProduct(item: SimsProduct): ProductFormValues {
  return {
    name: item.name,
    brand: item.brand,
    category: item.category,
    widthTiles: item.footprint.width,
    depthTiles: item.footprint.depth,
    actualWidthM: item.actualDimensions?.widthM ?? item.footprint.width,
    actualDepthM: item.actualDimensions?.depthM ?? item.footprint.depth,
    actualHeightM: item.actualDimensions?.heightM ?? (item.heightCm ? item.heightCm / 100 : 0.74),
    weeklyRent: item.weeklyRent,
    monthlyRent: item.monthlyRent,
    deposit: item.deposit,
    layer: item.layer,
    color: item.color,
    modelType: item.modelType,
    icon: item.icon || '🪵',
    description: item.description,
    material: item.material || '',
    imageUrl: item.imageUrl || '',
    modelUrl: item.modelUrl || '',
    modelFileName: item.modelUrl ? 'Custom 3D Model Attached' : '',
    scaleMultiplier: item.scaleMultiplier ?? 1.0,
    fitMode: item.fitMode ?? (item.category === 'desks' ? 'exact' : 'proportional'),
  };
}

/** Lenient product used for the live 3D viewport while the form is still being filled in. */
export function previewProductFromForm(v: ProductFormValues, editingItem: SimsProduct | null): SimsProduct {
  return {
    id: editingItem ? editingItem.id : 'preview-temp',
    name: v.name || 'Preview Item',
    brand: v.brand || 'Monis Studio',
    category: (v.category as SimsCategory) || 'desks',
    footprint: {
      width: Number(v.widthTiles) || 1,
      depth: Number(v.depthTiles) || 1,
    },
    actualDimensions: {
      widthM: Number(v.actualWidthM) || 1,
      depthM: Number(v.actualDepthM) || 1,
      heightM: Number(v.actualHeightM) || 0.74,
    },
    weeklyRent: Number(v.weeklyRent) || 10,
    monthlyRent: Number(v.monthlyRent) || 30,
    deposit: Number(v.deposit) || 20,
    layer: v.layer || 'floor',
    color: v.color || '#d4a373',
    colorOptions: [v.color || '#d4a373'],
    modelType: v.modelType,
    icon: v.icon || '📦',
    description: v.description || '',
    material: v.material || '',
    imageUrl: v.imageUrl || undefined,
    modelUrl: v.modelUrl || undefined,
    scaleMultiplier: v.scaleMultiplier,
    fitMode: v.fitMode,
  };
}

/** Normalized product ready to be saved to the catalog. */
export function productFromForm(v: ProductFormValues, editingItem: SimsProduct | null): SimsProduct {
  const cleanCategory = (v.category.trim() || 'decor').toLowerCase() as SimsCategory;

  return {
    id: editingItem ? editingItem.id : newId(`monis-${cleanCategory}`),
    name: v.name.trim(),
    brand: v.brand.trim() || 'Monis',
    category: cleanCategory,
    footprint: {
      width: Math.max(0.5, Number(v.widthTiles)),
      depth: Math.max(0.5, Number(v.depthTiles)),
    },
    actualDimensions: {
      widthM: Number(v.actualWidthM) || Number(v.widthTiles),
      depthM: Number(v.actualDepthM) || Number(v.depthTiles),
      heightM: Number(v.actualHeightM) || 0.74,
    },
    weeklyRent: Math.max(0, Number(v.weeklyRent)),
    monthlyRent: Math.max(0, Number(v.monthlyRent)),
    deposit: Math.max(0, Number(v.deposit)),
    layer: v.layer,
    color: v.color,
    colorOptions: editingItem?.colorOptions || [v.color, '#1e293b', '#cbd5e1', '#f1f5f9'],
    modelType: v.modelType,
    icon: v.icon || '🪵',
    description: v.description.trim(),
    material: v.material.trim(),
    imageUrl: v.imageUrl.trim() || undefined,
    modelUrl: v.modelUrl.trim() || undefined,
    heightCm: Math.round(Number(v.actualHeightM) * 100),
    dimensionsText: `${Math.round(Number(v.actualWidthM) * 100)}×${Math.round(Number(v.actualDepthM) * 100)} cm`,
    scaleMultiplier: v.scaleMultiplier,
    fitMode: v.fitMode,
    variants: editingItem?.variants,
  };
}
