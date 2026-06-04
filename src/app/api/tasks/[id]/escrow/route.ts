import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as taskService from '@/services/taskService';

// POST /api/tasks/[id]/escrow - Create escrow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const escrow = await taskService.createEscrow(
      params.id,
      body.amount,
      body.currency || 'USD'
    );

    return NextResponse.json(escrow, { status: 201 });
  } catch (error) {
    console.error('Error creating escrow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id]/escrow/fund - Fund escrow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!task.taskEscrow) {
      return NextResponse.json({ error: 'Escrow not found for this task' }, { status: 404 });
    }

    const body = await request.json();
    const fundedEscrow = await taskService.fundEscrow(task.taskEscrow.id, body.transactionId);

    return NextResponse.json(fundedEscrow);
  } catch (error) {
    console.error('Error funding escrow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks/[id]/escrow/release - Release funds
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!task.taskEscrow) {
      return NextResponse.json({ error: 'Escrow not found for this task' }, { status: 404 });
    }

    const body = await request.json();
    const releasedEscrow = await taskService.releaseEscrow(task.taskEscrow.id, body.amount);

    return NextResponse.json(releasedEscrow);
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}