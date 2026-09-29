import React, { useMemo, useState } from 'react';
import type { SimsProduct } from '../../data/simsCatalog';
import { sounds } from '../../utils/soundEffects';
import { newId } from '../../utils/ids';
import { useDialogs } from '../../hooks/useDialogs';
import { Model3DInspectModal } from './ui/Model3DInspectModal';
import { AdminHeader } from './admin/AdminHeader';
import { AdminKpiStrip } from './admin/AdminKpiStrip';
import { AdminFilterBar } from './admin/AdminFilterBar';
import { AdminCatalogTable } from './admin/AdminCatalogTable';
import { AdminTableToolbar } from './admin/AdminTableToolbar';
import { AdminTablePagination } from './admin/AdminTablePagination';
import { useCatalogTable } from './admin/useCatalogTable';
import { ProductFormModal } from './admin/ProductFormModal';
import { AdminSetupsSection } from './admin/AdminSetupsSection';
import type { RoomSetupsApi } from '../../utils/setupStorage';
import { productFromForm } from './admin/productForm';
import { useAdminStatus } from './admin/useAdminStatus';
import { useProductForm } from './admin/useProductForm';

interface SimsAdminManagerProps {
  catalog: SimsProduct[];
  onAddProduct: (product: SimsProduct) => void;
  onUpdateProduct: (id: string, updates: Partial<SimsProduct>) => void;
  onDeleteProduct: (id: string) => void;
  onResetCatalog: () => void;
  onExportCatalog: () => void;
  onImportCatalog: (jsonStr: string) => boolean;
  onBackToSims: () => void;
  onBackToShowcase?: () => void;
  /** Room setups store and the studio room the CMS can snapshot as a new setup. */
  roomSetups: RoomSetupsApi;
  currentRoomItemCount: number;
  onSaveCurrentRoomAsSetup: (name: string) => void;
}

export const SimsAdminManager: React.FC<SimsAdminManagerProps> = ({
  catalog,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetCatalog,
  onExportCatalog,
  onImportCatalog,
  onBackToSims,
  onBackToShowcase,
  roomSetups,
  currentRoomItemCount,
  onSaveCurrentRoomAsSetup,
}) => {
  const [inspectingProduct, setInspectingProduct] = useState<SimsProduct | null>(null);
  const { showStatus } = useAdminStatus();

  // Derived existing categories from current catalog
  const availableCategories = useMemo(() => {
    const defaultCats = ['desks', 'chairs', 'tech', 'lighting', 'decor'];
    const catalogCats = catalog.map(p => p.category?.toLowerCase().trim()).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...catalogCats]));
  }, [catalog]);

  const totalMonthlyFleet = useMemo(
    () => catalog.reduce((acc, p) => acc + (p.monthlyRent || 0), 0),
    [catalog]
  );

  const table = useCatalogTable(catalog);
  const productForm = useProductForm(availableCategories);
  const { editingItem, openAdd, openEdit, close } = productForm;

  const handleDuplicate = (item: SimsProduct) => {
    onAddProduct({
      ...item,
      id: newId(`monis-${item.category}`),
      name: `${item.name} (Copy)`,
    });
    sounds.playPlace();
    showStatus(`Duplicated "${item.name}"`);
  };

  const { confirm } = useDialogs();

  const handleDelete = async (item: SimsProduct) => {
    if (await confirm({ title: 'Delete item', message: `Delete "${item.name}" from inventory?`, confirmLabel: 'Delete', danger: true })) {
      sounds.playDelete();
      onDeleteProduct(item.id);
      showStatus(`Deleted "${item.name}"`);
    }
  };

  const handleReset = async () => {
    if (await confirm({ title: 'Reset catalog', message: 'Reset catalog back to initial crawled Monis equipment? Any custom changes will be replaced.', confirmLabel: 'Reset', danger: true })) {
      onResetCatalog();
      showStatus('Catalog reset to defaults');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = productForm.validate();
    if (!result.success) {
      showStatus('Please fix the highlighted fields', 'error');
      // Let the error state render, then jump to the first invalid field
      setTimeout(() => document.querySelector<HTMLElement>('[data-product-form] [aria-invalid="true"]')?.focus(), 0);
      return;
    }

    const productPayload = productFromForm(result.data, editingItem);

    if (editingItem) {
      onUpdateProduct(editingItem.id, productPayload);
      showStatus(`Updated "${productPayload.name}"`);
    } else {
      onAddProduct(productPayload);
      showStatus(`Added "${productPayload.name}" to inventory`);
    }

    sounds.playPlace();
    close();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const ok = onImportCatalog(event.target?.result as string);
      if (ok) {
        showStatus('Catalog imported successfully!');
      } else {
        showStatus('Failed to import JSON file. Check structure.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in text-slate-900 select-none">
      <AdminHeader
        onAdd={openAdd}
        onExport={onExportCatalog}
        onImportFile={handleImportFile}
        onReset={handleReset}
        onBackToSims={onBackToSims}
        onBackToShowcase={onBackToShowcase}
      />

      <AdminKpiStrip
        totalItems={catalog.length}
        categoryCount={availableCategories.length}
        totalMonthlyFleet={totalMonthlyFleet}
        itemsWithPhotos={catalog.filter(p => Boolean(p.imageUrl)).length}
      />

      <AdminFilterBar
        catalog={catalog}
        availableCategories={availableCategories}
        search={table.search}
        onSearchChange={table.setSearch}
        activeCategory={table.category}
        onCategoryChange={table.setCategory}
      />

      <AdminTableToolbar table={table} />

      <AdminCatalogTable
        items={table.pageItems}
        sort={table.sort}
        onSort={table.toggleSort}
        onResetFilters={table.activeFilterCount > 0 ? table.resetAll : undefined}
        onInspect={setInspectingProduct}
        onDuplicate={handleDuplicate}
        onEdit={openEdit}
        onDelete={handleDelete}
        footer={
          <AdminTablePagination
            page={table.page}
            pageCount={table.pageCount}
            pageSize={table.pageSize}
            filteredCount={table.filteredCount}
            totalCount={table.totalCount}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        }
      />

      <AdminSetupsSection
        setups={roomSetups.setups}
        catalog={catalog}
        currentRoomItemCount={currentRoomItemCount}
        onSaveCurrentRoom={onSaveCurrentRoomAsSetup}
        onUpdate={roomSetups.updateSetup}
        onDuplicate={roomSetups.duplicateSetup}
        onDelete={roomSetups.deleteSetup}
      />

      <ProductFormModal
        formState={productForm}
        catalog={catalog}
        availableCategories={availableCategories}
        showStatus={showStatus}
        onSubmit={handleSubmit}
        onInspectPreview={() => setInspectingProduct(productForm.previewProduct)}
      />

      {/* 3D Model Inspection Studio Modal */}
      <Model3DInspectModal
        product={inspectingProduct}
        isOpen={Boolean(inspectingProduct)}
        onClose={() => setInspectingProduct(null)}
        onEdit={(prod) => {
          setInspectingProduct(null);
          openEdit(prod);
        }}
        onDuplicate={(prod) => {
          setInspectingProduct(null);
          handleDuplicate(prod);
        }}
        onUpdateDimensions={(productId, dims) => {
          onUpdateProduct(productId, {
            actualDimensions: {
              widthM: dims.widthM,
              depthM: dims.depthM,
              heightM: dims.heightM,
            },
            heightCm: Math.round(dims.heightM * 100),
            scaleMultiplier: dims.scaleMultiplier,
            fitMode: dims.fitMode,
          });
          showStatus(`Updated dimensions for ${inspectingProduct?.name || 'product'}`);
        }}
      />
    </div>
  );
};
