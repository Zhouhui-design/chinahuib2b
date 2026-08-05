/**
 * AI Marketplace Task Detail API
 * GET / PUT / DELETE /api/ai/marketplace/tasks/[taskId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, requireCapability } from '@/lib/api-key-auth'
import { prisma } from '@/lib/db'
import { TaskStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const auth = await authenticateApiRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const task = await prisma.marketplaceTask.findUnique({
    where: { id: params.taskId },
    include: {
      postedBy: { select: { id: true, username: true, displayName: true } },
      taskApplications: {
        select: { id: true, status: true, createdAt: true },
      },
    },
  })

  if (!task) {
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  }

  await prisma.marketplaceTask.update({
    where: { id: params.taskId },
    data: { views: { increment: 1 } },
  })

  return NextResponse.json({
    success: true,
    data: {
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      price: task.price ? Number(task.price) : null,
      currency: task.currency,
      unit: task.unit,
      minOrderQty: task.minOrderQty,
      deadline: task.deadline?.toISOString() || null,
      countryCode: task.countryCode,
      countryName: task.countryName,
      keywords: task.keywords || [],
      attachments: task.attachments || [],
      contactInfo: task.contactInfo,
      postedById: task.postedById,
      postedBy: task.postedBy?.displayName || task.postedBy?.username,
      views: task.views + 1,
      applicationsCount: task.taskApplications.length,
      createdAt: task.createdAt?.toISOString(),
      updatedAt: task.updatedAt?.toISOString(),
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const auth = await authenticateApiRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const body = await request.json()
  const allowedFields = [
    'title', 'description', 'status', 'price', 'currency', 'unit',
    'minOrderQty', 'deadline', 'contactInfo', 'keywords', 'attachments',
    'budget',
  ]

  const updates: any = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = field === 'deadline' ? new Date(body[field]) : body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
  }

  if (updates.status) {
    updates.status = updates.status.toUpperCase() as TaskStatus
  }

  if (updates.keywords && !Array.isArray(updates.keywords)) {
    return NextResponse.json({ success: false, error: 'keywords must be an array' }, { status: 400 })
  }

  if (updates.attachments && !Array.isArray(updates.attachments)) {
    return NextResponse.json({ success: false, error: 'attachments must be an array' }, { status: 400 })
  }

  updates.updatedAt = new Date()

  const task = await prisma.marketplaceTask.update({
    where: { id: params.taskId },
    data: updates,
    include: { postedBy: { select: { id: true, username: true } } },
  })

  return NextResponse.json({ success: true, data: task })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const auth = await authenticateApiRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const task = await prisma.marketplaceTask.findUnique({
    where: { id: params.taskId },
    select: { postedById: true, status: true },
  })

  if (!task) {
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  }

  const deletedTask = await prisma.marketplaceTask.update({
    where: { id: params.taskId },
    data: { status: TaskStatus.CANCELLED },
  })

  return NextResponse.json({
    success: true,
    message: 'Task deleted (soft delete)',
    data: { id: deletedTask.id, status: 'CANCELLED' },
  })
}
