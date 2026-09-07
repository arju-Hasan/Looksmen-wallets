import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import { getMockTransactions, addMockTransaction } from '@/lib/mockStore';

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
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      source: 'database',
    });
  } catch (error: any) {
    console.warn('[Transactions API] Database query fallback to mock storage:', error?.message);

    // Fallback in-memory filter
    let filtered = [...getMockTransactions()];

    if (type && type !== 'ALL') {
      filtered = filtered.filter((t) => t.type === type);
    }
    if (category && category !== 'ALL') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }
    if (recordedBy && recordedBy !== 'ALL') {
      filtered = filtered.filter((t) => t.recordedBy.toLowerCase() === recordedBy.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q) ||
          t.recordedBy.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      source: 'fallback',
      dbError: error?.message,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, category, amount, paymentMethod, recordedBy, notes, imageUrl, date } = body;

    if (!type || !category || amount === undefined || !paymentMethod || !recordedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (type, category, amount, paymentMethod, recordedBy)' },
        { status: 400 }
      );
    }

    const transactionDate = date ? new Date(date) : new Date();

    try {
      const created = await prisma.transaction.create({
        data: {
          type,
          category,
          amount: parseFloat(amount),
          paymentMethod,
          recordedBy: recordedBy.trim(),
          notes: notes ? notes.trim() : null,
          imageUrl: imageUrl || null,
          date: transactionDate,
        },
      });

      return NextResponse.json({
        success: true,
        data: created,
        source: 'database',
      });
    } catch (dbErr: any) {
      console.warn('[Transactions POST] Database insert fallback to mock storage:', dbErr?.message);
      
      const newMockItem = {
        id: `mock-${Date.now()}`,
        type,
        category,
        amount: parseFloat(amount),
        paymentMethod,
        recordedBy: recordedBy.trim(),
        notes: notes ? notes.trim() : null,
        imageUrl: imageUrl || null,
        date: transactionDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addMockTransaction(newMockItem);

      return NextResponse.json({
        success: true,
        data: newMockItem,
        source: 'fallback',
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
