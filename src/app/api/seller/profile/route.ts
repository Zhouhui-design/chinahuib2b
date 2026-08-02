import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateUniqueStoreSlug } from "@/services/sellerService"
import { z } from "zod"
import { autoTranslateToAllLanguages } from "@/lib/translation-service"
import { handleSEOEvent } from "@/lib/seo-automation"


const profileUpdateSchema = z.object({
  companyName: z.string().min(2).max(200),
  description: z.string().optional(),
  descriptions: z.record(z.string(), z.string()).optional(),
  contactName: z.string().optional(),
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
            password: session.user.id,
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
          subscriptionStatus: 'FREE_TRIAL',
          storeSlug: await generateUniqueStoreSlug(session.user.name || session.user.id.slice(0, 8)),
        }
      })

      setTimeout(async () => {
        try {
          const seoResult = await handleSEOEvent({
            type: 'store_update',
            data: {
              id: seller.id,
              url: seller.storeSlug
                ? `https://x2xhub.com/${seller.storeSlug}`
                : `https://x2xhub.com/de/stores/${seller.id}`,
              title: seller.companyName,
              description: seller.description || '',
            }
          })
          console.log('SEO event handled for store creation:', seoResult)
        } catch (error) {
          console.error('Failed to handle SEO event for store creation:', error)
        }
      }, 1000)
    }

    return NextResponse.json({ profile: seller })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}


export async function DELETE() {
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

    await prisma.sellerProfile.delete({
      where: { id: seller.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    })

  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete profile',
      details: error instanceof Error ? error.message : 'Unknown error'
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
            password: session.user.id,
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
          subscriptionStatus: 'FREE_TRIAL',
          storeSlug: await generateUniqueStoreSlug(session.user.name || session.user.id.slice(0, 8)),
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

    const sourceLang = data.sourceLanguage || 'en'

    if (data.autoTranslate) {
      if (data.description) {
        descriptions = await autoTranslateToAllLanguages(data.description, sourceLang)
      }
      if (data.boothName && Object.keys(boothNames).length === 0) {
        boothNames = await autoTranslateToAllLanguages(data.boothName, sourceLang)
      }
    } else {
      // Always update the description if provided
      if (data.description) {
        descriptions[sourceLang] = data.description
      }
      if (data.boothName && !boothNames[sourceLang]) {
        boothNames[sourceLang] = data.boothName
      }
    }

    // Helper function to check if a value can be assigned to a String[] field
    const isValidArray = (val: any): val is string[] => Array.isArray(val);
    const isNotNullUndefined = (val: any) => val !== null && val !== undefined;

    const updateData: any = {
      companyName: data.companyName,
      ...(isNotNullUndefined(data.contactName) && { contactName: data.contactName }),
      ...(Object.keys(descriptions).length > 0 && { descriptions }),
      ...(isNotNullUndefined(data.country) && { country: data.country }),
      ...(isNotNullUndefined(data.city) && { city: data.city }),
      ...(isNotNullUndefined(data.address) && { address: data.address }),
      ...(isNotNullUndefined(data.phone) && { phone: data.phone }),
      ...(isNotNullUndefined(data.email) && { email: data.email }),
      ...(isNotNullUndefined(data.website) && { website: data.website }),
      ...(isNotNullUndefined(data.whatsapp) && { whatsapp: data.whatsapp }),
      ...(isNotNullUndefined(data.wechat) && { wechat: data.wechat }),
      ...(isNotNullUndefined(data.telegram) && { telegram: data.telegram }),
      ...(isNotNullUndefined(data.linkedin) && { linkedin: data.linkedin }),
      ...(isNotNullUndefined(data.facebook) && { facebook: data.facebook }),
      ...(isNotNullUndefined(data.instagram) && { instagram: data.instagram }),
      ...(isNotNullUndefined(data.youtube) && { youtube: data.youtube }),
      ...(isNotNullUndefined(data.tiktok) && { tiktok: data.tiktok }),
      ...(isNotNullUndefined(data.twitter) && { twitter: data.twitter }),
      ...(isNotNullUndefined(data.pinterest) && { pinterest: data.pinterest }),
      ...(isNotNullUndefined(data.douyin) && { douyin: data.douyin }),
      ...(isNotNullUndefined(data.xiaohongshu) && { xiaohongshu: data.xiaohongshu }),
      ...(isNotNullUndefined(data.qq) && { qq: data.qq }),
      ...(isNotNullUndefined(data.dingtalk) && { dingtalk: data.dingtalk }),
      ...(isNotNullUndefined(data.lark) && { lark: data.lark }),
      ...(isNotNullUndefined(data.wechatVideo) && { wechatVideo: data.wechatVideo }),
      ...(isNotNullUndefined(data.weibo) && { weibo: data.weibo }),
      ...(isNotNullUndefined(data.kuaishou) && { kuaishou: data.kuaishou }),
      ...(isNotNullUndefined(data.bilibili) && { bilibili: data.bilibili }),
      ...(isNotNullUndefined(data.reddit) && { reddit: data.reddit }),
      ...(isNotNullUndefined(data.snapchat) && { snapchat: data.snapchat }),
      ...(isNotNullUndefined(data.tumblr) && { tumblr: data.tumblr }),
      ...(isNotNullUndefined(data.chatSystem) && { chatSystem: data.chatSystem }),
      ...(isNotNullUndefined(data.logoUrl) && { logoUrl: data.logoUrl }),
      ...(isNotNullUndefined(data.bannerUrl) && { bannerUrl: data.bannerUrl }),
      ...(isValidArray(data.certifications) && { certifications: data.certifications }),
      ...(Object.keys(boothNames).length > 0 && { boothNames }),
      ...(isValidArray(data.boothCategories) && { boothCategories: data.boothCategories }),
      ...(isNotNullUndefined(data.isCustomizable) && { isCustomizable: data.isCustomizable }),
      ...(isNotNullUndefined(data.organizationType) && { organizationType: data.organizationType }),
      ...(isNotNullUndefined(data.registeredCapital) && { registeredCapital: data.registeredCapital }),
      ...(isNotNullUndefined(data.registeredAddress) && { registeredAddress: data.registeredAddress }),
      ...(isNotNullUndefined(data.businessAddress) && { businessAddress: data.businessAddress }),
      ...(isNotNullUndefined(data.employeeCount) && { employeeCount: data.employeeCount }),
      ...(isValidArray(data.patents) && { patents: data.patents }),
      ...(isValidArray(data.awards) && { awards: data.awards }),
      ...(isValidArray(data.companyPhotos) && { companyPhotos: data.companyPhotos }),
      ...(isValidArray(data.teamPhotos) && { teamPhotos: data.teamPhotos }),
      ...(isNotNullUndefined(data.mapLatitude) && { mapLatitude: data.mapLatitude }),
      ...(isNotNullUndefined(data.mapLongitude) && { mapLongitude: data.mapLongitude }),
      ...(isNotNullUndefined(data.mapAddress) && { mapAddress: data.mapAddress }),
      ...(isNotNullUndefined(data.foundingYear) && { foundingYear: data.foundingYear }),
      ...(isNotNullUndefined(data.businessScope) && { businessScope: data.businessScope }),
      ...(isNotNullUndefined(data.legalRepresentative) && { legalRepresentative: data.legalRepresentative }),
      ...(isNotNullUndefined(data.registrationNumber) && { registrationNumber: data.registrationNumber }),
      ...(isNotNullUndefined(data.bankAccount) && { bankAccount: data.bankAccount }),
      ...(isNotNullUndefined(data.taxNumber) && { taxNumber: data.taxNumber }),
    }

    console.log('Update data keys:', Object.keys(updateData))
    console.log('Descriptions:', JSON.stringify(descriptions))
    console.log('Contact name:', data.contactName)

    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: updateData
    })

    setTimeout(async () => {
      try {
        const seoResult = await handleSEOEvent({
          type: 'store_update',
          data: {
            id: updatedProfile.id,
            url: updatedProfile.storeSlug
              ? `https://x2xhub.com/${updatedProfile.storeSlug}`
              : `https://x2xhub.com/de/stores/${updatedProfile.id}`,
            title: updatedProfile.companyName,
            description: updatedProfile.description || updatedProfile.descriptions?.en || '',
          }
        })
        console.log('SEO event handled for store:', seoResult)
      } catch (error) {
        console.error('Failed to handle SEO event for store:', error)
      }
    }, 1000)

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('Update profile error:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error name:', error?.name)
    console.error('Error code:', error?.code)
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error',
      ...(error?.code && { code: error.code })
    }, { status: 500 })
  }
}
