import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Deal from '@/models/Deal';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/deals - Get all deals
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage');
  const client = searchParams.get('client');
  const assignedTo = searchParams.get('assignedTo');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listCollection('deals', { stage, client, assignedTo }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (stage) query.stage = stage;
    if (client) query.client = client;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const deals = await Deal.find(query)
      .populate('client', 'companyName contactPerson')
      .populate('assignedTo', 'firstName lastName')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json({ success: true, data: deals });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create new deal
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createCollectionItem('deals', body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    const deal = await Deal.create(body);
    await deal.populate('client assignedTo');
    
    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
