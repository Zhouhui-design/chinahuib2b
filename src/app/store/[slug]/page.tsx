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
  Facebook, Instagram, Linkedin, Youtube, Twitter,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { languages } from '@/lib/languages'
import { detectLocale, getLocalizedDescription } from '@/lib/server-locale'
import { isValidSlug } from '@/lib/store-slug'
import ChatWidget from '@/components/chat/ChatWidget'
import { StoreSchema, BreadcrumbSchema } from '@/components/seo/StructuredData'
import { StoreBanner, StoreLogo, StoreProductCardImage } from '@/components/stores/StoreImageWrappers'

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
    { key: 'facebook', url: seller.facebook, Icon: Facebook },
    { key: 'instagram', url: seller.instagram, Icon: Instagram },
    { key: 'linkedin', url: seller.linkedin, Icon: Linkedin },
    { key: 'youtube', url: seller.youtube, Icon: Youtube },
    { key: 'twitter', url: seller.twitter, Icon: Twitter },
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
                {seller.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${seller.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                      {seller.phone}
                    </a>
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${seller.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                      {seller.email}
                    </a>
                  </div>
                )}
                {seller.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <a
                      href={seller.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 truncate"
                    >
                      {seller.website}
                    </a>
                  </div>
                )}
                {seller.contactName && (
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{seller.contactName}</span>
                  </div>
                )}
              </div>

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
                {seller.phone && (
                  <a href={`tel:${seller.phone}`} className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {seller.phone}
                  </a>
                )}
                {seller.email && (
                  <a href={`mailto:${seller.email}`} className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{seller.email}</span>
                  </a>
                )}
                {seller.website && (
                  <a href={seller.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-700 hover:text-blue-600">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{seller.website}</span>
                  </a>
                )}
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

      {/* Chat Widget */}
      <ChatWidget sellerId={seller.id} />
    </div>
  )
}
