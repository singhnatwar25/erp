import mongoose from 'mongoose';
import { mongoUri } from './env';

async function main() {
  const uri = mongoUri();
  await mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });

  const { default: Employee } = await import('../models/Employee');
  const { default: Project } = await import('../models/Project');
  const { default: Task } = await import('../models/Task');
  const { default: Client } = await import('../models/Client');
  const { default: Deal } = await import('../models/Deal');
  const { default: Communication } = await import('../models/Communication');
  const { default: Asset } = await import('../models/Asset');
  const { default: Attendance } = await import('../models/Attendance');
  const { default: Leave } = await import('../models/Leave');
  const { default: Invoice } = await import('../models/Invoice');
  const { Transaction, Budget } = await import('../models/Finance');

  const employee = await Employee.findOneAndUpdate(
    { employeeId: 'EMP-SEED001' },
    {
      employeeId: 'EMP-SEED001',
      firstName: 'Aarav',
      lastName: 'Mehta',
      email: 'aarav.seed@example.com',
      phone: '+1 555 0101',
      department: 'Engineering',
      position: 'Senior Developer',
      joinDate: new Date('2025-10-01'),
      salary: 118000,
      status: 'active',
      skills: ['Next.js', 'MongoDB', 'TypeScript'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const salesEmployee = await Employee.findOneAndUpdate(
    { employeeId: 'EMP-SEED002' },
    {
      employeeId: 'EMP-SEED002',
      firstName: 'Priya',
      lastName: 'Shah',
      email: 'priya.seed@example.com',
      phone: '+1 555 0102',
      department: 'Sales',
      position: 'Account Executive',
      joinDate: new Date('2026-01-15'),
      salary: 92000,
      status: 'active',
      skills: ['Enterprise sales', 'CRM'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const project = await Project.findOneAndUpdate(
    { projectId: 'PRJ-SEED001' },
    {
      projectId: 'PRJ-SEED001',
      name: 'Atlas CRM Portal',
      description: 'Customer portal and reporting workflow for a SaaS client.',
      client: 'Atlas Labs',
      status: 'in_progress',
      priority: 'high',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-07-15'),
      budget: 185000,
      assignedEmployees: [employee._id.toString(), salesEmployee._id.toString()],
      projectManager: 'Aarav Mehta',
      progress: 62,
      technologies: ['Next.js', 'MongoDB', 'Tailwind CSS'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const client = await Client.findOneAndUpdate(
    { companyName: 'Atlas Labs' },
    {
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
      assignedTo: salesEmployee._id,
      notes: 'Seed client for ERP verification.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Task.findOneAndUpdate(
    { taskId: 'TSK-SEED001' },
    {
      taskId: 'TSK-SEED001',
      title: 'Build customer activity dashboard',
      description: 'Create cards and recent activity table.',
      project: project._id,
      assignedTo: employee._id,
      assignedBy: salesEmployee._id,
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2026-05-20'),
      estimatedHours: 24,
      actualHours: 9,
      timeEntries: [
        { date: new Date('2026-05-01'), hours: 4, description: 'Dashboard layout' },
        { date: new Date('2026-05-03'), hours: 5, description: 'API integration' },
      ],
      tags: ['frontend', 'dashboard'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const deal = await Deal.findOneAndUpdate(
    { dealId: 'DL-SEED001' },
    {
      dealId: 'DL-SEED001',
      title: 'Atlas support expansion',
      client: client._id,
      value: 78000,
      currency: 'USD',
      stage: 'proposal',
      probability: 65,
      expectedCloseDate: new Date('2026-06-01'),
      assignedTo: salesEmployee._id,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Communication.findOneAndUpdate(
    { communicationId: 'COM-SEED001' },
    {
      communicationId: 'COM-SEED001',
      client: client._id,
      employee: salesEmployee._id,
      type: 'email',
      direction: 'outgoing',
      subject: 'Project milestone review',
      content: `Shared sprint progress for ${deal.title}.`,
      date: new Date('2026-05-03'),
      followUpRequired: true,
      followUpDate: new Date('2026-05-10'),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Asset.findOneAndUpdate(
    { assetId: 'AST-SEED001' },
    {
      assetId: 'AST-SEED001',
      name: 'MacBook Pro 14',
      type: 'laptop',
      brand: 'Apple',
      model: 'M3 Pro',
      serialNumber: 'SEED-AST-001',
      purchaseDate: new Date('2026-01-10'),
      purchasePrice: 2499,
      vendor: 'Apple Business',
      status: 'active',
      assignedTo: employee._id,
      location: 'Engineering',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Attendance.findOneAndUpdate(
    {
      employee: employee._id,
      date: new Date('2026-05-05'),
    },
    {
      employee: employee._id,
      date: new Date('2026-05-05'),
      status: 'present',
      checkIn: new Date('2026-05-05T09:30:00'),
      checkOut: new Date('2026-05-05T18:00:00'),
      workingHours: 8,
      notes: 'Seed attendance entry.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Leave.findOneAndUpdate(
    { leaveId: 'LEV-SEED001' },
    {
      leaveId: 'LEV-SEED001',
      employee: salesEmployee._id,
      leaveType: 'paid',
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-12'),
      totalDays: 3,
      reason: 'Planned personal leave',
      status: 'pending',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Transaction.findOneAndUpdate(
    { transactionId: 'TRX-SEED001' },
    {
      transactionId: 'TRX-SEED001',
      type: 'income',
      category: 'Revenue',
      amount: 45000,
      description: 'Atlas milestone payment',
      date: new Date('2026-05-01'),
      relatedTo: 'client',
      relatedId: client._id.toString(),
      paymentMethod: 'bank_transfer',
      status: 'completed',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Budget.findOneAndUpdate(
    { budgetId: 'BUD-SEED001' },
    {
      budgetId: 'BUD-SEED001',
      department: 'Engineering',
      fiscalYear: 2026,
      allocatedAmount: 250000,
      spentAmount: 72000,
      remainingAmount: 178000,
      categories: [
        { name: 'Salary', allocated: 180000, spent: 52000 },
        { name: 'Software', allocated: 70000, spent: 20000 },
      ],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Invoice.findOneAndUpdate(
    { invoiceId: 'INV-SEED001' },
    {
      invoiceId: 'INV-SEED001',
      client: client._id,
      project: project._id,
      issueDate: new Date('2026-05-01'),
      dueDate: new Date('2026-05-30'),
      items: [{ description: 'Atlas milestone delivery', quantity: 1, rate: 45000, amount: 45000 }],
      subtotal: 45000,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 45000,
      amountPaid: 0,
      balanceDue: 45000,
      status: 'sent',
      notes: 'Seed invoice for ERP verification.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('MongoDB seed completed.');
  console.log(`Employees: ${await Employee.countDocuments()}`);
  console.log(`Clients: ${await Client.countDocuments()}`);
  console.log(`Projects: ${await Project.countDocuments()}`);
  console.log(`Invoices: ${await Invoice.countDocuments()}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(`MongoDB seed failed: ${error.message}`);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
