import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found. Please clear cookies and re-login.'
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        role: session.user?.role,
      },
      expires: session.expires,
    })
  } catch (error) {
    console.error('[DebugSession] Error:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to verify session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}