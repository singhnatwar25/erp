'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Users,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Finance', href: '/finance', icon: CircleDollarSign },
  { label: 'Bills', href: '/bills', icon: FileText },
  { label: 'Company', href: '/company', icon: Building2 },
] as const;

export function ERPShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1f2937] lg:flex">
      <aside className={`lg:fixed lg:left-0 lg:top-0 lg:h-full bg-white border-r border-[#ded8c8] transition-all ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className="p-5 border-b border-[#ded8c8]">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#1f2937] text-[#fffdf7] grid place-items-center">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-lg font-bold">Office ERP</p>
                  <p className="text-xs text-[#6b7280]">Company management</p>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ded8c8] hover:bg-[#f7f7f7] lg:flex"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={
                  active
                    ? `flex items-center gap-3 rounded-lg bg-[#1f2937] px-3 py-2.5 text-sm font-semibold text-[#fffdf7] ${collapsed ? 'justify-center' : ''}`
                    : `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#f7f7f7] ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={`w-full transition-all ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className="sticky top-0 z-30 border-b border-[#ded8c8] bg-white/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-sm text-[#6b7280]">{description}</p>}
            </div>
            {action}
          </div>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#ded8c8] bg-white p-5">
      {title && <h2 className="mb-4 text-base font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-[#ded8c8] p-8 text-center text-sm text-[#6b7280]">{text}</div>;
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'up' | 'down' | 'neutral' }) {
  const classes =
    tone === 'up'
      ? 'bg-[#e7f6ec] text-[#1f8f4d]'
      : tone === 'down'
        ? 'bg-[#fdecec] text-[#b42318]'
        : 'bg-[#f7f7f7] text-[#1f2937]';

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{children}</span>;
}

export function money(amount = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
