import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  issueDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  items: [{
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  balanceDue: {
    type: Number,
    default: function() {
      return (this as any).total - (this as any).amountPaid;
    },
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'paypal', 'cash', 'check', 'other'],
  },
  notes: {
    type: String,
    trim: true,
  },
  terms: {
    type: String,
    trim: true,
  },
  payments: [{
    date: Date,
    amount: Number,
    method: String,
    reference: String,
  }],
}, {
  timestamps: true,
});

InvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceId = `INV${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.total = this.subtotal + this.taxAmount - this.discount;
  this.balanceDue = this.total - this.amountPaid;
  
  next();
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
