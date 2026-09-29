import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import type { Product, ProductCategory } from '../../types/product';
import {
  Plus, Search, Edit3, Trash2, Download, Upload, RotateCcw,
  CheckCircle2, XCircle, Eye, Sparkles, X, Image as ImageIcon
} from 'lucide-react';
import { AppleSelect } from '../sims/ui/AppleSelect';

export const AdminPortal: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetCatalog,
    exportCatalogJson,
    importCatalogJson,
    selectProduct,
    setActiveTab,
  } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('desks');
  const [weeklyPrice, setWeeklyPrice] = useState<number>(25);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(75);
  const [deposit, setDeposit] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('140 x 70 cm');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [inStock, setInStock] = useState(true);

  // Visual appearance presets
  const [materialVariant, setMaterialVariant] = useState<'oak' | 'walnut' | 'bamboo' | 'black' | 'white'>('oak');
  const [chairVariant, setChairVariant] = useState<'aeron' | 'gesture' | 'executive' | 'stool'>('aeron');
  const [monitorVariant, setMonitorVariant] = useState<'single' | 'dual' | 'ultrawide'>('single');
  const [lightVariant, setLightVariant] = useState<'screenbar' | 'lamp' | 'minimal'>('screenbar');

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setBrand('Monis Pro');
    setCategory('desks');
    setWeeklyPrice(25);
    setMonthlyPrice(75);
    setDeposit(50);
    setDescription('');
    setDimensions('140 x 70 cm');
    setTagsInput('Ergonomic, Dual-Motor');
    setImageUrl('https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80');
    setInStock(true);
    setMaterialVariant('oak');
    setChairVariant('aeron');
    setMonitorVariant('single');
    setLightVariant('screenbar');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setWeeklyPrice(p.weeklyPrice);
    setMonthlyPrice(p.monthlyPrice);
    setDeposit(p.deposit);
    setDescription(p.description);
    setDimensions(p.dimensions);
    setTagsInput(p.tags.join(', '));
    setImageUrl(p.image);
    setInStock(p.inStock);
    if (p.visualProps?.materialVariant) setMaterialVariant(p.visualProps.materialVariant);
    if (p.visualProps?.chairVariant) setChairVariant(p.visualProps.chairVariant);
    if (p.visualProps?.monitorVariant) setMonitorVariant(p.visualProps.monitorVariant);
    if (p.visualProps?.lightVariant) setLightVariant(p.visualProps.lightVariant);
    setIsModalOpen(true);
  };

  // Image file upload handler (converts local file to Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const visualProps: Product['visualProps'] = {
      materialVariant: category === 'desks' ? materialVariant : undefined,
      chairVariant: category === 'chairs' ? chairVariant : undefined,
      monitorVariant: category === 'monitors' ? monitorVariant : undefined,
      lightVariant: category === 'lighting' ? lightVariant : undefined,
      frameColor: '#1c1f26',
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        brand,
        category,
        weeklyPrice: Number(weeklyPrice),
        monthlyPrice: Number(monthlyPrice),
        deposit: Number(deposit),
        description,
        dimensions,
        tags,
        image: imageUrl || 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80',
        inStock,
        visualProps,
      });
    } else {
      addProduct({
        name,
        brand,
        category,
        weeklyPrice: Number(weeklyPrice),
        monthlyPrice: Number(monthlyPrice),
        deposit: Number(deposit),
        description,
        dimensions,
        tags,
        image: imageUrl || 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80',
        inStock,
        visualProps,
      });
    }

    setIsModalOpen(false);
  };

  // Quick test in studio
  const handleTestInStudio = (product: Product) => {
    selectProduct(product.category, product.id);
    setActiveTab('studio');
  };

  // Import JSON handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const res = importCatalogJson(text);
        if (res.success) {
          setImportStatus('Catalog imported successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus(`Import error: ${res.error}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Top Banner / Heading */}
      <div className="bg-[#141721] border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              Back-Office CMS
            </span>
            <span className="text-xs text-slate-400">Inventory & Pricing Management</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">
            Workspace Furniture Product Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Easily add, edit, or adjust rental rates for desks, chairs, monitors, and accessories.
            Changes persist automatically and sync instantly to the customer interactive simulator.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-glow transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={exportCatalogJson}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export catalog as JSON to commit to repository"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all catalog products back to original Monis defaults?')) {
                resetCatalog();
              }
            }}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300 text-xs transition"
            title="Reset to factory defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {importStatus && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Category Counters & Search Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, brand, or feature tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Items', count: products.length },
            { id: 'desks', label: 'Desks', count: products.filter(p => p.category === 'desks').length },
            { id: 'chairs', label: 'Chairs', count: products.filter(p => p.category === 'chairs').length },
            { id: 'monitors', label: 'Monitors', count: products.filter(p => p.category === 'monitors').length },
            { id: 'lighting', label: 'Lighting', count: products.filter(p => p.category === 'lighting').length },
            { id: 'accessories', label: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategoryFilter(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                selectedCategoryFilter === tab.id
                  ? 'bg-slate-200 text-black'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product List / Table */}
      <div className="bg-[#141721] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 font-mono text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Rental Pricing</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                            {p.brand}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.dimensions}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {p.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] bg-slate-900 text-slate-400 px-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="capitalize font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="text-emerald-400 font-bold">${p.weeklyPrice}/wk</div>
                    <div className="text-slate-400 text-[11px]">${p.monthlyPrice}/mo</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    ${p.deposit}
                  </td>

                  <td className="py-3 px-4">
                    {p.inStock ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <XCircle className="w-3 h-3" />
                        Out of Stock
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTestInStudio(p)}
                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition"
                        title="Equip and view immediately in Workspace Simulator"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Test in Studio</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Edit product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete product "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#161a25] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold font-display text-white mb-1">
              {editingProduct ? 'Edit Furniture Item' : 'Add New Furniture to Monis Catalog'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Specify pricing, photographic preview, and visual dimensions
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Steelcase Leap V2 Ergonomic Chair"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Brand / Line</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Steelcase, Herman Miller, Monis Pro"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <AppleSelect
                    value={category}
                    onChange={(val) => setCategory(val as ProductCategory)}
                    options={[
                      { value: 'desks', label: 'Standing Desks' },
                      { value: 'chairs', label: 'Ergonomic Chairs' },
                      { value: 'monitors', label: 'Displays & Arms' },
                      { value: 'lighting', label: 'Studio Lighting' },
                      { value: 'accessories', label: 'Accessories & Flora' },
                    ]}
                    className="w-full"
                    buttonClassName="bg-slate-900 border-slate-700 text-slate-100 py-2.5 rounded-xl hover:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dimensions / Spec</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 140 x 70 x 72-115 cm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Rental Rates & Deposit */}
              <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Weekly Rent ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={weeklyPrice}
                    onChange={(e) => setWeeklyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 font-medium mb-1">Monthly Rent ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deposit ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Product Photo: Upload or URL */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Product Photography (Studio Cutout or High-Res Photo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                {/* Thumbnail Preview */}
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <img src={imageUrl} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-slate-700" />
                    <span className="text-[11px] text-slate-400">Photo preview loaded</span>
                  </div>
                )}
              </div>

              {/* Visual Studio Variant Mapping */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3D/Visualizer Appearance Preset</span>
                </label>
                {category === 'desks' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Tabletop Material:</span>
                    {(['oak', 'bamboo', 'walnut', 'black'] as const).map(mat => (
                      <button
                        type="button"
                        key={mat}
                        onClick={() => setMaterialVariant(mat)}
                        className={`px-2.5 py-1 rounded-lg capitalize text-xs border ${
                          materialVariant === mat
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                )}
                {category === 'chairs' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Chair Silhouette:</span>
                    {(['aeron', 'gesture', 'executive', 'stool'] as const).map(chair => (
                      <button
                        type="button"
                        key={chair}
                        onClick={() => setChairVariant(chair)}
                        className={`px-2.5 py-1 rounded-lg capitalize text-xs border ${
                          chairVariant === chair
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {chair}
                      </button>
                    ))}
                  </div>
                )}
                {category === 'monitors' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Screen Layout:</span>
                    {(['single', 'dual', 'ultrawide'] as const).map(mon => (
                      <button
                        type="button"
                        key={mon}
                        onClick={() => setMonitorVariant(mon)}
                        className={`px-2.5 py-1 rounded-lg capitalize text-xs border ${
                          monitorVariant === mon
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {mon}
                      </button>
                    ))}
                  </div>
                )}
                {category === 'lighting' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Fixture Style:</span>
                    {(['screenbar', 'lamp'] as const).map(l => (
                      <button
                        type="button"
                        key={l}
                        onClick={() => setLightVariant(l)}
                        className={`px-2.5 py-1 rounded-lg capitalize text-xs border ${
                          lightVariant === l
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags & Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Feature Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Dual Motor, PostureFit, 4K UHD, Anti-Collision"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product highlights, ergonomics benefits, and rental inclusions..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="text-slate-200 cursor-pointer font-medium">
                  Available in Stock (Immediate Bali Delivery)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-glow"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
