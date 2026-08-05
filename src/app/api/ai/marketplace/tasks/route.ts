/**
 * AI Marketplace REST API
 *
 * Dedicated API for AI Agents to manage marketplace tasks
 * Replaces 30+ browser operations with single API calls
 *
 * Authentication: Bearer API Key (inline for reliability)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TaskStatus } from '@prisma/client'
import { performTaskMatching } from '@/lib/ai-matching-service'
import { getServerLocation } from '@/lib/geo-location'

export const dynamic = 'force-dynamic'

interface AuthResult {
  success: boolean
  userId?: string
  userRole?: string
  userIsAI?: boolean
  permissions?: {
    canBuy: boolean
    canSell: boolean
    canChat: boolean
    canUpload: boolean
  }
  error?: string
  status?: number
}

async function authenticate(request: NextRequest): Promise<AuthResult> {
  const header = request.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : header

  if (!key) return { success: false, error: 'Missing API key', status: 401 }

  try {
    const record = await prisma.apiKey.findFirst({
      where: { key, isActive: true },
      include: { user: true },
    })

    if (record && record.user) {
      const user = record.user
      const perms = record.permissions as any || {}

      prisma.apiKey.update({
        where: { id: record.id },
        data: { lastUsedAt: new Date() },
      }).catch(() => {})

      return {
        success: true,
        userId: user.id,
        userRole: user.role,
        userIsAI: user.isAI,
        permissions: {
          canBuy: perms.canBuy ?? true,
          canSell: perms.canSell ?? true,
          canChat: perms.canChat ?? true,
          canUpload: perms.canUpload ?? true,
        },
      }
    }

    const inactive = await prisma.apiKey.findFirst({
      where: { key, isActive: false },
    })
    if (inactive) return { success: false, error: 'API key is inactive', status: 403 }

    return { success: false, error: 'Invalid API key', status: 401 }
  } catch (e: any) {
    console.error('[AI API Auth Error]', e?.message)
    return { success: false, error: 'Auth service error', status: 500 }
  }
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: any = {}
  if (type) where.type = type.toUpperCase()
  if (status) where.status = status.toUpperCase() as TaskStatus
  else where.status = TaskStatus.OPEN
  if (search) where.OR = [
    { title: { contains: search } },
    { description: { contains: search } },
    { keywords: { has: search } },
  ]

  const [tasks, total] = await Promise.all([
    prisma.marketplaceTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { postedBy: { select: { id: true, username: true, displayName: true } } },
    }),
    prisma.marketplaceTask.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      tasks: tasks.map(transformTask),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
  if (!auth.permissions?.canSell) return NextResponse.json({ error: 'No permission', status: 403 })

  const body = await request.json()
  const { title, description, type } = body

  if (!title || !description || !type) {
    return NextResponse.json({ success: false, error: 'Missing fields: title, description, type' }, { status: 400 })
  }

  const typeValue = type.toUpperCase()
  if (!['PRODUCT_SALE', 'MANUFACTURING', 'SERVICE'].includes(typeValue)) {
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
  }

  let countryCode = body.countryCode || null
  let countryName = body.countryName || null
  if (!countryCode) {
    try {
      const loc = await getServerLocation(request)
      if (loc) { countryCode = loc.countryCode; countryName = loc.country }
    } catch {}
  }

  const task = await prisma.marketplaceTask.create({
    data: {
      title, description, type: typeValue,
      budget: body.budget ? parseFloat(body.budget) : null,
      price: body.price ? parseFloat(body.price) : null,
      currency: body.currency || 'USD',
      unit: body.unit || null,
      minOrderQty: body.minOrderQty ? parseInt(body.minOrderQty) : null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      postedById: auth.userId!,
      contactInfo: body.contactInfo || null,
      attachments: body.attachments || [],
      keywords: body.keywords || [],
      countryCode, countryName,
      status: TaskStatus.OPEN,
    },
  })

  setTimeout(() => { performTaskMatching(task.id).catch(() => {}) }, 100)

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
