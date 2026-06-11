'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Folder, FolderOpen, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
  level: number
  parentId: string | null
  parent: { id: string; name: string } | null
  model: string | null
  modelEn: string | null
  series: string | null
  seriesEn: string | null
  description: string | null
  descriptionEn: string | null
  childrenCount: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    level: 1,
    parentId: '',
    model: '',
    modelEn: '',
    series: '',
    seriesEn: '',
    description: '',
    descriptionEn: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories?locale=zh')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch categories')
      }
    } catch (err) {
      setError('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        nameEn: category.nameEn || '',
        level: category.level,
        parentId: category.parentId || '',
        model: category.model || '',
        modelEn: category.modelEn || '',
        series: category.series || '',
        seriesEn: category.seriesEn || '',
        description: category.description || '',
        descriptionEn: category.descriptionEn || '',
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        nameEn: '',
        level: 1,
        parentId: '',
        model: '',
        modelEn: '',
        series: '',
        seriesEn: '',
        description: '',
        descriptionEn: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      nameEn: '',
      level: 1,
      parentId: '',
      model: '',
      modelEn: '',
      series: '',
      seriesEn: '',
      description: '',
      descriptionEn: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('分类名称为必填项')
      return
    }

    try {
      const url = editingCategory ? '/api/admin/categories' : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const body = editingCategory 
        ? { ...formData, id: editingCategory.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        handleCloseModal()
        fetchCategories()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '操作失败')
      }
    } catch (err) {
      setError('操作失败')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除分类 "${name}" 吗？此操作不可撤销。`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '删除失败')
      }
    } catch (err) {
      setError('删除失败')
    }
  }

  const getParentOptions = () => {
    return categories.filter(cat => cat.level === formData.level - 1)
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return '大类'
      case 2: return '中类'
      case 3: return '小类'
      default: return `等级 ${level}`
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.level]) {
      acc[cat.level] = []
    }
    acc[cat.level].push(cat)
    return acc
  }, {} as Record<number, Category[]>)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品分类管理</h1>
          <p className="text-sm text-gray-600 mt-1">管理产品分类的大类、中类、小类及相关信息</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加分类
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Category Groups */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>加载中...</p>
          </div>
        </div>
      ) : (
        Object.entries(groupedCategories).map(([level, items]) => (
          <div key={level} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center">
              <Folder className="w-5 h-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">{getLevelLabel(Number(level))}</h2>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                {items.length} 个分类
              </span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {items.map((category) => (
                <div key={category.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getLevelColor(category.level)}`}>
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{category.name}</span>
                          {category.nameEn && (
                            <span className="text-sm text-gray-500">({category.nameEn})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          {category.parent && (
                            <span className="flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1" />
                              {category.parent.name}
                            </span>
                          )}
                          {category.model && (
                            <span>型号: {category.model}</span>
                          )}
                          {category.series && (
                            <span>系列: {category.series}</span>
                          )}
                          {category.childrenCount > 0 && (
                            <span className="text-blue-600">{category.childrenCount} 个子分类</span>
                          )}
                        </div>
                        {category.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleCloseModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? '编辑分类' : '添加分类'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* 分类名称 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类名称（中文） *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入分类名称"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类名称（英文）
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter category name"
                    />
                  </div>
                </div>

                {/* 分类层级 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类层级 *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => {
                        const newLevel = Number(e.target.value)
                        setFormData(prev => ({ ...prev, level: newLevel, parentId: '' }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>大类</option>
                      <option value={2}>中类</option>
                      <option value={3}>小类</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      上级分类
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={formData.level === 1}
                    >
                      <option value="">无（顶级分类）</option>
                      {getParentOptions().map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {parent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 型号 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      型号（中文）
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入型号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      型号（英文）
                    </label>
                    <input
                      type="text"
                      value={formData.modelEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter model"
                    />
                  </div>
                </div>

                {/* 系列 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      系列（中文）
                    </label>
                    <input
                      type="text"
                      value={formData.series}
                      onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入系列"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      系列（英文）
                    </label>
                    <input
                      type="text"
                      value={formData.seriesEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, seriesEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter series"
                    />
                  </div>
                </div>

                {/* 分类描述 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类描述（中文）
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入分类描述"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类描述（英文）
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* 提交按钮 */}
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
                    {editingCategory ? '保存修改' : '添加分类'}
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