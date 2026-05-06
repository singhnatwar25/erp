const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function assertOk(path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  console.log(`${path} -> ${response.status}`);
}

async function create(path: string, body: unknown) {
  const payload = await json<{ success: boolean; data: { _id: string }; error?: string }>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!payload.success) {
    throw new Error(payload.error || `${path} failed`);
  }

  return payload.data;
}

async function main() {
  const pages = ['/', '/employees', '/projects', '/tasks', '/finance', '/company'];
  const apis = [
    '/api/system/database',
    '/api/assets',
    '/api/clients',
    '/api/communications',
    '/api/dashboard',
    '/api/deals',
    '/api/employees',
    '/api/finance/budgets',
    '/api/finance/dashboard',
    '/api/finance/transactions',
    '/api/hr/attendance',
    '/api/hr/leaves',
    '/api/invoices',
    '/api/projects',
    '/api/tasks',
    '/api/tasks/time',
  ];

  for (const path of [...pages, ...apis]) {
    await assertOk(path);
  }

  const employee = await create('/api/employees', {
    firstName: 'Smoke',
    lastName: 'Tester',
    email: `smoke.${Date.now()}@example.com`,
    phone: '+1 555 0199',
    department: 'Engineering',
    position: 'QA Engineer',
    salary: 90000,
    joinDate: '2026-05-05',
    status: 'active',
  });

  const client = await create('/api/clients', {
    companyName: `Smoke Client ${Date.now()}`,
    contactPerson: {
      firstName: 'Casey',
      lastName: 'Morgan',
      email: `casey.${Date.now()}@example.com`,
    },
    industry: 'Technology',
    status: 'prospect',
    assignedTo: employee._id,
  });

  const project = await create('/api/projects', {
    name: `Smoke Project ${Date.now()}`,
    description: 'API smoke test',
    client: 'Smoke Client',
    status: 'planning',
    priority: 'medium',
    startDate: '2026-05-05',
    endDate: '2026-06-05',
    budget: 12000,
    projectManager: 'Smoke Tester',
    assignedEmployees: [employee._id],
    technologies: ['Next.js'],
    progress: 10,
  });

  const task = await create('/api/tasks', {
    title: 'Smoke task',
    description: 'Verify task CRUD',
    project: project._id,
    assignedTo: employee._id,
    assignedBy: employee._id,
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-05-10',
    estimatedHours: 3,
  });

  await create('/api/tasks/time', {
    taskId: task._id,
    hours: 1.5,
    description: 'Smoke time entry',
    date: '2026-05-05',
  });

  await create('/api/deals', {
    title: 'Smoke deal',
    client: client._id,
    assignedTo: employee._id,
    value: 5000,
    stage: 'lead',
    probability: 25,
  });

  await create('/api/communications', {
    client: client._id,
    employee: employee._id,
    type: 'email',
    direction: 'outgoing',
    subject: 'Smoke follow up',
    content: 'Smoke test communication.',
    date: '2026-05-05',
  });

  await create('/api/assets', {
    name: 'Smoke Laptop',
    type: 'laptop',
    purchaseDate: '2026-05-05',
    purchasePrice: 1200,
    status: 'active',
    assignedTo: employee._id,
  });

  await create('/api/hr/attendance', {
    employee: employee._id,
    date: '2026-05-05',
    status: 'present',
    workingHours: 8,
  });

  await create('/api/hr/leaves', {
    employee: employee._id,
    leaveType: 'paid',
    startDate: '2026-05-20',
    endDate: '2026-05-21',
    reason: 'Smoke test leave',
  });

  await create('/api/finance/transactions', {
    type: 'income',
    category: 'Revenue',
    amount: 1234,
    description: 'Smoke payment',
    date: '2026-05-05',
    status: 'completed',
    paymentMethod: 'bank_transfer',
  });

  await create('/api/finance/budgets', {
    department: 'Engineering',
    fiscalYear: 2026,
    allocatedAmount: 5000,
    categories: [{ name: 'Software', allocated: 5000 }],
  });

  await create('/api/invoices', {
    client: client._id,
    project: project._id,
    issueDate: '2026-05-05',
    dueDate: '2026-06-05',
    items: [{ description: 'Smoke invoice item', quantity: 1, rate: 1500 }],
    taxRate: 0,
    discount: 0,
    status: 'draft',
  });

  await assertOk('/api/dashboard');
  await assertOk('/api/finance/dashboard');

  console.log('SMOKE_TEST_OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
