import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as taskService from '@/services/taskService';

// POST /api/tasks/[id]/apply - Apply to a task
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

    const application = await taskService.applyToTask(params.id, session.user.id, {
      message: body.message,
      quote: body.quote,
      deliveryTime: body.deliveryTime,
      bondAmount: body.bondAmount,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error applying to task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id]/apply/[applicationId]/accept - Accept application
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
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const acceptedApplication = await taskService.acceptApplication(applicationId);
    return NextResponse.json(acceptedApplication);
  } catch (error) {
    console.error('Error accepting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]/apply/[applicationId]/reject - Reject application
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
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Verify the task belongs to the user
    const task = await taskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.postedById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rejectedApplication = await taskService.rejectApplication(applicationId);
    return NextResponse.json(rejectedApplication);
  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}