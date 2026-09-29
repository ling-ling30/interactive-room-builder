import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PAGE_SIZES } from './useCatalogTable';

interface AdminTablePaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  filteredCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Numbered pages with ellipses: always first, last, current and its neighbours. */
function pageWindow(page: number, pageCount: number): (number | 'gap-start' | 'gap-end')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach(p => pages.add(p));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach(p => pages.add(p));
  const sorted = [...pages].filter(p => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | 'gap-start' | 'gap-end')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(i === 1 ? 'gap-start' : 'gap-end');
    out.push(p);
  });
  return out;
}

const NAV_BUTTON =
  'apple-press w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer';

/** Table footer: result range, rows-per-page and page navigation. */
export const AdminTablePagination: React.FC<AdminTablePaginationProps> = ({
  page,
  pageCount,
  pageSize,
  filteredCount,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const from = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredCount);

  return (
    <nav
      aria-label="Catalog pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-600"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono tabular-nums">
          <strong className="text-slate-900">{from}–{to}</strong> of {filteredCount}
          {filteredCount !== totalCount && <span className="text-slate-400"> (filtered from {totalCount})</span>}
        </span>
        <label className="flex items-center gap-1.5">
          <span className="hidden sm:inline text-slate-500">Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
            aria-label="Rows per page"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-0.5">
        <button className={NAV_BUTTON} onClick={() => onPageChange(1)} disabled={page <= 1} aria-label="First page">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button className={NAV_BUTTON} onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageWindow(page, pageCount).map((entry) =>
          typeof entry === 'string' ? (
            <span key={entry} className="w-6 text-center text-slate-400" aria-hidden="true">…</span>
          ) : (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              className={`apple-press min-w-8 h-8 px-2 rounded-lg font-mono font-semibold tabular-nums transition cursor-pointer ${
                entry === page ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {entry}
            </button>
          )
        )}

        <button className={NAV_BUTTON} onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className={NAV_BUTTON} onClick={() => onPageChange(pageCount)} disabled={page >= pageCount} aria-label="Last page">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
