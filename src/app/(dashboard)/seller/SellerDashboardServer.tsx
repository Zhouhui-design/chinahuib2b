import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import SellerDashboardPage from './SellerDashboardClient'

export default async function SellerDashboardServer() {
  const session = await auth()
  
  if (!session?.user?.id) {
    // Get language from cookie or use default 'en'
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const language = cookieStore.get('language')?.value || 'en'
    redirect(`/${language}/auth/login`)
  }

  // Get seller profile
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!seller) {
    // Redirect to settings page to create profile
    redirect('/seller/settings')
  }

  // Get statistics
  const [productCount, totalViewsResult, totalDownloadsResult] = await Promise.all([
    prisma.product.count({
      where: { sellerId: seller.id }
    }),
    prisma.product.aggregate({
      where: { sellerId: seller.id },
      _sum: { viewCount: true }
    }),
    prisma.productBrochure.aggregate({
      where: { product: { sellerId: seller.id } },
      _sum: { downloadCount: true }
    })
  ])

  // Extract numeric values from aggregate results
  const totalViews = totalViewsResult._sum.viewCount || 0
  const totalDownloads = totalDownloadsResult._sum.downloadCount || 0

  // Get recent products
  const recentProducts = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      category: { select: { name: true } }
    }
  })

  // Convert data to match client component types
  const formattedSeller = {
    id: seller.id,
    companyName: seller.companyName,
    companyType: seller.companyType,
    country: seller.country,
    city: seller.city,
    subscriptionStatus: seller.subscriptionStatus,
    isVerified: seller.isVerified,
    createdAt: seller.createdAt.toISOString()
  }

  const formattedProducts = recentProducts.map(product => ({
    id: product.id,
    title: product.title,
    mainImageUrl: product.mainImageUrl || '',
    viewCount: product.viewCount || 0,
    inquiryCount: product.inquiryCount || 0,
    createdAt: product.createdAt.toISOString(),
    category: { name: product.category?.name || '' }
  }))

  return (
    <SellerDashboardPage
      initialData={{
        seller: formattedSeller,
        productCount,
        totalViews,
        totalDownloads,
        recentProducts: formattedProducts
      }}
    />
  )
}
