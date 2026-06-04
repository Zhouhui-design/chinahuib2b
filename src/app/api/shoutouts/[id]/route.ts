import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as shoutOutService from '@/services/shoutOutService';

// GET /api/shoutouts/[id] - Get shout out by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Increment view count
    await shoutOutService.incrementViewCount(params.id);

    const shoutOut = await shoutOutService.getShoutOutById(params.id);
    if (!shoutOut) {
      return NextResponse.json({ error: 'Shout out not found' }, { status: 404 });
    }

    return NextResponse.json(shoutOut);
  } catch (error) {
    console.error('Error fetching shout out:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shoutouts/[id]/reaction - Add reaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reactionType } = body;

    const updatedShoutOut = await shoutOutService.addReaction(
      params.id,
      session.user.id,
      reactionType
    );

    return NextResponse.json(updatedShoutOut);
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/shoutouts/[id] - Delete shout out
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shoutOut = await shoutOutService.getShoutOutById(params.id);
    if (!shoutOut) {
      return NextResponse.json({ error: 'Shout out not found' }, { status: 404 });
    }

    // Check ownership or admin
    if (shoutOut.senderId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await shoutOutService.deleteShoutOut(params.id);
    return NextResponse.json({ message: 'Shout out deleted successfully' });
  } catch (error) {
    console.error('Error deleting shout out:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}