'use client';

import React from 'react';
import {
  Calendar,
  Filter,
  UserCheck,
  Search,
  RotateCcw,
  Tag,
  ChevronDown,
} from 'lucide-react';
import {
  TimeframeFilter,
  TransactionFilters,
  ALL_CATEGORIES,
} from '@/types/transaction';

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (updated: Partial<TransactionFilters>) => void;
  onReset: () => void;
  staffUsers: string[];
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  staffUsers,
}: FilterBarProps) {
  const timeframeOptions: { label: string; value: TimeframeFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom Range', value: 'custom' },
    { label: 'All Time', value: 'all' },
  ];

  const hasActiveFilters =
    (filters.timeframe && filters.timeframe !== 'month') ||
    (filters.type && filters.type !== 'ALL') ||
    (filters.category && filters.category !== 'ALL') ||
    (filters.recordedBy && filters.recordedBy !== 'ALL') ||
    (filters.search && filters.search.trim() !== '') ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
      {/* Top row: Timeframe tabs & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Timeframe pill tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-md overflow-x-auto no-scrollbar scroll-smooth">
          {timeframeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ timeframe: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${filters.timeframe === opt.value
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, category, staff..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Custom Date Range Picker (shown when 'custom' is selected) */}
      {filters.timeframe === 'custom' && (
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-md flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Select Date Range:</span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Bottom Dropdowns Row: Type, Category, Recorded By, Reset */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Type Filter */}
        <div className="relative">
          <select
            value={filters.type || 'ALL'}
            onChange={(e) => onChange({ type: e.target.value as any })}
            className="w-full appearance-none bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Types (Income & Expense)</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={filters.category || 'ALL'}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full appearance-none bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Recorded By (Staff / Operator) Filter */}
        <div className="relative">
          <select
            value={filters.recordedBy || 'ALL'}
            onChange={(e) => onChange({ recordedBy: e.target.value })}
            className="w-full appearance-none bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Staff (Recorded By)</option>
            {staffUsers.map((user) => (
              <option key={user} value={user}>
                Recorded by: {user}
              </option>
            ))}
          </select>
          <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Reset Filters button */}
        <button
          onClick={onReset}
          disabled={!hasActiveFilters}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition cursor-pointer ${hasActiveFilters
            ? 'bg-slate-800/80 hover:bg-slate-800 text-amber-300 border-amber-500/30'
            : 'bg-slate-950/30 text-slate-600 border-slate-800/50 cursor-not-allowed'
            }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
