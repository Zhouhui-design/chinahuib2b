import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = request.nextUrl.searchParams.get('email')

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          sellerProfile: {
            include: {
              booths: {
                include: {
                  products: {
                    select: { id: true, title: true }
                  }
                }
              },
              products: {
                where: { boothId: null }
              }
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        sellerProfile: user.sellerProfile ? {
          id: user.sellerProfile.id,
          companyName: user.sellerProfile.companyName,
          boothCount: user.sellerProfile.booths.length,
          productCount: user.sellerProfile.products.length +
            user.sellerProfile.booths.reduce((sum, b) => sum + b.products.length, 0),
          booths: user.sellerProfile.booths.map(b => ({
            id: b.id,
            name: b.name,
            boothNumber: b.boothNumber,
            productCount: b.products.length
          })),
          standaloneProducts: user.sellerProfile.products.map(p => ({
            id: p.id,
            title: p.title
          }))
        } : null
      })
    } else {
      const booths = await prisma.booth.findMany({
        include: {
          seller: {
            include: {
              user: true
            }
          },
          _count: { select: { products: true } }
        }
      })

      const products = await prisma.product.findMany({
        where: { boothId: null },
        include: {
          seller: {
            include: {
              user: true
            }
          }
        }
      })

      const sellers = await prisma.sellerProfile.findMany({
        include: {
          user: true
        }
      })

      return NextResponse.json({
        booths: booths.map(b => ({
          id: b.id,
          name: b.name,
          sellerId: b.sellerId,
          sellerName: b.seller?.companyName || 'Unknown',
          sellerEmail: b.seller?.user?.email || 'Unknown',
          productCount: b._count.products
        })),
        standaloneProducts: products.map(p => ({
          id: p.id,
          title: p.title,
          sellerId: p.sellerId,
          sellerName: p.seller?.companyName || 'Unknown',
          sellerEmail: p.seller?.user?.email || 'Unknown'
        })),
        sellers: sellers.map(s => ({
          id: s.id,
          companyName: s.companyName,
          userEmail: s.user?.email,
          userName: s.user?.username,
          userRole: s.user?.role
        }))
      })
    }
  } catch (error) {
    console.error('[AdminAssignData] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, targetEmail, boothIds, productIds, newSellerId } = body

    if (!action || !targetEmail) {
      return NextResponse.json({ error: 'action and targetEmail are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id }
    })

    if (action === 'assign_booths' && boothIds && boothIds.length > 0) {
      if (!sellerProfile) {
        return NextResponse.json({ error: 'User does not have a seller profile' }, { status: 400 })
      }

      const result = await prisma.booth.updateMany({
        where: { id: { in: boothIds } },
        data: { sellerId: sellerProfile.id }
      })

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} booths`,
        updatedCount: result.count
      })
    }

    if (action === 'assign_products' && productIds && productIds.length > 0) {
      if (!sellerProfile) {
        return NextResponse.json({ error: 'User does not have a seller profile' }, { status: 400 })
      }

      const result = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { sellerId: sellerProfile.id }
      })

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} products`,
        updatedCount: result.count
      })
    }

    if (action === 'transfer_all' && newSellerId) {
      const result = await prisma.booth.updateMany({
        where: { sellerId: newSellerId },
        data: { sellerId: sellerProfile?.id || '' }
      })

      const productResult = await prisma.product.updateMany({
        where: { sellerId: newSellerId },
        data: { sellerId: sellerProfile?.id || '' }
      })

      return NextResponse.json({
        success: true,
        message: `Transferred ${result.count} booths and ${productResult.count} products`,
        boothCount: result.count,
        productCount: productResult.count
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[AdminAssignData] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}