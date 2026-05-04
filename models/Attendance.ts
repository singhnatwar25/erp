import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'wfh'],
    required: true,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  workingHours: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Unique constraint for employee + date
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
