'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  MapPin, Calendar, Tag, Phone, Mail, Globe, ChevronLeft,
  ChevronRight, ShoppingCart, Share2, Heart, MessageCircle,
  Check, X, Star, Truck, Shield, Award, Users, Clock, Package,
  Building2, ExternalLink, Loader2, ArrowLeft, Copy, CheckCircle2,
  Layers, Ruler, Box, Hash, Weight, Edit3, MessageSquare, Briefcase,
  Linkedin, Facebook, Instagram, Youtube, Twitter, Video, Book
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  title: string
  titleEn?: string
  titles?: { [key: string]: string }
  description?: string
  descriptions?: { [key: string]: string }
  specifications?: {
    color?: string
    size?: string
    material?: string
    model?: string
    code?: string
    hsCode?: string
    weight?: string
    packageSize?: string
    packageVolume?: string
    customizable?: boolean
    oem?: boolean
    odm?: boolean
    minOrderQty?: string
    supplyCapacity?: string
    [key: string]: any
  }
  mainImageUrl: string
  images: string[]
  category?: {
    id?: string
    name: string
    nameEn?: string
  }
  viewCount: number
  inquiryCount: number
  minOrderQty?: number
  supplyCapacity?: string
  hasBrochure?: boolean
}

interface Booth {
  id: string
  name: string
  names?: { [key: string]: string }
  exhibitionName: string
  exhibitionDates?: { start: string; end: string }
  location?: string
  logoUrl?: string
  bannerUrl?: string
  keywords?: string[]
  theme?: string
  layout?: string
  isActive: boolean
  isPublished: boolean
  createdAt: string
  seller: {
    id: string
    userId: string
    companyName: string
    companyType?: string
    country: string
    city: string
    address?: string
    phone?: string
    email?: string
    website?: string
    // Social media
    whatsapp?: string
    wechat?: string
    telegram?: string
    linkedin?: string
    facebook?: string
    instagram?: string
    youtube?: string
    tiktok?: string
    twitter?: string
    pinterest?: string
    douyin?: string
    xiaohongshu?: string
    qq?: string
    dingtalk?: string
    lark?: string
    wechatVideo?: string
    weibo?: string
    kuaishou?: string
    bilibili?: string
    reddit?: string
    snapchat?: string
    tumblr?: string
    chatSystem?: string
    // Organization info
    organizationType?: string
    registeredCapital?: string
    registeredAddress?: string
    businessAddress?: string
    employeeCount?: string
    patents?: string[]
    awards?: string[]
    foundingYear?: string
    businessScope?: string
    legalRepresentative?: string
    registrationNumber?: string
    bankAccount?: string
    taxNumber?: string
    // Media
    logoUrl?: string
    bannerUrl?: string
    companyPhotos?: string[]
    teamPhotos?: string[]
    // Map
    mapLatitude?: number
    mapLongitude?: number
    mapAddress?: string
    // Description
    description?: string
    descriptions?: { [key: string]: string }
    certifications?: string[]
    isVerified?: boolean
    // Verification files
    verificationFiles?: {
      id: string
      fileType: string
      fileName: string
      fileUrl: string
      certificateName?: string
      certificateNumber?: string
      issuingAuthority?: string
      issueDate?: string
      expiryDate?: string
      isVerified: boolean
    }[]
  }
  products: Product[]
}

const CHAT_API_BASE = (process.env['NEXT_PUBLIC_CHAT_API_URL'] as string) || 'https://chat.x2xhub.com'
const CHAT_TENANT = (process.env['NEXT_PUBLIC_CHAT_TENANT'] as string) || 'chinahuib2b'

export default function BoothDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [booth, setBooth] = useState<Booth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [boothId, setBoothId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    params.then(({ id }) => setBoothId(id))
  }, [params])

  useEffect(() => {
    if (!boothId) return
    fetchBooth()
  }, [boothId])

  const fetchBooth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/exhibitions?id=${boothId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch booth data')
      }
      const data = await res.json()
      if (data.booth) {
        setBooth(data.booth)
        updateSEOMeta(data.booth)
      } else {
        throw new Error(data.error || 'Booth not found')
      }
    } catch (err) {
      console.error('Fetch booth error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load booth')
    } finally {
      setLoading(false)
    }
  }

  const updateSEOMeta = (boothData: Booth) => {
    if (typeof document === 'undefined') return

    const pageTitle = `${boothData.name} - ${boothData.seller?.companyName || 'Exhibition Booth'}`
    const pageDescription = `Explore ${boothData.name} by ${boothData.seller?.companyName || ''}. View products, contact the exhibitor, and more at Global Expo.`
    
    document.title = pageTitle

    const setMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    const setProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    setMeta('description', pageDescription)
    
    if (boothData.keywords && boothData.keywords.length > 0) {
      setMeta('keywords', boothData.keywords.join(', '))
    }

    setProperty('og:title', pageTitle)
    setProperty('og:description', pageDescription)
    setProperty('og:type', 'website')
    if (boothData.bannerUrl) {
      setProperty('og:image', boothData.bannerUrl)
    }

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', pageTitle)
    setMeta('twitter:description', pageDescription)
    if (boothData.bannerUrl) {
      setMeta('twitter:image', boothData.bannerUrl)
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ExhibitionEvent',
      name: boothData.name,
      description: pageDescription,
      image: boothData.bannerUrl || '',
      organizer: {
        '@type': 'Organization',
        name: boothData.seller?.companyName || '',
        address: {
          '@type': 'PostalAddress',
          addressLocality: boothData.seller?.city || '',
          addressCountry: boothData.seller?.country || '',
          streetAddress: boothData.seller?.address || '',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: boothData.seller?.email || '',
          telephone: boothData.seller?.phone || '',
        },
      },
      location: {
        '@type': 'Place',
        name: boothData.location || `${boothData.seller?.city || ''}, ${boothData.seller?.country || ''}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: boothData.seller?.city || '',
          addressCountry: boothData.seller?.country || '',
        },
      },
      keywords: boothData.keywords?.join(', ') || '',
      offers: {
        '@type': 'AggregateOffer',
        offerCount: boothData.products?.length || 0,
      },
    }

    let script = document.getElementById('booth-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.id = 'booth-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        const shareData: { title: string; text?: string; url: string } = {
          title: booth?.name || 'Exhibition Booth',
          url,
        }
        if (booth?.exhibitionName) shareData.text = booth.exhibitionName
        await navigator.share(shareData)
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {}
    }
  }

  const handleChat = () => {
    if (!session) {
      const callbackUrl = window.location.pathname
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }
    openFullChat()
  }

  // 打开 chat-system 与展商进行实时沟通
  const openFullChat = async () => {
    if (!booth) return

    // 未登录:直接打开 chat-system(用户可在那边登录或注册)
    if (!session) {
      const url = `${CHAT_API_BASE}/?tenant=${CHAT_TENANT}&target=${booth.seller.id}&targetName=${encodeURIComponent(booth.seller.companyName)}&booth=${booth.id}`
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    // 已登录:通过 API 获取带 token 的聊天 URL
    try {
      const res = await fetch(`/api/booths/${booth.id}/chat-token`)
      if (res.ok) {
        const data = await res.json()
        if (data.chatUrl) {
          window.open(data.chatUrl, '_blank', 'noopener,noreferrer')
          return
        }
      }
    } catch (err) {
      console.error('Failed to get chat token:', err)
    }

    // Fallback: 打开不带 token 的 URL
    const url = `${CHAT_API_BASE}/?tenant=${CHAT_TENANT}&target=${booth.seller.id}&targetName=${encodeURIComponent(booth.seller.companyName)}&booth=${booth.id}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading exhibition booth...</p>
        </div>
      </div>
    )
  }

  if (error || !booth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booth Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The booth you are looking for does not exist.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Exhibition Hall
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-green-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-1" />
                  Share Booth
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Booth Header Banner */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          {booth.bannerUrl ? (
            <img
              src={booth.bannerUrl}
              alt="Booth Banner"
              className="w-full h-full object-cover opacity-40"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-indigo-700/80 to-purple-800/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {booth.logoUrl ? (
                <img
                  src={booth.logoUrl}
                  alt={booth.name}
                  className="h-24 w-24 rounded-xl object-contain bg-white p-2 shadow-xl"
                />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-white p-3 shadow-xl flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-blue-600" />
                </div>
              )}
            </div>

            {/* Booth Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{booth.name}</h1>
                {booth.seller.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xl text-blue-100 mb-3">{booth.exhibitionName}</p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-blue-100">
                {booth.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {booth.location}
                  </div>
                )}
                {booth.exhibitionDates?.start && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {booth.exhibitionDates.start}
                    {booth.exhibitionDates.end && booth.exhibitionDates.end !== booth.exhibitionDates.start && (
                      <> - {booth.exhibitionDates.end}</>
                    )}
                  </div>
                )}
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {booth.products.length} Products
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booth.seller.city}, {booth.seller.country}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={handleChat}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {session ? 'Chat with Exhibitor' : 'Login to Chat'}
              </button>
              <button
                onClick={openFullChat}
                className="inline-flex items-center justify-center px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Full Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Trade Assurance</p>
                <p className="text-sm font-semibold text-gray-900">Protected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verified Supplier</p>
                <p className="text-sm font-semibold text-gray-900">
                  {booth.seller.isVerified ? 'Yes' : 'Pending'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Global Shipping</p>
                <p className="text-sm font-semibold text-gray-900">Available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Quick Response</p>
                <p className="text-sm font-semibold text-gray-900">24/7 Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Company Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  {booth.seller.logoUrl ? (
                    <img
                      src={booth.seller.logoUrl}
                      alt={booth.seller.companyName}
                      className="w-14 h-14 rounded-lg object-contain bg-gray-50 p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{booth.seller.companyName}</h3>
                    {booth.seller.companyType && (
                      <p className="text-sm text-gray-500">{booth.seller.companyType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{booth.seller.city}, {booth.seller.country}</span>
                  </p>
                  {booth.seller.address && (
                    <p className="text-gray-600 pl-6 text-xs">{booth.seller.address}</p>
                  )}
                </div>

                {booth.seller.certifications && booth.seller.certifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {booth.seller.certifications.map((cert, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleChat}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {session ? 'Chat Now' : 'Login to Chat'}
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                Contact Information
              </h3>

              {session ? (
                <div className="space-y-3 text-sm">
                  {booth.seller.phone && (
                    <a
                      href={`tel:${booth.seller.phone}`}
                      className="flex items-center text-gray-700 hover:text-blue-600 group"
                    >
                      <Phone className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                      <span className="truncate">{booth.seller.phone}</span>
                    </a>
                  )}
                  {booth.seller.email && (
                    <a
                      href={`mailto:${booth.seller.email}`}
                      className="flex items-center text-gray-700 hover:text-blue-600 group"
                    >
                      <Mail className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                      <span className="truncate">{booth.seller.email}</span>
                    </a>
                  )}
                  {booth.seller.website && (
                    <a
                      href={booth.seller.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-600 group"
                    >
                      <Globe className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                      <span className="truncate">{booth.seller.website}</span>
                    </a>
                  )}
                  {booth.seller.whatsapp && (
                    <div className="flex items-center text-gray-700">
                      <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="truncate">WhatsApp: {booth.seller.whatsapp}</span>
                    </div>
                  )}
                  {booth.seller.wechat && (
                    <div className="flex items-center text-gray-700">
                      <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="truncate">WeChat: {booth.seller.wechat}</span>
                    </div>
                  )}
                  {booth.seller.linkedin && (
                    <a
                      href={booth.seller.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-600 group"
                    >
                      <Briefcase className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-sm text-gray-500 mb-3">Login to view full contact details</p>
                  <Link
                    href={`/auth/login?callbackUrl=/exhibitions/${booth.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Login Now
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Booth Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Products</span>
                  <span className="font-semibold text-gray-900">{booth.products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="font-semibold text-gray-900">
                    {booth.products.reduce((sum, p) => sum + (p.viewCount || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Inquiries</span>
                  <span className="font-semibold text-gray-900">
                    {booth.products.reduce((sum, p) => sum + (p.inquiryCount || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'products'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Products ({booth.products.length})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'about'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  About Company
                </button>
              </div>

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="p-6">
                  {booth.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {booth.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onClick={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No products available in this booth yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="p-6 space-y-6">
                  {/* Company Logo & Banner */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {booth.seller.bannerUrl && (
                      <img
                        src={booth.seller.bannerUrl}
                        alt="Company Banner"
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4 flex items-center gap-4 bg-white">
                      {booth.seller.logoUrl ? (
                        <img
                          src={booth.seller.logoUrl}
                          alt={booth.seller.companyName}
                          className="w-20 h-20 rounded-lg object-contain bg-gray-50"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{booth.seller.companyName}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          {booth.seller.companyType && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {booth.seller.companyType}
                            </span>
                          )}
                          {booth.seller.isVerified && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Profile Description */}
                  {booth.seller.description && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                        Company Profile
                      </h3>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: booth.seller.description }}
                      />
                    </div>
                  )}

                  {/* Basic Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {booth.seller.phone && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <Phone className="w-4 h-4 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{booth.seller.phone}</p>
                      </div>
                    )}
                    {booth.seller.email && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <Mail className="w-4 h-4 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{booth.seller.email}</p>
                      </div>
                    )}
                    {booth.seller.website && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <Globe className="w-4 h-4 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Website</p>
                        <a href={booth.seller.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 truncate hover:underline">
                          {booth.seller.website}
                        </a>
                      </div>
                    )}
                    {booth.seller.address && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <MapPin className="w-4 h-4 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{booth.seller.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Organization Information */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        Organization Information
                      </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {booth.seller.organizationType && (
                        <InfoRow label="Organization Type" value={booth.seller.organizationType} />
                      )}
                      {booth.seller.foundingYear && (
                        <InfoRow label="Founding Year" value={booth.seller.foundingYear} />
                      )}
                      {booth.seller.registeredCapital && (
                        <InfoRow label="Registered Capital" value={booth.seller.registeredCapital} />
                      )}
                      {booth.seller.legalRepresentative && (
                        <InfoRow label="Legal Representative" value={booth.seller.legalRepresentative} />
                      )}
                      {booth.seller.registrationNumber && (
                        <InfoRow label="Registration Number" value={booth.seller.registrationNumber} />
                      )}
                      {booth.seller.taxNumber && (
                        <InfoRow label="Tax Number" value={booth.seller.taxNumber} />
                      )}
                      {booth.seller.bankAccount && (
                        <InfoRow label="Bank Account" value={booth.seller.bankAccount} />
                      )}
                      {booth.seller.employeeCount && (
                        <InfoRow label="Employee Count" value={booth.seller.employeeCount} />
                      )}
                      {booth.seller.businessScope && (
                        <InfoRow label="Business Scope" value={booth.seller.businessScope} />
                      )}
                      {booth.seller.registeredAddress && (
                        <InfoRow label="Registered Address" value={booth.seller.registeredAddress} />
                      )}
                      {booth.seller.businessAddress && (
                        <InfoRow label="Business Address" value={booth.seller.businessAddress} />
                      )}
                    </div>
                  </div>

                  {/* Social Media */}
                  {booth.seller.whatsapp || booth.seller.wechat || booth.seller.telegram || booth.seller.linkedin || 
                   booth.seller.facebook || booth.seller.instagram || booth.seller.youtube || booth.seller.tiktok ||
                   booth.seller.twitter || booth.seller.pinterest || booth.seller.douyin || booth.seller.xiaohongshu ||
                   booth.seller.qq || booth.seller.dingtalk || booth.seller.lark || booth.seller.wechatVideo ||
                   booth.seller.weibo || booth.seller.kuaishou || booth.seller.bilibili || booth.seller.reddit ||
                   booth.seller.snapchat || booth.seller.tumblr || booth.seller.chatSystem && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          Social Media
                        </h3>
                      </div>
                      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {booth.seller.whatsapp && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">WhatsApp: {booth.seller.whatsapp}</span>
                          </div>
                        )}
                        {booth.seller.wechat && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700">WeChat: {booth.seller.wechat}</span>
                          </div>
                        )}
                        {booth.seller.telegram && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">Telegram: {booth.seller.telegram}</span>
                          </div>
                        )}
                        {booth.seller.linkedin && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-blue-700" />
                            <a href={booth.seller.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">LinkedIn</a>
                          </div>
                        )}
                        {booth.seller.facebook && (
                          <div className="flex items-center gap-2 text-sm">
                            <Facebook className="w-4 h-4 text-blue-800" />
                            <a href={booth.seller.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-600">Facebook</a>
                          </div>
                        )}
                        {booth.seller.instagram && (
                          <div className="flex items-center gap-2 text-sm">
                            <Instagram className="w-4 h-4 text-pink-600" />
                            <a href={booth.seller.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-600">Instagram</a>
                          </div>
                        )}
                        {booth.seller.youtube && (
                          <div className="flex items-center gap-2 text-sm">
                            <Youtube className="w-4 h-4 text-red-600" />
                            <a href={booth.seller.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-red-600">YouTube</a>
                          </div>
                        )}
                        {booth.seller.tiktok && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-black" />
                            <a href={booth.seller.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">TikTok</a>
                          </div>
                        )}
                        {booth.seller.twitter && (
                          <div className="flex items-center gap-2 text-sm">
                            <Twitter className="w-4 h-4 text-sky-500" />
                            <a href={booth.seller.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-sky-500">Twitter</a>
                          </div>
                        )}
                        {booth.seller.pinterest && (
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="w-4 h-4 text-red-600" />
                            <a href={booth.seller.pinterest} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-red-600">Pinterest</a>
                          </div>
                        )}
                        {booth.seller.douyin && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="w-4 h-4 text-black" />
                            <span className="text-gray-700">Douyin: {booth.seller.douyin}</span>
                          </div>
                        )}
                        {booth.seller.xiaohongshu && (
                          <div className="flex items-center gap-2 text-sm">
                            <Book className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-700">Xiaohongshu: {booth.seller.xiaohongshu}</span>
                          </div>
                        )}
                        {booth.seller.qq && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">QQ: {booth.seller.qq}</span>
                          </div>
                        )}
                        {booth.seller.dingtalk && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">DingTalk: {booth.seller.dingtalk}</span>
                          </div>
                        )}
                        {booth.seller.lark && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700">Lark: {booth.seller.lark}</span>
                          </div>
                        )}
                        {booth.seller.wechatVideo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="w-4 h-4 text-green-600" />
                            <a href={booth.seller.wechatVideo} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-600">WeChat Video</a>
                          </div>
                        )}
                        {booth.seller.weibo && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-red-600" />
                            <a href={booth.seller.weibo} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-red-600">Weibo</a>
                          </div>
                        )}
                        {booth.seller.kuaishou && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="w-4 h-4 text-orange-600" />
                            <span className="text-gray-700">Kuaishou: {booth.seller.kuaishou}</span>
                          </div>
                        )}
                        {booth.seller.bilibili && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="w-4 h-4 text-pink-600" />
                            <a href={booth.seller.bilibili} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-600">Bilibili</a>
                          </div>
                        )}
                        {booth.seller.reddit && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-orange-600" />
                            <a href={booth.seller.reddit} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-600">Reddit</a>
                          </div>
                        )}
                        {booth.seller.snapchat && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-yellow-500" />
                            <a href={booth.seller.snapchat} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-yellow-600">Snapchat</a>
                          </div>
                        )}
                        {booth.seller.tumblr && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <a href={booth.seller.tumblr} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-400">Tumblr</a>
                          </div>
                        )}
                        {booth.seller.chatSystem && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-700">Chat System: {booth.seller.chatSystem}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {booth.seller.certifications && booth.seller.certifications.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-600" />
                          Certifications
                        </h3>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {booth.seller.certifications.map((cert, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patents & Awards */}
                  {(booth.seller.patents?.length > 0 || booth.seller.awards?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-blue-600" />
                          Patents & Awards
                        </h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {booth.seller.patents?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Patents:</p>
                            <div className="flex flex-wrap gap-2">
                              {booth.seller.patents.map((patent, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                                  {patent}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {booth.seller.awards?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Awards & Honors:</p>
                            <div className="flex flex-wrap gap-2">
                              {booth.seller.awards.map((award, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                                  {award}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Company Certificates */}
                  {booth.seller.verificationFiles?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-blue-600" />
                          Verified Certificates & Documents
                        </h3>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {booth.seller.verificationFiles.map((cert) => (
                          <div key={cert.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start gap-3 mb-3">
                              {cert.fileUrl && (
                                <img
                                  src={cert.fileUrl}
                                  alt={cert.certificateName || cert.fileName}
                                  className="w-20 h-20 object-cover rounded-lg border"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {cert.certificateName || cert.fileType || 'Certificate'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{cert.fileName}</p>
                              </div>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              {cert.certificateNumber && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Certificate No:</span>
                                  <span className="text-gray-700 font-medium">{cert.certificateNumber}</span>
                                </div>
                              )}
                              {cert.issuingAuthority && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Issued by:</span>
                                  <span className="text-gray-700 font-medium">{cert.issuingAuthority}</span>
                                </div>
                              )}
                              {cert.issueDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Issue Date:</span>
                                  <span className="text-gray-700 font-medium">{cert.issueDate}</span>
                                </div>
                              )}
                              {cert.expiryDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Expiry Date:</span>
                                  <span className={`font-medium ${new Date(cert.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                                    {cert.expiryDate}
                                    {new Date(cert.expiryDate) < new Date() && ' (Expired)'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                              <span className="text-xs text-green-600 flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                              {cert.fileUrl && (
                                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View Full
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Photos */}
                  {booth.seller.companyPhotos?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Company Photos</h3>
                      </div>
                      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {booth.seller.companyPhotos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Company photo ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Photos */}
                  {booth.seller.teamPhotos?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Team Photos</h3>
                      </div>
                      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {booth.seller.teamPhotos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Team photo ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Map Location */}
                  {booth.seller.mapAddress && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                          Company Location
                        </h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-700 mb-3">{booth.seller.mapAddress}</p>
                        {booth.seller.mapLatitude && booth.seller.mapLongitude && (
                          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                            <iframe
                              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(booth.seller.mapAddress)}&center=${booth.seller.mapLatitude},${booth.seller.mapLongitude}&zoom=15`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          sellerName={booth.seller.companyName}
          onClose={() => setSelectedProduct(null)}
          onChat={handleChat}
          isLoggedIn={!!session}
        />
      )}
    </div>
  )
}

// ============= Product Card Component =============
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all text-left group"
    >
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Package className="w-12 h-12" />
          </div>
        )}
        {product.specifications?.customizable && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
            Customizable
          </span>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 min-h-[2.5rem]">
          {product.title}
        </h4>
        {product.category && (
          <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          {product.minOrderQty && (
            <span>MOQ: {product.minOrderQty}</span>
          )}
          <span className="inline-flex items-center text-blue-600 group-hover:underline">
            Details <ChevronRight className="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    </button>
  )
}

// ============= Product Detail Modal =============
function ProductDetailModal({
  product,
  sellerName,
  onClose,
  onChat,
  isLoggedIn,
}: {
  product: Product
  sellerName: string
  onClose: () => void
  onChat: () => void
  isLoggedIn: boolean
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allImages = [product.mainImageUrl, ...(product.images || [])].filter(Boolean)
  const specs = product.specifications || {}

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }
  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{product.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative mb-3">
                {allImages[currentImageIndex] ? (
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-16 h-16" />
                  </div>
                )}

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && allImages.length <= 6 && (
                <div className="grid grid-cols-6 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex
                          ? 'border-blue-500'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* Category & Stats */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {product.category.name}
                  </span>
                )}
                {specs.customizable && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    ✓ Customizable
                  </span>
                )}
                {specs.oem && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    OEM
                  </span>
                )}
                {specs.odm && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    ODM
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {product.viewCount || 0} views
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {product.inquiryCount || 0} inquiries
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Order Info */}
              {(product.minOrderQty || product.supplyCapacity) && (
                <div className="bg-blue-50 rounded-lg p-3 space-y-1.5">
                  {product.minOrderQty && (
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Min Order: <span className="font-semibold">{product.minOrderQty}</span></span>
                    </div>
                  )}
                  {product.supplyCapacity && (
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Supply Capacity: <span className="font-semibold">{product.supplyCapacity}</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Specifications Section */}
          {Object.keys(specs).length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                <Ruler className="w-4 h-4 mr-2 text-blue-600" />
                Product Specifications
              </h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-gray-200">
                  {specs.color && (
                    <SpecRow icon={<Box className="w-4 h-4" />} label="Color (颜色)" value={specs.color} />
                  )}
                  {specs.size && (
                    <SpecRow icon={<Ruler className="w-4 h-4" />} label="Size / Specification (规格)" value={specs.size} />
                  )}
                  {specs.material && (
                    <SpecRow icon={<Layers className="w-4 h-4" />} label="Material (材质)" value={specs.material} />
                  )}
                  {specs.model && (
                    <SpecRow icon={<Hash className="w-4 h-4" />} label="Model (型号)" value={specs.model} />
                  )}
                  {specs.code && (
                    <SpecRow icon={<Hash className="w-4 h-4" />} label="Product Code (编码)" value={specs.code} />
                  )}
                  {specs.hsCode && (
                    <SpecRow icon={<Hash className="w-4 h-4" />} label="HS Code (海关编码)" value={specs.hsCode} />
                  )}
                  {specs.weight && (
                    <SpecRow icon={<Weight className="w-4 h-4" />} label="Net Weight (单重)" value={specs.weight} />
                  )}
                  {specs.packageSize && (
                    <SpecRow icon={<Box className="w-4 h-4" />} label="Package Size (标准包装尺寸)" value={specs.packageSize} />
                  )}
                  {specs.packageVolume && (
                    <SpecRow icon={<Box className="w-4 h-4" />} label="Package Volume (标准包装体积)" value={specs.packageVolume} />
                  )}
                  {specs.minOrderQty && (
                    <SpecRow icon={<Package className="w-4 h-4" />} label="Min Order Qty (起订量)" value={specs.minOrderQty} />
                  )}
                  {specs.supplyCapacity && (
                    <SpecRow icon={<Globe className="w-4 h-4" />} label="Supply Capacity (供应能力)" value={specs.supplyCapacity} />
                  )}
                </div>

                {/* Boolean Specifications */}
                <div className="px-4 py-3 border-t border-gray-200 bg-white grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <BooleanSpec label="Customizable (可定制)" value={!!specs.customizable} />
                  <BooleanSpec label="OEM" value={!!specs.oem} />
                  <BooleanSpec label="ODM" value={!!specs.odm} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Sticky */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-600 truncate">
            Sold by <span className="font-semibold text-gray-900">{sellerName}</span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={onChat}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isLoggedIn ? 'Contact Seller' : 'Login to Contact'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b md:border-b-0 md:border-r last:border-r-0 border-gray-200">
      <div className="flex items-center text-gray-500 text-sm">
        <span className="mr-2">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900 text-right ml-2 truncate max-w-[60%]">
        {value}
      </div>
    </div>
  )
}

function BooleanSpec({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center text-sm">
      {value ? (
        <Check className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 mr-1.5 flex-shrink-0" />
      )}
      <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
        {label}
      </span>
    </div>
  )
}

// Info Row component for About Company section
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 text-right">{value}</p>
    </div>
  )
}
