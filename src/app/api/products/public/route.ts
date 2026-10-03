import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

/**
 * GET /api/products/public
 * 公开产品列表（买家端），支持五维筛选：
 *   - companyName  公司名称（模糊，含中英文）
 *   - productName  产品名称（模糊，title/titleEn）
 *   - keyword      关键词（命中 Product.keywords JSONB GIN 索引，兼 title/titleEn/description 兜底）
 *   - country      国家（SellerProfile.country 英文全名精确匹配）
 *   - companyType  公司类型（MANUFACTURER | TRADER | BOTH，逗号分隔支持多选）
 * 附加：categoryId / featured / page / limit
 * 全部条件参数化（Prisma where），JOIN SellerProfile 拿公司维度。
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured') === 'true'

    // 五维筛选参数
    const companyName = searchParams.get('companyName')?.trim()
    const productName = searchParams.get('productName')?.trim()
    const keyword = searchParams.get('keyword')?.trim()
    const country = searchParams.get('country')?.trim()
    const companyTypeRaw = searchParams.get('companyType')?.trim()

    // 构建缓存 key（所有筛选维度都参与，避免缓存串味）
    const filters = [
      categoryId && `cat:${categoryId}`,
      featured && 'featured',
      companyName && `co:${encodeURIComponent(companyName)}`,
      productName && `pn:${encodeURIComponent(productName)}`,
      keyword && `kw:${encodeURIComponent(keyword)}`,
      country && `ctry:${encodeURIComponent(country)}`,
      companyTypeRaw && `ctyp:${encodeURIComponent(companyTypeRaw)}`,
    ].filter(Boolean).join('|')

    const cacheKey = CACHE_KEYS.productList(page, limit, filters || undefined)

    const data = await cacheGetOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit

        const where: any = {
          isActive: true,
        }

        if (categoryId) {
          where.categoryId = categoryId
        }
        if (featured) {
          where.isFeatured = true
        }

        // 产品名称：title / titleEn 模糊，不区分大小写
        if (productName) {
          where.OR = [
            ...(where.OR || []),
            { title: { contains: productName, mode: 'insensitive' } },
            { titleEn: { contains: productName, mode: 'insensitive' } },
          ]
        }

        // 关键词：模糊子串匹配（title/titleEn/description + keywords JSONB 数组元素）
        if (keyword) {
          const kw = keyword as string;
          // keywords JSONB 数组子串匹配（array_contains 只能精确匹配，需原生 SQL 子串匹配）
          const kwRows = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Product"
            WHERE EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(COALESCE("keywords", '[]'::jsonb)) AS k
              WHERE k ILIKE ${'%' + kw + '%'}
            )
          `;
          const kwIds = kwRows.map((r) => r.id);

          where.OR = [
            ...(where.OR || []),
            { title: { contains: kw, mode: 'insensitive' } },
            { titleEn: { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
            ...(kwIds.length > 0 ? [{ id: { in: kwIds } }] : []),
          ]
        }

        // 公司维度：通过 seller 关系过滤（Prisma 自动 JOIN SellerProfile）
        const sellerWhere: any = {}
        if (companyName) {
          sellerWhere.companyName = { contains: companyName, mode: 'insensitive' }
        }
        if (country) {
          // 兼容历史脏数据（“中国”/“China”/“CN”混存）：模糊匹配
          sellerWhere.country = { contains: country, mode: 'insensitive' }
        }
        if (companyTypeRaw) {
          const types = companyTypeRaw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)
          if (types.length === 1) {
            sellerWhere.companyType = types[0]
          } else if (types.length > 1) {
            sellerWhere.companyType = { in: types }
          }
        }
        if (Object.keys(sellerWhere).length > 0) {
          where.seller = sellerWhere
        }

        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  nameEn: true,
                  slug: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  companyName: true,
                  companyType: true,
                  country: true,
                  city: true,
                  logoUrl: true,
                  isVerified: true,
                },
              },
              brochure: {
                select: {
                  id: true,
                  fileName: true,
                  fileSize: true,
                },
              },
            },
            orderBy: [
              { isFeatured: 'desc' },
              { createdAt: 'desc' },
            ],
            skip,
            take: limit,
          }),
          prisma.product.count({ where }),
        ])

        return {
          products,
          filters: {
            companyName: companyName || null,
            productName: productName || null,
            keyword: keyword || null,
            country: country || null,
            companyType: companyTypeRaw ? companyTypeRaw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean) : null,
          },
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        }
      },
      CACHE_TTL.MEDIUM
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get public products error:', error)
    return NextResponse.json({
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
