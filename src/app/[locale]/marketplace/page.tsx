/**
 * Marketplace / Task Hall Page
 * A place where anyone or any AI can post and complete business tasks
 */

'use client'

import { useState, useEffect } from 'react'
  import { useParams } from 'next/navigation'
  import Link from 'next/link'
  import type { LanguageCode } from '@/lib/languages'
  import { dictionaries } from '@/locales/dictionary'
  import { MessageCircle, Heart, Eye, Image, Video, FileText, Link2, Phone, Globe, MapPin, TrendingUp, Building2, DollarSign, ArrowUpRight, Shield } from 'lucide-react'
  import { COUNTRIES, getCountryFlag, getCountryName } from '@/lib/geo-location'

// Sample task data (will be replaced with real API calls)
const sampleTasks = [
  {
    id: 'task-001',
    type: 'manufacturing',
    title: 'Looking for Factory to Produce 5000 Wireless Earbuds',
    description: 'Need a reliable manufacturer to produce high-quality wireless earbuds with noise cancellation. Specifications provided.',
    budget: 50000,
    currency: 'USD',
    deadline: '2026-06-30',
    postedBy: 'TechCorp Inc.',
    postedAt: '2026-05-20',
    status: 'open',
    applications: 3,
  },
  {
    id: 'task-002',
    type: 'product_sale',
    title: 'Selling 1000 Units of Bluetooth Speakers - Bulk Discount Available',
    description: 'High-quality portable Bluetooth speakers. Waterproof, 12-hour battery life. Perfect for retailers.',
    price: 15.99,
    currency: 'USD',
    minOrderQty: 100,
    postedBy: 'AudioMax Electronics',
    postedAt: '2026-05-19',
    status: 'open',
    views: 45,
  },
  {
    id: 'task-003',
    type: 'service',
    title: 'Offering Product Photography Services for E-commerce',
    description: 'Professional product photography studio. High-resolution images, white background, multiple angles. Fast turnaround.',
    price: 50,
    currency: 'USD',
    unit: 'per product',
    postedBy: 'PhotoPro Studio',
    postedAt: '2026-05-18',
    status: 'open',
    rating: 4.8,
  },
  {
    id: 'task-004',
    type: 'manufacturing',
    title: 'Seeking Supplier for Organic Cotton T-Shirts',
    description: 'Looking for manufacturer of organic cotton t-shirts. Need 2000 units per month. Various sizes and colors.',
    budget: 30000,
    currency: 'USD',
    deadline: '2026-07-15',
    postedBy: 'EcoFashion Ltd.',
    postedAt: '2026-05-17',
    status: 'open',
    applications: 7,
  },
  {
    id: 'task-005',
    type: 'product_sale',
    title: 'Wholesale LED Desk Lamps - Energy Efficient',
    description: 'Modern LED desk lamps with adjustable brightness. USB charging port. Perfect for offices and homes.',
    price: 12.50,
    currency: 'USD',
    minOrderQty: 50,
    postedBy: 'BrightLight Co.',
    postedAt: '2026-05-16',
    status: 'open',
    views: 32,
  },
]

const taskTypes = [
  { value: 'all', icon: '📋', key: 'all' },
  { value: 'manufacturing', icon: '🏭', key: 'manufacturing' },
  { value: 'product_sale', icon: '🛍️', key: 'productSale' },
  { value: 'service', icon: '🔧', key: 'service' },
]

const topicCategories = [
  { value: 'all', label: { zh: '全部', en: 'All', ja: 'すべて', ko: '전체' } },
  { value: 'INDUSTRY', label: { zh: '行业讨论', en: 'Industry', ja: '産業', ko: '산업' } },
  { value: 'HOT_TOPIC', label: { zh: '热点话题', en: 'Hot Topic', ja: 'ホットトピック', ko: '핫 토픽' } },
  { value: 'PRODUCT', label: { zh: '产品评价', en: 'Product', ja: '製品', ko: '제품' } },
  { value: 'NEWS', label: { zh: '行业新闻', en: 'News', ja: 'ニュース', ko: '뉴스' } },
  { value: 'RECRUITMENT', label: { zh: '招聘信息', en: 'Recruitment', ja: '採用', ko: '채용' } },
  { value: 'ARTICLE', label: { zh: '文章分享', en: 'Article', ja: '記事', ko: '기사' } },
]

interface Topic {
  id: string
  userId: string
  title: string
  content: string
  category: string
  images: string[]
  videos: string[]
  documents: any[]
  link: string | null
  phone: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    role: string
    sellerProfile: {
      companyName: string | null
      logoUrl: string | null
      isVerified: boolean
    } | null
  }
}

export default function MarketplacePage() {
  const params = useParams()
  const locale = (params['locale'] as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en

  interface Task {
    id: string
    type: 'manufacturing' | 'product_sale' | 'service'
    postedAt: string
    title: string
    description: string
    budget?: number
    price?: number
    currency?: string
    unit?: string
    minOrderQty?: number
    deadline?: string
    applications?: number
    views?: number
    rating?: number
    postedBy?: string
    countryCode?: string
    countryName?: string
  }
  const [tasks, setTasks] = useState<Task[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [activeTab, setActiveTab] = useState<'tasks' | 'topics' | 'financing' | 'investment'>('tasks')
  const [selectedTopicCategory, setSelectedTopicCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [stats, setStats] = useState({
    activeTasks: 0,
    completedTasks: 0,
    participants: 0,
    totalValue: '$0'
  })

  // Fetch marketplace stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/marketplace/stats')
        const data = await response.json()
        
        if (data.success && data.data) {
          setStats({
            activeTasks: data.data.activeTasks || 0,
            completedTasks: data.data.completedTasks || 0,
            participants: data.data.participants || 0,
            totalValue: data.data.totalValue || '$0'
          })
        }
      } catch (error) {
        console.error('Error fetching marketplace stats:', error)
      }
    }
    
    fetchStats()
  }, [])

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          limit: '10',
        })
        
        if (selectedType !== 'all') {
          params.set('type', selectedType.toUpperCase())
        }
        
        if (sortBy === 'budget_high') {
          params.set('sortBy', 'budget')
          params.set('order', 'desc')
        } else if (sortBy === 'budget_low') {
          params.set('sortBy', 'budget')
          params.set('order', 'asc')
        } else if (sortBy === 'applications') {
          params.set('sortBy', 'applications')
          params.set('order', 'desc')
        }
        
        if (selectedCountry !== 'all') {
          params.set('country', selectedCountry)
        }
        
        const response = await fetch(`/api/marketplace/tasks?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setTasks(data.data.tasks)
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [selectedType, sortBy, selectedCountry])

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          limit: '10',
        })
        
        if (selectedTopicCategory !== 'all') {
          params.set('category', selectedTopicCategory)
        }
        
        const response = await fetch(`/api/topics?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setTopics(data.data.topics)
        }
      } catch (error) {
        console.error('Error fetching topics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTopics()
  }, [selectedTopicCategory])

  const getTopicCategoryLabel = (value: string) => {
    const category = topicCategories.find(c => c.value === value)
    return category?.label[locale as keyof typeof category.label] || value
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.marketplace.title}
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              {dict.marketplace.subtitle}
            </p>
            <p className="text-lg mb-6 opacity-80">
              {dict.marketplace.description}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.activeTasks.toLocaleString()}</div>
              <div className="text-gray-600 mt-1">{dict.marketplace.stats.activeTasks}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.completedTasks.toLocaleString()}</div>
              <div className="text-gray-600 mt-1">{dict.marketplace.stats.completed}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.participants.toLocaleString()}</div>
              <div className="text-gray-600 mt-1">{dict.marketplace.stats.participants}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{stats.totalValue}</div>
              <div className="text-gray-600 mt-1">{dict.marketplace.stats.totalValue}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📋 {locale === 'zh' ? '任务大厅' : 'Task Hall'}
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💬 {locale === 'zh' ? '社区话题' : 'Community Topics'}
            </button>
            <button
              onClick={() => setActiveTab('financing')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'financing'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💰 {locale === 'zh' ? '融资服务' : 'Financing'}
            </button>
            <button
              onClick={() => setActiveTab('investment')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'investment'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📈 {locale === 'zh' ? '投资机会' : 'Investment'}
            </button>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'tasks' ? (
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {taskTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                      selectedType === type.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {dict.marketplace.taskTypes[type.key as keyof typeof dict.marketplace.taskTypes]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="all">{(dict.marketplace as any).allCountries || 'All Countries'}</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {getCountryName(country.code, locale)}
                    </option>
                  ))}
                </select>
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">{dict.marketplace.sortBy}</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                  <option value="applications">Most Applications</option>
                </select>
                <Link
                  href={`/${locale}/marketplace/post`}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {dict.marketplace.postTask}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {topicCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedTopicCategory(category.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                      selectedTopicCategory === category.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {getTopicCategoryLabel(category.value)}
                  </button>
                ))}
              </div>
              <Link
                href={`/${locale}/marketplace/topic/post`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'zh' ? '发表话题' : 'Post Topic'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tasks List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">{dict.marketplace.loading}</p>
            </div>
          ) : activeTab === 'tasks' ? (
            tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{dict.marketplace.noTasksFound}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          task.type === 'manufacturing' ? 'bg-blue-100 text-blue-800' :
                          task.type === 'product_sale' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {task.type === 'manufacturing' ? '🏭 ' :
                           task.type === 'product_sale' ? '🛍️ ' : '🔧 '}
                           {task.type === 'manufacturing' ? dict.marketplace.taskTypes.manufacturing :
                           task.type === 'product_sale' ? dict.marketplace.taskTypes.productSale : dict.marketplace.taskTypes.service}
                        </span>
                        {task.countryCode && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            <MapPin className="w-3 h-3" />
                            {getCountryFlag(task.countryCode)} {getCountryName(task.countryCode, locale)}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">Posted {task.postedAt}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6">
                      {task.budget && (
                        <div>
                          <div className="text-sm text-gray-500">{dict.marketplace.budget}</div>
                          <div className="text-lg font-semibold text-green-600">
                            ${task.budget.toLocaleString()} {task.currency}
                          </div>
                        </div>
                      )}
                      {task.price && (
                        <div>
                          <div className="text-sm text-gray-500">{dict.marketplace.price}</div>
                          <div className="text-lg font-semibold text-blue-600">
                            ${task.price} {task.currency}
                            {task.unit && <span className="text-sm text-gray-500">/{task.unit}</span>}
                          </div>
                        </div>
                      )}
                      {task.deadline && (
                        <div>
                          <div className="text-sm text-gray-500">{dict.marketplace.deadline}</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {task.deadline}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{dict.marketplace.postedBy}</div>
                        <div className="font-medium text-gray-900">{task.postedBy}</div>
                      </div>
                      <Link
                        href={`/${locale}/marketplace/${task.id}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {dict.marketplace.viewDetails}
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    {task.applications !== undefined && (
                      <span>📝 {task.applications} {dict.marketplace.applications}</span>
                    )}
                    {task.views !== undefined && (
                      <span>👁️ {task.views} {dict.marketplace.views}</span>
                    )}
                    {task.rating && (
                      <span>⭐ {task.rating} {dict.marketplace.rating}</span>
                    )}
                    {task.minOrderQty && (
                      <span>📦 {dict.marketplace.minOrder}: {task.minOrderQty} units</span>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )
          ) : (
            topics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{locale === 'zh' ? '暂无话题，快来发表第一个话题吧！' : 'No topics yet, be the first to post!'}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={topic.user.avatarUrl || `/api/users/${topic.userId}/avatar`}
                          alt={topic.user.displayName || topic.user.username}
                          className="w-12 h-12 rounded-full object-cover bg-gray-200"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            topic.category === 'INDUSTRY' ? 'bg-blue-100 text-blue-800' :
                            topic.category === 'HOT_TOPIC' ? 'bg-red-100 text-red-800' :
                            topic.category === 'PRODUCT' ? 'bg-green-100 text-green-800' :
                            topic.category === 'NEWS' ? 'bg-yellow-100 text-yellow-800' :
                            topic.category === 'RECRUITMENT' ? 'bg-purple-100 text-purple-800' :
                            topic.category === 'ARTICLE' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getTopicCategoryLabel(topic.category)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(topic.createdAt).toLocaleDateString(locale)}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{topic.content}</p>
                        
                        {topic.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {topic.images.slice(0, 3).map((img, index) => (
                              <img key={index} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                            ))}
                            {topic.images.length > 3 && (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                +{topic.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{topic.viewCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{topic.likeCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{topic.commentCount}</span>
                          </div>
                          {topic.videos.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4 text-purple-500" />
                              <span>{topic.videos.length}</span>
                            </div>
                          )}
                          {topic.documents && (topic.documents as any[]).length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span>{(topic.documents as any[]).length}</span>
                            </div>
                          )}
                          {topic.link && (
                            <div className="flex items-center gap-1">
                              <Link2 className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                          {topic.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-orange-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">
                          {topic.user.displayName || topic.user.username}
                        </span>
                        {topic.user.sellerProfile?.isVerified && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">✓ Verified</span>
                        )}
                      </div>
                      <Link
                        href={`/${locale}/marketplace/topic/${topic.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {locale === 'zh' ? '查看详情' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Financing Section */}
          {activeTab === 'financing' && (
            <div className="space-y-8">
              {/* Financing Options Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <DollarSign className="w-10 h-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '贸易融资' : 'Trade Finance'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'zh' ? '为进出口贸易提供信用证、汇票贴现等金融服务' : 'L/C, bill discounting, and financial services for import/export'}
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✓ {locale === 'zh' ? '信用证开立' : 'Letter of Credit'}</li>
                    <li>✓ {locale === 'zh' ? '打包贷款' : 'Packing Loan'}</li>
                    <li>✓ {locale === 'zh' ? '出口押汇' : 'Export Bill Purchase'}</li>
                  </ul>
                  <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    {locale === 'zh' ? '立即申请' : 'Apply Now'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <Building2 className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '设备融资' : 'Equipment Financing'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'zh' ? '为机械设备、生产线等提供租赁和分期购买方案' : 'Lease and installment plans for machinery and equipment'}
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✓ {locale === 'zh' ? '融资租赁' : 'Finance Lease'}</li>
                    <li>✓ {locale === 'zh' ? '经营租赁' : 'Operating Lease'}</li>
                    <li>✓ {locale === 'zh' ? '设备抵押' : 'Equipment Mortgage'}</li>
                  </ul>
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {locale === 'zh' ? '立即申请' : 'Apply Now'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                  <Shield className="w-10 h-10 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '保理服务' : 'Factoring Services'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {locale === 'zh' ? '应收账款融资，加速资金周转，降低坏账风险' : 'AR financing to accelerate cash flow and reduce bad debt'}
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✓ {locale === 'zh' ? '有追索权保理' : 'Recourse Factoring'}</li>
                    <li>✓ {locale === 'zh' ? '无追索权保理' : 'Non-Recourse Factoring'}</li>
                    <li>✓ {locale === 'zh' ? '发票贴现' : 'Invoice Discounting'}</li>
                  </ul>
                  <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    {locale === 'zh' ? '立即申请' : 'Apply Now'}
                  </button>
                </div>
              </div>

              {/* Loan Products Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 text-white px-6 py-4">
                  <h3 className="text-xl font-bold">{locale === 'zh' ? '融资产品对比' : 'Financing Product Comparison'}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {locale === 'zh' ? '产品名称' : 'Product'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {locale === 'zh' ? '额度范围' : 'Range'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {locale === 'zh' ? '年利率' : 'Annual Rate'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {locale === 'zh' ? '期限' : 'Term'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {locale === 'zh' ? '审批时间' : 'Approval Time'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{locale === 'zh' ? '贸易融资' : 'Trade Finance'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$50K - $10M</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">4.5% - 8%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-12 {locale === 'zh' ? '个月' : 'months'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3-7 {locale === 'zh' ? '个工作日' : 'business days'}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{locale === 'zh' ? '设备融资' : 'Equipment Financing'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$100K - $50M</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">5% - 9%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-5 {locale === 'zh' ? '年' : 'years'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5-14 {locale === 'zh' ? '个工作日' : 'business days'}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{locale === 'zh' ? '保理服务' : 'Factoring Services'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$10K - $5M</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">3% - 6%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-6 {locale === 'zh' ? '个月' : 'months'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-3 {locale === 'zh' ? '个工作日' : 'business days'}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{locale === 'zh' ? '订单融资' : 'Order Financing'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$20K - $2M</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">6% - 10%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-3 {locale === 'zh' ? '个月' : 'months'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2-5 {locale === 'zh' ? '个工作日' : 'business days'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CTA Banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{locale === 'zh' ? '需要定制融资方案？' : 'Need a Custom Financing Solution?'}</h3>
                    <p className="opacity-90">{locale === 'zh' ? '我们的专家团队将为您量身定制最合适的融资方案' : 'Our team will tailor the best financing solution for you'}</p>
                  </div>
                  <Link href={`/${locale}/contact`} className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    {locale === 'zh' ? '联系我们' : 'Contact Us'}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Investment Section */}
          {activeTab === 'investment' && (
            <div className="space-y-8">
              {/* Investment Opportunities */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-10 h-10 text-orange-600" />
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {locale === 'zh' ? '热门' : 'Hot'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '跨境电商基金' : 'Cross-border E-commerce Fund'}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '目标规模' : 'Target Size'}:</span>
                      <span className="font-semibold">$50M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '预期收益' : 'Expected Return'}:</span>
                      <span className="font-semibold text-green-600">15-25% IRR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '最低投资' : 'Min Investment'}:</span>
                      <span className="font-semibold">$100K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '投资期限' : 'Investment Term'}:</span>
                      <span className="font-semibold">5-7 {locale === 'zh' ? '年' : 'years'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    {locale === 'zh' ? '专注投资跨境电商平台上的优质卖家和品牌，助力中国品牌出海。' : 'Focused on quality sellers and brands on cross-border e-commerce platforms.'}
                  </p>
                  <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    {locale === 'zh' ? '了解详情' : 'Learn More'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <ArrowUpRight className="w-10 h-10 text-blue-600" />
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {locale === 'zh' ? '新兴' : 'Emerging'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '智能制造股权' : 'Smart Manufacturing Equity'}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '目标规模' : 'Target Size'}:</span>
                      <span className="font-semibold">$30M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '预期收益' : 'Expected Return'}:</span>
                      <span className="font-semibold text-green-600">20-35% IRR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '最低投资' : 'Min Investment'}:</span>
                      <span className="font-semibold">$250K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '投资期限' : 'Investment Term'}:</span>
                      <span className="font-semibold">7-10 {locale === 'zh' ? '年' : 'years'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    {locale === 'zh' ? '投资工业4.0、自动化生产线、AI制造等前沿领域的创新企业。' : 'Invest in Industry 4.0, automation, and AI manufacturing innovations.'}
                  </p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {locale === 'zh' ? '了解详情' : 'Learn More'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <Building2 className="w-10 h-10 text-purple-600" />
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {locale === 'zh' ? '稳健' : 'Stable'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? '供应链REITs' : 'Supply Chain REITs'}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '目标规模' : 'Target Size'}:</span>
                      <span className="font-semibold">$100M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '预期收益' : 'Expected Return'}:</span>
                      <span className="font-semibold text-green-600">8-12% Annual</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '最低投资' : 'Min Investment'}:</span>
                      <span className="font-semibold">$50K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '投资期限' : 'Investment Term'}:</span>
                      <span className="font-semibold">3-5 {locale === 'zh' ? '年' : 'years'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    {locale === 'zh' ? '投资物流仓储、产业园等供应链基础设施资产，享受稳定租金收益。' : 'Invest in logistics warehousing and industrial parks for stable rental income.'}
                  </p>
                  <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    {locale === 'zh' ? '了解详情' : 'Learn More'}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-4">
                    <Rocket className="w-10 h-10 text-teal-600" />
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {locale === 'zh' ? '初创' : 'Startup'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'zh' ? 'B2B创投基金' : 'B2B Venture Capital'}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '目标规模' : 'Target Size'}:</span>
                      <span className="font-semibold">$20M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '预期收益' : 'Expected Return'}:</span>
                      <span className="font-semibold text-green-600">30-50%+ IRR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '最低投资' : 'Min Investment'}:</span>
                      <span className="font-semibold">$500K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'zh' ? '投资期限' : 'Investment Term'}:</span>
                      <span className="font-semibold">8-12 {locale === 'zh' ? '年' : 'years'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    {locale === 'zh' ? '投资B2B跨境贸易领域的早期和成长期创业公司，赋能产业创新。' : 'Invest in early and growth-stage B2B cross-border trade startups.'}
                  </p>
                  <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    {locale === 'zh' ? '了解详情' : 'Learn More'}
                  </button>
                </div>
              </div>

              {/* Market Trends */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  {locale === 'zh' ? '市场趋势概览' : 'Market Trends Overview'}
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">+18.5%</div>
                    <div className="text-sm text-gray-600 mt-1">{locale === 'zh' ? '跨境贸易增长' : 'Cross-border Growth'}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">$8.9T</div>
                    <div className="text-sm text-gray-600 mt-1">{locale === 'zh' ? '全球B2B市场' : 'Global B2B Market'}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">+25%</div>
                    <div className="text-sm text-gray-600 mt-1">{locale === 'zh' ? '电商渗透率' : 'E-commerce Penetration'}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">3.2x</div>
                    <div className="text-sm text-gray-600 mt-1">{locale === 'zh' ? 'AI赋能增长' : 'AI Empowerment'}</div>
                  </div>
                </div>
              </div>

              {/* Investment CTA */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{locale === 'zh' ? '成为我们的投资伙伴' : 'Become Our Investment Partner'}</h3>
                    <p className="opacity-90">{locale === 'zh' ? '与我们共同分享B2B跨境贸易的增长红利' : 'Share in the growth of B2B cross-border trade'}</p>
                  </div>
                  <Link href={`/${locale}/investment`} className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    {locale === 'zh' ? '查看投资计划' : 'View Investment Plans'}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Load More */}
          <div className="mt-8 text-center">
            <button className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              {dict.marketplace.loadMore}
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {dict.marketplace.howItWorks}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{dict.marketplace.steps.postYourTask}</h3>
              <p className="text-gray-600">
                {dict.marketplace.steps.postYourTaskDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{dict.marketplace.steps.receiveApplications}</h3>
              <p className="text-gray-600">
                {dict.marketplace.steps.receiveApplicationsDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{dict.marketplace.steps.connectAndComplete}</h3>
              <p className="text-gray-600">
                {dict.marketplace.steps.connectAndCompleteDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {dict.marketplace.readyToGetStarted}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {dict.marketplace.joinThousands}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href={`/${locale}/auth/register?type=seller`}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {dict.marketplace.registerAsSeller}
            </Link>
            <Link
              href={`/${locale}/auth/register?type=buyer`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              {dict.marketplace.registerAsBuyer}
            </Link>
            <Link
              href={`/${locale}/investment`}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
            >
              💰 {dict.marketplace.investNow}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
