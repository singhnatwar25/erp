import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/tasks/[id] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const task = demoData.getTask(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: task });
  }

  try {
    await connectDB();

    const task = await Task.findById(id)
      .populate('project', 'name projectId')
      .populate('assignedTo', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName');
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;

  if (body.status === 'done' && !body.completedDate) {
    body.completedDate = new Date().toISOString();
  }

  if (!(await isDatabaseAvailable())) {
    const task = demoData.updateTask(id, body);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: task });
  }

  try {
    await connectDB();

    const task = await Task.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('project', 'name projectId')
      .populate('assignedTo', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName');
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const task = demoData.deleteTask(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Task deleted' });
  }

  try {
    await connectDB();

    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
