/**
 * AI Marketplace REST API
 *
 * Dedicated API for AI Agents to manage marketplace tasks
 * Uses direct SQL for auth to avoid Prisma module resolution issues
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

let pool: any = null

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg')
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

interface AuthResult {
  success: boolean
  userId?: string
  userRole?: string
  userIsAI?: boolean
  permissions?: { canBuy: boolean; canSell: boolean; canChat: boolean; canUpload: boolean }
  error?: string
  status?: number
}

async function authenticate(request: NextRequest): Promise<AuthResult> {
  const header = request.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : header
  if (!key) return { success: false, error: 'Missing API key', status: 401 }

  try {
    const pg = await getPool()
    const result = await pg.query(`
      SELECT ak.id as key_id, ak.name as key_name, ak.permissions,
             u.id as user_id, u.role as user_role, u."isAI" as user_is_ai
      FROM "APIKey" ak
      JOIN "User" u ON u.id = ak."userId"
      WHERE ak.key = $1 AND ak."isActive" = true
    `, [key])

    if (result.rows.length > 0) {
      const row = result.rows[0]
      const perms = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || {})

      // Update last used (non-blocking)
      pg.query(`UPDATE "APIKey" SET "lastUsedAt" = NOW() WHERE id = $1`, [row.key_id]).catch(() => {})

      return {
        success: true,
        userId: row.user_id,
        userRole: row.user_role,
        userIsAI: row.user_is_ai || false,
        permissions: {
          canBuy: perms.canBuy ?? true,
          canSell: perms.canSell ?? true,
          canChat: perms.canChat ?? true,
          canUpload: perms.canUpload ?? true,
        },
      }
    }

    // Check inactive
    const inactive = await pg.query(`SELECT 1 FROM "APIKey" WHERE key = $1 AND "isActive" = false`, [key])
    if (inactive.rows.length > 0) return { success: false, error: 'API key is inactive', status: 403 }

    return { success: false, error: 'Invalid API key', status: 401 }
  } catch (e: any) {
    console.error('[AI API Auth Error]', e?.message)
    return { success: false, error: 'Auth service error', status: 500 }
  }
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })

  const pg = await getPool()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const where: string[] = []
  const params: any[] = []
  let paramIdx = 1

  if (type) { where.push(`type = $${paramIdx}`); params.push(type.toUpperCase()); paramIdx++ }
  if (status) { where.push(`status = $${paramIdx}`); params.push(status.toUpperCase()); paramIdx++ }
  else { where.push(`status = 'OPEN'`) }

  if (search) {
    where.push(`(title ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`)
    params.push(`%${search}%`)
    paramIdx++
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''

  const totalResult = await pg.query(`SELECT COUNT(*) as total FROM "MarketplaceTask" ${whereClause}`, params)
  const total = parseInt(totalResult.rows[0].total)

  const tasksResult = await pg.query(`
    SELECT t.*, u.username as poster_name, u."displayName" as poster_display_name
    FROM "MarketplaceTask" t
    LEFT JOIN "User" u ON u.id = t."postedById"
    ${whereClause}
    ORDER BY t."createdAt" DESC
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `, [...params, limit, (page - 1) * limit])

  const tasks = tasksResult.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    price: row.price ? Number(row.price) : null,
    currency: row.currency,
    unit: row.unit,
    minOrderQty: row["minOrderQty"],
    deadline: row.deadline ? new Date(row.deadline).toISOString() : null,
    countryCode: row["countryCode"],
    countryName: row["countryName"],
    keywords: row.keywords || [],
    attachments: row.attachments || [],
    contactInfo: row["contactInfo"],
    postedById: row["postedById"],
    postedBy: row.poster_display_name || row.poster_name || 'Unknown',
    views: row.views || 0,
    createdAt: row["createdAt"] ? new Date(row["createdAt"]).toISOString() : null,
    updatedAt: row["updatedAt"] ? new Date(row["updatedAt"]).toISOString() : null,
  }))

  return NextResponse.json({
    success: true,
    data: { tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  })
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })

  const pg = await getPool()
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
      const locRes = await fetch('http://ip-api.com/json/?fields=countryCode,country')
      if (locRes.ok) {
        const loc = await locRes.json()
        countryCode = loc.countryCode || null
        countryName = loc.country || null
      }
    } catch {}
  }

  const result = await pg.query(`
    INSERT INTO "MarketplaceTask" (
      id, title, description, type, budget, price, currency, unit,
      "minOrderQty", deadline, "postedById", "contactInfo", attachments,
      keywords, "countryCode", "countryName", status, "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12,
      $13, $14, $15, 'OPEN', NOW(), NOW()
    ) RETURNING *
  `, [
    title, description, typeValue,
    body.budget ? parseFloat(body.budget) : null,
    body.price ? parseFloat(body.price) : null,
    body.currency || 'USD',
    body.unit || null,
    body.minOrderQty ? parseInt(body.minOrderQty) : null,
    body.deadline || null,
    auth.userId!,
    body.contactInfo || null,
    JSON.stringify(body.attachments || []),
    JSON.stringify(body.keywords || []),
    countryCode, countryName,
  ])

  const task = result.rows[0]

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
      minOrderQty: task["minOrderQty"],
      deadline: task.deadline ? new Date(task.deadline).toISOString() : null,
      countryCode: task["countryCode"],
      countryName: task["countryName"],
      keywords: task.keywords || [],
      attachments: task.attachments || [],
      contactInfo: task["contactInfo"],
      postedById: task["postedById"],
      views: task.views || 0,
      createdAt: task["createdAt"] ? new Date(task["createdAt"]).toISOString() : null,
      updatedAt: task["updatedAt"] ? new Date(task["updatedAt"]).toISOString() : null,
    },
    url: `/zh/marketplace/${task.id}`,
  })
}
