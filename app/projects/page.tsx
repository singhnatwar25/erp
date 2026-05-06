'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Project {
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
  assignedEmployees: string[];
  projectManager: string;
  technologies: string[];
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    projectManager: '',
    assignedEmployees: '',
    technologies: '',
    progress: '0',
  });

  const statusOptions = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];

  const fetchProjects = useCallback(async () => {
    try {
      const queryParams = filterStatus ? `?status=${filterStatus}` : '';
      const response = await fetch(`/api/projects${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProject 
        ? `/api/projects/${editingProject._id}` 
        : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
          progress: Number(formData.progress),
          assignedEmployees: formData.assignedEmployees.split(',').map(s => s.trim()).filter(Boolean),
          technologies: formData.technologies.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingProject(null);
        resetForm();
        fetchProjects();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      client: project.client,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      budget: project.budget.toString(),
      projectManager: project.projectManager,
      assignedEmployees: project.assignedEmployees.join(', '),
      technologies: project.technologies.join(', '),
      progress: project.progress.toString(),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      projectManager: '',
      assignedEmployees: '',
      technologies: '',
      progress: '0',
    });
  };

  const openAddModal = () => {
    setEditingProject(null);
    resetForm();
    setShowModal(true);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.projectManager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      planning: 'bg-[#459BBE]/20 text-[#8DD4F0] ring-1 ring-[#459BBE]/30',
      in_progress: 'bg-[#B9FF66]/20 text-[#B9FF66] ring-1 ring-[#B9FF66]/30',
      on_hold: 'bg-[#DC6F31]/20 text-[#FFB088] ring-1 ring-[#DC6F31]/30',
      completed: 'bg-[#4E956A]/20 text-[#8FD9B0] ring-1 ring-[#4E956A]/30',
      cancelled: 'bg-[#C55050]/20 text-[#FF9B9B] ring-1 ring-[#C55050]/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes[status] || classes.planning}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const classes: Record<string, string> = {
      low: 'bg-[#64748B]/20 text-[#94A3B8] ring-1 ring-[#64748B]/30',
      medium: 'bg-[#459BBE]/20 text-[#8DD4F0] ring-1 ring-[#459BBE]/30',
      high: 'bg-[#DC6F31]/20 text-[#FFB088] ring-1 ring-[#DC6F31]/30',
      urgent: 'bg-[#C55050]/20 text-[#FF9B9B] ring-1 ring-[#C55050]/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: '#459BBE',
      in_progress: '#B9FF66',
      on_hold: '#DC6F31',
      completed: '#4E956A',
      cancelled: '#C55050',
    };
    return colors[status] || '#459BBE';
  };

  return (
    <div className="min-h-screen bg-[#191E2C]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#191E2C]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-[#191E2C]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Projects</h1>
                  <p className="text-xs text-[#64748B]">Track and manage projects</p>
                </div>
              </Link>
            </div>
            <button
              onClick={openAddModal}
              className="btn-lime"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Project</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-dark p-5">
            <p className="text-sm text-[#64748B] mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="card-dark p-5 border-l-4 border-[#B9FF66]">
            <p className="text-sm text-[#64748B] mb-1">In Progress</p>
            <p className="text-3xl font-bold text-[#B9FF66]">
              {projects.filter(p => p.status === 'in_progress').length}
            </p>
          </div>
          <div className="card-dark p-5 border-l-4 border-[#4E956A]">
            <p className="text-sm text-[#64748B] mb-1">Completed</p>
            <p className="text-3xl font-bold text-[#4E956A]">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div className="card-dark p-5 border-l-4 border-[#DC6F31]">
            <p className="text-sm text-[#64748B] mb-1">On Hold</p>
            <p className="text-3xl font-bold text-[#DC6F31]">
              {projects.filter(p => p.status === 'on_hold').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-dark p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search projects..."
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
                className="input-dark w-48"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="card-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Project</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Timeline</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-[#B9FF66] border-t-transparent rounded-full animate-spin" />
                      Loading projects...
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-[#64748B]">{project.projectId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8]">{project.client}</td>
                    <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                    <td className="px-6 py-4">{getPriorityBadge(project.priority)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#252B3D] rounded-full h-2 w-24">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%`, backgroundColor: getStatusColor(project.status) }}
                          />
                        </div>
                        <span className="text-sm text-[#94A3B8]">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="w-8 h-8 rounded-lg bg-[#3D55B6]/20 text-[#8BA4FF] hover:bg-[#3D55B6]/30 flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="w-8 h-8 rounded-lg bg-[#C55050]/20 text-[#FF9B9B] hover:bg-[#C55050]/30 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#252B3D] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-dark h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Client</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Project Manager</label>
                  <input
                    type="text"
                    value={formData.projectManager}
                    onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-dark"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-dark"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Budget</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="input-dark"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Assigned Employees (comma separated)</label>
                <input
                  type="text"
                  value={formData.assignedEmployees}
                  onChange={(e) => setFormData({ ...formData, assignedEmployees: e.target.value })}
                  className="input-dark"
                  placeholder="e.g. John Doe, Jane Smith"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="input-dark"
                  placeholder="e.g. React, Node.js, MongoDB"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="btn-dark"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime">
                  {editingProject ? 'Update' : 'Add'} Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
