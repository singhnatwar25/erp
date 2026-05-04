import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  leaveId: {
    type: String,
    unique: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'paid', 'unpaid', 'maternity', 'paternity', 'bereavement', 'other'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  approvedDate: {
    type: Date,
  },
  comments: {
    type: String,
    trim: true,
  },
  attachments: [{
    name: String,
    url: String,
  }],
}, {
  timestamps: true,
});

// Auto-generate leave ID
LeaveSchema.pre('save', async function(next) {
  if (!this.leaveId) {
    const count = await mongoose.model('Leave').countDocuments();
    this.leaveId = `LEV${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
