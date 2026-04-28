import { LanguageCode } from '@/lib/languages';

export type Dictionary = {
  home: {
    hero: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      searchButton: string;
    };
    featured: {
      title: string;
      viewDetails: string;
      boothName: string;
      productCategory: string;
      customization: string;
      yes: string;
      no: string;
      enterBooth: string;
      productImage: string;
      sampleCategories: string;
    };
    why: {
      title: string;
      verified: {
        title: string;
        description: string;
      };
      competitive: {
        title: string;
        description: string;
      };
      global: {
        title: string;
        description: string;
      };
    };
    exhibitors: {
      title: string;
      viewAll: string;
    };
  };
  nav: {
    home: string;
    products: string;
    exhibitors: string;
    sellerPortal: string; // 商家后台入口
    login: string;
    register: string;
    dashboard: string;
    logout: string;
  };
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    noResults: string;
    contact: string;
    verified: string;
    viewAll: string;
    back: string;
    next: string;
    previous: string;
  };
  auth: {
    login: {
      title: string;
      email: string;
      password: string;
      submit: string;
      noAccount: string;
      registerLink: string;
    };
    register: {
      title: string;
      companyName: string;
      email: string;
      password: string;
      confirmPassword: string;
      submit: string;
      hasAccount: string;
      loginLink: string;
    };
  };
  seller: {
    dashboard: string;
    profile: string;
    products: string;
    addProduct: string;
    editProduct: string;
    brochures: string;
    settings: string;
    companyInfo: string;
    saveChanges: string;
  };
  product: {
    name: string;
    description: string;
    category: string;
    price: string;
    minOrder: string;
    images: string;
    specifications: string;
    addImage: string;
    submit: string;
  };
  stores: {
    title: string;
    subtitle: string;
    verified: string;
    products: string;
    noExhibitors: string;
    noExhibitorsDesc: string;
  };
  pagination: {
    previous: string;
    next: string;
  };
};

const dictionaries: Record<LanguageCode, Dictionary> = {
  en: {
    home: {
      hero: {
        title: "Global Expo Network",
        subtitle: "Your Gateway to B2B Trade Exhibitions",
        searchPlaceholder: "Search products, exhibitors...",
        searchButton: "Search",
      },
      featured: {
        title: "Exhibition Zones",
        viewDetails: "View Details",
        boothName: "Booth Name",
        productCategory: "Product Category",
        customization: "Customization",
        yes: "Yes",
        no: "No",
        enterBooth: "Enter Booth to View",
        productImage: "Product Image",
        sampleCategories: "Electronics, Home Appliances",
      },
      why: {
        title: "Why Choose Us",
        verified: {
          title: "Verified Suppliers",
          description: "All exhibitors are verified for quality and reliability",
        },
        competitive: {
          title: "Competitive Pricing",
          description: "Direct from manufacturers, no middlemen",
        },
        global: {
          title: "Global Reach",
          description: "Connect with buyers and sellers worldwide",
        },
      },
      exhibitors: {
        title: "Featured Exhibitors",
        viewAll: "View All Exhibitors",
      },
    },
    nav: {
      home: "Home",
      products: "Products",
      exhibitors: "Exhibitors",
      sellerPortal: "Seller Portal",
      login: "Login",
      register: "Register",
      dashboard: "Dashboard",
      logout: "Logout",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      noResults: "No results found",
      contact: "Contact",
      verified: "Verified",
      viewAll: "View All",
      back: "Back",
      next: "Next",
      previous: "Previous",
    },
    auth: {
      login: {
        title: "Sign In",
        email: "Email",
        password: "Password",
        submit: "Sign In",
        noAccount: "Don't have an account?",
        registerLink: "Sign Up",
      },
      register: {
        title: "Create Account",
        companyName: "Company Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        submit: "Create Account",
        hasAccount: "Already have an account?",
        loginLink: "Sign In",
      },
    },
    seller: {
      dashboard: "Dashboard",
      profile: "Profile",
      products: "Products",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      brochures: "Brochures",
      settings: "Settings",
      companyInfo: "Company Information",
      saveChanges: "Save Changes",
    },
    product: {
      name: "Product Name",
      description: "Description",
      category: "Category",
      price: "Price",
      minOrder: "Minimum Order",
      images: "Images",
      specifications: "Specifications",
      addImage: "Add Image",
      submit: "Submit",
    },
    stores: {
      title: "All Exhibitors",
      subtitle: "Browse all verified exhibitors and their products",
      verified: "Verified",
      products: "Products",
      noExhibitors: "No Exhibitors Found",
      noExhibitorsDesc: "There are no active exhibitors at the moment.",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
    },
  },
  zh: {
    home: {
      hero: {
        title: "全球展会网络",
        subtitle: "您的B2B贸易展会门户",
        searchPlaceholder: "搜索产品、参展商...",
        searchButton: "搜索",
      },
      featured: {
        title: "展区",
        viewDetails: "查看详情",
        boothName: "展位名称",
        productCategory: "产品类别",
        customization: "定制服务",
        yes: "是",
        no: "否",
        enterBooth: "进入展位查看",
        productImage: "产品图片",
        sampleCategories: "电子产品，家用电器",
      },
      why: {
        title: "为什么选择我们",
        verified: {
          title: "认证供应商",
          description: "所有参展商均经过质量和可靠性验证",
        },
        competitive: {
          title: "竞争价格",
          description: "直接从制造商采购，没有中间商",
        },
        global: {
          title: "全球覆盖",
          description: "与全球买家和卖家建立联系",
        },
      },
      exhibitors: {
        title: "精选参展商",
        viewAll: "查看所有参展商",
      },
    },
    nav: {
      home: "首页",
      products: "产品",
      exhibitors: "参展商",
      sellerPortal: "商家后台",
      login: "登录",
      register: "注册",
      dashboard: "仪表板",
      logout: "退出",
    },
    common: {
      loading: "加载中...",
      error: "错误",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      search: "搜索",
      noResults: "未找到结果",
      contact: "联系",
      verified: "已认证",
      viewAll: "查看全部",
      back: "返回",
      next: "下一页",
      previous: "上一页",
    },
    auth: {
      login: {
        title: "登录",
        email: "邮箱",
        password: "密码",
        submit: "登录",
        noAccount: "没有账户？",
        registerLink: "注册",
      },
      register: {
        title: "创建账户",
        companyName: "公司名称",
        email: "邮箱",
        password: "密码",
        confirmPassword: "确认密码",
        submit: "创建账户",
        hasAccount: "已有账户？",
        loginLink: "登录",
      },
    },
    seller: {
      dashboard: "仪表板",
      profile: "资料",
      products: "产品",
      addProduct: "添加产品",
      editProduct: "编辑产品",
      brochures: "手册",
      settings: "设置",
      companyInfo: "公司信息",
      saveChanges: "保存更改",
    },
    product: {
      name: "产品名称",
      description: "描述",
      category: "类别",
      price: "价格",
      minOrder: "最小订单量",
      images: "图片",
      specifications: "规格",
      addImage: "添加图片",
      submit: "提交",
    },
    stores: {
      title: "所有参展商",
      subtitle: "浏览所有已认证的参展商及其产品",
      verified: "已认证",
      products: "产品",
      noExhibitors: "未找到参展商",
      noExhibitorsDesc: "目前没有活跃的参展商。",
    },
    pagination: {
      previous: "上一页",
      next: "下一页",
    },
  },
  es: {
    home: {
      hero: {
        title: "Red Global de Exposiciones",
        subtitle: "Su puerta de entrada a las ferias comerciales B2B",
        searchPlaceholder: "Buscar productos, expositores...",
        searchButton: "Buscar",
      },
      featured: {
        title: "Zonas de Exposición",
        viewDetails: "Ver Detalles",
        boothName: "Nombre del Stand",
        productCategory: "Categoría de Producto",
        customization: "Personalización",
        yes: "Sí",
        no: "No",
        enterBooth: "Entrar al Stand para Ver",
        productImage: "Imagen del Producto",
        sampleCategories: "Electrónica, Electrodomésticos",
      },
      why: {
        title: "Por Qué Elegirnos",
        verified: {
          title: "Proveedores Verificados",
          description: "Todos los expositores están verificados por calidad y confiabilidad",
        },
        competitive: {
          title: "Precios Competitivos",
          description: "Directo de fabricantes, sin intermediarios",
        },
        global: {
          title: "Alcance Global",
          description: "Conecte con compradores y vendedores en todo el mundo",
        },
      },
      exhibitors: {
        title: "Expositores Destacados",
        viewAll: "Ver Todos los Expositores",
      },
    },
    nav: {
      home: "Inicio",
      products: "Productos",
      exhibitors: "Expositores",
      login: "Iniciar Sesión",
      register: "Registrarse",
      dashboard: "Panel",
      logout: "Cerrar Sesión",
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      search: "Buscar",
      noResults: "No se encontraron resultados",
      contact: "Contacto",
      verified: "Verificado",
      viewAll: "Ver Todo",
      back: "Volver",
      next: "Siguiente",
      previous: "Anterior",
    },
    auth: {
      login: {
        title: "Iniciar Sesión",
        email: "Correo",
        password: "Contraseña",
        submit: "Iniciar Sesión",
        noAccount: "¿No tienes cuenta?",
        registerLink: "Regístrate",
      },
      register: {
        title: "Crear Cuenta",
        companyName: "Nombre de la Empresa",
        email: "Correo",
        password: "Contraseña",
        confirmPassword: "Confirmar Contraseña",
        submit: "Crear Cuenta",
        hasAccount: "¿Ya tienes cuenta?",
        loginLink: "Iniciar Sesión",
      },
    },
    seller: {
      dashboard: "Panel",
      profile: "Perfil",
      products: "Productos",
      addProduct: "Agregar Producto",
      editProduct: "Editar Producto",
      brochures: "Folletos",
      settings: "Configuración",
      companyInfo: "Información de la Empresa",
      saveChanges: "Guardar Cambios",
    },
    product: {
      name: "Nombre del Producto",
      description: "Descripción",
      category: "Categoría",
      price: "Precio",
      minOrder: "Pedido Mínimo",
      images: "Imágenes",
      specifications: "Especificaciones",
      addImage: "Agregar Imagen",
      submit: "Enviar",
    },
    stores: {
      title: "Todos los Expositores",
      subtitle: "Explore todos los expositores verificados y sus productos",
      verified: "Verificado",
      products: "Productos",
      noExhibitors: "No se Encontraron Expositores",
      noExhibitorsDesc: "No hay expositores activos en este momento.",
    },
    pagination: {
      previous: "Anterior",
      next: "Siguiente",
    },
  },
  // Add more languages as needed
  fr: {
    home: {
      hero: {
        title: "Réseau Mondial d'Expositions",
        subtitle: "Votre passerelle vers les salons professionnels B2B",
        searchPlaceholder: "Rechercher produits, exposants...",
        searchButton: "Rechercher",
      },
      featured: { 
        title: "Zones d'Exposition", 
        viewDetails: "Voir Détails",
        boothName: "Nom du Stand",
        productCategory: "Catégorie de Produit",
        customization: "Personnalisation",
        yes: "Oui",
        no: "Non",
        enterBooth: "Entrer dans le Stand pour Voir",
        productImage: "Image du Produit",
        sampleCategories: "Électronique, Appareils Ménagers",
      },
      why: {
        title: "Pourquoi Nous Choisir",
        verified: { title: "Fournisseurs Vérifiés", description: "Tous les exposants sont vérifiés" },
        competitive: { title: "Prix Compétitifs", description: "Direct des fabricants" },
        global: { title: "Portée Mondiale", description: "Connectez-vous avec acheteurs et vendeurs" },
      },
      exhibitors: { title: "Exposants en Vedette", viewAll: "Voir Tous les Exposants" },
    },
    nav: { home: "Accueil", products: "Produits", exhibitors: "Exposants", sellerPortal: "Portail Vendeur", login: "Connexion", register: "Inscription", dashboard: "Tableau de Bord", logout: "Déconnexion" },
    common: { loading: "Chargement...", error: "Erreur", save: "Sauvegarder", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", search: "Rechercher", noResults: "Aucun résultat", contact: "Contact", verified: "Vérifié", viewAll: "Voir Tout", back: "Retour", next: "Suivant", previous: "Précédent" },
    auth: {
      login: { title: "Connexion", email: "Email", password: "Mot de passe", submit: "Connexion", noAccount: "Pas de compte?", registerLink: "S'inscrire" },
      register: { title: "Créer un Compte", companyName: "Nom de l'Entreprise", email: "Email", password: "Mot de passe", confirmPassword: "Confirmer", submit: "Créer", hasAccount: "Déjà un compte?", loginLink: "Connexion" },
    },
    seller: { dashboard: "Tableau de Bord", profile: "Profil", products: "Produits", addProduct: "Ajouter Produit", editProduct: "Modifier Produit", brochures: "Brochures", settings: "Paramètres", companyInfo: "Infos Entreprise", saveChanges: "Sauvegarder" },
    product: { name: "Nom du Produit", description: "Description", category: "Catégorie", price: "Prix", minOrder: "Commande Min", images: "Images", specifications: "Spécifications", addImage: "Ajouter Image", submit: "Soumettre" },
    stores: { title: "Tous les Exposants", subtitle: "Parcourez tous les exposants vérifiés et leurs produits", verified: "Vérifié", products: "Produits", noExhibitors: "Aucun Exposant Trouvé", noExhibitorsDesc: "Il n'y a pas d'exposants actifs pour le moment." },
    pagination: { previous: "Précédent", next: "Suivant" },
  },
  de: {
    home: {
      hero: { title: "Globales Messenetzwerk", subtitle: "Ihr Tor zu B2B-Handelsmessen", searchPlaceholder: "Produkte, Aussteller suchen...", searchButton: "Suchen" },
      featured: { 
        title: "Ausstellungszonen", 
        viewDetails: "Details Ansehen",
        boothName: "Standname",
        productCategory: "Produktkategorie",
        customization: "Anpassung",
        yes: "Ja",
        no: "Nein",
        enterBooth: "Stand Betreten zum Ansehen",
        productImage: "Produktbild",
        sampleCategories: "Elektronik, Haushaltsgeräte",
      },
      why: {
        title: "Warum Uns Wählen",
        verified: { title: "Verifizierte Anbieter", description: "Alle Aussteller sind verifiziert" },
        competitive: { title: "Wettbewerbsfähige Preise", description: "Direkt vom Hersteller" },
        global: { title: "Globale Reichweite", description: "Verbinden Sie sich weltweit" },
      },
      exhibitors: { title: "Empfohlene Aussteller", viewAll: "Alle Aussteller Ansehen" },
    },
    nav: { home: "Startseite", products: "Produkte", exhibitors: "Aussteller", sellerPortal: "Verkäuferportal", login: "Anmelden", register: "Registrieren", dashboard: "Dashboard", logout: "Abmelden" },
    common: { loading: "Laden...", error: "Fehler", save: "Speichern", cancel: "Abbrechen", delete: "Löschen", edit: "Bearbeiten", search: "Suchen", noResults: "Keine Ergebnisse", contact: "Kontakt", verified: "Verifiziert", viewAll: "Alle Ansehen", back: "Zurück", next: "Weiter", previous: "Zurück" },
    auth: {
      login: { title: "Anmelden", email: "E-Mail", password: "Passwort", submit: "Anmelden", noAccount: "Kein Konto?", registerLink: "Registrieren" },
      register: { title: "Konto Erstellen", companyName: "Firmenname", email: "E-Mail", password: "Passwort", confirmPassword: "Bestätigen", submit: "Erstellen", hasAccount: "Bereits ein Konto?", loginLink: "Anmelden" },
    },
    seller: { dashboard: "Dashboard", profile: "Profil", products: "Produkte", addProduct: "Produkt Hinzufügen", editProduct: "Produkt Bearbeiten", brochures: "Broschüren", settings: "Einstellungen", companyInfo: "Firmeninfo", saveChanges: "Änderungen Speichern" },
    product: { name: "Produktname", description: "Beschreibung", category: "Kategorie", price: "Preis", minOrder: "Mindestbestellung", images: "Bilder", specifications: "Spezifikationen", addImage: "Bild Hinzufügen", submit: "Absenden" },
    stores: { title: "Alle Aussteller", subtitle: "Durchsuchen Sie alle verifizierten Aussteller und ihre Produkte", verified: "Verifiziert", products: "Produkte", noExhibitors: "Keine Aussteller Gefunden", noExhibitorsDesc: "Derzeit gibt es keine aktiven Aussteller." },
    pagination: { previous: "Zurück", next: "Weiter" },
  },
  ja: {
    home: {
      hero: { title: "グローバルエキスポネットワーク", subtitle: "B2B貿易見本市への玄関口", searchPlaceholder: "製品、出展者を検索...", searchButton: "検索" },
      featured: { 
        title: "注目製品", 
        viewDetails: "詳細を見る",
        boothName: "ブース名",
        productCategory: "製品カテゴリ",
        customization: "カスタマイズ",
        yes: "はい",
        no: "いいえ",
        enterBooth: "ブースに入って見る",
        productImage: "製品画像",
        sampleCategories: "電子機器、家電",
      },
      why: {
        title: "選ばれる理由",
        verified: { title: "認証済みサプライヤー", description: "すべての出展者は品質と信頼性を検証済み" },
        competitive: { title: "競争力のある価格", description: "メーカー直販、仲介業者なし" },
        global: { title: "グローバル展開", description: "世界中の買い手と売り手をつなぐ" },
      },
      exhibitors: { title: "注目の出展者", viewAll: "すべての出展者を見る" },
    },
    nav: { home: "ホーム", products: "製品", exhibitors: "出展者", sellerPortal: "販売者ポータル", login: "ログイン", register: "登録", dashboard: "ダッシュボード", logout: "ログアウト" },
    common: { loading: "読み込み中...", error: "エラー", save: "保存", cancel: "キャンセル", delete: "削除", edit: "編集", search: "検索", noResults: "結果なし", contact: "お問い合わせ", verified: "認証済み", viewAll: "すべて表示", back: "戻る", next: "次へ", previous: "前へ" },
    auth: {
      login: { title: "サインイン", email: "メール", password: "パスワード", submit: "サインイン", noAccount: "アカウントをお持ちでないですか？", registerLink: "新規登録" },
      register: { title: "アカウント作成", companyName: "会社名", email: "メール", password: "パスワード", confirmPassword: "確認", submit: "作成", hasAccount: "すでにアカウントをお持ちですか？", loginLink: "サインイン" },
    },
    seller: { dashboard: "ダッシュボード", profile: "プロフィール", products: "製品", addProduct: "製品追加", editProduct: "製品編集", brochures: "パンフレット", settings: "設定", companyInfo: "会社情報", saveChanges: "変更を保存" },
    product: { name: "製品名", description: "説明", category: "カテゴリ", price: "価格", minOrder: "最小注文数", images: "画像", specifications: "仕様", addImage: "画像追加", submit: "送信" },
    stores: { title: "すべての出展者", subtitle: "認証済み出展者とその製品を閲覧", verified: "認証済み", products: "製品", noExhibitors: "出展者が見つかりません", noExhibitorsDesc: "現在アクティブな出展者はありません。" },
    pagination: { previous: "前へ", next: "次へ" },
  },
  ko: {
    home: {
      hero: { title: "글로벌 엑스포 네트워크", subtitle: "B2B 무역 박람회 관문", searchPlaceholder: "제품, 참가업체 검색...", searchButton: "검색" },
      featured: { 
        title: "전시 구역", 
        viewDetails: "자세히 보기",
        boothName: "부스 이름",
        productCategory: "제품 카테고리",
        customization: "맞춤 제작",
        yes: "예",
        no: "아니오",
        enterBooth: "부스 입장하여 보기",
        productImage: "제품 이미지",
        sampleCategories: "전자제품, 가전제품",
      },
      why: {
        title: "왜 우리를 선택해야 하는가",
        verified: { title: "검증된 공급업체", description: "모든 참가업체는 품질과 신뢰성 검증 완료" },
        competitive: { title: "경쟁력 있는 가격", description: "제조업체 직거래, 중간상인 없음" },
        global: { title: "글로벌 도달", description: "전 세계 구매자 및 판매자와 연결" },
      },
      exhibitors: { title: "추천 참가업체", viewAll: "모든 참가업체 보기" },
    },
    nav: { home: "홈", products: "제품", exhibitors: "참가업체", sellerPortal: "판매자 포털", login: "로그인", register: "회원가입", dashboard: "대시보드", logout: "로그아웃" },
    common: { loading: "로딩 중...", error: "오류", save: "저장", cancel: "취소", delete: "삭제", edit: "편집", search: "검색", noResults: "결과 없음", contact: "연락처", verified: "검증됨", viewAll: "모두 보기", back: "뒤로", next: "다음", previous: "이전" },
    auth: {
      login: { title: "로그인", email: "이메일", password: "비밀번호", submit: "로그인", noAccount: "계정이 없으신가요?", registerLink: "회원가입" },
      register: { title: "계정 만들기", companyName: "회사명", email: "이메일", password: "비밀번호", confirmPassword: "확인", submit: "만들기", hasAccount: "이미 계정이 있으신가요?", loginLink: "로그인" },
    },
    seller: { dashboard: "대시보드", profile: "프로필", products: "제품", addProduct: "제품 추가", editProduct: "제품 편집", brochures: "브로슈어", settings: "설정", companyInfo: "회사 정보", saveChanges: "변경 사항 저장" },
    product: { name: "제품명", description: "설명", category: "카테고리", price: "가격", minOrder: "최소 주문량", images: "이미지", specifications: "사양", addImage: "이미지 추가", submit: "제출" },
    stores: { title: "모든 참가업체", subtitle: "검증된 참가업체와 제품 둘러보기", verified: "검증됨", products: "제품", noExhibitors: "참가업체를 찾을 수 없음", noExhibitorsDesc: "현재 활성 참가업체가 없습니다." },
    pagination: { previous: "이전", next: "다음" },
  },
  ar: {
    home: {
      hero: { title: "شبكة المعارض العالمية", subtitle: "بوابتك إلى معارض التجارة B2B", searchPlaceholder: "البحث عن المنتجات، العارضين...", searchButton: "بحث" },
      featured: { 
        title: "مناطق المعرض", 
        viewDetails: "عرض التفاصيل",
        boothName: "اسم الجناح",
        productCategory: "فئة المنتج",
        customization: "التخصيص",
        yes: "نعم",
        no: "لا",
        enterBooth: "ادخل الجناح للمشاهدة",
        productImage: "صورة المنتج",
        sampleCategories: "إلكترونيات، أجهزة منزلية",
      },
      why: {
        title: "لماذا تختارنا",
        verified: { title: "موردون موثوقون", description: "جميع العارضين موثقون للجودة والموثوقية" },
        competitive: { title: "أسعار تنافسية", description: "مباشرة من المصنعين، بدون وسطاء" },
        global: { title: "انتشار عالمي", description: "تواصل مع المشترين والبائعين في جميع أنحاء العالم" },
      },
      exhibitors: { title: "العارضون المميزون", viewAll: "عرض جميع العارضين" },
    },
    nav: { home: "الرئيسية", products: "المنتجات", exhibitors: "العارضون", sellerPortal: "بوابة البائع", login: "تسجيل الدخول", register: "التسجيل", dashboard: "لوحة التحكم", logout: "تسجيل الخروج" },
    common: { loading: "جاري التحميل...", error: "خطأ", save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تحرير", search: "بحث", noResults: "لا توجد نتائج", contact: "اتصل", verified: "موثق", viewAll: "عرض الكل", back: "رجوع", next: "التالي", previous: "السابق" },
    auth: {
      login: { title: "تسجيل الدخول", email: "البريد الإلكتروني", password: "كلمة المرور", submit: "تسجيل الدخول", noAccount: "ليس لديك حساب؟", registerLink: "سجل الآن" },
      register: { title: "إنشاء حساب", companyName: "اسم الشركة", email: "البريد الإلكتروني", password: "كلمة المرور", confirmPassword: "تأكيد", submit: "إنشاء", hasAccount: "لديك حساب بالفعل؟", loginLink: "تسجيل الدخول" },
    },
    seller: { dashboard: "لوحة التحكم", profile: "الملف الشخصي", products: "المنتجات", addProduct: "إضافة منتج", editProduct: "تحرير المنتج", brochures: "النشرات", settings: "الإعدادات", companyInfo: "معلومات الشركة", saveChanges: "حفظ التغييرات" },
    product: { name: "اسم المنتج", description: "الوصف", category: "الفئة", price: "السعر", minOrder: "الحد الأدنى للطلب", images: "الصور", specifications: "المواصفات", addImage: "إضافة صورة", submit: "إرسال" },
    stores: { title: "جميع العارضين", subtitle: "تصفح جميع العارضين الموثقين ومنتجاتهم", verified: "موثق", products: "المنتجات", noExhibitors: "لم يتم العثور على عارضين", noExhibitorsDesc: "لا يوجد عارضون نشطون في الوقت الحالي." },
    pagination: { previous: "السابق", next: "التالي" },
  },
  ru: {
    home: {
      hero: { title: "Глобальная Сеть Выставок", subtitle: "Ваш путь к B2B торговым выставкам", searchPlaceholder: "Поиск продуктов, участников...", searchButton: "Поиск" },
      featured: { 
        title: "Выставочные Зоны", 
        viewDetails: "Подробнее",
        boothName: "Название Стенда",
        productCategory: "Категория Продукта",
        customization: "Настройка",
        yes: "Да",
        no: "Нет",
        enterBooth: "Войти в Стенд для Просмотра",
        productImage: "Изображение Продукта",
        sampleCategories: "Электроника, Бытовая Техника",
      },
      why: {
        title: "Почему Выбирают Нас",
        verified: { title: "Проверенные Поставщики", description: "Все участники проверены на качество и надежность" },
        competitive: { title: "Конкурентные Цены", description: "Напрямую от производителей, без посредников" },
        global: { title: "Глобальный Охват", description: "Связывайтесь с покупателями и продавцами по всему миру" },
      },
      exhibitors: { title: "Рекомендуемые Участники", viewAll: "Все Участники" },
    },
    nav: { home: "Главная", products: "Продукты", exhibitors: "Участники", sellerPortal: "Портал Продавца", login: "Вход", register: "Регистрация", dashboard: "Панель", logout: "Выход" },
    common: { loading: "Загрузка...", error: "Ошибка", save: "Сохранить", cancel: "Отмена", delete: "Удалить", edit: "Редактировать", search: "Поиск", noResults: "Результатов нет", contact: "Контакт", verified: "Проверено", viewAll: "Все", back: "Назад", next: "Далее", previous: "Назад" },
    auth: {
      login: { title: "Вход", email: "Email", password: "Пароль", submit: "Войти", noAccount: "Нет аккаунта?", registerLink: "Регистрация" },
      register: { title: "Создать Аккаунт", companyName: "Название Компании", email: "Email", password: "Пароль", confirmPassword: "Подтвердить", submit: "Создать", hasAccount: "Уже есть аккаунт?", loginLink: "Вход" },
    },
    seller: { dashboard: "Панель", profile: "Профиль", products: "Продукты", addProduct: "Добавить Продукт", editProduct: "Редактировать", brochures: "Буклеты", settings: "Настройки", companyInfo: "Информация о Компании", saveChanges: "Сохранить Изменения" },
    product: { name: "Название Продукта", description: "Описание", category: "Категория", price: "Цена", minOrder: "Мин. Заказ", images: "Изображения", specifications: "Характеристики", addImage: "Добавить Фото", submit: "Отправить" },
    stores: { title: "Все Участники", subtitle: "Просмотрите всех проверенных участников и их продукты", verified: "Проверено", products: "Продукты", noExhibitors: "Участники не найдены", noExhibitorsDesc: "В настоящее время нет активных участников." },
    pagination: { previous: "Назад", next: "Далее" },
  },
  pt: {
    home: {
      hero: { title: "Rede Global de Exposições", subtitle: "Sua porta de entrada para feiras B2B", searchPlaceholder: "Pesquisar produtos, expositores...", searchButton: "Pesquisar" },
      featured: { 
        title: "Zonas de Exposição", 
        viewDetails: "Ver Detalhes",
        boothName: "Nome do Estande",
        productCategory: "Categoria do Produto",
        customization: "Personalização",
        yes: "Sim",
        no: "Não",
        enterBooth: "Entrar no Estande para Ver",
        productImage: "Imagem do Produto",
        sampleCategories: "Eletrônicos, Eletrodomésticos",
      },
      why: {
        title: "Por Que Nos Escolher",
        verified: { title: "Fornecedores Verificados", description: "Todos os expositores são verificados" },
        competitive: { title: "Preços Competitivos", description: "Direto dos fabricantes" },
        global: { title: "Alcance Global", description: "Conecte-se com compradores e vendedores" },
      },
      exhibitors: { title: "Expositores em Destaque", viewAll: "Ver Todos" },
    },
    nav: { home: "Início", products: "Produtos", exhibitors: "Expositores", sellerPortal: "Portal do Vendedor", login: "Entrar", register: "Registrar", dashboard: "Painel", logout: "Sair" },
    common: { loading: "Carregando...", error: "Erro", save: "Salvar", cancel: "Cancelar", delete: "Excluir", edit: "Editar", search: "Pesquisar", noResults: "Sem resultados", contact: "Contato", verified: "Verificado", viewAll: "Ver Tudo", back: "Voltar", next: "Próximo", previous: "Anterior" },
    auth: {
      login: { title: "Entrar", email: "Email", password: "Senha", submit: "Entrar", noAccount: "Não tem conta?", registerLink: "Registre-se" },
      register: { title: "Criar Conta", companyName: "Nome da Empresa", email: "Email", password: "Senha", confirmPassword: "Confirmar", submit: "Criar", hasAccount: "Já tem conta?", loginLink: "Entrar" },
    },
    seller: { dashboard: "Painel", profile: "Perfil", products: "Produtos", addProduct: "Adicionar Produto", editProduct: "Editar Produto", brochures: "Folhetos", settings: "Configurações", companyInfo: "Informações da Empresa", saveChanges: "Salvar Alterações" },
    product: { name: "Nome do Produto", description: "Descrição", category: "Categoria", price: "Preço", minOrder: "Pedido Mínimo", images: "Imagens", specifications: "Especificações", addImage: "Adicionar Imagem", submit: "Enviar" },
    stores: { title: "Todos os Expositores", subtitle: "Navegue por todos os expositores verificados e seus produtos", verified: "Verificado", products: "Produtos", noExhibitors: "Nenhum Expositor Encontrado", noExhibitorsDesc: "Não há expositores ativos no momento." },
    pagination: { previous: "Anterior", next: "Próximo" },
  },
  hi: {
    home: {
      hero: { title: "ग्लोबल एक्सपो नेटवर्क", subtitle: "B2B व्यापार प्रदर्शनियों का द्वार", searchPlaceholder: "उत्पाद, प्रदर्शक खोजें...", searchButton: "खोजें" },
      featured: { 
        title: "प्रदर्शनी क्षेत्र", 
        viewDetails: "विवरण देखें",
        boothName: "बूथ का नाम",
        productCategory: "उत्पाद श्रेणी",
        customization: "अनुकूलन",
        yes: "हाँ",
        no: "नहीं",
        enterBooth: "देखने के लिए बूथ में जाएं",
        productImage: "उत्पाद छवि",
        sampleCategories: "इलेक्ट्रॉनिक्स, घरेलू उपकरण",
      },
      why: {
        title: "हमें क्यों चुनें",
        verified: { title: "सत्यापित आपूर्तिकर्ता", description: "सभी प्रदर्शक गुणवत्ता के लिए सत्यापित हैं" },
        competitive: { title: "प्रतिस्पर्धी मूल्य", description: "निर्माताओं से सीधे" },
        global: { title: "वैश्विक पहुंच", description: "दुनिया भर के खरीदारों से जुड़ें" },
      },
      exhibitors: { title: "विशेष प्रदर्शक", viewAll: "सभी प्रदर्शक देखें" },
    },
    nav: { home: "होम", products: "उत्पाद", exhibitors: "प्रदर्शक", sellerPortal: "विक्रेता पोर्टल", login: "लॉगिन", register: "रजिस्टर", dashboard: "डैशबोर्ड", logout: "लॉगआउट" },
    common: { loading: "लोड हो रहा है...", error: "त्रुटि", save: "सेव", cancel: "रद्द", delete: "हटाएं", edit: "संपादित", search: "खोज", noResults: "कोई परिणाम नहीं", contact: "संपर्क", verified: "सत्यापित", viewAll: "सभी देखें", back: "वापस", next: "अगला", previous: "पिछला" },
    auth: {
      login: { title: "लॉगिन", email: "ईमेल", password: "पासवर्ड", submit: "लॉगिन", noAccount: "खाता नहीं है?", registerLink: "रजिस्टर करें" },
      register: { title: "खाता बनाएं", companyName: "कंपनी नाम", email: "ईमेल", password: "पासवर्ड", confirmPassword: "पुष्टि", submit: "बनाएं", hasAccount: "पहले से खाता है?", loginLink: "लॉगिन" },
    },
    seller: { dashboard: "डैशबोर्ड", profile: "प्रोफ़ाइल", products: "उत्पाद", addProduct: "उत्पाद जोड़ें", editProduct: "उत्पाद संपादित", brochures: "ब्रोशर", settings: "सेटिंग्स", companyInfo: "कंपनी जानकारी", saveChanges: "बदलाव सेव" },
    product: { name: "उत्पाद नाम", description: "विवरण", category: "श्रेणी", price: "मूल्य", minOrder: "न्यूनतम ऑर्डर", images: "छवियां", specifications: "विशेषताएं", addImage: "छवि जोड़ें", submit: "जमा करें" },
    stores: { title: "सभी प्रदर्शक", subtitle: "सभी सत्यापित प्रदर्शकों और उनके उत्पादों को ब्राउज़ करें", verified: "सत्यापित", products: "उत्पाद", noExhibitors: "कोई प्रदर्शक नहीं मिला", noExhibitorsDesc: "वर्तमान में कोई सक्रिय प्रदर्शक नहीं हैं।" },
    pagination: { previous: "पिछला", next: "अगला" },
  },
  th: {
    home: {
      hero: { title: "เครือข่ายนิทรรศการทั่วโลก", subtitle: "ประตูสู่การแสดงสินค้า B2B", searchPlaceholder: "ค้นหาสินค้า, ผู้แสดงสินค้า...", searchButton: "ค้นหา" },
      featured: { 
        title: "พื้นที่จัดแสดง", 
        viewDetails: "ดูรายละเอียด",
        boothName: "ชื่อบูธ",
        productCategory: "หมวดหมู่สินค้า",
        customization: "การปรับแต่ง",
        yes: "ใช่",
        no: "ไม่",
        enterBooth: "เข้าสู่บูธเพื่อดู",
        productImage: "รูปภาพสินค้า",
        sampleCategories: "อิเล็กทรอนิกส์, เครื่องใช้ในบ้าน",
      },
      why: {
        title: "ทำไมต้องเลือกเรา",
        verified: { title: "ซัพพลายเออร์ที่ตรวจสอบแล้ว", description: "ผู้แสดงสินค้าทั้งหมดได้รับการตรวจสอบ" },
        competitive: { title: "ราคาที่แข่งขันได้", description: "直接从ผู้ผลิต" },
        global: { title: "เข้าถึงทั่วโลก", description: "เชื่อมต่อกับผู้ซื้อและผู้ขายทั่วโลก" },
      },
      exhibitors: { title: "ผู้แสดงสินค้าแนะนำ", viewAll: "ดูทั้งหมด" },
    },
    nav: { home: "หน้าแรก", products: "สินค้า", exhibitors: "ผู้แสดงสินค้า", sellerPortal: "พอร์ตอลผู้ขาย", login: "เข้าสู่ระบบ", register: "ลงทะเบียน", dashboard: "แดชบอร์ด", logout: "ออกจากระบบ" },
    common: { loading: "กำลังโหลด...", error: "ข้อผิดพลาด", save: "บันทึก", cancel: "ยกเลิก", delete: "ลบ", edit: "แก้ไข", search: "ค้นหา", noResults: "ไม่พบผลลัพธ์", contact: "ติดต่อ", verified: "ตรวจสอบแล้ว", viewAll: "ดูทั้งหมด", back: "กลับ", next: "ถัดไป", previous: "ก่อนหน้า" },
    auth: {
      login: { title: "เข้าสู่ระบบ", email: "อีเมล", password: "รหัสผ่าน", submit: "เข้าสู่ระบบ", noAccount: "ยังไม่มีบัญชี?", registerLink: "ลงทะเบียน" },
      register: { title: "สร้างบัญชี", companyName: "ชื่อบริษัท", email: "อีเมล", password: "รหัสผ่าน", confirmPassword: "ยืนยัน", submit: "สร้าง", hasAccount: "มีบัญชีแล้ว?", loginLink: "เข้าสู่ระบบ" },
    },
    seller: { dashboard: "แดชบอร์ด", profile: "โปรไฟล์", products: "สินค้า", addProduct: "เพิ่มสินค้า", editProduct: "แก้ไขสินค้า", brochures: "โบรชัวร์", settings: "ตั้งค่า", companyInfo: "ข้อมูลบริษัท", saveChanges: "บันทึกการเปลี่ยนแปลง" },
    product: { name: "ชื่อสินค้า", description: "คำอธิบาย", category: "หมวดหมู่", price: "ราคา", minOrder: "ขั้นต่ำ", images: "รูปภาพ", specifications: "สเปค", addImage: "เพิ่มรูปภาพ", submit: "ส่ง" },
    stores: { title: "ผู้แสดงสินค้าทั้งหมด", subtitle: "เรียกดูผู้แสดงสินค้าที่ตรวจสอบแล้วและผลิตภัณฑ์ของพวกเขา", verified: "ตรวจสอบแล้ว", products: "สินค้า", noExhibitors: "ไม่พบผู้แสดงสินค้า", noExhibitorsDesc: "ขณะนี้ไม่มีผู้แสดงสินค้าที่ใช้งานอยู่" },
    pagination: { previous: "ก่อนหน้า", next: "ถัดไป" },
  },
  vi: {
    home: {
      hero: { title: "Mạng Lưới Triển Lãm Toàn Cầu", subtitle: "Cổng thông tin triển lãm thương mại B2B", searchPlaceholder: "Tìm kiếm sản phẩm, nhà triển lãm...", searchButton: "Tìm kiếm" },
      featured: { 
        title: "Khu Vực Triển Lãm", 
        viewDetails: "Xem Chi Tiết",
        boothName: "Tên Gian Hàng",
        productCategory: "Danh Mục Sản Phẩm",
        customization: "Tùy Chỉnh",
        yes: "Có",
        no: "Không",
        enterBooth: "Vào Gian Hàng để Xem",
        productImage: "Hình Ảnh Sản Phẩm",
        sampleCategories: "Điện Tử, Đồ Gia Dụng",
      },
      why: {
        title: "Tại Sao Chọn Chúng Tôi",
        verified: { title: "Nhà Cung Cấp Đã Xác Minh", description: "Tất cả nhà triển lãm đều được xác minh" },
        competitive: { title: "Giá Cả Cạnh Tranh", description: "Trực tiếp từ nhà sản xuất" },
        global: { title: "Phạm Vi Toàn Cầu", description: "Kết nối với người mua và người bán" },
      },
      exhibitors: { title: "Nhà Triển Lãm Nổi Bật", viewAll: "Xem Tất Cả" },
    },
    nav: { home: "Trang Chủ", products: "Sản Phẩm", exhibitors: "Nhà Triển Lãm", sellerPortal: "Cổng Người Bán", login: "Đăng Nhập", register: "Đăng Ký", dashboard: "Bảng Điều Khiển", logout: "Đăng Xuất" },
    common: { loading: "Đang tải...", error: "Lỗi", save: "Lưu", cancel: "Hủy", delete: "Xóa", edit: "Sửa", search: "Tìm kiếm", noResults: "Không có kết quả", contact: "Liên hệ", verified: "Đã xác minh", viewAll: "Xem Tất Cả", back: "Quay lại", next: "Tiếp", previous: "Trước" },
    auth: {
      login: { title: "Đăng Nhập", email: "Email", password: "Mật khẩu", submit: "Đăng Nhập", noAccount: "Chưa có tài khoản?", registerLink: "Đăng Ký" },
      register: { title: "Tạo Tài Khoản", companyName: "Tên Công Ty", email: "Email", password: "Mật khẩu", confirmPassword: "Xác nhận", submit: "Tạo", hasAccount: "Đã có tài khoản?", loginLink: "Đăng Nhập" },
    },
    seller: { dashboard: "Bảng Điều Khiển", profile: "Hồ Sơ", products: "Sản Phẩm", addProduct: "Thêm Sản Phẩm", editProduct: "Sửa Sản Phẩm", brochures: "Tài Liệu", settings: "Cài Đặt", companyInfo: "Thông Tin Công Ty", saveChanges: "Lưu Thay Đổi" },
    product: { name: "Tên Sản Phẩm", description: "Mô Tả", category: "Danh Mục", price: "Giá", minOrder: "Đơn Hàng Tối Thiểu", images: "Hình Ảnh", specifications: "Thông Số", addImage: "Thêm Ảnh", submit: "Gửi" },
    stores: { title: "Tất Cả Nhà Triển Lãm", subtitle: "Duyệt qua tất cả các nhà triển lãm đã được xác minh và sản phẩm của họ", verified: "Đã xác minh", products: "Sản Phẩm", noExhibitors: "Không Tìm Thấy Nhà Triển Lãm", noExhibitorsDesc: "Hiện tại không có nhà triển lãm nào hoạt động." },
    pagination: { previous: "Trước", next: "Tiếp" },
  },
};

export async function getDictionary(locale: LanguageCode): Promise<Dictionary> {
  return dictionaries[locale] || dictionaries.en;
}
