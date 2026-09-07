import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction, TransactionFilters, TransactionInput, TransactionStats } from '@/types/transaction';

function buildQueryString(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  if (filters.timeframe) params.append('timeframe', filters.timeframe);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
  if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
  if (filters.recordedBy && filters.recordedBy !== 'ALL') params.append('recordedBy', filters.recordedBy);
  if (filters.search) params.append('search', filters.search);
  return params.toString();
}

export function useTransactions(filters: TransactionFilters) {
  const queryString = buildQueryString(filters);

  return useQuery<{ success: boolean; data: Transaction[] }>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?${queryString}`);
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return res.json();
    },
  });
}

export function useTransactionStats(filters: TransactionFilters) {
  const queryString = buildQueryString(filters);

  return useQuery<{ success: boolean; data: TransactionStats }>({
    queryKey: ['transaction-stats', filters],
    queryFn: async () => {
      const res = await fetch(`/api/stats?${queryString}`);
      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }
      return res.json();
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTx: TransactionInput) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create transaction');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionInput> }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update transaction');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete transaction');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (fileOrBase64: { file?: File; base64?: string }) => {
      const formData = new FormData();
      if (fileOrBase64.file) {
        formData.append('file', fileOrBase64.file);
      }
      if (fileOrBase64.base64) {
        formData.append('base64', fileOrBase64.base64);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload image');
      }
      return res.json() as Promise<{ success: boolean; imageUrl: string }>;
    },
  });
}
