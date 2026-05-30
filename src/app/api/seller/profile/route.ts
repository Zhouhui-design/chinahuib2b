import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { autoTranslateToAllLanguages } from "@/lib/translation-service"


const profileUpdateSchema = z.object({
  companyName: z.string().min(2).max(200),
  description: z.string().optional(),
  descriptions: z.record(z.string(), z.string()).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
  wechat: z.string().optional(),
  telegram: z.string().optional(),
  linkedin: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  boothName: z.string().nullable().optional(),
  boothNames: z.record(z.string(), z.string()).optional(),
  boothCategories: z.array(z.string()).optional(),
  isCustomizable: z.boolean().optional(),
  autoTranslate: z.boolean().optional().default(false),
  sourceLanguage: z.string().optional().default('en'),
})


export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      seller = await prisma.sellerProfile.create({
        data: {
          userId: session.user.id,
          companyName: 'My Company',
          companyType: 'MANUFACTURER',
          country: 'China',
          city: 'Beijing',
          isActive: true,
          isVerified: false,
          subscriptionStatus: 'FREE_TRIAL'
        }
      })
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

    let seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      seller = await prisma.sellerProfile.create({
        data: {
          userId: session.user.id,
          companyName: 'My Company',
          companyType: 'MANUFACTURER',
          country: 'China',
          city: 'Beijing',
          isActive: true,
          isVerified: false,
          subscriptionStatus: 'FREE_TRIAL'
        }
      })
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

    let descriptions: Record<string, string> = data.descriptions || {}
    let boothNames: Record<string, string> = data.boothNames || {}

    if (data.autoTranslate) {
      if (data.description && Object.keys(descriptions).length === 0) {
        descriptions = await autoTranslateToAllLanguages(data.description, data.sourceLanguage || 'en')
      }
      if (data.boothName && Object.keys(boothNames).length === 0) {
        boothNames = await autoTranslateToAllLanguages(data.boothName, data.sourceLanguage || 'en')
      }
    } else {
      if (data.description && !descriptions[data.sourceLanguage || 'en']) {
        descriptions[data.sourceLanguage || 'en'] = data.description
      }
      if (data.boothName && !boothNames[data.sourceLanguage || 'en']) {
        boothNames[data.sourceLanguage || 'en'] = data.boothName
      }
    }

    const updateData: any = {
      companyName: data.companyName,
      ...(Object.keys(descriptions).length > 0 && { descriptions }),
      ...(data.country && { country: data.country }),
      ...(data.city && { city: data.city }),
      ...(data.address && { address: data.address }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email && { email: data.email }),
      ...(data.website && { website: data.website }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.wechat !== undefined && { wechat: data.wechat }),
      ...(data.telegram !== undefined && { telegram: data.telegram }),
      ...(data.linkedin && { linkedin: data.linkedin }),
      ...(data.facebook && { facebook: data.facebook }),
      ...(data.instagram && { instagram: data.instagram }),
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      ...(data.certifications && { certifications: data.certifications }),
      ...(Object.keys(boothNames).length > 0 && { boothNames }),
      boothCategories: data.boothCategories,
      isCustomizable: data.isCustomizable,
    }

    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: updateData
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
