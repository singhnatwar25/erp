import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Communication from '@/models/Communication';

// GET /api/communications - Get all communications
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const client = searchParams.get('client');
    const type = searchParams.get('type');
    const employee = searchParams.get('employee');
    
    const query: any = {};
    if (client) query.client = client;
    if (type) query.type = type;
    if (employee) query.employee = employee;
    
    const communications = await Communication.find(query)
      .populate('client', 'companyName contactPerson')
      .populate('employee', 'firstName lastName')
      .sort({ date: -1 });
    
    return NextResponse.json({ success: true, data: communications });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

// POST /api/communications - Create new communication
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const communication = await Communication.create(body);
    await communication.populate('client employee');
    
    return NextResponse.json({ success: true, data: communication }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create communication' },
      { status: 500 }
    );
  }
}
