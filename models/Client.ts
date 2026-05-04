import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  industry: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'churned'],
    default: 'active',
  },
  leadSource: {
    type: String,
    enum: ['referral', 'website', 'social_media', 'email', 'cold_call', 'event', 'other'],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date,
  }],
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Auto-generate client ID
ClientSchema.pre('save', async function(next) {
  if (!this.clientId) {
    const count = await mongoose.model('Client').countDocuments();
    this.clientId = `CLI${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
