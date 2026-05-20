'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Edit2, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, EmptyState, ERPShell, Panel, money } from '@/app/components/erp-shell';
import { billPDFGenerator, type BillData } from '@/lib/pdf-generator';

type Bill = {
  _id: string;
  billId: string;
  templateId: string;
  templateName: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
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
  customFields: Record<string, unknown>;
};

type Template = {
  _id: string;
  name: string;
};

const emptyForm = {
  templateId: 'default-template',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  billNumber: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  status: 'draft' as Bill['status'],
  taxRate: '0',
  notes: '',
  description: '',
  quantity: '1',
  unitPrice: '',
};

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Bill | null>(null);
  const [preview, setPreview] = useState<Bill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchBills = useCallback(async () => {
    const [billResponse, templateResponse] = await Promise.all([fetch('/api/bills'), fetch('/api/bills/templates')]);
    const billPayload = await billResponse.json();
    const templatePayload = await templateResponse.json();
    if (billPayload.success) setBills(billPayload.data);
    if (templatePayload.success) setTemplates(templatePayload.data);
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const filtered = useMemo(
    () => bills.filter((bill) => `${bill.clientName} ${bill.billNumber} ${bill.status}`.toLowerCase().includes(query.toLowerCase())),
    [bills, query]
  );

  const receivables = bills.filter((bill) => ['draft', 'sent', 'overdue'].includes(bill.status)).reduce((sum, bill) => sum + Number(bill.total || 0), 0);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, templateId: templates[0]?._id || 'default-template' });
    setShowForm(true);
  };

  const startEdit = (bill: Bill) => {
    const firstItem = bill.items?.[0] ?? { description: '', quantity: 1, unitPrice: 0 };
    setEditing(bill);
    setForm({
      templateId: bill.templateId,
      clientName: bill.clientName,
      clientEmail: bill.clientEmail ?? '',
      clientPhone: bill.clientPhone ?? '',
      billNumber: bill.billNumber,
      issueDate: bill.issueDate?.slice(0, 10) || emptyForm.issueDate,
      dueDate: bill.dueDate?.slice(0, 10) || emptyForm.dueDate,
      status: bill.status,
      taxRate: String(bill.taxRate ?? 0),
      notes: bill.notes ?? '',
      description: firstItem.description,
      quantity: String(firstItem.quantity),
      unitPrice: String(firstItem.unitPrice),
    });
    setShowForm(true);
  };

  const saveBill = async (event: React.FormEvent) => {
    event.preventDefault();
    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(form.unitPrice || 0);
    const item = { description: form.description, quantity, unitPrice, total: quantity * unitPrice };
    const response = await fetch(editing ? `/api/bills/${editing._id}` : '/api/bills', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: form.templateId,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        billNumber: form.billNumber,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        status: form.status,
        taxRate: Number(form.taxRate || 0),
        notes: form.notes,
        items: [item],
        customFields: {},
      }),
    });
    const payload = await response.json();
    if (payload.success) {
      setShowForm(false);
      fetchBills();
    }
  };

  const deleteBill = async (bill: Bill) => {
    if (!confirm(`Delete invoice ${bill.billNumber}?`)) return;
    await fetch(`/api/bills/${bill._id}`, { method: 'DELETE' });
    fetchBills();
  };

  const downloadPDF = async (bill: Bill) => {
    const pdfBlob = await billPDFGenerator.generatePDF(bill as BillData);
    billPDFGenerator.downloadPDF(pdfBlob, `invoice-${bill.billNumber}.pdf`);
  };

  return (
    <ERPShell
      title="Bills"
      description="Create invoices, track payment status, and export PDF bills."
      action={<button onClick={startCreate} className="btn-lime rounded-lg px-4"><Plus className="h-4 w-4" />New bill</button>}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Invoices" value={bills.length} />
            <Metric label="Receivables" value={money(receivables)} />
            <Metric label="Paid" value={bills.filter((bill) => bill.status === 'paid').length} tone="up" />
            <Metric label="Overdue" value={bills.filter((bill) => bill.status === 'overdue').length} tone="down" />
          </div>
          <Panel>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              <input className="input-dark pl-10" placeholder="Search invoices" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#ded8c8] text-left text-xs uppercase text-[#6b7280]">
                  <tr>
                    <th className="py-3 pr-4">Invoice</th>
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 pr-4">Due</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8c8]">
                  {filtered.map((bill) => (
                    <tr key={bill._id}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{bill.billNumber}</p>
                        <p className="text-xs text-[#6b7280]">{bill.billId}</p>
                      </td>
                      <td className="py-3 pr-4">{bill.clientName}</td>
                      <td className="py-3 pr-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 font-semibold">{money(bill.total)}</td>
                      <td className="py-3 pr-4"><Badge tone={bill.status === 'paid' ? 'up' : bill.status === 'overdue' ? 'down' : 'neutral'}>{bill.status}</Badge></td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setPreview(bill)} className="btn-dark rounded-lg px-3"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => downloadPDF(bill)} className="btn-dark rounded-lg px-3"><Download className="h-4 w-4" /></button>
                          <button onClick={() => startEdit(bill)} className="btn-dark rounded-lg px-3"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteBill(bill)} className="btn-dark rounded-lg px-3 text-[#b42318]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <EmptyState text="No bills found" />}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title={showForm ? (editing ? 'Edit Bill' : 'New Bill') : 'Bill Form'}>
            {showForm ? (
              <form onSubmit={saveBill} className="space-y-3">
                <Select value={form.templateId} onChange={(v) => setForm({ ...form, templateId: v })} options={templates.map((template) => template._id)} labels={Object.fromEntries(templates.map((template) => [template._id, template.name]))} />
                <Field value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} placeholder="Client name" required />
                <div className="grid grid-cols-2 gap-3">
                  <Field type="email" value={form.clientEmail} onChange={(v) => setForm({ ...form, clientEmail: v })} placeholder="Email" />
                  <Field value={form.clientPhone} onChange={(v) => setForm({ ...form, clientPhone: v })} placeholder="Phone" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field value={form.billNumber} onChange={(v) => setForm({ ...form, billNumber: v })} placeholder="Invoice number" required />
                  <Select value={form.status} onChange={(v) => setForm({ ...form, status: v as Bill['status'] })} options={['draft', 'sent', 'paid', 'overdue', 'cancelled']} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field type="date" value={form.issueDate} onChange={(v) => setForm({ ...form, issueDate: v })} />
                  <Field type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
                </div>
                <Field value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Line item description" required />
                <div className="grid grid-cols-3 gap-3">
                  <Field type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} placeholder="Qty" required />
                  <Field type="number" value={form.unitPrice} onChange={(v) => setForm({ ...form, unitPrice: v })} placeholder="Price" required />
                  <Field type="number" value={form.taxRate} onChange={(v) => setForm({ ...form, taxRate: v })} placeholder="Tax %" />
                </div>
                <textarea className="input-dark min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
                <button type="submit" className="btn-lime w-full rounded-lg">{editing ? 'Update' : 'Create'} bill</button>
              </form>
            ) : <EmptyState text="Select New bill or edit an invoice." />}
          </Panel>

          <Panel title="Preview">
            {preview ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-[#6b7280]">Invoice</p>
                  <p className="text-xl font-bold">{preview.billNumber}</p>
                </div>
                <p><strong>Client:</strong> {preview.clientName}</p>
                <p><strong>Due:</strong> {new Date(preview.dueDate).toLocaleDateString()}</p>
                <div className="rounded-lg border border-[#ded8c8] p-3">
                  {preview.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.description}</span>
                      <span>{money(item.total)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-right text-lg font-bold">Total {money(preview.total)}</p>
              </div>
            ) : <EmptyState text="Open a bill preview." />}
          </Panel>
        </div>
      </div>
    </ERPShell>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'up' | 'down' | 'neutral' }) {
  return <Panel><p className="text-sm text-[#6b7280]">{label}</p><p className={tone === 'up' ? 'mt-2 text-3xl font-bold text-[#1f8f4d]' : tone === 'down' ? 'mt-2 text-3xl font-bold text-[#b42318]' : 'mt-2 text-3xl font-bold'}>{value}</p></Panel>;
}

function Field({ value, onChange, type = 'text', placeholder, required }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <input className="input-dark" value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required={required} />;
}

function Select({ value, onChange, options, labels = {} }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option.replaceAll('_', ' ')}</option>)}</select>;
}
