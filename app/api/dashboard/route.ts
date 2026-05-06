import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Project from '@/models/Project';
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
      .limit(3)
      .select('name status client createdAt');
    
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
        },
        activities,
        departmentData: departmentData.map(d => ({ name: d._id, count: d.count })),
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
