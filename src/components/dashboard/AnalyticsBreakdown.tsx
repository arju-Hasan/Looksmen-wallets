'use client';

import React, { useState } from 'react';
import { PieChart, Users, Tag, ChevronRight, BarChart3 } from 'lucide-react';
import { formatBDT } from '@/lib/formatters';
import { CategoryBreakdown, UserBreakdown } from '@/types/transaction';

interface AnalyticsBreakdownProps {
  categoryBreakdown: CategoryBreakdown[];
  userBreakdown: UserBreakdown[];
  totalVolume: number;
  onFilterByCategory?: (category: string) => void;
  onFilterByStaff?: (staff: string) => void;
}

export default function AnalyticsBreakdown({
  categoryBreakdown,
  userBreakdown,
  totalVolume,
  onFilterByCategory,
  onFilterByStaff,
}: AnalyticsBreakdownProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'staff'>('category');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-start lg:items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Operational Breakdown
          </h3>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${activeTab === 'category'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Tag className="w-3 h-3" />
            <span>By Category</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${activeTab === 'staff'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Users className="w-3 h-3" />
            <span>By Staff (Recorded By)</span>
          </button>
        </div>
      </div>

      {activeTab === 'category' ? (
        <div className="space-y-3">
          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No category data recorded for this timeframe.
            </p>
          ) : (
            categoryBreakdown.map((item) => {
              const isIncome = item.type === 'INCOME';
              const percent =
                totalVolume > 0 ? Math.min(100, Math.round((item.total / totalVolume) * 100)) : 0;

              return (
                <div
                  key={`${item.type}-${item.category}`}
                  onClick={() => onFilterByCategory?.(item.category)}
                  className="group p-2.5 rounded-md hover:bg-slate-800/50 transition cursor-pointer border border-transparent hover:border-slate-700/50"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                      />
                      <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                        {item.category}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.count} {item.count === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                      >
                        {formatBDT(item.total)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">({percent}%)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isIncome
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                        : 'bg-gradient-to-r from-rose-600 to-amber-500'
                        }`}
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 col-span-2">
              No staff activity recorded for this timeframe.
            </p>
          ) : (
            userBreakdown.map((user) => (
              <div
                key={user.recordedBy}
                onClick={() => onFilterByStaff?.(user.recordedBy)}
                className="p-3.5 rounded-md bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-800/40 transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                      {user.recordedBy.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">
                        {user.recordedBy}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {user.transactionCount} entries recorded
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Income Added</span>
                    <span className="font-semibold text-emerald-400">
                      {formatBDT(user.totalIncome)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Expense Added</span>
                    <span className="font-semibold text-rose-400">
                      {formatBDT(user.totalExpense)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
