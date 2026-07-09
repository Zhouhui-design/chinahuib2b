'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, Search, RefreshCw, Check, ToggleLeft, ToggleRight } from 'lucide-react'

interface Unit {
  id: string
  name: string
  nameEn: string
  symbol: string | null
  description: string | null
  isEnabled: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    symbol: '',
    description: '',
    sortOrder: 0,
  })

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/units?all=true')
      if (response.ok) {
        const data = await response.json()
        setUnits(data.data)
      }
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit)
      setFormData({
        name: unit.name,
        nameEn: unit.nameEn,
        symbol: unit.symbol || '',
        description: unit.description || '',
        sortOrder: unit.sortOrder,
      })
    } else {
      setEditingUnit(null)
      setFormData({
        name: '',
        nameEn: '',
        symbol: '',
        description: '',
        sortOrder: 0,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUnit(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.nameEn.trim()) {
      alert('请填写单位名称')
      return
    }

    try {
      if (editingUnit) {
        await fetch('/api/admin/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            id: editingUnit.id,
            ...formData,
            isEnabled: editingUnit.isEnabled,
          }),
        })
      } else {
        await fetch('/api/admin/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            ...formData,
          }),
        })
      }
      handleCloseModal()
      fetchUnits()
    } catch (error) {
      alert('保存失败')
    }
  }

  const handleToggleStatus = async (unit: Unit) => {
    try {
      await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: unit.id,
          name: unit.name,
          nameEn: unit.nameEn,
          symbol: unit.symbol,
          description: unit.description,
          sortOrder: unit.sortOrder,
          isEnabled: !unit.isEnabled,
        }),
      })
      fetchUnits()
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`确定删除单位 "${unit.name}"？`)) return
    try {
      await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id: unit.id,
        }),
      })
      fetchUnits()
    } catch (error) {
      alert('删除失败，该单位可能正在被使用')
    }
  }

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.symbol && unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">单位管理</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchUnits()}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加单位
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索单位名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">序号</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">单位名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">英文名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">符号</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">描述</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">排序</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUnits.map((unit, index) => (
                <tr key={unit.id}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{unit.name}</td>
                  <td className="px-6 py-4">{unit.nameEn}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">{unit.symbol || '-'}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{unit.description || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(unit)}
                      className={`p-2 rounded-lg transition-colors ${
                        unit.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {unit.isEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">{unit.sortOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(unit)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit)}
                        className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUnits.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无单位</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUnit ? '编辑单位' : '添加单位'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位名称（中文）*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：千克"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位名称（英文）*</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：Kilogram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">单位符号</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="单位描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
