import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/employees/[id] - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const employee = demoData.getEmployee(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: employee });
  }

  try {
    await connectDB();

    const employee = await Employee.findById(id);
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const employee = demoData.updateEmployee(id, body);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: employee });
  }

  try {
    await connectDB();

    const employee = await Employee.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const employee = demoData.deleteEmployee(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: 'Employee deleted successfully' }
    );
  }

  try {
    await connectDB();

    const employee = await Employee.findByIdAndDelete(id);
    
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Employee deleted successfully' }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
