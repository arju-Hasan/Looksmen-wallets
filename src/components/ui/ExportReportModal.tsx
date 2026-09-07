'use client';

import React from 'react';
import { X, Download, Printer, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Transaction, TransactionStats } from '@/types/transaction';
import { formatBDT, formatTransactionDate } from '@/lib/formatters';

interface ExportReportModalProps {
  isOpen: boolean;
  transactions: Transaction[];
  stats?: TransactionStats;
  timeframeDescription: string;
  onClose: () => void;
}

export default function ExportReportModal({
  isOpen,
  transactions,
  stats,
  timeframeDescription,
  onClose,
}: ExportReportModalProps) {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Type',
      'Category',
      'Amount (BDT)',
      'Payment Method',
      'Recorded By',
      'Notes',
      'Image URL',
    ];

    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${formatTransactionDate(t.date)}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${t.recordedBy}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${t.imageUrl || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Looksmen_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Looksmen Report</h3>
              <p className="text-xs text-slate-400">Financial statements & transaction log</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Summary */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-md p-4 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Timeframe:</span>
            <span className="text-white font-medium">{timeframeDescription}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Transactions:</span>
            <span className="text-white font-medium">{transactions.length} records</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Revenue / Income:</span>
            <span className="text-emerald-400 font-bold">
              {formatBDT(stats?.totalIncome ?? 0)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Expenses:</span>
            <span className="text-rose-400 font-bold">
              {formatBDT(stats?.totalExpenses ?? 0)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
            <span className="text-slate-300">Net Profit / Balance:</span>
            <span
              className={
                (stats?.netBalance ?? 0) >= 0 ? 'text-teal-400' : 'text-rose-400'
              }
            >
              {formatBDT(stats?.netBalance ?? 0, true)}
            </span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
