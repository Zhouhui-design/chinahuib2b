/**
 * Store page - GitHub-style URL: x2xhub.com/<slug>
 *
 * Reached via middleware rewrite of /<slug> → /store/<slug> (URL bar stays clean).
 * Acts as the seller's "official website": shows company profile, enterprise
 * overview, certifications, full contact info, exhibition buttons, products,
 * business posts, auction listings, photo gallery, and downloadable brochures.
 *
 * Locale is detected from cookie/Accept-Language (no locale in URL).
 * ISR: revalidate every hour.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft, Globe, MapPin, Phone, Mail, Package, Download, MessageCircle,
  Eye, Building2, Calendar, Users, Banknote, Briefcase, UserCheck,
  Award, FileCheck, ExternalLink, Image as ImageIcon, Tag, Gavel,
  Languages, Mic, MessagesSquare,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { getWorldLanguageName } from '@/lib/world-languages'
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { languages } from '@/lib/languages'
import { detectLocale, getLocalizedDescription } from '@/lib/server-locale'
import { isValidSlug } from '@/lib/store-slug'
import ChatWidget from '@/components/chat/ChatWidget'
import { StoreSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'
import { StoreBanner, StoreLogo, StoreProductCardImage } from '@/components/stores/StoreImageWrappers'

// Inline SVG social-media icons (lucide-react v1.x removed brand icons)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface Props {
  params: Promise<{ slug: string }>
}

// ISR - revalidate every hour
export const revalidate = 3600

// ─── Data fetching ──────────────────────────────────────────────────────────

async function getSellerBySlug(slug: string) {
  return cacheGetOrSet(
    CACHE_KEYS.sellerBySlug(slug),
    async () => {
      return prisma.sellerProfile.findFirst({
        where: {
          storeSlug: slug,
          isActive: true,
        },
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true, phone: true, website: true },
          },
          products: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 24,
            include: { category: true },
          },
          booths: {
            where: { isActive: true, isPublished: true },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true, name: true, names: true, exhibitionName: true,
              exhibitionDates: true, location: true, logoUrl: true, bannerUrl: true,
              boothNumber: true,
            },
          },
          linkedPublicMessages: {
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
              id: true, content: true, createdAt: true, messageType: true,
              fileUrl: true, fileName: true, isAnnouncement: true,
              sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
          },
          auctionListings: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 12,
            select: {
              id: true, title: true, description: true, price: true, currency: true,
              images: true, category: true, tags: true, createdAt: true, type: true,
              views: true, inquiries: true,
            },
          },
          verificationFiles: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true, fileType: true, fileUrl: true, fileName: true,
              isVerified: true, certificateName: true, certificateNumber: true,
              expiryDate: true, issueDate: true, issuingAuthority: true, description: true,
            },
          },
          storeBrochures: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true, title: true, fileName: true, fileSize: true, downloadCount: true,
            },
          },
        },
      })
    },
    CACHE_TTL.LONG,
  )
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!isValidSlug(slug)) return { title: 'Store Not Found' }

  const seller = await getSellerBySlug(slug)
  if (!seller) return { title: 'Store Not Found' }

  const locale = await detectLocale()
  const description = getLocalizedDescription(seller, locale)
  const title = `${seller.companyName} | x2xhub`
  // Canonical is the clean slug URL (no locale prefix) - GitHub style
  const canonicalUrl = `https://x2xhub.com/${slug}`
  const ogImage = seller.bannerUrl || seller.logoUrl || undefined

  // hreflang alternates all point to the same clean slug URL (no locale segment)
  const alternatesLanguages: Record<string, string> = {}
  for (const lang of languages) {
    alternatesLanguages[lang.code] = canonicalUrl
  }
  alternatesLanguages['x-default'] = canonicalUrl

  return {
    title,
    description: description || seller.companyName,
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages,
    },
    openGraph: {
      title,
      description: description || seller.companyName,
      url: canonicalUrl,
      siteName: 'SeaHeart Global | x2xhub',
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage, alt: seller.companyName }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || seller.companyName,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isOrganizationProfile(orgType: string): boolean {
  return orgType === 'ENTERPRISE' || orgType === 'STATE_OWNED'
}

function getLocalizedBoothName(booth: any, locale: string): string {
  if (booth.names && typeof booth.names === 'object') {
    return booth.names[locale] || booth.names['en'] || booth.names['zh'] || booth.name
  }
  return booth.name
}

// 合并单值主字段 + JSONB 数组字段（去重），用于前台渲染邮箱/电话/网址。
function mergeMultiValues(single: string | null | undefined, arr: unknown): string[] {
  const list: string[] = []
  if (single && single.trim()) list.push(single.trim())
  if (Array.isArray(arr)) {
    for (const v of arr) {
      if (typeof v === 'string' && v.trim() && !list.includes(v.trim())) list.push(v.trim())
    }
  }
  return list
}

// 沟通语言：JSONB 数组 → 去重字符串数组（兼容内置 code 与自定义语言）。
function normalizeLanguages(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  const list: string[] = []
  for (const v of arr) {
    if (typeof v === 'string' && v.trim() && !list.includes(v.trim())) list.push(v.trim())
  }
  return list
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function StorePage({ params }: Props) {
  const { slug } = await params

  if (!isValidSlug(slug)) {
    notFound()
  }

  const seller = await getSellerBySlug(slug)
  if (!seller) {
    notFound()
  }

  const locale = await detectLocale()
  const description = getLocalizedDescription(seller, locale)
  const showOrgProfile = isOrganizationProfile(seller.organizationType)

  // Social media links
  const socials = [
    { key: 'facebook', url: seller.facebook, Icon: FacebookIcon },
    { key: 'instagram', url: seller.instagram, Icon: InstagramIcon },
    { key: 'linkedin', url: seller.linkedin, Icon: LinkedinIcon },
    { key: 'youtube', url: seller.youtube, Icon: YoutubeIcon },
    { key: 'twitter', url: seller.twitter, Icon: TwitterIcon },
  ].filter(s => s.url)

  const isZh = locale === 'zh'
  const t = (zh: string, en: string) => (isZh ? zh : en)

  const breadcrumbs = [
    { name: t('首页', 'Home'), url: `/${locale}` },
    { name: t('店铺', 'Stores'), url: `/${locale}/stores` },
    { name: seller.companyName, url: `https://x2xhub.com/${slug}` },
  ]

  return (
    <div className="bg-gray-50">
      {/* Schema.org Structured Data */}
      <StoreSchema store={seller} />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Back link */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href={`/${locale}/stores`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t('返回店铺列表', 'Back to Stores')}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <StoreBanner src={seller.bannerUrl} companyName={seller.companyName} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Left column (main content) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company profile card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <StoreLogo src={seller.logoUrl} companyName={seller.companyName} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {seller.companyName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      {seller.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ {t('已认证', 'Verified')}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {t(
                          seller.companyType === 'MANUFACTURER' ? '制造商' : seller.companyType === 'TRADER' ? '贸易商' : '制造+贸易',
                          seller.companyType,
                        )}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {t('个人/企业官网', 'Official Store')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{seller.city}, {seller.country}</span>
                </div>
                {seller.address && (
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{seller.address}</span>
                  </div>
                )}
                {(mergeMultiValues(seller.phone, seller.phones).length > 0) && (
                  <div className="flex items-start">
                    <Phone className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      {mergeMultiValues(seller.phone, seller.phones).map((v, i) => (
                        <a key={`phone-${i}`} href={`tel:${v}`} className="text-sm text-blue-600 hover:text-blue-700">
                          {v}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {(mergeMultiValues(seller.email, seller.emails).length > 0) && (
                  <div className="flex items-start">
                    <Mail className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      {mergeMultiValues(seller.email, seller.emails).map((v, i) => (
                        <a key={`email-${i}`} href={`mailto:${v}`} className="text-sm text-blue-600 hover:text-blue-700 break-all">
                          {v}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {(mergeMultiValues(seller.website, seller.websites).length > 0) && (
                  <div className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-1">
                      {mergeMultiValues(seller.website, seller.websites).map((v, i) => (
                        <a
                          key={`website-${i}`}
                          href={v}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 truncate"
                        >
                          {v}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {seller.contactName && (
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{seller.contactName}</span>
                  </div>
                )}
              </div>

              {/* Communication Languages */}
              {(normalizeLanguages(seller.voiceLanguages).length > 0 ||
                normalizeLanguages(seller.textLanguages).length > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-gray-400" />
                    {t('沟通语言', 'Communication Languages')}
                  </h2>
                  <div className="space-y-3">
                    {normalizeLanguages(seller.voiceLanguages).length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                          <Mic className="w-4 h-4 text-gray-400" />
                          {t('语音沟通', 'Voice')}
                          <span className="text-xs font-normal text-gray-400">
                            {t('（视频、电话）', '(video, phone)')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {normalizeLanguages(seller.voiceLanguages).map((code, i) => (
                            <span
                              key={`voice-${i}`}
                              className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-md"
                            >
                              {getWorldLanguageName(code, locale)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {normalizeLanguages(seller.textLanguages).length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                          <MessagesSquare className="w-4 h-4 text-gray-400" />
                          {t('文字沟通', 'Text')}
                          <span className="text-xs font-normal text-gray-400">
                            {t('（邮件、聊天）', '(email, chat)')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {normalizeLanguages(seller.textLanguages).map((code, i) => (
                            <span
                              key={`text-${i}`}
                              className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 text-xs rounded-md"
                            >
                              {getWorldLanguageName(code, locale)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company description */}
              {description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {t('公司简介', 'About Us')}
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Certifications (text badges) */}
              {seller.certifications && seller.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {t('认证资质', 'Certifications')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {seller.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enterprise overview (only for ENTERPRISE / STATE_OWNED) */}
            {showOrgProfile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  {t('企业概况', 'Enterprise Overview')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {seller.foundingYear && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 mr-2">{t('成立年份', 'Founded')}:</span>
                      <span className="text-sm font-medium text-gray-900">{seller.foundingYear}</span>
                    </div>
                  )}
                  {seller.employeeCount && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 mr-2">{t('员工人数', 'Employees')}:</span>
                      <span className="text-sm font-medium text-gray-900">{seller.employeeCount}</span>
                    </div>
                  )}
                  {seller.registeredCapital && (
                    <div className="flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 mr-2">{t('注册资本', 'Registered Capital')}:</span>
                      <span className="text-sm font-medium text-gray-900">{seller.registeredCapital}</span>
                    </div>
                  )}
                  {seller.legalRepresentative && (
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 mr-2">{t('法定代表人', 'Legal Representative')}:</span>
                      <span className="text-sm font-medium text-gray-900">{seller.legalRepresentative}</span>
                    </div>
                  )}
                  {seller.businessScope && (
                    <div className="sm:col-span-2">
                      <div className="flex items-start">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-500 mr-2">{t('经营范围', 'Business Scope')}:</span>
                        <span className="text-sm font-medium text-gray-900">{seller.businessScope}</span>
                      </div>
                    </div>
                  )}
                  {seller.registeredAddress && (
                    <div className="sm:col-span-2">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-500 mr-2">{t('注册地址', 'Registered Address')}:</span>
                        <span className="text-sm font-medium text-gray-900">{seller.registeredAddress}</span>
                      </div>
                    </div>
                  )}
                  {seller.registrationNumber && (
                    <div className="flex items-center">
                      <FileCheck className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-500 mr-2">{t('注册号', 'Reg. No.')}:</span>
                      <span className="text-sm font-medium text-gray-900">{seller.registrationNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Exhibition link buttons */}
            {seller.booths && seller.booths.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {t('我们的展会', 'Our Exhibitions')}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t('点击下方按钮直达我们的展会展厅', 'Click to visit our exhibition booths directly')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {seller.booths.map((booth) => (
                    <Link
                      key={booth.id}
                      href={`/${locale}/exhibitions/${booth.id}`}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {booth.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={booth.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600">
                          {getLocalizedBoothName(booth, locale)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {booth.exhibitionName}
                        </div>
                        {booth.boothNumber && (
                          <div className="text-xs text-gray-400">
                            {t('展位号', 'Booth')}: {booth.boothNumber}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Business posts / messages */}
            {seller.linkedPublicMessages && seller.linkedPublicMessages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('商业信息', 'Business Updates')}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({seller.linkedPublicMessages.length})
                  </span>
                </h2>
                <div className="space-y-3">
                  {seller.linkedPublicMessages.slice(0, 10).map((msg) => (
                    <div key={msg.id} className="border-l-2 border-blue-200 pl-4 py-1">
                      {msg.isAnnouncement && (
                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded mb-1">
                          {t('公告', 'Announcement')}
                        </span>
                      )}
                      <p className="text-gray-700 text-sm whitespace-pre-line">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{msg.sender?.displayName || msg.sender?.username || t('匿名', 'Anonymous')}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}</span>
                        {msg.fileName && (
                          <>
                            <span>•</span>
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                              <Download className="w-3 h-3 mr-0.5" />
                              {msg.fileName}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auction listings (挂卖产品) */}
            {seller.auctionListings && seller.auctionListings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Gavel className="w-5 h-5 mr-2" />
                  {t('挂卖产品', 'Auction Listings')}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({seller.auctionListings.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {seller.auctionListings.slice(0, 9).map((item) => (
                    <Link
                      key={item.id}
                      href={`/auction/${item.id}`}
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-gray-100 relative">
                        {item.images && item.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Gavel className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{item.title}</h3>
                        {item.price && (
                          <div className="text-sm font-semibold text-red-600">
                            {item.currency} {Number(item.price).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {seller.products && seller.products.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  {t('产品展示', 'Products')}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({seller.products.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {seller.products.slice(0, 12).map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.id}`}
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <StoreProductCardImage
                        mainImageUrl={product.mainImageUrl}
                        title={product.title}
                        titleEn={product.titleEn || null}
                        locale={locale}
                      />
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {isZh ? product.title : (product.titleEn || product.title)}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {product.viewCount}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {product.inquiryCount}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Company photo gallery */}
            {seller.companyPhotos && seller.companyPhotos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  {t('公司图片', 'Company Gallery')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {seller.companyPhotos.slice(0, 12).map((photo, idx) => (
                    <a
                      key={idx}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video bg-gray-100 rounded-lg overflow-hidden block hover:opacity-90 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`${seller.companyName} ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Team photos (additional gallery) */}
            {seller.teamPhotos && seller.teamPhotos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {t('团队风采', 'Team Photos')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {seller.teamPhotos.slice(0, 8).map((photo, idx) => (
                    <a
                      key={idx}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden block hover:opacity-90 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`${seller.companyName} team ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right column (sidebar) ─── */}
          <div className="space-y-6">
            {/* Contact / message card */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('联系卖家', 'Contact Seller')}
              </h3>

              {/* Primary contact actions */}
              <div className="space-y-2 mb-4">
                {mergeMultiValues(seller.phone, seller.phones).map((v, i) => (
                  <a key={`phone-${i}`} href={`tel:${v}`} className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {v}
                  </a>
                ))}
                {mergeMultiValues(seller.email, seller.emails).map((v, i) => (
                  <a key={`email-${i}`} href={`mailto:${v}`} className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{v}</span>
                  </a>
                ))}
                {mergeMultiValues(seller.website, seller.websites).map((v, i) => (
                  <a key={`website-${i}`} href={v} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{v}</span>
                  </a>
                ))}
              </div>

              {/* Instant messaging contacts */}
              {(seller.whatsapp || seller.wechat || seller.telegram || seller.qq) && (
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="text-xs text-gray-500 mb-2">{t('即时通讯', 'Instant Messaging')}</div>
                  <div className="space-y-1.5">
                    {seller.whatsapp && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-16 text-gray-400">WhatsApp</span>
                        <span className="font-medium">{seller.whatsapp}</span>
                      </div>
                    )}
                    {seller.wechat && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-16 text-gray-400">{isZh ? '微信' : 'WeChat'}</span>
                        <span className="font-medium">{seller.wechat}</span>
                      </div>
                    )}
                    {seller.telegram && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-16 text-gray-400">Telegram</span>
                        <span className="font-medium">{seller.telegram}</span>
                      </div>
                    )}
                    {seller.qq && (
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="w-16 text-gray-400">QQ</span>
                        <span className="font-medium">{seller.qq}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social media */}
              {socials.length > 0 && (
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="text-xs text-gray-500 mb-2">{t('社交媒体', 'Social Media')}</div>
                  <div className="flex gap-2">
                    {socials.map(({ key, url, Icon }) => (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Booth reference */}
              {seller.boothName && (
                <div className="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                  {t('展位号', 'Booth')}:
                  <span className="font-semibold ml-1">{seller.boothName}</span>
                </div>
              )}
            </div>

            {/* Certificate files */}
            {seller.verificationFiles && seller.verificationFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  {t('证书与认证', 'Certificates')}
                </h3>
                <div className="space-y-2">
                  {seller.verificationFiles.map((file) => (
                    <a
                      key={file.id}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm line-clamp-1">
                            {file.certificateName || file.fileName}
                          </div>
                          {file.issuingAuthority && (
                            <div className="text-xs text-gray-500">{file.issuingAuthority}</div>
                          )}
                          {file.expiryDate && (
                            <div className="text-xs text-gray-400">
                              {t('有效期至', 'Valid until')}: {file.expiryDate}
                            </div>
                          )}
                        </div>
                        {file.isVerified && (
                          <span className="flex-shrink-0 text-xs text-green-600 flex items-center">
                            <FileCheck className="w-3 h-3 mr-0.5" />
                            {t('已验证', 'Verified')}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Brochures */}
            {seller.storeBrochures && seller.storeBrochures.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  {t('店铺画册', 'Brochures')}
                </h3>
                <div className="space-y-3">
                  {seller.storeBrochures.map((brochure) => (
                    <a
                      key={brochure.id}
                      href={brochure.fileName}
                      download
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 mb-1 line-clamp-1 text-sm">
                        {brochure.title}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{(brochure.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {brochure.downloadCount}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('店铺统计', 'Store Stats')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('产品数量', 'Products')}</span>
                  <span className="font-semibold text-gray-900">{seller.products?.length || 0}</span>
                </div>
                {seller.booths && seller.booths.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{t('展会数量', 'Exhibitions')}</span>
                    <span className="font-semibold text-gray-900">{seller.booths.length}</span>
                  </div>
                )}
                {seller.auctionListings && seller.auctionListings.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{t('挂卖产品', 'Auctions')}</span>
                    <span className="font-semibold text-gray-900">{seller.auctionListings.length}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{t('加入时间', 'Joined')}</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {new Date(seller.createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget - pass seller's userId to detect self-chat */}
      <ChatWidget sellerId={seller.id} sellerUserId={seller.userId} />
    </div>
  )
}
