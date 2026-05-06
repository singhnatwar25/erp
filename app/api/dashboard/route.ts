import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { Transaction, Budget } from '@/models/Finance';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/dashboard - Get complete dashboard data
export async function GET(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.dashboard(),
    });
  }

  try {
    await connectDB();
    
    // Get employee stats
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const departments = await Employee.distinct('department');
    const departmentCount = departments.length;
    
    // Get employee growth (new hires in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newHires = await Employee.countDocuments({
      joinDate: { $gte: thirtyDaysAgo }
    });
    
    // Get project stats
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'in_progress' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const planningProjects = await Project.countDocuments({ status: 'planning' });
    
    // Get total project budget
    const budgetResult = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);
    const totalProjectBudget = budgetResult[0]?.total || 0;
    
    // Get task stats
    const totalTasks = await Task.countDocuments();
    const todoTasks = await Task.countDocuments({ status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
    const reviewTasks = await Task.countDocuments({ status: 'review' });
    const doneTasks = await Task.countDocuments({ status: 'done' });
    
    // Get recent tasks
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName')
      .select('title status priority dueDate project assignedTo');
    
    // Get finance stats
    const incomeResult = await Transaction.aggregate([
      { $match: { type: 'income', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const expenseResult = await Transaction.aggregate([
      { $match: { type: 'expense', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netProfit = totalIncome - totalExpenses;
    
    // Get budget allocation
    const budgetSummary = await Budget.aggregate([
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' },
          totalRemaining: { $sum: '$remainingAmount' }
        }
      }
    ]);
    
    const totalBudget = budgetSummary[0]?.totalAllocated || 0;
    
    // Get recent activity (combine all recent records)
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('firstName lastName department createdAt');
    
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('team.employee', 'firstName lastName avatar')
      .select('name status client createdAt budget category team tasksCompleted tasksTotal');
    
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('type amount description category createdAt');
    
    // Format recent activity
    const activities = [
      ...recentEmployees.map(e => ({
        id: e._id.toString(),
        type: 'employee' as const,
        title: 'New Employee Joined',
        description: `${e.firstName} ${e.lastName} joined ${e.department}`,
        date: e.createdAt,
      })),
      ...recentProjects.map(p => ({
        id: p._id.toString(),
        type: 'project' as const,
        title: p.status === 'completed' ? 'Project Completed' : 'New Project Started',
        description: `${p.name} ${p.status === 'completed' ? 'delivered' : `for ${p.client}`}`,
        date: p.createdAt,
      })),
      ...recentTransactions.map(t => ({
        id: t._id.toString(),
        type: 'transaction' as const,
        title: t.type === 'income' ? 'Payment Received' : 'Expense Recorded',
        description: `${t.description} (${t.category})`,
        date: t.createdAt,
        amount: t.type === 'income' ? t.amount : -t.amount,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    // Get department breakdown
    const departmentData = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          employees: totalEmployees,
          activeEmployees,
          newHires,
          departments: departmentCount,
          projects: totalProjects,
          activeProjects,
          completedProjects,
          planningProjects,
          totalProjectBudget,
          totalBudget,
          totalIncome,
          totalExpenses,
          netProfit,
          totalTasks,
          todoTasks,
          inProgressTasks,
          reviewTasks,
          doneTasks,
        },
        activities,
        departmentData: departmentData.map(d => ({ name: d._id, count: d.count })),
        recentTasks: recentTasks.map(t => ({
          id: t._id.toString(),
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          project: t.project?.name || 'No Project',
          assignedTo: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned'
        })),
        recentProjects: recentProjects.map(p => ({
          id: p._id.toString(),
          name: p.name,
          category: p.category || 'General',
          budget: p.budget,
          client: p.client,
          status: p.status,
          tasksCompleted: p.tasksCompleted || 0,
          tasksTotal: p.tasksTotal || 0,
          team: p.team?.slice(0, 3).map((m: any) => ({
            name: m.employee ? `${m.employee.firstName} ${m.employee.lastName}` : 'Unknown',
            avatar: m.employee?.avatar
          })) || [],
          extraMembers: Math.max(0, (p.team?.length || 0) - 3)
        })),
      }
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
