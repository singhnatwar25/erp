import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction, Budget } from '@/models/Finance';

// GET /api/finance/dashboard - Get financial dashboard data
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get total income and expenses
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
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get transactions by category
    const categoryData = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, type: { $first: '$type' } } }
    ]);
    
    // Get monthly data for chart
    const monthlyData = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    // Get budget summary
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
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses,
        },
        recentTransactions,
        categoryData,
        monthlyData,
        budgetSummary: budgetSummary[0] || { totalAllocated: 0, totalSpent: 0, totalRemaining: 0 },
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
