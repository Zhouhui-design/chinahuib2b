import { prisma } from '@/lib/db'

/**
 * Published booth detail query, shared by:
 *  - GET /api/exhibitions?id=... (client-side fetch fallback)
 *  - the booth detail page server component (SSR for crawlers / AI bots)
 * Keep the include list in sync — booth pages and the API must return the
 * same shape (see Booth/BoothDetailPageClient interfaces).
 *
 * NOTE (geo/deploy-prod): this is the exact production include at 9d42f2b.
 * Do NOT add feat/offline-stores-only fields (emails/phones/websites/
 * voiceLanguages/textLanguages/zangi) until their migrations ship.
 */
export async function getPublishedBoothById(id: string) {
  return prisma.booth.findUnique({
    where: {
      id,
      isActive: true,
      isPublished: true,
    },
    include: {
      seller: {
        select: {
          id: true,
          userId: true,
          companyName: true,
          companyType: true,
          country: true,
          city: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          // Social media accounts
          whatsapp: true,
          wechat: true,
          telegram: true,
          linkedin: true,
          facebook: true,
          instagram: true,
          tiktok: true,
          twitter: true,
          pinterest: true,
          douyin: true,
          qq: true,
          dingtalk: true,
          lark: true,
          wechatVideo: true,
          weibo: true,
          kuaishou: true,
          bilibili: true,
          reddit: true,
          snapchat: true,
          tumblr: true,
          chatSystem: true,
          // Organization info
          organizationType: true,
          registeredCapital: true,
          registeredAddress: true,
          businessAddress: true,
          employeeCount: true,
          patents: true,
          awards: true,
          foundingYear: true,
          businessScope: true,
          legalRepresentative: true,
          registrationNumber: true,
          bankAccount: true,
          taxNumber: true,
          // Media
          logoUrl: true,
          bannerUrl: true,
          companyPhotos: true,
          teamPhotos: true,
          // Map location
          mapLatitude: true,
          mapLongitude: true,
          mapAddress: true,
          // Description
          description: true,
          descriptions: true,
          certifications: true,
          isVerified: true,
          // Verification files (certificates)
          verificationFiles: {
            where: {
              isVerified: true,
            },
            select: {
              id: true,
              fileType: true,
              fileName: true,
              fileUrl: true,
              certificateName: true,
              certificateNumber: true,
              issuingAuthority: true,
              issueDate: true,
              expiryDate: true,
              isVerified: true,
              description: true,
              mimeType: true,
            },
          },
        },
      },
      products: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          titleEn: true,
          titles: true,
          description: true,
          descriptions: true,
          specifications: true,
          mainImageUrl: true,
          images: true,
          videos: true,
          documents: true,
          viewCount: true,
          inquiryCount: true,
          minOrderQty: true,
          supplyCapacity: true,
          hasBrochure: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              nameEn: true,
            },
          },
        },
      },
    },
  })
}

export type PublishedBooth = NonNullable<Awaited<ReturnType<typeof getPublishedBoothById>>>
