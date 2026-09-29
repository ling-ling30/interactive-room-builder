import React from 'react';
import { Trash2, Edit3, Box, Copy, Eye } from 'lucide-react';
import type { SimsProduct } from '../../../data/simsCatalog';
import { sounds } from '../../../utils/soundEffects';

interface AdminCatalogTableProps {
  items: SimsProduct[];
  onInspect: (item: SimsProduct) => void;
  onDuplicate: (item: SimsProduct) => void;
  onEdit: (item: SimsProduct) => void;
  onDelete: (item: SimsProduct) => void;
}

export const AdminCatalogTable: React.FC<AdminCatalogTableProps> = ({
  items,
  onInspect,
  onDuplicate,
  onEdit,
  onDelete,
}) => {
  const inspect = (item: SimsProduct) => {
    sounds.playClick();
    onInspect(item);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-mono uppercase text-slate-500 font-bold tracking-wider">
              <th className="py-3 px-4">Product & Visual</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Footprint & 3D</th>
              <th className="py-3 px-4">Rates (Wk / Mo)</th>
              <th className="py-3 px-4">Deposit</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                  No equipment found matching your criteria. Try adjusting your search or add a new item.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                  {/* Visual & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => inspect(item)}
                        className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer hover:border-cyan-500 hover:shadow-sm transition group/thumb"
                        title="Click to inspect 3D Model"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain p-1 transition-transform group-hover/thumb:scale-105"
                            onError={(e) => {
                              // Fallback to emoji if broken link
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xl transition-transform group-hover/thumb:scale-110">{item.icon}</span>
                        )}
                        {item.modelUrl && (
                          <span
                            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white"
                            title="Custom 3D Model attached"
                          />
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span
                            onClick={() => inspect(item)}
                            className="hover:text-cyan-700 hover:underline cursor-pointer"
                            title="Inspect in 3D"
                          >
                            {item.name}
                          </span>
                          {item.modelUrl ? (
                            <button
                              type="button"
                              onClick={() => inspect(item)}
                              className="text-[9px] px-1.5 py-0.2 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-mono font-bold cursor-pointer transition flex items-center gap-0.5"
                              title="Inspect attached 3D Model"
                            >
                              <Box className="w-2.5 h-2.5 text-cyan-600" />
                              <span>3D</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => inspect(item)}
                              className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-medium cursor-pointer transition"
                              title="Inspect procedural 3D model"
                            >
                              3D
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          {item.brand} · {item.material || item.description || 'Ergonomic equipment'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                      {item.category}
                    </span>
                  </td>

                  {/* Footprint & 3D */}
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-900 font-bold">
                      {item.footprint.width} × {item.footprint.depth} tiles
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.actualDimensions
                        ? `${(item.actualDimensions.widthM * 100).toFixed(0)}×${(item.actualDimensions.depthM * 100).toFixed(0)} cm`
                        : `${item.footprint.width}m × ${item.footprint.depth}m`}
                      {item.layer === 'surface' && ' · Desk Top'}
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="py-3 px-4">
                    <div className="font-mono text-emerald-700 font-bold">
                      ${item.monthlyRent} <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      ${item.weeklyRent} /wk
                    </div>
                  </td>

                  {/* Deposit */}
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    ${item.deposit}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => inspect(item)}
                        className="apple-press p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition cursor-pointer"
                        title="Preview 3D Model Studio"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(item)}
                        className="apple-press p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        title="Duplicate item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="apple-press p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        title="Edit item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="apple-press p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
