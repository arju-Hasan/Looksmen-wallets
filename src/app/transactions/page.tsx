'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  History,
  Layers,
  Plus,
  Minus,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  ReceiptText,
} from 'lucide-react';
import FilterBar from '@/components/dashboard/FilterBar';
import TransactionCard from '@/components/transactions/TransactionCard';
import Pagination from '@/components/transactions/Pagination';
import TransactionModal from '@/components/transactions/TransactionModal';
import ImageViewerModal from '@/components/transactions/ImageViewerModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ExportReportModal from '@/components/ui/ExportReportModal';
import Toast, { ToastMessage } from '@/components/ui/Toast';
import UserMenu from '@/components/auth/UserMenu';
import AuthGuard from '@/components/auth/AuthGuard';
import { TfiReload } from 'react-icons/tfi';
import {
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionType,
} from '@/types/transaction';
import {
  useTransactions,
  useTransactionStats,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions';
import { formatBDT } from '@/lib/formatters';
import { format } from 'date-fns';

export default function AllTransactionsPage() {
  // Filter state (defaults to 'all' or 'month' - let's default to 'all' so users see all transactions on the history page unless filtered)
  const [filters, setFilters] = useState<TransactionFilters>({
    timeframe: 'all',
    type: 'ALL',
    category: 'ALL',
    recordedBy: 'ALL',
    search: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [modalTxType, setModalTxType] = useState<TransactionType>('INCOME');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Image Viewer modal state
  const [activeImage, setActiveImage] = useState<{ url: string; title: string } | null>(null);

  // Delete Confirm modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Export Report modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Queries & Mutations
  const {
    data: transactionsData,
    isLoading: isLoadingTx,
    isRefetching: isRefetchingTx,
    refetch: refetchTx,
  } = useTransactions(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useTransactionStats(filters);

  const createTxMutation = useCreateTransaction();
  const updateTxMutation = useUpdateTransaction();
  const deleteTxMutation = useDeleteTransaction();

  const transactions = transactionsData?.data || [];
  const stats = statsData?.data;
  const staffUsers = stats?.recentRecordedByUsers || ['Owner', 'Tanvir', 'Rahim (Manager)'];

  // Calculate filtered totals for the summary strip
  const { filteredIncome, filteredExpense, filteredNet } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') inc += Number(tx.amount || 0);
      else if (tx.type === 'EXPENSE') exp += Number(tx.amount || 0);
    });
    return {
      filteredIncome: inc,
      filteredExpense: exp,
      filteredNet: inc - exp,
    };
  }, [transactions]);

  // Handle filter changes (resets pagination to page 1)
  const handleFilterChange = (updated: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      timeframe: 'all',
      type: 'ALL',
      category: 'ALL',
      recordedBy: 'ALL',
      search: '',
      startDate: undefined,
      endDate: undefined,
    });
    setCurrentPage(1);
    addToast('info', 'Filters Reset', 'Showing all transactions.');
  };

  const handleRefresh = async () => {
    await Promise.all([refetchTx(), refetchStats()]);
    addToast('success', 'Data Refreshed', 'Latest financial logs loaded.');
  };

  // Open modal for add
  const handleOpenAdd = (type: TransactionType) => {
    setEditingTransaction(null);
    setModalTxType(type);
    setIsTxModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalTxType(tx.type);
    setIsTxModalOpen(true);
  };

  // Form submit handler
  const handleSaveTransaction = async (data: TransactionInput, editingId?: string) => {
    if (editingId) {
      await updateTxMutation.mutateAsync({ id: editingId, data });
      addToast('success', 'Transaction Updated', `${data.category} record was updated.`);
    } else {
      await createTxMutation.mutateAsync(data);
      addToast(
        'success',
        `${data.type === 'INCOME' ? 'Income' : 'Expense'} Recorded`,
        `Successfully logged ${data.category} entry.`
      );
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTxMutation.mutateAsync(deleteTarget.id);
      addToast('success', 'Transaction Deleted', 'Entry has been removed.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Could not delete entry.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Calculate paginated slice
  const totalItems = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return transactions.slice(startIndex, startIndex + pageSize);
  }, [transactions, validCurrentPage, pageSize]);

  // Timeframe text description for export
  const getTimeframeLabel = () => {
    switch (filters.timeframe) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days (This Week)';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      case 'custom':
        return `Custom Range (${filters.startDate || 'start'} to ${filters.endDate || 'end'})`;
      case 'all':
        return 'All Time';
      default:
        return 'All Time';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 sm:pb-12">
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 border-b border-slate-800 backdrop-blur-xl px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="w-px h-6 bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg  flex items-center justify-centers">
                  <img src="/0-logo.webp" alt="logo" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase flex items-center gap-2">
                    All Transactions
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {totalItems}
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{format(new Date(), 'EEEE, d MMM yyyy')}</span>
              </div>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export</span>
              </button>

              <div
                onClick={handleRefresh}
                className="flex items-center gap-1 cursor-pointer p-2 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                title="Refresh Data"
              >
                <TfiReload className={`w-3.5 h-3.5 transition-transform duration-500 hover:rotate-180 ${isRefetchingTx ? 'animate-spin text-emerald-400' : ''}`} />
              </div>

              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Quick Stat Summary Strip */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Filtered Income</p>
                <p className="text-sm sm:text-base font-bold text-emerald-400 tracking-tight">
                  {formatBDT(filteredIncome)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Filtered Expense</p>
                <p className="text-sm sm:text-base font-bold text-rose-400 tracking-tight">
                  {formatBDT(filteredExpense)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${filteredNet >= 0 ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Net Flow</p>
                <p className={`text-sm sm:text-base font-bold tracking-tight ${filteredNet >= 0 ? 'text-teal-400' : 'text-amber-400'}`}>
                  {formatBDT(filteredNet, true)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Total Entries</p>
                  <p className="text-sm sm:text-base font-bold text-white font-mono">
                    {totalItems}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenAdd('INCOME')}
                  className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                  title="Add Income"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenAdd('EXPENSE')}
                  className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                  title="Add Expense"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Filter Controls */}
          <section>
            <FilterBar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              staffUsers={staffUsers}
            />
          </section>

          {/* Top Pagination Control Bar */}
          {totalItems > 0 && (
            <section>
              <Pagination
                variant="top"
                currentPage={validCurrentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
                pageSizeOptions={[25, 50, 100]}
              />
            </section>
          )}

          {/* Paginated Transactions List */}
          <section className="space-y-3">
            {isLoadingTx ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-md" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-800 rounded" />
                        <div className="h-3 w-48 bg-slate-800/60 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : totalItems === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-4 rounded-xl bg-slate-800/50 text-slate-500">
                  <ReceiptText className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-white">No transactions found</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  No records match your selected timeframe or filter criteria. Try adjusting the filter or record a new entry.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-3.5 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => handleOpenAdd('INCOME')}
                    className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition cursor-pointer"
                  >
                    + Add Income
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedTransactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onEdit={handleOpenEdit}
                    onDelete={(id, name) => setDeleteTarget({ id, name })}
                    onViewImage={(url, title) => setActiveImage({ url, title })}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Bottom Pagination Bar */}
          {totalItems > pageSize && (
            <section>
              <Pagination
                variant="bottom"
                currentPage={validCurrentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPageSizeChange={(size) => setPageSize(size)}
                pageSizeOptions={[25, 50, 100]}
              />
            </section>
          )}
        </main>

        {/* Mobile Sticky Quick Action Bar */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl p-3 flex items-center gap-2.5 shadow-2xl">
          <button
            onClick={() => handleOpenAdd('INCOME')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-950 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => handleOpenAdd('EXPENSE')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-md bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-lg shadow-rose-950 active:scale-95 transition"
          >
            <Minus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Modals */}
        <TransactionModal
          isOpen={isTxModalOpen}
          initialType={modalTxType}
          editingTransaction={editingTransaction}
          staffUsers={staffUsers}
          onClose={() => setIsTxModalOpen(false)}
          onSubmit={handleSaveTransaction}
        />

        <ImageViewerModal
          isOpen={Boolean(activeImage)}
          imageUrl={activeImage?.url || null}
          title={activeImage?.title}
          onClose={() => setActiveImage(null)}
        />

        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Transaction"
          message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />

        <ExportReportModal
          isOpen={isExportModalOpen}
          transactions={transactions}
          stats={stats}
          timeframeDescription={getTimeframeLabel()}
          onClose={() => setIsExportModalOpen(false)}
        />

        {/* Toast notifications */}
        <Toast toasts={toasts} onDismiss={removeToast} />
      </div>
    </AuthGuard>
  );
}
