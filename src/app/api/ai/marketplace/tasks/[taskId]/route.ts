/**
 * AI Marketplace Task Detail API
 * GET / PUT / DELETE /api/ai/marketplace/tasks/[taskId]
 * Integrates AI Agent operation lock system
 */

import { NextRequest, NextResponse } from 'next/server'
import { acquireLock, releaseLock } from '@/lib/ai-operation-lock'

export const dynamic = 'force-dynamic'

let pool: any = null

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg')
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

async function authenticate(request: NextRequest) {
  const header = request.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7) : header
  if (!key) return { success: false, error: 'Missing API key', status: 401 }

  try {
    const pg = await getPool()
    const result = await pg.query(`
      SELECT u.id as user_id, u.role as user_role, u."isAI" as user_is_ai
      FROM "APIKey" ak
      JOIN "User" u ON u.id = ak."userId"
      WHERE ak.key = $1 AND ak."isActive" = true
    `, [key])

    if (result.rows.length > 0) {
      return {
        success: true,
        userId: result.rows[0].user_id,
        userRole: result.rows[0].user_role,
        userIsAI: result.rows[0].user_is_ai,
      }
    }
    return { success: false, error: 'Invalid API key', status: 401 }
  } catch (e: any) {
    console.error('[AI API Auth Error]', e?.message)
    return { success: false, error: 'Auth service error', status: 500 }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })

  const pg = await getPool()
  const taskResult = await pg.query(`SELECT * FROM "MarketplaceTask" WHERE id = $1`, [params.taskId])

  if (taskResult.rows.length === 0) {
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  }

  const task = taskResult.rows[0]

  // Increment views
  await pg.query(`UPDATE "MarketplaceTask" SET views = views + 1 WHERE id = $1`, [params.taskId])

  // Get posted by info
  let posterName = 'Unknown'
  try {
    if (task.postedById) {
      const userResult = await pg.query(`SELECT "displayName", username FROM "User" WHERE id = $1`, [task.postedById])
      if (userResult.rows.length > 0) {
        posterName = userResult.rows[0].displayName || userResult.rows[0].username || 'Unknown'
      }
    }
  } catch {}

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
      postedBy: posterName,
      views: (task.views || 0) + 1,
      createdAt: task["createdAt"] ? new Date(task["createdAt"]).toISOString() : null,
      updatedAt: task["updatedAt"] ? new Date(task["updatedAt"]).toISOString() : null,
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })

  const pg = await getPool()

  // Fetch the task to check permissions
  const taskResult = await pg.query(`SELECT * FROM "MarketplaceTask" WHERE id = $1`, [params.taskId])
  if (taskResult.rows.length === 0) {
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  }
  const task = taskResult.rows[0]
  const taskOwnerId = task["postedById"]

  // Permission check logic:
  // 1. Owner can always edit their own tasks
  // 2. Human (guardian) can edit tasks by their AI agents (same ownerId)
  // 3. AI agent can edit tasks posted by their guardian (ownerId matches)
  // 4. Admin/moderator role can edit any task
  let canEdit = false
  let relationship = 'self'

  if (taskOwnerId === auth.userId) {
    canEdit = true
    relationship = 'self'
  } else {
    // Check if the task owner is the guardian of the current user (for AI agents)
    // or if the current user is the guardian of the task owner (for humans)
    const userRelation = await pg.query(`
      SELECT "ownerId", "isAI" FROM "User" WHERE id = $1
    `, [auth.userId])

    if (userRelation.rows.length > 0) {
      const user = userRelation.rows[0]

      // Current user is AI and task owner is their guardian (ownerId matches task owner)
      if (user["ownerId"] === taskOwnerId) {
        canEdit = true
        relationship = 'ai_editing_guardian_task'
      }

      // Current user is human and task owner is their AI agent (user ID matches task owner's ownerId)
      if (!user["isAI"]) {
        const taskOwnerInfo = await pg.query(`
          SELECT "ownerId" FROM "User" WHERE id = $1
        `, [taskOwnerId])
        if (taskOwnerInfo.rows.length > 0 && taskOwnerInfo.rows[0]["ownerId"] === auth.userId) {
          canEdit = true
          relationship = 'guardian_editing_ai_task'
        }
      }
    }
  }

  if (!canEdit) {
    return NextResponse.json({
      success: false,
      error: 'Permission denied. You cannot edit this task.',
      details: {
        taskOwnerId,
        yourId: auth.userId,
        yourRole: auth.userIsAI ? 'AI agent' : 'human',
      },
    }, { status: 403 })
  }

  // Acquire resource lock for editing
  const lockResult = await acquireLock(
    'marketplace_task',
    params.taskId,
    auth.userId!,
    auth.userIsAI ? 'ai' : 'human',
    'update_task',
    60000
  )

  if (!lockResult.success) {
    return NextResponse.json({
      success: false,
      error: lockResult.message || 'Resource locked',
    }, { status: 409 })
  }

  const body = await request.json()
  const allowedFields = ['title', 'description', 'status', 'price', 'currency', 'unit', 'minOrderQty', 'deadline', 'contactInfo', 'keywords', 'attachments', 'budget']

  const updates: string[] = []
  const values: any[] = []
  let idx = 1

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      const col = field === 'deadline' ? 'deadline' :
                  field === 'minOrderQty' ? '"minOrderQty"' :
                  field === 'contactInfo' ? '"contactInfo"' :
                  field === 'status' ? 'status' :
                  field === 'price' ? 'price' :
                  field === 'currency' ? 'currency' :
                  field === 'unit' ? 'unit' :
                  field === 'keywords' ? 'keywords' :
                  field === 'attachments' ? 'attachments' :
                  field === 'budget' ? 'budget' :
                  field
      updates.push(`"${col}" = $${idx}`)
      values.push(field === 'deadline' ? body[field] : body[field])
      idx++
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
  }

  if (body.status) {
    const i = updates.findIndex(u => u.startsWith('"status"'))
    if (i >= 0) values[i] = body.status.toUpperCase()
  }

  updates.push(`"updatedAt" = NOW()`)

  const pg = await getPool()
  const result = await pg.query(`UPDATE "MarketplaceTask" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, [...values, params.taskId])

  // Release lock after successful update
  await releaseLock('marketplace_task', params.taskId, auth.userId!)

  return NextResponse.json({ success: true, data: result.rows[0] })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const auth = await authenticate(request)
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })

  const pg = await getPool()

  // Check permissions before delete
  const taskResult = await pg.query(`SELECT "postedById" FROM "MarketplaceTask" WHERE id = $1`, [params.taskId])
  if (taskResult.rows.length === 0) {
    return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
  }
  const taskOwnerId = taskResult.rows[0]["postedById"]

  let canDelete = false
  if (taskOwnerId === auth.userId) {
    canDelete = true
  } else {
    const userRelation = await pg.query(`SELECT "ownerId", "isAI" FROM "User" WHERE id = $1`, [auth.userId])
    if (userRelation.rows.length > 0) {
      const user = userRelation.rows[0]
      if (user["ownerId"] === taskOwnerId) canDelete = true
      if (!user["isAI"]) {
        const taskOwnerInfo = await pg.query(`SELECT "ownerId" FROM "User" WHERE id = $1`, [taskOwnerId])
        if (taskOwnerInfo.rows.length > 0 && taskOwnerInfo.rows[0]["ownerId"] === auth.userId) canDelete = true
      }
    }
  }

  if (!canDelete) {
    return NextResponse.json({ success: false, error: 'Permission denied. You cannot delete this task.' }, { status: 403 })
  }

  const result = await pg.query(`UPDATE "MarketplaceTask" SET status = 'CANCELLED' WHERE id = $1 RETURNING id`, [params.taskId])

  return NextResponse.json({ success: true, message: 'Task deleted (soft)', data: { id: result.rows[0].id, status: 'CANCELLED' } })
}
