'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Filter,
  History,
  ArrowRight,
} from 'lucide-react';
import SummaryCards from '@/components/dashboard/SummaryCards';
import FilterBar from '@/components/dashboard/FilterBar';
import AnalyticsBreakdown from '@/components/dashboard/AnalyticsBreakdown';
import QuickActionButtons from '@/components/dashboard/QuickActionButtons';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionModal from '@/components/transactions/TransactionModal';
import ImageViewerModal from '@/components/transactions/ImageViewerModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ExportReportModal from '@/components/ui/ExportReportModal';
import Toast, { ToastMessage } from '@/components/ui/Toast';
import UserMenu from '@/components/auth/UserMenu';
import AuthGuard from '@/components/auth/AuthGuard';
import { TfiReload } from "react-icons/tfi";
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
import { format } from 'date-fns';

export default function DashboardPage() {
  // Filter state (defaults to 'month')
  const [filters, setFilters] = useState<TransactionFilters>({
    timeframe: 'month',
    type: 'ALL',
    category: 'ALL',
    recordedBy: 'ALL',
    search: '',
  });

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

  // Handle filter changes
  const handleFilterChange = (updated: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      timeframe: 'month',
      type: 'ALL',
      category: 'ALL',
      recordedBy: 'ALL',
      search: '',
      startDate: undefined,
      endDate: undefined,
    });
    addToast('info', 'Filters Reset', 'Showing all transactions for this month.');
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

  // Form submit handler (Add or Update)
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
        return 'This Month';
    }
  };

  const totalVolume = (stats?.totalIncome ?? 0) + (stats?.totalExpenses ?? 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 sm:pb-12">
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 border-b border-slate-800 backdrop-blur-xl px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-950/50">
                <img src="./0-logo.webp" alt="logo" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    Looksmen
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Finance Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Expense & Revenue Tracking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/transactions"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 rounded-md text-xs font-semibold transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{format(new Date(), 'EEEE, d MMM yyyy')}</span>
              </div>

              <div
                onClick={() => window.location.reload()}
                className="flex items-center gap-1 cursor-pointer p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                title="Reload page"
              >
                <TfiReload className="transition-transform duration-500 hover:rotate-180" />
              </div>

              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Top Summary Metrics */}
          <section>
            <SummaryCards stats={stats} isLoading={isLoadingStats} />
          </section>

          {/* Quick Actions & Export */}
          <section>
            <QuickActionButtons
              onOpenAddModal={handleOpenAdd}
              onOpenExportModal={() => setIsExportModalOpen(true)}
              onRefresh={handleRefresh}
              isRefreshing={isRefetchingTx}
            />
          </section>

          {/* Operational Analytics & Visual Breakdown */}
          <section>
            <AnalyticsBreakdown
              categoryBreakdown={stats?.categoryBreakdown || []}
              userBreakdown={stats?.userBreakdown || []}
              totalVolume={totalVolume}
              onFilterByCategory={(cat) => handleFilterChange({ category: cat })}
              onFilterByStaff={(staff) => handleFilterChange({ recordedBy: staff })}
            />
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

          {/* Recent Transactions Feed (Top 5) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Recent Transactions
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono font-medium">
                  {Math.min(5, transactions.length)} of {transactions.length}
                </span>
              </div>

              <Link
                href="/transactions"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 text-xs font-semibold transition cursor-pointer shadow-sm group"
              >
                <History className="w-3.5 h-3.5 group-hover:rotate-[-20deg] transition-transform" />
                <span>History</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <TransactionList
              transactions={transactions.slice(0, 5)}
              isLoading={isLoadingTx}
              onEdit={handleOpenEdit}
              onDelete={(id, name) => setDeleteTarget({ id, name })}
              onViewImage={(url, title) => setActiveImage({ url, title })}
              onOpenAddModal={() => handleOpenAdd('INCOME')}
            />

            {transactions.length > 5 && (
              <div className="pt-1 text-center">
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer shadow-lg hover:border-emerald-500/40 group"
                >
                  <span>View All {transactions.length} Transactions in History</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </section>
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
          requireConfirmationText="Delete"
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
