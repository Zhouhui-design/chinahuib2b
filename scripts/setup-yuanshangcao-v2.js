/**
 * Setup script for 江西源上草香料有限公司 - with image upload via API
 * Run on production server: node scripts/setup-yuanshangcao-v2.js
 */

const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

// Use the same DATABASE_URL from .env.production
const databaseUrl = process.env.DATABASE_URL || 'postgresql://expo_dev:dev123@localhost:5432/global_expo_dev'
const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Image directories on the server
const SERVER_IMAGES_BASE = '/tmp/yuanshangcao_images'

// Map Chinese dir names (on disk) to product keys
const DIR_MAP = {
  'cuminal枯茗醛': '枯茗醛',
  '乳酸薄荷酯': '乳酸薄荷酯',
  '孟二醇': '孟二醇',
  '松油醇': '松油醇',
  '正己醛': '正己醛',
  '降龙涎香醚Ambroxide': '降龙涎香醚',
  '龙涎酮Iso': '龙涎酮',
}

// ─── Step 1: Upload images via API ───
// We need to use the upload API to convert images to webp and get public URLs
// Since we can't easily make authenticated API calls from this script,
// we'll use a workaround: copy images directly to public/uploads/products/
// and reference them via /uploads/products/ URL.

async function uploadImageDirectly(serverImagePath, productKey) {
  try {
    // Copy to the Next.js public directory (persists across builds since .next is separate)
    // Actually, public/uploads IS served as /uploads, but we need to put it in the right place
    // The app reads from process.cwd()/public/uploads which is /var/www/chinahuib2b/public/uploads
    
    const publicUploadDir = '/var/www/chinahuib2b/public/uploads/products'
    fs.mkdirSync(publicUploadDir, { recursive: true })
    
    // Generate unique name
    const ext = path.extname(serverImagePath) || '.jpg'
    const uniqueName = `yuanshangcao-${productKey}-${Date.now()}${ext}`
    const destPath = path.join(publicUploadDir, uniqueName)
    
    fs.copyFileSync(serverImagePath, destPath)
    
    const url = `/uploads/products/${uniqueName}`
    return url
  } catch (e) {
    console.error(`  Failed to upload ${serverImagePath}: ${e.message}`)
    return null
  }
}

async function uploadAllImages() {
  console.log('📤 Uploading product images...\n')
  const imageMap = {} // productKey -> [url, url, ...]
  
  for (const [dirName, productKey] of Object.entries(DIR_MAP)) {
    const dirPath = path.join(SERVER_IMAGES_BASE, dirName)
    if (!fs.existsSync(dirPath)) {
      console.log(`  ⚠️  Directory not found: ${dirPath}`)
      continue
    }
    
    const files = fs.readdirSync(dirPath).filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    )
    
    const urls = []
    for (const file of files) {
      const srcPath = path.join(dirPath, file)
      // Upload and convert
      const url = await uploadImageDirectly(srcPath, productKey)
      if (url) {
        urls.push(url)
        console.log(`  ✅ ${productKey}/${file} -> ${url}`)
      }
    }
    
    imageMap[productKey] = urls
  }
  
  console.log('')
  return imageMap
}

// ─── Main ───
async function main() {
  console.log('🏭 Setting up 江西源上草香料有限公司 (v2)...\n')

  try {
    // 1. Upload images first (so we have URLs for products)
    const imageMap = await uploadAllImages()
    
    // 2. Find AI user
    const aiUser = await prisma.user.findFirst({
      where: { username: '4_AI_Seller' },
    })
    if (!aiUser) {
      console.log('ERROR: AI user 4_AI_Seller not found.')
      process.exit(1)
    }
    console.log(`✅ AI User: ${aiUser.username} (ID: ${aiUser.id})`)

    // 3. Find/create category
    let category = await prisma.category.findFirst({
      where: { OR: [
        { name: { contains: '有机化学品' } },
        { nameEn: { contains: 'organic' } },
      ]},
    })
    if (!category) {
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
    }
    console.log(`✅ Category: ${category.name} (ID: ${category.id})`)

    // 4. Find/create KG unit
    let unit = await prisma.unit.findFirst({
      where: { OR: [{ name: 'KG' }, { nameEn: 'Kilogram' }, { symbol: 'kg' }] },
    })
    if (!unit) {
      unit = await prisma.unit.create({
        data: { name: 'KG', nameEn: 'Kilogram', symbol: 'kg' },
      })
    }
    console.log(`✅ Unit: ${unit.name} (ID: ${unit.id})`)

    // 5. Create seller profile
    let seller = await prisma.sellerProfile.findFirst({
      where: { userId: aiUser.id },
    })
    const randomSuffix = crypto.randomBytes(4).toString('hex')
    const storeSlug = `yuanshangcao-flavor-${randomSuffix}`

    if (seller) {
      seller = await prisma.sellerProfile.update({
        where: { id: seller.id },
        data: {
          companyName: '江西源上草香料有限公司',
          companyNameEn: 'Jiangxi Yuanshangcao Flavor Co., Ltd.',
          description: '江西源上草香料有限公司成立于2019年，坐落于江西省吉安市吉水县，是一家专业从事香精香料制造的微型企业。公司拥有经验丰富的技术团队，致力于为全球客户提供高品质的香精香料产品。',
          descriptionEn: 'Established in 2019, Jiangxi Yuanshangcao Flavor Co., Ltd. is a micro-enterprise specialized in fragrance and flavor manufacturing, located in Jishui County, Ji\'an City, Jiangxi Province.',
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
          profileStatus: 'APPROVED',
          isVerified: true,
          isActive: true,
          keywords: ['香精香料', '有机化学品', 'fragrance', 'flavor', 'organic chemicals'],
        },
      })
    } else {
      seller = await prisma.sellerProfile.create({
        data: {
          companyName: '江西源上草香料有限公司',
          companyNameEn: 'Jiangxi Yuanshangcao Flavor Co., Ltd.',
          description: '江西源上草香料有限公司成立于2019年，坐落于江西省吉安市吉水县，是一家专业从事香精香料制造的微型企业。',
          descriptionEn: 'Established in 2019, Jiangxi Yuanshangcao Flavor Co., Ltd. is a micro-enterprise specialized in fragrance and flavor manufacturing.',
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
          userId: aiUser.id,
          storeSlug,
          profileStatus: 'APPROVED',
          isVerified: true,
          isActive: true,
          keywords: ['香精香料', '有机化学品', 'fragrance', 'flavor', 'organic chemicals'],
        },
      })
    }
    console.log(`✅ Seller: ${seller.id} (slug: ${seller.storeSlug})`)

    // 6. Create booth
    const booth = await prisma.booth.create({
      data: {
        sellerId: seller.id,
        sellerUserId: seller.userId,
        exhibitionName: 'Chemical Raw Materials & Fine Chemicals Exhibition',
        exhibitionNameEn: '化工原料及精细化学品展览会',
        boothName: '源上草香料展厅',
        boothNameEn: 'Yuanshangcao Flavor Booth',
        isActive: true,
        categoryId: category.id,
        keywords: ['香精香料', '有机化学品', 'fragrance', 'flavor', 'organic chemicals', 'fine chemicals'],
        descriptions: {
          zh: '江西源上草香料有限公司 - 专业香精香料制造商',
          en: 'Jiangxi Yuanshangcao Flavor Co., Ltd. - Professional fragrance & flavor manufacturer',
        },
        titles: {
          zh: '江西源上草香料 - 专业香精香料制造商',
          en: 'Jiangxi Yuanshangcao Flavor',
        },
      },
    })
    console.log(`✅ Booth: ${booth.id}\n`)

    // 7. Create products with images
    const products = [
      {
        key: '枯茗醛',
        title: 'Cuminaldehyde / 枯茗醛',
        desc: 'Cuminaldehyde (4-isopropylbenzaldehyde) is an aromatic organic compound with a strong cumin odor. Used in fragrance and flavor industries, as well as in pharmaceutical synthesis.',
        keywords: ['枯茗醛', 'Cuminaldehyde', '有机化学品', 'fragrance'],
      },
      {
        key: '乳酸薄荷酯',
        title: 'Menthyl Lactate / 乳酸薄荷酯',
        desc: 'Menthyl lactate is a cooling agent derived from menthol and lactic acid. Provides long-lasting cooling sensation without harshness. Widely used in cosmetics and food products.',
        keywords: ['乳酸薄荷酯', 'Menthyl Lactate', 'cooling agent'],
      },
      {
        key: '孟二醇',
        title: 'Menthoglycol / 孟二醇',
        desc: 'Menthoglycol is a dihydro derivative of menthol with a fresh, minty odor. Used in fragrance compositions and as a cooling agent.',
        keywords: ['孟二醇', 'Menthoglycol', 'menthol derivative'],
      },
      {
        key: '松油醇',
        title: 'Terpineol / 松油醇',
        desc: 'Terpineol is a common terpene alcohol with a lilac-like fragrance. Widely used in perfumes, cosmetics, soaps, and as a flavor ingredient.',
        keywords: ['松油醇', 'Terpineol', 'terpene alcohol'],
      },
      {
        key: '正己醛',
        title: 'Hexanal / 正己醛',
        desc: 'Hexanal is an aldehyde with a grassy, leafy odor. Naturally occurring in many fruits and vegetables. Used in fragrance and flavor industries.',
        keywords: ['正己醛', 'Hexanal', 'aldehyde'],
      },
      {
        key: '降龙涎香醚',
        title: 'Ambroxide / 降龙涎香醚',
        desc: 'Ambroxide is a synthetic ambergris substitute with a warm, ambery, woody fragrance. Extremely long-lasting, used in high-end perfumes.',
        keywords: ['降龙涎香醚', 'Ambroxide', 'ambergris'],
      },
      {
        key: '龙涎酮',
        title: 'Iso E Super / 龙涎酮',
        desc: 'Iso E Super is a synthetic fragrance ingredient with an exotic, woody, amber scent. Known for exceptional longevity.',
        keywords: ['龙涎酮', 'Iso E Super', 'synthetic fragrance'],
      },
    ]

    const createdProducts = []
    for (const p of products) {
      const urls = imageMap[p.key] || []
      const mainImage = urls[0] || ''
      
      const product = await prisma.product.create({
        data: {
          title: p.title,
          titleEn: p.key === '枯茗醛' ? 'Cuminaldehyde' :
                   p.key === '乳酸薄荷酯' ? 'Menthyl Lactate' :
                   p.key === '孟二醇' ? 'Menthoglycol' :
                   p.key === '松油醇' ? 'Terpineol' :
                   p.key === '正己醛' ? 'Hexanal' :
                   p.key === '降龙涎香醚' ? 'Ambroxide' : 'Iso E Super',
          description: p.desc,
          categoryId: category.id,
          sellerId: seller.id,
          boothId: booth.id,
          images: urls,
          mainImageUrl: mainImage,
          minOrderQty: 100,
          minOrderUnitId: unit.id,
          supplyCapacity: '10000',
          supplyCapacityUnitId: unit.id,
          specifications: {
            chineseName: p.key,
            purity: '99%+',
            packaging: '25KG drum / 180KG drum',
            storage: 'Cool, dry place',
            application: 'Fragrance & Flavor Industry',
          },
          isActive: true,
          acceptsOEM: true,
          keywords: p.keywords,
          titles: {
            zh: `${p.key} - 高纯有机化学品`,
            en: `${p.key} - High Purity Organic Chemical`,
          },
          descriptions: {
            zh: `${p.key}，有机化学品，纯度99%以上，MOQ 100KG，月产量1万吨。`,
            en: `${p.key}, organic chemical, purity 99%+, MOQ 100KG, monthly production 10,000 tons.`,
          },
        },
      })
      console.log(`  ✅ ${p.key} -> ${product.id} (images: ${urls.length})`)
      createdProducts.push(product)
    }

    // 8. Set isOnline for the AI user
    await prisma.user.update({
      where: { id: aiUser.id },
      data: { isOnline: true, lastSeenAt: new Date(), lastLoginAt: new Date() },
    })

    // ─── Summary ───
    console.log('\n═════════════════════════════════════')
    console.log('SETUP COMPLETE')
    console.log('═════════════════════════════════════')
    console.log(`Store URL: https://x2xhub.com/${seller.storeSlug}`)
    console.log(`Seller ID: ${seller.id}`)
    console.log(`Booth ID: ${booth.id}`)
    console.log(`Products: ${createdProducts.length}`)
    console.log(`Total images uploaded: ${Object.values(imageMap).reduce((s, v) => s + v.length, 0)}`)

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
