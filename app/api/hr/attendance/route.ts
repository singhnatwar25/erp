import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/hr/attendance - Get attendance records
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employee = searchParams.get('employee');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listCollection('attendance', { employee, startDate, endDate }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (employee) query.employee = employee;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .sort({ date: -1 });
    
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/hr/attendance - Mark attendance
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createCollectionItem('attendance', body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    // Check if attendance already marked for this date
    const existing = await Attendance.findOne({
      employee: body.employee,
      date: {
        $gte: new Date(body.date).setHours(0, 0, 0, 0),
        $lt: new Date(body.date).setHours(24, 0, 0, 0),
      },
    });
    
    if (existing) {
      // Update existing
      Object.assign(existing, body);
      await existing.save();
      await existing.populate('employee', 'firstName lastName');
      return NextResponse.json({ success: true, data: existing });
    }
    
    const attendance = await Attendance.create(body);
    await attendance.populate('employee', 'firstName lastName');
    
    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
