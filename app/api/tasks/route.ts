import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/tasks - Get all tasks with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');
  const assignedTo = searchParams.get('assignedTo');
  const status = searchParams.get('status');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listTasks({ project, assignedTo, status }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;
    
    const tasks = await Task.find(query)
      .populate('project', 'name projectId')
      .populate('assignedTo', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createTask(body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    const task = await Task.create(body);
    await task.populate('project assignedTo assignedBy');
    
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
