'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { EmptyState, ERPShell, Panel, money } from '@/app/components/erp-shell';

type Employee = { _id: string; firstName: string; lastName: string; department?: string };
type Client = { _id: string; companyName: string; industry?: string; status: string; contactPerson?: { firstName?: string; lastName?: string; email?: string; phone?: string } };
type Deal = { _id: string; title: string; value: number; stage: string; probability?: number };
type Asset = { _id: string; name: string; type: string; status: string; location?: string; purchasePrice?: number };
type Attendance = { _id: string; employee?: Employee; date: string; status: string; workingHours?: number };
type Leave = { _id: string; employee?: Employee; leaveType: string; status: string; totalDays?: number; startDate: string; endDate: string };

const today = new Date().toISOString().slice(0, 10);

export default function CompanyPage() {
  const [tab, setTab] = useState<'crm' | 'sales' | 'hr' | 'assets'>('crm');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [query, setQuery] = useState('');

  const [clientForm, setClientForm] = useState({ companyName: '', firstName: '', lastName: '', email: '', phone: '', industry: 'Software', status: 'prospect' });
  const [dealForm, setDealForm] = useState({ title: '', value: '', stage: 'lead', probability: '25' });
  const [attendanceForm, setAttendanceForm] = useState({ date: today, status: 'present', workingHours: '8' });
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'paid', startDate: today, endDate: today, reason: '', status: 'pending' });
  const [assetForm, setAssetForm] = useState({ name: '', type: 'laptop', status: 'active', location: '', purchasePrice: '' });

  const primaryEmployeeId = employees[0]?._id;
  const primaryClientId = clients[0]?._id;

  const fetchCompany = useCallback(async () => {
    const responses = await Promise.all([
      fetch('/api/employees'),
      fetch('/api/clients'),
      fetch('/api/deals'),
      fetch('/api/assets'),
      fetch('/api/hr/attendance'),
      fetch('/api/hr/leaves'),
    ]);
    const [employeePayload, clientPayload, dealPayload, assetPayload, attendancePayload, leavePayload] = await Promise.all(responses.map((response) => response.json()));
    if (employeePayload.success) setEmployees(employeePayload.data);
    if (clientPayload.success) setClients(clientPayload.data);
    if (dealPayload.success) setDeals(dealPayload.data);
    if (assetPayload.success) setAssets(assetPayload.data);
    if (attendancePayload.success) setAttendance(attendancePayload.data);
    if (leavePayload.success) setLeaves(leavePayload.data);
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const filteredClients = useMemo(() => clients.filter((client) => `${client.companyName} ${client.industry}`.toLowerCase().includes(query.toLowerCase())), [clients, query]);

  const post = async (path: string, body: Record<string, unknown>) => {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (payload.success) fetchCompany();
  };

  const createClient = (event: React.FormEvent) => {
    event.preventDefault();
    post('/api/clients', {
      companyName: clientForm.companyName,
      industry: clientForm.industry,
      status: clientForm.status,
      contactPerson: { firstName: clientForm.firstName, lastName: clientForm.lastName, email: clientForm.email, phone: clientForm.phone },
      assignedTo: primaryEmployeeId,
    });
    setClientForm({ ...clientForm, companyName: '', firstName: '', lastName: '', email: '', phone: '' });
  };

  const createDeal = (event: React.FormEvent) => {
    event.preventDefault();
    post('/api/deals', {
      title: dealForm.title,
      value: Number(dealForm.value || 0),
      stage: dealForm.stage,
      probability: Number(dealForm.probability || 0),
      client: primaryClientId,
      assignedTo: primaryEmployeeId,
      expectedCloseDate: today,
    });
    setDealForm({ ...dealForm, title: '', value: '' });
  };

  const createAttendance = (event: React.FormEvent) => {
    event.preventDefault();
    post('/api/hr/attendance', {
      employee: primaryEmployeeId,
      date: attendanceForm.date,
      status: attendanceForm.status,
      workingHours: Number(attendanceForm.workingHours || 0),
    });
  };

  const createLeave = (event: React.FormEvent) => {
    event.preventDefault();
    post('/api/hr/leaves', {
      employee: primaryEmployeeId,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: leaveForm.status,
    });
    setLeaveForm({ ...leaveForm, reason: '' });
  };

  const createAsset = (event: React.FormEvent) => {
    event.preventDefault();
    post('/api/assets', {
      name: assetForm.name,
      type: assetForm.type,
      status: assetForm.status,
      location: assetForm.location,
      purchasePrice: Number(assetForm.purchasePrice || 0),
      assignedTo: primaryEmployeeId,
      purchaseDate: today,
    });
    setAssetForm({ ...assetForm, name: '', location: '', purchasePrice: '' });
  };

  return (
    <ERPShell
      title="Company"
      description="Manage CRM, sales pipeline, HR operations, and company assets."
      action={<button onClick={fetchCompany} className="btn-dark rounded-lg px-4">Refresh</button>}
    >
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-6">
        <Metric label="Employees" value={employees.length} />
        <Metric label="Clients" value={clients.length} />
        <Metric label="Deals" value={deals.length} />
        <Metric label="Pipeline" value={money(deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0))} tone="up" />
        <Metric label="Assets" value={assets.length} />
        <Metric label="Leaves" value={leaves.length} tone="down" />
      </div>

      <Panel>
        <div className="flex flex-wrap gap-2">
          {(['crm', 'sales', 'hr', 'assets'] as const).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={tab === item ? 'btn-lime rounded-lg px-4 capitalize' : 'btn-dark rounded-lg px-4 capitalize'}>{item}</button>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        {tab === 'crm' && (
          <>
            <Panel title="Add Client">
              <form onSubmit={createClient} className="space-y-3">
                <Field value={clientForm.companyName} onChange={(v) => setClientForm({ ...clientForm, companyName: v })} placeholder="Company name" required />
                <div className="grid grid-cols-2 gap-3">
                  <Field value={clientForm.firstName} onChange={(v) => setClientForm({ ...clientForm, firstName: v })} placeholder="First name" />
                  <Field value={clientForm.lastName} onChange={(v) => setClientForm({ ...clientForm, lastName: v })} placeholder="Last name" />
                </div>
                <Field type="email" value={clientForm.email} onChange={(v) => setClientForm({ ...clientForm, email: v })} placeholder="Email" />
                <Field value={clientForm.phone} onChange={(v) => setClientForm({ ...clientForm, phone: v })} placeholder="Phone" />
                <div className="grid grid-cols-2 gap-3">
                  <Field value={clientForm.industry} onChange={(v) => setClientForm({ ...clientForm, industry: v })} placeholder="Industry" />
                  <Select value={clientForm.status} onChange={(v) => setClientForm({ ...clientForm, status: v })} options={['prospect', 'active', 'inactive', 'churned']} />
                </div>
                <button className="btn-lime w-full rounded-lg"><Plus className="h-4 w-4" />Create client</button>
              </form>
            </Panel>
            <Panel title="Clients">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                <input className="input-dark pl-10" placeholder="Search clients" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Rows rows={filteredClients.map((client) => ({ id: client._id, title: client.companyName, meta: `${client.industry ?? 'General'} / ${client.status}`, value: client.contactPerson?.email }))} />
            </Panel>
          </>
        )}

        {tab === 'sales' && (
          <>
            <Panel title="Add Deal">
              <form onSubmit={createDeal} className="space-y-3">
                <Field value={dealForm.title} onChange={(v) => setDealForm({ ...dealForm, title: v })} placeholder="Deal title" required />
                <Field type="number" value={dealForm.value} onChange={(v) => setDealForm({ ...dealForm, value: v })} placeholder="Value" required />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={dealForm.stage} onChange={(v) => setDealForm({ ...dealForm, stage: v })} options={['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']} />
                  <Field type="number" value={dealForm.probability} onChange={(v) => setDealForm({ ...dealForm, probability: v })} placeholder="Probability" />
                </div>
                <button className="btn-lime w-full rounded-lg"><Plus className="h-4 w-4" />Create deal</button>
              </form>
            </Panel>
            <Panel title="Deals">
              <Rows rows={deals.map((deal) => ({ id: deal._id, title: deal.title, meta: `${deal.stage} / ${deal.probability ?? 0}%`, value: money(deal.value) }))} />
            </Panel>
          </>
        )}

        {tab === 'hr' && (
          <>
            <div className="space-y-5">
              <Panel title="Mark Attendance">
                <form onSubmit={createAttendance} className="space-y-3">
                  <Field type="date" value={attendanceForm.date} onChange={(v) => setAttendanceForm({ ...attendanceForm, date: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={attendanceForm.status} onChange={(v) => setAttendanceForm({ ...attendanceForm, status: v })} options={['present', 'absent', 'late', 'half_day', 'on_leave', 'wfh']} />
                    <Field type="number" value={attendanceForm.workingHours} onChange={(v) => setAttendanceForm({ ...attendanceForm, workingHours: v })} />
                  </div>
                  <button className="btn-lime w-full rounded-lg">Save attendance</button>
                </form>
              </Panel>
              <Panel title="Apply Leave">
                <form onSubmit={createLeave} className="space-y-3">
                  <Select value={leaveForm.leaveType} onChange={(v) => setLeaveForm({ ...leaveForm, leaveType: v })} options={['sick', 'casual', 'paid', 'unpaid', 'other']} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field type="date" value={leaveForm.startDate} onChange={(v) => setLeaveForm({ ...leaveForm, startDate: v })} />
                    <Field type="date" value={leaveForm.endDate} onChange={(v) => setLeaveForm({ ...leaveForm, endDate: v })} />
                  </div>
                  <textarea className="input-dark min-h-[80px]" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Reason" />
                  <button className="btn-lime w-full rounded-lg">Submit leave</button>
                </form>
              </Panel>
            </div>
            <div className="space-y-5">
              <Panel title="Attendance">
                <Rows rows={attendance.map((item) => ({ id: item._id, title: person(item.employee), meta: `${item.status} / ${item.workingHours ?? 0}h`, value: new Date(item.date).toLocaleDateString() }))} />
              </Panel>
              <Panel title="Leaves">
                <Rows rows={leaves.map((leave) => ({ id: leave._id, title: person(leave.employee), meta: `${leave.leaveType} / ${leave.status}`, value: `${leave.totalDays ?? 1} days` }))} />
              </Panel>
            </div>
          </>
        )}

        {tab === 'assets' && (
          <>
            <Panel title="Register Asset">
              <form onSubmit={createAsset} className="space-y-3">
                <Field value={assetForm.name} onChange={(v) => setAssetForm({ ...assetForm, name: v })} placeholder="Asset name" required />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={assetForm.type} onChange={(v) => setAssetForm({ ...assetForm, type: v })} options={['laptop', 'desktop', 'monitor', 'phone', 'tablet', 'furniture', 'other']} />
                  <Select value={assetForm.status} onChange={(v) => setAssetForm({ ...assetForm, status: v })} options={['active', 'in_repair', 'retired', 'sold', 'lost']} />
                </div>
                <Field value={assetForm.location} onChange={(v) => setAssetForm({ ...assetForm, location: v })} placeholder="Location" />
                <Field type="number" value={assetForm.purchasePrice} onChange={(v) => setAssetForm({ ...assetForm, purchasePrice: v })} placeholder="Purchase price" />
                <button className="btn-lime w-full rounded-lg"><Plus className="h-4 w-4" />Register asset</button>
              </form>
            </Panel>
            <Panel title="Assets">
              <Rows rows={assets.map((asset) => ({ id: asset._id, title: asset.name, meta: `${asset.type} / ${asset.status}`, value: asset.purchasePrice ? money(asset.purchasePrice) : asset.location }))} />
            </Panel>
          </>
        )}
      </div>
    </ERPShell>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'up' | 'down' | 'neutral' }) {
  return <Panel><p className="text-sm text-[#6b7280]">{label}</p><p className={tone === 'up' ? 'mt-2 text-2xl font-bold text-[#1f8f4d]' : tone === 'down' ? 'mt-2 text-2xl font-bold text-[#b42318]' : 'mt-2 text-2xl font-bold'}>{value}</p></Panel>;
}

function Rows({ rows }: { rows: Array<{ id: string; title: string; meta: string; value?: string }> }) {
  if (rows.length === 0) return <EmptyState text="No records found" />;
  return <div className="space-y-3">{rows.map((row) => <div key={row.id} className="flex justify-between gap-4 rounded-lg border border-[#ded8c8] p-3"><div><p className="font-semibold">{row.title}</p><p className="text-xs text-[#6b7280]">{row.meta}</p></div>{row.value && <span className="text-sm font-semibold">{row.value}</span>}</div>)}</div>;
}

function person(employee?: Employee) {
  return employee ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() : 'Unassigned';
}

function Field({ value, onChange, type = 'text', placeholder, required }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <input className="input-dark" value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required={required} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select>;
}
