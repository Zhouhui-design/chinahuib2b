import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as taskService from '@/services/taskService';

// POST /api/tasks/[id]/deliverables - Submit deliverable
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

    const deliverable = await taskService.submitDeliverable(
      params.id,
      session.user.id,
      {
        title: body.title,
        description: body.description,
        files: body.files,
      }
    );

    return NextResponse.json(deliverable, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting deliverable:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id]/deliverables/[deliverableId]/approve - Approve deliverable
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deliverableId = searchParams.get('deliverableId');

    if (!deliverableId) {
      return NextResponse.json({ error: 'Deliverable ID is required' }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const approvedDeliverable = await taskService.approveDeliverable(deliverableId);
    return NextResponse.json(approvedDeliverable);
  } catch (error) {
    console.error('Error approving deliverable:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]/deliverables/[deliverableId]/reject - Reject deliverable
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deliverableId = searchParams.get('deliverableId');
    const reviewNotes = searchParams.get('reviewNotes') || '';

    if (!deliverableId) {
      return NextResponse.json({ error: 'Deliverable ID is required' }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rejectedDeliverable = await taskService.rejectDeliverable(deliverableId, reviewNotes);
    return NextResponse.json(rejectedDeliverable);
  } catch (error) {
    console.error('Error rejecting deliverable:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}