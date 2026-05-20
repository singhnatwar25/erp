import fs from 'fs';
import path from 'path';
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
  category?: string;
  progress: number;
  assignedEmployees: string[];
  projectManager: string;
  technologies: string[];
  team?: { employee?: { firstName: string; lastName: string; avatar?: string }; role?: string }[];
  tasksCompleted?: number;
  tasksTotal?: number;
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

type BillTemplateRecord = DemoRecord & {
  name: string;
  description?: string;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    defaultValue?: string;
    order: number;
  }>;
  isActive: boolean;
};

type BillRecord = DemoRecord & {
  billId: string;
  templateId: string;
  templateName: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  customFields: Record<string, any>;
};

type ExtraRecord = DemoRecord & Record<string, any>;

type LocalDatabase = {
  employees: EmployeeRecord[];
  projects: ProjectRecord[];
  tasks: TaskRecord[];
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
  extras: Record<string, ExtraRecord[]>;
};

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

const localDatabasePath = path.join(process.cwd(), 'data', 'local-db.json');

function readLocalDatabase(seed: LocalDatabase): LocalDatabase {
  try {
    if (!fs.existsSync(localDatabasePath)) {
      fs.mkdirSync(path.dirname(localDatabasePath), { recursive: true });
      fs.writeFileSync(localDatabasePath, JSON.stringify(seed, null, 2));
      return seed;
    }

    const stored = JSON.parse(fs.readFileSync(localDatabasePath, 'utf8'));

    return {
      ...seed,
      ...stored,
      extras: {
        ...seed.extras,
        ...(stored.extras ?? {}),
      },
    };
  } catch {
    return seed;
  }
}

function persistLocalDatabase() {
  fs.mkdirSync(path.dirname(localDatabasePath), { recursive: true });
  fs.writeFileSync(
    localDatabasePath,
    JSON.stringify({ employees, projects, tasks, transactions, budgets, extras }, null, 2)
  );
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
    firstName: 'Rohan',
    lastName: 'Kapoor',
    email: 'rohan.kapoor@freshworks-office.test',
    phone: '+91 98765 0101',
    department: 'Engineering',
    position: 'Product Engineer',
    status: 'active',
    joinDate: daysAgo(210),
    salary: 118000,
    createdAt: daysAgo(210),
    updatedAt: daysAgo(10),
  },
  {
    _id: 'demo-employee-2',
    employeeId: 'EMP-DEMO002',
    firstName: 'Ananya',
    lastName: 'Rao',
    email: 'ananya.rao@freshworks-office.test',
    phone: '+91 98765 0102',
    department: 'Sales',
    position: 'Sales Manager',
    status: 'active',
    joinDate: daysAgo(42),
    salary: 92000,
    createdAt: daysAgo(42),
    updatedAt: daysAgo(5),
  },
  {
    _id: 'demo-employee-3',
    employeeId: 'EMP-DEMO003',
    firstName: 'Vikram',
    lastName: 'Iyer',
    email: 'vikram.iyer@freshworks-office.test',
    phone: '+91 98765 0103',
    department: 'Finance',
    position: 'Accounts Lead',
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
    name: 'Retail ERP Rollout',
    description: 'Inventory, billing, and staff workflow setup for a retail chain.',
    client: 'BrightMart Retail',
    status: 'in_progress',
    priority: 'high',
    startDate: daysAgo(55),
    endDate: daysAgo(-40),
    budget: 185000,
    progress: 62,
    assignedEmployees: ['demo-employee-1', 'demo-employee-2'],
    projectManager: 'Rohan Kapoor',
    technologies: ['Next.js', 'Local JSON DB', 'Tailwind CSS'],
    createdAt: daysAgo(55),
    updatedAt: daysAgo(1),
  },
  {
    _id: 'demo-project-2',
    projectId: 'PRJ-DEMO002',
    name: 'HR Attendance System',
    description: 'Office attendance, leave tracking, and HR reporting.',
    client: 'BluePeak Services',
    status: 'planning',
    priority: 'medium',
    startDate: daysAgo(8),
    endDate: daysAgo(-80),
    budget: 96000,
    progress: 18,
    assignedEmployees: ['demo-employee-1', 'demo-employee-3'],
    projectManager: 'Vikram Iyer',
    technologies: ['TypeScript', 'Node.js'],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
  },
];

let tasks: TaskRecord[] = [
  {
    _id: 'demo-task-1',
    taskId: 'TSK-DEMO001',
    title: 'Prepare retail stock import screen',
    description: 'Create the stock upload form and validation table.',
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
      { date: daysAgo(3), hours: 4, description: 'Upload layout' },
      { date: daysAgo(1), hours: 5, description: 'Validation rules' },
    ],
    tags: ['frontend', 'inventory'],
    createdAt: daysAgo(9),
    updatedAt: daysAgo(1),
  },
  {
    _id: 'demo-task-2',
    taskId: 'TSK-DEMO002',
    title: 'Create leave approval checklist',
    description: 'Confirm approval states and required HR fields.',
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
    description: 'BrightMart rollout advance',
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
    description: 'Office software subscriptions',
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
      companyName: 'BrightMart Retail',
      contactPerson: {
        firstName: 'Kavya',
        lastName: 'Menon',
        email: 'kavya.menon@brightmart.test',
        phone: '+91 98765 0201',
        designation: 'Operations Head',
      },
      industry: 'Retail',
      website: 'https://brightmart.test',
      status: 'active',
      leadSource: 'referral',
      assignedTo: employeeSummary(employees[1]),
      notes: 'Fresh sample client for regular office ERP testing.',
      createdAt: daysAgo(70),
      updatedAt: daysAgo(4),
    },
  ],
  deals: [
    {
      _id: 'demo-deal-1',
      dealId: 'DL-DEMO001',
      title: 'BrightMart phase two rollout',
      client: {
        _id: 'demo-client-1',
        companyName: 'BrightMart Retail',
        contactPerson: { firstName: 'Kavya', lastName: 'Menon' },
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
      name: 'Dell Latitude 7440',
      type: 'laptop',
      brand: 'Dell',
      model: 'Latitude 7440',
      serialNumber: 'FRESH-AST-001',
      purchaseDate: daysAgo(120),
      purchasePrice: 1450,
      vendor: 'Office Hardware Hub',
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
        companyName: 'BrightMart Retail',
        contactPerson: { firstName: 'Kavya', lastName: 'Menon' },
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
  billTemplates: [
    {
      _id: 'default-template',
      name: 'Standard Invoice',
      description: 'Default office invoice template',
      isActive: true,
      fields: [
        { id: 'clientName', name: 'clientName', label: 'Client Name', type: 'text', required: true, order: 1 },
        { id: 'clientEmail', name: 'clientEmail', label: 'Client Email', type: 'email', required: false, order: 2 },
        { id: 'clientPhone', name: 'clientPhone', label: 'Client Phone', type: 'phone', required: false, order: 3 },
        { id: 'clientAddress', name: 'clientAddress', label: 'Client Address', type: 'address', required: false, order: 4 },
        { id: 'billNumber', name: 'billNumber', label: 'Invoice Number', type: 'text', required: true, order: 5 },
        { id: 'issueDate', name: 'issueDate', label: 'Issue Date', type: 'date', required: true, order: 6 },
        { id: 'dueDate', name: 'dueDate', label: 'Due Date', type: 'date', required: true, order: 7 },
        { id: 'taxRate', name: 'taxRate', label: 'Tax Rate (%)', type: 'number', required: false, order: 8 },
        { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false, order: 9 },
      ],
      createdAt: daysAgo(90),
      updatedAt: daysAgo(90),
    },
  ],
  bills: [
    {
      _id: 'demo-bill-1',
      billId: 'BILL-DEMO001',
      templateId: 'default-template',
      templateName: 'Standard Invoice',
      clientName: 'BrightMart Retail',
      clientEmail: 'accounts@brightmart.test',
      billNumber: 'INV-FRESH-001',
      issueDate: daysAgo(6),
      dueDate: daysAgo(-24),
      status: 'sent',
      subtotal: 45000,
      taxRate: 0,
      taxAmount: 0,
      total: 45000,
      currency: 'USD',
      notes: 'Initial invoice for retail ERP rollout.',
      items: [{ description: 'Retail ERP implementation advance', quantity: 1, unitPrice: 45000, total: 45000 }],
      customFields: {},
      createdAt: daysAgo(6),
      updatedAt: daysAgo(6),
    },
  ],
  communications: [
    {
      _id: 'demo-communication-1',
      client: {
        _id: 'demo-client-1',
        companyName: 'BrightMart Retail',
        contactPerson: { firstName: 'Kavya', lastName: 'Menon' },
      },
      employee: employeeSummary(employees[1]),
      type: 'email',
      subject: 'ERP rollout kickoff',
      notes: 'Confirmed rollout scope, owners, and first delivery dates.',
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
      notes: 'Fresh office attendance entry.',
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
  var erpDemoData: LocalDatabase | undefined;
}

if (!globalThis.erpDemoData) {
  globalThis.erpDemoData = readLocalDatabase({ employees, projects, tasks, transactions, budgets, extras });
}

globalThis.erpDemoData.extras = {
  ...extras,
  ...(globalThis.erpDemoData.extras ?? {}),
};

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

function calculateBill(input: Record<string, any>, existing?: Partial<BillRecord>) {
  const items = (input.items ?? existing?.items ?? []).map((item: any) => {
    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(item.unitPrice ?? 0);
    return {
      description: item.description ?? '',
      quantity,
      unitPrice,
      total: Number(item.total ?? quantity * unitPrice),
    };
  });
  const taxRate = Number(input.taxRate ?? existing?.taxRate ?? 0);
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.total ?? 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;

  return {
    items,
    taxRate,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
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
    persistLocalDatabase();
    return clone(employee);
  },

  updateEmployee(id: string, input: any) {
    const existing = employees.find((employee) => employee._id === id);
    if (!existing) return null;
    const updated = updateTimestamp({ ...existing, ...input, salary: Number(input.salary ?? existing.salary) });
    employees.splice(employees.findIndex((employee) => employee._id === id), 1, updated);
    persistLocalDatabase();
    return clone(updated);
  },

  deleteEmployee(id: string) {
    const existing = employees.find((employee) => employee._id === id);
    if (!existing) return null;
    employees.splice(employees.findIndex((employee) => employee._id === id), 1);
    persistLocalDatabase();
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
    persistLocalDatabase();
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
    persistLocalDatabase();
    return clone(updated);
  },

  deleteProject(id: string) {
    const existing = projects.find((project) => project._id === id);
    if (!existing) return null;
    projects.splice(projects.findIndex((project) => project._id === id), 1);
    persistLocalDatabase();
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
    persistLocalDatabase();
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
    persistLocalDatabase();
    return clone(updated);
  },

  deleteTask(id: string) {
    const existing = tasks.find((task) => task._id === id);
    if (!existing) return null;
    tasks.splice(tasks.findIndex((task) => task._id === id), 1);
    persistLocalDatabase();
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
    persistLocalDatabase();
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
    persistLocalDatabase();
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
    persistLocalDatabase();
    return clone(updated);
  },

  deleteTransaction(id: string) {
    const existing = transactions.find((transaction) => transaction._id === id);
    if (!existing) return null;
    transactions.splice(transactions.findIndex((transaction) => transaction._id === id), 1);
    persistLocalDatabase();
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
    persistLocalDatabase();
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
    persistLocalDatabase();
    return clone(updated);
  },

  deleteBudget(id: string) {
    const existing = budgets.find((budget) => budget._id === id);
    if (!existing) return null;
    budgets.splice(budgets.findIndex((budget) => budget._id === id), 1);
    persistLocalDatabase();
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
        totalTasks: tasks.length,
        todoTasks: tasks.filter((t) => t.status === 'todo').length,
        inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
        reviewTasks: tasks.filter((t) => t.status === 'review').length,
        doneTasks: tasks.filter((t) => t.status === 'done').length,
      },
      activities,
      departmentData,
      recentTasks: tasks.slice(0, 5).map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        project: t.project?.name || 'No Project',
        assignedTo: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned',
      })),
      recentProjects: projects.slice(0, 6).map((p) => ({
        id: p._id,
        name: p.name,
        category: p.category || 'General',
        budget: p.budget,
        client: p.client,
        status: p.status,
        tasksCompleted: p.tasksCompleted || Math.floor(Math.random() * 50),
        tasksTotal: p.tasksTotal || 100,
        team: p.team?.slice(0, 3).map((m: any) => ({
          name: m.employee ? `${m.employee.firstName} ${m.employee.lastName}` : 'Unknown',
          avatar: m.employee?.avatar,
        })) || [
          { name: 'Rohan Kapoor', avatar: null },
          { name: 'Ananya Rao', avatar: null },
        ],
        extraMembers: Math.max(0, (p.team?.length || 2) - 3),
      })),
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
    persistLocalDatabase();
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
    persistLocalDatabase();
    return clone(updated);
  },

  deleteCollectionItem(collection: string, id: string) {
    const records = extras[collection] ?? [];
    const index = records.findIndex((record) => record._id === id);
    if (index === -1) return null;

    const [deleted] = records.splice(index, 1);
    persistLocalDatabase();
    return clone(deleted);
  },

  listBillTemplates() {
    const templates = (extras.billTemplates ?? []) as BillTemplateRecord[];
    return clone(latestFirst(templates).filter((template) => template.isActive !== false));
  },

  createBillTemplate(input: Record<string, any>) {
    if (!extras.billTemplates) {
      extras.billTemplates = [];
    }

    const template: BillTemplateRecord = {
      _id: nextId(),
      name: input.name,
      description: input.description ?? '',
      fields: input.fields ?? [],
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    extras.billTemplates.unshift(template);
    persistLocalDatabase();
    return clone(template);
  },

  listBills(filters: { status?: string | null; templateId?: string | null } = {}) {
    const bills = (extras.bills ?? []) as BillRecord[];
    return clone(
      latestFirst(
        bills.filter((bill) => {
          if (filters.status && bill.status !== filters.status) return false;
          if (filters.templateId && bill.templateId !== filters.templateId) return false;
          return true;
        })
      )
    );
  },

  getBill(id: string) {
    const bills = (extras.bills ?? []) as BillRecord[];
    return clone(bills.find((bill) => bill._id === id) ?? null);
  },

  createBill(input: Record<string, any>) {
    if (!extras.bills) {
      extras.bills = [];
    }

    const templates = (extras.billTemplates ?? []) as BillTemplateRecord[];
    const template = templates.find((item) => item._id === input.templateId) ?? templates[0];
    const totals = calculateBill(input);
    const bill: BillRecord = {
      _id: nextId(),
      billId: publicId('BILL'),
      templateId: input.templateId || template?._id || 'default-template',
      templateName: template?.name || input.templateName || 'Standard Invoice',
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      clientAddress: input.clientAddress,
      billNumber: input.billNumber || publicId('INV'),
      issueDate: input.issueDate || new Date().toISOString(),
      dueDate: input.dueDate || new Date().toISOString(),
      status: input.status ?? 'draft',
      currency: input.currency ?? 'USD',
      notes: input.notes ?? '',
      customFields: input.customFields ?? {},
      ...totals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    extras.bills.unshift(bill);
    persistLocalDatabase();
    return clone(bill);
  },

  updateBill(id: string, input: Record<string, any>) {
    const bills = (extras.bills ?? []) as BillRecord[];
    const index = bills.findIndex((bill) => bill._id === id);
    if (index === -1) return null;

    const totals = calculateBill(input, bills[index]);
    const updated = updateTimestamp({
      ...bills[index],
      ...input,
      ...totals,
      _id: bills[index]._id,
      billId: bills[index].billId,
      createdAt: bills[index].createdAt,
    });

    bills.splice(index, 1, updated);
    persistLocalDatabase();
    return clone(updated);
  },

  deleteBill(id: string) {
    const bills = (extras.bills ?? []) as BillRecord[];
    const index = bills.findIndex((bill) => bill._id === id);
    if (index === -1) return null;

    const [deleted] = bills.splice(index, 1);
    persistLocalDatabase();
    return clone(deleted);
  },
};
