import { prisma } from '../src/lib/db'

async function seedSEOConfigs() {
  console.log('🌱 Seeding SEO configurations...')

  const seoConfigs = [
    // 首页 - 中文
    {
      pagePath: '/',
      title: 'Global Expo - 全球B2B贸易展会平台 | 连接世界商机',
      titleEn: 'Global Expo - B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: '连接全球买卖双方，发现优质产品和供应商。浏览数千种产品，联系认证商家，开启您的国际贸易之旅。支持多语言，覆盖13个国家和地区。',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade. Browse thousands of products across 13 languages and regions.',
      keywords: 'B2B贸易,国际贸易,产品展示,供应商,制造商,批发,跨境贸易,展会平台',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers,wholesale,cross-border trade,exhibition platform',
      pageType: 'STATIC',
      isActive: true,
    },
    
    // 首页 - 英文
    {
      pagePath: '/en',
      title: 'Global Expo - B2B Trade Exhibition Platform | Connect Global Opportunities',
      titleEn: 'Global Expo - B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade. Browse thousands of products across 13 languages and regions.',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade. Browse thousands of products across 13 languages and regions.',
      keywords: 'B2B trade,international trade,products,suppliers,manufacturers,wholesale,cross-border trade,exhibition platform',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers,wholesale,cross-border trade,exhibition platform',
      pageType: 'STATIC',
      isActive: true,
    },
    
    // 产品列表页
    {
      pagePath: '/products',
      title: '产品中心 - 浏览全球优质产品 | Global Expo',
      titleEn: 'Products - Browse Quality Products Worldwide | Global Expo',
      description: '浏览来自全球的优质产品，涵盖电子产品、机械设备、家居用品等多个品类。所有产品均由认证商家提供，品质保证。',
      descriptionEn: 'Browse quality products from around the world, covering electronics, machinery, home goods and more. All products are provided by verified sellers with quality assurance.',
      keywords: '产品目录,产品展示,B2B产品,批发商品,全球采购',
      keywordsEn: 'product catalog,product showcase,B2B products,wholesale goods,global sourcing',
      pageType: 'CATEGORY',
      isActive: true,
    },
    
    // 店铺列表页
    {
      pagePath: '/stores',
      title: '商家店铺 - 全球认证商家展厅 | Global Expo',
      titleEn: 'Stores - Verified Seller Showrooms | Global Expo',
      description: '探索全球认证商家的在线展厅，查看公司介绍、产品目录和联系方式。直接与制造商和供应商建立联系。',
      descriptionEn: 'Explore verified seller showrooms worldwide. View company profiles, product catalogs, and contact information. Connect directly with manufacturers and suppliers.',
      keywords: '商家店铺,供应商展厅,制造商,认证商家,B2B商家',
      keywordsEn: 'seller stores,supplier showrooms,manufacturers,verified sellers,B2B merchants',
      pageType: 'CATEGORY',
      isActive: true,
    },
    
    // 登录页面
    {
      pagePath: '/login',
      title: '用户登录 - Global Expo B2B平台',
      titleEn: 'Login - Global Expo B2B Platform',
      description: '登录您的 Global Expo 账户，管理您的商店、产品和订单。享受完整的 B2B 贸易体验。',
      descriptionEn: 'Log in to your Global Expo account to manage your store, products, and orders. Enjoy the complete B2B trading experience.',
      keywords: '用户登录,账户管理,商家后台',
      keywordsEn: 'user login,account management,seller dashboard',
      pageType: 'STATIC',
      isActive: true,
    },
    
    // 注册页面
    {
      pagePath: '/register',
      title: '免费注册 - 加入 Global Expo B2B平台',
      titleEn: 'Sign Up Free - Join Global Expo B2B Platform',
      description: '免费注册成为 Global Expo 会员，开设您的在线商店，展示产品，连接全球买家。立即开始您的国际贸易之旅！',
      descriptionEn: 'Sign up free to become a Global Expo member. Open your online store, showcase products, and connect with global buyers. Start your international trade journey today!',
      keywords: '免费注册,商家入驻,B2B平台注册,开设店铺',
      keywordsEn: 'free signup,seller registration,B2B platform sign up,open store',
      pageType: 'STATIC',
      isActive: true,
    },
  ]

  for (const config of seoConfigs) {
    try {
      await prisma.sEOConfig.upsert({
        where: { pagePath: config.pagePath },
        update: config,
        create: config,
      })
      console.log(`✅ Configured: ${config.pagePath}`)
    } catch (error) {
      console.error(`❌ Failed to configure ${config.pagePath}:`, error)
    }
  }

  console.log('\n✨ SEO configuration seeding completed!')
  console.log(`\n📊 Total configs: ${seoConfigs.length}`)
  console.log('\n🌐 Access admin panel at: https://chinahuib2b.top/admin/seo')
}

seedSEOConfigs()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
