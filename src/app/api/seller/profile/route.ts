import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"


const profileUpdateSchema = z.object({
  companyName: z.string().min(2).max(200),
  description: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  boothName: z.string().nullable().optional(),
  boothCategories: z.array(z.string()).optional(),
  isCustomizable: z.boolean().optional(),
})


export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile: seller })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validation.error.issues 
      }, { status: 400 })
    }

    const data = validation.data

    // Update seller profile
    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        companyName: data.companyName,
        ...(data.description && { description: data.description }),
        ...(data.country && { country: data.country }),
        ...(data.city && { city: data.city }),
        ...(data.address && { address: data.address }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(data.website && { website: data.website }),
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        ...(data.certifications && { certifications: data.certifications }),
        boothName: data.boothName,
        boothCategories: data.boothCategories,
        isCustomizable: data.isCustomizable,
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
