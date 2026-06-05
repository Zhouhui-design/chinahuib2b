import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface ShareLink {
  id: string
  url: string
  platform: string
  clicks: number
  createdAt: string
}

interface EmbeddedCode {
  type: 'widget' | 'badge' | 'card'
  code: string
  preview: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: {
        id: true,
        title: true,
        mainImageUrl: true,
        price: true
      }
    })

    const shareLinks: ShareLink[] = []
    const platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy']

    for (const product of products) {
      const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://x2xhub.com'}/products/${product.id}`
      
      for (const platform of platforms) {
        let url = baseUrl
        
        switch (platform) {
          case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`
            break
          case 'twitter':
            url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(product.title)}`
            break
          case 'linkedin':
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`
            break
          case 'whatsapp':
            url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.title} - ${baseUrl}`)}`
            break
          case 'email':
            url = `mailto:?subject=${encodeURIComponent(product.title)}&body=${encodeURIComponent(baseUrl)}`
            break
        }

        shareLinks.push({
          id: `${product.id}-${platform}`,
          url,
          platform,
          clicks: 0,
          createdAt: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({
      success: true,
      products,
      shareLinks,
      embeddedCodes: generateEmbeddedCodes(products),
      stats: {
        totalProducts: products.length,
        totalLinks: shareLinks.length,
        platforms: platforms.length
      }
    })
  } catch (error) {
    console.error("Backlink API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch backlink data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

function generateEmbeddedCodes(products: Array<{ id: string; title: string; mainImageUrl: string; price: number | null }>): EmbeddedCode[] {
  const codes: EmbeddedCode[] = []

  products.slice(0, 3).forEach(product => {
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://x2xhub.com'}/products/${product.id}`

    codes.push({
      type: 'card',
      code: `<div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <a href="${productUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
    <img src="${product.mainImageUrl}" alt="${product.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937; line-height: 1.4;">${product.title}</h3>
    <p style="font-size: 20px; font-weight: 700; color: #3b82f6; margin: 0;">$${Number(product.price || 0).toFixed(2)}</p>
  </a>
</div>`,
      preview: product.title
    })

    codes.push({
      type: 'badge',
      code: `<a href="${productUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; items-center: center; gap: 8px; padding: 8px 12px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500;">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  View Product
</a>`,
      preview: product.title
    })
  })

  return codes
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, productId, platform } = body

    if (action === 'track-click') {
      const seller = await prisma.sellerProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!seller) {
        return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
      }

      await prisma.sellerProfile.update({
        where: { userId: session.user.id },
        data: {
          boothViews: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: "Click tracked"
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Backlink POST error:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
