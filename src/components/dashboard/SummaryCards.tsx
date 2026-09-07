'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { formatBDT } from '@/lib/formatters';
import { TransactionStats } from '@/types/transaction';

interface SummaryCardsProps {
  stats?: TransactionStats;
  isLoading?: boolean;
}

export default function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;
  const netBalance = stats?.netBalance ?? 0;
  const transactionCount = stats?.transactionCount ?? 0;

  const isProfitable = netBalance >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Net Balance / Profit-Loss Card */}
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${isProfitable
          ? 'from-teal-950/40 via-slate-900 to-slate-900/90 border-teal-500/20'
          : 'from-amber-950/40 via-slate-900 to-slate-900/90 border-amber-500/20'
          } border p-3.5 sm:p-5 shadow-lg backdrop-blur-md`}
      >
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate ${isProfitable ? 'text-teal-400' : 'text-amber-400'
              }`}
          >
            Net Balance
          </span>
          <div
            className={`p-1.5 sm:p-2.5 rounded-md border shrink-0 ${isProfitable
              ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
          >
            <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          {isLoading ? (
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3
              className={`text-base sm:text-2xl lg:text-3xl font-bold tracking-tight truncate ${isProfitable ? 'text-teal-400' : 'text-rose-400'
                }`}
            >
              {formatBDT(netBalance, true)}
            </h3>
          )}
        </div>

        <div className="mt-1.5 sm:mt-2.5 flex items-center text-[10px] sm:text-xs font-medium text-slate-400 truncate">
          <span
            className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 shrink-0 ${isProfitable ? 'bg-teal-400' : 'bg-rose-400'
              }`}
          />
          <span className="truncate">{isProfitable ? 'Positive Flow' : 'Deficit'}</span>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 border border-emerald-500/20 p-3.5 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-emerald-400 uppercase truncate">
            Total Revenue
          </span>
          <div className="p-1.5 sm:p-2.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          {isLoading ? (
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-base sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-baseline gap-1 truncate">
              {formatBDT(totalIncome)}
            </h3>
          )}
        </div>

        <div className="mt-1.5 sm:mt-2.5 flex items-center text-[10px] sm:text-xs text-emerald-400/90 font-medium truncate">
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
          <span className="truncate">{stats?.incomeCount ?? 0} entries</span>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900/90 border border-rose-500/20 p-3.5 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-rose-400 uppercase truncate">
            Total Expenses
          </span>
          <div className="p-1.5 sm:p-2.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          {isLoading ? (
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-base sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-baseline gap-1 truncate">
              {formatBDT(totalExpenses)}
            </h3>
          )}
        </div>

        <div className="mt-1.5 sm:mt-2.5 flex items-center text-[10px] sm:text-xs text-rose-400/90 font-medium truncate">
          <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 shrink-0" />
          <span className="truncate">{stats?.expenseCount ?? 0} entries</span>
        </div>
      </div>

      {/* Total Records / Activity Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-900/90 border border-indigo-500/20 p-3.5 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-indigo-400 uppercase truncate">
            Transactions
          </span>
          <div className="p-1.5 sm:p-2.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          {isLoading ? (
            <div className="h-6 sm:h-8 w-16 sm:w-24 bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-base sm:text-2xl lg:text-3xl font-bold tracking-tight text-white truncate">
              {transactionCount}
            </h3>
          )}
        </div>

        <div className="mt-1.5 sm:mt-2.5 flex items-center text-[10px] sm:text-xs text-indigo-300 font-medium truncate">
          <span className="truncate">Total operations</span>
        </div>
      </div>
    </div>
  );
}
