import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/models/Finance';

// GET /api/finance/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const transaction = await Transaction.findById(params.id);
    
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const transaction = await Transaction.findByIdAndUpdate(
      params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const transaction = await Transaction.findByIdAndDelete(params.id);
    
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
