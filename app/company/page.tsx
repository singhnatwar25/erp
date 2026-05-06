'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  Database,
  FileText,
  Handshake,
  Home,
  Laptop,
  Mail,
  Plus,
  RefreshCcw,
  Users,
} from 'lucide-react';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type Employee = {
  _id: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  department?: string;
};

type Project = {
  _id: string;
  projectId?: string;
  name: string;
};

type Client = {
  _id: string;
  clientId?: string;
  companyName: string;
  contactPerson?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  industry?: string;
  status: string;
};

type Deal = {
  _id: string;
  dealId?: string;
  title: string;
  value: number;
  stage: string;
  probability?: number;
  client?: Client;
};

type Communication = {
  _id: string;
  type: string;
  direction?: string;
  subject?: string;
  content?: string;
  date: string;
  client?: Client;
};

type Asset = {
  _id: string;
  assetId?: string;
  name: string;
  type: string;
  brand?: string;
  status: string;
  location?: string;
  purchasePrice?: number;
};

type Attendance = {
  _id: string;
  employee?: Employee;
  date: string;
  status: string;
  workingHours?: number;
};

type Leave = {
  _id: string;
  leaveId?: string;
  employee?: Employee & { department?: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  status: string;
};

type Invoice = {
  _id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  client?: Client;
  issueDate: string;
  dueDate: string;
  status: string;
  total?: number;
  balanceDue?: number;
};

type DatabaseStatus = {
  connected: boolean;
  mode: 'mongodb' | 'local-demo';
  uri: string;
};

const tabs = [
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'sales', label: 'Sales', icon: Handshake },
  { id: 'hr', label: 'HR', icon: CalendarCheck },
  { id: 'assets', label: 'Assets', icon: Laptop },
  { id: 'billing', label: 'Billing', icon: FileText },
] as const;

type TabId = (typeof tabs)[number]['id'];

const today = new Date().toISOString().slice(0, 10);

const money = (amount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const personName = (employee?: Pick<Employee, 'firstName' | 'lastName'>) =>
  employee ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() : 'Unassigned';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.success) {
    throw new Error(payload.error || `Request failed: ${path}`);
  }
  return payload.data;
}

async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || `Request failed: ${path}`);
  }
  return payload.data;
}

export default function CompanyOperationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('crm');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [database, setDatabase] = useState<DatabaseStatus | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [clientForm, setClientForm] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    industry: 'Software',
    status: 'prospect',
    leadSource: 'website',
    notes: '',
  });

  const [dealForm, setDealForm] = useState({
    title: '',
    value: '',
    stage: 'lead',
    probability: '25',
    expectedCloseDate: today,
    description: '',
  });

  const [communicationForm, setCommunicationForm] = useState({
    type: 'email',
    direction: 'outgoing',
    subject: '',
    content: '',
    date: today,
    duration: '',
  });

  const [attendanceForm, setAttendanceForm] = useState({
    date: today,
    status: 'present',
    checkIn: '09:30',
    checkOut: '18:00',
    workingHours: '8',
    notes: '',
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'paid',
    startDate: today,
    endDate: today,
    reason: '',
    status: 'pending',
  });

  const [assetForm, setAssetForm] = useState({
    name: '',
    type: 'laptop',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: today,
    purchasePrice: '',
    vendor: '',
    status: 'active',
    location: '',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    issueDate: today,
    dueDate: today,
    itemDescription: '',
    quantity: '1',
    rate: '',
    taxRate: '0',
    discount: '0',
    status: 'draft',
    notes: '',
  });

  const primaryEmployeeId = employees[0]?._id ?? '';
  const primaryClientId = clients[0]?._id ?? '';
  const primaryProjectId = projects[0]?._id ?? '';

  const invoicePreview = useMemo(() => {
    const quantity = Number(invoiceForm.quantity || 0);
    const rate = Number(invoiceForm.rate || 0);
    const subtotal = quantity * rate;
    const taxAmount = (subtotal * Number(invoiceForm.taxRate || 0)) / 100;
    return subtotal + taxAmount - Number(invoiceForm.discount || 0);
  }, [invoiceForm]);

  const fetchCompanyData = useCallback(async () => {
    try {
      setError('');
      const [
        databaseData,
        employeeData,
        projectData,
        clientData,
        dealData,
        communicationData,
        assetData,
        attendanceData,
        leaveData,
        invoiceData,
      ] = await Promise.all([
        getJson<DatabaseStatus>('/api/system/database'),
        getJson<Employee[]>('/api/employees'),
        getJson<Project[]>('/api/projects'),
        getJson<Client[]>('/api/clients'),
        getJson<Deal[]>('/api/deals'),
        getJson<Communication[]>('/api/communications'),
        getJson<Asset[]>('/api/assets'),
        getJson<Attendance[]>('/api/hr/attendance'),
        getJson<Leave[]>('/api/hr/leaves'),
        getJson<Invoice[]>('/api/invoices'),
      ]);

      setDatabase(databaseData);
      setEmployees(employeeData);
      setProjects(projectData);
      setClients(clientData);
      setDeals(dealData);
      setCommunications(communicationData);
      setAssets(assetData);
      setAttendance(attendanceData);
      setLeaves(leaveData);
      setInvoices(invoiceData);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load company data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  async function handleCreate(label: string, action: () => Promise<void>) {
    try {
      setSaving(label);
      setError('');
      await action();
      await fetchCompanyData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Save failed');
    } finally {
      setSaving('');
    }
  }

  const createClient = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('client', async () => {
      await postJson('/api/clients', {
        companyName: clientForm.companyName,
        contactPerson: {
          firstName: clientForm.firstName,
          lastName: clientForm.lastName,
          email: clientForm.email,
          phone: clientForm.phone,
        },
        industry: clientForm.industry,
        status: clientForm.status,
        leadSource: clientForm.leadSource,
        assignedTo: primaryEmployeeId || undefined,
        notes: clientForm.notes,
      });
      setClientForm((current) => ({
        ...current,
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
      }));
    });
  };

  const createDeal = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('deal', async () => {
      await postJson('/api/deals', {
        title: dealForm.title,
        client: primaryClientId,
        assignedTo: primaryEmployeeId,
        value: Number(dealForm.value || 0),
        stage: dealForm.stage,
        probability: Number(dealForm.probability || 0),
        expectedCloseDate: dealForm.expectedCloseDate,
        description: dealForm.description,
      });
      setDealForm((current) => ({ ...current, title: '', value: '', description: '' }));
    });
  };

  const createCommunication = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('communication', async () => {
      await postJson('/api/communications', {
        client: primaryClientId,
        employee: primaryEmployeeId,
        type: communicationForm.type,
        direction: communicationForm.direction,
        subject: communicationForm.subject,
        content: communicationForm.content,
        date: communicationForm.date,
        duration: Number(communicationForm.duration || 0),
      });
      setCommunicationForm((current) => ({ ...current, subject: '', content: '', duration: '' }));
    });
  };

  const createAttendance = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('attendance', async () => {
      await postJson('/api/hr/attendance', {
        employee: primaryEmployeeId,
        date: attendanceForm.date,
        status: attendanceForm.status,
        checkIn: `${attendanceForm.date}T${attendanceForm.checkIn}:00`,
        checkOut: `${attendanceForm.date}T${attendanceForm.checkOut}:00`,
        workingHours: Number(attendanceForm.workingHours || 0),
        notes: attendanceForm.notes,
      });
      setAttendanceForm((current) => ({ ...current, notes: '' }));
    });
  };

  const createLeave = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('leave', async () => {
      await postJson('/api/hr/leaves', {
        employee: primaryEmployeeId,
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        status: leaveForm.status,
      });
      setLeaveForm((current) => ({ ...current, reason: '' }));
    });
  };

  const createAsset = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('asset', async () => {
      await postJson('/api/assets', {
        name: assetForm.name,
        type: assetForm.type,
        brand: assetForm.brand,
        model: assetForm.model,
        serialNumber: assetForm.serialNumber,
        purchaseDate: assetForm.purchaseDate,
        purchasePrice: Number(assetForm.purchasePrice || 0),
        vendor: assetForm.vendor,
        status: assetForm.status,
        assignedTo: primaryEmployeeId || undefined,
        location: assetForm.location,
      });
      setAssetForm((current) => ({
        ...current,
        name: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchasePrice: '',
        vendor: '',
        location: '',
      }));
    });
  };

  const createInvoice = (event: FormEvent) => {
    event.preventDefault();
    handleCreate('invoice', async () => {
      await postJson('/api/invoices', {
        invoiceNumber: invoiceForm.invoiceNumber || undefined,
        client: primaryClientId,
        project: primaryProjectId || undefined,
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
        items: [
          {
            description: invoiceForm.itemDescription,
            quantity: Number(invoiceForm.quantity || 0),
            rate: Number(invoiceForm.rate || 0),
          },
        ],
        taxRate: Number(invoiceForm.taxRate || 0),
        discount: Number(invoiceForm.discount || 0),
        status: invoiceForm.status,
        notes: invoiceForm.notes,
      });
      setInvoiceForm((current) => ({
        ...current,
        invoiceNumber: '',
        itemDescription: '',
        rate: '',
        notes: '',
      }));
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191E2C] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#B9FF66] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#94A3B8]">Loading company workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191E2C]">
      <nav className="sticky top-0 z-50 bg-[#191E2C]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#191E2C]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Company</h1>
                <p className="text-xs text-[#64748B]">Operations</p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="nav-pill">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? 'nav-pill-active' : 'nav-pill'}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <section className="mb-8 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-5 items-end">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Company Operations</h2>
            <p className="text-[#94A3B8]">CRM, sales, HR, assets, and billing in one workspace.</p>
          </div>
          <div className="card-dark p-4 min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="stat-icon">
                  <Database className="h-5 w-5 text-[#B9FF66]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {database?.connected ? 'MongoDB connected' : 'Local demo data'}
                  </p>
                  <p className="text-xs text-[#64748B] truncate max-w-[180px]">{database?.uri}</p>
                </div>
              </div>
              <button type="button" onClick={fetchCompanyData} className="btn-dark px-3">
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#C55050]/40 bg-[#C55050]/10 px-4 py-3 text-sm text-[#FFB3B3]">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <Metric icon={Users} label="Clients" value={clients.length} />
          <Metric icon={Handshake} label="Deals" value={deals.length} />
          <Metric icon={Mail} label="Touchpoints" value={communications.length} />
          <Metric icon={CalendarCheck} label="Attendance" value={attendance.length} />
          <Metric icon={ClipboardList} label="Leaves" value={leaves.length} />
          <Metric icon={Laptop} label="Assets" value={assets.length} />
          <Metric icon={FileText} label="Invoices" value={invoices.length} />
          <Metric icon={Database} label="Mode" value={database?.mode === 'mongodb' ? 'DB' : 'Demo'} />
        </section>

        {activeTab === 'crm' && (
          <TwoColumn
            form={
              <Panel title="Add Client">
                <form onSubmit={createClient} className="space-y-4">
                  <Input value={clientForm.companyName} onChange={(value) => setClientForm({ ...clientForm, companyName: value })} placeholder="Company name" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={clientForm.firstName} onChange={(value) => setClientForm({ ...clientForm, firstName: value })} placeholder="Contact first name" required />
                    <Input value={clientForm.lastName} onChange={(value) => setClientForm({ ...clientForm, lastName: value })} placeholder="Contact last name" />
                  </div>
                  <Input value={clientForm.email} onChange={(value) => setClientForm({ ...clientForm, email: value })} placeholder="Email" type="email" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={clientForm.phone} onChange={(value) => setClientForm({ ...clientForm, phone: value })} placeholder="Phone" />
                    <Input value={clientForm.industry} onChange={(value) => setClientForm({ ...clientForm, industry: value })} placeholder="Industry" />
                  </div>
                  <Select value={clientForm.status} onChange={(value) => setClientForm({ ...clientForm, status: value })} options={['prospect', 'active', 'inactive', 'churned']} />
                  <TextArea value={clientForm.notes} onChange={(value) => setClientForm({ ...clientForm, notes: value })} placeholder="Notes" />
                  <SubmitButton saving={saving === 'client'} label="Create client" />
                </form>
              </Panel>
            }
            content={
              <Panel title="Clients">
                <div className="space-y-3">
                  {clients.map((client) => (
                    <Row key={client._id} title={client.companyName} meta={`${client.industry ?? 'General'} / ${client.status}`}>
                      <span>{client.contactPerson?.email}</span>
                    </Row>
                  ))}
                </div>
              </Panel>
            }
          />
        )}

        {activeTab === 'sales' && (
          <TwoColumn
            form={
              <div className="space-y-5">
                <Panel title="Add Deal">
                  <form onSubmit={createDeal} className="space-y-4">
                    <Input value={dealForm.title} onChange={(value) => setDealForm({ ...dealForm, title: value })} placeholder="Deal title" required />
                    <Input value={dealForm.value} onChange={(value) => setDealForm({ ...dealForm, value: value })} placeholder="Deal value" type="number" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select value={dealForm.stage} onChange={(value) => setDealForm({ ...dealForm, stage: value })} options={['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']} />
                      <Input value={dealForm.probability} onChange={(value) => setDealForm({ ...dealForm, probability: value })} placeholder="Probability" type="number" />
                    </div>
                    <Input value={dealForm.expectedCloseDate} onChange={(value) => setDealForm({ ...dealForm, expectedCloseDate: value })} type="date" />
                    <TextArea value={dealForm.description} onChange={(value) => setDealForm({ ...dealForm, description: value })} placeholder="Description" />
                    <SubmitButton saving={saving === 'deal'} label="Create deal" disabled={!primaryClientId || !primaryEmployeeId} />
                  </form>
                </Panel>
                <Panel title="Log Communication">
                  <form onSubmit={createCommunication} className="space-y-4">
                    <Input value={communicationForm.subject} onChange={(value) => setCommunicationForm({ ...communicationForm, subject: value })} placeholder="Subject" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select value={communicationForm.type} onChange={(value) => setCommunicationForm({ ...communicationForm, type: value })} options={['email', 'call', 'meeting', 'video_call', 'sms', 'note']} />
                      <Select value={communicationForm.direction} onChange={(value) => setCommunicationForm({ ...communicationForm, direction: value })} options={['outgoing', 'incoming']} />
                    </div>
                    <TextArea value={communicationForm.content} onChange={(value) => setCommunicationForm({ ...communicationForm, content: value })} placeholder="Content" required />
                    <SubmitButton saving={saving === 'communication'} label="Save touchpoint" disabled={!primaryClientId || !primaryEmployeeId} />
                  </form>
                </Panel>
              </div>
            }
            content={
              <div className="space-y-5">
                <Panel title="Deal Pipeline">
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <Row key={deal._id} title={deal.title} meta={`${deal.stage} / ${deal.probability ?? 0}%`}>
                        <span className="font-semibold text-[#B9FF66]">{money(deal.value)}</span>
                      </Row>
                    ))}
                  </div>
                </Panel>
                <Panel title="Client Communications">
                  <div className="space-y-3">
                    {communications.map((item) => (
                      <Row key={item._id} title={item.subject || item.type} meta={`${item.type} / ${item.direction ?? 'outgoing'}`}>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </Row>
                    ))}
                  </div>
                </Panel>
              </div>
            }
          />
        )}

        {activeTab === 'hr' && (
          <TwoColumn
            form={
              <div className="space-y-5">
                <Panel title="Mark Attendance">
                  <form onSubmit={createAttendance} className="space-y-4">
                    <Input value={attendanceForm.date} onChange={(value) => setAttendanceForm({ ...attendanceForm, date: value })} type="date" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select value={attendanceForm.status} onChange={(value) => setAttendanceForm({ ...attendanceForm, status: value })} options={['present', 'absent', 'late', 'half_day', 'on_leave', 'wfh']} />
                      <Input value={attendanceForm.workingHours} onChange={(value) => setAttendanceForm({ ...attendanceForm, workingHours: value })} placeholder="Working hours" type="number" />
                    </div>
                    <TextArea value={attendanceForm.notes} onChange={(value) => setAttendanceForm({ ...attendanceForm, notes: value })} placeholder="Notes" />
                    <SubmitButton saving={saving === 'attendance'} label="Save attendance" disabled={!primaryEmployeeId} />
                  </form>
                </Panel>
                <Panel title="Apply Leave">
                  <form onSubmit={createLeave} className="space-y-4">
                    <Select value={leaveForm.leaveType} onChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })} options={['sick', 'casual', 'paid', 'unpaid', 'maternity', 'paternity', 'bereavement', 'other']} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input value={leaveForm.startDate} onChange={(value) => setLeaveForm({ ...leaveForm, startDate: value })} type="date" />
                      <Input value={leaveForm.endDate} onChange={(value) => setLeaveForm({ ...leaveForm, endDate: value })} type="date" />
                    </div>
                    <TextArea value={leaveForm.reason} onChange={(value) => setLeaveForm({ ...leaveForm, reason: value })} placeholder="Reason" required />
                    <SubmitButton saving={saving === 'leave'} label="Submit leave" disabled={!primaryEmployeeId} />
                  </form>
                </Panel>
              </div>
            }
            content={
              <div className="space-y-5">
                <Panel title="Attendance">
                  <div className="space-y-3">
                    {attendance.map((item) => (
                      <Row key={item._id} title={personName(item.employee)} meta={`${item.status} / ${item.workingHours ?? 0}h`}>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </Row>
                    ))}
                  </div>
                </Panel>
                <Panel title="Leave Requests">
                  <div className="space-y-3">
                    {leaves.map((leave) => (
                      <Row key={leave._id} title={personName(leave.employee)} meta={`${leave.leaveType} / ${leave.status}`}>
                        <span>{leave.totalDays ?? 1} days</span>
                      </Row>
                    ))}
                  </div>
                </Panel>
              </div>
            }
          />
        )}

        {activeTab === 'assets' && (
          <TwoColumn
            form={
              <Panel title="Register Asset">
                <form onSubmit={createAsset} className="space-y-4">
                  <Input value={assetForm.name} onChange={(value) => setAssetForm({ ...assetForm, name: value })} placeholder="Asset name" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select value={assetForm.type} onChange={(value) => setAssetForm({ ...assetForm, type: value })} options={['laptop', 'desktop', 'monitor', 'phone', 'tablet', 'server', 'network_equipment', 'furniture', 'vehicle', 'other']} />
                    <Select value={assetForm.status} onChange={(value) => setAssetForm({ ...assetForm, status: value })} options={['active', 'in_repair', 'retired', 'sold', 'lost']} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={assetForm.brand} onChange={(value) => setAssetForm({ ...assetForm, brand: value })} placeholder="Brand" />
                    <Input value={assetForm.model} onChange={(value) => setAssetForm({ ...assetForm, model: value })} placeholder="Model" />
                  </div>
                  <Input value={assetForm.serialNumber} onChange={(value) => setAssetForm({ ...assetForm, serialNumber: value })} placeholder="Serial number" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={assetForm.purchaseDate} onChange={(value) => setAssetForm({ ...assetForm, purchaseDate: value })} type="date" />
                    <Input value={assetForm.purchasePrice} onChange={(value) => setAssetForm({ ...assetForm, purchasePrice: value })} placeholder="Purchase price" type="number" required />
                  </div>
                  <Input value={assetForm.location} onChange={(value) => setAssetForm({ ...assetForm, location: value })} placeholder="Location" />
                  <SubmitButton saving={saving === 'asset'} label="Register asset" />
                </form>
              </Panel>
            }
            content={
              <Panel title="Asset Inventory">
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <Row key={asset._id} title={asset.name} meta={`${asset.type} / ${asset.status}`}>
                      <span>{money(asset.purchasePrice ?? 0)}</span>
                    </Row>
                  ))}
                </div>
              </Panel>
            }
          />
        )}

        {activeTab === 'billing' && (
          <TwoColumn
            form={
              <Panel title="Create Invoice">
                <form onSubmit={createInvoice} className="space-y-4">
                  <Input value={invoiceForm.invoiceNumber} onChange={(value) => setInvoiceForm({ ...invoiceForm, invoiceNumber: value })} placeholder="Invoice number" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={invoiceForm.issueDate} onChange={(value) => setInvoiceForm({ ...invoiceForm, issueDate: value })} type="date" />
                    <Input value={invoiceForm.dueDate} onChange={(value) => setInvoiceForm({ ...invoiceForm, dueDate: value })} type="date" />
                  </div>
                  <Input value={invoiceForm.itemDescription} onChange={(value) => setInvoiceForm({ ...invoiceForm, itemDescription: value })} placeholder="Line item description" required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input value={invoiceForm.quantity} onChange={(value) => setInvoiceForm({ ...invoiceForm, quantity: value })} placeholder="Quantity" type="number" required />
                    <Input value={invoiceForm.rate} onChange={(value) => setInvoiceForm({ ...invoiceForm, rate: value })} placeholder="Rate" type="number" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input value={invoiceForm.taxRate} onChange={(value) => setInvoiceForm({ ...invoiceForm, taxRate: value })} placeholder="Tax %" type="number" />
                    <Input value={invoiceForm.discount} onChange={(value) => setInvoiceForm({ ...invoiceForm, discount: value })} placeholder="Discount" type="number" />
                    <Select value={invoiceForm.status} onChange={(value) => setInvoiceForm({ ...invoiceForm, status: value })} options={['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']} />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-[#64748B]">Invoice total</p>
                    <p className="text-2xl font-bold text-[#B9FF66]">{money(invoicePreview)}</p>
                  </div>
                  <SubmitButton saving={saving === 'invoice'} label="Create invoice" disabled={!primaryClientId} />
                </form>
              </Panel>
            }
            content={
              <Panel title="Invoices">
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Row key={invoice._id} title={invoice.invoiceNumber || invoice.invoiceId || 'Invoice'} meta={`${invoice.status} / due ${new Date(invoice.dueDate).toLocaleDateString()}`}>
                      <span className="font-semibold text-[#B9FF66]">{money(invoice.total ?? invoice.balanceDue ?? 0)}</span>
                    </Row>
                  ))}
                </div>
              </Panel>
            }
          />
        )}
      </main>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card-dark p-4">
      <div className="flex items-center gap-3">
        <div className="stat-icon">
          <Icon className="h-5 w-5 text-[#B9FF66]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-[#64748B]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function TwoColumn({ form, content }: { form: React.ReactNode; content: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6">
      <div>{form}</div>
      <div>{content}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-dark p-6">
      <h3 className="text-xl font-bold text-white mb-5">{title}</h3>
      {children}
    </section>
  );
}

function Row({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#1E2538] border border-white/5 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-[#64748B]">{meta}</p>
      </div>
      <div className="text-sm text-[#94A3B8]">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      className="input-dark"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      required={required}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option} className="bg-[#252B3D]">
          {option.replaceAll('_', ' ')}
        </option>
      ))}
    </select>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <textarea
      className="input-dark min-h-[96px] resize-none"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
    />
  );
}

function SubmitButton({
  saving,
  label,
  disabled,
}: {
  saving: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button type="submit" className="btn-lime w-full" disabled={saving || disabled}>
      <Plus className="h-4 w-4" />
      {saving ? 'Saving...' : label}
    </button>
  );
}
