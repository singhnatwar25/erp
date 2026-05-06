import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { generateId } from '@/lib/utils';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/employees - Get all employees
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');
  const status = searchParams.get('status');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listEmployees({ department, status }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (department) query.department = department;
    if (status) query.status = status;
    
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createEmployee(body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    // Generate unique employee ID
    const employeeId = `EMP-${generateId().substring(0, 8).toUpperCase()}`;
    
    const employee = await Employee.create({
      ...body,
      employeeId,
    });
    
    return NextResponse.json(
      { success: true, data: employee },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}
