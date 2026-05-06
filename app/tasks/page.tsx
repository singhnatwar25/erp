'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  CheckSquare,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  User,
  FolderKanban,
  Play,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X
} from 'lucide-react';

interface Task {
  _id: string;
  taskId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project: { name: string; projectId: string };
  assignedTo: { firstName: string; lastName: string };
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [timeTracking, setTimeTracking] = useState<{ taskId: string; hours: number; description: string } | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const queryParams = filterStatus ? `?status=${filterStatus}` : '';
      const response = await fetch(`/api/tasks${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: '#64748B',
      in_progress: '#B9FF66',
      review: '#BC5FCF',
      done: '#4E956A',
    };
    return colors[status] || '#64748B';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#64748B',
      medium: '#459BBE',
      high: '#DC6F31',
      urgent: '#C55050',
    };
    return colors[priority] || '#64748B';
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { id: 'in_progress', title: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
    { id: 'review', title: 'Review', count: tasks.filter(t => t.status === 'review').length },
    { id: 'done', title: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#191E2C]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#191E2C]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-[#191E2C]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Tasks</h1>
                  <p className="text-xs text-[#64748B]">Manage project tasks</p>
                </div>
              </Link>
            </div>
            <button
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              className="btn-lime"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {kanbanColumns.map(col => (
            <div key={col.id} className="card-dark p-4 border-t-4" style={{ borderColor: getStatusColor(col.id) }}>
              <p className="text-sm text-[#64748B]">{col.title}</p>
              <p className="text-2xl font-bold text-white">{col.count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-dark p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-dark pl-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#64748B]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-dark w-40"
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(column => (
            <div key={column.id} className="card-dark p-4 min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(column.id) }} />
                  <h3 className="font-semibold text-white">{column.title}</h3>
                </div>
                <span className="text-sm text-[#64748B] bg-[#1E2538] px-2 py-1 rounded">
                  {filteredTasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {filteredTasks
                  .filter(task => task.status === column.id)
                  .map(task => (
                    <div key={task._id} className="bg-[#1E2538] rounded-xl p-4 hover:bg-[#252B3D] transition-colors group">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-[#64748B] font-mono">{task.taskId}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingTask(task); setShowModal(true); }}
                            className="w-6 h-6 rounded bg-[#3D55B6]/20 text-[#8BA4FF] flex items-center justify-center"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="w-6 h-6 rounded bg-[#C55050]/20 text-[#FF9B9B] flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-white mb-2">{task.title}</h4>
                      <p className="text-sm text-[#64748B] mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getPriorityColor(task.priority)}20`,
                            color: getPriorityColor(task.priority)
                          }}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-[#64748B] flex items-center gap-1">
                          <FolderKanban className="w-3 h-3" />
                          {task.project?.name || 'No Project'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {/* Time tracking */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#64748B]">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {task.actualHours}h / {task.estimatedHours}h
                          </span>
                          <button
                            onClick={() => setTimeTracking({ taskId: task._id, hours: 0, description: '' })}
                            className="text-[#B9FF66] hover:text-[#a8f055] font-medium"
                          >
                            + Log Time
                          </button>
                        </div>
                        {task.estimatedHours > 0 && (
                          <div className="mt-2 h-1 bg-[#252B3D] rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%`,
                                backgroundColor: task.actualHours > task.estimatedHours ? '#C55050' : '#B9FF66'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#252B3D] rounded-2xl max-w-lg w-full border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-[#94A3B8]">Task management form coming soon...</p>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-dark">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Time Tracking Modal */}
      {timeTracking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#252B3D] rounded-2xl max-w-md w-full border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Log Time</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={timeTracking.hours}
                  onChange={(e) => setTimeTracking({ ...timeTracking, hours: parseFloat(e.target.value) })}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Description</label>
                <textarea
                  value={timeTracking.description}
                  onChange={(e) => setTimeTracking({ ...timeTracking, description: e.target.value })}
                  className="input-dark h-20"
                  placeholder="What did you work on?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setTimeTracking(null)} className="btn-dark">Cancel</button>
              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/tasks/time', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        taskId: timeTracking.taskId,
                        hours: timeTracking.hours,
                        description: timeTracking.description,
                      }),
                    });
                    setTimeTracking(null);
                    fetchTasks();
                  } catch (error) {
                    console.error('Error logging time:', error);
                  }
                }}
                className="btn-lime"
              >
                Log Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
