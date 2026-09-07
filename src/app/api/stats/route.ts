import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import { CategoryBreakdown, UserBreakdown, TransactionStats } from '@/types/transaction';
import { getMockTransactions } from '@/lib/mockStore';

function buildDateFilter(timeframe?: string, startDateStr?: string, endDateStr?: string) {
  const now = new Date();
  
  if (timeframe === 'today') {
    return {
      gte: startOfDay(now),
      lte: endOfDay(now),
    };
  } else if (timeframe === 'week') {
    return {
      gte: startOfDay(subDays(now, 7)),
      lte: endOfDay(now),
    };
  } else if (timeframe === 'month') {
    return {
      gte: startOfMonth(now),
      lte: endOfMonth(now),
    };
  } else if (timeframe === 'year') {
    return {
      gte: startOfYear(now),
      lte: endOfYear(now),
    };
  } else if (timeframe === 'custom' && (startDateStr || endDateStr)) {
    const filter: { gte?: Date; lte?: Date } = {};
    if (startDateStr) {
      filter.gte = startOfDay(parseISO(startDateStr));
    }
    if (endDateStr) {
      filter.lte = endOfDay(parseISO(endDateStr));
    }
    return filter;
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || 'month';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const type = searchParams.get('type') || 'ALL';
  const category = searchParams.get('category') || undefined;
  const recordedBy = searchParams.get('recordedBy') || undefined;
  const search = searchParams.get('search') || undefined;

  const dateFilter = buildDateFilter(timeframe, startDate, endDate);

  try {
    const where: any = {};

    if (dateFilter) {
      where.date = dateFilter;
    }
    if (type && type !== 'ALL') {
      where.type = type;
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (recordedBy && recordedBy !== 'ALL') {
      where.recordedBy = {
        equals: recordedBy,
        mode: 'insensitive',
      };
    }
    if (search && search.trim() !== '') {
      where.OR = [
        { notes: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { recordedBy: { contains: search, mode: 'insensitive' } },
        { paymentMethod: { contains: search, mode: 'insensitive' } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const categoryMap = new Map<string, { type: 'INCOME' | 'EXPENSE'; total: number; count: number }>();
    const userMap = new Map<string, { totalIncome: number; totalExpense: number; count: number }>();

    for (const t of transactions) {
      const amt = Number(t.amount) || 0;
      if (t.type === 'INCOME') {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpenses += amt;
        expenseCount++;
      }

      // Category breakdown
      const catKey = t.category || 'Other';
      const existingCat = categoryMap.get(catKey) || {
        type: t.type as 'INCOME' | 'EXPENSE',
        total: 0,
        count: 0,
      };
      existingCat.total += amt;
      existingCat.count += 1;
      categoryMap.set(catKey, existingCat);

      // User breakdown
      const userKey = t.recordedBy || 'Unknown';
      const existingUser = userMap.get(userKey) || {
        totalIncome: 0,
        totalExpense: 0,
        count: 0,
      };
      if (t.type === 'INCOME') {
        existingUser.totalIncome += amt;
      } else {
        existingUser.totalExpense += amt;
      }
      existingUser.count += 1;
      userMap.set(userKey, existingUser);
    }

    const totalVolume = totalIncome + totalExpenses;

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([cat, data]) => ({
        category: cat,
        type: data.type,
        total: data.total,
        count: data.count,
        percentage: totalVolume > 0 ? Math.round((data.total / totalVolume) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const userBreakdown: UserBreakdown[] = Array.from(userMap.entries())
      .map(([user, data]) => ({
        recordedBy: user,
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        netBalance: data.totalIncome - data.totalExpense,
        transactionCount: data.count,
      }))
      .sort((a, b) => (b.totalIncome + b.totalExpense) - (a.totalIncome + a.totalExpense));

    // Get all distinct recordedBy operators for autocomplete/filter
    const allUsers = await prisma.transaction.findMany({
      select: { recordedBy: true },
      distinct: ['recordedBy'],
    });

    const recentRecordedByUsers = Array.from(
      new Set(allUsers.map((u) => u.recordedBy).filter(Boolean))
    );

    const stats: TransactionStats = {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      incomeCount,
      expenseCount,
      categoryBreakdown,
      userBreakdown,
      recentRecordedByUsers,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.warn('[Stats API] DB query fallback to dynamic calculation:', error?.message);

    const mockList = getMockTransactions();
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const categoryMap = new Map<string, { type: 'INCOME' | 'EXPENSE'; total: number; count: number }>();
    const userMap = new Map<string, { totalIncome: number; totalExpense: number; count: number }>();

    for (const t of mockList) {
      const amt = Number(t.amount) || 0;
      if (t.type === 'INCOME') {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpenses += amt;
        expenseCount++;
      }

      // Aggregate Category
      const catKey = `${t.category}__${t.type}`;
      const existingCat = categoryMap.get(catKey) || {
        type: t.type as 'INCOME' | 'EXPENSE',
        total: 0,
        count: 0,
      };
      existingCat.total += amt;
      existingCat.count += 1;
      categoryMap.set(catKey, existingCat);

      // Aggregate User
      const userKey = t.recordedBy || 'Unknown';
      const existingUser = userMap.get(userKey) || {
        totalIncome: 0,
        totalExpense: 0,
        count: 0,
      };
      if (t.type === 'INCOME') {
        existingUser.totalIncome += amt;
      } else {
        existingUser.totalExpense += amt;
      }
      existingUser.count += 1;
      userMap.set(userKey, existingUser);
    }

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([key, data]) => {
        const [category] = key.split('__');
        const denominator = data.type === 'INCOME' ? (totalIncome || 1) : (totalExpenses || 1);
        return {
          category,
          type: data.type,
          total: data.total,
          count: data.count,
          percentage: Math.round((data.total / denominator) * 100) || 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    const userBreakdown: UserBreakdown[] = Array.from(userMap.entries())
      .map(([user, data]) => ({
        recordedBy: user,
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        netBalance: data.totalIncome - data.totalExpense,
        transactionCount: data.count,
      }))
      .sort((a, b) => (b.totalIncome + b.totalExpense) - (a.totalIncome + a.totalExpense));

    const recentRecordedByUsers = Array.from(
      new Set(mockList.map((u) => u.recordedBy).filter(Boolean))
    );

    const stats: TransactionStats = {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: mockList.length,
      incomeCount,
      expenseCount,
      categoryBreakdown,
      userBreakdown,
      recentRecordedByUsers: recentRecordedByUsers.length > 0 ? recentRecordedByUsers : ['Owner', 'Rahim (Manager)', 'Tanvir', 'Accountant'],
    };

    return NextResponse.json({ success: true, data: stats, source: 'fallback' });
  }
}
