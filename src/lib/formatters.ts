import { format, parseISO, isToday, isYesterday } from 'date-fns';

/**
 * Format a number into Bangladeshi Taka (BDT ৳) with proper grouping
 * e.g., 25000 -> ৳ 25,000 or ৳ 25,000.50
 */
export function formatBDT(amount: number, showSign: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '৳0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with commas in South Asian style or standard international
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  if (showSign) {
    if (amount > 0) {
      return `+৳${formatted}`;
    } else if (amount < 0) {
      return `-৳${formatted}`;
    }
  }

  return isNegative ? `-৳${formatted}` : `৳${formatted}`;
}

/**
 * Format date nicely for transaction cards and tables
 */
export function formatTransactionDate(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy · h:mm a');
  } catch {
    return String(dateStr);
  }
}

/**
 * Format short date (e.g., Aug 24)
 */
export function formatShortDate(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, 'MMM d, yyyy');
  } catch {
    return String(dateStr);
  }
}
