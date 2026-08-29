import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateUniqueStoreSlug } from "@/services/sellerService"
import { z } from "zod"
import { autoTranslateToAllLanguages } from "@/lib/translation-service"
import { handleSEOEvent } from "@/lib/seo-automation"
import { resolveSellerFromRequest } from "@/lib/category-auth"
import { getEffectiveUserIdStrict } from "@/lib/ai-permissions"
import { invalidateSellerCaches } from "@/lib/cache"


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
  emails: z.array(z.string()).nullable().optional(),
  phones: z.array(z.string()).nullable().optional(),
  websites: z.array(z.string()).nullable().optional(),
  voiceLanguages: z.array(z.string()).nullable().optional(),
  textLanguages: z.array(z.string()).nullable().optional(),
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


export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // AI Agent aware: resolve to guardian's SellerProfile.
    // 强制使用严格路径：session 缺少 isAI/ownerId 时 fallback 到 DB 查询。
    const resolved = await resolveSellerFromRequest(request)
    let seller = resolved.seller
    const effectiveUserId = resolved.effectiveUserId
    // safety: 如果 resolveSellerFromRequest 的 effectiveUserId 为空，
    // 再单独调用一次严格版兜底。
    const finalEffectiveUserId = effectiveUserId
      || (await getEffectiveUserIdStrict(prisma, session))
      || session.user.id

    if (!seller) {
      // If guardian doesn't have a SellerProfile yet, create one
      // using the guardian's effectiveUserId (not the AI Agent userId).
      const userExists = await prisma.user.findUnique({
        where: { id: finalEffectiveUserId }
      })

      if (!userExists) {
        const userInfo = (session.user.isAI && session.user.ownerId)
          ? await prisma.user.findUnique({ where: { id: session.user.ownerId } })
          : null
        // 严格版补查：如果 userInfo 仍然为空，直接查 DB 拿 owner
        let guardianUserForName: any = userInfo
        if (!guardianUserForName) {
          try {
            const u = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { isAI: true, ownerId: true }
            })
            if (u?.isAI && u.ownerId) {
              guardianUserForName = await prisma.user.findUnique({
                where: { id: u.ownerId },
                select: { displayName: true, email: true, username: true }
              })
            }
          } catch {}
        }
        await prisma.user.create({
          data: {
            id: finalEffectiveUserId,
            email: guardianUserForName?.email || session.user.email || '',
            username: guardianUserForName?.username || session.user.name || 'user_' + finalEffectiveUserId.slice(0, 8),
            password: finalEffectiveUserId,
            role: 'SELLER',
          }
        })
      }

      const fallbackUser = await prisma.user.findUnique({
        where: { id: finalEffectiveUserId },
        select: { displayName: true, username: true }
      })
      const fallbackName = fallbackUser?.displayName
        || fallbackUser?.username
        || session.user.name
        || 'user_' + finalEffectiveUserId.slice(0, 8)

      const createdSeller = await prisma.sellerProfile.create({
        data: {
          userId: finalEffectiveUserId,
          companyName: 'My Company',
          companyType: 'MANUFACTURER',
          country: 'China',
          city: 'Beijing',
          isActive: true,
          isVerified: false,
          subscriptionStatus: 'FREE_TRIAL',
          storeSlug: await generateUniqueStoreSlug(fallbackName),
        }
      })
      seller = createdSeller as any

      setTimeout(async (s: any) => {
        try {
          const seoResult = await handleSEOEvent({
            type: 'store_update',
            data: {
              id: s.id,
              url: s.storeSlug
                ? `https://x2xhub.com/${s.storeSlug}`
                : `https://x2xhub.com/de/stores/${s.id}`,
              title: s.companyName,
              description: s.description || '',
            }
          })
          console.log('SEO event handled for store creation:', seoResult)
        } catch (error) {
          console.error('Failed to handle SEO event for store creation:', error)
        }
      }, 1000, createdSeller)
    }

    return NextResponse.json({ profile: seller })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile' 
    }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest) {
  try {
    // AI Agent aware: resolve to guardian's SellerProfile so AI Agent
    // can also delete the shared profile (same rules as booths DELETE).
    const { seller } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    await prisma.sellerProfile.delete({
      where: { id: seller.id }
    })

    // Invalidate all caches related to this seller so store pages don't
    // serve stale data pointing to a deleted profile.
    await invalidateSellerCaches(seller.id, seller.storeSlug || undefined)

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

    // AI Agent aware: always operate on guardian's SellerProfile.
    // 强制使用严格路径：session 缺少 isAI/ownerId 时 fallback 到 DB 查询。
    const resolved = await resolveSellerFromRequest(request)
    let localSeller = resolved.seller
    const effectiveUserId = resolved.effectiveUserId
    const finalEffectiveUserId = effectiveUserId
      || (await getEffectiveUserIdStrict(prisma, session))
      || session.user.id

    if (!localSeller) {
      // Guardian has no SellerProfile yet — create one under the guardian's userId.
      const userExists = await prisma.user.findUnique({
        where: { id: finalEffectiveUserId }
      })

      if (!userExists) {
        const userInfo = (session.user.isAI && session.user.ownerId)
          ? await prisma.user.findUnique({ where: { id: session.user.ownerId } })
          : null
        let guardianUserForName: any = userInfo
        if (!guardianUserForName) {
          try {
            const u = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { isAI: true, ownerId: true }
            })
            if (u?.isAI && u.ownerId) {
              guardianUserForName = await prisma.user.findUnique({
                where: { id: u.ownerId },
                select: { displayName: true, email: true, username: true }
              })
            }
          } catch {}
        }
        await prisma.user.create({
          data: {
            id: finalEffectiveUserId,
            email: guardianUserForName?.email || session.user.email || '',
            username: guardianUserForName?.username || session.user.name || 'user_' + finalEffectiveUserId.slice(0, 8),
            password: finalEffectiveUserId,
            role: 'SELLER',
          }
        })
      }

      const fallbackUser = await prisma.user.findUnique({
        where: { id: finalEffectiveUserId },
        select: { displayName: true, username: true }
      })
      const fallbackName = fallbackUser?.displayName
        || fallbackUser?.username
        || session.user.name
        || 'user_' + finalEffectiveUserId.slice(0, 8)

      localSeller = await prisma.sellerProfile.create({
        data: {
          userId: finalEffectiveUserId,
          companyName: 'My Company',
          companyType: 'MANUFACTURER',
          country: 'China',
          city: 'Beijing',
          isActive: true,
          isVerified: false,
          subscriptionStatus: 'FREE_TRIAL',
          storeSlug: await generateUniqueStoreSlug(fallbackName),
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

    // Check if company name already exists (excluding current effective user,
    // not the session user — an AI Agent should not collide with its guardian)
    if (data.companyName && data.companyName !== localSeller.companyName) {
      const existingCompany = await prisma.sellerProfile.findFirst({
        where: {
          companyName: data.companyName,
          userId: { not: finalEffectiveUserId }
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
      ...(isValidArray(data.emails) && { emails: data.emails }),
      ...(isValidArray(data.phones) && { phones: data.phones }),
      ...(isValidArray(data.websites) && { websites: data.websites }),
      ...(isValidArray(data.voiceLanguages) && { voiceLanguages: data.voiceLanguages }),
      ...(isValidArray(data.textLanguages) && { textLanguages: data.textLanguages }),
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
    console.log('[seller/profile PUT] finalEffectiveUserId=', finalEffectiveUserId, 'seller.id=', localSeller.id)

    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: localSeller.id },
      data: updateData
    })

    // Invalidate all seller-related caches so store pages pick up the new
    // logoUrl / bannerUrl / companyPhotos / teamPhotos immediately.
    // Without this, store/[slug] would serve stale data for up to 24h (CACHE_TTL.LONG).
    await invalidateSellerCaches(localSeller.id, updatedProfile.storeSlug || undefined)

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
            description: updatedProfile.description || (updatedProfile.descriptions && typeof updatedProfile.descriptions === 'object' ? (updatedProfile.descriptions as any).en : '') || '',
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
