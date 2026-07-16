import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TaskStatus } from '@prisma/client'
import { handleSEOEvent } from '@/lib/seo-automation'

/**
 * GET /api/marketplace/tasks/[id]
 * Get single task details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get task with applications
    const task = await prisma.marketplaceTask.findUnique({
      where: { id },
      include: {
        taskApplications: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit to recent 10 applications
        },
      },
    })
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Increment view count
    await prisma.marketplaceTask.update({
      where: { id },
      data: { views: { increment: 1 } },
    })
    
    // Transform data
    const transformedTask = {
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
      views: task.views + 1, // Include the increment
      rating: task.rating ? Number(task.rating) : null,
      attachments: task.attachments,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      recentApplications: task.taskApplications.map(app => ({
        id: app.id,
        applicantId: app.applicantId,
        message: app.message,
        quote: app.quote ? Number(app.quote) : null,
        deliveryTime: app.deliveryTime,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })),
    }
    
    return NextResponse.json({
      success: true,
      data: transformedTask,
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/marketplace/tasks/[id]
 * Update task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Check if task exists
    const existingTask = await prisma.marketplaceTask.findUnique({
      where: { id },
    })
    
    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Update task
    const updatedTask = await prisma.marketplaceTask.update({
      where: { id },
      data: {
        title: body.title || existingTask.title,
        description: body.description || existingTask.description,
        budget: body.budget !== undefined ? parseFloat(body.budget) : existingTask.budget,
        price: body.price !== undefined ? parseFloat(body.price) : existingTask.price,
        currency: body.currency || existingTask.currency,
        unit: body.unit !== undefined ? body.unit : existingTask.unit,
        minOrderQty: body.minOrderQty !== undefined ? parseInt(body.minOrderQty) : existingTask.minOrderQty,
        deadline: body.deadline ? new Date(body.deadline) : existingTask.deadline,
        status: body.status || existingTask.status,
        contactInfo: body.contactInfo !== undefined ? body.contactInfo : existingTask.contactInfo,
        attachments: body.attachments !== undefined ? body.attachments : existingTask.attachments,
      },
    })

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'task_update',
          data: {
            id: updatedTask.id,
            url: `https://x2xhub.com/de/marketplace`,
            title: updatedTask.title,
            description: updatedTask.description,
          },
        })
        
        console.log(`SEO automation completed for task update ${updatedTask.id}:`, JSON.stringify({
          cloudflare: seoResult.cloudflare.success,
          pingResults: seoResult.pingResults.filter(r => r.status === 'success').length,
        }))
      } catch (error) {
        console.error('Error in SEO automation for task update:', error)
      }
    }, 500)
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        updatedAt: updatedTask.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/marketplace/tasks/[id]
 * Delete task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if task exists
    const existingTask = await prisma.marketplaceTask.findUnique({
      where: { id },
    })
    
    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Delete task (cascade will delete applications)
    await prisma.marketplaceTask.delete({
      where: { id },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
