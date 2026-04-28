import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://chinahuib2b.top'
  const currentDate = new Date()

  // 1. 静态页面列表（多语言首页）
  const staticPages = [
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/en', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/zh', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/ar', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/es', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/fr', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/de', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/ru', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/ja', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/ko', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/pt', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/hi', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/tr', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/th', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/id', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/vi', priority: 0.9, changeFrequency: 'daily' as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency,
    priority,
  }))

  // 2. 动态获取所有活跃产品
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { 
        id: true,
        updatedAt: true 
      },
      orderBy: { updatedAt: 'desc' },
    })

    productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error)
  }

  // 3. 动态获取所有卖家店铺
  let storePages: MetadataRoute.Sitemap = []
  try {
    const sellers = await prisma.sellerProfile.findMany({
      where: { 
        storePublished: true,
        companyName: { not: null }
      },
      select: { 
        id: true,
        updatedAt: true 
      },
      orderBy: { updatedAt: 'desc' },
    })

    storePages = sellers.map((seller) => ({
      url: `${baseUrl}/stores/${seller.id}`,
      lastModified: seller.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Failed to fetch sellers for sitemap:', error)
  }

  // 4. 其他重要页面
  const otherPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  // 合并所有页面
  return [
    ...staticPages,
    ...otherPages,
    ...productPages,
    ...storePages,
  ]
}
