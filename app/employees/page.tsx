'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, EmptyState, ERPShell, Panel, money } from '@/app/components/erp-shell';

type Employee = {
  _id: string;
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

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: 'Engineering',
  position: '',
  salary: '',
  joinDate: new Date().toISOString().slice(0, 10),
  status: 'active',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = useCallback(async () => {
    const response = await fetch('/api/employees');
    const payload = await response.json();
    if (payload.success) setEmployees(payload.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filtered = useMemo(
    () =>
      employees.filter((employee) =>
        `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.department} ${employee.position}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [employees, query]
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (employee: Employee) => {
    setEditing(employee);
    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      salary: String(employee.salary ?? ''),
      joinDate: employee.joinDate?.slice(0, 10) || emptyForm.joinDate,
      status: employee.status,
    });
    setShowForm(true);
  };

  const saveEmployee = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editing ? `/api/employees/${editing._id}` : '/api/employees', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, salary: Number(form.salary || 0) }),
    });
    const payload = await response.json();
    if (payload.success) {
      setShowForm(false);
      await fetchEmployees();
    }
  };

  const deleteEmployee = async (employee: Employee) => {
    if (!confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) return;
    await fetch(`/api/employees/${employee._id}`, { method: 'DELETE' });
    fetchEmployees();
  };

  return (
    <ERPShell
      title="Employees"
      description="Manage office staff, departments, job roles, and employment status."
      action={
        <button onClick={startCreate} className="btn-lime rounded-lg px-4">
          <Plus className="h-4 w-4" />
          Add employee
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Total" value={employees.length} />
            <Metric label="Active" value={employees.filter((e) => e.status === 'active').length} tone="up" />
            <Metric label="On leave" value={employees.filter((e) => e.status === 'on_leave').length} tone="down" />
            <Metric label="Departments" value={new Set(employees.map((e) => e.department)).size} />
          </div>

          <Panel>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              <input className="input-dark pl-10" placeholder="Search employees" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#ded8c8] text-left text-xs uppercase text-[#6b7280]">
                  <tr>
                    <th className="py-3 pr-4">Employee</th>
                    <th className="py-3 pr-4">Department</th>
                    <th className="py-3 pr-4">Position</th>
                    <th className="py-3 pr-4">Salary</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8c8]">
                  {filtered.map((employee) => (
                    <tr key={employee._id}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                        <p className="text-xs text-[#6b7280]">{employee.email}</p>
                      </td>
                      <td className="py-3 pr-4">{employee.department}</td>
                      <td className="py-3 pr-4">{employee.position}</td>
                      <td className="py-3 pr-4">{money(employee.salary)}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={employee.status === 'active' ? 'up' : employee.status === 'on_leave' ? 'down' : 'neutral'}>{employee.status.replaceAll('_', ' ')}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(employee)} className="btn-dark rounded-lg px-3"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteEmployee(employee)} className="btn-dark rounded-lg px-3 text-[#b42318]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filtered.length === 0 && <EmptyState text="No employees found" />}
            </div>
          </Panel>
        </div>

        <Panel title={showForm ? (editing ? 'Edit Employee' : 'New Employee') : 'Employee Form'}>
          {showForm ? (
            <form onSubmit={saveEmployee} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} placeholder="First name" required />
                <Field value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} placeholder="Last name" required />
              </div>
              <Field type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="Email" required />
              <Field value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="Phone" required />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.department} onChange={(v) => setForm({ ...form, department: v })} options={['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support']} />
                <Select value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={['active', 'inactive', 'on_leave']} />
              </div>
              <Field value={form.position} onChange={(v) => setForm({ ...form, position: v })} placeholder="Position" required />
              <div className="grid grid-cols-2 gap-3">
                <Field type="number" value={form.salary} onChange={(v) => setForm({ ...form, salary: v })} placeholder="Salary" required />
                <Field type="date" value={form.joinDate} onChange={(v) => setForm({ ...form, joinDate: v })} required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-lime flex-1 rounded-lg">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-dark rounded-lg px-4">Cancel</button>
              </div>
            </form>
          ) : (
            <EmptyState text="Select Add employee or edit a row." />
          )}
        </Panel>
      </div>
    </ERPShell>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'up' | 'down' | 'neutral' }) {
  return (
    <Panel>
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className={tone === 'up' ? 'mt-2 text-3xl font-bold text-[#1f8f4d]' : tone === 'down' ? 'mt-2 text-3xl font-bold text-[#b42318]' : 'mt-2 text-3xl font-bold'}>{value}</p>
    </Panel>
  );
}

function Field({ value, onChange, type = 'text', placeholder, required }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <input className="input-dark" value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required={required} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
    </select>
  );
}
