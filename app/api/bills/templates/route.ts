import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BillTemplate } from '@/models/Bill';
import { isDatabaseAvailable } from '@/lib/database';

// GET /api/bills/templates - Get all bill templates
export async function GET(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    // Return default template
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: 'default-template',
          name: 'Standard Invoice',
          description: 'Basic invoice template with common fields',
          isActive: true,
          fields: [
            { id: 'clientName', name: 'clientName', label: 'Client Name', type: 'text', required: true, order: 1 },
            { id: 'clientEmail', name: 'clientEmail', label: 'Client Email', type: 'email', required: false, order: 2 },
            { id: 'clientPhone', name: 'clientPhone', label: 'Client Phone', type: 'phone', required: false, order: 3 },
            { id: 'clientAddress', name: 'clientAddress', label: 'Client Address', type: 'address', required: false, order: 4 },
            { id: 'billNumber', name: 'billNumber', label: 'Bill Number', type: 'text', required: true, order: 5 },
            { id: 'issueDate', name: 'issueDate', label: 'Issue Date', type: 'date', required: true, order: 6 },
            { id: 'dueDate', name: 'dueDate', label: 'Due Date', type: 'date', required: true, order: 7 },
            { id: 'taxRate', name: 'taxRate', label: 'Tax Rate (%)', type: 'number', required: false, order: 8 },
            { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false, order: 9 },
          ],
        }
      ],
    });
  }

  try {
    await connectDB();
    
    const templates = await BillTemplate.find({ isActive: true })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Bill Templates API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bill templates' },
      { status: 500 }
    );
  }
}

// POST /api/bills/templates - Create new bill template
export async function POST(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    
    const template = new BillTemplate({
      ...body,
      createdBy: 'demo-user', // Replace with actual user ID from auth
    });
    
    await template.save();
    
    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Create Bill Template Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bill template' },
      { status: 500 }
    );
  }
}
