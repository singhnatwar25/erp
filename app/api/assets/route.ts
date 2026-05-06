import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/assets - Get all assets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const assignedTo = searchParams.get('assignedTo');

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json({
      success: true,
      data: demoData.listCollection('assets', { status, type, assignedTo }),
    });
  }

  try {
    await connectDB();

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const assets = await Asset.find(query)
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!(await isDatabaseAvailable())) {
    return NextResponse.json(
      { success: true, data: demoData.createCollectionItem('assets', body) },
      { status: 201 }
    );
  }

  try {
    await connectDB();

    const asset = await Asset.create(body);
    await asset.populate('assignedTo');
    
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
