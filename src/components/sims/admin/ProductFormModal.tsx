import React, { useRef } from 'react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { Box, X } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { ShowStatus } from './useAdminStatus';
import type { useProductForm } from './useProductForm';
import { ProductInfoSection } from './form/ProductInfoSection';
import { ProductMediaSection } from './form/ProductMediaSection';
import { ProductDimensionsSection } from './form/ProductDimensionsSection';
import { ProductPricingSection } from './form/ProductPricingSection';
import { ProductDescriptionSection } from './form/ProductDescriptionSection';

interface ProductFormModalProps {
  /** Result of `useProductForm` (state + actions for the modal). */
  formState: ReturnType<typeof useProductForm>;
  catalog: SimsProduct[];
  availableCategories: string[];
  showStatus: ShowStatus;
  onSubmit: (e: React.FormEvent) => void;
  onInspectPreview: () => void;
}

/** Add / edit product dialog composed of five form sections. */
export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  formState,
  catalog,
  availableCategories,
  showStatus,
  onSubmit,
  onInspectPreview,
}) => {
  const { isOpen, editingItem, close, isCustomCategory, setIsCustomCategory, previewProduct } = formState;
  useEscapeKey(isOpen, close);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);
  if (!isOpen) return null;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Product form" tabIndex={-1} className="outline-none fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-auto border border-slate-200 text-slate-900 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingItem ? `Edit: ${editingItem.name}` : 'Add New Furniture to Inventory'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure real photos, 3D model files, dimensions, and rental rates
              </p>
            </div>
          </div>

          <button
            onClick={close}
            className="apple-press p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 pt-4">
          <ProductInfoSection
            form={formState}
            catalog={catalog}
            availableCategories={availableCategories}
            isCustomCategory={isCustomCategory}
            onCustomCategoryChange={setIsCustomCategory}
          />
          <ProductMediaSection
            form={formState}
            editingItem={editingItem}
            previewProduct={previewProduct}
            showStatus={showStatus}
            onInspectPreview={onInspectPreview}
          />
          <ProductDimensionsSection form={formState} />
          <ProductPricingSection form={formState} />
          <ProductDescriptionSection form={formState} />

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={close}
              className="apple-press px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="apple-press px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {editingItem ? 'Save Changes' : 'Create & Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
