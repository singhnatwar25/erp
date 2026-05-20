'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, EmptyState, ERPShell, Panel, money } from '@/app/components/erp-shell';

type Project = {
  _id: string;
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
  projectManager: string;
  assignedEmployees: string[];
  technologies: string[];
};

const emptyForm = {
  name: '',
  description: '',
  client: '',
  status: 'planning',
  priority: 'medium',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  budget: '',
  progress: '0',
  projectManager: '',
  assignedEmployees: '',
  technologies: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchProjects = useCallback(async () => {
    const response = await fetch('/api/projects');
    const payload = await response.json();
    if (payload.success) setProjects(payload.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(
    () => projects.filter((project) => `${project.name} ${project.client} ${project.projectManager}`.toLowerCase().includes(query.toLowerCase())),
    [projects, query]
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description,
      client: project.client,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate?.slice(0, 10) || emptyForm.startDate,
      endDate: project.endDate?.slice(0, 10) || emptyForm.endDate,
      budget: String(project.budget ?? ''),
      progress: String(project.progress ?? 0),
      projectManager: project.projectManager,
      assignedEmployees: project.assignedEmployees?.join(', ') ?? '',
      technologies: project.technologies?.join(', ') ?? '',
    });
    setShowForm(true);
  };

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editing ? `/api/projects/${editing._id}` : '/api/projects', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        budget: Number(form.budget || 0),
        progress: Number(form.progress || 0),
        assignedEmployees: form.assignedEmployees.split(',').map((item) => item.trim()).filter(Boolean),
        technologies: form.technologies.split(',').map((item) => item.trim()).filter(Boolean),
      }),
    });
    const payload = await response.json();
    if (payload.success) {
      setShowForm(false);
      await fetchProjects();
    }
  };

  const deleteProject = async (project: Project) => {
    if (!confirm(`Delete ${project.name}?`)) return;
    await fetch(`/api/projects/${project._id}`, { method: 'DELETE' });
    fetchProjects();
  };

  return (
    <ERPShell
      title="Projects"
      description="Manage delivery, client work, progress, budgets, and project ownership."
      action={<button onClick={startCreate} className="btn-lime rounded-lg px-4"><Plus className="h-4 w-4" />Add project</button>}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Total" value={projects.length} />
            <Metric label="In progress" value={projects.filter((p) => p.status === 'in_progress').length} tone="up" />
            <Metric label="Completed" value={projects.filter((p) => p.status === 'completed').length} tone="up" />
            <Metric label="Budget" value={money(projects.reduce((sum, p) => sum + Number(p.budget || 0), 0))} />
          </div>
          <Panel>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              <input className="input-dark pl-10" placeholder="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#ded8c8] text-left text-xs uppercase text-[#6b7280]">
                  <tr>
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Progress</th>
                    <th className="py-3 pr-4">Budget</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8c8]">
                  {filtered.map((project) => (
                    <tr key={project._id}>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-[#6b7280]">{project.projectId}</p>
                      </td>
                      <td className="py-3 pr-4">{project.client}</td>
                      <td className="py-3 pr-4"><Badge tone={project.status === 'completed' ? 'up' : project.status === 'cancelled' ? 'down' : 'neutral'}>{project.status.replaceAll('_', ' ')}</Badge></td>
                      <td className="py-3 pr-4">
                        <div className="h-2 w-28 rounded-full bg-[#f7f7f7]">
                          <div className="h-2 rounded-full bg-[#1f2937]" style={{ width: `${Math.min(project.progress || 0, 100)}%` }} />
                        </div>
                        <span className="text-xs text-[#6b7280]">{project.progress}%</span>
                      </td>
                      <td className="py-3 pr-4">{money(project.budget)}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(project)} className="btn-dark rounded-lg px-3"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteProject(project)} className="btn-dark rounded-lg px-3 text-[#b42318]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filtered.length === 0 && <EmptyState text="No projects found" />}
            </div>
          </Panel>
        </div>

        <Panel title={showForm ? (editing ? 'Edit Project' : 'New Project') : 'Project Form'}>
          {showForm ? (
            <form onSubmit={saveProject} className="space-y-3">
              <Field value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Project name" required />
              <textarea className="input-dark min-h-[88px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
              <div className="grid grid-cols-2 gap-3">
                <Field value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="Client" required />
                <Field value={form.projectManager} onChange={(v) => setForm({ ...form, projectManager: v })} placeholder="Manager" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']} />
                <Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={['low', 'medium', 'high', 'urgent']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} required />
                <Field type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field type="number" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="Budget" required />
                <Field type="number" value={form.progress} onChange={(v) => setForm({ ...form, progress: v })} placeholder="Progress %" />
              </div>
              <Field value={form.assignedEmployees} onChange={(v) => setForm({ ...form, assignedEmployees: v })} placeholder="Assigned employees, comma separated" />
              <Field value={form.technologies} onChange={(v) => setForm({ ...form, technologies: v })} placeholder="Tools/technologies, comma separated" />
              <div className="flex gap-2">
                <button type="submit" className="btn-lime flex-1 rounded-lg">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-dark rounded-lg px-4">Cancel</button>
              </div>
            </form>
          ) : <EmptyState text="Select Add project or edit a row." />}
        </Panel>
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

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select>;
}
