'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge, EmptyState, ERPShell, Panel, money } from '@/app/components/erp-shell';

type Transaction = {
  _id: string;
  transactionId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  paymentMethod: string;
};

type Budget = {
  _id: string;
  budgetId: string;
  department: string;
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
};

const transactionEmpty = {
  type: 'income' as 'income' | 'expense',
  category: 'Revenue',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'completed',
  paymentMethod: 'bank_transfer',
};

const budgetEmpty = {
  department: 'Engineering',
  fiscalYear: String(new Date().getFullYear()),
  allocatedAmount: '',
};

export default function FinancePage() {
  const [tab, setTab] = useState<'transactions' | 'budgets'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [query, setQuery] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [transactionForm, setTransactionForm] = useState(transactionEmpty);
  const [budgetForm, setBudgetForm] = useState(budgetEmpty);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const fetchFinance = useCallback(async () => {
    const [transactionResponse, budgetResponse] = await Promise.all([
      fetch('/api/finance/transactions'),
      fetch('/api/finance/budgets'),
    ]);
    const transactionPayload = await transactionResponse.json();
    const budgetPayload = await budgetResponse.json();
    if (transactionPayload.success) setTransactions(transactionPayload.data);
    if (budgetPayload.success) setBudgets(budgetPayload.data);
  }, []);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const summary = useMemo(() => {
    const completed = transactions.filter((item) => item.status === 'completed');
    const income = completed.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = completed.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { income, expenses, profit: income - expenses };
  }, [transactions]);

  const filteredTransactions = transactions.filter((item) => `${item.description} ${item.category} ${item.transactionId}`.toLowerCase().includes(query.toLowerCase()));

  const startTransaction = (transaction?: Transaction) => {
    setEditingTransaction(transaction ?? null);
    setTransactionForm(transaction ? {
      type: transaction.type,
      category: transaction.category,
      amount: String(transaction.amount),
      description: transaction.description,
      date: transaction.date?.slice(0, 10) || transactionEmpty.date,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
    } : transactionEmpty);
    setShowTransactionForm(true);
    setTab('transactions');
  };

  const startBudget = (budget?: Budget) => {
    setEditingBudget(budget ?? null);
    setBudgetForm(budget ? {
      department: budget.department,
      fiscalYear: String(budget.fiscalYear),
      allocatedAmount: String(budget.allocatedAmount),
    } : budgetEmpty);
    setShowBudgetForm(true);
    setTab('budgets');
  };

  const saveTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingTransaction ? `/api/finance/transactions/${editingTransaction._id}` : '/api/finance/transactions', {
      method: editingTransaction ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...transactionForm, amount: Number(transactionForm.amount || 0) }),
    });
    const payload = await response.json();
    if (payload.success) {
      setShowTransactionForm(false);
      fetchFinance();
    }
  };

  const saveBudget = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editingBudget ? `/api/finance/budgets/${editingBudget._id}` : '/api/finance/budgets', {
      method: editingBudget ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: budgetForm.department,
        fiscalYear: Number(budgetForm.fiscalYear),
        allocatedAmount: Number(budgetForm.allocatedAmount || 0),
        categories: [],
      }),
    });
    const payload = await response.json();
    if (payload.success) {
      setShowBudgetForm(false);
      fetchFinance();
    }
  };

  const deleteRecord = async (path: string) => {
    if (!confirm('Delete this record?')) return;
    await fetch(path, { method: 'DELETE' });
    fetchFinance();
  };

  return (
    <ERPShell
      title="Finance"
      description="Track company income, expenses, budgets, and cash position."
      action={
        <div className="flex gap-2">
          <button onClick={() => startTransaction()} className="btn-lime rounded-lg px-4"><Plus className="h-4 w-4" />Transaction</button>
          <button onClick={() => startBudget()} className="btn-dark rounded-lg px-4"><Plus className="h-4 w-4" />Budget</button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric label="Income" value={money(summary.income)} tone="up" />
            <Metric label="Expenses" value={money(summary.expenses)} tone="down" />
            <Metric label="Net profit" value={money(summary.profit)} tone={summary.profit >= 0 ? 'up' : 'down'} />
          </div>
          <Panel>
            <div className="mb-4 flex gap-2">
              <button className={tab === 'transactions' ? 'btn-lime rounded-lg px-4' : 'btn-dark rounded-lg px-4'} onClick={() => setTab('transactions')}>Transactions</button>
              <button className={tab === 'budgets' ? 'btn-lime rounded-lg px-4' : 'btn-dark rounded-lg px-4'} onClick={() => setTab('budgets')}>Budgets</button>
            </div>
            {tab === 'transactions' ? (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                  <input className="input-dark pl-10" placeholder="Search transactions" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between gap-4 rounded-lg border border-[#ded8c8] p-3">
                      <div className="flex items-center gap-3">
                        {transaction.type === 'income' ? <TrendingUp className="h-5 w-5 text-[#1f8f4d]" /> : <TrendingDown className="h-5 w-5 text-[#b42318]" />}
                        <div>
                          <p className="font-semibold">{transaction.description}</p>
                          <p className="text-xs text-[#6b7280]">{transaction.category} / {new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={transaction.type === 'income' ? 'font-bold text-[#1f8f4d]' : 'font-bold text-[#b42318]'}>{transaction.type === 'income' ? '+' : '-'}{money(transaction.amount)}</span>
                        <button onClick={() => startTransaction(transaction)} className="btn-dark rounded-lg px-3"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => deleteRecord(`/api/finance/transactions/${transaction._id}`)} className="btn-dark rounded-lg px-3 text-[#b42318]"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && <EmptyState text="No transactions found" />}
                </div>
              </>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {budgets.map((budget) => (
                  <div key={budget._id} className="rounded-lg border border-[#ded8c8] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{budget.department}</p>
                        <p className="text-xs text-[#6b7280]">FY {budget.fiscalYear}</p>
                      </div>
                      <Badge tone={budget.remainingAmount >= 0 ? 'up' : 'down'}>{money(budget.remainingAmount)} left</Badge>
                    </div>
                    <div className="mt-4 text-sm">
                      <p>Allocated: <strong>{money(budget.allocatedAmount)}</strong></p>
                      <p>Spent: <strong className="text-[#b42318]">{money(budget.spentAmount)}</strong></p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => startBudget(budget)} className="btn-dark rounded-lg px-3"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => deleteRecord(`/api/finance/budgets/${budget._id}`)} className="btn-dark rounded-lg px-3 text-[#b42318]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                {budgets.length === 0 && <EmptyState text="No budgets found" />}
              </div>
            )}
          </Panel>
        </div>

        <Panel title={tab === 'transactions' ? 'Transaction Form' : 'Budget Form'}>
          {tab === 'transactions' && showTransactionForm ? (
            <form onSubmit={saveTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Select value={transactionForm.type} onChange={(v) => setTransactionForm({ ...transactionForm, type: v as 'income' | 'expense' })} options={['income', 'expense']} />
                <Select value={transactionForm.status} onChange={(v) => setTransactionForm({ ...transactionForm, status: v })} options={['pending', 'completed', 'cancelled']} />
              </div>
              <Field value={transactionForm.description} onChange={(v) => setTransactionForm({ ...transactionForm, description: v })} placeholder="Description" required />
              <div className="grid grid-cols-2 gap-3">
                <Field value={transactionForm.category} onChange={(v) => setTransactionForm({ ...transactionForm, category: v })} placeholder="Category" required />
                <Field type="number" value={transactionForm.amount} onChange={(v) => setTransactionForm({ ...transactionForm, amount: v })} placeholder="Amount" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field type="date" value={transactionForm.date} onChange={(v) => setTransactionForm({ ...transactionForm, date: v })} />
                <Select value={transactionForm.paymentMethod} onChange={(v) => setTransactionForm({ ...transactionForm, paymentMethod: v })} options={['cash', 'bank_transfer', 'credit_card', 'check', 'digital_wallet']} />
              </div>
              <button type="submit" className="btn-lime w-full rounded-lg">{editingTransaction ? 'Update' : 'Create'} transaction</button>
            </form>
          ) : tab === 'budgets' && showBudgetForm ? (
            <form onSubmit={saveBudget} className="space-y-3">
              <Select value={budgetForm.department} onChange={(v) => setBudgetForm({ ...budgetForm, department: v })} options={['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support']} />
              <div className="grid grid-cols-2 gap-3">
                <Field type="number" value={budgetForm.fiscalYear} onChange={(v) => setBudgetForm({ ...budgetForm, fiscalYear: v })} placeholder="Fiscal year" required />
                <Field type="number" value={budgetForm.allocatedAmount} onChange={(v) => setBudgetForm({ ...budgetForm, allocatedAmount: v })} placeholder="Allocated" required />
              </div>
              <button type="submit" className="btn-lime w-full rounded-lg">{editingBudget ? 'Update' : 'Create'} budget</button>
            </form>
          ) : <EmptyState text="Choose Transaction or Budget to add/edit records." />}
        </Panel>
      </div>
    </ERPShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'up' | 'down' }) {
  return <Panel><p className="text-sm text-[#6b7280]">{label}</p><p className={tone === 'up' ? 'mt-2 text-3xl font-bold text-[#1f8f4d]' : 'mt-2 text-3xl font-bold text-[#b42318]'}>{value}</p></Panel>;
}

function Field({ value, onChange, type = 'text', placeholder, required }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <input className="input-dark" value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required={required} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select>;
}
