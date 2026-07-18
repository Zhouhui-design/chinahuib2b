import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TaskType, TaskStatus } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { performTaskMatching } from '@/lib/ai-matching-service'
import { sendTaskMatchNotifications, sendMatchNotificationsToSellers } from '@/lib/system-notification-service'
import { handleSEOEvent } from '@/lib/seo-automation'
import { getServerLocation } from '@/lib/geo-location'

/**
 * GET /api/marketplace/tasks
 * Get marketplace tasks with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const type = searchParams.get('type') as TaskType | null
    const status = searchParams.get('status') as TaskStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    
    // Build where clause
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (status) {
      where.status = status
    } else {
      // Default to open tasks
      where.status = TaskStatus.OPEN
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { keywords: { has: search } },
      ]
    }
    
    if (country) {
      where.countryCode = country.toUpperCase()
    }
    
    // Get total count
    const total = await prisma.marketplaceTask.count({ where })
    
    // Get tasks with pagination
    const tasks = await prisma.marketplaceTask.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        taskApplications: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })
    
    // Transform data for frontend
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      budget: task.budget ? Number(task.budget) : null,
      price: task.price ? Number(task.price) : null,
      currency: task.currency,
      unit: task.unit,
      minOrderQty: task.minOrderQty,
      deadline: task.deadline?.toISOString(),
      status: task.status,
      postedBy: task.postedBy,
      contactInfo: task.contactInfo,
      applications: task.applications,
      views: task.views,
      rating: task.rating ? Number(task.rating) : null,
      attachments: task.attachments,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        tasks: transformedTasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching marketplace tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplace/tasks
 * Create a new marketplace task
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const { title, description, type } = body
    
    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate task type
    if (!Object.values(TaskType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task type' },
        { status: 400 }
      )
    }
    
    // Get client location
    let countryCode: string | null = null
    let countryName: string | null = null
    
    try {
      const location = await getServerLocation(request)
      if (location) {
        countryCode = location.countryCode
        countryName = location.country
      }
    } catch (error) {
      console.warn('Failed to get client location:', error)
    }
    
    // Create task
    const task = await prisma.marketplaceTask.create({
      data: {
        title,
        description,
        type,
        budget: body.budget ? parseFloat(body.budget) : null,
        price: body.price ? parseFloat(body.price) : null,
        currency: body.currency || 'USD',
        unit: body.unit || null,
        minOrderQty: body.minOrderQty ? parseInt(body.minOrderQty) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        postedById: session.user.id,
        contactInfo: body.contactInfo || null,
        attachments: body.attachments || [],
        keywords: body.keywords || [],
        countryCode,
        countryName,
        status: TaskStatus.OPEN,
      },
    })

    setTimeout(async () => {
      try {
        const matchingResult = await performTaskMatching(task.id)
        
        if (matchingResult.success && matchingResult.matches.length > 0) {
          const buyerUser = await prisma.user.findUnique({
            where: { id: session.user.id }
          })
          
          await sendTaskMatchNotifications(
            session.user.id,
            task.title,
            matchingResult.matches
          )
          
          await sendMatchNotificationsToSellers(
            matchingResult.matches,
            task.title,
            buyerUser?.displayName || buyerUser?.username || '买家'
          )
          
          console.log(`AI matching completed for task ${task.id}: ${matchingResult.matches.length} matches found`)
        }
      } catch (error) {
        console.error('Error in AI matching for task:', error)
      }
    }, 100)

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'task_create',
          data: {
            id: task.id,
            url: `https://x2xhub.com/de/marketplace/${task.id}`,
            title: task.title,
            description: task.description,
          },
        })
        
        console.log(`SEO automation completed for task ${task.id}:`, JSON.stringify({
          cloudflare: seoResult.cloudflare.success,
          pingResults: seoResult.pingResults.filter(r => r.status === 'success').length,
        }))
      } catch (error) {
        console.error('Error in SEO automation for task:', error)
      }
    }, 500)
    
    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        type: task.type,
        status: task.status,
        createdAt: task.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating marketplace task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
