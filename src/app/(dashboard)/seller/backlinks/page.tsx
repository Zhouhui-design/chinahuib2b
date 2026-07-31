'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Code,
  Briefcase,
  Send,
  MessageCircle,
  Mail,
  Link2,
  Clipboard,
  BarChart3
} from 'lucide-react'

interface ShareLink {
  id: string
  url: string
  platform: string
  clicks: number
  createdAt: string
}

interface EmbeddedCode {
  type: 'widget' | 'badge' | 'card'
  code: string
  preview: string
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Share2, color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' },
  { id: 'twitter', name: 'Twitter', icon: Send, color: 'bg-sky-500', hoverColor: 'hover:bg-sky-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Briefcase, color: 'bg-blue-700', hoverColor: 'hover:bg-blue-800' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-600', hoverColor: 'hover:bg-green-700' },
  { id: 'email', name: 'Email', icon: Mail, color: 'bg-gray-600', hoverColor: 'hover:bg-gray-700' },
  { id: 'copy', name: 'Copy Link', icon: Copy, color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700' },
]

export default function BacklinkDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [links, setLinks] = useState<ShareLink[]>([])
  const [embeddedCodes, setEmbeddedCodes] = useState<EmbeddedCode[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalProducts: 0, totalLinks: 0, platforms: 0 })

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'SELLER')) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/seller/backlinks')
      const result = await response.json()

      if (result.success) {
        setLinks(result.shareLinks)
        setEmbeddedCodes(result.embeddedCodes)
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Failed to fetch backlink data:', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SELLER') {
      fetchData()
    }
  }, [status, session])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const productLinks = selectedProduct
    ? links.filter(l => l.id.startsWith(selectedProduct))
    : links.slice(0, 6)

  const productIds = [...new Set(links.map(l => l.id.split('-')[0]))]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔗 Backlink Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Generate share links and embed codes to promote your products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Share Links</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalLinks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Platforms</p>
                <p className="text-2xl font-bold text-purple-600">{stats.platforms}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-500" />
              Share Links
            </h2>

            {productIds.length > 0 && (
              <div className="mb-4">
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">All Products</option>
                  {productIds.map(id => (
                    <option key={id} value={id}>Product #{id.slice(-8)}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              {productLinks.map((link) => {
                const platform = PLATFORMS.find(p => p.id === link.platform)
                const Icon = platform?.icon || Link2

                return (
                  <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => copyToClipboard(link.url, link.id)}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${platform?.color} ${platform?.hoverColor} text-white transition`}
                    >
                      {copiedId === link.id ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{platform?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <button
                      onClick={() => window.open(link.url, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
              {productLinks.length === 0 && (
                <p className="text-gray-500 text-center py-8">No share links available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              Embed Codes
            </h2>

            <div className="space-y-4">
              {embeddedCodes.map((code, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                    <span className="text-sm font-medium text-gray-700">
                      {code.type === 'card' && 'Product Card'}
                      {code.type === 'badge' && 'CTA Badge'}
                      {code.type === 'widget' && 'Widget'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(code.code, `code-${index}`)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      {copiedId === `code-${index}` ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                      {copiedId === `code-${index}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                      {code.code}
                    </pre>
                  </div>
                </div>
              ))}
              {embeddedCodes.length === 0 && (
                <p className="text-gray-500 text-center py-8">No embed codes available</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">💡 Tips for Better Backlinks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <div>
                <p className="font-medium">Share on Social Media</p>
                <p className="text-sm text-blue-100">Promote your products on social platforms to drive traffic</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <p className="font-medium">Embed on Your Website</p>
                <p className="text-sm text-blue-100">Use embed codes to showcase products on your own site</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <p className="font-medium">Email Marketing</p>
                <p className="text-sm text-blue-100">Include product links in your email newsletters</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">4</span>
              <div>
                <p className="font-medium">Track Performance</p>
                <p className="text-sm text-blue-100">Monitor clicks and optimize your link placement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
