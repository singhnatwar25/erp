import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Leave from '@/models/Leave';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/hr/leaves - Get leave requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get('employee');
  const status = searchParams.get('status');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listCollection('leaves', { employee, status }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (employee) query.employee = employee;
    if (status) query.status = status;
    
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaves' },
      { status: 500 }
    );
  }
}

// POST /api/hr/leaves - Apply for leave
export async function POST(request: NextRequest) {
  const body = await request.json();
  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      {
        success: true,
        data: demoData.createCollectionItem('leaves', {
          ...body,
          totalDays: diffDays,
        }),
      },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    const leave = await Leave.create({
      ...body,
      totalDays: diffDays,
    });
    
    await leave.populate('employee', 'firstName lastName');
    
    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to apply for leave' },
      { status: 500 }
    );
  }
}
