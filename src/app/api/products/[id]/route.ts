import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import fs from "fs"
import path from "path"
import { resolveSellerFromRequest } from "@/lib/category-auth"
import { performProductMatching } from "@/lib/ai-matching-service"
import { handleSEOEvent } from "@/lib/seo-automation"

// 检查并清理不存在的本地图片文件引用
function validateAndCleanImages(
  images: string[] | undefined,
  mainImageUrl: string | undefined
): { validImages: string[]; validMainImage: string; warnings: string[] } {
  const warnings: string[] = []
  const publicDir = path.join(process.cwd(), 'public')

  const validImages: string[] = []
  const seen = new Set<string>()

  if (images) {
    for (const img of images) {
      if (img.startsWith('http://') || img.startsWith('https://')) {
        if (!seen.has(img)) { validImages.push(img); seen.add(img) }
        continue
      }
      if (img.startsWith('/')) {
        const filePath = path.join(publicDir, img)
        if (fs.existsSync(filePath)) {
          if (!seen.has(img)) { validImages.push(img); seen.add(img) }
        } else {
          warnings.push(`图片文件不存在: ${img}`)
        }
        continue
      }
      if (!seen.has(img)) { validImages.push(img); seen.add(img) }
    }
  }

  let validMainImage = mainImageUrl || ''
  if (mainImageUrl && mainImageUrl.startsWith('/')) {
    if (!mainImageUrl.startsWith('http')) {
      const filePath = path.join(publicDir, mainImageUrl)
      if (!fs.existsSync(filePath)) {
        warnings.push(`主图文件不存在: ${mainImageUrl}`)
        validMainImage = validImages[0] || ''
      }
    }
  }

  return { validImages, validMainImage, warnings }
}

const updateSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  titles: z.record(z.string(), z.string()).optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  descriptions: z.record(z.string(), z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  minOrderQty: z.number().min(1).optional(),
  minOrderUnitId: z.string().optional(),
  supplyCapacity: z.string().optional(),
  supplyCapacityUnitId: z.string().optional(),
  images: z.array(z.string().refine(
    (val) => val.startsWith('/uploads/') || /^https?:\/\//.test(val)
  )).optional(),
  mainImageUrl: z.string().nullable().optional(),
  videos: z.array(z.string()).optional(),
  documents: z.array(z.object({
    url: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  acceptsOEM: z.boolean().optional(),
  youtubeUrl: z.string().nullable().optional(),
  boothId: z.string().nullable().optional(),
  keywords: z.array(z.string().min(1).max(100)).max(50).optional(),
  price: z.number().positive().nullable().optional(),
  currency: z.string().optional(),
  unit: z.string().optional(),
})

// GET - 获取单个产品详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { seller } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true, nameEn: true } },
        booth: { select: { id: true, name: true, exhibitionName: true } },
        seller: { select: { id: true, companyName: true } },
        minOrderUnit: true,
        supplyCapacityUnit: true,
        brochure: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 检查权限：只有产品所有者或管理员可以查看
    if (product.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - 更新产品（与PATCH相同的逻辑，兼容前端PUT请求）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PATCH(request, { params })
}

// PATCH - 更新产品
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { seller } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    // 检查产品是否存在及归属
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, sellerId: true, title: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = validation.data
    const updateData: any = {}

    // 基础字段更新
    if (data.title !== undefined) updateData.title = data.title
    if (data.titles !== undefined) updateData.titles = data.titles
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.description !== undefined) updateData.description = data.description
    if (data.descriptions !== undefined) updateData.descriptions = data.descriptions
    if (data.specifications !== undefined) updateData.specifications = data.specifications
    if (data.minOrderQty !== undefined) updateData.minOrderQty = data.minOrderQty
    if (data.minOrderUnitId !== undefined) updateData.minOrderUnitId = data.minOrderUnitId
    if (data.supplyCapacity !== undefined) updateData.supplyCapacity = data.supplyCapacity
    if (data.supplyCapacityUnitId !== undefined) updateData.supplyCapacityUnitId = data.supplyCapacityUnitId
    if (data.images !== undefined) updateData.images = data.images
    if (data.mainImageUrl !== undefined) updateData.mainImageUrl = data.mainImageUrl
    if (data.videos !== undefined) updateData.videos = data.videos
    if (data.documents !== undefined) updateData.documents = data.documents
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.acceptsOEM !== undefined) updateData.acceptsOEM = data.acceptsOEM
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = data.youtubeUrl
    if (data.keywords !== undefined) updateData.keywords = data.keywords
    if (data.price !== undefined) updateData.price = data.price
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.unit !== undefined) updateData.unit = data.unit

    // 展台关联
    if (data.boothId !== undefined) {
      if (data.boothId === null) {
        updateData.booth = { disconnect: true }
      } else {
        updateData.boothId = data.boothId
      }
    }

    // 校验并清理图片文件引用（仅当更新图片时）
    let imageWarnings: string[] = []
    if (data.images !== undefined || data.mainImageUrl !== undefined) {
      const { validImages, validMainImage, warnings } = validateAndCleanImages(
        data.images,
        data.mainImageUrl
      )
      if (data.images !== undefined) updateData.images = validImages
      if (data.mainImageUrl !== undefined) updateData.mainImageUrl = validMainImage
      imageWarnings = warnings
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        booth: { select: { id: true, name: true } },
        minOrderUnit: true,
        supplyCapacityUnit: true,
      }
    })

    // 如果标题或描述更新了，重新进行SEO和AI匹配
    if (data.title || data.description) {
      setTimeout(async () => {
        try {
          await handleSEOEvent({
            type: 'product_update',
            data: {
              id: product.id,
              url: `https://x2xhub.com/de/products/${product.id}`,
              title: product.title,
              description: product.description,
              imageUrl: product.mainImageUrl ? `https://x2xhub.com${product.mainImageUrl}` : undefined,
            },
          })
        } catch (error) {
          console.error('Error in SEO automation:', error)
        }
      }, 500)
    }

    const response: any = {
      success: true,
      product,
      message: 'Product updated successfully',
    }
    if (imageWarnings.length > 0) {
      response.warnings = imageWarnings
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { seller } = await resolveSellerFromRequest(request)

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // 检查产品是否存在及归属
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, sellerId: true, title: true, boothId: true }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (existingProduct.sellerId !== seller.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 删除相关的 brochure 文件（如果存在）
    if (existingProduct.boothId) {
      // 先断开展位关联
      await prisma.product.update({
        where: { id: params.id },
        data: { booth: { disconnect: true } }
      })
    }

    // 删除产品
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
