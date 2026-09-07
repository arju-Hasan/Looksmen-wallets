'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  User,
  CreditCard,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
} from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatBDT, formatTransactionDate } from '@/lib/formatters';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, name: string) => void;
  onViewImage: (imageUrl: string, title: string) => void;
}

export default function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onViewImage,
}: TransactionCardProps) {
  const isIncome = transaction.type === 'INCOME';

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 shadow-lg transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Section: Icon, Category, Badges, Notes */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Type Icon Badge */}
          <div
            className={`p-3 rounded-xl shrink-0 ${isIncome
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
          >
            {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Category & Type Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {transaction.category}
              </h4>

              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${isIncome
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
                  }`}
              >
                {transaction.type}
              </span>

              <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 font-medium">
                <CreditCard className="w-3 h-3 text-slate-500" />
                {transaction.paymentMethod}
              </span>
            </div>

            {/* Notes / description */}
            {transaction.notes && (
              <p className="text-xs text-slate-400 leading-relaxed break-words line-clamp-2 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{transaction.notes}</span>
              </p>
            )}

            {/* Metadata Footer: Date & Recorded By */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-0.5">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-600" />
                <span>{formatTransactionDate(transaction.date)}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 font-medium">
                <User className="w-3 h-3 text-emerald-500/70" />
                <span>Added by:</span>
                <span className="text-emerald-400 bg-emerald-950/30 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  {transaction.recordedBy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Amount, Thumbnail Preview, and Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          {/* Cloudinary Receipt Thumbnail */}
          {transaction.imageUrl ? (
            <div
              onClick={() =>
                onViewImage(
                  transaction.imageUrl!,
                  `${transaction.category} Receipt (${transaction.recordedBy})`
                )
              }
              className="relative group/img cursor-pointer shrink-0 w-12 h-12 rounded-md overflow-hidden border border-slate-700 bg-slate-950 hover:border-emerald-500 transition shadow-md"
              title="Click to view full receipt"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={transaction.imageUrl}
                alt="Receipt"
                className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition duration-200">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex w-12 h-12 rounded-md border border-dashed border-slate-800 bg-slate-950/40 items-center justify-center text-slate-700">
              <ImageIcon className="w-4 h-4" />
            </div>
          )}

          {/* Amount Display */}
          <div className="text-left sm:text-right">
            <span
              className={`text-lg sm:text-xl font-bold tracking-tight ${isIncome ? 'text-emerald-400' : 'text-rose-400'
                }`}
            >
              {formatBDT(transaction.amount, true)}
            </span>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Edit Transaction"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                onDelete(
                  transaction.id,
                  `${transaction.type === 'INCOME' ? 'Income' : 'Expense'}: ${transaction.category
                  } (${formatBDT(transaction.amount)})`
                )
              }
              className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
              title="Delete Transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
