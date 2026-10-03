/**
 * Setup script for 江西源上草香料有限公司
 * Run on production server via: node scripts/setup-yuanshangcao.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const prisma = new PrismaClient()

const PRODUCT_IMAGES_BASE = '/home/sardenesy/桌面/新建文件夹/化工/第六类 - 化学工业及其相关工业的产品/第二十九章 - 有机化学品/江西源上草'

async function main() {
  console.log('🏭 Setting up 江西源上草香料有限公司...\n')

  try {
    // ─── 1. Find the AI user ───
    const aiUser = await prisma.user.findFirst({
      where: { username: '4_AI_Seller' },
    })
    if (!aiUser) {
      console.log('ERROR: AI user 4_AI_Seller not found. Create it first via /api/accounts/create')
      process.exit(1)
    }
    console.log(`✅ AI User: ${aiUser.username} (ID: ${aiUser.id})`)

    // ─── 2. Find category for 有机化学品 ───
    let category = await prisma.category.findFirst({
      where: { OR: [
        { name: { contains: '有机化学品' } },
        { nameEn: { contains: 'organic' } },
        { slug: { contains: 'organic' } },
      ]},
    })

    if (!category) {
      // Find parent category
      let parent = await prisma.category.findFirst({
        where: { OR: [
          { name: { contains: '化学工业' } },
          { name: { contains: '化工' } },
        ]},
      })

      category = await prisma.category.create({
        data: {
          name: '第二十九章 有机化学品',
          nameEn: 'Chapter 29 - Organic Chemicals',
          slug: 'chapter-29-organic-chemicals-' + Date.now(),
          level: parent ? parent.level + 1 : 3,
          parentId: parent?.id,
          model: '化工产品',
          modelEn: 'Chemical Products',
        },
      })
      console.log(`✅ Created category: ${category.name} (ID: ${category.id})`)
    } else {
      console.log(`✅ Category: ${category.name} (ID: ${category.id})`)
    }

    // ─── 3. Find KG unit ───
    let unit = await prisma.unit.findFirst({
      where: { OR: [{ name: 'KG' }, { nameEn: 'Kilogram' }, { symbol: 'kg' }] },
    })
    if (!unit) {
      unit = await prisma.unit.create({
        data: { name: 'KG', nameEn: 'Kilogram', symbol: 'kg' },
      })
      console.log(`✅ Created KG unit: ${unit.id}`)
    } else {
      console.log(`✅ Unit: ${unit.name} (ID: ${unit.id})`)
    }

    // ─── 4. Create/update seller profile ───
    let seller = await prisma.sellerProfile.findFirst({
      where: { userId: aiUser.id },
    })

    const slugBase = 'yuanshangcao-flavor'
    const randomSuffix = crypto.randomBytes(4).toString('hex')
    const storeSlug = `${slugBase}-${randomSuffix}`

    const sellerData = {
      companyName: '江西源上草香料有限公司',
      companyNameEn: 'Jiangxi Yuanshangcao Flavor Co., Ltd.',
      description: '江西源上草香料有限公司成立于2019年，坐落于江西省吉安市吉水县，是一家专业从事香精香料制造的微型企业。公司拥有经验丰富的技术团队，致力于为全球客户提供高品质的香精香料产品。主要产品包括枯茗醛、乳酸薄荷酯、孟二醇、松油醇、正己醛、降龙涎香醚、龙涎酮等有机化学品。',
      descriptionEn: 'Established in 2019, Jiangxi Yuanshangcao Flavor Co., Ltd. is a micro-enterprise specialized in fragrance and flavor manufacturing, located in Jishui County, Ji\'an City, Jiangxi Province. With an experienced technical team, we provide high-quality fragrance and flavor products including cuminaldehyde, menthyl lactate, menthoglycol, terpineol, hexanal, ambroxide, and iso e super.',
      contactName: '王伦香',
      contactNameEn: 'Wang Lunxiang',
      country: 'China',
      city: 'Ji\'an',
      address: '江西省吉安市吉水县城西工业园潭潭路',
      phone: '+8618627407019',
      email: 'sardenesy@gmail.com',
      organizationType: 'ENTERPRISE',
      registeredCapital: '1000万元',
      employeeCount: '4',
      boothName: '源上草香料展厅',
      boothNameEn: 'Yuanshangcao Flavor Booth',
      keywords: ['香精香料', '有机化学品', '化学工业', 'fragrance', 'flavor', 'organic chemicals'],
    }

    if (seller) {
      seller = await prisma.sellerProfile.update({
        where: { id: seller.id },
        data: { ...sellerData, profileStatus: 'APPROVED' },
      })
      console.log(`✅ Updated seller profile: ${seller.id}`)
    } else {
      seller = await prisma.sellerProfile.create({
        data: {
          ...sellerData,
          userId: aiUser.id,
          storeSlug,
          profileStatus: 'APPROVED',
          isVerified: true,
          isActive: true,
        },
      })
      console.log(`✅ Created seller profile: ${seller.id} (slug: ${storeSlug})`)
    }

    // ─── 5. Create booth ───
    const exhibitionName = 'Chemical Raw Materials & Fine Chemicals Exhibition'
    const exhibitionNameCn = '化工原料及精细化学品展览会'

    const booth = await prisma.booth.create({
      data: {
        sellerId: seller.id,
        sellerUserId: seller.userId,
        exhibitionName,
        exhibitionNameEn: exhibitionName,
        boothName: sellerData.boothName,
        boothNameEn: sellerData.boothNameEn,
        isActive: true,
        categoryId: category.id,
        keywords: [
          '香精香料', '有机化学品', '化学工业', '香料制造',
          'fragrance', 'flavor', 'organic chemicals', 'fine chemicals',
        ],
        descriptions: {
          zh: '江西源上草香料有限公司 - 专业香精香料制造商，提供枯茗醛、乳酸薄荷酯、孟二醇、松油醇、正己醛、降龙涎香醚、龙涎酮等高品质有机化学品。',
          en: 'Jiangxi Yuanshangcao Flavor Co., Ltd. - Professional fragrance & flavor manufacturer offering high-quality organic chemicals.',
        },
        titles: {
          zh: '江西源上草香料 - 专业香精香料制造商',
          en: 'Jiangxi Yuanshangcao Flavor - Professional Fragrance & Flavor Manufacturer',
        },
      },
    })
    console.log(`✅ Booth created: ${booth.id}\n`)

    // ─── 6. Create products ───
    const products = [
      {
        nameCn: '枯茗醛', nameEn: 'Cuminaldehyde',
        title: 'Cuminaldehyde / 枯茗醛',
        desc: 'Cuminaldehyde (4-isopropylbenzaldehyde) is an aromatic organic compound with a strong cumin odor. Used in fragrance and flavor industries.',
        keywords: ['枯茗醛', 'Cuminaldehyde', '有机化学品', '香精香料', 'organic chemical'],
      },
      {
        nameCn: '乳酸薄荷酯', nameEn: 'Menthyl Lactate',
        title: 'Menthyl Lactate / 乳酸薄荷酯',
        desc: 'Menthyl lactate is a cooling agent derived from menthol and lactic acid. Provides long-lasting cooling sensation.',
        keywords: ['乳酸薄荷酯', 'Menthyl Lactate', '凉感剂', 'cooling agent'],
      },
      {
        nameCn: '孟二醇', nameEn: 'Menthoglycol',
        title: 'Menthoglycol / 孟二醇',
        desc: 'Menthoglycol is a dihydro derivative of menthol with a fresh, minty odor. Used in fragrance compositions.',
        keywords: ['孟二醇', 'Menthoglycol', '薄荷醇', 'menthol derivative'],
      },
      {
        nameCn: '松油醇', nameEn: 'Terpineol',
        title: 'Terpineol / 松油醇',
        desc: 'Terpineol is a terpene alcohol with lilac-like fragrance. Used in perfumes, cosmetics, and as flavor ingredient.',
        keywords: ['松油醇', 'Terpineol', '萜烯醇', 'terpene alcohol'],
      },
      {
        nameCn: '正己醛', nameEn: 'Hexanal',
        title: 'Hexanal / 正己醛',
        desc: 'Hexanal is an aldehyde with grassy, leafy odor. Used in fragrance and flavor industries for fresh green notes.',
        keywords: ['正己醛', 'Hexanal', '醛类', 'aldehyde'],
      },
      {
        nameCn: '降龙涎香醚', nameEn: 'Ambroxide',
        title: 'Ambroxide / 降龙涎香醚',
        desc: 'Ambroxide is a synthetic ambergris substitute with warm, ambery, woody fragrance. Extremely long-lasting.',
        keywords: ['降龙涎香醚', 'Ambroxide', '琥珀香', 'ambergris'],
      },
      {
        nameCn: '龙涎酮', nameEn: 'Iso E Super',
        title: 'Iso E Super / 龙涎酮',
        desc: 'Iso E Super is a synthetic fragrance ingredient with exotic, woody, amber scent. Exceptional longevity.',
        keywords: ['龙涎酮', 'Iso E Super', '合成香料', 'synthetic fragrance'],
      },
    ]

    const createdProducts = []
    for (const p of products) {
      // Find images
      const productDir = path.join(PRODUCT_IMAGES_BASE, p.nameCn)
      let imagePaths = []
      if (fs.existsSync(productDir)) {
        const files = fs.readdirSync(productDir).filter(f =>
          /\.(jpg|jpeg|png|webp)$/i.test(f)
        )
        imagePaths = files.map(f => path.join(productDir, f))
      }

      const mainImage = imagePaths[0] || ''
      const images = imagePaths.length > 0 ? imagePaths : []

      const product = await prisma.product.create({
        data: {
          title: p.title,
          titleEn: p.nameEn,
          description: p.desc,
          descriptionCn: p.desc,
          categoryId: category.id,
          sellerId: seller.id,
          boothId: booth.id,
          images,
          mainImageUrl: mainImage,
          minOrderQty: 100,
          minOrderUnitId: unit.id,
          supplyCapacity: '10000',
          supplyCapacityUnitId: unit.id,
          specifications: {
            chineseName: p.nameCn,
            englishName: p.nameEn,
            purity: '99%+',
            packaging: '25KG drum / 180KG drum',
            storage: 'Cool, dry place',
            application: 'Fragrance & Flavor Industry',
          },
          isActive: true,
          acceptsOEM: true,
          keywords: p.keywords,
          titles: {
            zh: `${p.nameCn} - 高纯有机化学品`,
            en: `${p.nameEn} - High Purity Organic Chemical`,
          },
          descriptions: {
            zh: `${p.nameCn}，有机化学品，纯度99%以上，MOQ 100KG，月产量1万吨。`,
            en: `${p.nameEn}, organic chemical, purity 99%+, MOQ 100KG, monthly production 10,000 tons.`,
          },
        },
      })
      console.log(`  ✅ ${p.nameCn} (${p.nameEn}) -> ${product.id}`)
      createdProducts.push(product)
    }

    console.log(`\n🎉 ${createdProducts.length} products created!`)

    // ─── Summary ───
    console.log('\n═══════════════════════════════')
    console.log('SETUP COMPLETE')
    console.log('═══════════════════════════════')
    console.log(`Store slug: ${storeSlug}`)
    console.log(`Store URL: https://x2xhub.com/${storeSlug}`)
    console.log(`Seller ID: ${seller.id}`)
    console.log(`Booth ID: ${booth.id}`)
    console.log(`Category: ${category.name}`)
    console.log(`Products: ${createdProducts.length}`)
    console.log('')

    // Clear Redis caches via cache-clearing script
    const { execSync } = require('child_process')
    try {
      execSync('bash /home/sardenesy/projects/chinahuib2b/scripts/clear-image-caches.sh 2>/dev/null', { timeout: 10000 })
      console.log('Caches cleared.')
    } catch (e) {
      console.log('Cache clear script not available, skipping.')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
