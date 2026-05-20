import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { BillTemplate } from '@/models/Bill';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/bills/templates - Get all bill templates
export async function GET(request: NextRequest) {
  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listBillTemplates(),
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
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createBillTemplate(body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();
    
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
