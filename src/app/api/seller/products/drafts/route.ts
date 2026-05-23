import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { redis } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { draftId, productData } = body

    const userId = session.user.id
    const draftKey = draftId
      ? `draft:product:${userId}:${draftId}`
      : `draft:product:${userId}:${Date.now()}`

    const draft = {
      id: draftKey.replace(`draft:product:${userId}:`, ''),
      userId,
      productData,
      updatedAt: new Date().toISOString(),
    }

    await redis.setEx(draftKey, 7 * 24 * 60 * 60, JSON.stringify(draft))

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      message: 'Draft saved successfully'
    })

  } catch (error) {
    console.error('Save draft error:', error)
    return NextResponse.json({
      error: 'Failed to save draft'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const pattern = `draft:product:${userId}:*`

    const keys = await redis.keys(pattern)
    const drafts = []

    for (const key of keys) {
      const data = await redis.get(key)
      if (data) {
        const draft = JSON.parse(data)
        drafts.push(draft)
      }
    }

    drafts.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return NextResponse.json({
      success: true,
      drafts
    })

  } catch (error) {
    console.error('Get drafts error:', error)
    return NextResponse.json({
      error: 'Failed to fetch drafts'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('draftId')

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID required' }, { status: 400 })
    }

    const userId = session.user.id
    const draftKey = `draft:product:${userId}:${draftId}`

    await redis.del(draftKey)

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })

  } catch (error) {
    console.error('Delete draft error:', error)
    return NextResponse.json({
      error: 'Failed to delete draft'
    }, { status: 500 })
  }
}