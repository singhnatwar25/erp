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
    <div className="min-h-screen bg-[#191E2C]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#191E2C]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#191E2C]" />
                </div>
              </Link>
            </div>
            <button
              onClick={() => { setEditingTransaction(null); setShowModal(true); }}
              className="btn-lime"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Dashboard Cards */}
        {dashboardData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4E956A]/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#4E956A]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Total Income</p>
                <p className="text-2xl font-bold text-[#4E956A]">
                  {formatCurrency(dashboardData.summary.totalIncome)}
                </p>
              </div>
            </div>
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C55050]/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-[#C55050]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Total Expenses</p>
                <p className="text-2xl font-bold text-[#C55050]">
                  {formatCurrency(dashboardData.summary.totalExpenses)}
                </p>
              </div>
            </div>
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#B9FF66]/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#B9FF66]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Net Profit</p>
                <p className={`text-2xl font-bold ${dashboardData.summary.netProfit >= 0 ? 'text-[#B9FF66]' : 'text-[#C55050]'}`}>
                  {formatCurrency(dashboardData.summary.netProfit)}
                </p>
              </div>
            </div>
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#BC5FCF]/20 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-[#BC5FCF]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Budget Remaining</p>
                <p className="text-2xl font-bold text-[#BC5FCF]">
                  {formatCurrency(dashboardData.budgetSummary.totalRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'transactions' 
                ? 'text-[#B9FF66] border-b-2 border-[#B9FF66]' 
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'budgets' 
                ? 'text-[#B9FF66] border-b-2 border-[#B9FF66]' 
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Budgets
          </button>
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            <div className="card-dark p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-dark pl-12"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#64748B]" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input-dark w-32"
                  >
                    <option value="">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="card-dark p-8 text-center text-[#64748B]">
                  Loading...
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="card-dark p-8 text-center text-[#64748B]">
                  No transactions found
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction._id} className="card-dark p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-[#4E956A]/20' : 'bg-[#C55050]/20'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-[#4E956A]" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-[#C55050]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{transaction.description}</p>
                        <p className="text-sm text-[#64748B]">{transaction.category} • {transaction.transactionId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'income' ? 'text-[#4E956A]' : 'text-[#C55050]'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-[#64748B]">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-[#4E956A]/20 text-[#4E956A]' :
                        transaction.status === 'pending' ? 'bg-[#DC6F31]/20 text-[#DC6F31]' :
                        'bg-[#C55050]/20 text-[#C55050]'
                      }`}>
                        {transaction.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="w-8 h-8 rounded-lg bg-[#3D55B6]/20 text-[#8BA4FF] flex items-center justify-center hover:bg-[#3D55B6]/30"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="w-8 h-8 rounded-lg bg-[#C55050]/20 text-[#FF9B9B] flex items-center justify-center hover:bg-[#C55050]/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <>
            <div className="card-dark p-4 mb-6 flex justify-end">
              <button
                onClick={openAddBudgetModal}
                className="btn-lime flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Budget
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <div key={budget._id} className="card-dark p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{budget.department}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="w-8 h-8 rounded-lg bg-[#3D55B6]/20 text-[#8BA4FF] flex items-center justify-center hover:bg-[#3D55B6]/30"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget._id)}
                        className="w-8 h-8 rounded-lg bg-[#C55050]/20 text-[#FF9B9B] flex items-center justify-center hover:bg-[#C55050]/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] mb-4">FY {budget.fiscalYear}</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">Allocated:</span>
                      <span className="font-medium text-white">{formatCurrency(budget.allocatedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">Spent:</span>
                      <span className="font-medium text-[#C55050]">{formatCurrency(budget.spentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#64748B]">Remaining:</span>
                      <span className="font-medium text-[#4E956A]">{formatCurrency(budget.remainingAmount)}</span>
                    </div>
                    <div className="pt-2">
                      <div className="bg-[#252B3D] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (budget.spentAmount / budget.allocatedAmount) > 0.9 ? 'bg-[#C55050]' : 'bg-[#B9FF66]'
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#252B3D] rounded-2xl max-w-lg w-full border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Type</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                    className="input-dark w-full"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Amount</label>
                  <input
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="input-dark w-full"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-[#94A3B8] mb-1">Category</label>
                <select
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                  className="input-dark w-full"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-[#94A3B8] mb-1">Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="input-dark w-full"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Date</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className="input-dark w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Payment Method</label>
                  <select
                    value={transactionForm.paymentMethod}
                    onChange={(e) => setTransactionForm({ ...transactionForm, paymentMethod: e.target.value })}
                    className="input-dark w-full"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-[#94A3B8] mb-1">Status</label>
                <select
                  value={transactionForm.status}
                  onChange={(e) => setTransactionForm({ ...transactionForm, status: e.target.value })}
                  className="input-dark w-full"
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
                  className="btn-dark"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#252B3D] rounded-2xl max-w-lg w-full border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h2>
            </div>
            <form onSubmit={handleBudgetSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Department</label>
                  <select
                    value={budgetForm.department}
                    onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })}
                    className="input-dark w-full"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1">Fiscal Year</label>
                  <input
                    type="number"
                    value={budgetForm.fiscalYear}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fiscalYear: parseInt(e.target.value) })}
                    className="input-dark w-full"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm text-[#94A3B8] mb-1">Allocated Amount</label>
                <input
                  type="number"
                  value={budgetForm.allocatedAmount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocatedAmount: e.target.value })}
                  className="input-dark w-full"
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
                  className="btn-dark"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime">
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
