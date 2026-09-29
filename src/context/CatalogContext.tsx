import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductCategory, WorkspaceConfiguration } from '../types/product';
import { DEFAULT_PRODUCTS, PRESET_SETUPS, BALI_DELIVERY_ZONES } from '../data/defaultCatalog';

interface CatalogContextType {
  products: Product[];
  config: WorkspaceConfiguration;
  activeTab: 'studio' | 'admin';
  setActiveTab: (tab: 'studio' | 'admin') => void;
  // Product management (Admin)
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetCatalog: () => void;
  exportCatalogJson: () => void;
  importCatalogJson: (json: string) => { success: boolean; error?: string };
  // Workspace config
  updateConfig: (updates: Partial<WorkspaceConfiguration>) => void;
  selectProduct: (category: ProductCategory, productId: string) => void;
  toggleAccessory: (accessoryId: string) => void;
  applyPreset: (presetId: string) => void;
  // Computed getters
  selectedDesk: Product | undefined;
  selectedChair: Product | undefined;
  selectedMonitor: Product | undefined;
  selectedLighting: Product | undefined;
  selectedAccessories: Product[];
  selectedZone: typeof BALI_DELIVERY_ZONES[0];
  totalWeekly: number;
  totalMonthly: number;
  totalDeposit: number;
  monthlyDiscountPercent: number;
}

const STORAGE_KEY = 'monis_catalog_v2';
const CONFIG_KEY = 'monis_workspace_config_v2';

const DEFAULT_CONFIG: WorkspaceConfiguration = {
  deskId: DEFAULT_PRODUCTS.find(p => p.category === 'desks')?.id || '',
  chairId: DEFAULT_PRODUCTS.find(p => p.category === 'chairs')?.id || '',
  monitorId: DEFAULT_PRODUCTS.find(p => p.category === 'monitors')?.id || '',
  lightingId: DEFAULT_PRODUCTS.find(p => p.category === 'lighting')?.id || '',
  accessoryIds: ['acc-keyboard-mouse-ergo', 'acc-felt-desk-pad', 'acc-monstera-plant'],
  deskHeightCm: 75,
  isNightMode: false,
  showErgonomics: false,
  cameraView: 'perspective',
  deliveryZone: 'canggu',
  rentalDuration: 'monthly',
};

const CatalogContext = createContext<CatalogContextType | null>(null);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved catalog', e);
    }
    return DEFAULT_PRODUCTS;
  });

  const [config, setConfig] = useState<WorkspaceConfiguration>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load saved config', e);
    }
    return DEFAULT_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'studio' | 'admin'>('studio');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save catalog to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  }, [config]);

  // Product CRUD
  const addProduct = (item: Omit<Product, 'id'>): Product => {
    const newId = `${item.category.slice(0, 4)}-${Date.now()}`;
    const newProduct: Product = { ...item, id: newId };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    // If the deleted product was selected in config, fallback
    setConfig(prev => {
      const next = { ...prev };
      if (next.deskId === id) {
        next.deskId = products.find(p => p.category === 'desks' && p.id !== id)?.id || '';
      }
      if (next.chairId === id) {
        next.chairId = products.find(p => p.category === 'chairs' && p.id !== id)?.id || '';
      }
      if (next.monitorId === id) {
        next.monitorId = products.find(p => p.category === 'monitors' && p.id !== id)?.id || '';
      }
      if (next.lightingId === id) {
        next.lightingId = products.find(p => p.category === 'lighting' && p.id !== id)?.id || '';
      }
      if (next.accessoryIds.includes(id)) {
        next.accessoryIds = next.accessoryIds.filter(accId => accId !== id);
      }
      return next;
    });
  };

  const resetCatalog = () => {
    setProducts(DEFAULT_PRODUCTS);
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIG_KEY);
  };

  const exportCatalogJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `monis-catalog-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importCatalogJson = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'Expected an array of products' };
      }
      // Basic validation
      const valid = parsed.every(item => item.id && item.name && item.category && typeof item.weeklyPrice === 'number');
      if (!valid) {
        return { success: false, error: 'JSON does not conform to Product schema' };
      }
      setProducts(parsed);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid JSON format' };
    }
  };

  const updateConfig = (updates: Partial<WorkspaceConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const selectProduct = (category: ProductCategory, productId: string) => {
    setConfig(prev => {
      switch (category) {
        case 'desks': return { ...prev, deskId: productId };
        case 'chairs': return { ...prev, chairId: productId };
        case 'monitors': return { ...prev, monitorId: productId };
        case 'lighting': return { ...prev, lightingId: productId };
        default: return prev;
      }
    });
  };

  const toggleAccessory = (accessoryId: string) => {
    setConfig(prev => {
      const exists = prev.accessoryIds.includes(accessoryId);
      return {
        ...prev,
        accessoryIds: exists
          ? prev.accessoryIds.filter(id => id !== accessoryId)
          : [...prev.accessoryIds, accessoryId]
      };
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESET_SETUPS.find(p => p.id === presetId);
    if (!preset) return;
    setConfig(prev => ({
      ...prev,
      deskId: preset.deskId,
      chairId: preset.chairId,
      monitorId: preset.monitorId,
      lightingId: preset.lightingId,
      accessoryIds: preset.accessoryIds,
      deskHeightCm: preset.deskHeightCm,
    }));
  };

  // Selected entities
  const selectedDesk = products.find(p => p.id === config.deskId);
  const selectedChair = products.find(p => p.id === config.chairId);
  const selectedMonitor = products.find(p => p.id === config.monitorId);
  const selectedLighting = products.find(p => p.id === config.lightingId);
  const selectedAccessories = products.filter(p => config.accessoryIds.includes(p.id));
  const selectedZone = BALI_DELIVERY_ZONES.find(z => z.id === config.deliveryZone) || BALI_DELIVERY_ZONES[0];

  // Price calculations
  const allActiveItems = [
    selectedDesk,
    selectedChair,
    selectedMonitor,
    selectedLighting,
    ...selectedAccessories
  ].filter(Boolean) as Product[];

  const totalWeekly = allActiveItems.reduce((sum, item) => sum + item.weeklyPrice, 0);
  const totalMonthly = allActiveItems.reduce((sum, item) => sum + item.monthlyPrice, 0);
  const totalDeposit = allActiveItems.reduce((sum, item) => sum + item.deposit, 0);

  // Compare 4 weeks vs monthly price
  const fourWeeksCost = totalWeekly * 4;
  const monthlyDiscountPercent = fourWeeksCost > 0
    ? Math.round(((fourWeeksCost - totalMonthly) / fourWeeksCost) * 100)
    : 25;

  return (
    <CatalogContext.Provider
      value={{
        products,
        config,
        activeTab,
        setActiveTab,
        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalog,
        exportCatalogJson,
        importCatalogJson,
        updateConfig,
        selectProduct,
        toggleAccessory,
        applyPreset,
        selectedDesk,
        selectedChair,
        selectedMonitor,
        selectedLighting,
        selectedAccessories,
        selectedZone,
        totalWeekly,
        totalMonthly,
        totalDeposit,
        monthlyDiscountPercent,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
