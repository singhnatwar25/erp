'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, EmptyState, ERPShell, Panel } from '@/app/components/erp-shell';

type Task = {
  _id: string;
  taskId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: { _id?: string; name: string; projectId?: string };
  assignedTo?: { _id?: string; firstName: string; lastName: string };
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
};

const emptyForm = {
  title: '',
  description: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
  dueDate: new Date().toISOString().slice(0, 10),
  estimatedHours: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [timeTask, setTimeTask] = useState<Task | null>(null);
  const [timeForm, setTimeForm] = useState({ hours: '1', description: '' });

  const fetchTasks = useCallback(async () => {
    const response = await fetch('/api/tasks');
    const payload = await response.json();
    if (payload.success) setTasks(payload.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = useMemo(
    () => tasks.filter((task) => `${task.title} ${task.description} ${task.project?.name ?? ''}`.toLowerCase().includes(query.toLowerCase())),
    [tasks, query]
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.slice(0, 10) || emptyForm.dueDate,
      estimatedHours: String(task.estimatedHours ?? ''),
    });
    setShowForm(true);
  };

  const saveTask = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(editing ? `/api/tasks/${editing._id}` : '/api/tasks', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, estimatedHours: Number(form.estimatedHours || 0) }),
    });
    const payload = await response.json();
    if (payload.success) {
      setShowForm(false);
      await fetchTasks();
    }
  };

  const deleteTask = async (task: Task) => {
    if (!confirm(`Delete ${task.title}?`)) return;
    await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const logTime = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!timeTask) return;
    await fetch('/api/tasks/time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: timeTask._id, hours: Number(timeForm.hours || 0), description: timeForm.description }),
    });
    setTimeTask(null);
    setTimeForm({ hours: '1', description: '' });
    fetchTasks();
  };

  return (
    <ERPShell
      title="Tasks"
      description="Plan work, track status, priority, due dates, and time spent."
      action={<button onClick={startCreate} className="btn-lime rounded-lg px-4"><Plus className="h-4 w-4" />New task</button>}
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Metric label="To do" value={tasks.filter((t) => t.status === 'todo').length} />
            <Metric label="In progress" value={tasks.filter((t) => t.status === 'in_progress').length} tone="up" />
            <Metric label="Review" value={tasks.filter((t) => t.status === 'review').length} />
            <Metric label="Done" value={tasks.filter((t) => t.status === 'done').length} tone="up" />
          </div>
          <Panel>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
              <input className="input-dark pl-10" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filtered.map((task) => (
                <article key={task._id} className="rounded-lg border border-[#ded8c8] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#6b7280]">{task.taskId}</p>
                      <h3 className="font-semibold">{task.title}</h3>
                    </div>
                    <Badge tone={task.status === 'done' ? 'up' : task.priority === 'urgent' ? 'down' : 'neutral'}>{task.status.replaceAll('_', ' ')}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[#6b7280]">{task.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
                    <span>{task.project?.name || 'No project'}</span>
                    <span>{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</span>
                    <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'none'}</span>
                    <span><Clock className="mr-1 inline h-3 w-3" />{task.actualHours || 0}h / {task.estimatedHours || 0}h</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => startEdit(task)} className="btn-dark rounded-lg px-3"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setTimeTask(task)} className="btn-dark rounded-lg px-3">Log time</button>
                    <button onClick={() => deleteTask(task)} className="btn-dark rounded-lg px-3 text-[#b42318]"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              ))}
              {!loading && filtered.length === 0 && <EmptyState text="No tasks found" />}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title={showForm ? (editing ? 'Edit Task' : 'New Task') : 'Task Form'}>
            {showForm ? (
              <form onSubmit={saveTask} className="space-y-3">
                <Field value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Task title" required />
                <textarea className="input-dark min-h-[96px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.status} onChange={(v) => setForm({ ...form, status: v as Task['status'] })} options={['todo', 'in_progress', 'review', 'done']} />
                  <Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v as Task['priority'] })} options={['low', 'medium', 'high', 'urgent']} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
                  <Field type="number" value={form.estimatedHours} onChange={(v) => setForm({ ...form, estimatedHours: v })} placeholder="Estimate hours" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-lime flex-1 rounded-lg">{editing ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-dark rounded-lg px-4">Cancel</button>
                </div>
              </form>
            ) : <EmptyState text="Select New task or edit a card." />}
          </Panel>

          <Panel title="Log Time">
            {timeTask ? (
              <form onSubmit={logTime} className="space-y-3">
                <p className="font-semibold">{timeTask.title}</p>
                <Field type="number" value={timeForm.hours} onChange={(v) => setTimeForm({ ...timeForm, hours: v })} placeholder="Hours" required />
                <textarea className="input-dark min-h-[80px]" value={timeForm.description} onChange={(e) => setTimeForm({ ...timeForm, description: e.target.value })} placeholder="Work notes" />
                <div className="flex gap-2">
                  <button type="submit" className="btn-lime flex-1 rounded-lg">Save time</button>
                  <button type="button" onClick={() => setTimeTask(null)} className="btn-dark rounded-lg px-4">Cancel</button>
                </div>
              </form>
            ) : <EmptyState text="Choose Log time on a task." />}
          </Panel>
        </div>
      </div>
    </ERPShell>
  );
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'up' | 'down' | 'neutral' }) {
  return <Panel><p className="text-sm text-[#6b7280]">{label}</p><p className={tone === 'up' ? 'mt-2 text-3xl font-bold text-[#1f8f4d]' : tone === 'down' ? 'mt-2 text-3xl font-bold text-[#b42318]' : 'mt-2 text-3xl font-bold'}>{value}</p></Panel>;
}

function Field({ value, onChange, type = 'text', placeholder, required }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <input className="input-dark" value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required={required} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select className="input-dark" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select>;
}
