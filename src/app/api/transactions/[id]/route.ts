import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { updateMockTransaction, deleteMockTransaction, getMockTransactions } from '@/lib/mockStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (transaction) {
        return NextResponse.json({ success: true, data: transaction });
      }
    } catch (dbErr) {
      // ignore and check mock
    }

    const mockTx = getMockTransactions().find((t) => t.id === id);
    if (mockTx) {
      return NextResponse.json({ success: true, data: mockTx });
    }

    return NextResponse.json(
      { success: false, error: 'Transaction not found' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, category, amount, paymentMethod, recordedBy, notes, imageUrl, date } = body;

    const parsedAmount = amount !== undefined ? parseFloat(amount) : undefined;
    const updateData: any = {
      ...(type && { type }),
      ...(category && { category }),
      ...(parsedAmount !== undefined && { amount: parsedAmount }),
      ...(paymentMethod && { paymentMethod }),
      ...(recordedBy && { recordedBy: recordedBy.trim() }),
      ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(date && { date: new Date(date).toISOString() }),
    };

    // Always update the mock store so in-memory state stays synchronized
    const updatedMock = updateMockTransaction(id, updateData);

    // Try updating database if record exists in DB
    try {
      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          ...(type && { type }),
          ...(category && { category }),
          ...(parsedAmount !== undefined && { amount: parsedAmount }),
          ...(paymentMethod && { paymentMethod }),
          ...(recordedBy && { recordedBy: recordedBy.trim() }),
          ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
          ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
          ...(date && { date: new Date(date) }),
        },
      });

      return NextResponse.json({ success: true, data: updated, source: 'database' });
    } catch (dbErr: any) {
      return NextResponse.json({
        success: true,
        data: updatedMock,
        source: 'fallback',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Remove from mock store
    deleteMockTransaction(id);

    // Try deleting from database
    try {
      await prisma.transaction.delete({
        where: { id },
      });
    } catch (dbErr: any) {
      console.warn('[Transactions DELETE] Database delete notice:', dbErr?.message);
    }

    return NextResponse.json({ success: true, message: 'Transaction deleted successfully', id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error deleting transaction' },
      { status: 500 }
    );
  }
}

