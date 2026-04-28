import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get SEO config for a page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('pagePath')

    if (!pagePath) {
      return NextResponse.json({ error: 'pagePath is required' }, { status: 400 })
    }

    const config = await prisma.sEOConfig.findUnique({
      where: { pagePath }
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Failed to fetch SEO config:', error)
    return NextResponse.json({ error: 'Failed to fetch SEO config' }, { status: 500 })
  }
}

// POST - Create or update SEO config
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { pagePath, title, titleEn, description, descriptionEn, keywords, keywordsEn, pageType } = body

    if (!pagePath) {
      return NextResponse.json({ error: 'pagePath is required' }, { status: 400 })
    }

    // Upsert: update if exists, create if not
    const config = await prisma.sEOConfig.upsert({
      where: { pagePath },
      update: {
        title: title || null,
        titleEn: titleEn || null,
        description: description || null,
        descriptionEn: descriptionEn || null,
        keywords: keywords || null,
        keywordsEn: keywordsEn || null,
        pageType: pageType || 'STATIC',
      },
      create: {
        pagePath,
        title: title || null,
        titleEn: titleEn || null,
        description: description || null,
        descriptionEn: descriptionEn || null,
        keywords: keywords || null,
        keywordsEn: keywordsEn || null,
        pageType: pageType || 'STATIC',
      },
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Failed to save SEO config:', error)
    return NextResponse.json({ error: 'Failed to save SEO config' }, { status: 500 })
  }
}

// DELETE - Remove SEO config
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('pagePath')

    if (!pagePath) {
      return NextResponse.json({ error: 'pagePath is required' }, { status: 400 })
    }

    await prisma.sEOConfig.delete({
      where: { pagePath }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete SEO config:', error)
    return NextResponse.json({ error: 'Failed to delete SEO config' }, { status: 500 })
  }
}
