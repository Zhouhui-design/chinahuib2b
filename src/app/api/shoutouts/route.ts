import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as shoutOutService from '@/services/shoutOutService';

// GET /api/shoutouts - Get all active shout outs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const tags = searchParams.get('tags')?.split(',') || [];
    const location = searchParams.get('location');

    const shoutOuts = await shoutOutService.getActiveShoutOuts(type || undefined, tags, location);
    return NextResponse.json(shoutOuts);
  } catch (error) {
    console.error('Error fetching shout outs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shoutouts - Create new shout out
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const shoutOut = await shoutOutService.createShoutOut(session.user.id, {
      content: body.content,
      isFree: body.isFree,
      cost: body.cost,
      paymentId: body.paymentId,
      priority: body.priority,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      type: body.type,
      tags: body.tags,
      location: body.location,
    });

    return NextResponse.json(shoutOut, { status: 201 });
  } catch (error: any) {
    console.error('Error creating shout out:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}