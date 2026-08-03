import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as orderService from '@/services/orderService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, reason, docs } = body;

    if (!type || !reason) {
      return NextResponse.json({ error: 'Dispute type and reason are required' }, { status: 400 });
    }

    const result = await orderService.createDispute(
      id,
      session.user.id,
      type,
      reason,
      docs
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.order,
      message: result.message,
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
