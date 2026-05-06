import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const industry = searchParams.get('industry');
  const assignedTo = searchParams.get('assignedTo');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listCollection('clients', { status, industry, assignedTo }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (status) query.status = status;
    if (industry) query.industry = industry;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const clients = await Client.find(query)
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createCollectionItem('clients', body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    const client = await Client.create(body);
    await client.populate('assignedTo');
    
    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
