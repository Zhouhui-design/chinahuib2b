import { prisma } from '../src/lib/db'

async function seedSEOConfigs() {
  console.log('🌱 Seeding SEO configurations...')

  const seoConfigs = [
    {
      pagePath: '/',
      title: 'X2XHub - 全球B2B贸易展会平台 | 连接世界商机',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: '连接全球买卖双方，发现优质产品和供应商。浏览数千种产品，联系认证商家，开启您的国际贸易之旅。支持多语言，覆盖13个国家和地区。',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade. Browse thousands of products across 13 languages and regions.',
      keywords: 'B2B贸易,国际贸易,产品展示,供应商,制造商,批发,跨境贸易,展会平台',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers,wholesale,cross-border trade,exhibition platform',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/en',
      title: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade. Browse thousands of products across 13 languages and regions.',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade. Browse thousands of products across 13 languages and regions.',
      keywords: 'B2B trade,international trade,products,suppliers,manufacturers,wholesale,cross-border trade,exhibition platform',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers,wholesale,cross-border trade,exhibition platform',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/products',
      title: '产品中心 - 浏览全球优质产品 | X2XHub',
      titleEn: 'Products - Browse Quality Products Worldwide | X2XHub',
      description: '浏览来自全球的优质产品，涵盖电子产品、机械设备、家居用品等多个品类。所有产品均由认证商家提供，品质保证。',
      descriptionEn: 'Browse quality products from around the world, covering electronics, machinery, home goods and more. All products are provided by verified sellers with quality assurance.',
      keywords: '产品目录,产品展示,B2B产品,批发商品,全球采购',
      keywordsEn: 'product catalog,product showcase,B2B products,wholesale goods,global sourcing',
      pageType: 'CATEGORY',
      isActive: true,
    },
    
    {
      pagePath: '/stores',
      title: '商家店铺 - 全球认证商家展厅 | X2XHub',
      titleEn: 'Stores - Verified Seller Showrooms | X2XHub',
      description: '探索全球认证商家的在线展厅，查看公司介绍、产品目录和联系方式。直接与制造商和供应商建立联系。',
      descriptionEn: 'Explore verified seller showrooms worldwide. View company profiles, product catalogs, and contact information. Connect directly with manufacturers and suppliers.',
      keywords: '商家店铺,供应商展厅,制造商,认证商家,B2B商家',
      keywordsEn: 'seller stores,supplier showrooms,manufacturers,verified sellers,B2B merchants',
      pageType: 'CATEGORY',
      isActive: true,
    },
    
    {
      pagePath: '/marketplace',
      title: '市场广场 - 全球B2B贸易社区 | X2XHub',
      titleEn: 'Marketplace - Global B2B Trading Community | X2XHub',
      description: 'X2XHub市场广场是全球买家和卖家的聚集地，发布产品、采购需求、行业话题和商业机会。',
      descriptionEn: 'X2XHub Marketplace is the gathering place for global buyers and sellers. Post products, sourcing needs, industry discussions and business opportunities.',
      keywords: 'B2B市场,贸易社区,行业讨论,商业机会,产品发布',
      keywordsEn: 'B2B marketplace,trading community,industry discussion,business opportunities,product posting',
      pageType: 'CATEGORY',
      isActive: true,
    },
    
    {
      pagePath: '/exhibitions',
      title: '展会中心 - 在线虚拟展会 | X2XHub',
      titleEn: 'Exhibitions - Virtual Trade Shows | X2XHub',
      description: '参与全球在线虚拟展会，与参展商实时沟通，查看产品演示，获取最新行业资讯。',
      descriptionEn: 'Participate in global virtual trade shows. Communicate with exhibitors in real-time, view product demonstrations, and get the latest industry news.',
      keywords: '虚拟展会,在线展会,B2B展会,贸易展览,展会直播',
      keywordsEn: 'virtual exhibition,online trade show,B2B exhibition,trade fair,live exhibition',
      pageType: 'CATEGORY',
      isActive: true,
    },
    
    {
      pagePath: '/about',
      title: '关于我们 - X2XHub全球B2B平台',
      titleEn: 'About Us - X2XHub Global B2B Platform',
      description: 'X2XHub是全球领先的B2B贸易展会平台，致力于连接世界各地的买家和卖家，促进国际贸易发展。',
      descriptionEn: 'X2XHub is a leading global B2B trade exhibition platform dedicated to connecting buyers and sellers worldwide, promoting international trade development.',
      keywords: '关于我们,公司介绍,B2B平台,国际贸易,企业信息',
      keywordsEn: 'about us,company profile,B2B platform,international trade,corporate information',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/contact',
      title: '联系我们 - X2XHub客服中心',
      titleEn: 'Contact Us - X2XHub Support Center',
      description: '有任何问题或建议？请随时联系我们的客服团队，我们将竭诚为您服务。',
      descriptionEn: 'Have any questions or suggestions? Contact our support team anytime. We are here to help.',
      keywords: '联系我们,客服中心,客户支持,反馈建议',
      keywordsEn: 'contact us,support center,customer support,feedback',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/investment',
      title: '投资合作 - X2XHub商业机会',
      titleEn: 'Investment - X2XHub Business Opportunities',
      description: '探索与X2XHub的投资合作机会，共同开拓全球B2B贸易市场。',
      descriptionEn: 'Explore investment and partnership opportunities with X2XHub. Together, expand the global B2B trade market.',
      keywords: '投资合作,商业机会,合作伙伴,战略投资',
      keywordsEn: 'investment,partnership,business opportunities,strategic investment',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/privacy',
      title: '隐私政策 - X2XHub',
      titleEn: 'Privacy Policy - X2XHub',
      description: '了解X2XHub如何保护您的个人信息和数据安全。',
      descriptionEn: 'Learn how X2XHub protects your personal information and data security.',
      keywords: '隐私政策,数据保护,个人信息,安全政策',
      keywordsEn: 'privacy policy,data protection,personal information,security policy',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/terms',
      title: '服务条款 - X2XHub',
      titleEn: 'Terms of Service - X2XHub',
      description: '阅读X2XHub的服务条款和使用规则。',
      descriptionEn: 'Read X2XHub terms of service and usage rules.',
      keywords: '服务条款,使用规则,用户协议',
      keywordsEn: 'terms of service,usage rules,user agreement',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/auth/login',
      title: '用户登录 - X2XHub B2B平台',
      titleEn: 'Login - X2XHub B2B Platform',
      description: '登录您的 X2XHub 账户，管理您的商店、产品和订单。享受完整的 B2B 贸易体验。',
      descriptionEn: 'Log in to your X2XHub account to manage your store, products, and orders. Enjoy the complete B2B trading experience.',
      keywords: '用户登录,账户管理,商家后台',
      keywordsEn: 'user login,account management,seller dashboard',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/auth/register',
      title: '免费注册 - 加入 X2XHub B2B平台',
      titleEn: 'Sign Up Free - Join X2XHub B2B Platform',
      description: '免费注册成为 X2XHub 会员，开设您的在线商店，展示产品，连接全球买家。立即开始您的国际贸易之旅！',
      descriptionEn: 'Sign up free to become a X2XHub member. Open your online store, showcase products, and connect with global buyers. Start your international trade journey today!',
      keywords: '免费注册,商家入驻,B2B平台注册,开设店铺',
      keywordsEn: 'free signup,seller registration,B2B platform sign up,open store',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/zh',
      title: 'X2XHub - 全球B2B贸易展会平台 | 连接世界商机',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: '连接全球买卖双方，发现优质产品和供应商。浏览数千种产品，联系认证商家，开启您的国际贸易之旅。',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.',
      keywords: 'B2B贸易,国际贸易,产品展示,供应商,制造商,批发',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/fr',
      title: 'X2XHub - Plateforme mondiale d\'expositions B2B | Connecter les opportunités mondiales',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: 'Connectez acheteurs et vendeurs du monde entier. Découvrez des produits de qualité et des fournisseurs vérifiés pour le commerce international.',
      descriptionEn: 'Connect buyers and sellers worldwide. Discover quality products and verified suppliers for international trade.',
      keywords: 'commerce B2B,commerce international,produits,fournisseurs,fabricants',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/de',
      title: 'X2XHub - Globale B2B-Messeplattform | Verbinden Sie globale Chancen',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: 'Verbinden Sie globale Käufer und Verkäufer. Entdecken Sie hochwertige Produkte und geprüfte Lieferanten für den internationalen Handel.',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.',
      keywords: 'B2B-Handel,Internationaler Handel,Produkte,Lieferanten,Hersteller',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/ja',
      title: 'X2XHub - グローバルB2B商取引展示プラットフォーム | 世界の機会をつなぐ',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: '世界中のバイヤーとセラーをつなぎます。品質の高い製品と国際貿易のための認証されたサプライヤーを発見してください。',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.',
      keywords: 'B2B取引,国際貿易,製品,サプライヤー,メーカー',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers',
      pageType: 'STATIC',
      isActive: true,
    },
    
    {
      pagePath: '/ko',
      title: 'X2XHub - 글로벌 B2B 무역 전시 플랫폼 | 글로벌 기회 연결',
      titleEn: 'X2XHub - Global B2B Trade Exhibition Platform | Connect Global Opportunities',
      description: '전 세계의 구매자와 판매자를 연결합니다. 국제 무역을 위한 고품질 제품과 검증된 공급자를 발견하세요.',
      descriptionEn: 'Connect global buyers and sellers. Discover quality products and verified suppliers for international trade.',
      keywords: 'B2B 무역,국제 무역,제품,공급자,제조업체',
      keywordsEn: 'B2B trade,international trade,products,suppliers,manufacturers',
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
  console.log('\n🌐 Access admin panel at: https://x2xhub.com/admin/seo')
}

seedSEOConfigs()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })