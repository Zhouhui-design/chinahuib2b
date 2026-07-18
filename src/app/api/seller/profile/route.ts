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
  whatsapp: z.string().nullable().optional(),
  wechat: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  pinterest: z.string().nullable().optional(),
  douyin: z.string().nullable().optional(),
  xiaohongshu: z.string().nullable().optional(),
  qq: z.string().nullable().optional(),
  dingtalk: z.string().nullable().optional(),
  lark: z.string().nullable().optional(),
  wechatVideo: z.string().nullable().optional(),
  weibo: z.string().nullable().optional(),
  kuaishou: z.string().nullable().optional(),
  bilibili: z.string().nullable().optional(),
  reddit: z.string().nullable().optional(),
  snapchat: z.string().nullable().optional(),
  tumblr: z.string().nullable().optional(),
  chatSystem: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  certifications: z.array(z.string()).nullable().optional(),
  boothName: z.string().nullable().optional(),
  boothNames: z.record(z.string(), z.string()).optional(),
  boothCategories: z.array(z.string()).optional(),
  isCustomizable: z.boolean().optional(),
  autoTranslate: z.boolean().optional().default(false),
  sourceLanguage: z.string().optional().default('en'),
  organizationType: z.enum(['ENTERPRISE', 'INDIVIDUAL', 'STATE_OWNED', 'PERSONAL']).optional(),
  registeredCapital: z.string().nullable().optional(),
  registeredAddress: z.string().nullable().optional(),
  businessAddress: z.string().nullable().optional(),
  employeeCount: z.string().nullable().optional(),
  patents: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  companyPhotos: z.array(z.string()).optional(),
  teamPhotos: z.array(z.string()).optional(),
  mapLatitude: z.number().nullable().optional(),
  mapLongitude: z.number().nullable().optional(),
  mapAddress: z.string().nullable().optional(),
  foundingYear: z.string().nullable().optional(),
  businessScope: z.string().nullable().optional(),
  legalRepresentative: z.string().nullable().optional(),
  registrationNumber: z.string().nullable().optional(),
  bankAccount: z.string().nullable().optional(),
  taxNumber: z.string().nullable().optional(),
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
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!userExists) {
        await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.name || 'user_' + session.user.id.slice(0, 8),
            role: 'SELLER',
          }
        })
      }

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
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!userExists) {
        await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.name || 'user_' + session.user.id.slice(0, 8),
            role: 'SELLER',
          }
        })
      }

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

    // Check if company name already exists (excluding current user)
    if (data.companyName && data.companyName !== seller.companyName) {
      const existingCompany = await prisma.sellerProfile.findFirst({
        where: {
          companyName: data.companyName,
          userId: { not: session.user.id }
        }
      })
      if (existingCompany) {
        return NextResponse.json({ 
          error: 'Company name already exists',
          message: 'This company name is already registered by another user. Please use a different name.'
        }, { status: 400 })
      }
    }

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
      ...(data.youtube && { youtube: data.youtube }),
      ...(data.tiktok && { tiktok: data.tiktok }),
      ...(data.twitter && { twitter: data.twitter }),
      ...(data.pinterest && { pinterest: data.pinterest }),
      ...(data.douyin && { douyin: data.douyin }),
      ...(data.xiaohongshu && { xiaohongshu: data.xiaohongshu }),
      ...(data.qq && { qq: data.qq }),
      ...(data.dingtalk && { dingtalk: data.dingtalk }),
      ...(data.lark && { lark: data.lark }),
      ...(data.wechatVideo && { wechatVideo: data.wechatVideo }),
      ...(data.weibo && { weibo: data.weibo }),
      ...(data.kuaishou && { kuaishou: data.kuaishou }),
      ...(data.bilibili && { bilibili: data.bilibili }),
      ...(data.reddit && { reddit: data.reddit }),
      ...(data.snapchat && { snapchat: data.snapchat }),
      ...(data.tumblr && { tumblr: data.tumblr }),
      ...(data.chatSystem && { chatSystem: data.chatSystem }),
      logoUrl: data.logoUrl,
      bannerUrl: data.bannerUrl,
      ...(data.certifications && { certifications: data.certifications }),
      ...(Object.keys(boothNames).length > 0 && { boothNames }),
      boothCategories: data.boothCategories,
      isCustomizable: data.isCustomizable,
      ...(data.organizationType && { organizationType: data.organizationType }),
      ...(data.registeredCapital !== undefined && { registeredCapital: data.registeredCapital }),
      ...(data.registeredAddress !== undefined && { registeredAddress: data.registeredAddress }),
      ...(data.businessAddress !== undefined && { businessAddress: data.businessAddress }),
      ...(data.employeeCount !== undefined && { employeeCount: data.employeeCount }),
      ...(data.patents && { patents: data.patents }),
      ...(data.awards && { awards: data.awards }),
      ...(data.companyPhotos && { companyPhotos: data.companyPhotos }),
      ...(data.teamPhotos && { teamPhotos: data.teamPhotos }),
      ...(data.mapLatitude !== undefined && { mapLatitude: data.mapLatitude }),
      ...(data.mapLongitude !== undefined && { mapLongitude: data.mapLongitude }),
      ...(data.mapAddress !== undefined && { mapAddress: data.mapAddress }),
      ...(data.foundingYear !== undefined && { foundingYear: data.foundingYear }),
      ...(data.businessScope !== undefined && { businessScope: data.businessScope }),
      ...(data.legalRepresentative !== undefined && { legalRepresentative: data.legalRepresentative }),
      ...(data.registrationNumber !== undefined && { registrationNumber: data.registrationNumber }),
      ...(data.bankAccount !== undefined && { bankAccount: data.bankAccount }),
      ...(data.taxNumber !== undefined && { taxNumber: data.taxNumber }),
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
