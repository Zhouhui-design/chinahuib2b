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
    redirect('/become-seller')
  }

  // Get statistics
  const [productCount, totalViews, totalDownloads] = await Promise.all([
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

  // Get recent products
  const recentProducts = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      category: { select: { name: true } }
    }
  })

  return (
    <SellerDashboardPage
      initialData={{
        seller,
        productCount,
        totalViews,
        totalDownloads,
        recentProducts
      }}
    />
  )
}
