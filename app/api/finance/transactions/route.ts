import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction } from '@/models/Finance';
import { generateId } from '@/lib/utils';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/finance/transactions - Get all transactions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listTransactions({ type, status, category }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    
    const transactions = await Transaction.find(query).sort({ date: -1 });
    
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/finance/transactions - Create new transaction
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createTransaction(body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    // Generate unique transaction ID
    const transactionId = `TRX-${generateId().substring(0, 8).toUpperCase()}`;
    
    const transaction = await Transaction.create({
      ...body,
      transactionId,
    });
    
    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
