import { subDays } from 'date-fns';
import { Transaction } from '@/types/transaction';

// Global shared in-memory store across Next.js API routes
const globalForStore = globalThis as unknown as {
  mockTransactions: Transaction[] | undefined;
};

const initialMockTransactions: Transaction[] = [
  {
    id: 'demo-1',
    type: 'INCOME',
    category: 'Shop Sales',
    amount: 14500,
    paymentMethod: 'Cash',
    recordedBy: 'Rahim (Manager)',
    notes: 'Friday evening showroom walk-in customers',
    imageUrl: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    type: 'INCOME',
    category: 'Online Sales',
    amount: 32800,
    paymentMethod: 'bKash/Nagad',
    recordedBy: 'Tanvir',
    notes: 'Website orders batch 102 - 14 orders delivered',
    imageUrl: undefined,
    date: subDays(new Date(), 1).toISOString(),
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'demo-3',
    type: 'EXPENSE',
    category: 'Product Sourcing',
    amount: 22000,
    paymentMethod: 'Bank Transfer',
    recordedBy: 'Owner',
    notes: 'Premium cotton fabric lot #884 from supplier',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    date: subDays(new Date(), 2).toISOString(),
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'demo-4',
    type: 'EXPENSE',
    category: 'Dollar / Ads & Marketing',
    amount: 8500,
    paymentMethod: 'Bank Transfer',
    recordedBy: 'Tanvir',
    notes: 'Meta Ads campaign $70 for summer collection',
    imageUrl: undefined,
    date: subDays(new Date(), 3).toISOString(),
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
  },
  {
    id: 'demo-5',
    type: 'EXPENSE',
    category: 'Courier / Delivery',
    amount: 3200,
    paymentMethod: 'Cash',
    recordedBy: 'Rahim (Manager)',
    notes: 'Steadfast & Pathao courier delivery charge settlement',
    imageUrl: undefined,
    date: subDays(new Date(), 4).toISOString(),
    createdAt: subDays(new Date(), 4).toISOString(),
    updatedAt: subDays(new Date(), 4).toISOString(),
  },
];

if (!globalForStore.mockTransactions) {
  globalForStore.mockTransactions = [...initialMockTransactions];
}

export function getMockTransactions(): Transaction[] {
  if (!globalForStore.mockTransactions) {
    globalForStore.mockTransactions = [...initialMockTransactions];
  }
  return globalForStore.mockTransactions;
}

export function addMockTransaction(tx: Transaction): Transaction {
  const list = getMockTransactions();
  list.unshift(tx);
  return tx;
}

export function updateMockTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const list = getMockTransactions();
  const index = list.findIndex((t) => t.id === id);
  if (index === -1) {
    // If not found in mock store, create and add it
    const created: Transaction = {
      id,
      type: updates.type || 'INCOME',
      category: updates.category || 'General',
      amount: updates.amount ?? 0,
      paymentMethod: updates.paymentMethod || 'Cash',
      recordedBy: updates.recordedBy || 'Admin',
      notes: updates.notes,
      imageUrl: updates.imageUrl,
      date: updates.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(created);
    return created;
  }
  
  list[index] = {
    ...list[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return list[index];
}

export function deleteMockTransaction(id: string): boolean {
  const list = getMockTransactions();
  const index = list.findIndex((t) => t.id === id);
  if (index !== -1) {
    list.splice(index, 1);
    return true;
  }
  return false;
}
