'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  variant?: 'top' | 'bottom' | 'full';
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  variant = 'full',
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  // Top Bar: Left = Per page dropdown, Right = Showing
  if (variant === 'top') {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
        {/* Left Side: Only Per Page Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Per page:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="appearance-none bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-emerald-500 cursor-pointer transition shadow-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Showing info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Showing</span>
          <span className="font-semibold text-white font-mono">
            {startItem}–{endItem}
          </span>
          <span>of</span>
          <span className="font-semibold text-white font-mono">{totalItems}</span>
          <span className="hidden sm:inline">transactions</span>
        </div>
      </div>
    );
  }

  // Bottom Bar: Page numbers and Prev/Next at the end of the page
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
      {/* Left info summary */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <span>Page</span>
        <span className="font-semibold text-white font-mono">{currentPage}</span>
        <span>of</span>
        <span className="font-semibold text-white font-mono">{totalPages}</span>
        <span className="text-slate-500">
          ({startItem}–{endItem} of {totalItems})
        </span>
      </div>

      {/* Right / Center: Page numbers, Prev / Next */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-600 font-mono">
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold font-mono transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-500/30'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-950/60 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
