import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { handleSEOEvent } from "@/lib/seo-automation"

async function generateBoothNumber(): Promise<string> {
  const lastBooth = await prisma.booth.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { boothNumber: true }
  })
  
  if (!lastBooth) {
    return 'BTH-000001'
  }
  
  const lastNum = parseInt(lastBooth.boothNumber.replace('BTH-', ''), 10)
  const nextNum = lastNum + 1
  return `BTH-${nextNum.toString().padStart(6, '0')}`
}

const documentSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  size: z.number().optional(),
})

const createBoothSchema = z.object({
  name: z.string().min(2).max(200),
  names: z.record(z.string(), z.string()).optional(),
  exhibitionName: z.string().min(2).max(200),
  exhibitionDates: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  location: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  keywords: z.array(z.string()).max(50).optional(),
  documents: z.array(documentSchema).max(10).optional(),
  theme: z.string().optional(),
  colorScheme: z.string().optional(),
  layout: z.string().optional(),
})

const updateBoothSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  names: z.record(z.string(), z.string()).optional(),
  exhibitionName: z.string().min(2).max(200).optional(),
  exhibitionDates: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  location: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  keywords: z.array(z.string()).max(50).optional(),
  documents: z.array(documentSchema).max(10).optional(),
  theme: z.string().optional(),
  colorScheme: z.string().optional(),
  layout: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Get seller profile ID
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      if (id) {
        return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
      }
      return NextResponse.json({ booths: [] })
    }

    // If ID is provided, get single booth
    if (id) {
      const booth = await prisma.booth.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              companyName: true,
              country: true,
              city: true,
              logoUrl: true
            }
          },
          products: {
            select: {
              id: true,
              title: true,
              mainImageUrl: true,
              images: true
            }
          }
        }
      })

      if (!booth) {
        return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
      }

      // Verify ownership
      if (booth.sellerId !== sellerProfile.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return NextResponse.json({ booth })
    }

    // Otherwise, get all booths
    const booths = await prisma.booth.findMany({
      where: { sellerId: sellerProfile.id },
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

    // Check if seller profile exists, if not create one
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      // Get user email from session
      const userEmail = session.user.email || ''
      
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId: session.user.id,
          companyName: userEmail.split('@')[0] || 'My Company',
          companyType: 'SOLE_PROPRIETORSHIP',
          country: 'CN',
          city: 'Hangzhou',
          storeName: userEmail.split('@')[0] || 'My Store',
          slug: `store-${session.user.id.slice(0, 8)}`,
          description: '',
        }
      })
    }

    // Check if booth name already exists for this seller
    const existingBooth = await prisma.booth.findFirst({
      where: { 
        sellerId: sellerProfile.id,
        name: data.name
      }
    })

    if (existingBooth) {
      return NextResponse.json({ 
        error: 'Booth name already exists',
        field: 'name'
      }, { status: 400 })
    }

    // Generate booth number
    const boothNumber = await generateBoothNumber()

    const booth = await prisma.booth.create({
      data: {
        sellerId: sellerProfile.id,
        boothNumber,
        name: data.name,
        names: data.names,
        exhibitionName: data.exhibitionName,
        exhibitionDates: data.exhibitionDates,
        location: data.location,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        keywords: data.keywords,
        documents: data.documents,
        theme: data.theme,
        colorScheme: data.colorScheme,
        layout: data.layout,
      }
    })

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'booth_create',
          data: {
            id: booth.id,
            url: `https://x2xhub.com/exhibitions/${booth.id}`,
            title: booth.name,
            description: booth.exhibitionName,
            imageUrl: booth.bannerUrl ? `https://x2xhub.com${booth.bannerUrl}` : booth.logoUrl ? `https://x2xhub.com${booth.logoUrl}` : undefined,
          },
        })
        
        console.log(`SEO automation completed for booth ${booth.id}:`, JSON.stringify({
          cloudflare: seoResult.cloudflare.success,
          pingResults: seoResult.pingResults.filter(r => r.status === 'success').length,
        }))
      } catch (error) {
        console.error('Error in SEO automation for booth:', error)
      }
    }, 500)

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

    // Get seller profile to verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const booth = await prisma.booth.findUnique({
      where: { id }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    if (booth.sellerId !== sellerProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if booth name already exists for this seller (if name is being updated)
    if (validation.data.name && validation.data.name !== booth.name) {
      const existingBooth = await prisma.booth.findFirst({
        where: { 
          sellerId: sellerProfile.id,
          name: validation.data.name,
          NOT: { id }
        }
      })

      if (existingBooth) {
        return NextResponse.json({ 
          error: 'Booth name already exists',
          field: 'name'
        }, { status: 400 })
      }
    }

    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: updateData
    })

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'booth_update',
          data: {
            id: updatedBooth.id,
            url: `https://x2xhub.com/exhibitions/${updatedBooth.id}`,
            title: updatedBooth.name,
            description: updatedBooth.exhibitionName,
            imageUrl: updatedBooth.bannerUrl ? `https://x2xhub.com${updatedBooth.bannerUrl}` : updatedBooth.logoUrl ? `https://x2xhub.com${updatedBooth.logoUrl}` : undefined,
          },
        })
        
        console.log(`SEO automation completed for booth ${updatedBooth.id} update:`, JSON.stringify({
          cloudflare: seoResult.cloudflare.success,
          pingResults: seoResult.pingResults.filter(r => r.status === 'success').length,
        }))
      } catch (error) {
        console.error('Error in SEO automation for booth update:', error)
      }
    }, 500)

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

    // Get seller profile to verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const booth = await prisma.booth.findUnique({
      where: { id }
    })

    if (!booth) {
      return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
    }

    if (booth.sellerId !== sellerProfile.id) {
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
