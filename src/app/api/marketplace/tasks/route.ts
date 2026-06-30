import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TaskType, TaskStatus } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
        status: TaskStatus.OPEN,
      },
    })
    
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
