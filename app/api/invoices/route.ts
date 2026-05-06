import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/invoices - Get all invoices
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const client = searchParams.get('client');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listCollection('invoices', { status, client }),
    });
  }

  try {
    await connectDB();

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
  const body = await request.json();
  const items = (body.items ?? []).map((item: any) => ({
    ...item,
    quantity: Number(item.quantity ?? 0),
    rate: Number(item.rate ?? 0),
    amount: Number(item.amount ?? Number(item.quantity ?? 0) * Number(item.rate ?? 0)),
  }));
  const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
  const taxRate = Number(body.taxRate ?? 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const discount = Number(body.discount ?? 0);
  const total = subtotal + taxAmount - discount;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      {
        success: true,
        data: demoData.createCollectionItem('invoices', {
          ...body,
          items,
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          balanceDue: total - Number(body.amountPaid ?? 0),
        }),
      },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    const invoice = await Invoice.create({
      ...body,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      balanceDue: total - Number(body.amountPaid ?? 0),
    });
    await invoice.populate('client project');
    
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
