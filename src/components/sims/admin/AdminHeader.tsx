import React from 'react';
import { Plus, Download, Upload, RotateCcw, ArrowLeft, Home } from 'lucide-react';

interface AdminHeaderProps {
  onAdd: () => void;
  onExport: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onBackToSims: () => void;
  onBackToShowcase?: () => void;
}

/** Title banner with global catalog actions (add, export/import, reset, navigation). */
export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onAdd,
  onExport,
  onImportFile,
  onReset,
  onBackToSims,
  onBackToShowcase,
}) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-mono uppercase bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-bold">
          MONIS.RENT CMS
        </span>
        <span className="text-xs text-slate-500 font-medium">Workspace Inventory Management</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        Furniture & Equipment Catalog
      </h1>
      <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
        Manage your fleet of standing desks, chairs, ultrawide monitors, and accessories.
        Upload real photos, attach 3D models (.glb), and create custom categories on the fly.
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onAdd}
        className="apple-press px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add New Item</span>
      </button>

      <button
        onClick={onExport}
        className="apple-press px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        title="Download full catalog JSON"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export JSON</span>
      </button>

      <label className="apple-press cursor-pointer px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs">
        <Upload className="w-3.5 h-3.5" />
        <span>Import JSON</span>
        <input type="file" accept=".json" onChange={onImportFile} className="hidden" />
      </label>

      <button
        onClick={onReset}
        className="apple-press p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs transition cursor-pointer"
        title="Reset to defaults"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {onBackToShowcase && (
        <button
          onClick={onBackToShowcase}
          className="apple-press px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Landing Page</span>
        </button>
      )}

      <button
        onClick={onBackToSims}
        className="apple-press px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to 3D Studio</span>
      </button>
    </div>
  </div>
);
