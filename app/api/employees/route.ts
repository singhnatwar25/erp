import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { generateId } from '@/lib/utils';

// GET /api/employees - Get all employees
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    
    let query: any = {};
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
  try {
    await connectDB();
    
    const body = await request.json();
    
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
