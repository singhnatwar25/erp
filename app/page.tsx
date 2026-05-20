'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckSquare,
  CircleDollarSign,
  Database,
  FileText,
  FolderKanban,
  Handshake,
  Laptop,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ReceiptText,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type DashboardData = {
  stats: {
    employees: number;
    activeEmployees: number;
    newHires: number;
    departments: number;
    projects: number;
    activeProjects: number;
    completedProjects: number;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    reviewTasks: number;
    doneTasks: number;
  };
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    amount?: number;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    project: string;
    assignedTo: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    client: string;
    status: string;
    budget: number;
    tasksCompleted: number;
    tasksTotal: number;
  }>;
};

type Deal = {
  _id: string;
  title: string;
  value: number;
  stage: string;
  probability?: number;
};

type Asset = {
  _id: string;
  name: string;
  status: string;
  type: string;
  location?: string;
};

type Bill = {
  _id: string;
  billNumber: string;
  clientName: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  dueDate: string;
};

type DatabaseStatus = {
  connected: boolean;
  mode: 'local';
  path: string;
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.success) {
    throw new Error(payload.error || `Request failed: ${path}`);
  }
  return payload.data;
}

const money = (amount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const dateLabel = (date: string) => new Date(date).toLocaleDateString();

const modules = [
  { label: 'Employees', href: '/employees', icon: Users, detail: 'People, departments, salaries' },
  { label: 'Projects', href: '/projects', icon: FolderKanban, detail: 'Delivery, budgets, progress' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, detail: 'Kanban, assignments, time' },
  { label: 'Finance', href: '/finance', icon: CircleDollarSign, detail: 'Transactions and budgets' },
  { label: 'Bills', href: '/bills', icon: FileText, detail: 'Invoices, status, PDF export' },
  { label: 'Company', href: '/company', icon: Building2, detail: 'CRM, sales, HR, assets' },
] as const;

export default function ERPDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [database, setDatabase] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referenceNow, setReferenceNow] = useState(() => Date.now());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadERP = useCallback(async () => {
    try {
      setError('');
      const [dashboardData, dealData, assetData, billData, databaseData] = await Promise.all([
        getJson<DashboardData>('/api/dashboard'),
        getJson<Deal[]>('/api/deals'),
        getJson<Asset[]>('/api/assets'),
        getJson<Bill[]>('/api/bills'),
        getJson<DatabaseStatus>('/api/system/database'),
      ]);

      setDashboard(dashboardData);
      setDeals(dealData);
      setAssets(assetData);
      setBills(billData);
      setDatabase(databaseData);
      setReferenceNow(Date.now());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load ERP data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadERP();
  }, [loadERP]);

  const derived = useMemo(() => {
    const openDeals = deals.filter((deal) => !['won', 'lost'].includes(deal.stage));
    const pipelineValue = openDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    const outstandingBills = bills.filter((bill) => ['draft', 'sent', 'overdue'].includes(bill.status));
    const receivables = outstandingBills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
    const activeAssets = assets.filter((asset) => asset.status === 'active').length;
    const overdueBills = bills.filter((bill) => bill.status === 'overdue').length;
    const dueSoonTasks = (dashboard?.recentTasks ?? []).filter((task) => {
      if (task.status === 'done' || !task.dueDate) return false;
      const due = new Date(task.dueDate).getTime();
      const nextWeek = referenceNow + 7 * 24 * 60 * 60 * 1000;
      return due <= nextWeek;
    });

    return {
      activeAssets,
      dueSoonTasks,
      openDeals,
      overdueBills,
      pipelineValue,
      receivables,
      outstandingBills,
    };
  }, [assets, bills, dashboard?.recentTasks, deals, referenceNow]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-white text-[#1f2937]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-[#1f2937] border-t-transparent animate-spin" />
          <span className="font-medium">Loading ERP workspace...</span>
        </div>
      </main>
    );
  }

  const stats = dashboard?.stats;

  return (
    <div className="min-h-screen bg-white text-[#1f2937] lg:flex">
      <aside className={`lg:fixed lg:left-0 lg:top-0 lg:h-full bg-white border-r border-[#ded8c8] transition-all ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className="p-5 border-b border-[#ded8c8]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#1f2937] text-[#fffdf7] grid place-items-center">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-lg font-bold">Office ERP</p>
                  <p className="text-xs text-[#6b7280]">Company management</p>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ded8c8] hover:bg-[#f7f7f7] lg:flex"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <Link href="/" title={sidebarCollapsed ? 'Dashboard' : undefined} className={`flex items-center gap-3 rounded-lg bg-[#1f2937] px-3 py-2.5 text-sm font-semibold text-[#fffdf7] ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && 'Dashboard'}
          </Link>
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} title={sidebarCollapsed ? module.label : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f7f7f7] ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && module.label}
              </Link>
            );
          })}
        </nav>

        {!sidebarCollapsed && <div className="m-4 rounded-lg border border-[#ded8c8] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Database className="h-4 w-4" />
            Local database
          </div>
          <p className="mt-2 truncate text-xs text-[#6b7280]">{database?.path}</p>
        </div>}
      </aside>

      <main className={`w-full transition-all ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className="sticky top-0 z-30 border-b border-[#ded8c8] bg-white/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Company Dashboard</h1>
              <p className="text-sm text-[#6b7280]">Operate people, sales, finance, projects, tasks, assets, and billing from one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={loadERP} className="btn-dark rounded-lg px-4">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
              <Link href="/company" className="btn-lime rounded-lg px-4">
                <Plus className="h-4 w-4" />
                Add records
              </Link>
            </div>
          </div>
        </header>

        <div className="p-5">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#b42318]/30 bg-[#fdecec] px-4 py-3 text-sm text-[#b42318]">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KPI icon={Users} label="Active employees" value={stats?.activeEmployees ?? 0} helper={`${stats?.departments ?? 0} departments`} />
            <KPI icon={FolderKanban} label="Active projects" value={stats?.activeProjects ?? 0} helper={`${stats?.completedProjects ?? 0} completed`} />
            <KPI icon={ReceiptText} label="Receivables" value={money(derived.receivables)} helper={`${derived.outstandingBills.length} open invoices`} tone={derived.overdueBills > 0 ? 'down' : 'neutral'} />
            <KPI icon={Banknote} label="Net profit" value={money(stats?.netProfit ?? 0)} helper={`${money(stats?.totalIncome ?? 0)} income`} tone={(stats?.netProfit ?? 0) >= 0 ? 'up' : 'down'} />
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Panel title="Today">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <StatusBlock icon={CalendarClock} label="Tasks due soon" value={derived.dueSoonTasks.length} href="/tasks" />
                <StatusBlock icon={Handshake} label="Open pipeline" value={money(derived.pipelineValue)} href="/company" />
                <StatusBlock icon={Laptop} label="Active assets" value={derived.activeAssets} href="/company" />
              </div>
              <div className="mt-5 overflow-hidden rounded-lg border border-[#ded8c8]">
                <table className="w-full text-sm">
                  <thead className="bg-[#f7f7f7] text-left text-xs uppercase text-[#4b5563]">
                    <tr>
                      <th className="px-4 py-3">Work item</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Due</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded8c8] bg-white">
                    {(dashboard?.recentTasks ?? []).slice(0, 6).map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-[#6b7280]">{task.project}</p>
                        </td>
                        <td className="px-4 py-3 text-[#4b5563]">{task.assignedTo}</td>
                        <td className="px-4 py-3 text-[#4b5563]">{task.dueDate ? dateLabel(task.dueDate) : 'No date'}</td>
                        <td className="px-4 py-3">
                          <Badge tone={task.status === 'done' ? 'up' : task.priority === 'urgent' ? 'down' : 'neutral'}>
                            {task.status.replaceAll('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Finance Health">
              <div className="space-y-3">
                <FinanceLine icon={TrendingUp} label="Income" value={money(stats?.totalIncome ?? 0)} tone="up" />
                <FinanceLine icon={TrendingDown} label="Expenses" value={money(stats?.totalExpenses ?? 0)} tone="down" />
                <FinanceLine icon={FileText} label="Open invoices" value={money(derived.receivables)} tone={derived.overdueBills > 0 ? 'down' : 'neutral'} />
              </div>
              <Link href="/finance" className="mt-5 flex items-center justify-between rounded-lg border border-[#ded8c8] px-4 py-3 text-sm font-semibold hover:bg-[#f7f7f7]">
                Manage finance and budgets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Panel>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Panel title="ERP Modules">
              <div className="grid gap-2">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <Link key={module.href} href={module.href} className="flex items-center justify-between rounded-lg border border-[#ded8c8] p-3 hover:bg-[#f7f7f7]">
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>
                          <span className="block text-sm font-semibold">{module.label}</span>
                          <span className="block text-xs text-[#6b7280]">{module.detail}</span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Sales Pipeline">
              <div className="space-y-3">
                {derived.openDeals.slice(0, 5).map((deal) => (
                  <RecordRow key={deal._id} title={deal.title} meta={`${deal.stage} / ${deal.probability ?? 0}%`} value={money(deal.value)} tone="up" />
                ))}
                {derived.openDeals.length === 0 && <EmptyState text="No open deals" />}
              </div>
            </Panel>

            <Panel title="Recent Activity">
              <div className="space-y-3">
                {(dashboard?.activities ?? []).slice(0, 6).map((activity) => (
                  <RecordRow
                    key={activity.id}
                    title={activity.title}
                    meta={`${activity.description} / ${dateLabel(activity.date)}`}
                    value={activity.amount ? money(activity.amount) : undefined}
                    tone={activity.amount && activity.amount < 0 ? 'down' : 'neutral'}
                  />
                ))}
              </div>
            </Panel>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <Panel title="Projects">
              <div className="space-y-3">
                {(dashboard?.recentProjects ?? []).slice(0, 5).map((project) => (
                  <RecordRow key={project.id} title={project.name} meta={`${project.client} / ${project.status}`} value={money(project.budget)} />
                ))}
              </div>
            </Panel>

            <Panel title="Billing">
              <div className="space-y-3">
                {bills.slice(0, 5).map((bill) => (
                  <RecordRow
                    key={bill._id}
                    title={`${bill.billNumber} / ${bill.clientName}`}
                    meta={`${bill.status} / due ${dateLabel(bill.dueDate)}`}
                    value={money(bill.total)}
                    tone={bill.status === 'overdue' ? 'down' : bill.status === 'paid' ? 'up' : 'neutral'}
                  />
                ))}
                {bills.length === 0 && <EmptyState text="No invoices yet" />}
              </div>
            </Panel>
          </section>
        </div>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#ded8c8] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  helper: string;
  tone?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="rounded-lg border border-[#ded8c8] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#6b7280]">{label}</p>
          <p className={tone === 'up' ? 'mt-2 text-3xl font-bold text-[#1f8f4d]' : tone === 'down' ? 'mt-2 text-3xl font-bold text-[#b42318]' : 'mt-2 text-3xl font-bold'}>
            {value}
          </p>
          <p className="mt-2 text-xs text-[#6b7280]">{helper}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#ded8c8] bg-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBlock({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  href: React.ComponentProps<typeof Link>['href'];
}) {
  return (
    <Link href={href} className="rounded-lg border border-[#ded8c8] bg-white p-4 hover:bg-[#f7f7f7]">
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-5 w-5" />
        <ArrowRight className="h-4 w-4" />
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-sm text-[#6b7280]">{label}</p>
    </Link>
  );
}

function FinanceLine({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#ded8c8] p-3">
      <span className="flex items-center gap-3 text-sm font-medium">
        <Icon className={tone === 'up' ? 'h-4 w-4 text-[#1f8f4d]' : tone === 'down' ? 'h-4 w-4 text-[#b42318]' : 'h-4 w-4'} />
        {label}
      </span>
      <span className={tone === 'up' ? 'font-bold text-[#1f8f4d]' : tone === 'down' ? 'font-bold text-[#b42318]' : 'font-bold'}>{value}</span>
    </div>
  );
}

function RecordRow({ title, meta, value, tone = 'neutral' }: { title: string; meta: string; value?: string; tone?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#ded8c8] px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-[#6b7280]">{meta}</p>
      </div>
      {value && <span className={tone === 'up' ? 'shrink-0 text-sm font-bold text-[#1f8f4d]' : tone === 'down' ? 'shrink-0 text-sm font-bold text-[#b42318]' : 'shrink-0 text-sm font-bold'}>{value}</span>}
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'up' | 'down' | 'neutral' }) {
  return (
    <span className={tone === 'up' ? 'rounded-full bg-[#e7f6ec] px-2 py-1 text-xs font-semibold text-[#1f8f4d]' : tone === 'down' ? 'rounded-full bg-[#fdecec] px-2 py-1 text-xs font-semibold text-[#b42318]' : 'rounded-full bg-[#f7f7f7] px-2 py-1 text-xs font-semibold'}>
      {children}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-[#ded8c8] p-4 text-center text-sm text-[#6b7280]">{text}</div>;
}
