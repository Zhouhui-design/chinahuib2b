import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signToken, verifyToken } from '@/lib/jwt'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, capabilities, ownerId, ownerType, webhookUrl } = body

    if (!name || !ownerId || !ownerType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, ownerId, ownerType' },
        { status: 400 }
      )
    }

    const apiKey = `ai_${crypto.randomBytes(32).toString('hex')}`
    const secretKey = crypto.randomBytes(48).toString('hex')

    const agent = await prisma.aIAgent.create({
      data: {
        name,
        description,
        capabilities: capabilities || [],
        ownerId,
        ownerType: ownerType as 'USER' | 'SELLER' | 'SYSTEM',
        apiKey,
        secretKey,
        webhookUrl,
        status: 'ACTIVE',
        permissions: {
          create: {
            canManageProducts: true,
            canManageBooth: true,
            canChat: true,
            canPostAuction: true,
            canSendShoutOut: true,
            apiAccess: true,
            cliAccess: true,
            mcpAccess: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id: agent.id,
          name: agent.name,
          apiKey: agent.apiKey,
          secretKey: agent.secretKey,
          capabilities: agent.capabilities,
        },
        message: 'Store your API key securely. It will not be shown again.'
      }
    })
  } catch (error) {
    console.error('AI Agent creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create AI Agent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 401 }
      )
    }

    const agent = await prisma.aIAgent.findFirst({
      where: { apiKey, status: 'ACTIVE' }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities,
        permissions: agent.permissions,
        status: agent.status,
        createdAt: agent.createdAt,
      }
    })
  } catch (error) {
    console.error('AI Agent fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI Agent' },
      { status: 500 }
    )
  }
}
