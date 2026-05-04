'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building2
} from 'lucide-react';

interface Employee {
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
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    salary: '',
    joinDate: '',
    status: 'active',
  });

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support'];
  const statusOptions = ['active', 'inactive', 'on_leave'];

  useEffect(() => {
    fetchEmployees();
  }, [filterDepartment]);

  const fetchEmployees = async () => {
    try {
      const queryParams = filterDepartment ? `?department=${filterDepartment}` : '';
      const response = await fetch(`/api/employees${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee._id}` 
        : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingEmployee(null);
        resetForm();
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      position: employee.position,
      salary: employee.salary.toString(),
      joinDate: employee.joinDate.split('T')[0],
      status: employee.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      position: '',
      salary: '',
      joinDate: '',
      status: 'active',
    });
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    resetForm();
    setShowModal(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: 'bg-[#4E956A]/20 text-[#4E956A] ring-1 ring-[#4E956A]/30',
      inactive: 'bg-[#64748B]/20 text-[#64748B] ring-1 ring-[#64748B]/30',
      on_leave: 'bg-[#DC6F31]/20 text-[#DC6F31] ring-1 ring-[#DC6F31]/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${classes[status] || classes.inactive}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getDeptColor = (dept: string) => {
    const colors: Record<string, string> = {
      'Engineering': '#3D55B6',
      'Sales': '#4E956A',
      'Marketing': '#DC6F31',
      'HR': '#BC5FCF',
      'Finance': '#459BBE',
      'Operations': '#C55050',
      'Support': '#B9FF66',
    };
    return colors[dept] || '#3D55B6';
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
                  <Users className="h-5 w-5 text-[#191E2C]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Users</h1>
                  <p className="text-xs text-[#64748B]">Manage your team</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openAddModal}
                className="btn-lime"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Employee</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-dark p-5">
            <p className="text-sm text-[#64748B] mb-1">Total Employees</p>
            <p className="text-3xl font-bold text-white">{employees.length}</p>
          </div>
          <div className="card-dark p-5 border-l-4 border-[#4E956A]">
            <p className="text-sm text-[#64748B] mb-1">Active</p>
            <p className="text-3xl font-bold text-[#4E956A]">
              {employees.filter(e => e.status === 'active').length}
            </p>
          </div>
          <div className="card-dark p-5 border-l-4 border-[#DC6F31]">
            <p className="text-sm text-[#64748B] mb-1">On Leave</p>
            <p className="text-3xl font-bold text-[#DC6F31]">
              {employees.filter(e => e.status === 'on_leave').length}
            </p>
          </div>
          <div className="card-dark p-5 border-l-4 border-[#BC5FCF]">
            <p className="text-sm text-[#64748B] mb-1">Departments</p>
            <p className="text-3xl font-bold text-[#BC5FCF]">
              {new Set(employees.map(e => e.department)).size}
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-dark pl-12"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#64748B]" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="input-dark w-48"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="card-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94A3B8]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-[#B9FF66] border-t-transparent rounded-full animate-spin" />
                      Loading employees...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: getDeptColor(employee.department) }}
                        >
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-[#64748B]">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getDeptColor(employee.department)}20`,
                          color: getDeptColor(employee.department)
                        }}
                      >
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8]">{employee.position}</td>
                    <td className="px-6 py-4">{getStatusBadge(employee.status)}</td>
                    <td className="px-6 py-4 text-[#94A3B8]">
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="w-8 h-8 rounded-lg bg-[#3D55B6]/20 text-[#8BA4FF] hover:bg-[#3D55B6]/30 flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
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
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-dark"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Join Date</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-dark"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="btn-dark"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lime">
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
