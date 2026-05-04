import mongoose from 'mongoose';

const CommunicationSchema = new mongoose.Schema({
  communicationId: {
    type: String,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'call', 'meeting', 'video_call', 'sms', 'note'],
    required: true,
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number, // in minutes for calls
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  attachments: [{
    name: String,
    url: String,
  }],
  followUpDate: {
    type: Date,
  },
  followUpRequired: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

CommunicationSchema.pre('save', async function(next) {
  if (!this.communicationId) {
    const count = await mongoose.model('Communication').countDocuments();
    this.communicationId = `COM${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Communication || mongoose.model('Communication', CommunicationSchema);
