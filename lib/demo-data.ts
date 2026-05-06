import { generateId } from '@/lib/utils';

type DemoRecord = {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

type EmployeeRecord = DemoRecord & {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
  joinDate: string;
  salary: number;
};

type ProjectRecord = DemoRecord & {
  projectId: string;
  name: string;
  description: string;
  client: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  assignedEmployees: string[];
  projectManager: string;
  technologies: string[];
};

type TimeEntry = {
  date: string;
  hours: number;
  description?: string;
};

type TaskRecord = DemoRecord & {
  taskId: string;
  title: string;
  description: string;
  project: Pick<ProjectRecord, '_id' | 'name' | 'projectId'>;
  assignedTo: Pick<EmployeeRecord, '_id' | 'firstName' | 'lastName'>;
  assignedBy?: Pick<EmployeeRecord, '_id' | 'firstName' | 'lastName'>;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours: number;
  timeEntries: TimeEntry[];
  tags: string[];
};

type TransactionRecord = DemoRecord & {
  transactionId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  status: string;
};

type BudgetRecord = DemoRecord & {
  budgetId: string;
  department: string;
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  categories: Array<{ name: string; allocated: number; spent: number }>;
};

type ExtraRecord = DemoRecord & Record<string, any>;

const now = new Date('2026-05-04T12:00:00.000Z');

function daysAgo(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

let idCounter = 100;

function nextId() {
  idCounter += 1;
  return `demo-${idCounter}`;
}

function publicId(prefix: string) {
  return `${prefix}-${generateId().substring(0, 8).toUpperCase()}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function latestFirst<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function byDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function employeeSummary(employee: EmployeeRecord) {
  return {
    _id: employee._id,
    firstName: employee.firstName,
    lastName: employee.lastName,
  };
}

function projectSummary(project: ProjectRecord) {
  return {
    _id: project._id,
    name: project.name,
    projectId: project.projectId,
  };
}

let employees: EmployeeRecord[] = [
  {
    _id: 'demo-employee-1',
    employeeId: 'EMP-DEMO001',
    firstName: 'Aarav',
    lastName: 'Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+1 555 0101',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'active',
    joinDate: daysAgo(210),
    salary: 118000,
    createdAt: daysAgo(210),
    updatedAt: daysAgo(10),
  },
  {
    _id: 'demo-employee-2',
    employeeId: 'EMP-DEMO002',
    firstName: 'Priya',
    lastName: 'Shah',
    email: 'priya.shah@example.com',
    phone: '+1 555 0102',
    department: 'Sales',
    position: 'Account Executive',
    status: 'active',
    joinDate: daysAgo(42),
    salary: 92000,
    createdAt: daysAgo(42),
    updatedAt: daysAgo(5),
  },
  {
    _id: 'demo-employee-3',
    employeeId: 'EMP-DEMO003',
    firstName: 'Marcus',
    lastName: 'Lee',
    email: 'marcus.lee@example.com',
    phone: '+1 555 0103',
    department: 'Finance',
    position: 'Finance Manager',
    status: 'active',
    joinDate: daysAgo(18),
    salary: 104000,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(2),
  },
];

let projects: ProjectRecord[] = [
  {
    _id: 'demo-project-1',
    projectId: 'PRJ-DEMO001',
    name: 'Atlas CRM Portal',
    description: 'Customer portal and reporting workflow for a SaaS client.',
    client: 'Atlas Labs',
    status: 'in_progress',
    priority: 'high',
    startDate: daysAgo(55),
    endDate: daysAgo(-40),
    budget: 185000,
    progress: 62,
    assignedEmployees: ['demo-employee-1', 'demo-employee-2'],
    projectManager: 'Aarav Mehta',
    technologies: ['Next.js', 'MongoDB', 'Tailwind CSS'],
    createdAt: daysAgo(55),
    updatedAt: daysAgo(1),
  },
  {
    _id: 'demo-project-2',
    projectId: 'PRJ-DEMO002',
    name: 'Finance Automation',
    description: 'Automated invoice capture and department budget reporting.',
    client: 'Northwind Finance',
    status: 'planning',
    priority: 'medium',
    startDate: daysAgo(8),
    endDate: daysAgo(-80),
    budget: 96000,
    progress: 18,
    assignedEmployees: ['demo-employee-1', 'demo-employee-3'],
    projectManager: 'Marcus Lee',
    technologies: ['TypeScript', 'Node.js'],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
  },
];

let tasks: TaskRecord[] = [
  {
    _id: 'demo-task-1',
    taskId: 'TSK-DEMO001',
    title: 'Build customer activity dashboard',
    description: 'Create the core dashboard cards and recent activity table.',
    project: projectSummary(projects[0]),
    assignedTo: employeeSummary(employees[0]),
    assignedBy: employeeSummary(employees[2]),
    status: 'in_progress',
    priority: 'high',
    startDate: daysAgo(9),
    dueDate: daysAgo(-7),
    estimatedHours: 24,
    actualHours: 9,
    timeEntries: [
      { date: daysAgo(3), hours: 4, description: 'Dashboard layout' },
      { date: daysAgo(1), hours: 5, description: 'API integration' },
    ],
    tags: ['frontend', 'dashboard'],
    createdAt: daysAgo(9),
    updatedAt: daysAgo(1),
  },
  {
    _id: 'demo-task-2',
    taskId: 'TSK-DEMO002',
    title: 'Review invoice category model',
    description: 'Confirm required fields for automated budget allocation.',
    project: projectSummary(projects[1]),
    assignedTo: employeeSummary(employees[2]),
    assignedBy: employeeSummary(employees[0]),
    status: 'todo',
    priority: 'medium',
    startDate: daysAgo(2),
    dueDate: daysAgo(-12),
    estimatedHours: 10,
    actualHours: 0,
    timeEntries: [],
    tags: ['finance'],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
];

let transactions: TransactionRecord[] = [
  {
    _id: 'demo-transaction-1',
    transactionId: 'TRX-DEMO001',
    type: 'income',
    category: 'Revenue',
    amount: 45000,
    description: 'Atlas milestone payment',
    date: daysAgo(6),
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    _id: 'demo-transaction-2',
    transactionId: 'TRX-DEMO002',
    type: 'expense',
    category: 'Software',
    amount: 4200,
    description: 'Cloud and developer tooling',
    date: daysAgo(4),
    paymentMethod: 'credit_card',
    status: 'completed',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    _id: 'demo-transaction-3',
    transactionId: 'TRX-DEMO003',
    type: 'expense',
    category: 'Salary',
    amount: 28000,
    description: 'May payroll run',
    date: daysAgo(1),
    paymentMethod: 'bank_transfer',
    status: 'pending',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

let budgets: BudgetRecord[] = [
  {
    _id: 'demo-budget-1',
    budgetId: 'BUD-DEMO001',
    department: 'Engineering',
    fiscalYear: 2026,
    allocatedAmount: 250000,
    spentAmount: 72000,
    remainingAmount: 178000,
    categories: [
      { name: 'Salary', allocated: 180000, spent: 52000 },
      { name: 'Software', allocated: 70000, spent: 20000 },
    ],
    createdAt: daysAgo(35),
    updatedAt: daysAgo(4),
  },
  {
    _id: 'demo-budget-2',
    budgetId: 'BUD-DEMO002',
    department: 'Sales',
    fiscalYear: 2026,
    allocatedAmount: 140000,
    spentAmount: 36000,
    remainingAmount: 104000,
    categories: [
      { name: 'Marketing', allocated: 90000, spent: 24000 },
      { name: 'Travel', allocated: 50000, spent: 12000 },
    ],
    createdAt: daysAgo(35),
    updatedAt: daysAgo(5),
  },
];

let extras: Record<string, ExtraRecord[]> = {
  clients: [
    {
      _id: 'demo-client-1',
      clientId: 'CLI-DEMO001',
      companyName: 'Atlas Labs',
      contactPerson: {
        firstName: 'Nina',
        lastName: 'Patel',
        email: 'nina.patel@atlas.example.com',
        phone: '+1 555 0201',
        designation: 'Operations Director',
      },
      industry: 'SaaS',
      website: 'https://atlas.example.com',
      status: 'active',
      leadSource: 'referral',
      assignedTo: employeeSummary(employees[1]),
      notes: 'Demo client used when MongoDB is unavailable.',
      createdAt: daysAgo(70),
      updatedAt: daysAgo(4),
    },
  ],
  deals: [
    {
      _id: 'demo-deal-1',
      dealId: 'DL-DEMO001',
      title: 'Atlas support expansion',
      client: {
        _id: 'demo-client-1',
        companyName: 'Atlas Labs',
        contactPerson: { firstName: 'Nina', lastName: 'Patel' },
      },
      value: 78000,
      currency: 'USD',
      stage: 'proposal',
      probability: 65,
      expectedCloseDate: daysAgo(-24),
      assignedTo: employeeSummary(employees[1]),
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
    },
  ],
  assets: [
    {
      _id: 'demo-asset-1',
      assetId: 'AST-DEMO001',
      name: 'MacBook Pro 14',
      type: 'laptop',
      brand: 'Apple',
      model: 'M3 Pro',
      serialNumber: 'DEMO-AST-001',
      purchaseDate: daysAgo(120),
      purchasePrice: 2499,
      vendor: 'Apple Business',
      status: 'active',
      assignedTo: employeeSummary(employees[0]),
      location: 'Engineering',
      createdAt: daysAgo(120),
      updatedAt: daysAgo(9),
    },
  ],
  invoices: [
    {
      _id: 'demo-invoice-1',
      invoiceId: 'INV-DEMO001',
      client: {
        _id: 'demo-client-1',
        companyName: 'Atlas Labs',
        contactPerson: { firstName: 'Nina', lastName: 'Patel' },
      },
      project: projectSummary(projects[0]),
      invoiceNumber: 'INV-2026-001',
      issueDate: daysAgo(6),
      dueDate: daysAgo(-24),
      status: 'sent',
      totalAmount: 45000,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(6),
    },
  ],
  communications: [
    {
      _id: 'demo-communication-1',
      client: {
        _id: 'demo-client-1',
        companyName: 'Atlas Labs',
        contactPerson: { firstName: 'Nina', lastName: 'Patel' },
      },
      employee: employeeSummary(employees[1]),
      type: 'email',
      subject: 'Project milestone review',
      notes: 'Shared sprint progress and next delivery dates.',
      date: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ],
  attendance: [
    {
      _id: 'demo-attendance-1',
      employee: { ...employeeSummary(employees[0]), employeeId: employees[0].employeeId },
      date: daysAgo(1),
      status: 'present',
      checkIn: daysAgo(1),
      workingHours: 8,
      notes: 'Demo attendance entry.',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ],
  leaves: [
    {
      _id: 'demo-leave-1',
      leaveId: 'LEV-DEMO001',
      employee: {
        ...employeeSummary(employees[2]),
        department: employees[2].department,
      },
      leaveType: 'paid',
      startDate: daysAgo(-10),
      endDate: daysAgo(-12),
      totalDays: 3,
      reason: 'Planned personal leave',
      status: 'pending',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
  ],
};

declare global {
  var erpDemoData:
    | {
        employees: EmployeeRecord[];
        projects: ProjectRecord[];
        tasks: TaskRecord[];
        transactions: TransactionRecord[];
        budgets: BudgetRecord[];
        extras: Record<string, ExtraRecord[]>;
      }
    | undefined;
}

if (!globalThis.erpDemoData) {
  globalThis.erpDemoData = {
    employees,
    projects,
    tasks,
    transactions,
    budgets,
    extras,
  };
}

if (!globalThis.erpDemoData.extras) {
  globalThis.erpDemoData.extras = extras;
}

employees = globalThis.erpDemoData.employees;
projects = globalThis.erpDemoData.projects;
tasks = globalThis.erpDemoData.tasks;
transactions = globalThis.erpDemoData.transactions;
budgets = globalThis.erpDemoData.budgets;
extras = globalThis.erpDemoData.extras;

function updateTimestamp<T extends DemoRecord>(record: T): T {
  return { ...record, updatedAt: new Date().toISOString() };
}

function normalizeTask(input: any): TaskRecord {
  const project =
    projects.find((item) => item._id === input.project || item._id === input.project?._id) ??
    projects[0];
  const assignedTo =
    employees.find((item) => item._id === input.assignedTo || item._id === input.assignedTo?._id) ??
    employees[0];
  const assignedBy =
    employees.find((item) => item._id === input.assignedBy || item._id === input.assignedBy?._id) ??
    employees[2];

  return {
    _id: nextId(),
    taskId: publicId('TSK'),
    title: input.title,
    description: input.description ?? '',
    project: projectSummary(project),
    assignedTo: employeeSummary(assignedTo),
    assignedBy: employeeSummary(assignedBy),
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    startDate: input.startDate,
    dueDate: input.dueDate ?? new Date().toISOString(),
    completedDate: input.completedDate,
    estimatedHours: Number(input.estimatedHours ?? 0),
    actualHours: Number(input.actualHours ?? 0),
    timeEntries: input.timeEntries ?? [],
    tags: input.tags ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function extraFieldValue(record: ExtraRecord, key: string) {
  const value = record[key];
  if (value && typeof value === 'object' && '_id' in value) {
    return value._id;
  }
  return value;
}

function extraIdField(collection: string) {
  const fields: Record<string, [string, string]> = {
    clients: ['clientId', 'CLI'],
    deals: ['dealId', 'DL'],
    assets: ['assetId', 'AST'],
    invoices: ['invoiceId', 'INV'],
    leaves: ['leaveId', 'LEV'],
  };

  return fields[collection];
}

export const demoData = {
  listEmployees(filters: { department?: string | null; status?: string | null }) {
    return clone(
      latestFirst(
        employees.filter((employee) => {
          if (filters.department && employee.department !== filters.department) return false;
          if (filters.status && employee.status !== filters.status) return false;
          return true;
        })
      )
    );
  },

  getEmployee(id: string) {
    return clone(employees.find((employee) => employee._id === id) ?? null);
  },

  createEmployee(input: any) {
    const employee: EmployeeRecord = {
      _id: nextId(),
      employeeId: publicId('EMP'),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      department: input.department,
      position: input.position,
      status: input.status ?? 'active',
      joinDate: input.joinDate ?? new Date().toISOString(),
      salary: Number(input.salary ?? 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    employees.unshift(employee);
    return clone(employee);
  },

  updateEmployee(id: string, input: any) {
    const existing = employees.find((employee) => employee._id === id);
    if (!existing) return null;
    const updated = updateTimestamp({ ...existing, ...input, salary: Number(input.salary ?? existing.salary) });
    employees.splice(employees.findIndex((employee) => employee._id === id), 1, updated);
    return clone(updated);
  },

  deleteEmployee(id: string) {
    const existing = employees.find((employee) => employee._id === id);
    if (!existing) return null;
    employees.splice(employees.findIndex((employee) => employee._id === id), 1);
    return clone(existing);
  },

  listProjects(filters: { status?: string | null; priority?: string | null }) {
    return clone(
      latestFirst(
        projects.filter((project) => {
          if (filters.status && project.status !== filters.status) return false;
          if (filters.priority && project.priority !== filters.priority) return false;
          return true;
        })
      )
    );
  },

  getProject(id: string) {
    return clone(projects.find((project) => project._id === id) ?? null);
  },

  createProject(input: any) {
    const project: ProjectRecord = {
      _id: nextId(),
      projectId: publicId('PRJ'),
      name: input.name,
      description: input.description ?? '',
      client: input.client,
      status: input.status ?? 'planning',
      priority: input.priority ?? 'medium',
      startDate: input.startDate ?? new Date().toISOString(),
      endDate: input.endDate ?? new Date().toISOString(),
      budget: Number(input.budget ?? 0),
      progress: Number(input.progress ?? 0),
      assignedEmployees: input.assignedEmployees ?? [],
      projectManager: input.projectManager ?? '',
      technologies: input.technologies ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(project);
    return clone(project);
  },

  updateProject(id: string, input: any) {
    const existing = projects.find((project) => project._id === id);
    if (!existing) return null;
    const updated = updateTimestamp({
      ...existing,
      ...input,
      budget: Number(input.budget ?? existing.budget),
      progress: Number(input.progress ?? existing.progress),
    });
    projects.splice(projects.findIndex((project) => project._id === id), 1, updated);
    return clone(updated);
  },

  deleteProject(id: string) {
    const existing = projects.find((project) => project._id === id);
    if (!existing) return null;
    projects.splice(projects.findIndex((project) => project._id === id), 1);
    return clone(existing);
  },

  listTasks(filters: { project?: string | null; assignedTo?: string | null; status?: string | null }) {
    return clone(
      latestFirst(
        tasks.filter((task) => {
          if (filters.project && task.project._id !== filters.project) return false;
          if (filters.assignedTo && task.assignedTo._id !== filters.assignedTo) return false;
          if (filters.status && task.status !== filters.status) return false;
          return true;
        })
      )
    );
  },

  getTask(id: string) {
    return clone(tasks.find((task) => task._id === id) ?? null);
  },

  createTask(input: any) {
    const task = normalizeTask(input);
    tasks.unshift(task);
    return clone(task);
  },

  updateTask(id: string, input: any) {
    const existing = tasks.find((task) => task._id === id);
    if (!existing) return null;
    const normalized = normalizeTask({ ...existing, ...input });
    const updated = updateTimestamp({
      ...normalized,
      _id: existing._id,
      taskId: existing.taskId,
      createdAt: existing.createdAt,
    });
    tasks.splice(tasks.findIndex((task) => task._id === id), 1, updated);
    return clone(updated);
  },

  deleteTask(id: string) {
    const existing = tasks.find((task) => task._id === id);
    if (!existing) return null;
    tasks.splice(tasks.findIndex((task) => task._id === id), 1);
    return clone(existing);
  },

  addTimeEntry(input: { taskId: string; hours: number; description?: string; date?: string }) {
    const existing = tasks.find((task) => task._id === input.taskId);
    if (!existing) return null;
    const timeEntry = {
      date: input.date ?? new Date().toISOString(),
      hours: Number(input.hours ?? 0),
      description: input.description,
    };
    const timeEntries = [...existing.timeEntries, timeEntry];
    const updated = updateTimestamp({
      ...existing,
      timeEntries,
      actualHours: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
    });
    tasks.splice(tasks.findIndex((task) => task._id === input.taskId), 1, updated);
    return clone(updated);
  },

  getTimeReport(filters: {
    employeeId?: string | null;
    projectId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }) {
    const filteredTasks = this.listTasks({
      assignedTo: filters.employeeId,
      project: filters.projectId,
    });
    let totalHours = 0;
    const timeByEmployee: Record<string, number> = {};
    const timeByProject: Record<string, number> = {};

    filteredTasks.forEach((task) => {
      task.timeEntries.forEach((entry: TimeEntry) => {
        const entryDate = new Date(entry.date);
        if (filters.startDate && entryDate < new Date(filters.startDate)) return;
        if (filters.endDate && entryDate > new Date(filters.endDate)) return;

        totalHours += entry.hours;
        timeByEmployee[task.assignedTo._id] = (timeByEmployee[task.assignedTo._id] ?? 0) + entry.hours;
        timeByProject[task.project._id] = (timeByProject[task.project._id] ?? 0) + entry.hours;
      });
    });

    return clone({
      totalHours,
      timeByEmployee,
      timeByProject,
      tasks: filteredTasks,
    });
  },

  listTransactions(filters: { type?: string | null; status?: string | null; category?: string | null }) {
    return clone(
      byDateDesc(
        transactions.filter((transaction) => {
          if (filters.type && transaction.type !== filters.type) return false;
          if (filters.status && transaction.status !== filters.status) return false;
          if (filters.category && transaction.category !== filters.category) return false;
          return true;
        })
      )
    );
  },

  getTransaction(id: string) {
    return clone(transactions.find((transaction) => transaction._id === id) ?? null);
  },

  createTransaction(input: any) {
    const transaction: TransactionRecord = {
      _id: nextId(),
      transactionId: publicId('TRX'),
      type: input.type,
      category: input.category,
      amount: Number(input.amount ?? 0),
      description: input.description ?? '',
      date: input.date ?? new Date().toISOString(),
      paymentMethod: input.paymentMethod ?? 'bank_transfer',
      status: input.status ?? 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.unshift(transaction);
    return clone(transaction);
  },

  updateTransaction(id: string, input: any) {
    const existing = transactions.find((transaction) => transaction._id === id);
    if (!existing) return null;
    const updated = updateTimestamp({
      ...existing,
      ...input,
      amount: Number(input.amount ?? existing.amount),
    });
    transactions.splice(transactions.findIndex((transaction) => transaction._id === id), 1, updated);
    return clone(updated);
  },

  deleteTransaction(id: string) {
    const existing = transactions.find((transaction) => transaction._id === id);
    if (!existing) return null;
    transactions.splice(transactions.findIndex((transaction) => transaction._id === id), 1);
    return clone(existing);
  },

  listBudgets(filters: { department?: string | null; fiscalYear?: string | null }) {
    return clone(
      latestFirst(
        budgets.filter((budget) => {
          if (filters.department && budget.department !== filters.department) return false;
          if (filters.fiscalYear && budget.fiscalYear !== Number(filters.fiscalYear)) return false;
          return true;
        })
      )
    );
  },

  getBudget(id: string) {
    return clone(budgets.find((budget) => budget._id === id) ?? null);
  },

  createBudget(input: any) {
    const allocatedAmount = Number(input.allocatedAmount ?? 0);
    const spentAmount = Number(input.spentAmount ?? 0);
    const budget: BudgetRecord = {
      _id: nextId(),
      budgetId: publicId('BUD'),
      department: input.department,
      fiscalYear: Number(input.fiscalYear ?? new Date().getFullYear()),
      allocatedAmount,
      spentAmount,
      remainingAmount: Number(input.remainingAmount ?? allocatedAmount - spentAmount),
      categories: (input.categories ?? []).map((category: any) => ({
        name: category.name,
        allocated: Number(category.allocated ?? 0),
        spent: Number(category.spent ?? 0),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    budgets.unshift(budget);
    return clone(budget);
  },

  updateBudget(id: string, input: any) {
    const existing = budgets.find((budget) => budget._id === id);
    if (!existing) return null;
    const allocatedAmount = Number(input.allocatedAmount ?? existing.allocatedAmount);
    const spentAmount = Number(input.spentAmount ?? existing.spentAmount);
    const updated = updateTimestamp({
      ...existing,
      ...input,
      allocatedAmount,
      spentAmount,
      remainingAmount: Number(input.remainingAmount ?? allocatedAmount - spentAmount),
    });
    budgets.splice(budgets.findIndex((budget) => budget._id === id), 1, updated);
    return clone(updated);
  },

  deleteBudget(id: string) {
    const existing = budgets.find((budget) => budget._id === id);
    if (!existing) return null;
    budgets.splice(budgets.findIndex((budget) => budget._id === id), 1);
    return clone(existing);
  },

  financeDashboard() {
    const completedTransactions = transactions.filter((transaction) => transaction.status === 'completed');
    const totalIncome = completedTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpenses = completedTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const budgetSummary = budgets.reduce(
      (summary, budget) => ({
        totalAllocated: summary.totalAllocated + budget.allocatedAmount,
        totalSpent: summary.totalSpent + budget.spentAmount,
        totalRemaining: summary.totalRemaining + budget.remainingAmount,
      }),
      { totalAllocated: 0, totalSpent: 0, totalRemaining: 0 }
    );

    return clone({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
      },
      recentTransactions: latestFirst(transactions).slice(0, 5),
      categoryData: [],
      monthlyData: [],
      budgetSummary,
    });
  },

  dashboard() {
    const activeEmployees = employees.filter((employee) => employee.status === 'active');
    const departments = new Set(employees.map((employee) => employee.department));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalProjectBudget = projects.reduce((sum, project) => sum + project.budget, 0);
    const finance = this.financeDashboard();
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);

    const activities = [
      ...employees.slice(0, 3).map((employee) => ({
        id: employee._id,
        type: 'employee' as const,
        title: 'New Employee Joined',
        description: `${employee.firstName} ${employee.lastName} joined ${employee.department}`,
        date: employee.createdAt,
      })),
      ...projects.slice(0, 3).map((project) => ({
        id: project._id,
        type: 'project' as const,
        title: project.status === 'completed' ? 'Project Completed' : 'New Project Started',
        description: `${project.name} ${project.status === 'completed' ? 'delivered' : `for ${project.client}`}`,
        date: project.createdAt,
      })),
      ...transactions.slice(0, 3).map((transaction) => ({
        id: transaction._id,
        type: 'transaction' as const,
        title: transaction.type === 'income' ? 'Payment Received' : 'Expense Recorded',
        description: `${transaction.description} (${transaction.category})`,
        date: transaction.createdAt,
        amount: transaction.type === 'income' ? transaction.amount : -transaction.amount,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const departmentData = Array.from(departments)
      .map((department) => ({
        name: department,
        count: activeEmployees.filter((employee) => employee.department === department).length,
      }))
      .filter((department) => department.count > 0);

    return clone({
      stats: {
        employees: employees.length,
        activeEmployees: activeEmployees.length,
        newHires: employees.filter((employee) => new Date(employee.joinDate) >= thirtyDaysAgo).length,
        departments: departments.size,
        projects: projects.length,
        activeProjects: projects.filter((project) => project.status === 'in_progress').length,
        completedProjects: projects.filter((project) => project.status === 'completed').length,
        planningProjects: projects.filter((project) => project.status === 'planning').length,
        totalProjectBudget,
        totalBudget,
        totalIncome: finance.summary.totalIncome,
        totalExpenses: finance.summary.totalExpenses,
        netProfit: finance.summary.netProfit,
      },
      activities,
      departmentData,
    });
  },

  listCollection(collection: string, filters: Record<string, string | null | undefined> = {}) {
    const records = extras[collection] ?? [];
    return clone(
      latestFirst(
        records.filter((record) =>
          Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            return String(extraFieldValue(record, key)) === String(value);
          })
        )
      )
    );
  },

  getCollectionItem(collection: string, id: string) {
    return clone((extras[collection] ?? []).find((record) => record._id === id) ?? null);
  },

  createCollectionItem(collection: string, input: Record<string, any>) {
    if (!extras[collection]) {
      extras[collection] = [];
    }

    const idField = extraIdField(collection);
    const record: ExtraRecord = {
      _id: nextId(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (idField && !record[idField[0]]) {
      record[idField[0]] = publicId(idField[1]);
    }

    extras[collection].unshift(record);
    return clone(record);
  },

  updateCollectionItem(collection: string, id: string, input: Record<string, any>) {
    const records = extras[collection] ?? [];
    const index = records.findIndex((record) => record._id === id);
    if (index === -1) return null;

    const updated = updateTimestamp({
      ...records[index],
      ...input,
      _id: records[index]._id,
      createdAt: records[index].createdAt,
    });
    records.splice(index, 1, updated);
    return clone(updated);
  },

  deleteCollectionItem(collection: string, id: string) {
    const records = extras[collection] ?? [];
    const index = records.findIndex((record) => record._id === id);
    if (index === -1) return null;

    const [deleted] = records.splice(index, 1);
    return clone(deleted);
  },
};
