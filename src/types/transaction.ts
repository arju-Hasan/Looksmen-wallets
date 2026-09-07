export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 'Cash' | 'bKash/Nagad' | 'Bank Transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  notes?: string | null;
  imageUrl?: string | null;
  date: string; // ISO string for frontend
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  notes?: string;
  imageUrl?: string;
  date: string;
}

export type TimeframeFilter = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

export interface TransactionFilters {
  timeframe?: TimeframeFilter;
  startDate?: string;
  endDate?: string;
  type?: 'ALL' | 'INCOME' | 'EXPENSE';
  category?: string;
  recordedBy?: string;
  search?: string;
}

export interface CategoryBreakdown {
  category: string;
  type: TransactionType;
  total: number;
  count: number;
  percentage: number;
}

export interface UserBreakdown {
  recordedBy: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  categoryBreakdown: CategoryBreakdown[];
  userBreakdown: UserBreakdown[];
  recentRecordedByUsers: string[];
}

export const INCOME_CATEGORIES = [
  'Online Sales',
  'Shop Sales',
  'Wholesale / Bulk Order',
  'Exchange / Refund',
  'Investment / Capital',
  'Other Income',
] as const;

export const EXPENSE_CATEGORIES = [
  'Product Sourcing',
  'Courier / Delivery',
  'Dollar / Ads & Marketing',
  'Packaging Material',
  'Shop Rent & Maintenance',
  'Staff Salary & Bonus',
  'Utilities & Bills',
  'Office Supplies & Snacks',
  'Taxes / Bank Fees',
  'Other Expense',
] as const;

export const ALL_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'bKash/Nagad',
  'Bank Transfer',
];
