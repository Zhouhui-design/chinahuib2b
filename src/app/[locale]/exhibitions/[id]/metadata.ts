import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { languages } from '@/lib/languages'

const BASE_URL = 'https://x2xhub.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params
  
  let booth = null
  try {
    booth = await prisma.booth.findUnique({
      where: { id, isActive: true },
      include: {
        seller: {
          select: {
            companyName: true,
            country: true,
            city: true,
          }
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch booth for metadata:', error)
  }

  if (!booth) {
    return {
      title: `Exhibition - SeaHeart Global`,
      description: 'Explore exhibitions on SeaHeart Global B2B trade platform',
      keywords: ['exhibition', 'trade show', 'b2b', 'global marketplace'],
    }
  }

  const isEnglish = locale === 'en'
  const boothName = booth.names?.[locale] || booth.names?.en || booth.name
  const companyName = booth.seller?.companyName || booth.exhibitionName

  const title = `${boothName} | ${companyName} | SeaHeart Global`
  const description = `${boothName} by ${companyName} from ${booth.seller?.city || ''}, ${booth.seller?.country || ''}. Discover products and connect with suppliers.`

  const allKeywords = [
    ...(booth.keywords || []),
    boothName,
    companyName,
    booth.seller?.companyName || '',
    booth.seller?.country || '',
    booth.seller?.city || '',
    'exhibition',
    'trade show',
    'b2b',
    'global trade',
    'products',
  ].filter(Boolean)

  const alternates: Record<string, string> = {}
  languages.forEach(lang => {
    alternates[lang.code] = `${BASE_URL}/${lang.code}/exhibitions/${id}`
  })

  return {
    title,
    description,
    keywords: allKeywords,
    
    alternates: {
      canonical: `${BASE_URL}/${locale}/exhibitions/${id}`,
      languages: alternates,
    },
    
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/${locale}/exhibitions/${id}`,
      siteName: 'SeaHeart Global | 心海环球',
      images: booth.bannerUrl ? [{ url: booth.bannerUrl }] : undefined,
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: booth.bannerUrl ? [booth.bannerUrl] : undefined,
    },
    
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
  }
}
