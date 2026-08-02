import { LanguageCode } from './languages';

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
}

export const seoMeta: Record<LanguageCode, SeoMeta> = {
  en: {
    title: "SeaHeart Global - Global B2B Trade Exhibition Platform | Connect Buyers & Sellers",
    description: "SeaHeart Global is the world's leading B2B cross-border trade exhibition platform. Connect with verified suppliers and buyers worldwide. Discover quality products for international trade.",
    keywords: ["B2B trade", "global marketplace", "international trade", "verified suppliers", "product sourcing", "trade exhibition", "cross-border commerce", "business to business"],
  },
  zh: {
    title: "心海环球 SeaHeart Global - 全球B2B贸易展会平台 | 连接买家与卖家",
    description: "心海环球 SeaHeart Global 是全球领先的B2B跨境贸易展览平台。与全球已认证的供应商和买家建立联系，发现优质产品，促进国际贸易。",
    keywords: ["B2B贸易", "全球市场", "国际贸易", "认证供应商", "产品采购", "贸易展会", "跨境电商", "企业对企业"],
  },
  es: {
    title: "CorazónMar Global - Plataforma Global de Exposiciones Comerciales B2B | Conecta Compradores y Vendedores",
    description: "CorazónMar Global es la plataforma líder mundial de exposiciones comerciales transfronterizas B2B. Conecte con proveedores y compradores verificados en todo el mundo.",
    keywords: ["comercio B2B", "mercado global", "comercio internacional", "proveedores verificados", "adquisición de productos", "exposición comercial", "comercio transfronterizo"],
  },
  fr: {
    title: "CœurMer Mondial - Plateforme Mondiale d'Expositions Commercielles B2B | Connectez Acheteurs et Vendeurs",
    description: "CœurMer Mondial est la plateforme leader mondiale d'expositions commerciales transfrontalières B2B. Connectez-vous avec des fournisseurs et acheteurs vérifiés dans le monde entier.",
    keywords: ["commerce B2B", "marché mondial", "commerce international", "fournisseurs vérifiés", "approvisionnement", "exposition commerciale", "commerce transfrontalier"],
  },
  de: {
    title: "Meerherz Global - Globale B2B-Handelsausstellungsplattform | Verbinden Sie Käufer und Verkäufer",
    description: "Meerherz Global ist die weltweit führende B2B-Grenzüberschreitende Handelsausstellungsplattform. Verbinden Sie sich mit verifizierten Lieferanten und Käufern weltweit.",
    keywords: ["B2B-Handel", "globaler Markt", "internationaler Handel", "verifizierte Lieferanten", "Produktbeschaffung", "Handelsausstellung", "grenzüberschreitender Handel"],
  },
  ja: {
    title: "心海グローバル - グローバルB2B貿易展示プラットフォーム | バイヤーとセラーをつなぐ",
    description: "心海グローバルは世界有数のB2B国境を越えた貿易展示プラットフォームです。世界中の認定されたサプライヤーやバイヤーと繋がりましょう。",
    keywords: ["B2B貿易", "グローバルマーケットプレイス", "国際貿易", "認証サプライヤー", "製品調達", "貿易展示", "国境を越えた商取引"],
  },
  ko: {
    title: "심해글로벌 - 글로벌 B2B 무역 전시 플랫폼 | 구매자와 판매자 연결",
    description: "심해글로벌은 세계 최고의 B2B 국제 무역 전시 플랫폼입니다. 전 세계의 인증된 공급업체와 구매자와 연결하세요.",
    keywords: ["B2B 무역", "글로벌 마켓플레이스", "국제 무역", "인증 공급자", "제품 조달", "무역 전시회", "국경 간 전자상거래"],
  },
  ar: {
    title: "القلب البحري العالمي - منصة المعارض التجارية B2B العالمية | ربط المشترين والبائعين",
    description: "القلب البحري العالمي هي المنصة الرائدة في العالم لمعارض التجارة الحرة B2B عبر الحدود. اتصل بموردين ومشترين موثقين في جميع أنحاء العالم.",
    keywords: ["التجارة B2B", "السوق العالمية", "التجارة الدولية", "الموردون الموثقون", "شراء المنتجات", "معرض تجاري", "التجارة عبر الحدود"],
  },
  ru: {
    title: "МорскоеСердце Глобал - Глобальная B2B-платформа для торговых выставок | Соединяем покупателей и продавцов",
    description: "МорскоеСердце Глобал - это ведущая в мире B2B-платформа для трансграничных торговых выставок. Свяжитесь с проверенными поставщиками и покупателями по всему миру.",
    keywords: ["B2B-торговля", "глобальный маркетплейс", "международная торговля", "проверенные поставщики", "поиск товаров", "торговые выставки", "трансграничная торговля"],
  },
  pt: {
    title: "CoraçãoMar Global - Plataforma Global de Feiras Comerciais B2B | Conecte Compradores e Vendedores",
    description: "CoraçãoMar Global é a plataforma líder mundial de feiras comerciais transfronteiriças B2B. Conecte-se com fornecedores e compradores verificados em todo o mundo.",
    keywords: ["comércio B2B", "mercado global", "comércio internacional", "fornecedores verificados", "sourcing de produtos", "feira comercial", "comércio transfronteiriço"],
  },
  hi: {
    title: "समुद्र-हृदय ग्लोबल - वैश्विक B2B ट्रेड एक्सिबिशन प्लेटफॉर्म | खरीदारों और विक्रेताओं को जोड़ें",
    description: "समुद्र-हृदय ग्लोबल विश्व का अग्रणी B2B क्रॉस-बॉर्डर ट्रेड एक्सिबिशन प्लेटफॉर्म है। दुनिया भर के सत्यापित आपूर्तिकर्ताओं और खरीदारों के साथ जुड़ें।",
    keywords: ["B2B व्यापार", "वैश्विक मार्केटप्लेस", "अंतर्राष्ट्रीय व्यापार", "सत्यापित आपूर्तिकर्ता", "उत्पाद सोर्सिंग", "ट्रेड एक्सिबिशन", "क्रॉस-बॉर्डर वाणिज्य"],
  },
  th: {
    title: "หัวใจทะเลโลก - แพลตฟอร์มนิทรรศการการค้า B2B โลก | เชื่อมต่อผู้ซื้อและผู้ขาย",
    description: "หัวใจทะเลโลก เป็นแพลตฟอร์มนิทรรศการการค้า B2B ข้ามพรมแดนชั้นนำของโลก เชื่อมต่อกับผู้ผลิตและผู้ซื้อที่ได้รับการยืนยันจากทั่วโลก",
    keywords: ["การค้า B2B", "ตลาดโลก", "การค้านานาชาติ", "ผู้ผลิตที่ยืนยัน", "การจัดหาสินค้า", "นิทรรศการการค้า", "การค้าข้ามพรมแดน"],
  },
  vi: {
    title: "TráiTimBiển ToànCầu - Nền tảng Triển lãm Thương mại B2B Toàn cầu | Kết nối Người mua và Người bán",
    description: "TráiTimBiển ToànCầu là nền tảng triển lãm thương mại B2B xuyên biên giới hàng đầu thế giới. Kết nối với nhà cung cấp và người mua được xác minh trên toàn cầu.",
    keywords: ["Thương mại B2B", "Thị trường toàn cầu", "Thương mại quốc tế", "Nhà cung cấp được xác minh", "Tìm kiếm sản phẩm", "Triển lãm thương mại", "Thương mại xuyên biên giới"],
  },
};

export function getSeoMeta(language: LanguageCode): SeoMeta {
  return seoMeta[language] || seoMeta.en;
}