import Link from 'next/link'
import { getDictionary } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'
import { Calendar, Eye, MessageCircle, Heart, Tag, ArrowLeft, Share2, Bookmark, Send } from 'lucide-react'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: LanguageCode; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const dict = await getDictionary(locale)

  const blog = await prisma.blog.findUnique({ where: { slug } })
  if (!blog) {
    return {
      title: dict.nav.blog || 'Blog',
      description: dict.meta?.blogDescription || 'Latest industry news',
    }
  }

  return {
    title: locale === 'zh' ? blog.seoTitle || blog.title : (blog.seoTitleEn || blog.titleEn || blog.title),
    description: locale === 'zh' ? blog.seoDescription || blog.excerpt : (blog.seoDescriptionEn || blog.excerptEn || blog.excerpt),
    keywords: blog.seoKeywords.length > 0 ? blog.seoKeywords : ['blog', 'news'],
    openGraph: {
      title: locale === 'zh' ? blog.title : (blog.titleEn || blog.title),
      description: locale === 'zh' ? blog.excerpt : (blog.excerptEn || blog.excerpt),
      images: blog.featuredImage ? [blog.featuredImage] : [],
    },
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale)

  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, displayName: true, avatarUrl: true, company: true },
      },
      comments: {
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!blog) {
    return notFound()
  }

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
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full mb-4">
              {categoryNames[blog.category]}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {locale === 'zh' ? blog.title : (blog.titleEn || blog.title)}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={blog.author.avatarUrl || `https://api.dicebear.com/7.x/avatar/svg?seed=${blog.author.id}`}
                    alt={blog.author.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">
                      {blog.author.displayName || 'Admin'}
                    </p>
                    {blog.author.company && (
                      <p className="text-sm text-gray-500">{blog.author.company}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-gray-500 text-sm">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(blog.createdAt).toLocaleDateString(
                      locale === 'zh' ? 'zh-CN' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {blog.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {blog.commentCount}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-500 italic mb-6">
                  {locale === 'zh' ? blog.excerpt : (blog.excerptEn || blog.excerpt)}
                </p>
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: locale === 'zh' ? blog.content : (blog.contentEn || blog.content),
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{locale === 'zh' ? '点赞' : 'Like'} ({blog.likeCount})</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bookmark className="w-5 h-5" />
                  <span className="font-medium">{locale === 'zh' ? '收藏' : 'Save'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">{locale === 'zh' ? '分享' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'zh' ? '评论' : 'Comments'} ({blog.comments.length})
              </h3>

              {blog.comments.length > 0 ? (
                <div className="space-y-6">
                  {blog.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={comment.user.avatarUrl || `https://api.dicebear.com/7.x/avatar/svg?seed=${comment.user.id}`}
                          alt={comment.user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">
                              {comment.user.displayName || 'Anonymous'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString(
                                locale === 'zh' ? 'zh-CN' : 'en-US'
                              )}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          <button className="flex items-center gap-1 mt-3 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <Send className="w-4 h-4" />
                            {locale === 'zh' ? '回复' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {locale === 'zh' ? '暂无评论，快来发表第一条评论吧！' : 'No comments yet. Be the first to comment!'}
                </p>
              )}

              {/* Comment Form */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">
                  {locale === 'zh' ? '发表评论' : 'Leave a Comment'}
                </h4>
                <form className="space-y-4">
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder={locale === 'zh' ? '写下你的评论...' : 'Write your comment...'}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {locale === 'zh' ? '提交评论' : 'Submit Comment'}
                  </button>
                </form>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80">
            {/* Back Link */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <Link
                href={`/${locale}/blog`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {locale === 'zh' ? '返回博客列表' : 'Back to Blog'}
              </Link>
            </div>

            {/* Related Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {locale === 'zh' ? '相关文章' : 'Related Posts'}
              </h3>
              <div className="space-y-4">
                {blog.tags.length > 0 ? (
                  <p className="text-sm text-gray-500">
                    {locale === 'zh' ? '暂无相关文章' : 'No related posts'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    {locale === 'zh' ? '暂无相关文章' : 'No related posts'}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}