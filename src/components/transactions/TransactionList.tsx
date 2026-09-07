'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';
import TransactionCard from './TransactionCard';
import { ReceiptText, PlusCircle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, name: string) => void;
  onViewImage: (imageUrl: string, title: string) => void;
  onOpenAddModal: () => void;
}

export default function TransactionList({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  onViewImage,
  onOpenAddModal,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((n) => (
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
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
        <div className="p-4 rounded-xl bg-slate-800/50 text-slate-500">
          <ReceiptText className="w-8 h-8" />
        </div>
        <h4 className="text-base font-semibold text-white">No transactions found</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          No records match your selected timeframe or filter criteria. Try changing the filter or record a new entry.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Transaction</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewImage={onViewImage}
        />
      ))}
    </div>
  );
}
