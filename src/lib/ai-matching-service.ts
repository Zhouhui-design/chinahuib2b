import { prisma } from '@/lib/db'
import { Product, MarketplaceTask, Booth, User } from '@prisma/client'

export interface MatchResult {
  id: string
  type: 'product' | 'task' | 'booth' | 'seller'
  title: string
  description: string | undefined
  price: number | undefined
  currency: string | undefined
  category: string | undefined
  matchScore: number
  posterId: string
  posterName: string | undefined
  posterCompany: string | undefined
  createdAt: string | undefined
}

export interface MatchingContext {
  title: string
  description: string | undefined
  categoryId: string | undefined
  price: number | undefined
  currency: string | undefined
  type: 'product' | 'task' | 'requirement'
}

const COMMON_KEYWORDS: string[] = [
  'buy', 'sell', 'purchase', 'supply', 'manufacture', 'product', 'service',
  'price', 'quantity', 'quality', 'delivery', 'ship', 'order', 'wholesale',
  'retail', 'factory', 'supplier', 'vendor', 'customer', 'client',
  'new', 'used', 'custom', 'OEM', 'ODM', 'stock', 'available'
]

function extractKeywords(text: string): string[] {
  const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, ' ')
  const words = cleanedText.split(/\s+/).filter((w: string) => w.length >= 2)
  
  const filtered = words.filter((word: string) => !COMMON_KEYWORDS.includes(word))
  
  const unique = Array.from(new Set(filtered))
  
  return unique.slice(0, 10)
}

function calculateMatchScore(keywords: string[], targetText: string): number {
  if (keywords.length === 0) return 0
  
  const targetLower = targetText.toLowerCase()
  let matches = 0
  
  for (const keyword of keywords) {
    if (targetLower.includes(keyword)) {
      matches++
    }
  }
  
  return (matches / keywords.length) * 100
}

function calculateCategoryMatch(categoryId: string | undefined, targetCategoryId: string | undefined): number {
  if (!categoryId || !targetCategoryId) return 0
  return categoryId === targetCategoryId ? 100 : 0
}

function calculatePriceMatch(price: number | undefined, targetPrice: number | undefined): number {
  if (!price || !targetPrice) return 0
  
  const ratio = Math.min(price, targetPrice) / Math.max(price, targetPrice)
  return ratio * 100
}

export async function findMatchingBuyers(product: Product & { seller: any }): Promise<MatchResult[]> {
  const keywords = extractKeywords(product.title + ' ' + (product.description || ''))
  
  const openTasks = await prisma.marketplaceTask.findMany({
    where: {
      status: 'OPEN',
      type: {
        in: ['MANUFACTURING', 'PRODUCT_SALE']
      }
    },
    include: {
      postedBy: true
    },
    take: 50
  })
  
  const matchingBids = await prisma.auctionListing.findMany({
    where: {
      type: 'BUYING',
      status: 'ACTIVE'
    },
    include: {
      poster: true
    },
    take: 50
  })
  
  const results: MatchResult[] = []
  
  for (const task of openTasks) {
    const text = task.title + ' ' + task.description
    const keywordScore = calculateMatchScore(keywords, text)
    const priceScore = calculatePriceMatch(
      undefined,
      task.price ? Number(task.price) : undefined
    )
    const categoryScore = calculateCategoryMatch(product.categoryId, undefined)
    
    const matchScore = (keywordScore * 0.7) + (priceScore * 0.2) + (categoryScore * 0.1)
    
    if (matchScore >= 30) {
      results.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        price: task.price ? Number(task.price) : undefined,
        currency: task.currency,
        category: undefined,
        matchScore: Math.round(matchScore),
        posterId: task.postedById,
        posterName: task.postedBy.displayName || task.postedBy.username,
        posterCompany: undefined,
        createdAt: task.createdAt.toISOString()
      })
    }
  }
  
  for (const bid of matchingBids) {
    const text = bid.title + ' ' + (bid.description || '')
    const keywordScore = calculateMatchScore(keywords, text)
    const priceScore = calculatePriceMatch(
      undefined,
      bid.price ? Number(bid.price) : undefined
    )
    
    const matchScore = (keywordScore * 0.8) + (priceScore * 0.2)
    
    if (matchScore >= 30) {
      results.push({
        id: bid.id,
        type: 'task',
        title: bid.title,
        description: bid.description || undefined,
        price: bid.price ? Number(bid.price) : undefined,
        currency: bid.currency,
        category: undefined,
        matchScore: Math.round(matchScore),
        posterId: bid.posterId,
        posterName: bid.poster.displayName || bid.poster.username,
        posterCompany: undefined,
        createdAt: bid.createdAt.toISOString()
      })
    }
  }
  
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10)
}

export async function findMatchingSellers(task: MarketplaceTask & { postedBy: User }): Promise<MatchResult[]> {
  const keywords = extractKeywords(task.title + ' ' + task.description)
  
  const activeProducts = await prisma.product.findMany({
    where: {
      isActive: true
    },
    include: {
      seller: true,
      category: true
    },
    take: 100
  })
  
  const activeBooths = await prisma.booth.findMany({
    where: {
      isActive: true,
      isPublished: true
    },
    include: {
      seller: true
    },
    take: 50
  })
  
  const sellingListings = await prisma.auctionListing.findMany({
    where: {
      type: 'SELLING',
      status: 'ACTIVE'
    },
    include: {
      poster: true,
      seller: true
    },
    take: 50
  })
  
  const results: MatchResult[] = []
  
  for (const product of activeProducts) {
    const text = product.title + ' ' + (product.description || '')
    const keywordScore = calculateMatchScore(keywords, text)
    
    const matchScore = keywordScore * 0.8
    
    if (matchScore >= 30) {
      const sellerUserId = (product.seller as any).userId
      const sellerUser = (product.seller as any).user
      
      results.push({
        id: product.id,
        type: 'product',
        title: product.title,
        description: product.description || undefined,
        price: undefined,
        currency: 'USD',
        category: product.category?.name,
        matchScore: Math.round(matchScore),
        posterId: sellerUserId,
        posterName: sellerUser?.displayName,
        posterCompany: product.seller.companyName,
        createdAt: product.createdAt.toISOString()
      })
    }
  }
  
  for (const booth of activeBooths) {
    const text = booth.name + ' ' + (booth.exhibitionName || '')
    const keywordScore = calculateMatchScore(keywords, text)
    
    const matchScore = keywordScore * 0.8
    
    if (matchScore >= 30) {
      const sellerUserId = (booth.seller as any).userId
      const sellerUser = (booth.seller as any).user
      
      results.push({
        id: booth.id,
        type: 'booth',
        title: booth.name,
        description: booth.exhibitionName || undefined,
        price: undefined,
        currency: undefined,
        category: undefined,
        matchScore: Math.round(matchScore),
        posterId: sellerUserId,
        posterName: sellerUser?.displayName,
        posterCompany: booth.seller.companyName,
        createdAt: booth.createdAt.toISOString()
      })
    }
  }
  
  for (const listing of sellingListings) {
    const text = listing.title + ' ' + (listing.description || '')
    const keywordScore = calculateMatchScore(keywords, text)
    const priceScore = calculatePriceMatch(
      task.price ? Number(task.price) : undefined,
      listing.price ? Number(listing.price) : undefined
    )
    
    const matchScore = (keywordScore * 0.6) + (priceScore * 0.4)
    
    if (matchScore >= 30) {
      results.push({
        id: listing.id,
        type: 'product',
        title: listing.title,
        description: listing.description || undefined,
        price: listing.price ? Number(listing.price) : undefined,
        currency: listing.currency,
        category: listing.category || undefined,
        matchScore: Math.round(matchScore),
        posterId: listing.posterId,
        posterName: listing.poster.displayName || listing.poster.username,
        posterCompany: listing.seller?.companyName,
        createdAt: listing.createdAt.toISOString()
      })
    }
  }
  
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10)
}

export async function performProductMatching(productId: string): Promise<{
  success: boolean
  product: Product | null
  matches: MatchResult[]
}> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: { include: { user: true } } }
    })
    
    if (!product) {
      return { success: false, product: null, matches: [] }
    }
    
    const matches = await findMatchingBuyers(product)
    
    return { success: true, product, matches }
  } catch (error) {
    console.error('Error performing product matching:', error)
    return { success: false, product: null, matches: [] }
  }
}

export async function performTaskMatching(taskId: string): Promise<{
  success: boolean
  task: MarketplaceTask | null
  matches: MatchResult[]
}> {
  try {
    const task = await prisma.marketplaceTask.findUnique({
      where: { id: taskId },
      include: { postedBy: true }
    })
    
    if (!task) {
      return { success: false, task: null, matches: [] }
    }
    
    const matches = await findMatchingSellers(task)
    
    return { success: true, task, matches }
  } catch (error) {
    console.error('Error performing task matching:', error)
    return { success: false, task: null, matches: [] }
  }
}