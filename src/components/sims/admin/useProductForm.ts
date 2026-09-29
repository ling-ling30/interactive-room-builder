import { useCallback, useMemo, useState } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';
import {
  EMPTY_PRODUCT_FORM,
  formFromProduct,
  previewProductFromForm,
  type ProductFormValues,
} from './productForm';

export interface ProductFormApi {
  values: ProductFormValues;
  set: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  patch: (partial: Partial<ProductFormValues>) => void;
}

/** State for the add / edit product modal (open flag, editing target, all form fields, live preview product). */
export function useProductForm(availableCategories: string[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimsProduct | null>(null);
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);

  const set = useCallback(<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const patch = useCallback((partial: Partial<ProductFormValues>) => {
    setValues(prev => ({ ...prev, ...partial }));
  }, []);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setValues(EMPTY_PRODUCT_FORM);
    setIsCustomCategory(false);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: SimsProduct) => {
    setEditingItem(item);
    setValues(formFromProduct(item));
    setIsCustomCategory(!availableCategories.some(c => c.toLowerCase() === item.category?.toLowerCase()));
    setIsOpen(true);
  }, [availableCategories]);

  const close = useCallback(() => setIsOpen(false), []);

  const previewProduct = useMemo(() => previewProductFromForm(values, editingItem), [values, editingItem]);

  return {
    isOpen,
    editingItem,
    values,
    set,
    patch,
    isCustomCategory,
    setIsCustomCategory,
    previewProduct,
    openAdd,
    openEdit,
    close,
  };
}
