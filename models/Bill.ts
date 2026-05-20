import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBillField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'address' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[]; // For select type
  defaultValue?: string;
  order: number;
}

export interface IBillTemplate extends Document {
  name: string;
  description?: string;
  fields: IBillField[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBill extends Document {
  billId: string;
  templateId: mongoose.Types.ObjectId;
  templateName: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  billNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  customFields: Record<string, any>;
  pdfUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BillFieldSchema = new Schema<IBillField>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'number', 'date', 'email', 'phone', 'address', 'select', 'textarea', 'checkbox']
  },
  required: { type: Boolean, default: false },
  options: [String],
  defaultValue: String,
  order: { type: Number, required: true },
});

const BillTemplateSchema: Schema<IBillTemplate> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fields: [BillFieldSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BillSchema: Schema<IBill> = new Schema(
  {
    billId: {
      type: String,
      required: true,
      unique: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'BillTemplate',
      required: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    clientAddress: {
      type: String,
      trim: true,
    },
    billNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    notes: {
      type: String,
      trim: true,
    },
    items: [{
      description: {
        type: String,
        required: true,
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    customFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    pdfUrl: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate bill ID before saving
BillSchema.pre('save', async function(next) {
  if (this.isNew && !this.billId) {
    const BillModel = this.constructor as Model<IBill>;
    const count = await BillModel.countDocuments();
    this.billId = `BILL-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const BillTemplate: Model<IBillTemplate> = mongoose.models.BillTemplate || mongoose.model<IBillTemplate>('BillTemplate', BillTemplateSchema);
const Bill: Model<IBill> = mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);

export { BillTemplate, Bill };
