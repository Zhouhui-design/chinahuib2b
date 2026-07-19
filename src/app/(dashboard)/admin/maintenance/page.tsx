'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CheckCircle, Plus, Edit2, Trash2, Send, Play, Square } from 'lucide-react'

interface MaintenanceNotice {
  id: string
  title: string
  titleEn: string | null
  content: string
  contentEn: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: string
  scheduledStart: string | null
  estimatedDuration: number | null
  actualEndTime: string | null
  notifiedUsers: number
  createdAt: string
  updatedAt: string
}

export default function MaintenancePage() {
  const [notices, setNotices] = useState<MaintenanceNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<MaintenanceNotice | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    scheduledStart: '',
    estimatedDuration: 30,
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/maintenance')
      const data = await response.json()
      if (data.success) {
        setNotices(data.notices)
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (notice?: MaintenanceNotice) => {
    if (notice) {
      setEditingNotice(notice)
      setFormData({
        title: notice.title,
        titleEn: notice.titleEn || '',
        content: notice.content,
        contentEn: notice.contentEn || '',
        scheduledStart: notice.scheduledStart ? new Date(notice.scheduledStart).toISOString().slice(0, 16) : '',
        estimatedDuration: notice.estimatedDuration || 30,
      })
    } else {
      setEditingNotice(null)
      setFormData({
        title: '',
        titleEn: '',
        content: '',
        contentEn: '',
        scheduledStart: '',
        estimatedDuration: 30,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingNotice ? '/api/maintenance' : '/api/maintenance'
      const method = editingNotice ? 'PUT' : 'POST'
      
      const body = editingNotice 
        ? { id: editingNotice.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        fetchNotices()
      }
    } catch (error) {
      console.error('Failed to save notice:', error)
    }
  }

  const handleStatusChange = async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      const data = await response.json()
      if (data.success) {
        fetchNotices()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个维护通知吗？')) return
    
    try {
      const response = await fetch(`/api/maintenance?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        fetchNotices()
      }
    } catch (error) {
      console.error('Failed to delete notice:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-amber-100 text-amber-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return '维护进行中'
      case 'PENDING': return '即将开始'
      case 'COMPLETED': return '已完成'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return <AlertTriangle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">维护通知管理</h1>
          <p className="text-gray-600 mt-1">管理系统维护通知，向用户发布更新信息</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          创建通知
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">暂无维护通知</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            创建第一个通知
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预计时长
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  通知用户数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notice.status)}`}>
                      {getStatusIcon(notice.status)}
                      <span className="ml-1">{getStatusText(notice.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {notice.estimatedDuration ? `${notice.estimatedDuration}分钟` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {notice.notifiedUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(notice.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {notice.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(notice.id, 'IN_PROGRESS')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          title="开始维护"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {notice.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(notice.id, 'COMPLETED')}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          title="完成维护"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(notice)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingNotice ? '编辑维护通知' : '创建维护通知'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题（中文）*
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题（英文）
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容（中文）*
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容（英文）
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预计开始时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预计时长（分钟）
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 30 })}
                  min={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {editingNotice ? '保存修改' : '发布通知'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}