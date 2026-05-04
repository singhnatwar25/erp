import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  relatedTo: 'project' | 'employee' | 'client' | 'vendor' | 'other';
  relatedId: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'digital_wallet';
  status: 'pending' | 'completed' | 'cancelled';
  approvedBy: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget extends Document {
  budgetId: string;
  department: string;
  fiscalYear: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  categories: {
    name: string;
    allocated: number;
    spent: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    relatedTo: {
      type: String,
      enum: ['project', 'employee', 'client', 'vendor', 'other'],
      default: 'other',
    },
    relatedId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'digital_wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: String,
    },
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

const BudgetCategorySchema = new Schema({
  name: { type: String, required: true },
  allocated: { type: Number, required: true },
  spent: { type: Number, default: 0 },
});

const BudgetSchema: Schema<IBudget> = new Schema(
  {
    budgetId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    fiscalYear: {
      type: Number,
      required: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
    },
    spentAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: function(this: any) {
        return (this.allocatedAmount || 0) - (this.spentAmount || 0);
      },
    },
    categories: [BudgetCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
const Budget: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export { Transaction, Budget };
