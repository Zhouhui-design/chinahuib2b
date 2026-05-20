/**
 * DELETE /api/ai-agent/keys/[id]
 * Delete an API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // TODO: Get actual user session
    const userId = 'test-user-123' // Replace with actual session.userId

    // Verify the key belongs to the user
    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the key
    await prisma.aPIKey.delete({
      where: {
        id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    console.error('[API Keys] Failed to delete:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
