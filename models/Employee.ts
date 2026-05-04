import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: Date;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support'],
    },
    position: {
      type: String,
      required: true,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
    address: {
      type: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    skills: [String],
  },
  {
    timestamps: true,
  }
);

const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
