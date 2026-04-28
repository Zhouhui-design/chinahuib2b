'use client'

import { useState, useEffect } from 'react'
import { Save, Trash2, Plus, Globe, FileText, Tag, CheckCircle, AlertCircle } from 'lucide-react'

interface SEOConfig {
  id: string
  pagePath: string
  title: string | null
  titleEn: string | null
  description: string | null
  descriptionEn: string | null
  keywords: string | null
  keywordsEn: string | null
  pageType: 'STATIC' | 'PRODUCT' | 'STORE' | 'CATEGORY' | 'CUSTOM'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SEOManagerPage() {
  const [configs, setConfigs] = useState<SEOConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    pagePath: '',
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    keywords: '',
    keywordsEn: '',
    pageType: 'STATIC' as SEOConfig['pageType'],
    isActive: true
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/seo-configs')
      const data = await response.json()
      if (data.success) {
        setConfigs(data.configs)
      }
    } catch (error) {
      console.error('Failed to load configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(editingId ? 'SEO 配置已更新' : 'SEO 配置已创建')
        resetForm()
        loadConfigs()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || '操作失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (config: SEOConfig) => {
    setFormData({
      pagePath: config.pagePath,
      title: config.title || '',
      titleEn: config.titleEn || '',
      description: config.description || '',
      descriptionEn: config.descriptionEn || '',
      keywords: config.keywords || '',
      keywordsEn: config.keywordsEn || '',
      pageType: config.pageType,
      isActive: config.isActive
    })
    setEditingId(config.id)
  }

  const handleDelete = async (pagePath: string) => {
    if (!confirm('确定要删除这个 SEO 配置吗？')) return

    try {
      const response = await fetch(`/api/admin/seo?pagePath=${encodeURIComponent(pagePath)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('配置已删除')
        loadConfigs()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('删除失败')
    }
  }

  const resetForm = () => {
    setFormData({
      pagePath: '',
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      keywords: '',
      keywordsEn: '',
      pageType: 'STATIC',
      isActive: true
    })
    setEditingId(null)
  }

  const pageTypeLabels = {
    STATIC: '静态页面',
    PRODUCT: '产品页面',
    STORE: '店铺页面',
    CATEGORY: '分类页面',
    CUSTOM: '自定义页面'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO TDK 管理</h1>
          <p className="text-gray-600">管理页面标题 (Title)、描述 (Description) 和关键词 (Keywords)</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editingId ? '编辑配置' : '添加配置'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Page Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    页面路径 *
                  </label>
                  <input
                    type="text"
                    value={formData.pagePath}
                    onChange={(e) => setFormData({ ...formData, pagePath: e.target.value })}
                    placeholder="/, /en, /products/[id]"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!!editingId}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    示例：/, /en, /products/abc123
                  </p>
                </div>

                {/* Page Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    页面类型
                  </label>
                  <select
                    value={formData.pageType}
                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(pageTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Chinese TDK */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">中文 SEO</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        <FileText className="w-3 h-3 inline mr-1" />
                        标题 (Title)
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="页面标题"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        描述 (Description)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="页面描述（建议 150-160 字符）"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        <Tag className="w-3 h-3 inline mr-1" />
                        关键词 (Keywords)
                      </label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="关键词1,关键词2,关键词3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* English TDK */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">English SEO</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        placeholder="Page title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        placeholder="Page description (150-160 characters recommended)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.keywordsEn}
                        onChange={(e) => setFormData({ ...formData, keywordsEn: e.target.value })}
                        placeholder="keyword1,keyword2,keyword3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    启用此配置
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : editingId ? '更新配置' : '创建配置'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    >
                      取消
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Config List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">SEO 配置列表</h2>
                <p className="text-sm text-gray-600 mt-1">共 {configs.length} 个配置</p>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无 SEO 配置</p>
                  <p className="text-sm mt-1">在左侧表单中添加第一个配置</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {configs.map((config) => (
                    <div key={config.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {config.pagePath}
                            </code>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {pageTypeLabels[config.pageType]}
                            </span>
                            {!config.isActive && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                已禁用
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(config.pagePath)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </button>
                        </div>
                      </div>

                      {/* TDK Preview */}
                      <div className="space-y-2 text-sm">
                        {(config.title || config.titleEn) && (
                          <div>
                            <span className="text-gray-500">Title:</span>
                            <div className="mt-1 space-y-1">
                              {config.title && (
                                <p className="text-gray-900 font-medium">🇨🇳 {config.title}</p>
                              )}
                              {config.titleEn && (
                                <p className="text-gray-900 font-medium">🇸 {config.titleEn}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {(config.description || config.descriptionEn) && (
                          <div>
                            <span className="text-gray-500">Description:</span>
                            <div className="mt-1 space-y-1">
                              {config.description && (
                                <p className="text-gray-700 line-clamp-2">🇨 {config.description}</p>
                              )}
                              {config.descriptionEn && (
                                <p className="text-gray-700 line-clamp-2">🇺🇸 {config.descriptionEn}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {(config.keywords || config.keywordsEn) && (
                          <div>
                            <span className="text-gray-500">Keywords:</span>
                            <div className="mt-1 space-y-1">
                              {config.keywords && (
                                <p className="text-gray-700">🇨🇳 {config.keywords}</p>
                              )}
                              {config.keywordsEn && (
                                <p className="text-gray-700">🇸 {config.keywordsEn}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-400">
                        更新时间: {new Date(config.updatedAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
