/**
 * Metadata helper for locale pages that are Client Components.
 *
 * Why this exists:
 * src/app/[locale]/layout.tsx is `'use client'`, so nothing under it can export
 * `generateMetadata`. Those pages silently fell back to the ROOT layout's
 * metadata, which meant every one of them shipped the same generic homepage
 * title/description and a canonical of the site root. To Bing and Google they
 * looked like a dozen duplicates of the homepage.
 *
 * A Server Component `layout.tsx` sitting between the client page and the
 * client locale layout can still export metadata. This helper builds it so each
 * route only has to declare its own copy.
 *
 * Usage — src/app/[locale]/<route>/layout.tsx:
 *
 *   import { buildPageLayout } from '@/lib/page-metadata'
 *   const { generateMetadata, default: Layout } = buildPageLayout({
 *     route: 'contact',
 *     en: { title: '...', description: '...' },
 *     zh: { title: '...', description: '...' },
 *     keywords: ['...'],
 *   })
 *   export { generateMetadata }
 *   export default Layout
 */

import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/hreflang'
import type { LanguageCode } from '@/lib/languages'

export interface LocaleCopy {
  title: string
  description: string
}

export interface PageMetadataSpec {
  /** Route segment under /[locale], e.g. 'contact' or 'legal/privacy'. */
  route: string
  /** English copy. Used for every locale that has no explicit override. */
  en: LocaleCopy
  /** Optional per-locale overrides, keyed by locale code. */
  overrides?: Partial<Record<LanguageCode, LocaleCopy>>
  keywords?: string[]
  /** Set false for utility pages that should stay out of the index. */
  index?: boolean
}

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: LanguageCode }>
}

export function buildPageMetadata(spec: PageMetadataSpec) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: LanguageCode }>
  }): Promise<Metadata> {
    const { locale } = await params
    const copy = spec.overrides?.[locale] ?? spec.en
    const alternates = buildAlternates(`/${locale}/${spec.route}`)
    const shouldIndex = spec.index !== false

    return {
      title: copy.title,
      description: copy.description,
      keywords: spec.keywords,
      alternates: {
        canonical: alternates.canonical,
        languages: alternates.languages,
      },
      openGraph: {
        title: copy.title,
        description: copy.description,
        type: 'website',
        url: alternates.canonical,
        siteName: 'SeaHeart Global',
      },
      twitter: {
        card: 'summary_large_image',
        title: copy.title,
        description: copy.description,
      },
      robots: {
        index: shouldIndex,
        follow: true,
      },
      other: {
        'content-language': locale,
      },
    }
  }
}

/** Convenience wrapper returning both the metadata fn and a pass-through layout. */
export function buildPageLayout(spec: PageMetadataSpec) {
  const generateMetadata = buildPageMetadata(spec)

  function PageLayout({ children }: LayoutProps) {
    return <>{children}</>
  }

  return { generateMetadata, default: PageLayout }
}
