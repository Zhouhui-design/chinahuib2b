import type { Metadata } from 'next'
import { BASE_URL } from '@/lib/seo'
import { languages, type LanguageCode } from '@/lib/languages'

interface Props {
  params: { locale: LanguageCode }
}

const getLocaleContent = (locale: LanguageCode) => {
  const content: Record<LanguageCode, { title: string; desc: string; keywords: string[] }> = {
    en: {
      title: 'Auction Screen - Global B2B Trade Auction & Marketplace',
      desc: 'Buy and sell industrial products, machinery, electronics and more through our global B2B auction platform. Verified suppliers, competitive bidding, international trade.',
      keywords: ['B2B auction', 'trade auction', 'product sourcing', 'verified suppliers', 'international trade', 'industrial auction', 'online bidding', 'wholesale auction', 'global trade', 'machinery auction', 'electronics auction', 'chemical auction'],
    },
    zh: {
      title: '竞拍中心 - 全球B2B贸易竞拍平台',
      desc: '通过我们的全球B2B竞拍平台买卖工业产品、机械、电子产品等。优质供应商、竞争性出价、国际贸易。',
      keywords: ['B2B竞拍', '贸易竞拍', '产品采购', '认证供应商', '国际贸易', '工业竞拍', '在线竞价', '批发竞拍', '全球贸易', '机械竞拍', '电子竞拍', '化工竞拍'],
    },
    ru: {
      title: 'Аукцион - Глобальная B2B торговая платформа',
      desc: 'Покупайте и продавайте промышленные товары, оборудование, электронику и многое другое через нашу глобальную B2B платформу. Проверенные поставщики, конкурентные торги.',
      keywords: ['B2B аукцион', 'торговый аукцион', 'поиск продукции', 'проверенные поставщики', 'международная торговля', 'промышленный аукцион', 'онлайн-торги', 'оптовый аукцион'],
    },
    de: {
      title: 'Auktionsbildschirm - Globale B2B Handelsauktion',
      desc: 'Kaufen und verkaufen Sie Industrieprodukte, Maschinen, Elektronik und mehr über unsere globale B2B-Auktionsplattform. Geprüfte Lieferanten.',
      keywords: ['B2B-Auktion', 'Handelsauktion', 'Produktbeschaffung', 'geprüfte Lieferanten', 'internationaler Handel', 'Industrieauktion', 'Online-Bietung'],
    },
    fr: {
      title: 'Écran d\'enchères - Plateforme B2B mondiale',
      desc: 'Achetez et vendez des produits industriels, machines, électronique via notre plateforme B2B mondiale. Fournisseurs vérifiés.',
      keywords: ['enchères B2B', 'commerce mondial', 'sourcing produits', 'fournisseurs vérifiés', 'commerce international', 'enchères industrielles'],
    },
    es: {
      title: 'Pantalla de subastas - Plataforma B2B global',
      desc: 'Compra y vende productos industriales, maquinaria, electrónica a través de nuestra plataforma B2B global. Proveedores verificados.',
      keywords: ['subastas B2B', 'comercio global', 'abastecimiento de productos', 'proveedores verificados', 'comercio internacional'],
    },
    ja: {
      title: 'オークション画面 - グローバルB2B貿易プラットフォーム',
      desc: '産業製品、機械、電子機器などをグローバルB2Bオークションプラットフォームで売買。認定サプライヤー、国際貿易。',
      keywords: ['B2Bオークション', '貿易オークション', '製品調達', '認定サプライヤー', '国際貿易', '産業オークション'],
    },
    ko: {
      title: '경매 화면 - 글로벌 B2B 무역 플랫폼',
      desc: '글로벌 B2B 경매 플랫폼을 통해 산업 제품, 기계, 전자제품을 매매하세요. 인증된 공급업체.',
      keywords: ['B2B 경매', '무역 경매', '제품 소싱', '인증 공급업체', '국제 무역'],
    },
    ar: {
      title: 'شاشة المزاد - منصة B2B عالمية للتجارة',
      desc: 'اشترِ وبيع المنتجات الصناعية والآلات والإلكترونيات عبر منصتنا العالمية B2B. موردون موثقون.',
      keywords: ['مزاد B2B', 'تجارة عالمية', 'توريد المنتجات', 'موردون موثقون', 'تجارة دولية'],
    },
    pt: {
      title: 'Tela de leilão - Plataforma B2B global',
      desc: 'Compre e venda produtos industriais, máquinas, eletrônicos através da nossa plataforma B2B global. Fornecedores verificados.',
      keywords: ['leilão B2B', 'comércio global', 'fornecedores verificados', 'comércio internacional'],
    },
    hi: {
      title: 'नीलामी स्क्रीन - वैश्विक B2B व्यापार मंच',
      desc: 'हमारे वैश्विक B2B नीलामी मंच के माध्यम से औद्योगिक उत्पादों, मशीनरी, इलेक्ट्रॉनिक्स को खरीदें और बेचें।',
      keywords: ['B2B नीलामी', 'वैश्विक व्यापार', 'उत्पाद सोर्सिंग', 'प्रमाणित आपूर्तिकर्ता'],
    },
    th: {
      title: 'หน้าจอประมูล - แพลตฟอร์มการค้า B2B ระดับโลก',
      desc: 'ซื้อและขายผลิตภัณฑ์อุตสาหกรรม เครื่องจักร อิเล็กทรอนิกส์ผ่านแพลตฟอร์ม B2B ระดับโลกของเรา',
      keywords: ['ประมูล B2B', 'การค้าโลก', 'จัดหาผลิตภัณฑ์', 'ผู้จัดจำหน่ายที่ตรวจสอบแล้ว'],
    },
    vi: {
      title: 'Màn hình đấu giá - Nền tảng thương mại B2B toàn cầu',
      desc: 'Mua và bán sản phẩm công nghiệp, máy móc, điện tử thông qua nền tảng đấu giá B2B toàn cầu của chúng tôi.',
      keywords: ['đấu giá B2B', 'thương mại toàn cầu', 'tìm nguồn sản phẩm', 'nhà cung cấp đã xác minh'],
    },
  }

  return content[locale] || content.en
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale
  const content = getLocaleContent(locale)
  const localePath = locale === 'en' ? '/auction-screen' : `/${locale}/auction-screen`

  const alternates: Record<string, string> = {}
  languages.forEach(l => {
    alternates[l.code] = l.code === 'en'
      ? `${BASE_URL}/auction-screen`
      : `${BASE_URL}/${l.code}/auction-screen`
  })
  alternates['x-default'] = `${BASE_URL}/auction-screen`

  return {
    title: content.title,
    description: content.desc,
    keywords: content.keywords,
    alternates: {
      canonical: `${BASE_URL}${localePath}`,
      languages: alternates,
    },
    openGraph: {
      title: content.title,
      description: content.desc,
      url: `${BASE_URL}${localePath}`,
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'X2XHub B2B Trade Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.desc,
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}

export default function AuctionScreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
