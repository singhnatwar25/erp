import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Budget } from '@/models/Finance';

// GET /api/finance/budgets/[id] - Get single budget
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const budget = await Budget.findById(params.id);
    
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const budget = await Budget.findByIdAndUpdate(
      params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const budget = await Budget.findByIdAndDelete(params.id);
    
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
