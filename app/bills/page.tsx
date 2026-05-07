'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  Settings,
  Layout,
  CheckSquare,
  X,
  ArrowUpRight
} from 'lucide-react';
import { billPDFGenerator, type BillData } from '@/lib/pdf-generator';

// Types
interface BillField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'address' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  order: number;
}

interface BillTemplate {
  _id: string;
  name: string;
  description?: string;
  fields: BillField[];
  isActive: boolean;
}

interface Bill {
  _id: string;
  billId: string;
  templateId: string;
  templateName: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
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
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  customFields: Record<string, any>;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

export default function BillManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'bills' | 'templates'>('bills');
  
  // Modal states
  const [showBillModal, setShowBillModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<BillTemplate | null>(null);
  
  // Form states
  const [billForm, setBillForm] = useState({
    templateId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    billNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxRate: '0',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    customFields: {} as Record<string, any>,
  });
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    fields: [] as BillField[],
  });

  const fetchBills = useCallback(async () => {
    try {
      const queryParams = filterStatus ? `?status=${filterStatus}` : '';
      const response = await fetch(`/api/bills${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setBills(data.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  }, [filterStatus]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/bills/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBills(), fetchTemplates()]).finally(() => {
      setLoading(false);
    });
  }, [fetchBills, fetchTemplates]);

  const handleCreateBill = () => {
    setEditingBill(null);
    setBillForm({
      templateId: templates[0]?._id || '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      billNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      taxRate: '0',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      customFields: {},
    });
    setShowBillModal(true);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setBillForm({
      templateId: bill.templateId,
      clientName: bill.clientName,
      clientEmail: bill.clientEmail || '',
      clientPhone: bill.clientPhone || '',
      clientAddress: bill.clientAddress || '',
      billNumber: bill.billNumber,
      issueDate: bill.issueDate.split('T')[0],
      dueDate: bill.dueDate.split('T')[0],
      taxRate: bill.taxRate.toString(),
      notes: bill.notes || '',
      items: bill.items,
      customFields: bill.customFields || {},
    });
    setShowBillModal(true);
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    try {
      const response = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchBills();
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const handleDownloadPDF = async (bill: Bill) => {
    try {
      const billData: BillData = {
        billId: bill.billId,
        templateName: bill.templateName,
        clientName: bill.clientName,
        clientEmail: bill.clientEmail,
        clientPhone: bill.clientPhone,
        clientAddress: bill.clientAddress,
        billNumber: bill.billNumber,
        issueDate: bill.issueDate,
        dueDate: bill.dueDate,
        status: bill.status,
        subtotal: bill.subtotal,
        taxRate: bill.taxRate,
        taxAmount: bill.taxAmount,
        total: bill.total,
        currency: bill.currency,
        notes: bill.notes,
        items: bill.items,
        customFields: bill.customFields,
      };

      const pdfBlob = await billPDFGenerator.generatePDF(billData);
      billPDFGenerator.downloadPDF(pdfBlob, `invoice-${bill.billNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate item totals
    const items = billForm.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    
    const payload = {
      ...billForm,
      items,
      taxRate: parseFloat(billForm.taxRate),
    };
    
    try {
      const url = editingBill ? `/api/bills/${editingBill._id}` : '/api/bills';
      const method = editingBill ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        setShowBillModal(false);
        fetchBills();
      }
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleAddItem = () => {
    setBillForm({
      ...billForm,
      items: [...billForm.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const items = [...billForm.items];
    items[index] = { ...items[index], [field]: value };
    
    // Recalculate total if quantity or price changed
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].total = items[index].quantity * items[index].unitPrice;
    }
    
    setBillForm({ ...billForm, items });
  };

  const handleRemoveItem = (index: number) => {
    if (billForm.items.length > 1) {
      setBillForm({
        ...billForm,
        items: billForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#64748B',
      sent: '#459BBE',
      paid: '#4E956A',
      overdue: '#C55050',
      cancelled: '#DC6F31',
    };
    return colors[status] || '#64748B';
  };

  const filteredBills = bills.filter(bill =>
    bill.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191E2C] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#B9FF66] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#94A3B8]">Loading bills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191E2C] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#1E2538] border-r border-white/5 z-50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9FF66] flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#191E2C]" />
            </div>
            <span className="text-xl font-bold text-white">Bills</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <Layout className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/bills" as any
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-[#B9FF66] text-[#191E2C] font-medium"
          >
            <FileText className="h-5 w-5" />
            <span>Bills</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bill Management</h1>
            <p className="text-[#94A3B8]">Create and manage invoices and bills</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn-dark flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Templates</span>
            </button>
            <button
              onClick={handleCreateBill}
              className="btn-lime flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Bill</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('bills')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'bills'
                ? 'text-white border-b-2 border-[#B9FF66]'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Bills ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-white border-b-2 border-[#B9FF66]'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Templates ({templates.length})
          </button>
        </div>

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-dark pl-10 w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-dark"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Bills List */}
            <div className="card-dark">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Bill #</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Client</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Template</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Issue Date</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Due Date</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Total</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Status</th>
                      <th className="text-left p-4 text-[#94A3B8] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <span className="font-mono text-sm text-white">{bill.billId}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-white">{bill.clientName}</p>
                            {bill.clientEmail && (
                              <p className="text-xs text-[#64748B]">{bill.clientEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#94A3B8]">{bill.templateName}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#94A3B8]">{formatDate(bill.issueDate)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-[#94A3B8]">{formatDate(bill.dueDate)}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-white">{formatCurrency(bill.total)}</span>
                        </td>
                        <td className="p-4">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getStatusColor(bill.status)}20`,
                              color: getStatusColor(bill.status)
                            }}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditBill(bill)}
                              className="w-8 h-8 rounded-lg bg-[#3D55B6]/20 text-[#8BA4FF] flex items-center justify-center hover:bg-[#3D55B6]/30"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(bill)}
                              className="w-8 h-8 rounded-lg bg-[#4E956A]/20 text-[#7DD3A0] flex items-center justify-center hover:bg-[#4E956A]/30"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="w-8 h-8 rounded-lg bg-[#C55050]/20 text-[#FF9B9B] flex items-center justify-center hover:bg-[#C55050]/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredBills.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                    <p className="text-[#64748B]">No bills found</p>
                    <button
                      onClick={handleCreateBill}
                      className="btn-lime mt-4"
                    >
                      Create your first bill
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template._id} className="card-dark p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-[#64748B]">{template.description}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#B9FF66]/20 flex items-center justify-center">
                    <Layout className="h-4 w-4 text-[#B9FF66]" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-[#94A3B8] mb-2">Fields ({template.fields.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field) => (
                      <span
                        key={field.id}
                        className="px-2 py-1 bg-[#252B3D] rounded text-xs text-[#94A3B8]"
                      >
                        {field.label}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="px-2 py-1 bg-[#252B3D] rounded text-xs text-[#94A3B8]">
                        +{template.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="btn-dark flex-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="btn-dark flex-1">
                    <CheckSquare className="h-4 w-4" />
                    Use
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => setShowTemplateModal(true)}
              className="card-dark p-6 border-2 border-dashed border-white/10 hover:border-[#B9FF66]/50 transition-colors"
            >
              <Plus className="h-8 w-8 text-[#64748B] mx-auto mb-3" />
              <p className="text-[#94A3B8]">Create Template</p>
            </button>
          </div>
        )}

        {/* Bill Modal */}
        {showBillModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#252B3D] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSaveBill}>
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">
                    {editingBill ? 'Edit Bill' : 'Create New Bill'}
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm text-[#94A3B8] mb-2">Template</label>
                    <select
                      value={billForm.templateId}
                      onChange={(e) => setBillForm({ ...billForm, templateId: e.target.value })}
                      className="input-dark w-full"
                      required
                    >
                      <option value="">Select Template</option>
                      {templates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Client Name *</label>
                      <input
                        type="text"
                        value={billForm.clientName}
                        onChange={(e) => setBillForm({ ...billForm, clientName: e.target.value })}
                        className="input-dark w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Client Email</label>
                      <input
                        type="email"
                        value={billForm.clientEmail}
                        onChange={(e) => setBillForm({ ...billForm, clientEmail: e.target.value })}
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Client Phone</label>
                      <input
                        type="tel"
                        value={billForm.clientPhone}
                        onChange={(e) => setBillForm({ ...billForm, clientPhone: e.target.value })}
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Bill Number *</label>
                      <input
                        type="text"
                        value={billForm.billNumber}
                        onChange={(e) => setBillForm({ ...billForm, billNumber: e.target.value })}
                        className="input-dark w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Issue Date *</label>
                      <input
                        type="date"
                        value={billForm.issueDate}
                        onChange={(e) => setBillForm({ ...billForm, issueDate: e.target.value })}
                        className="input-dark w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Due Date *</label>
                      <input
                        type="date"
                        value={billForm.dueDate}
                        onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                        className="input-dark w-full"
                        required
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm text-[#94A3B8]">Items</label>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="btn-lime text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {billForm.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                              className="input-dark w-full"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="input-dark w-full"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="input-dark w-full"
                              required
                            />
                          </div>
                          <div className="col-span-1">
                            <input
                              type="text"
                              value={formatCurrency(item.total)}
                              readOnly
                              className="input-dark w-full bg-[#1E2538]"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="w-full h-10 rounded-lg bg-[#C55050]/20 text-[#FF9B9B] flex items-center justify-center hover:bg-[#C55050]/30"
                              disabled={billForm.items.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tax and Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Tax Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={billForm.taxRate}
                        onChange={(e) => setBillForm({ ...billForm, taxRate: e.target.value })}
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#94A3B8] mb-2">Notes</label>
                      <textarea
                        value={billForm.notes}
                        onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                        className="input-dark w-full h-20"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBillModal(false)}
                    className="btn-dark"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-lime">
                    {editingBill ? 'Update' : 'Create'} Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
