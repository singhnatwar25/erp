import mongoose from 'mongoose';

const DealSchema = new mongoose.Schema({
  dealId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  stage: {
    type: String,
    enum: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'lead',
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  expectedCloseDate: {
    type: Date,
  },
  actualCloseDate: {
    type: Date,
  },
  description: {
    type: String,
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  proposal: {
    documentUrl: String,
    sentDate: Date,
    acceptedDate: Date,
  },
  products: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number,
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

DealSchema.pre('save', async function(next) {
  if (!this.dealId) {
    const count = await mongoose.model('Deal').countDocuments();
    this.dealId = `DL${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Deal || mongoose.model('Deal', DealSchema);
