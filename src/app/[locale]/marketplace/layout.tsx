import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/hreflang'
import type { LanguageCode } from '@/lib/languages'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: LanguageCode }>
}

/**
 * marketplace/page.tsx is a Client Component, so it cannot export metadata.
 * Without this layout the page inherited the root canonical (/en) for every
 * locale, e.g. /de/marketplace declared canonical https://x2xhub.com/en.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const alternates = buildAlternates(`/${locale}/marketplace`)

  const isZh = locale === 'zh'
  const title = 'B2B Marketplace | Wholesale Products & Verified Suppliers'
  const description = isZh
    ? '浏览全球 B2B 批发市场：工业机械、电子产品、化工原料、纺织与消费品，对接已认证供应商。'
    : 'Browse the global B2B marketplace: industrial machinery, electronics, chemicals, textiles and consumer goods from verified suppliers worldwide.'

  return {
    title,
    description,
    keywords: [
      'B2B marketplace', 'wholesale products', 'verified suppliers',
      'global sourcing', 'industrial machinery', 'electronics wholesale',
      'bulk purchase', 'trade platform',
    ],
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: alternates.canonical,
      siteName: 'SeaHeart Global',
    },
  }
}

export default function MarketplaceLayout({ children }: Props) {
  return <>{children}</>
}
