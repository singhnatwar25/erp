import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

// GET /api/clients/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const client = await Client.findById(params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const client = await Client.findByIdAndUpdate(
      params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const client = await Client.findByIdAndDelete(params.id);
    
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
