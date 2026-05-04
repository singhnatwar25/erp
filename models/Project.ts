import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  projectId: string;
  name: string;
  description: string;
  client: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate: Date;
  budget: number;
  assignedEmployees: string[];
  projectManager: string;
  progress: number;
  technologies: string[];
  milestones: {
    title: string;
    dueDate: Date;
    completed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

const ProjectSchema: Schema<IProject> = new Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    assignedEmployees: [String],
    projectManager: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    technologies: [String],
    milestones: [MilestoneSchema],
  },
  {
    timestamps: true,
  }
);

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
