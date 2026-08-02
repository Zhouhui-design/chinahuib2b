// Multi-language translations for SeaHeart Global
export type Language = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ar' | 'pt' | 'ru' | 'ja' | 'ko' | 'hi' | 'th' | 'vi'

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
      partnerRecruitment: string
    }
    partnerRecruitment: {
      title: string
      subtitle: string
      globalRecruitment: string
      partnerTypesTitle: string
      individual: string
      individualDesc: string
      company: string
      companyDesc: string
      investor: string
      investorDesc: string
      government: string
      governmentDesc: string
      partnershipMethodsTitle: string
      capitalPartnership: string
      capitalPartnershipDesc: string
      capitalBenefit1: string
      capitalBenefit2: string
      capitalBenefit3: string
      operationPartnership: string
      operationPartnershipDesc: string
      operationBenefit1: string
      operationBenefit2: string
      operationBenefit3: string
      contactTitle: string
      phoneLabel: string
      emailLabel: string
      contactNote: string
      businessPlansTitle: string
      businessPlansDesc: string
      moreLanguagesTitle: string
      moreLanguagesDesc: string
      backToHome: string
    }
    investment: {
      title: string
      subtitle: string
      contactTitle: string
      phoneLabel: string
      emailLabel: string
      downloadTitle: string
      downloadSubtitle: string
      chineseBusinessPlan: string
      englishBusinessPlan: string
      englishPitchDeck: string
      chinesePitchDeck: string
      roadshow5Pages: string
      moreLanguagesTitle: string
      moreLanguagesDesc: string
      backToMarketplace: string
    }
    marketplace: {
      postTaskPage: {
        backToMarketplace: string
        title: string
        subtitle: string
        taskTitle: string
        taskTitlePlaceholder: string
        taskType: string
        manufacturing: string
        productSale: string
        service: string
        description: string
        aiGenerate: string
        generating: string
        descriptionPlaceholder: string
        descriptionMinChars: string
        budget: string
        budgetPlaceholder: string
        unitPrice: string
        unitPricePlaceholder: string
        currency: string
        unit: string
        unitPlaceholder: string
        minOrderQty: string
        minOrderQtyPlaceholder: string
        deadline: string
        contactInfo: string
        contactInfoPlaceholder: string
        contactInfoNote: string
        attachments: string
        uploadImages: string
        uploadFiles: string
        uploadDrawings: string
        uploadCompressed: string
        imagesPlaceholder: string
        filesPlaceholder: string
        drawingsPlaceholder: string
        compressedPlaceholder: string
        supportedImageTypes: string
        supportedFileTypes: string
        supportedDrawingTypes: string
        supportedCompressedTypes: string
        maxFileSize: string
        uploadSuccess: string
        removeAttachment: string
        postTaskBtn: string
        posting: string
        cancel: string
        tipsTitle: string
        tip1: string
        tip2: string
        tip3: string
        tip4: string
        tip5: string
        titleRequired: string
        descriptionRequired: string
        descriptionMinLength: string
        budgetMustBeNumber: string
        priceMustBeNumber: string
        minOrderMustBeNumber: string
        enterTitleFirst: string
        taskPostedSuccess: string
        failedToPost: string
        networkError: string
      }
    }
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
      partnerRecruitment: 'Partner Recruitment',
      backToHome: '← Back to Home',
    },
    partnerRecruitment: {
      title: 'Join Us as a Partner',
      subtitle: 'Build the Future of Global Cross-Border Trade Together',
      globalRecruitment: 'Global Recruitment - No Geographic Restrictions',
      partnerTypesTitle: 'Who Can Join?',
      individual: 'Individuals',
      individualDesc: 'Entrepreneurs, freelancers, and professionals with expertise',
      company: 'Companies',
      companyDesc: 'Businesses looking for strategic partnerships',
      investor: 'Investors',
      investorDesc: 'Investment institutions seeking high-growth opportunities',
      government: 'Government',
      governmentDesc: 'Government agencies promoting trade and economic development',
      partnershipMethodsTitle: 'Partnership Methods',
      capitalPartnership: 'Capital Partnership',
      capitalPartnershipDesc: 'Invest capital to become a shareholder and share profits',
      capitalBenefit1: 'Equity ownership in the platform',
      capitalBenefit2: 'Priority access to new features and markets',
      capitalBenefit3: 'Regular dividends and profit sharing',
      operationPartnership: 'Operation Partnership',
      operationPartnershipDesc: 'Contribute expertise and skills to manage specific operations',
      operationBenefit1: 'Revenue share based on performance',
      operationBenefit2: 'Professional development and training',
      operationBenefit3: 'Flexible working arrangements',
      contactTitle: 'Contact Us',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      contactNote: 'Reach out to us anytime to discuss partnership opportunities. We respond within 24 hours.',
      businessPlansTitle: 'Download Business Plans',
      businessPlansDesc: 'Get detailed information about our platform, business model, and growth strategy',
      moreLanguagesTitle: '30 Languages Available',
      moreLanguagesDesc: 'Business plans are available in 30 major languages for global accessibility',
      backToHome: '← Back to Home',
    },
    investment: {
      title: 'Welcome to Invest',
      subtitle: 'Download our business plans and explore investment opportunities',
      contactTitle: 'Contact Us',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      downloadTitle: 'Download Business Plans',
      downloadSubtitle: 'Get detailed information about our platform, business model, and growth strategy',
      chineseBusinessPlan: 'Business Plan (Chinese)',
      englishBusinessPlan: 'Business Plan (English)',
      englishPitchDeck: 'Pitch Deck (English)',
      chinesePitchDeck: 'Pitch Deck (Chinese)',
      roadshow5Pages: 'Roadshow 5 Pages',
      moreLanguagesTitle: '30 Languages Available',
      moreLanguagesDesc: 'Business plans are available in 30 major languages for global accessibility',
      backToMarketplace: 'Back to Marketplace',
    },
    marketplace: {
      postTaskPage: {
        backToMarketplace: '← Back to Marketplace',
        title: 'Post a New Task',
        subtitle: 'Describe what you need and connect with qualified suppliers, sellers, or service providers.',
        taskTitle: 'Task Title *',
        taskTitlePlaceholder: 'e.g., Looking for Factory to Produce Wireless Earbuds',
        taskType: 'Task Type *',
        manufacturing: '🏭 Manufacturing - Looking for factory/manufacturer',
        productSale: '🛍️ Product Sale - Selling products',
        service: '🔧 Service - Offering services',
        description: 'Description *',
        aiGenerate: '✨ AI Generate',
        generating: '✨ Generating...',
        descriptionPlaceholder: 'Describe your requirements. If not needed, enter: None / N/A',
        descriptionMinChars: 'Minimum 1 character. If not needed, enter: None / N/A',
        budget: 'Budget (Optional)',
        budgetPlaceholder: 'Total budget',
        unitPrice: 'Unit Price (Optional)',
        unitPricePlaceholder: 'Price per unit',
        currency: 'Currency',
        unit: 'Unit (Optional)',
        unitPlaceholder: 'e.g., per unit, per hour, per piece',
        minOrderQty: 'Min Order Quantity (Optional)',
        minOrderQtyPlaceholder: 'Minimum quantity',
        deadline: 'Deadline (Optional)',
        contactInfo: 'Contact Information (Optional)',
        contactInfoPlaceholder: 'Email, phone, or other contact details',
        contactInfoNote: 'This will be visible to applicants. Leave blank to use your profile contact info.',
        attachments: 'Attachments',
        uploadImages: '🖼️ Upload Images',
        uploadFiles: '📄 Upload Files',
        uploadDrawings: '📐 Upload Drawings',
        uploadCompressed: '📦 Upload Compressed',
        imagesPlaceholder: 'Click to upload images (JPG, PNG, WebP)',
        filesPlaceholder: 'Click to upload documents (PDF, DOC, DOCX)',
        drawingsPlaceholder: 'Click to upload CAD drawings (DWG, DXF)',
        compressedPlaceholder: 'Click to upload compressed files (ZIP, RAR)',
        supportedImageTypes: 'JPG, PNG, WebP',
        supportedFileTypes: 'PDF, DOC, DOCX',
        supportedDrawingTypes: 'DWG, DXF',
        supportedCompressedTypes: 'ZIP, RAR',
        maxFileSize: 'Max 20MB per file',
        uploadSuccess: 'File uploaded successfully!',
        removeAttachment: 'Remove',
        postTaskBtn: 'Post Task',
        posting: 'Posting...',
        cancel: 'Cancel',
        tipsTitle: '💡 Tips for Posting Tasks',
        tip1: 'Be specific about your requirements to attract qualified applicants',
        tip2: 'Include realistic budgets to set clear expectations',
        tip3: 'Provide detailed descriptions to reduce back-and-forth communication',
        tip4: 'Set reasonable deadlines to ensure quality work',
        tip5: 'Use AI Generate to get a professional description template',
        titleRequired: 'Title is required',
        descriptionRequired: 'Description is required',
        descriptionMinLength: 'Description must be at least 50 characters',
        budgetMustBeNumber: 'Budget must be a number',
        priceMustBeNumber: 'Price must be a number',
        minOrderMustBeNumber: 'Min order quantity must be a number',
        enterTitleFirst: 'Please enter a title first',
        taskPostedSuccess: 'Task posted successfully!',
        failedToPost: 'Failed to post task',
        networkError: 'Network error. Please try again.',
      }
    },
    home: {
      title: 'SeaHeart Global',
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
    form: {
      username: 'Username',
      email: 'Email',
      password: 'Password',
      submitting: 'Submitting...',
      copied: 'Copied!',
    },
    errors: {
      registerFailed: 'Registration failed, please try again',
      networkError: 'Network error, please try again',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      accountType: 'Account Type',
      buyer: 'Buyer (Browse Products)',
      seller: 'Seller (Open Store)',
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
      partnerRecruitment: '招募合伙人',
      backToHome: '← 返回首页',
    },
    partnerRecruitment: {
      title: '招募合伙人',
      subtitle: '共建全球跨境贸易的未来',
      globalRecruitment: '全球招募 - 不限地区',
      partnerTypesTitle: '招募对象',
      individual: '个人',
      individualDesc: '创业者、自由职业者和专业人士',
      company: '公司',
      companyDesc: '寻求战略合作伙伴的企业',
      investor: '投资机构',
      investorDesc: '寻求高增长机会的投资机构',
      government: '政府',
      governmentDesc: '促进贸易和经济发展的政府机构',
      partnershipMethodsTitle: '合伙方式',
      capitalPartnership: '资金合伙',
      capitalPartnershipDesc: '投资资金成为股东，共享利润',
      capitalBenefit1: '平台股权所有权',
      capitalBenefit2: '优先使用新功能和市场',
      capitalBenefit3: '定期分红和利润分享',
      operationPartnership: '运营合伙',
      operationPartnershipDesc: '贡献专业技能，负责平台特定运营',
      operationBenefit1: '基于绩效的收入分享',
      operationBenefit2: '专业发展和培训',
      operationBenefit3: '灵活的工作安排',
      contactTitle: '联系我们',
      phoneLabel: '电话',
      emailLabel: '邮箱',
      contactNote: '随时联系我们讨论合作机会。我们会在24小时内回复。',
      businessPlansTitle: '下载商业计划书',
      businessPlansDesc: '获取关于我们平台、商业模式和增长策略的详细信息',
      moreLanguagesTitle: '30种语言版本',
      moreLanguagesDesc: '商业计划书提供30种主要语言版本，方便全球访问',
      backToHome: '← 返回首页',
    },
    investment: {
      title: '欢迎投资',
      subtitle: '下载商业计划书，探索投资机会',
      contactTitle: '联系我们',
      phoneLabel: '电话',
      emailLabel: '邮箱',
      downloadTitle: '下载商业计划书',
      downloadSubtitle: '获取关于我们平台、商业模式和增长策略的详细信息',
      chineseBusinessPlan: '商业计划书（中文）',
      englishBusinessPlan: '商业计划书（英文）',
      englishPitchDeck: '路演稿（英文）',
      chinesePitchDeck: '路演稿（中文）',
      roadshow5Pages: '路演5页版',
      moreLanguagesTitle: '30种语言版本',
      moreLanguagesDesc: '商业计划书提供30种主要语言版本，方便全球访问',
      backToMarketplace: '返回市场',
    },
    marketplace: {
      postTaskPage: {
        backToMarketplace: '← 返回市场',
        title: '发布新任务',
        subtitle: '描述您的需求，与合格的供应商、卖家或服务提供商建立联系。',
        taskTitle: '任务标题 *',
        taskTitlePlaceholder: '例如：寻找工厂生产无线耳机',
        taskType: '任务类型 *',
        manufacturing: '🏭 制造 - 寻找工厂/制造商',
        productSale: '🛍️ 产品销售 - 销售产品',
        service: '🔧 服务 - 提供服务',
        description: '描述 *',
        aiGenerate: '✨ AI生成',
        generating: '✨ 正在生成...',
        descriptionPlaceholder: '描述您的需求。如果不需要填写，请输入：无 或 略',
        descriptionMinChars: '最少1个字符。如果不需要填写，请输入：无 或 略',
        budget: '预算（可选）',
        budgetPlaceholder: '总预算',
        unitPrice: '单价（可选）',
        unitPricePlaceholder: '每单位价格',
        currency: '货币',
        unit: '单位（可选）',
        unitPlaceholder: '例如：每件、每小时、每个',
        minOrderQty: '最小订购量（可选）',
        minOrderQtyPlaceholder: '最小数量',
        deadline: '截止日期（可选）',
        contactInfo: '联系信息（可选）',
        contactInfoPlaceholder: '邮箱、电话或其他联系方式',
        contactInfoNote: '此信息将对申请者可见。留空则使用您的个人资料联系信息。',
        attachments: '附件',
        uploadImages: '🖼️ 上传图片',
        uploadFiles: '📄 上传文件',
        uploadDrawings: '📐 上传图纸',
        uploadCompressed: '📦 上传压缩包',
        imagesPlaceholder: '点击上传图片（JPG, PNG, WebP）',
        filesPlaceholder: '点击上传文档（PDF, DOC, DOCX）',
        drawingsPlaceholder: '点击上传CAD图纸（DWG, DXF）',
        compressedPlaceholder: '点击上传压缩文件（ZIP, RAR）',
        supportedImageTypes: 'JPG, PNG, WebP',
        supportedFileTypes: 'PDF, DOC, DOCX',
        supportedDrawingTypes: 'DWG, DXF',
        supportedCompressedTypes: 'ZIP, RAR',
        maxFileSize: '单文件最大20MB',
        uploadSuccess: '文件上传成功！',
        removeAttachment: '删除',
        postTaskBtn: '发布任务',
        posting: '正在发布...',
        cancel: '取消',
        tipsTitle: '💡 发布任务提示',
        tip1: '具体描述您的需求以吸引合格的申请者',
        tip2: '包含合理的预算以设定明确的期望',
        tip3: '提供详细的描述以减少反复沟通',
        tip4: '设定合理的截止日期以确保工作质量',
        tip5: '使用AI生成获取专业的描述模板',
        titleRequired: '标题必填',
        descriptionRequired: '描述必填',
        descriptionMinLength: '描述至少需要50个字符',
        budgetMustBeNumber: '预算必须是数字',
        priceMustBeNumber: '价格必须是数字',
        minOrderMustBeNumber: '最小订购量必须是数字',
        enterTitleFirst: '请先输入标题',
        taskPostedSuccess: '任务发布成功！',
        failedToPost: '发布任务失败',
        networkError: '网络错误，请重试。',
      }
    },
    home: {
      title: '心海环球',
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
    form: {
      username: '用户名',
      email: '邮箱',
      password: '密码',
      submitting: '提交中...',
      copied: '已复制！',
    },
    errors: {
      registerFailed: '注册失败，请重试',
      networkError: '网络错误，请重试',
    },
    auth: {
      login: '登录',
      register: '注册',
      email: '邮箱',
      password: '密码',
      username: '用户名',
      accountType: '账户类型',
      buyer: '买家（浏览产品）',
      seller: '卖家（开设店铺）',
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
  ar: {
    aiRegister: {
      loggedInAs: 'مسجل الدخول sebagai',
      title: 'تسجيل هوية الذكاء الاصطناعي',
      subtitle: 'إنشاء حساب الذكاء الاصطناعي واستكشاف مستقبل تجارة B2B',
      feature1: 'التداول المدعوم بالذكاء الاصطناعي',
      feature2: 'التوفر على مدار الساعة',
      feature3: 'التفاوض الذكي',
      capabilities: 'قدرات الذكاء الاصطناعي',
      capability1: 'البحث الذكي عن المنتجات',
      capability1Desc: 'ابحث عن المنتجات بشكل أسرع مع البحث والتوصيات المدعومة بالذكاء الاصطناعي',
      capability2: 'التفاوض الآلي',
      capability2Desc: 'يمكن للذكاء الاصطناعي التفاوض بشأن الأسعار والشروط نيابةً عنك',
      capability3: 'تحليل السوق',
      capability3Desc: 'احصل على رؤى واتجاهات السوق في الوقت الفعلي',
      capability4: 'دعم متعدد اللغات',
      capability4Desc: 'تواصل عالميًا مع الترجمة المدمجة',
      termsNote: 'يجب تسجيل حسابات الذكاء الاصطناعي تحت حساب مالك بشري. بالتسجيل، أنت توافق على سياسات استخدام الذكاء الاصطناعي.',
      register: 'إنشاء حساب الذكاء الاصطناعي',
      registerDesc: 'سجل الذكاء الاصطناعي الخاص بك لبدء التداول',
      needLogin: 'يرجى تسجيل الدخول بحسابك البشري أولاً لتسجيل حساب الذكاء الاصطناعي.',
      bindingTo: 'سيتم ربط حساب الذكاء الاصطناعي هذا بـ:',
      selectRole: 'اختر دور الذكاء الاصطناعي',
      aiBuyer: 'مشتري الذكاء الاصطناعي',
      aiBuyerDesc: 'شراء المنتجات تلقائيًا',
      aiSeller: 'بائع الذكاء الاصطناعي',
      aiSellerDesc: 'بيع المنتجات تلقائيًا',
      usernamePlaceholder: 'أدخل اسم مستخدم الذكاء الاصطناعي',
      emailPlaceholder: 'أدخل عنوان بريد إلكتروني للذكاء الاصطناعي',
      passwordPlaceholder: 'أدخل كلمة مرور أو أنشئ واحدة',
      generatePassword: 'إنشاء كلمة مرور عشوائية',
      agreeTerms: 'أوافق على شروط خدمة الذكاء الاصطناعي وسياسة الخصوصية',
      createAccount: 'إنشاء حساب الذكاء الاصطناعي',
      copyCredentials: 'نسخ بيانات الاعتماد',
      haveAccount: 'لديك بالفعل حساب ذكاء اصطناعي؟',
      successTitle: 'تم إنشاء حساب الذكاء الاصطناعي بنجاح!',
      successMessage: 'تم إنشاء حساب الذكاء الاصطناعي الخاص بك وهو الآن جاهز للاستخدام.',
      saveCredentials: 'يرجى حفظ بيانات الاعتماد الخاصة بك:',
      footer: 'تخضع حسابات الذكاء الاصطناعي لشروطنا وأحكامنا المحددة للذكاء الاصطناعي.',
    },
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      exhibitors: 'العارضون',
      categories: 'الفئات',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      dashboard: 'لوحة التحكم',
      logout: 'تسجيل الخروج',
      partnerRecruitment: '招募合伙人',
    },
    partnerRecruitment: {
      title: '招募合伙人',
      subtitle: '共建全球跨境贸易的未来',
      globalRecruitment: '全球招募 - 不限地区',
      partnerTypesTitle: '招募对象',
      individual: '个人',
      individualDesc: '创业者、自由职业者和专业人士',
      company: '公司',
      companyDesc: '寻求战略合作伙伴的企业',
      investor: '投资机构',
      investorDesc: '寻求高增长机会的投资机构',
      government: '政府',
      governmentDesc: '促进贸易和经济发展的政府机构',
      partnershipMethodsTitle: '合伙方式',
      capitalPartnership: '资金合伙',
      capitalPartnershipDesc: '投资资金成为股东，共享利润',
      capitalBenefit1: '平台股权所有权',
      capitalBenefit2: '优先使用新功能和市场',
      capitalBenefit3: '定期分红和利润分享',
      operationPartnership: '运营合伙',
      operationPartnershipDesc: '贡献专业技能，负责平台特定运营',
      operationBenefit1: '基于绩效的收入分享',
      operationBenefit2: '专业发展和培训',
      operationBenefit3: '灵活的工作安排',
      contactTitle: '联系我们',
      phoneLabel: '电话',
      emailLabel: '邮箱',
      contactNote: '随时联系我们讨论合作机会。我们会在24小时内回复。',
      businessPlansTitle: '下载商业计划书',
      businessPlansDesc: '获取关于我们平台、商业模式和增长策略的详细信息',
      moreLanguagesTitle: '30种语言版本',
      moreLanguagesDesc: '商业计划书提供30种主要语言版本，方便全球访问',
      backToHome: '← 返回首页',
    },
    marketplace: {
      postTaskPage: {
        backToMarketplace: '← العودة إلى السوق',
        title: 'نشر مهمة جديدة',
        subtitle: 'صف ما تحتاجه وتواصل مع الموردين أو البائعين أو مقدمي الخدمات المؤهلين.',
        taskTitle: 'عنوان المهمة *',
        taskTitlePlaceholder: 'مثال: البحث عن مصنع لإنتاج سماعات الأذن اللاسلكية',
        taskType: 'نوع المهمة *',
        manufacturing: '🏭 تصنيع - البحث عن مصنع/مصنع',
        productSale: '🛍️ بيع المنتجات - بيع المنتجات',
        service: '🔧 خدمة - تقديم الخدمات',
        description: 'الوصف *',
        aiGenerate: '✨ توليد الذكاء الاصطناعي',
        generating: '✨ جاري التوليد...',
        descriptionPlaceholder: 'صف متطلباتك. إذا لم تكن нужным، أدخل: لا شيء / لا يوجد',
        descriptionMinChars: 'الحد الأدنى 1 حرف. إذا لم تكن нужным، أدخل: لا شيء / لا يوجد',
        budget: 'الميزانية (اختياري)',
        budgetPlaceholder: 'الميزانية الإجمالية',
        unitPrice: 'سعر الوحدة (اختياري)',
        unitPricePlaceholder: 'السعر لكل وحدة',
        currency: 'العملة',
        unit: 'الوحدة (اختياري)',
        unitPlaceholder: 'مثال: لكل وحدة، في الساعة، لكل قطعة',
        minOrderQty: 'الحد الأدنى للطلب (اختياري)',
        minOrderQtyPlaceholder: 'الحد الأدنى للكمية',
        deadline: 'الموعد النهائي (اختياري)',
        contactInfo: 'معلومات الاتصال (اختياري)',
        contactInfoPlaceholder: 'البريد الإلكتروني أو الهاتف أو تفاصيل الاتصال الأخرى',
        contactInfoNote: 'سيكون هذا مرئيًا للمتقدمين. اتركه فارغًا لاستخدام معلومات الاتصال في ملفك الشخصي.',
        attachments: 'المرفقات',
        uploadImages: '🖼️ رفع الصور',
        uploadFiles: '📄 رفع الملفات',
        uploadDrawings: '📐 رفع الرسمات',
        uploadCompressed: '📦 رفع الملفات المضغوطة',
        imagesPlaceholder: 'انقر لرفع الصور (JPG, PNG, WebP)',
        filesPlaceholder: 'انقر لرفع الوثائق (PDF, DOC, DOCX)',
        drawingsPlaceholder: 'انقر لرفع الرسمات الهندسية (DWG, DXF)',
        compressedPlaceholder: 'انقر لرفع الملفات المضغوطة (ZIP, RAR)',
        supportedImageTypes: 'JPG, PNG, WebP',
        supportedFileTypes: 'PDF, DOC, DOCX',
        supportedDrawingTypes: 'DWG, DXF',
        supportedCompressedTypes: 'ZIP, RAR',
        maxFileSize: 'حد أقصى 20 ميجابايت لكل ملف',
        uploadSuccess: 'تم رفع الملف بنجاح!',
        removeAttachment: 'حذف',
        postTaskBtn: 'نشر المهمة',
        posting: 'جاري النشر...',
        cancel: 'إلغاء',
        tipsTitle: '💡 نصائح لنشر المهام',
        tip1: 'كن محددًا في متطلباتك لجذب متقدمين مؤهلين',
        tip2: 'أدرج ميزانيات واقعية لتحديد توقعات واضحة',
        tip3: 'قدم أوصافًا تفصيلية لتقليل التواصل المتكرر',
        tip4: 'حدد مواعيد نهائية معقولة لضمان جودة العمل',
        tip5: 'استخدم توليد الذكاء الاصطناعي للحصول على قالب وصف احترافي',
        titleRequired: 'العنوان مطلوب',
        descriptionRequired: 'الوصف مطلوب',
        descriptionMinLength: 'يجب أن يكون الوصف 50 حرفًا على الأقل',
        budgetMustBeNumber: 'يجب أن تكون الميزانية رقمًا',
        priceMustBeNumber: 'يجب أن يكون السعر رقمًا',
        minOrderMustBeNumber: 'يجب أن تكون الكمية الدنيا للطلب رقمًا',
        enterTitleFirst: 'يرجى إدخال العنوان أولاً',
        taskPostedSuccess: 'تم نشر المهمة بنجاح!',
        failedToPost: 'فشل في نشر المهمة',
        networkError: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.',
      }
    },
    home: {
      title: 'القلب البحري العالمي',
      subtitle: 'بوابتك للتجارة العالمية بين الشركات',
      heroTitle: 'مرحبًا بك في قاعة المعرض العالمية',
      heroSubtitle: 'اكتشف منتجات عالية الجودة من مصنعين حول العالم',
      featuredExhibits: 'العروض المميزة',
      exhibitionZones: 'مناطق العرض',
      viewExhibit: 'عرض المنتج',
      browseAll: 'تصفح جميع المنتجات',
    },
    products: {
      title: 'عرض المنتجات',
      subtitle: 'تصفح العروض من المصنعين العالميين',
      filters: 'الفلاتر',
      category: 'الفئة',
      country: 'البلد',
      companyType: 'نوع الشركة',
      searchPlaceholder: 'البحث عن المنتجات أو العارضين...',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      popular: 'الأكثر شعبية',
      noProducts: 'لم يتم العثور على منتجات',
      viewDetails: 'عرض التفاصيل',
      specifications: 'المواصفات',
      minOrderQty: 'الحد الأدنى للطلب',
      supplyCapacity: 'قدرة التوريد',
      contactExhibitor: 'التواصل مع العارض',
      downloadBrochure: 'تحميل الكتيب',
      viewContactInfo: 'عرض معلومات الاتصال',
    },
    exhibitors: {
      title: 'قاعة العارضين',
      subtitle: 'تواصل مباشرة مع المصنعين والمصدرين المعتمدين',
      searchPlaceholder: 'البحث عن العارضين...',
      filters: 'الفلاتر',
      category: 'الفئة',
      country: 'البلد',
      companyType: 'نوع الشركة',
      noExhibitors: 'لم يتم العثور على عارضين',
      viewProfile: 'عرض الملف الشخصي',
      viewProducts: 'عرض المنتجات',
    },
    chatHall: {
      title: 'قاعة الدردشة العالمية',
      subtitle: 'تواصل مع المشترين والبائعين العالميين',
      onlineUsers: 'المستخدمون المتصلون',
      online: 'متصل',
      marketplace: 'السوق',
      auctions: 'المزادات',
      worldChat: 'الدردشة العالمية',
      quickPost: 'نشر سريع',
      publicChat: 'الدردشة العامة',
      posts: 'المنشورات',
      notices: 'الإعلانات',
      typePlaceholder: 'اكتب رسالتك...',
      send: 'إرسال',
    },
    auction: {
      title: 'قاعة المزادات',
      subtitle: 'اكتشف فرصًا استثنائية في مزاداتنا',
      currentBid: 'المزايدة الحالية',
      timeLeft: 'الوقت المتبقي',
      placeBid: 'Place Bid',
      viewDetails: 'عرض التفاصيل',
      noAuctions: 'لا توجد مزادات نشطة',
    },
    auth: {
      login: {
        title: 'تسجيل الدخول',
        email: 'البريد الإلكتروني أو اسم المستخدم',
        emailPlaceholder: 'أدخل بريدك الإلكتروني أو اسم المستخدم',
        password: 'كلمة المرور',
        passwordPlaceholder: 'أدخل كلمة المرور الخاصة بك',
        rememberMe: 'تذكرني',
        forgotPassword: 'نسيت كلمة المرور؟',
        loginButton: 'تسجيل الدخول',
        noAccount: 'ليس لديك حساب؟',
        register: 'سجل الآن',
        loginTitle: 'مرحبًا بك مرة أخرى',
        loginSubtitle: 'تسجيل الدخول للوصول إلى حسابك',
      },
      register: {
        title: 'إنشاء حساب جديد',
        username: 'اسم المستخدم',
        usernamePlaceholder: 'اختر اسم مستخدم فريد',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'أدخل بريدك الإلكتروني',
        password: 'كلمة المرور',
        passwordPlaceholder: 'أنشئ كلمة مرور قوية',
        confirmPassword: 'تأكيد كلمة المرور',
        confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
        agreeTerms: 'أوافق على الشروط والأحكام',
        registerButton: 'إنشاء حساب',
        haveAccount: 'لديك بالفعل حساب؟',
        login: 'تسجيل الدخول',
        registerTitle: 'انضم إلى شبكة المعرض العالمي',
        registerSubtitle: 'أنشئ حسابًا للوصول إلى الميزات الكاملة',
      },
      forgotPassword: {
        title: 'نسيت كلمة المرور',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'أدخل بريدك الإلكتروني المسجل',
        sendButton: 'إرسال رابط إعادة التعيين',
        backToLogin: 'العودة إلى تسجيل الدخول',
      },
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      search: 'بحث',
      filter: 'فلتر',
      sort: 'ترتيب',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال',
      back: 'رجوع',
      close: 'إغلاق',
      confirm: 'تأكيد',
      yes: 'نعم',
      no: 'لا',
      upload: 'رفع',
      download: 'تحميل',
    },
  },
  pt: {} as any,
  ru: {} as any,
  ja: {} as any,
  ko: {} as any,
  hi: {} as any,
  th: {} as any,
  vi: {} as any,
}

// Fill other languages with English as placeholder and apply custom home titles
const englishFallback = translations.en
const brandTitles: Record<Language, string> = {
  en: 'SeaHeart Global',
  zh: '心海环球',
  es: 'CorazónMar Global',
  fr: 'CœurMer Mondial',
  de: 'Meerherz Global',
  ar: 'القلب البحري العالمي',
  pt: 'CoraçãoMar Global',
  ru: 'МорскоеСердце Глобал',
  ja: '心海グローバル',
  ko: '심해글로벌',
  hi: 'समुद्र-हृदय ग्लोबल',
  th: 'หัวใจทะเลโลก',
  vi: 'TráiTimBiển ToànCầu',
}
;(['es', 'fr', 'de', 'pt', 'ru', 'ja', 'ko', 'hi', 'th', 'vi'] as Language[]).forEach(lang => {
  translations[lang] = JSON.parse(JSON.stringify(englishFallback))
  translations[lang].home.title = brandTitles[lang]
})
