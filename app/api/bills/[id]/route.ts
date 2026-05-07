import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Bill } from '@/models/Bill';
import { isDatabaseAvailable } from '@/lib/database';

// GET /api/bills/[id] - Get single bill
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    
    const bill = await Bill.findById(id)
      .populate('templateId', 'name fields')
      .populate('createdBy', 'firstName lastName');
    
    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error('Get Bill Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

// PUT /api/bills/[id] - Update bill
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    
    // Recalculate totals if items or tax rate changed
    if (body.items || body.taxRate !== undefined) {
      const currentBill = await Bill.findById(id);
      const items = body.items || currentBill?.items || [];
      const taxRate = body.taxRate !== undefined ? body.taxRate : currentBill?.taxRate || 0;
      
      const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      
      body.subtotal = subtotal;
      body.taxAmount = taxAmount;
      body.total = total;
    }
    
    const bill = await Bill.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('templateId', 'name fields');
    
    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error('Update Bill Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE /api/bills/[id] - Delete bill
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    
    const bill = await Bill.findByIdAndDelete(id);
    
    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    console.error('Delete Bill Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
}
