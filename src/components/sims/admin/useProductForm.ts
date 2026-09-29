import { useCallback, useMemo, useState } from 'react';
import type { SimsProduct } from '../../../data/simsCatalog';
import {
  EMPTY_PRODUCT_FORM,
  formFromProduct,
  previewProductFromForm,
  type ProductFormValues,
} from './productForm';
import { validateProductForm, type FormErrors } from './productSchema';

export interface ProductFormApi {
  values: ProductFormValues;
  set: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  patch: (partial: Partial<ProductFormValues>) => void;
  /** Validation messages from the last submit attempt; a field's message clears as soon as it is edited. */
  errors: FormErrors;
}

/** State for the add / edit product modal (open flag, editing target, all form fields, live preview product). */
export function useProductForm(availableCategories: string[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SimsProduct | null>(null);
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearErrors = useCallback((keys: string[]) => {
    setErrors(prev => (keys.some(k => prev[k as keyof FormErrors]) ? { ...prev, ...Object.fromEntries(keys.map(k => [k, undefined])) } : prev));
  }, []);

  const set = useCallback(<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    clearErrors([key]);
  }, [clearErrors]);

  const patch = useCallback((partial: Partial<ProductFormValues>) => {
    setValues(prev => ({ ...prev, ...partial }));
    clearErrors(Object.keys(partial));
  }, [clearErrors]);

  /** Runs the schema, stores the messages and returns the result (validated data on success). */
  const validate = useCallback(() => {
    const result = validateProductForm(values);
    setErrors(result.success ? {} : result.errors);
    return result;
  }, [values]);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setValues(EMPTY_PRODUCT_FORM);
    setErrors({});
    setIsCustomCategory(false);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: SimsProduct) => {
    setEditingItem(item);
    setValues(formFromProduct(item));
    setErrors({});
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
    errors,
    validate,
    isCustomCategory,
    setIsCustomCategory,
    previewProduct,
    openAdd,
    openEdit,
    close,
  };
}
