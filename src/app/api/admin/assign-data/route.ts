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

      const marketplaceTasks = await prisma.marketplaceTask.findMany({
        where: { postedById: user.id },
        select: { id: true, title: true, type: true, status: true }
      })

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
        } : null,
        marketplaceTasks: marketplaceTasks.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          status: t.status
        }))
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
        include: {
          seller: {
            include: {
              user: true
            }
          },
          booth: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const sellers = await prisma.sellerProfile.findMany({
        include: {
          user: true
        }
      })

      const marketplaceTasks = await prisma.marketplaceTask.findMany({
        include: {
          postedBy: {
            select: { email: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' }
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
          sellerEmail: p.seller?.user?.email || 'Unknown',
          boothId: p.boothId,
          boothName: p.booth?.name || null
        })),
        marketplaceTasks: marketplaceTasks.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          status: t.status,
          postedById: t.postedById,
          postedByEmail: t.postedBy?.email || 'Unknown',
          postedByName: t.postedBy?.username || 'Unknown'
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
    const { action, targetEmail, boothIds, productIds, taskIds, newSellerId } = body

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    // Separate delete actions (no targetEmail needed) from assign actions
    const deleteActions = ['delete_booths', 'delete_products', 'delete_tasks']
    const isDeleteAction = deleteActions.includes(action)

    // Lookup target user only for assign actions
    let user = null
    let sellerProfile = null

    if (!isDeleteAction) {
      if (!targetEmail) {
        return NextResponse.json({ error: 'targetEmail is required for assign actions' }, { status: 400 })
      }

      user = await prisma.user.findUnique({
        where: { email: targetEmail }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id }
      })
    }

    if (action === 'assign_booths' && boothIds && boothIds.length > 0) {
      if (!sellerProfile) {
        return NextResponse.json({ error: 'User does not have a seller profile' }, { status: 400 })
      }

      const result = await prisma.booth.updateMany({
        where: { id: { in: boothIds } },
        data: { sellerId: sellerProfile.id }
      })

      // Also update products under these booths to keep sellerId consistent
      const productResult = await prisma.product.updateMany({
        where: { boothId: { in: boothIds } },
        data: { sellerId: sellerProfile.id }
      })

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} booths and ${productResult.count} products`,
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

    if (action === 'assign_tasks' && taskIds && taskIds.length > 0) {
      const result = await prisma.marketplaceTask.updateMany({
        where: { id: { in: taskIds } },
        data: { postedById: user.id }
      })

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} marketplace tasks`,
        updatedCount: result.count
      })
    }

    if (action === 'delete_booths' && boothIds && boothIds.length > 0) {
      const result = await prisma.$transaction([
        // Detach products from booths (products become standalone)
        prisma.product.updateMany({
          where: { boothId: { in: boothIds } },
          data: { boothId: null }
        }),
        // Delete booths
        prisma.booth.deleteMany({
          where: { id: { in: boothIds } }
        })
      ])

      return NextResponse.json({
        success: true,
        message: `Deleted ${result[1].count} booths (${result[0].count} products detached)`,
        deletedCount: result[1].count
      })
    }

    if (action === 'delete_products' && productIds && productIds.length > 0) {
      const result = await prisma.$transaction([
        // Detach inquiries from products (keep inquiry records)
        prisma.inquiry.updateMany({
          where: { productId: { in: productIds } },
          data: { productId: null }
        }),
        // Detach visitors from products
        prisma.visitor.updateMany({
          where: { productId: { in: productIds } },
          data: { productId: null }
        }),
        // Delete products (ProductBrochure auto-cascades)
        prisma.product.deleteMany({
          where: { id: { in: productIds } }
        })
      ])

      return NextResponse.json({
        success: true,
        message: `Deleted ${result[2].count} products`,
        deletedCount: result[2].count
      })
    }

    if (action === 'delete_tasks' && taskIds && taskIds.length > 0) {
      // All task relations are Cascade, so direct delete is safe
      const result = await prisma.marketplaceTask.deleteMany({
        where: { id: { in: taskIds } }
      })

      return NextResponse.json({
        success: true,
        message: `Deleted ${result.count} marketplace tasks`,
        deletedCount: result.count
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