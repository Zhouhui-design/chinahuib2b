import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // If ID is provided, get single booth
    if (id) {
      const booth = await prisma.booth.findUnique({
        where: { 
          id,
          isActive: true,
          isPublished: true
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
              youtube: true,
              tiktok: true,
              twitter: true,
              pinterest: true,
              douyin: true,
              xiaohongshu: true,
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
                  isVerified: true 
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
                }
              }
            }
          },
          products: {
            where: { isActive: true },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  nameEn: true,
                }
              }
            }
          }
        }
      })

      if (!booth) {
        return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
      }

      return NextResponse.json({ booth })
    }

    // Otherwise, get all published booths
    const booths = await prisma.booth.findMany({
      where: { 
        isActive: true,
        isPublished: true
      },
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            country: true,
            city: true,
            logoUrl: true,
            isVerified: true,
          }
        },
        products: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            mainImageUrl: true,
            images: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ booths })

  } catch (error) {
    console.error('Get public booths error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch booths',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
