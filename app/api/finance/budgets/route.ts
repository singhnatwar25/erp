import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Budget } from '@/models/Finance';
import { generateId } from '@/lib/utils';

// GET /api/finance/budgets - Get all budgets
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const fiscalYear = searchParams.get('fiscalYear');
    
    let query: any = {};
    if (department) query.department = department;
    if (fiscalYear) query.fiscalYear = parseInt(fiscalYear);
    
    const budgets = await Budget.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST /api/finance/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate unique budget ID
    const budgetId = `BUD-${generateId().substring(0, 8).toUpperCase()}`;
    
    const budget = await Budget.create({
      ...body,
      budgetId,
      remainingAmount: body.allocatedAmount,
    });
    
    return NextResponse.json(
      { success: true, data: budget },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create budget' },
      { status: 500 }
    );
  }
}
