import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { resolveSellerFromRequest } from "@/lib/category-auth"
import { handleSEOEvent, pingSearchEngines, purgeCloudflareCache } from "@/lib/seo-automation"

const optimizeProductSchema = z.object({
  productId: z.string(),
  keywords: z.array(z.string().max(100)).max(20).optional(),
  title: z.string().min(3).max(500).optional(),
  description: z.string().max(2000).optional(),
})

const optimizeBoothSchema = z.object({
  boothId: z.string(),
  keywords: z.array(z.string().max(100)).max(20).optional(),
  description: z.string().max(2000).optional(),
})

const optimizeStoreSchema = z.object({
  metaDescription: z.string().max(160).optional(),
  metaTitle: z.string().max(70).optional(),
})

const pingUrlSchema = z.object({
  url: z.string().url().optional(),
  urls: z.array(z.string().url()).max(50).optional(),
  purgeCache: z.boolean().default(true),
  submitToEngines: z.boolean().default(true),
})

// GET - 获取 SEO 分析报告
export async function GET(request: NextRequest) {
  try {
    const { seller } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id, isActive: true },
      select: {
        id: true, title: true, keywords: true, description: true,
        mainImageUrl: true, viewCount: true, inquiryCount: true,
        category: { select: { name: true } }
      }
    })

    const booths = await prisma.booth.findMany({
      where: { sellerId: seller.id, isActive: true },
      select: { id: true, name: true, keywords: true, isPublished: true, exhibitionName: true }
    })

    const productsWithKeywords = products.filter(p => p.keywords && Array.isArray(p.keywords) && p.keywords.length > 0)
    const productsWithDesc = products.filter(p => p.description && p.description.length >= 100)
    const productsWithImages = products.filter(p => p.mainImageUrl && p.mainImageUrl.length > 0)
    const productsWithInquiries = products.filter(p => p.inquiryCount > 0)
    const boothsWithKeywords = booths.filter(b => b.keywords && Array.isArray(b.keywords) && b.keywords.length > 0)
    const publishedBooths = booths.filter(b => b.isPublished)

    let seoScore = 0
    const keywordRate = products.length > 0 ? productsWithKeywords.length / products.length : 0
    seoScore += keywordRate * 25
    const descRate = products.length > 0 ? productsWithDesc.length / products.length : 0
    seoScore += descRate * 25
    const imageRate = products.length > 0 ? productsWithImages.length / products.length : 0
    seoScore += imageRate * 15
    const boothRate = booths.length > 0 ? publishedBooths.length / booths.length : 0
    seoScore += boothRate * 15
    const inquiryRate = products.length > 0 ? productsWithInquiries.length / products.length : 0
    seoScore += inquiryRate * 10
    if (products.length >= 20) seoScore += 10
    else if (products.length >= 10) seoScore += 7
    else if (products.length >= 5) seoScore += 4
    else if (products.length > 0) seoScore += 2
    seoScore = Math.round(Math.min(100, seoScore))

    const recommendations: string[] = []
    if (keywordRate < 0.8) recommendations.push(`Add keywords to ${products.length - productsWithKeywords.length} products`)
    if (descRate < 0.7) recommendations.push(`Expand descriptions for ${products.length - productsWithDesc.length} products (100+ chars)`)
    if (imageRate < 0.9) recommendations.push('Ensure all products have images for visual search')
    if (booths.length > 0 && publishedBooths.length < booths.length) recommendations.push(`Publish all booths to maximize visibility`)
    if (products.length < 10) recommendations.push('Add more products (10+) to improve search rankings')
    recommendations.push('Use specific long-tail keywords (e.g., "fire extinguisher ABC 4kg" not just "fire extinguisher")')
    recommendations.push('Update content regularly to signal freshness to search engines')

    const categoryStats: Record<string, number> = {}
    for (const p of products) {
      const catName = p.category?.name || 'Uncategorized'
      categoryStats[catName] = (categoryStats[catName] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      seller: { id: seller.id, companyName: seller.companyName },
      seoReport: {
        score: seoScore,
        grade: getGrade(seoScore),
        summary: {
          totalProducts: products.length,
          productsWithKeywords: productsWithKeywords.length,
          productsWithDescriptions: productsWithDesc.length,
          productsWithImages: productsWithImages.length,
          productsWithInquiries: productsWithInquiries.length,
          totalBooths: booths.length,
          publishedBooths: publishedBooths.length,
          boothsWithKeywords: boothsWithKeywords.length,
        },
        categoryBreakdown: categoryStats,
        topProducts: products.sort((a, b) => b.inquiryCount - a.inquiryCount).slice(0, 5)
          .map(p => ({ id: p.id, title: p.title, keywords: p.keywords, views: p.viewCount, inquiries: p.inquiryCount })),
        issues: {
          missingKeywords: products.filter(p => !p.keywords || p.keywords.length === 0).map(p => ({ id: p.id, title: p.title })),
          shortDescriptions: products.filter(p => !p.description || p.description.length < 100).map(p => ({ id: p.id, title: p.title, descLength: p.description?.length || 0 })),
          unpublishedBooths: booths.filter(b => !b.isPublished).map(b => ({ id: b.id, name: b.name })),
        },
        recommendations,
      },
    })
  } catch (error) {
    console.error('SEO report error:', error)
    return NextResponse.json({ error: 'Failed to generate SEO report' }, { status: 500 })
  }
}

// POST - 执行 SEO 优化操作
export async function POST(request: NextRequest) {
  try {
    const { seller } = await resolveSellerFromRequest(request)
    if (!seller) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    if (!action) return NextResponse.json({ error: 'Action required: products, booths, store, ping' }, { status: 400 })

    const body = await request.json()

    switch (action) {
      case 'products': return optimizeProducts(body, seller.id)
      case 'booths': return optimizeBooths(body, seller.id)
      case 'store': return optimizeStore(body, seller.id)
      case 'ping': return pingUrls(body)
      default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('SEO optimization error:', error)
    return NextResponse.json({ error: 'SEO optimization failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}

async function optimizeProducts(body: any, sellerId: string) {
  const validation = optimizeProductSchema.safeParse(body)
  if (!validation.success) return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })

  const { productId, keywords, title, description } = validation.data
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.sellerId !== sellerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updateData: any = {}
  if (keywords) updateData.keywords = keywords
  if (title) updateData.title = title
  if (description) updateData.description = description

  const updated = await prisma.product.update({ where: { id: productId }, data: updateData })

  const productUrl = `https://x2xhub.com/products/${productId}`
  const seoResult = await handleSEOEvent({
    type: 'product_update',
    data: { id: productId, url: productUrl, title: title || product.title, description: description || product.description }
  })

  return NextResponse.json({
    success: true,
    message: 'Product SEO optimized',
    product: { id: updated.id, keywords: updated.keywords, title: updated.title },
    seoEvent: seoResult,
    suggestions: generateProductSuggestions(updated),
  })
}

async function optimizeBooths(body: any, sellerId: string) {
  const validation = optimizeBoothSchema.safeParse(body)
  if (!validation.success) return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })

  const { boothId, keywords, description } = validation.data
  const booth = await prisma.booth.findUnique({ where: { id: boothId } })
  if (!booth) return NextResponse.json({ error: 'Booth not found' }, { status: 404 })
  if (booth.sellerId !== sellerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updateData: any = {}
  if (keywords) updateData.keywords = keywords
  if (description) updateData.theme = description

  const updated = await prisma.booth.update({ where: { id: boothId }, data: updateData })

  const boothUrl = `https://x2xhub.com/booths/${boothId}`
  await handleSEOEvent({ type: 'booth_update', data: { id: boothId, url: boothUrl, title: booth.name } })

  return NextResponse.json({
    success: true,
    message: 'Booth SEO optimized',
    booth: { id: updated.id, name: updated.name, keywords: updated.keywords },
  })
}

async function optimizeStore(body: any, sellerId: string) {
  const validation = optimizeStoreSchema.safeParse(body)
  if (!validation.success) return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })

  const { metaDescription, metaTitle } = validation.data
  const updateData: any = {}
  if (metaDescription) updateData.description = metaDescription
  if (metaTitle) updateData.boothName = metaTitle

  const updated = await prisma.sellerProfile.update({ where: { id: sellerId }, data: updateData })
  const storeUrl = `https://x2xhub.com/seller/${sellerId}`
  await handleSEOEvent({ type: 'store_update', data: { id: sellerId, url: storeUrl, title: updated.companyName } })

  return NextResponse.json({
    success: true,
    message: 'Store SEO optimized',
    store: { id: updated.id, companyName: updated.companyName },
  })
}

async function pingUrls(body: any) {
  const validation = pingUrlSchema.safeParse(body)
  if (!validation.success) return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })

  const { url, urls, purgeCache, submitToEngines } = validation.data
  const urlsToPing: string[] = []
  if (url) urlsToPing.push(url)
  if (urls) urlsToPing.push(...urls)
  if (urlsToPing.length === 0) return NextResponse.json({ error: 'No URLs provided' }, { status: 400 })

  const results: any = {}
  if (purgeCache) results.cloudflare = await purgeCloudflareCache(urlsToPing)
  if (submitToEngines) results.pingResults = await pingSearchEngines(urlsToPing[0])

  return NextResponse.json({ success: true, message: `Ponged ${urlsToPing.length} URL(s)`, urls: urlsToPing, results })
}

function getGrade(score: number) {
  if (score >= 90) return { letter: 'A+', description: 'Excellent', color: '#10b981' }
  if (score >= 80) return { letter: 'A', description: 'Great', color: '#22c55e' }
  if (score >= 70) return { letter: 'B', description: 'Good', color: '#84cc16' }
  if (score >= 60) return { letter: 'C', description: 'Average', color: '#eab308' }
  if (score >= 50) return { letter: 'D', description: 'Below average', color: '#f97316' }
  return { letter: 'F', description: 'Needs improvement', color: '#ef4444' }
}

function generateProductSuggestions(product: any): string[] {
  const suggestions: string[] = []
  if (!product.keywords || product.keywords.length === 0) {
    suggestions.push('Add 3-5 relevant keywords')
  } else if (product.keywords.length < 3) {
    suggestions.push('Add more keywords (aim for 5+)')
  }
  if (!product.description || product.description.length < 100) {
    suggestions.push('Expand description to 100+ characters')
  }
  return suggestions
}