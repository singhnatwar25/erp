import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Bill, BillTemplate } from '@/models/Bill';
import { isDatabaseAvailable } from '@/lib/database';

// GET /api/bills - Get all bills
export async function GET(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }

  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const templateId = searchParams.get('templateId');
    
    let query: any = {};
    if (status) query.status = status;
    if (templateId) query.templateId = templateId;
    
    const bills = await Bill.find(query)
      .populate('templateId', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error('Bills API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    
    // Calculate totals
    const subtotal = body.items?.reduce((sum: number, item: any) => sum + item.total, 0) || 0;
    const taxAmount = (subtotal * (body.taxRate || 0)) / 100;
    const total = subtotal + taxAmount;
    
    // Get template name
    const template = await BillTemplate.findById(body.templateId);
    
    const bill = new Bill({
      ...body,
      subtotal,
      taxAmount,
      total,
      templateName: template?.name || 'Unknown Template',
      createdBy: 'demo-user', // Replace with actual user ID from auth
    });
    
    await bill.save();
    
    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error('Create Bill Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bill' },
      { status: 500 }
    );
  }
}
