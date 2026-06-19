// Multi-language translations for Global Expo Network
export type Language = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ar' | 'pt' | 'ru' | 'ja' | 'ko'

export interface Translations {
  // AI Register
  aiRegister: {
    loggedInAs: string
    title: string
    subtitle: string
    feature1: string
    feature2: string
    feature3: string
    capabilities: string
    capability1: string
    capability1Desc: string
    capability2: string
    capability2Desc: string
    capability3: string
    capability3Desc: string
    capability4: string
    capability4Desc: string
    termsNote: string
    register: string
    registerDesc: string
    needLogin: string
    bindingTo: string
    selectRole: string
    aiBuyer: string
    aiBuyerDesc: string
    aiSeller: string
    aiSellerDesc: string
    usernamePlaceholder: string
    emailPlaceholder: string
    passwordPlaceholder: string
    generatePassword: string
    agreeTerms: string
    createAccount: string
    copyCredentials: string
    haveAccount: string
    successTitle: string
    successMessage: string
    saveCredentials: string
    footer: string
  }
  
  // Navigation
  nav: {
    home: string
    products: string
    exhibitors: string
    categories: string
    login: string
    register: string
    dashboard: string
    logout: string
  }
  
  // Home Page
  home: {
    title: string
    subtitle: string
    heroTitle: string
    heroSubtitle: string
    featuredExhibits: string
    exhibitionZones: string
    viewExhibit: string
    browseAll: string
  }
  
  // Products
  products: {
    title: string
    subtitle: string
    filters: string
    category: string
    country: string
    companyType: string
    searchPlaceholder: string
    sortBy: string
    newest: string
    popular: string
    noProducts: string
    viewDetails: string
    specifications: string
    minOrderQty: string
    supplyCapacity: string
    contactExhibitor: string
    downloadBrochure: string
    viewContactInfo: string
    loginToViewContact: string
    relatedProducts: string
  }
  
  // Exhibitors/Stores
  exhibitors: {
    title: string
    companyName: string
    companyType: string
    location: string
    description: string
    certifications: string
    allProducts: string
    companyProfile: string
    downloadResources: string
    contactInfo: string
    phone: string
    email: string
    website: string
    visitStore: string
  }
  
  // Authentication
  auth: {
    login: string
    register: string
    email: string
    password: string
    username: string
    accountType: string
    buyer: string
    seller: string
    createAccount: string
    signIn: string
    signingIn: string
    creatingAccount: string
    alreadyHaveAccount: string
    dontHaveAccount: string
    accountActivityWarning: string
    registrationSuccess: string
    loginFailed: string
    registrationFailed: string
  }
  
  // Dashboard
  dashboard: {
    title: string
    overview: string
    myProducts: string
    addProduct: string
    editProduct: string
    inquiries: string
    storeSettings: string
    subscription: string
    analytics: string
    views: string
    downloads: string
  }
  
  // Common
  common: {
    loading: string
    error: string
    success: string
    save: string
    cancel: string
    delete: string
    edit: string
    upload: string
    download: string
    submit: string
    back: string
    next: string
    previous: string
    close: string
    confirm: string
    yes: string
    no: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    aiRegister: {
      loggedInAs: 'Logged in as',
      title: 'AI Identity Registration',
      subtitle: 'Create your AI account and explore the future of B2B commerce',
      feature1: 'AI-Powered Trading',
      feature2: '24/7 Availability',
      feature3: 'Smart Negotiation',
      capabilities: 'AI Capabilities',
      capability1: 'Intelligent Product Search',
      capability1Desc: 'Find products faster with AI-powered search and recommendations',
      capability2: 'Automated Negotiation',
      capability2Desc: 'AI can negotiate prices and terms on your behalf',
      capability3: 'Market Analysis',
      capability3Desc: 'Get real-time market insights and trends',
      capability4: 'Multi-language Support',
      capability4Desc: 'Communicate globally with built-in translation',
      termsNote: 'AI accounts must be registered under a human owner account. By registering, you agree to our AI usage policies.',
      register: 'Create AI Account',
      registerDesc: 'Register your AI to start trading',
      needLogin: 'Please log in with your human account first to register an AI account.',
      bindingTo: 'This AI account will be bound to:',
      selectRole: 'Select AI Role',
      aiBuyer: 'AI Buyer',
      aiBuyerDesc: 'Purchase products automatically',
      aiSeller: 'AI Seller',
      aiSellerDesc: 'Sell products automatically',
      usernamePlaceholder: 'Enter AI username',
      emailPlaceholder: 'Enter AI email address',
      passwordPlaceholder: 'Enter password or generate one',
      generatePassword: 'Generate Random Password',
      agreeTerms: 'I agree to the AI Terms of Service and Privacy Policy',
      createAccount: 'Create AI Account',
      copyCredentials: 'Copy Credentials',
      haveAccount: 'Already have an AI account?',
      successTitle: 'AI Account Created Successfully!',
      successMessage: 'Your AI account has been created and is now ready to use.',
      saveCredentials: 'Please save your credentials:',
      footer: 'AI accounts are subject to our AI-specific terms and conditions.',
    },
    nav: {
      home: 'Home',
      products: 'Products',
      exhibitors: 'Exhibitors',
      categories: 'Categories',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      logout: 'Logout',
    },
    home: {
      title: 'Global Expo Network',
      subtitle: 'Your Gateway to Global B2B Trade',
      heroTitle: 'Welcome to the Global Exhibition Hall',
      heroSubtitle: 'Discover quality products from manufacturers worldwide',
      featuredExhibits: 'Featured Exhibits',
      exhibitionZones: 'Exhibition Zones',
      viewExhibit: 'View Exhibit',
      browseAll: 'Browse All Products',
    },
    products: {
      title: 'Product Exhibition',
      subtitle: 'Browse exhibits from global manufacturers',
      filters: 'Filters',
      category: 'Category',
      country: 'Country',
      companyType: 'Company Type',
      searchPlaceholder: 'Search products or exhibitors...',
      sortBy: 'Sort By',
      newest: 'Newest',
      popular: 'Most Popular',
      noProducts: 'No products found',
      viewDetails: 'View Details',
      specifications: 'Specifications',
      minOrderQty: 'Min Order Quantity',
      supplyCapacity: 'Supply Capacity',
      contactExhibitor: 'Contact Exhibitor',
      downloadBrochure: 'Download Brochure',
      viewContactInfo: 'View Contact Info',
      loginToViewContact: 'Login to view contact information',
      relatedProducts: 'Related Products',
    },
    exhibitors: {
      title: 'Exhibitors',
      companyName: 'Company Name',
      companyType: 'Company Type',
      location: 'Location',
      description: 'Description',
      certifications: 'Certifications',
      allProducts: 'All Products',
      companyProfile: 'Company Profile',
      downloadResources: 'Download Resources',
      contactInfo: 'Contact Information',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      visitStore: 'Visit Store',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      accountType: 'Account Type',
      buyer: 'Buyer (Browse Products)',
      seller: 'Seller (Open Store - $10/month)',
      createAccount: 'Create Account',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      accountActivityWarning: '⚠️ Account Activity Policy: Accounts inactive for 365 days will be deactivated. Please log in regularly.',
      registrationSuccess: 'Registration successful! Please sign in.',
      loginFailed: 'Login failed',
      registrationFailed: 'Registration failed',
    },
    dashboard: {
      title: 'Seller Dashboard',
      overview: 'Overview',
      myProducts: 'My Products',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      inquiries: 'Inquiries',
      storeSettings: 'Store Settings',
      subscription: 'Subscription',
      analytics: 'Analytics',
      views: 'Views',
      downloads: 'Downloads',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      upload: 'Upload',
      download: 'Download',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
  },
  zh: {
    aiRegister: {
      loggedInAs: '已登录为',
      title: 'AI 身份注册',
      subtitle: '创建您的AI账号，探索B2B商务的未来',
      feature1: 'AI驱动交易',
      feature2: '7x24小时在线',
      feature3: '智能谈判',
      capabilities: 'AI能力',
      capability1: '智能产品搜索',
      capability1Desc: '通过AI驱动的搜索和推荐更快找到产品',
      capability2: '自动谈判',
      capability2Desc: 'AI可以代表您协商价格和条款',
      capability3: '市场分析',
      capability3Desc: '获取实时市场洞察和趋势',
      capability4: '多语言支持',
      capability4Desc: '通过内置翻译进行全球沟通',
      termsNote: 'AI账号必须注册在人类所有者账号下。注册即表示您同意我们的AI使用政策。',
      register: '创建AI账号',
      registerDesc: '注册您的AI开始交易',
      needLogin: '请先使用您的人类账号登录以注册AI账号。',
      bindingTo: '此AI账号将绑定到：',
      selectRole: '选择AI角色',
      aiBuyer: 'AI买家',
      aiBuyerDesc: '自动购买产品',
      aiSeller: 'AI卖家',
      aiSellerDesc: '自动销售产品',
      usernamePlaceholder: '输入AI用户名',
      emailPlaceholder: '输入AI邮箱地址',
      passwordPlaceholder: '输入密码或生成一个',
      generatePassword: '生成随机密码',
      agreeTerms: '我同意AI服务条款和隐私政策',
      createAccount: '创建AI账号',
      copyCredentials: '复制凭证',
      haveAccount: '已有AI账号？',
      successTitle: 'AI账号创建成功！',
      successMessage: '您的AI账号已创建，现在可以使用了。',
      saveCredentials: '请保存您的凭证：',
      footer: 'AI账号受我们AI特定条款和条件约束。',
    },
    nav: {
      home: '首页',
      products: '产品展厅',
      exhibitors: '参展商',
      categories: '分类',
      login: '登录',
      register: '注册',
      dashboard: '管理后台',
      logout: '退出',
    },
    home: {
      title: '全球商展网',
      subtitle: '您的全球B2B贸易门户',
      heroTitle: '欢迎来到全球展览大厅',
      heroSubtitle: '发现来自全球制造商的优质产品',
      featuredExhibits: '精选展品',
      exhibitionZones: '展览区域',
      viewExhibit: '查看展品',
      browseAll: '浏览所有产品',
    },
    products: {
      title: '产品展厅',
      subtitle: '浏览全球制造商的展品',
      filters: '筛选',
      category: '分类',
      country: '国家',
      companyType: '公司类型',
      searchPlaceholder: '搜索产品或参展商...',
      sortBy: '排序',
      newest: '最新',
      popular: '最热',
      noProducts: '未找到产品',
      viewDetails: '查看详情',
      specifications: '规格参数',
      minOrderQty: '最小起订量',
      supplyCapacity: '供货能力',
      contactExhibitor: '联系参展商',
      downloadBrochure: '下载手册',
      viewContactInfo: '查看联系方式',
      loginToViewContact: '登录后查看联系方式',
      relatedProducts: '相关产品',
    },
    exhibitors: {
      title: '参展商',
      companyName: '公司名称',
      companyType: '公司类型',
      location: '所在地',
      description: '公司简介',
      certifications: '认证',
      allProducts: '全部产品',
      companyProfile: '公司档案',
      downloadResources: '资料下载',
      contactInfo: '联系信息',
      phone: '电话',
      email: '邮箱',
      website: '网站',
      visitStore: '访问店铺',
    },
    auth: {
      login: '登录',
      register: '注册',
      email: '邮箱',
      password: '密码',
      username: '用户名',
      accountType: '账户类型',
      buyer: '买家（浏览产品）',
      seller: '卖家（开设店铺 - $10/月）',
      createAccount: '创建账户',
      signIn: '登录',
      signingIn: '登录中...',
      creatingAccount: '创建账户中...',
      alreadyHaveAccount: '已有账户？',
      dontHaveAccount: '还没有账户？',
      accountActivityWarning: '⚠️ 账户活跃政策：连续365天未登录的账户将被停用。请定期登录保持活跃。',
      registrationSuccess: '注册成功！请登录。',
      loginFailed: '登录失败',
      registrationFailed: '注册失败',
    },
    dashboard: {
      title: '卖家后台',
      overview: '概览',
      myProducts: '我的产品',
      addProduct: '添加产品',
      editProduct: '编辑产品',
      inquiries: '询盘',
      storeSettings: '店铺设置',
      subscription: '订阅',
      analytics: '数据分析',
      views: '浏览量',
      downloads: '下载量',
    },
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      upload: '上传',
      download: '下载',
      submit: '提交',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      confirm: '确认',
      yes: '是',
      no: '否',
    },
  },
  // For other languages, we'll use English as fallback initially
  // They can be populated later with proper translations
  es: {} as any,
  fr: {} as any,
  de: {} as any,
  ar: {} as any,
  pt: {} as any,
  ru: {} as any,
  ja: {} as any,
  ko: {} as any,
}

// Fill other languages with English as placeholder
const englishFallback = translations.en
;(['es', 'fr', 'de', 'ar', 'pt', 'ru', 'ja', 'ko'] as Language[]).forEach(lang => {
  translations[lang] = englishFallback
})
