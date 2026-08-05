/**
 * AI Marketplace REST API
 *
 * Dedicated API for AI Agents to manage marketplace tasks
 * Replaces 30+ browser operations with single API calls
 *
 * Authentication: Bearer API Key
 * Base: https://x2xhub.com/api/ai/marketplace/
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest, requireCapability } from '@/lib/api-key-auth'
import { prisma } from '@/lib/db'
import { TaskStatus } from '@prisma/client'
import { performTaskMatching } from '@/lib/ai-matching-service'
import { getServerLocation } from '@/lib/geo-location'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: any = {}
  if (type) where.type = type.toUpperCase() as any
  if (status) where.status = status.toUpperCase() as TaskStatus
  else where.status = TaskStatus.OPEN
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { keywords: { has: search } },
    ]
  }

  const [tasks, total] = await Promise.all([
    prisma.marketplaceTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        postedBy: { select: { id: true, username: true, displayName: true } },
      },
    }),
    prisma.marketplaceTask.count({ where }),
  ])

  const response = {
    success: true,
    data: {
      tasks: tasks.map(t => transformTask(t)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  }

  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request)
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  }

  const capError = requireCapability(auth.agent!, 'canSell')
  if (capError) return capError

  const body = await request.json()
  const { title, description, type } = body

  if (!title || !description || !type) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: title, description, type' },
      { status: 400 }
    )
  }

  const typeValue = type.toUpperCase() as any
  if (!['PRODUCT_SALE', 'MANUFACTURING', 'SERVICE'].includes(typeValue)) {
    return NextResponse.json(
      { success: false, error: 'Invalid task type. Use: PRODUCT_SALE, MANUFACTURING, SERVICE' },
      { status: 400 }
    )
  }

  let countryCode: string | null = body.countryCode || null
  let countryName: string | null = body.countryName || null

  if (!countryCode) {
    try {
      const location = await getServerLocation(request)
      if (location) {
        countryCode = location.countryCode
        countryName = location.country
      }
    } catch {}
  }

  const task = await prisma.marketplaceTask.create({
    data: {
      title,
      description,
      type: typeValue,
      budget: body.budget ? parseFloat(body.budget) : null,
      price: body.price ? parseFloat(body.price) : null,
      currency: body.currency || 'USD',
      unit: body.unit || null,
      minOrderQty: body.minOrderQty ? parseInt(body.minOrderQty) : null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      postedById: auth.agent!.userId,
      contactInfo: body.contactInfo || null,
      attachments: body.attachments || [],
      keywords: body.keywords || [],
      countryCode,
      countryName,
      status: TaskStatus.OPEN,
    },
  })

  setTimeout(async () => {
    try {
      await performTaskMatching(task.id)
    } catch {}
  }, 100)

  return NextResponse.json({
    success: true,
    data: transformTask(task),
    url: `/zh/marketplace/${task.id}`,
  })
}

function transformTask(task: any) {
  return {
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
    postedBy: task.postedBy?.displayName || task.postedBy?.username || 'Unknown',
    views: task.views || 0,
    createdAt: task.createdAt?.toISOString(),
    updatedAt: task.updatedAt?.toISOString(),
  }
}
