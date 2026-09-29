import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { SimsProduct } from '../../data/simsCatalog';
import { sounds } from '../../utils/soundEffects';
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
  const { statusMsg, showStatus } = useAdminStatus();

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
  const { editingItem, values, openAdd, openEdit, close } = productForm;

  const handleDuplicate = (item: SimsProduct) => {
    onAddProduct({
      ...item,
      id: `monis-${item.category}-${Date.now()}`,
      name: `${item.name} (Copy)`,
    });
    sounds.playPlace();
    showStatus(`Duplicated "${item.name}"`);
  };

  const handleDelete = (item: SimsProduct) => {
    if (window.confirm(`Delete "${item.name}" from inventory?`)) {
      sounds.playDelete();
      onDeleteProduct(item.id);
      showStatus(`Deleted "${item.name}"`);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset catalog back to initial crawled Monis equipment? Any custom changes will be replaced.')) {
      onResetCatalog();
      showStatus('Catalog reset to defaults');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      showStatus('Product name is required', 'error');
      return;
    }

    const productPayload = productFromForm(values, editingItem);

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

      {statusMsg && (
        <div className={`mb-4 p-3.5 rounded-2xl text-xs flex items-center gap-2 border animate-fade-in ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{statusMsg.text}</span>
        </div>
      )}

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
