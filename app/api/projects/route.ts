import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { generateId } from '@/lib/utils';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listProjects({ status, priority }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const projects = await Project.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createProject(body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    // Generate unique project ID
    const projectId = `PRJ-${generateId().substring(0, 8).toUpperCase()}`;
    
    const project = await Project.create({
      ...body,
      projectId,
    });
    
    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
