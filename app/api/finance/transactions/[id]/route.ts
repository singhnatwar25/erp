import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/models/Finance';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/finance/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const transaction = demoData.getTransaction(id);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: transaction });
  }

  try {
    await connectDB();

    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/finance/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const transaction = demoData.updateTransaction(id, body);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: transaction });
  }

  try {
    await connectDB();

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/finance/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const transaction = demoData.deleteTransaction(id);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: 'Transaction deleted successfully' }
    );
  }

  try {
    await connectDB();

    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Transaction deleted successfully' }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
