import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

// GET /api/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const client = searchParams.get('client');
    
    const query: any = {};
    if (status) query.status = status;
    if (client) query.client = client;
    
    const invoices = await Invoice.find(query)
      .populate('client', 'companyName contactPerson')
      .populate('project', 'name')
      .sort({ issueDate: -1 });
    
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const invoice = await Invoice.create(body);
    await invoice.populate('client project');
    
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
