import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import { isDatabaseAvailable } from '@/lib/database';
import { demoData } from '@/lib/demo-data';

// GET /api/clients/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const client = demoData.getCollectionItem('clients', id);
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: client });
  }

  try {
    await connectDB();
    const client = await Client.findById(id)
      .populate('assignedTo', 'firstName lastName');
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const client = demoData.updateCollectionItem('clients', id, body);
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: client });
  }

  try {
    await connectDB();

    const client = await Client.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName');
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isDatabaseAvailable())) {
    const client = demoData.deleteCollectionItem('clients', id);
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Client deleted' });
  }

  try {
    await connectDB();
    const client = await Client.findByIdAndDelete(id);
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
