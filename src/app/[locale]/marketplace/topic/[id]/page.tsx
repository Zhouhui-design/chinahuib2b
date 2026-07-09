'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { LanguageCode } from '@/lib/languages'
import { dictionaries } from '@/locales/dictionary'
import { MessageCircle, Heart, Eye, Image, Video, FileText, Link2, Phone, Send, ThumbsUp } from 'lucide-react'

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

interface TopicComment {
  id: string
  userId: string
  topicId: string
  content: string
  parentId: string | null
  likeCount: number
  createdAt: string
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
  replies: {
    id: string
    userId: string
    content: string
    createdAt: string
    user: {
      id: string
      username: string
      displayName: string | null
      avatarUrl: string | null
      role: string
    }
  }[]
}

const topicCategories = [
  { value: 'INDUSTRY', label: { zh: '行业讨论', en: 'Industry', ja: '産業', ko: '전체' } },
  { value: 'HOT_TOPIC', label: { zh: '热点话题', en: 'Hot Topic', ja: 'ホットトピック', ko: '핫 토픽' } },
  { value: 'PRODUCT', label: { zh: '产品评价', en: 'Product', ja: '製品', ko: '제품' } },
  { value: 'NEWS', label: { zh: '行业新闻', en: 'News', ja: 'ニュース', ko: '뉴스' } },
  { value: 'RECRUITMENT', label: { zh: '招聘信息', en: 'Recruitment', ja: '採用', ko: '채용' } },
  { value: 'ARTICLE', label: { zh: '文章分享', en: 'Article', ja: '記事', ko: '기사' } },
  { value: 'OTHER', label: { zh: '其他', en: 'Other', ja: 'その他', ko: '기타' } },
]

export default function TopicDetailPage() {
  const params = useParams()
  const locale = (params.locale as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en
  const topicId = params.id as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [comments, setComments] = useState<TopicComment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [currentLikeCount, setCurrentLikeCount] = useState(0)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const getTopicCategoryLabel = (value: string) => {
    const category = topicCategories.find(c => c.value === value)
    return category?.label[locale as keyof typeof category.label] || value
  }

  const getCategoryColor = (value: string) => {
    switch (value) {
      case 'INDUSTRY': return 'bg-blue-100 text-blue-800'
      case 'HOT_TOPIC': return 'bg-red-100 text-red-800'
      case 'PRODUCT': return 'bg-green-100 text-green-800'
      case 'NEWS': return 'bg-yellow-100 text-yellow-800'
      case 'RECRUITMENT': return 'bg-purple-100 text-purple-800'
      case 'ARTICLE': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/topics/${topicId}`)
        const data = await response.json()

        if (data.success) {
          setTopic(data.data.topic)
          setComments(data.data.comments)
          setCurrentLikeCount(data.data.topic.likeCount)
        }
      } catch (error) {
        console.error('Error fetching topic:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopic()
  }, [topicId])

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user?.id && topic) {
          const existingLike = await fetch(`/api/topics/${topicId}/like`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
          const data = await existingLike.json()
          if (data.success) {
            setIsLiked(data.data?.liked || false)
          }
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    if (topic) {
      checkLikeStatus()
    }
  }, [topic, topicId])

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/topics/${topicId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (data.success) {
        setIsLiked(data.data.liked)
        setCurrentLikeCount(data.data.liked ? currentLikeCount + 1 : currentLikeCount - 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const response = await fetch(`/api/topics/${topicId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      })
      const data = await response.json()

      if (data.success) {
        setComments([data.data.comment, ...comments])
        setCommentText('')
        if (topic) {
          setTopic({ ...topic, commentCount: topic.commentCount + 1 })
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return

    try {
      const response = await fetch(`/api/topics/${topicId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim(), parentId }),
      })
      const data = await response.json()

      if (data.success) {
        setComments(comments.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...c.replies, {
                ...data.data.comment,
                content: data.data.comment.content,
                user: data.data.comment.user,
              }],
            }
          }
          return c
        }))
        setReplyText('')
        setReplyingTo(null)
        if (topic) {
          setTopic({ ...topic, commentCount: topic.commentCount + 1 })
        }
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/topics/${topicId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (data.success) {
        setComments(comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              likeCount: data.data.liked ? c.likeCount + 1 : c.likeCount - 1,
            }
          }
          return c
        }))
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{dict.marketplace.loading}</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{locale === 'zh' ? '话题不存在或已被删除' : 'Topic not found or has been deleted'}</p>
          <Link href={`/${locale}/marketplace`} className="text-blue-600 hover:text-blue-800 mt-4 block">
            {locale === 'zh' ? '返回市场' : 'Back to Marketplace'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/marketplace`} className="text-white hover:text-blue-200">
              ← {locale === 'zh' ? '返回市场' : 'Back to Marketplace'}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(topic.category)}`}>
                  {getTopicCategoryLabel(topic.category)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(topic.createdAt).toLocaleDateString(locale)}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {topic.title}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={topic.user.avatarUrl || `/api/users/${topic.userId}/avatar`}
                  alt={topic.user.displayName || topic.user.username}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {topic.user.displayName || topic.user.username}
                  </div>
                  {topic.user.sellerProfile?.companyName && (
                    <div className="text-sm text-gray-500">
                      {topic.user.sellerProfile.companyName}
                    </div>
                  )}
                  {topic.user.sellerProfile?.isVerified && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">✓ Verified</span>
                  )}
                </div>
              </div>

              <div className="prose prose-lg text-gray-600 mb-6 whitespace-pre-wrap">
                {topic.content}
              </div>

              {topic.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {topic.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt=""
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {topic.videos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-500" />
                    {locale === 'zh' ? '视频' : 'Videos'}
                  </h3>
                  <div className="flex gap-4">
                    {topic.videos.map((video, index) => (
                      <div key={index} className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topic.documents && (topic.documents as any[]).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    {locale === 'zh' ? '附件' : 'Attachments'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(topic.documents as any[]).map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200"
                      >
                        <FileText className="w-4 h-4" />
                        {doc.name || `Document ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {topic.link && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Link2 className="w-5 h-5" />
                    <a href={topic.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {topic.link}
                    </a>
                  </div>
                </div>
              )}

              {topic.phone && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Phone className="w-5 h-5" />
                    <span>{topic.phone}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{topic.viewCount}</span>
                </div>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{currentLikeCount}</span>
                </button>
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{topic.commentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {locale === 'zh' ? '评论' : 'Comments'} ({comments.length})
            </h2>

            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={locale === 'zh' ? '发表评论...' : 'Write a comment...'}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {locale === 'zh' ? '发送' : 'Send'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {locale === 'zh' ? '暂无评论，快来发表第一条评论吧！' : 'No comments yet, be the first to comment!'}
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.user.avatarUrl || `/api/users/${comment.userId}/avatar`}
                        alt={comment.user.displayName || comment.user.username}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user.displayName || comment.user.username}
                          </span>
                          {comment.user.sellerProfile?.isVerified && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">✓ Verified</span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(locale)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{comment.likeCount}</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {locale === 'zh' ? '回复' : 'Reply'}
                          </button>
                        </div>

                        {replyingTo === comment.id && (
                          <div className="mt-3 p-3 bg-white rounded-lg">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={locale === 'zh' ? '回复评论...' : 'Reply to this comment...'}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyText.trim()}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                              >
                                {locale === 'zh' ? '发送回复' : 'Reply'}
                              </button>
                            </div>
                          </div>
                        )}

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <img
                                  src={reply.user.avatarUrl || `/api/users/${reply.userId}/avatar`}
                                  alt={reply.user.displayName || reply.user.username}
                                  className="w-8 h-8 rounded-full object-cover bg-gray-200 flex-shrink-0"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">
                                      {reply.user.displayName || reply.user.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(reply.createdAt).toLocaleDateString(locale)}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>{locale === 'zh' ? '© 2026 Global Expo Network. All rights reserved.' : '© 2026 Global Expo Network. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  )
}