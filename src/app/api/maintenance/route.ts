import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const notices = await prisma.maintenanceNotice.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      orderBy: [{ priority: 'desc' }, { scheduledStart: 'asc' }],
      take: 5,
    })

    return NextResponse.json({ success: true, notices }, { status: 200 })
  } catch (error) {
    console.error('Get maintenance notices error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch maintenance notices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, titleEn, content, contentEn, scheduledStart, estimatedDuration } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 })
    }

    const notice = await prisma.maintenanceNotice.create({
      data: {
        title,
        titleEn: titleEn || title,
        content,
        contentEn: contentEn || content,
        status: 'PENDING',
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        estimatedDuration: estimatedDuration || 30,
      },
    })

    return NextResponse.json({ success: true, notice }, { status: 201 })
  } catch (error) {
    console.error('Create maintenance notice error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create maintenance notice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    const data: any = { ...updates }
    
    if (status) {
      data.status = status
      if (status === 'IN_PROGRESS') {
        data.scheduledStart = new Date()
      } else if (status === 'COMPLETED') {
        data.actualEndTime = new Date()
      }
    }

    const notice = await prisma.maintenanceNotice.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, notice }, { status: 200 })
  } catch (error) {
    console.error('Update maintenance notice error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update maintenance notice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    await prisma.maintenanceNotice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Notice deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete maintenance notice error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete maintenance notice' }, { status: 500 })
  }
}