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

// Projects Data with Vibrant Colors
const projects: Project[] = [
  {
    id: '1',
    tag: 'Finance',
    tagClass: 'tag-finance',
    name: 'Decem App',
    tasks: 988,
    budget: 391991,
    team: ['JD', 'AS', 'MK'],
    extraMembers: 12,
    color: 'project-card-blue'
  },
  {
    id: '2',
    tag: 'Education',
    tagClass: 'tag-education',
    name: 'SkyLux',
    tasks: 12,
    budget: 51792,
    team: ['RK', 'PL', 'TM'],
    color: 'project-card-orange'
  },
  {
    id: '3',
    tag: 'Finance',
    tagClass: 'tag-finance',
    name: 'DushMash',
    tasks: 32,
    budget: 31955,
    team: ['AS', 'JD'],
    color: 'project-card-purple'
  },
  {
    id: '4',
    tag: 'Healthcare',
    tagClass: 'tag-healthcare',
    name: 'Biofarm',
    tasks: 19,
    budget: 11538,
    team: ['MK', 'RK'],
    extraMembers: 4,
    color: 'project-card-green'
  },
  {
    id: '5',
    tag: 'Travel',
    tagClass: 'tag-travel',
    name: 'PAD move',
    tasks: 35,
    budget: 21688,
    team: ['PL', 'TM', 'AS'],
    extraMembers: 2,
    color: 'project-card-coral'
  },
  {
    id: '6',
    tag: 'Logistics',
    tagClass: 'tag-logistics',
    name: 'Getstats',
    tasks: 88,
    budget: 92581,
    team: ['JD', 'MK', 'RK'],
    color: 'project-card-sky'
  },
];

// Calendar Data
const calendarDays = [
  { day: 1, hasEvent: false },
  { day: 2, hasEvent: true, members: ['JD', 'AS'] },
  { day: 3, hasEvent: false },
  { day: 4, hasEvent: true, members: ['MK'], active: true },
  { day: 5, hasEvent: false },
  { day: 6, hasEvent: false },
  { day: 7, hasEvent: false },
  { day: 8, hasEvent: false },
  { day: 9, hasEvent: true, members: ['RK', 'PL'] },
  { day: 10, hasEvent: true, members: ['TM'] },
  { day: 11, hasEvent: true, members: ['AS', 'JD', 'MK'] },
  { day: 12, hasEvent: false },
  { day: 13, hasEvent: false },
  { day: 14, hasEvent: true, members: ['RK'] },
  { day: 15, hasEvent: true, members: ['PL', 'TM'] },
  { day: 16, hasEvent: false },
  { day: 17, hasEvent: true, members: ['JD'] },
  { day: 18, hasEvent: false },
  { day: 19, hasEvent: false },
  { day: 20, hasEvent: true, members: ['AS', 'RK'] },
  { day: 21, hasEvent: false },
  { day: 22, hasEvent: false },
  { day: 23, hasEvent: true, members: ['MK', 'PL'], active: true },
  { day: 24, hasEvent: true, members: ['TM', 'JD', 'AS'] },
  { day: 25, hasEvent: false },
  { day: 26, hasEvent: false },
  { day: 27, hasEvent: false },
  { day: 28, hasEvent: true, members: ['RK'] },
  { day: 29, hasEvent: true, members: ['PL', 'TM'] },
  { day: 30, hasEvent: true, members: ['JD', 'MK'] },
];

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
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [departmentData, setDepartmentData] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
        setActivities(data.data.activities);
        setDepartmentData(data.data.departmentData);
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
    <div className="min-h-screen bg-[#191E2C]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#191E2C]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-[#191E2C]" />
              </div>
              <span className="text-xl font-bold text-white">Nexus</span>
            </div>

            {/* Nav Pills */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href as React.ComponentProps<typeof Link>['href']}
                    onClick={() => setActiveTab(item.label.toLowerCase())}
                    className={item.active ? 'nav-pill-active' : 'nav-pill'}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="btn-lime">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Invite user</span>
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#252B3D] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors border border-white/10">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B9FF66] to-[#4E956A] flex items-center justify-center text-[#191E2C] font-bold">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
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

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Projects</h2>
              <span className="px-3 py-1 rounded-full bg-[#252B3D] text-[#94A3B8] text-sm font-medium border border-white/10">
                {String(stats.projects).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-[#252B3D] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors border border-white/10">
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#252B3D] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors border border-white/10">
                <Filter className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center text-[#191E2C] hover:bg-[#a8f055] transition-colors">
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {/* Add New Project Card */}
            <Link href="/projects" className="project-card bg-[#252B3D] border border-dashed border-white/20 flex flex-col items-center justify-center min-h-[180px] hover:border-[#B9FF66]/50 hover:bg-[#2D3549] group">
              <div className="w-12 h-12 rounded-full bg-[#B9FF66]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-[#B9FF66]" />
              </div>
              <span className="text-[#94A3B8] font-medium">Add new project</span>
            </Link>

            {/* Project Cards */}
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href="/projects"
                className={project.color}
              >
                {/* Tag */}
                <span className={`${project.tagClass} mb-3`}>#{project.tag}</span>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Tasks */}
                <p className="text-white/70 text-sm mb-4">
                  Completed tasks: {project.tasks.toLocaleString()}
                </p>

                {/* Budget */}
                <p className="text-2xl font-bold mb-4">{formatCurrency(project.budget)}</p>

                {/* Team */}
                <div className="flex items-center justify-between">
                  <div className="avatar-group">
                    {project.team.map((member, i) => (
                      <div 
                        key={i} 
                        className="avatar"
                        style={{ backgroundColor: ['#3D55B6', '#DC6F31', '#BC5FCF', '#4E956A', '#C55050', '#459BBE'][i % 6] }}
                      >
                        {member}
                      </div>
                    ))}
                    {project.extraMembers && (
                      <div className="avatar bg-white/20 text-white">
                        +{project.extraMembers}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section: Calendar & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Calendar</h3>
              <span className="text-[#64748B]">{'{April}'}</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs text-[#64748B] font-medium py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`relative ${
                    day.active 
                      ? 'calendar-day-active' 
                      : day.hasEvent 
                        ? 'calendar-day-has-event' 
                        : 'calendar-day'
                  }`}
                >
                  {day.day}
                  {day.hasEvent && day.members && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex -space-x-1">
                      {day.members.slice(0, 2).map((m, j) => (
                        <div 
                          key={j} 
                          className="w-4 h-4 rounded-full border border-[#252B3D] bg-[#3D55B6] text-[8px] flex items-center justify-center text-white"
                        >
                          {m[0]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#B9FF66]/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#B9FF66]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">+{stats.newHires}</p>
                <p className="text-sm text-[#64748B]">New hires this month</p>
              </div>
            </div>
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#BC5FCF]/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#BC5FCF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.employees}</p>
                <p className="text-sm text-[#64748B]">Total employees</p>
              </div>
            </div>
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#459BBE]/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-[#459BBE]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
                <p className="text-sm text-[#64748B]">Active projects</p>
              </div>
            </div>
            <div className="card-dark p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#DC6F31]/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#DC6F31]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalIncome)}</p>
                <p className="text-sm text-[#64748B]">Total revenue</p>
              </div>
            </div>
          </div>
        </div>

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
