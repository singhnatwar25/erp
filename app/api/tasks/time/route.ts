import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

// POST /api/tasks/time - Add time entry to task
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { taskId, hours, description, date } = await request.json();
    
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Add time entry
    task.timeEntries.push({
      date: date || new Date(),
      hours,
      description,
    });
    
    // Update actual hours
    task.actualHours = task.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    
    await task.save();
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add time entry' },
      { status: 500 }
    );
  }
}

// GET /api/tasks/time - Get time report
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee');
    const projectId = searchParams.get('project');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const match: any = {};
    if (employeeId) match.assignedTo = employeeId;
    if (projectId) match.project = projectId;
    
    const tasks = await Task.find(match)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName');
    
    // Aggregate time data
    let totalHours = 0;
    const timeByEmployee: Record<string, number> = {};
    const timeByProject: Record<string, number> = {};
    
    tasks.forEach(task => {
      task.timeEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (startDate && entryDate < new Date(startDate)) return;
        if (endDate && entryDate > new Date(endDate)) return;
        
        totalHours += entry.hours;
        
        const empId = task.assignedTo?._id?.toString() || 'unknown';
        timeByEmployee[empId] = (timeByEmployee[empId] || 0) + entry.hours;
        
        const projId = task.project?._id?.toString() || 'unknown';
        timeByProject[projId] = (timeByProject[projId] || 0) + entry.hours;
      });
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalHours,
        timeByEmployee,
        timeByProject,
        tasks,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time report' },
      { status: 500 }
    );
  }
}
