import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['laptop', 'desktop', 'monitor', 'phone', 'tablet', 'server', 'network_equipment', 'furniture', 'vehicle', 'other'],
    required: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  serialNumber: {
    type: String,
    trim: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  vendor: {
    type: String,
    trim: true,
  },
  warrantyExpiry: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'in_repair', 'retired', 'sold', 'lost'],
    default: 'active',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  location: {
    type: String,
    trim: true,
  },
  specifications: {
    type: Map,
    of: String,
  },
  documents: [{
    name: String,
    url: String,
    type: String,
  }],
  maintenanceHistory: [{
    date: Date,
    description: String,
    cost: Number,
    performedBy: String,
  }],
  depreciation: {
    method: {
      type: String,
      enum: ['straight_line', 'declining_balance'],
      default: 'straight_line',
    },
    usefulLife: Number, // in years
    salvageValue: Number,
    currentValue: Number,
  },
}, {
  timestamps: true,
});

AssetSchema.pre('save', async function(next) {
  if (!this.assetId) {
    const count = await mongoose.model('Asset').countDocuments();
    this.assetId = `AST${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate depreciation
  if (this.depreciation && this.depreciation.method === 'straight_line' && this.depreciation.usefulLife) {
    const age = (new Date().getTime() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const annualDepreciation = (this.purchasePrice - (this.depreciation.salvageValue || 0)) / this.depreciation.usefulLife;
    const totalDepreciation = annualDepreciation * age;
    this.depreciation.currentValue = Math.max(this.purchasePrice - totalDepreciation, this.depreciation.salvageValue || 0);
  }
  
  next();
});

export default mongoose.models.Asset || mongoose.model('Asset', AssetSchema);
