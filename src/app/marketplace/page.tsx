'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, ThumbsUp, MessageCircle, Bookmark, Trash2, Edit, Clock, Eye, Filter, ChevronLeft, ChevronRight, MoreVertical, User, Share2 } from 'lucide-react'

type Post = {
  id: string
  title: string
  content: string
  category: string
  authorId: string
  authorName: string
  authorAvatar?: string
  authorTags?: string[]
  createdAt: string
  expiresAt: string
  likes: number
  comments: Comment[]
  views: number
  isPinned: boolean
  tags: string[]
  images?: string[]
}

type Comment = {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
  likes: number
}

const categories = [
  { value: 'all', label: '全部' },
  { value: 'business', label: '商业合作' },
  { value: 'product', label: '产品介绍' },
  { value: 'question', label: '问答' },
  { value: 'news', label: '行业资讯' },
  { value: 'discussion', label: '讨论' },
]

export default function MarketplacePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest')
  const postsPerPage = 10

  // 模拟数据
  const mockPosts: Post[] = [
    {
      id: '1',
      title: '寻找电子元件供应商合作',
      content: '我们公司正在寻找稳定的电子元件供应商，主要需要电阻、电容、集成电路等。年需求量很大，欢迎有实力的供应商联系！我们提供优惠的合作条件和长期稳定的订单。',
      category: 'business',
      authorId: '1',
      authorName: '张伟',
      authorTags: ['CEO', '电子科技'],
      createdAt: '2026-05-30T10:00:00Z',
      expiresAt: '2027-05-30T10:00:00Z',
      likes: 45,
      views: 234,
      isPinned: true,
      tags: ['供应商', '电子元件', '合作'],
      comments: [
        {
          id: '1',
          userId: '2',
          userName: '李明',
          content: '您好！我们公司是专业的电子元件供应商，请查看我们的店铺了解详情。',
          timestamp: '2026-05-30T10:30:00Z',
          likes: 5
        },
        {
          id: '2',
          userId: '3',
          userName: '王芳',
          content: '已发送私信，请查看！',
          timestamp: '2026-05-30T11:00:00Z',
          likes: 3
        }
      ]
    },
    {
      id: '2',
      title: '新产品发布：智能无线耳机',
      content: '我们公司最新研发的智能无线耳机正式发布！采用最新的ANC降噪技术，续航时间长达30小时，支持蓝牙5.3。欢迎各地经销商洽谈合作！',
      category: 'product',
      authorId: '2',
      authorName: '李明',
      authorTags: ['产品经理', '科技公司'],
      createdAt: '2026-05-29T14:00:00Z',
      expiresAt: '2027-05-29T14:00:00Z',
      likes: 89,
      views: 567,
      isPinned: false,
      tags: ['新产品', '无线耳机', '经销商'],
      comments: [
        {
          id: '1',
          userId: '1',
          userName: '张伟',
          content: '产品看起来很棒！我们有兴趣成为经销商。',
          timestamp: '2026-05-29T15:00:00Z',
          likes: 12
        }
      ]
    },
    {
      id: '3',
      title: '请问如何申请成为平台供应商？',
      content: '大家好，我是新来的，想了解一下如何申请成为平台的认证供应商？需要哪些资质和流程？希望有经验的朋友分享一下，谢谢！',
      category: 'question',
      authorId: '3',
      authorName: '王芳',
      authorTags: ['采购'],
      createdAt: '2026-05-28T09:00:00Z',
      expiresAt: '2027-05-28T09:00:00Z',
      likes: 23,
      views: 189,
      isPinned: false,
      tags: ['求助', '供应商', '认证'],
      comments: [
        {
          id: '1',
          userId: '2',
          userName: '李明',
          content: '您好！请在卖家中心提交申请，需要提供公司营业执照等资质。',
          timestamp: '2026-05-28T10:00:00Z',
          likes: 8
        }
      ]
    },
    {
      id: '4',
      title: '2026年电子行业发展趋势分析',
      content: '根据最新的行业报告，2026年全球电子市场预计将增长15%，主要增长点在：1. 可穿戴设备 2. 智能家居产品 3. 新能源汽车电子。建议大家提前布局这些领域。',
      category: 'news',
      authorId: '4',
      authorName: '赵强',
      authorTags: ['分析师', '行业资讯'],
      createdAt: '2026-05-27T16:00:00Z',
      expiresAt: '2027-05-27T16:00:00Z',
      likes: 156,
      views: 1234,
      isPinned: false,
      tags: ['行业趋势', '电子', '市场分析'],
      comments: [
        {
          id: '1',
          userId: '1',
          userName: '张伟',
          content: '分析得很到位！我们公司也在关注智能家居方向。',
          timestamp: '2026-05-27T17:00:00Z',
          likes: 25
        }
      ]
    }
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    setLoading(true)
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 500)
  }

  const createPost = (title: string, content: string, category: string, tags: string[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      category,
      authorId: '1',
      authorName: '当前用户',
      authorTags: ['会员'],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 0,
      comments: [],
      views: 0,
      isPinned: false,
      tags: tags
    }
    setPosts([newPost, ...posts])
    setShowCreatePostModal(false)
  }

  const deletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId))
  }

  const likePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
  }

  const addComment = (postId: string, content: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: [
              ...post.comments,
              {
                id: Date.now().toString(),
                userId: '1',
                userName: '当前用户',
                content,
                timestamp: new Date().toISOString(),
                likes: 0
              }
            ]
          }
        : post
    ))
  }

  // 过滤和排序帖子
  const filteredPosts = posts.filter(post => {
    const matchesCategory = category === 'all' || post.category === category
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes
      case 'views':
        return b.views - a.views
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // 分页
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const getDaysUntilExpiration = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">帖子广场</h1>
              <p className="text-slate-600 mt-2">分享、讨论、发现商业机会</p>
            </div>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              发布帖子
            </button>
          </div>
        </div>

        {/* 过滤和搜索栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索帖子..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="latest">最新发布</option>
                <option value="popular">最受欢迎</option>
                <option value="views">最多浏览</option>
              </select>
            </div>
          </div>
        </div>

        {/* 帖子列表 */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">加载帖子中...</p>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无帖子</h3>
              <p className="text-slate-600 mb-6">成为第一个发布帖子的人吧！</p>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                发布帖子
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentPosts.map(post => {
              const daysUntilExpiration = getDaysUntilExpiration(post.expiresAt)
              const isExpiringSoon = daysUntilExpiration <= 30
              const isOwner = post.authorId === '1'
              
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
                >
                  {/* 帖子头部 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium text-lg">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{post.authorName}</h4>
                          {post.authorTags?.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                            {categories.find(c => c.value === post.category)?.label}
                          </span>
                          {post.isPinned && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              置顶
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              还有 {daysUntilExpiration} 天过期
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isOwner && (
                      <div className="relative group">
                        <button className="p-2 hover:bg-slate-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 hidden group-hover:block z-10">
                          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 w-full">
                            <Edit className="w-4 h-4" />
                            编辑帖子
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除帖子
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 帖子内容 */}
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{post.title}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">{post.content}</p>

                  {/* 标签 */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full cursor-pointer hover:bg-slate-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 互动栏 */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments.length}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <Bookmark className="w-5 h-5" />
                        <span>收藏</span>
                      </button>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{post.views}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">分享</span>
                    </button>
                  </div>

                  {/* 评论区 */}
                  {post.comments.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <h5 className="font-medium text-slate-900 mb-4">评论 ({post.comments.length})</h5>
                      <div className="space-y-4">
                        {post.comments.slice(0, 3).map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 text-sm flex-shrink-0">
                              {comment.userName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-900">{comment.userName}</span>
                                <span className="text-xs text-slate-500">{formatDate(comment.timestamp)}</span>
                              </div>
                              <p className="text-slate-600">{comment.content}</p>
                              <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mt-1">
                                <ThumbsUp className="w-3 h-3" />
                                {comment.likes}
                              </button>
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 3 && (
                          <button className="text-blue-600 text-sm hover:underline">
                            查看全部 {post.comments.length} 条评论
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 添加评论 */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                        我
                      </div>
                      <div className="flex-1">
                        <AddCommentForm
                          onSubmit={(content) => addComment(post.id, content)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 创建帖子弹窗 */}
      {showCreatePostModal && (
        <CreatePostModal
          onSubmit={createPost}
          onCancel={() => setShowCreatePostModal(false)}
        />
      )}
    </div>
  )
}

function CreatePostModal({ onSubmit, onCancel }: { onSubmit: (title: string, content: string, category: string, tags: string[]) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('business')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSubmit(title, content, category, tags)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">发布新帖子</h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入帖子标题..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {categories.filter(c => c.value !== 'all').map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入帖子内容..."
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">标签（按Enter添加）</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-blue-900">
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="输入标签..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              <strong>提示：</strong>帖子将在发布后1年自动删除。请确保内容真实有效。
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发布帖子
          </button>
        </div>
      </div>
    </div>
  )
}

function AddCommentForm({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content)
      setContent('')
    }
  }

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="写下你的评论..."
        className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      />
      <button
        onClick={handleSubmit}
        disabled={!content.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        发送
      </button>
    </div>
  )
}
