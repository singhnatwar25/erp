'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Calendar,
  CreditCard
} from 'lucide-react';

interface Transaction {
  _id: string;
  transactionId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  paymentMethod: string;
}

interface Budget {
  _id: string;
  budgetId: string;
  department: string;
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
  recentTransactions: Transaction[];
  budgetSummary: {
    totalAllocated: number;
    totalSpent: number;
    totalRemaining: number;
  };
}

export default function FinanceManagement() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'budgets'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: '',
    status: 'pending',
    paymentMethod: 'bank_transfer',
  });

  const [budgetForm, setBudgetForm] = useState({
    department: '',
    fiscalYear: new Date().getFullYear(),
    allocatedAmount: '',
    categories: [{ name: '', allocated: '' }],
  });

  const categories = [
    'Salary', 'Software', 'Hardware', 'Office', 'Marketing', 
    'Travel', 'Training', 'Consulting', 'Revenue', 'Other'
  ];
  const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'check', 'digital_wallet'];
  const statusOptions = ['pending', 'completed', 'cancelled'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support'];

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/finance/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const queryParams = filterType ? `?type=${filterType}` : '';
      const response = await fetch(`/api/finance/transactions${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch('/api/finance/budgets');
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchBudgets();
  }, [fetchDashboardData, fetchBudgets]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTransaction 
        ? `/api/finance/transactions/${editingTransaction._id}` 
        : '/api/finance/transactions';
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          amount: Number(transactionForm.amount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingTransaction(null);
        resetTransactionForm();
        fetchTransactions();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBudget 
        ? `/api/finance/budgets/${editingBudget._id}` 
        : '/api/finance/budgets';
      const method = editingBudget ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...budgetForm,
          allocatedAmount: Number(budgetForm.allocatedAmount),
          categories: budgetForm.categories.map(cat => ({
            name: cat.name,
            allocated: Number(cat.allocated),
            spent: 0,
          })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowBudgetModal(false);
        setEditingBudget(null);
        resetBudgetForm();
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchTransactions();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      const response = await fetch(`/api/finance/budgets/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date.split('T')[0],
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
    });
    setShowModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      department: budget.department,
      fiscalYear: budget.fiscalYear,
      allocatedAmount: budget.allocatedAmount.toString(),
      categories: [{ name: '', allocated: '' }],
    });
    setShowBudgetModal(true);
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      type: 'income',
      category: '',
      amount: '',
      description: '',
      date: '',
      status: 'pending',
      paymentMethod: 'bank_transfer',
    });
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      department: '',
      fiscalYear: new Date().getFullYear(),
      allocatedAmount: '',
      categories: [{ name: '', allocated: '' }],
    });
  };

  const openAddTransactionModal = () => {
    setEditingTransaction(null);
    resetTransactionForm();
    setShowModal(true);
  };

  const openAddBudgetModal = () => {
    setEditingBudget(null);
    resetBudgetForm();
    setShowBudgetModal(true);
  };

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'badge-yellow',
      completed: 'badge-green',
      cancelled: 'badge-red',
    };
    return <span className={`badge ${classes[status as keyof typeof classes]}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="p-2 bg-purple-500 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Finance Management</h1>
                <p className="text-sm text-gray-500">Track transactions and budgets</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(dashboardData.summary.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(dashboardData.summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className={`text-xl font-bold ${dashboardData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(dashboardData.summary.netProfit)}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget Remaining</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(dashboardData.budgetSummary.totalRemaining)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'transactions' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'budgets' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Budgets
          </button>
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input w-32"
                  >
                    <option value="">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <button
                  onClick={openAddTransactionModal}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3">Transaction ID</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="table-row">
                        <td className="px-6 py-4 font-medium">{transaction.transactionId}</td>
                        <td className="px-6 py-4">
                          <span className={`badge ${transaction.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{transaction.category}</td>
                        <td className="px-6 py-4 font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <>
            <div className="card mb-6">
              <div className="flex justify-end">
                <button
                  onClick={openAddBudgetModal}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Budget
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <div key={budget._id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{budget.department}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">FY {budget.fiscalYear}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Allocated:</span>
                      <span className="font-medium">{formatCurrency(budget.allocatedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Spent:</span>
                      <span className="font-medium text-red-600">{formatCurrency(budget.spentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="font-medium text-green-600">{formatCurrency(budget.remainingAmount)}</span>
                    </div>
                    <div className="pt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (budget.spentAmount / budget.allocatedAmount) > 0.9 ? 'bg-red-500' : 'bg-primary-600'
                          }`}
                          style={{ width: `${Math.min((budget.spentAmount / budget.allocatedAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                    className="input"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="label">Amount</label>
                  <input
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="label">Category</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="label">Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    value={transactionForm.paymentMethod}
                    onChange={(e) => setTransactionForm({ ...transactionForm, paymentMethod: e.target.value })}
                    className="input"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="label">Status</label>
                <select
                  value={transactionForm.status}
                  onChange={(e) => setTransactionForm({ ...transactionForm, status: e.target.value })}
                  className="input"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                    resetTransactionForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h2>
            </div>
            <form onSubmit={handleBudgetSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Department</label>
                  <select
                    value={budgetForm.department}
                    onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Fiscal Year</label>
                  <input
                    type="number"
                    value={budgetForm.fiscalYear}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fiscalYear: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="label">Allocated Amount</label>
                <input
                  type="number"
                  value={budgetForm.allocatedAmount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocatedAmount: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetModal(false);
                    setEditingBudget(null);
                    resetBudgetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBudget ? 'Update' : 'Add'} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
