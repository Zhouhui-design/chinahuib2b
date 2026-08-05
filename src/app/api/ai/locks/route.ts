/**
 * AI Agent Lock Management API
 * GET /api/ai/locks/status - Check lock status for a resource
 * POST /api/ai/locks/acquire - Acquire a lock
 * POST /api/ai/locks/release - Release a lock
 */

import { NextRequest, NextResponse } from 'next/server'
import { acquireLock, releaseLock, checkLock, getActiveLocks, setGlobalLock, releaseGlobalLock } from '@/lib/ai-operation-lock'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const resourceType = searchParams.get('resourceType')
  const resourceId = searchParams.get('resourceId')
  const all = searchParams.get('all')

  if (all === 'true') {
    const locks = await getActiveLocks()
    return NextResponse.json({ success: true, data: { total: locks.length, locks } })
  }

  if (!resourceType || !resourceId) {
    return NextResponse.json({ success: false, error: 'resourceType and resourceId required' }, { status: 400 })
  }

  const result = await checkLock(resourceType, resourceId)
  return NextResponse.json({ success: true, data: result })
}

export async function POST(request: NextRequest) {
  const { action, resourceType, resourceId, agentId, agentRole, operation, ttlMs, global } = await request.json()

  if (global) {
    if (action === 'lock') {
      await setGlobalLock(ttlMs || 3600000, 'API-triggered global lock')
      return NextResponse.json({ success: true, message: 'Global lock set' })
    }
    if (action === 'unlock') {
      await releaseGlobalLock()
      return NextResponse.json({ success: true, message: 'Global lock released' })
    }
  }

  if (!resourceType || !resourceId || !agentId || !action) {
    return NextResponse.json({ success: false, error: 'Missing required fields: resourceType, resourceId, agentId, action' }, { status: 400 })
  }

  if (action === 'acquire') {
    const result = await acquireLock(
      resourceType,
      resourceId,
      agentId,
      agentRole || 'ai',
      operation || 'general',
      ttlMs || 300000
    )
    return NextResponse.json({ success: result.success, data: result })
  }

  if (action === 'release') {
    const result = await releaseLock(resourceType, resourceId, agentId)
    return NextResponse.json({ success: true, data: result })
  }

  return NextResponse.json({ success: false, error: 'Invalid action. Use "acquire" or "release"' }, { status: 400 })
}
