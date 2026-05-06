import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Budget } from '@/models/Finance';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/finance/budgets/[id] - Get single budget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const budget = demoData.getBudget(id);
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: budget });
  }

  try {
    await connectDB();

    const budget = await Budget.findById(id);
    
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

// PUT /api/finance/budgets/[id] - Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const budget = demoData.updateBudget(id, body);
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: budget });
  }

  try {
    await connectDB();

    const budget = await Budget.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: budget });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE /api/finance/budgets/[id] - Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const budget = demoData.deleteBudget(id);
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: 'Budget deleted successfully' }
    );
  }

  try {
    await connectDB();

    const budget = await Budget.findByIdAndDelete(id);
    
    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Budget deleted successfully' }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
