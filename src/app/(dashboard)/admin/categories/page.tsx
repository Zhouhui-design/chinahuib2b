'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Edit2, Trash2, X, Save, Search, RefreshCw,
  ChevronRight, FileText
} from 'lucide-react'

interface Category {
  id: string
  name: string
  nameEn: string | null
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
  hsCode: string | null
  childrenCount: number
  children?: Category[]
  grandparent?: { id: string; name: string } | null
  greatGrandparent?: { id: string; name: string } | null
}

type TabType = 'level1' | 'level2' | 'level3' | 'level4' | 'level5'

const levelConfig = {
  level1: { label: '一级分类', level: 1, color: 'blue' },
  level2: { label: '二级分类', level: 2, color: 'green' },
  level3: { label: '三级分类', level: 3, color: 'yellow' },
  level4: { label: '四级分类', level: 4, color: 'purple' },
  level5: { label: '五级分类', level: 5, color: 'pink' },
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('level1')
  
  // 级联选择状态
  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')
  
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
    hsCode: '',
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
        const enrichedCategories = await enrichCategories(data.categories)
        setCategories(enrichedCategories)
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

  const enrichCategories = async (cats: Category[]): Promise<Category[]> => {
    const map = new Map<string, Category>()
    cats.forEach(cat => map.set(cat.id, cat))

    return cats.map(cat => {
      const enriched: Category = { ...cat }
      
      if (cat.parentId && map.has(cat.parentId)) {
        const parent = map.get(cat.parentId)!
        enriched.parent = { id: parent.id, name: parent.name }
        
        if (parent.parentId && map.has(parent.parentId)) {
          const grandparent = map.get(parent.parentId)!
          enriched.grandparent = { id: grandparent.id, name: grandparent.name }
          
          if (grandparent.parentId && map.has(grandparent.parentId)) {
            const greatGrandparent = map.get(grandparent.parentId)!
            enriched.greatGrandparent = { id: greatGrandparent.id, name: greatGrandparent.name }
          }
        }
      }
      
      return enriched
    })
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
        hsCode: category.hsCode || '',
      })
      
      // 设置级联选择状态
      if (category.level > 1) {
        // 根据层级反向推导上级分类
        const parentChain = getParentChain(category, categories)
        if (parentChain.level1) setSelectedLevel1(parentChain.level1)
        if (parentChain.level2) setSelectedLevel2(parentChain.level2)
        if (parentChain.level3) setSelectedLevel3(parentChain.level3)
        if (parentChain.level4) setSelectedLevel4(parentChain.level4)
      }
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
        hsCode: '',
      })
      setSelectedLevel1('')
      setSelectedLevel2('')
      setSelectedLevel3('')
      setSelectedLevel4('')
    }
    setShowModal(true)
  }

  // 获取分类的完整父级链
  const getParentChain = (category: Category, allCategories: Category[]) => {
    const chain: { level1?: string; level2?: string; level3?: string; level4?: string } = {}
    const map = new Map<string, Category>()
    allCategories.forEach(cat => map.set(cat.id, cat))
    
    let current = category
    while (current.parentId && map.has(current.parentId)) {
      const parent = map.get(current.parentId)!
      if (parent.level === 1) chain.level1 = parent.id
      if (parent.level === 2) chain.level2 = parent.id
      if (parent.level === 3) chain.level3 = parent.id
      if (parent.level === 4) chain.level4 = parent.id
      current = parent
    }
    
    return chain
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
      hsCode: '',
    })
    setSelectedLevel1('')
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
    setError(null)
  }

  // 根据级联选择计算最终的 parentId
  const calculateParentId = (): string => {
    switch (formData.level) {
      case 1:
        return ''
      case 2:
        return selectedLevel1
      case 3:
        return selectedLevel2
      case 4:
        return selectedLevel3
      case 5:
        return selectedLevel4
      default:
        return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('分类名称为必填项')
      return
    }

    // 计算最终的 parentId
    const parentId = calculateParentId()
    
    if (formData.level > 1 && !parentId) {
      setError('必须选择完整的上级分类链')
      return
    }

    try {
      const url = '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const body = editingCategory 
        ? { ...formData, id: editingCategory.id, parentId }
        : { ...formData, parentId }

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
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '删除失败')
      }
    } catch (err) {
      setError('删除失败')
    }
  }

  // 获取一级分类列表
  const getLevel1Options = () => {
    return categories.filter(cat => cat.level === 1)
  }

  // 获取二级分类列表（基于选择的一级分类）
  const getLevel2Options = () => {
    if (!selectedLevel1) return []
    return categories.filter(cat => cat.level === 2 && cat.parentId === selectedLevel1)
  }

  // 获取三级分类列表（基于选择的二级分类）
  const getLevel3Options = () => {
    if (!selectedLevel2) return []
    return categories.filter(cat => cat.level === 3 && cat.parentId === selectedLevel2)
  }

  // 获取四级分类列表（基于选择的三级分类）
  const getLevel4Options = () => {
    if (!selectedLevel3) return []
    return categories.filter(cat => cat.level === 4 && cat.parentId === selectedLevel3)
  }

  // 处理层级变化
  const handleLevelChange = (newLevel: number) => {
    setFormData(prev => ({ ...prev, level: newLevel }))
    // 清空所有级联选择
    setSelectedLevel1('')
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
  }

  // 处理一级分类变化
  const handleLevel1Change = (value: string) => {
    setSelectedLevel1(value)
    // 清空下游选择
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
  }

  // 处理二级分类变化
  const handleLevel2Change = (value: string) => {
    setSelectedLevel2(value)
    // 清空下游选择
    setSelectedLevel3('')
    setSelectedLevel4('')
  }

  // 处理三级分类变化
  const handleLevel3Change = (value: string) => {
    setSelectedLevel3(value)
    // 清空下游选择
    setSelectedLevel4('')
  }

  const getCategoriesByLevel = (level: number) => {
    let filtered = categories.filter(cat => cat.level === level)
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(term) || 
        cat.nameEn?.toLowerCase().includes(term) ||
        cat.hsCode?.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return '一级分类'
      case 2: return '二级分类'
      case 3: return '三级分类'
      case 4: return '四级分类'
      case 5: return '五级分类'
      default: return `等级 ${level}`
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-purple-100 text-purple-800'
      case 5: return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelBgColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-500'
      case 2: return 'bg-green-500'
      case 3: return 'bg-yellow-500'
      case 4: return 'bg-purple-500'
      case 5: return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const tabs: { key: TabType; label: string; level: number }[] = [
    { key: 'level1', label: '一级分类', level: 1 },
    { key: 'level2', label: '二级分类', level: 2 },
    { key: 'level3', label: '三级分类', level: 3 },
    { key: 'level4', label: '四级分类', level: 4 },
    { key: 'level5', label: '五级分类', level: 5 },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品分类管理</h1>
          <p className="text-sm text-gray-600 mt-1">管理产品的五级分类体系</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加分类
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${getLevelBgColor(tab.level)}`} />
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {categories.filter(c => c.level === tab.level).length}
                </span>
              </div>
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`搜索${levelConfig[activeTab].label}名称或HS编码...`}
            />
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>加载中...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {getCategoriesByLevel(levelConfig[activeTab].level).length > 0 ? (
              getCategoriesByLevel(levelConfig[activeTab].level).map((cat, index) => (
                <div key={cat.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{cat.name}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(cat.level)}`}>
                            {getLevelLabel(cat.level)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-gray-500">
                          {cat.hsCode && (
                            <span className="flex items-center">
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              HS编码: {cat.hsCode}
                            </span>
                          )}
                          {cat.parent && activeTab !== 'level1' && (
                            <span>
                              <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                              所属{getLevelLabel(cat.level - 1)}: {cat.parent.name}
                            </span>
                          )}
                          {cat.grandparent && activeTab === 'level3' && (
                            <span>
                              <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                              所属一级分类: {cat.grandparent.name}
                            </span>
                          )}
                          {cat.grandparent && activeTab === 'level4' && (
                            <span>
                              <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                              所属二级分类: {cat.grandparent.name}
                            </span>
                          )}
                          {cat.greatGrandparent && activeTab === 'level4' && (
                            <span>
                              <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                              所属一级分类: {cat.greatGrandparent.name}
                            </span>
                          )}
                          {cat.grandparent && activeTab === 'level5' && (
                            <span>
                              <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                              所属三级分类: {cat.grandparent.name}
                            </span>
                          )}
                          {cat.greatGrandparent && activeTab === 'level5' && (
                            <span>
                              <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                              所属二级分类: {cat.greatGrandparent.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无{levelConfig[activeTab].label}</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  + 添加{levelConfig[activeTab].label}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchCategories}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleCloseModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  {editingCategory ? '编辑分类' : '添加分类'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Category Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      分类名称（中文） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="输入分类名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      分类名称（英文）
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter category name"
                    />
                  </div>
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    分类层级 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.level}
                      onChange={(e) => handleLevelChange(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value={1}>一级分类（顶级分类，无上级）</option>
                      <option value={2}>二级分类（需选择一级分类作为上级）</option>
                      <option value={3}>三级分类（需依次选择一级→二级）</option>
                      <option value={4}>四级分类（需依次选择一级→二级→三级）</option>
                      <option value={5}>五级分类（需依次选择一级→二级→三级→四级）</option>
                    </select>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(formData.level)}`}>
                      {getLevelLabel(formData.level)}
                    </span>
                  </div>
                </div>

                {/* Cascading Parent Selection */}
                {formData.level > 1 && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      上级分类选择（级联选择） <span className="text-red-500">*</span>
                    </p>
                    
                    {/* 一级分类选择 - 二级及以上都需要 */}
                    {formData.level >= 2 && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          选择一级分类
                        </label>
                        <select
                          value={selectedLevel1}
                          onChange={(e) => handleLevel1Change(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">请选择一级分类</option>
                          {getLevel1Options().map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* 二级分类选择 - 三级及以上都需要 */}
                    {formData.level >= 3 && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          选择二级分类
                          {!selectedLevel1 && <span className="text-orange-500 ml-2">（请先选择一级分类）</span>}
                        </label>
                        <select
                          value={selectedLevel2}
                          onChange={(e) => handleLevel2Change(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!selectedLevel1}
                        >
                          <option value="">请选择二级分类</option>
                          {getLevel2Options().map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {selectedLevel1 && getLevel2Options().length === 0 && (
                          <p className="text-xs text-orange-600 mt-1">该一级分类下暂无二级分类，请先创建二级分类</p>
                        )}
                      </div>
                    )}
                    
                    {/* 三级分类选择 - 四级及以上都需要 */}
                    {formData.level >= 4 && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          选择三级分类
                          {!selectedLevel2 && <span className="text-orange-500 ml-2">（请先选择二级分类）</span>}
                        </label>
                        <select
                          value={selectedLevel3}
                          onChange={(e) => handleLevel3Change(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!selectedLevel2}
                        >
                          <option value="">请选择三级分类</option>
                          {getLevel3Options().map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {selectedLevel2 && getLevel3Options().length === 0 && (
                          <p className="text-xs text-orange-600 mt-1">该二级分类下暂无三级分类，请先创建三级分类</p>
                        )}
                      </div>
                    )}
                    
                    {/* 四级分类选择 - 五级需要 */}
                    {formData.level >= 5 && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          选择四级分类
                          {!selectedLevel3 && <span className="text-orange-500 ml-2">（请先选择三级分类）</span>}
                        </label>
                        <select
                          value={selectedLevel4}
                          onChange={(e) => setSelectedLevel4(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!selectedLevel3}
                        >
                          <option value="">请选择四级分类</option>
                          {getLevel4Options().map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {selectedLevel3 && getLevel4Options().length === 0 && (
                          <p className="text-xs text-orange-600 mt-1">该三级分类下暂无四级分类，请先创建四级分类</p>
                        )}
                      </div>
                    )}
                    
                    {/* 显示最终上级 */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        最终上级分类：
                        <span className="font-medium text-gray-900 ml-2">
                          {formData.level === 1 && '无（顶级分类）'}
                          {formData.level === 2 && selectedLevel1 && (
                            categories.find(c => c.id === selectedLevel1)?.name || '未选择'
                          )}
                          {formData.level === 3 && selectedLevel2 && (
                            categories.find(c => c.id === selectedLevel2)?.name || '未选择'
                          )}
                          {formData.level === 4 && selectedLevel3 && (
                            categories.find(c => c.id === selectedLevel3)?.name || '未选择'
                          )}
                          {formData.level === 5 && selectedLevel4 && (
                            categories.find(c => c.id === selectedLevel4)?.name || '未选择'
                          )}
                          {formData.level > 1 && !calculateParentId() && (
                            <span className="text-red-500">（请完成上级分类选择）</span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* HS Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    HS编码
                  </label>
                  <input
                    type="text"
                    value={formData.hsCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hsCode: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="输入HS编码"
                  />
                </div>

                {/* Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      型号（中文）
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="输入型号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      型号（英文）
                    </label>
                    <input
                      type="text"
                      value={formData.modelEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelEn: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter model"
                    />
                  </div>
                </div>

                {/* Series */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      系列（中文）
                    </label>
                    <input
                      type="text"
                      value={formData.series}
                      onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="输入系列"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      系列（英文）
                    </label>
                    <input
                      type="text"
                      value={formData.seriesEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, seriesEn: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter series"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      分类描述（中文）
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="输入分类描述"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      分类描述（英文）
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
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