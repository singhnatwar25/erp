'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard,
  FolderKanban, 
  Users,
  BarChart3,
  Plus,
  ArrowUpRight,
  Wallet,
  Calendar,
  Bell,
  MoreHorizontal,
  Filter,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  CheckSquare,
  Building2
} from 'lucide-react';

// Types
interface Project {
  id: string;
  tag: string;
  tagClass: string;
  name: string;
  tasks: number;
  budget: number;
  team: string[];
  extraMembers?: number;
  color: string;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  active?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'employee' | 'project' | 'transaction';
  title: string;
  description: string;
  date: string;
  amount?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return past.toLocaleDateString();
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalProjectBudget: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    newHires: 0,
    departments: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    doneTasks: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [departmentData, setDepartmentData] = useState<{name: string, count: number}[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
        setActivities(data.data.activities);
        setDepartmentData(data.data.departmentData);
        setRecentTasks(data.data.recentTasks || []);
        setRecentProjects(data.data.recentProjects || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/', active: activeTab === 'dashboard' },
    { label: 'Employees', icon: Users, href: '/employees', active: activeTab === 'employees' },
    { label: 'Projects', icon: FolderKanban, href: '/projects', active: activeTab === 'projects' },
    { label: 'Tasks', icon: CheckSquare, href: '/tasks', active: activeTab === 'tasks' },
    { label: 'Finance', icon: DollarSign, href: '/finance', active: activeTab === 'finance' },
    { label: 'Company', icon: Building2, href: '/company', active: activeTab === 'company' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191E2C] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#B9FF66] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#94A3B8]">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191E2C] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#1E2538] border-r border-white/5 z-50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-[#191E2C]" />
            </div>
            <span className="text-xl font-bold text-white">ERP</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href as React.ComponentProps<typeof Link>['href']}
                onClick={() => setActiveTab(item.label.toLowerCase())}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  item.active
                    ? 'bg-[#B9FF66] text-[#191E2C] font-medium'
                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <button className="w-full btn-lime flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Invite user</span>
          </button>
          <div className="flex items-center gap-3 px-2">
            <button className="w-10 h-10 rounded-xl bg-[#252B3D] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors border border-white/10">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B9FF66] to-[#4E956A] flex items-center justify-center text-[#191E2C] font-bold">
              JD
            </div>
            <span className="text-sm text-[#94A3B8]">John Doe</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-[#94A3B8]">Welcome back! Here&apos;s your overview.</p>
          </div>
          
          {/* Stats Summary */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="stat-display">
              <div className="stat-icon">
                <Wallet className="h-5 w-5 text-[#B9FF66]" />
              </div>
              <div>
                <p className="stat-value">{formatCurrency(stats.totalProjectBudget)}</p>
                <p className="stat-label">Total budget of all projects</p>
              </div>
            </div>
            <div className="trend-badge">
              <TrendingUp className="h-3 w-3" />
              +14% week
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="stat-display">
              <div className="stat-icon">
                <Calendar className="h-5 w-5 text-[#BC5FCF]" />
              </div>
              <div>
                <p className="stat-value">+{stats.projects}</p>
                <p className="stat-label">Total number of contracts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row - Colorful Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#4E956A] rounded-3xl p-5 h-[120px] flex flex-col justify-between text-white hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <span className="text-white/70 text-sm font-medium">New hires</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">+1</p>
              <p className="text-white/70 text-sm">this month</p>
            </div>
          </div>
          <div className="bg-[#3D55B6] rounded-3xl p-5 h-[120px] flex flex-col justify-between text-white hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <span className="text-white/70 text-sm font-medium">Total</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">1</p>
              <p className="text-white/70 text-sm">employees</p>
            </div>
          </div>
          <div className="bg-[#BC5FCF] rounded-3xl p-5 h-[120px] flex flex-col justify-between text-white hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <span className="text-white/70 text-sm font-medium">Active</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">3</p>
              <p className="text-white/70 text-sm">projects</p>
            </div>
          </div>
          <div className="bg-[#DC6F31] rounded-3xl p-5 h-[120px] flex flex-col justify-between text-white hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <span className="text-white/70 text-sm font-medium">Total</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold">$45,000</p>
              <p className="text-white/70 text-sm">revenue</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-dark p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/employees" className="h-[80px] flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-[#B9FF66]/10 transition-colors border-l-4 border-[#B9FF66]">
              <div className="w-10 h-10 rounded-lg bg-[#B9FF66]/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#B9FF66]" />
              </div>
              <div>
                <p className="text-white font-medium">Add Employee</p>
                <p className="text-sm text-[#64748B]">Create new employee record</p>
              </div>
            </Link>
            <Link href="/projects" className="h-[80px] flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-[#3D55B6]/10 transition-colors border-l-4 border-[#3D55B6]">
              <div className="w-10 h-10 rounded-lg bg-[#3D55B6]/20 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-[#3D55B6]" />
              </div>
              <div>
                <p className="text-white font-medium">New Project</p>
                <p className="text-sm text-[#64748B]">Start a new project</p>
              </div>
            </Link>
            <Link href="/finance" className="h-[80px] flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-[#DC6F31]/10 transition-colors border-l-4 border-[#DC6F31]">
              <div className="w-10 h-10 rounded-lg bg-[#DC6F31]/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#DC6F31]" />
              </div>
              <div>
                <p className="text-white font-medium">Add Transaction</p>
                <p className="text-sm text-[#64748B]">Record income or expense</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Projects - Colorful Cards */}
        {recentProjects.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Projects</h3>
              <Link href="/projects" className="text-sm text-[#B9FF66] hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project, index) => {
                const colorSchemes = [
                  { bg: 'bg-[#3D55B6]', light: 'bg-[#3D55B6]/20', text: 'text-[#8BA4FF]' },
                  { bg: 'bg-[#DC6F31]', light: 'bg-[#DC6F31]/20', text: 'text-[#FF9B6B]' },
                  { bg: 'bg-[#BC5FCF]', light: 'bg-[#BC5FCF]/20', text: 'text-[#E5A8F0]' },
                  { bg: 'bg-[#4E956A]', light: 'bg-[#4E956A]/20', text: 'text-[#7DD3A0]' },
                  { bg: 'bg-[#C55050]', light: 'bg-[#C55050]/20', text: 'text-[#FF9B9B]' },
                  { bg: 'bg-[#459BBE]', light: 'bg-[#459BBE]/20', text: 'text-[#7DD3F0]' },
                ];
                const colors = colorSchemes[index % colorSchemes.length];
                return (
                  <Link
                    key={project.id}
                    href={`/projects`}
                    className={`${colors.bg} rounded-3xl p-5 text-white hover:scale-[1.02] transition-transform cursor-pointer block`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-white/80 text-sm font-medium">#{project.category}</span>
                      <div className={`w-8 h-8 rounded-full ${colors.light} flex items-center justify-center`}>
                        <ArrowUpRight className={`h-4 w-4 ${colors.text}`} />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold mb-1">{project.name}</h4>
                    <p className="text-white/70 text-sm mb-4">Completed tasks: {project.tasksCompleted || 0}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{formatCurrency(project.budget)}</span>
                      <div className="flex items-center">
                        {project.team?.slice(0, 3).map((member: any, i: number) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center -ml-2 first:ml-0 text-xs font-medium"
                          >
                            {member.name?.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                        ))}
                        {project.extraMembers > 0 && (
                          <div className="w-8 h-8 rounded-full bg-black/30 border-2 border-white/30 flex items-center justify-center -ml-2 text-xs font-medium">
                            +{project.extraMembers}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Task Overview */}
        <div className="mt-8 card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Task Overview</h3>
            <Link href="/tasks" className="text-sm text-[#B9FF66] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[#1E2538] rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.totalTasks}</p>
              <p className="text-sm text-[#64748B]">Total Tasks</p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-[#64748B]">{stats.todoTasks}</p>
              <p className="text-sm text-[#64748B]">To Do</p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-[#B9FF66]">{stats.inProgressTasks}</p>
              <p className="text-sm text-[#64748B]">In Progress</p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-[#BC5FCF]">{stats.reviewTasks}</p>
              <p className="text-sm text-[#64748B]">Review</p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-[#4E956A]">{stats.doneTasks}</p>
              <p className="text-sm text-[#64748B]">Done</p>
            </div>
          </div>
          
          {/* Recent Tasks */}
          {recentTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Recent Tasks</h4>
              {recentTasks.map((task) => (
                <div key={task.id} className="bg-[#1E2538] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'done' ? 'bg-[#4E956A]' :
                      task.status === 'in_progress' ? 'bg-[#B9FF66]' :
                      task.status === 'review' ? 'bg-[#BC5FCF]' :
                      'bg-[#64748B]'
                    }`} />
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-xs text-[#64748B]">{task.project} • {task.assignedTo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'urgent' ? 'bg-[#C55050]/20 text-[#C55050]' :
                      task.priority === 'high' ? 'bg-[#DC6F31]/20 text-[#DC6F31]' :
                      task.priority === 'medium' ? 'bg-[#459BBE]/20 text-[#459BBE]' :
                      'bg-[#64748B]/20 text-[#64748B]'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-[#64748B]">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finance Summary */}
        <div className="mt-8 card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Finance Summary</h3>
            <Link href="/finance" className="text-sm text-[#B9FF66] hover:underline flex items-center gap-1">
              View Details <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1E2538] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-[#4E956A]" />
                <span className="text-sm text-[#64748B]">Income</span>
              </div>
              <p className="text-2xl font-bold text-[#4E956A]">{formatCurrency(stats.totalIncome)}</p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-[#C55050]" />
                <span className="text-sm text-[#64748B]">Expenses</span>
              </div>
              <p className="text-2xl font-bold text-[#C55050]">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-[#B9FF66]" />
                <span className="text-sm text-[#64748B]">Net Profit</span>
              </div>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-[#B9FF66]' : 'text-[#C55050]'}`}>
                {formatCurrency(stats.netProfit)}
              </p>
            </div>
            <div className="bg-[#1E2538] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="h-5 w-5 text-[#BC5FCF]" />
                <span className="text-sm text-[#64748B]">Project Budget</span>
              </div>
              <p className="text-2xl font-bold text-[#BC5FCF]">{formatCurrency(stats.totalProjectBudget)}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div className="mt-8 card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <span className="text-sm text-[#64748B]">Last 5 activities</span>
            </div>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'employee' ? 'bg-[#BC5FCF]/20' :
                    activity.type === 'project' ? 'bg-[#3D55B6]/20' :
                    'bg-[#4E956A]/20'
                  }`}>
                    {activity.type === 'employee' ? <Users className="h-5 w-5 text-[#BC5FCF]" /> :
                     activity.type === 'project' ? <FolderKanban className="h-5 w-5 text-[#3D55B6]" /> :
                     <DollarSign className="h-5 w-5 text-[#4E956A]" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{activity.title}</p>
                    <p className="text-sm text-[#64748B]">{activity.description}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">{formatTimeAgo(activity.date)}</p>
                  </div>
                  {activity.amount && (
                    <span className={`font-bold ${activity.amount > 0 ? 'text-[#4E956A]' : 'text-[#C55050]'}`}>
                      {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department Progress */}
        <div className="mt-8 card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Department Overview</h3>
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <PieChart className="h-4 w-4" />
              Distribution
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {departmentData.slice(0, 5).map((dept, i) => {
              const colors = ['bg-[#3D55B6]', 'bg-[#BC5FCF]', 'bg-[#DC6F31]', 'bg-[#4E956A]', 'bg-[#459BBE]'];
              const maxCount = Math.max(...departmentData.map(d => d.count), 1);
              return (
                <div key={dept.name} className="bg-[#1E2538] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{dept.name}</span>
                    <span className="text-lg font-bold text-white">{dept.count}</span>
                  </div>
                  <div className="h-2 bg-[#252B3D] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[i]} rounded-full transition-all duration-1000`}
                      style={{ width: `${(dept.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
