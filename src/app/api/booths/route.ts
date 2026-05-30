import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createBoothSchema = z.object({
  name: z.string().min(2).max(200),
  names: z.record(z.string(), z.string()).optional(),
  exhibitionName: z.string().min(2).max(200),
  exhibitionDates: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  location: z.string().optional(),
  theme: z.string().optional(),
  colorScheme: z.string().optional(),
  layout: z.string().optional(),
})

const updateBoothSchema = createBoothSchema.extend({
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booths = await prisma.booth.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ booths })

  } catch (error) {
    console.error('Get booths error:', error)
    return NextResponse.json({ error: 'Failed to fetch booths' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createBoothSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const data = validation.data

    const booth = await prisma.booth.create({
      data: {
        sellerId: session.user.id,
        name: data.name,
        names: data.names,
        exhibitionName: data.exhibitionName,
        exhibitionDates: data.exhibitionDates,
        location: data.location,
        theme: data.theme,
        colorScheme: data.colorScheme,
        layout: data.layout,
      }
    })

    return NextResponse.json({
      success: true,
      booth,
      message: 'Booth created successfully'
    })

  } catch (error) {
    console.error('Create booth error:', error)
    return NextResponse.json({ error: 'Failed to create booth' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Booth ID is required' }, { status: 400 })
    }

    const validation = updateBoothSchema.safeParse(updateData)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const booth = await prisma.booth.findUnique({
      where: { id }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    if (booth.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      booth: updatedBooth,
      message: 'Booth updated successfully'
    })

  } catch (error) {
    console.error('Update booth error:', error)
    return NextResponse.json({ error: 'Failed to update booth' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Booth ID is required' }, { status: 400 })
    }

    const booth = await prisma.booth.findUnique({
      where: { id }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    if (booth.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.booth.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Booth deleted successfully'
    })

  } catch (error) {
    console.error('Delete booth error:', error)
    return NextResponse.json({ error: 'Failed to delete booth' }, { status: 500 })
  }
}
