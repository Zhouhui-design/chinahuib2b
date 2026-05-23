import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApplicationStatus } from '@prisma/client'

/**
 * POST /api/marketplace/tasks/[id]/apply
 * Apply for a task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate required fields
    const { applicantId, message } = body
    
    if (!applicantId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: applicantId and message' },
        { status: 400 }
      )
    }
    
    // Check if task exists and is open
    const task = await prisma.marketplaceTask.findUnique({
      where: { id },
    })
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    if (task.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'Task is no longer accepting applications' },
        { status: 400 }
      )
    }
    
    // Create application
    const application = await prisma.taskApplication.create({
      data: {
        taskId: id,
        applicantId,
        message,
        quote: body.quote ? parseFloat(body.quote) : null,
        deliveryTime: body.deliveryTime,
        status: ApplicationStatus.PENDING,
      },
    })
    
    // Increment task application count
    await prisma.marketplaceTask.update({
      where: { id },
      data: { applications: { increment: 1 } },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        taskId: application.taskId,
        applicantId: application.applicantId,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error applying for task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to apply for task' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/marketplace/tasks/[id]/applications
 * Get all applications for a task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if task exists
    const task = await prisma.marketplaceTask.findUnique({
      where: { id },
    })
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Get applications with pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const total = await prisma.taskApplication.count({
      where: { taskId: id },
    })
    
    const applications = await prisma.taskApplication.findMany({
      where: { taskId: id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    // Transform data
    const transformedApplications = applications.map(app => ({
      id: app.id,
      applicantId: app.applicantId,
      message: app.message,
      quote: app.quote ? Number(app.quote) : null,
      deliveryTime: app.deliveryTime,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
