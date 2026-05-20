/**
 * API Key Management Routes
 * POST /api/ai-agent/keys - Create new API key
 * GET /api/ai-agent/keys - List all API keys
 * DELETE /api/ai-agent/keys/:id - Delete API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

/**
 * Generate a secure API key
 */
function generateAPIKey(): string {
  return `sk_live_${randomBytes(32).toString('hex')}`
}

/**
 * GET /api/ai-agent/keys
 * List all API keys for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user session
    // For now, using a mock userId for testing
    const userId = 'test-user-123' // Replace with actual session.userId
    
    const apiKeys = await prisma.aPIKey.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        key: true,
        role: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        rateLimit: true
      }
    })

    return NextResponse.json({
      success: true,
      keys: apiKeys
    })
  } catch (error) {
    console.error('[API Keys] Failed to fetch:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai-agent/keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get actual user session
    const userId = 'test-user-123' // Replace with actual session.userId
    
    const body = await request.json()
    const { name, role, rateLimit } = body

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: 'Name and role are required' },
        { status: 400 }
      )
    }

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be buyer, seller, or admin' },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = generateAPIKey()

    // Save to database
    const newKey = await prisma.aPIKey.create({
      data: {
        userId,
        key: apiKey,
        name: name || 'AI Agent Key',
        role,
        rateLimit: rateLimit || 1000,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        key: true,
        role: true,
        rateLimit: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      key: apiKey,
      message: 'API key created successfully. Store it securely!'
    })
  } catch (error) {
    console.error('[API Keys] Failed to create:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}
