'use client';

import React from 'react';
import { PlusCircle, MinusCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { TransactionType } from '@/types/transaction';

interface QuickActionButtonsProps {
  onOpenAddModal: (type: TransactionType) => void;
  onOpenExportModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function QuickActionButtons({
  onOpenAddModal,
  onOpenExportModal,
  onRefresh,
  isRefreshing,
}: QuickActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Action buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          onClick={() => onOpenAddModal('INCOME')}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Income</span>
        </button>

        <button
          onClick={() => onOpenAddModal('EXPENSE')}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-950/50 transition cursor-pointer active:scale-95"
        >
          <MinusCircle className="w-4 h-4" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export / Report</span>
        </button>
      </div>
    </div>
  );
}
