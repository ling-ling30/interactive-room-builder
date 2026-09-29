export type ProductCategory = 'desks' | 'chairs' | 'monitors' | 'lighting' | 'accessories';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  weeklyPrice: number;
  monthlyPrice: number;
  deposit: number;
  description: string;
  dimensions: string;
  inStock: boolean;
  tags: string[];
  image: string; // URL, data URI, or asset identifier
  colors?: string[];
  specs?: Record<string, string>;
  modelType?: 'procedural' | 'custom_image';
  // Visual attributes for the layered studio renderer
  visualProps?: {
    materialVariant?: 'oak' | 'walnut' | 'bamboo' | 'black' | 'white';
    chairVariant?: 'aeron' | 'gesture' | 'executive' | 'stool';
    monitorVariant?: 'single' | 'dual' | 'ultrawide';
    lightVariant?: 'screenbar' | 'lamp' | 'minimal';
    accessoryVariant?: 'keyboard_mouse' | 'laptop_stand' | 'plant' | 'mat';
    frameColor?: string;
    widthCm?: number;
    depthCm?: number;
  };
}

export interface WorkspaceConfiguration {
  deskId: string;
  chairId: string;
  monitorId: string;
  lightingId: string;
  accessoryIds: string[];
  deskHeightCm: number; // 72 to 115
  isNightMode: boolean;
  showErgonomics: boolean;
  cameraView: 'perspective' | 'front' | 'top';
  deliveryZone: string;
  rentalDuration: 'weekly' | 'monthly';
}
