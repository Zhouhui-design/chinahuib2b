import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as taskService from '@/services/taskService';
import { TaskStatus, TaskType } from '@prisma/client';

// GET /api/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | undefined;
    const type = searchParams.get('type') as TaskType | undefined;
    const search = searchParams.get('search');

    const tasks = await taskService.getTasks(status, type, search);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const task = await taskService.createTask(session.user.id, {
      title: body.title,
      description: body.description,
      type: body.type,
      budget: body.budget,
      price: body.price,
      currency: body.currency,
      unit: body.unit,
      minOrderQty: body.minOrderQty,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      contactInfo: body.contactInfo,
      attachments: body.attachments,
      milestones: body.milestones,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}