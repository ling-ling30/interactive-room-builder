import type { SimsProduct, SimsCategory } from '../../../data/simsCatalog';
import type { ModelType } from '../../../data/modelTypes';
import { newId } from '../../../utils/ids';
import type { NumberValue } from '../../ui/NumberInput';
import type { ProductFormData } from './productSchema';

export interface ProductFormValues {
  name: string;
  brand: string;
  category: string;
  // Numeric inputs can be blank while typing (never silently 0); the schema decides what is valid
  widthTiles: NumberValue;
  depthTiles: NumberValue;
  actualWidthM: NumberValue;
  actualDepthM: NumberValue;
  actualHeightM: NumberValue;
  weeklyRent: NumberValue;
  monthlyRent: NumberValue;
  deposit: NumberValue;
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

/** Normalized product ready to be saved to the catalog (input is the schema-validated form data). */
export function productFromForm(v: ProductFormData, editingItem: SimsProduct | null): SimsProduct {
  const category = v.category.toLowerCase() as SimsCategory;

  return {
    id: editingItem ? editingItem.id : newId(`monis-${category}`),
    name: v.name,
    brand: v.brand || 'Monis',
    category,
    footprint: { width: v.widthTiles, depth: v.depthTiles },
    actualDimensions: { widthM: v.actualWidthM, depthM: v.actualDepthM, heightM: v.actualHeightM },
    weeklyRent: v.weeklyRent,
    monthlyRent: v.monthlyRent,
    deposit: v.deposit,
    layer: v.layer,
    color: v.color,
    colorOptions: editingItem?.colorOptions || [v.color, '#1e293b', '#cbd5e1', '#f1f5f9'],
    modelType: v.modelType,
    icon: v.icon || '🪵',
    description: v.description,
    material: v.material,
    imageUrl: v.imageUrl || undefined,
    modelUrl: v.modelUrl || undefined,
    heightCm: Math.round(v.actualHeightM * 100),
    dimensionsText: `${Math.round(v.actualWidthM * 100)}×${Math.round(v.actualDepthM * 100)} cm`,
    scaleMultiplier: v.scaleMultiplier,
    fitMode: v.fitMode,
    variants: editingItem?.variants,
  };
}
