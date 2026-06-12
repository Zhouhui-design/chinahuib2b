'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save, BookOpen, FileText } from 'lucide-react'

interface Guide {
  id: string
  title: string
  titleEn: string
  category: string
  content: string
  contentEn: string
  isPublished: boolean
  createdAt: string
}

export default function AdminGuidePage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    category: 'general',
    content: '',
    contentEn: '',
    isPublished: false,
  })

  const handleOpenModal = (guide?: Guide) => {
    if (guide) {
      setEditingGuide(guide)
      setFormData({
        title: guide.title,
        titleEn: guide.titleEn,
        category: guide.category,
        content: guide.content,
        contentEn: guide.contentEn,
        isPublished: guide.isPublished,
      })
    } else {
      setEditingGuide(null)
      setFormData({
        title: '',
        titleEn: '',
        category: 'general',
        content: '',
        contentEn: '',
        isPublished: false,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingGuide(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCloseModal()
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`确定要删除指南 "${title}" 吗？`)) {
      setGuides(guides.filter(g => g.id !== id))
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      general: '通用指南',
      seller: '卖家指南',
      buyer: '买家指南',
      technical: '技术支持',
    }
    return categories[category] || category
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">帮助指南管理</h1>
          <p className="text-sm text-gray-600 mt-1">管理网站帮助文档和指南</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加指南
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">指南列表</h2>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
            {guides.length} 篇指南
          </span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {guides.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无指南数据</p>
            </div>
          ) : (
            guides.map((guide) => (
              <div key={guide.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{guide.title}</span>
                      {guide.isPublished && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          已发布
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{getCategoryLabel(guide.category)}</span>
                      {guide.titleEn && (
                        <span className="text-gray-400">{guide.titleEn}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(guide)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id, guide.title)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleCloseModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingGuide ? '编辑指南' : '添加指南'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题（中文） *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入中文标题"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">标题（英文）</label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English title"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">通用指南</option>
                    <option value="seller">卖家指南</option>
                    <option value="buyer">买家指南</option>
                    <option value="technical">技术支持</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容（中文）</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入中文内容"
                      rows={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">内容（英文）</label>
                    <textarea
                      value={formData.contentEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, contentEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English content"
                      rows={5}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                    发布此指南
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingGuide ? '保存修改' : '添加指南'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}