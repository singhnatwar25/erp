import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },
  estimatedHours: {
    type: Number,
    default: 0,
  },
  actualHours: {
    type: Number,
    default: 0,
  },
  timeEntries: [{
    date: Date,
    hours: Number,
    description: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date,
  }],
}, {
  timestamps: true,
});

// Auto-generate task ID
TaskSchema.pre('save', async function(next) {
  if (!this.taskId) {
    const count = await mongoose.model('Task').countDocuments();
    this.taskId = `TSK${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
