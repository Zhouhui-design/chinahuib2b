'use client'

import { useState, useEffect } from 'react'
import { X, Search, Plus, Check } from 'lucide-react'

interface Product {
  id: string
  title: string
  mainImageUrl?: string
  category?: {
    id: string
    name: string
    parentId?: string
    level: number
  }
}

interface Category {
  id: string
  name: string
  parentId?: string
  level: number
  children?: Category[]
}

interface ProductSelectorProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (productIds: string[]) => void
  existingProductIds: string[]
  maxProducts?: number
}

export default function ProductSelector({ 
  isOpen, 
  onClose, 
  onAdd,
  existingProductIds,
  maxProducts = 100
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const availableSlots = maxProducts - existingProductIds.length

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      fetchCategories()
      setSelectedProducts(new Set())
      setSelectedCategory('')
      setSearchKeyword('')
    }
  }, [isOpen])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/products?limit=500')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const filteredProducts = products.filter(p => {
    if (existingProductIds.includes(p.id)) return false
    if (searchKeyword && !p.title.toLowerCase().includes(searchKeyword.toLowerCase())) return false
    if (selectedCategory && p.category?.parentId !== selectedCategory && p.category?.id !== selectedCategory) return false
    return true
  })

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      if (newSelected.size < availableSlots) {
        newSelected.add(productId)
      }
    }
    setSelectedProducts(newSelected)
  }

  const handleAdd = () => {
    onAdd(Array.from(selectedProducts))
    onClose()
  }

  const getCategoryTree = () => {
    const parentCategories = categories.filter(c => !c.parentId)
    return parentCategories.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parentId === parent.id)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">选择产品</h2>
            <p className="text-sm text-gray-500 mt-1">
              已选择 {selectedProducts.size} 个产品，剩余 {availableSlots - selectedProducts.size} 个名额
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索产品名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                全部产品
              </button>
              {getCategoryTree().map(category => (
                <div key={category.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                  {category.children && category.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedCategory(child.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedCategory === child.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无可选产品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map(product => {
                const isSelected = selectedProducts.has(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-3xl">📦</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-900 line-clamp-2">{product.title}</p>
                      {product.category && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{product.category.name}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedProducts.size > 0 && `已选择 ${selectedProducts.size} 个产品`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedProducts.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加产品
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
