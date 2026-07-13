import Link from 'next/link'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'
import { Calendar, Eye, MessageCircle, Heart, Tag, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ locale: LanguageCode }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.nav.blog || 'Blog',
    description: dict.meta?.blogDescription || 'Latest industry news and trends',
    keywords: ['blog', 'news', 'industry', 'trends', 'guide'],
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  const posts = await prisma.blog.findMany({
    where: { isPublished: true },
    include: {
      author: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const categories = ['INDUSTRY_NEWS', 'MARKET_TRENDS', 'PRODUCT_GUIDES', 'SUCCESS_STORIES', 'TIPS_ADVICE']

  const categoryNames: Record<string, string> = {
    INDUSTRY_NEWS: locale === 'zh' ? '行业新闻' : 'Industry News',
    MARKET_TRENDS: locale === 'zh' ? '市场趋势' : 'Market Trends',
    PRODUCT_GUIDES: locale === 'zh' ? '产品指南' : 'Product Guides',
    COMPANY_UPDATES: locale === 'zh' ? '公司动态' : 'Company Updates',
    SUCCESS_STORIES: locale === 'zh' ? '成功案例' : 'Success Stories',
    TIPS_ADVICE: locale === 'zh' ? '技巧建议' : 'Tips & Advice',
    OTHER: locale === 'zh' ? '其他' : 'Other',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {dict.nav.blog || 'Blog'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'zh' ? '获取最新行业资讯、市场趋势和实用建议' : 'Get the latest industry news, market trends, and practical tips'}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            href={`/${locale}/blog`}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {locale === 'zh' ? '全部' : 'All'}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/${locale}/blog?category=${cat}`}
              className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
            >
              {categoryNames[cat]}
            </Link>
          ))}
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        {categoryNames[post.category]}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {locale === 'zh' ? post.title : (post.titleEn || post.title)}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {locale === 'zh' ? post.excerpt : (post.excerptEn || post.excerpt)}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author & Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avatar/svg?seed=${post.author.id}`}
                        alt={post.author.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {post.author.displayName || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString(
                            locale === 'zh' ? 'zh-CN' : 'en-US'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.commentCount}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likeCount}
                      </span>
                    </div>
                  </div>

                  {/* Read More */}
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="inline-flex items-center mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                  >
                    {locale === 'zh' ? '阅读更多' : 'Read More'}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">{locale === 'zh' ? '暂无文章' : 'No posts yet'}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {posts.length >= 10 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                ←
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                1
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                2
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                →
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}