'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronRight } from 'lucide-react'

interface Booth {
  id: string
  name: string
  names?: Record<string, string>
  exhibitionName: string
  exhibitionDates?: { start: string; end: string }
  location?: string
  theme?: string
  colorScheme?: string
  layout?: string
  isActive: boolean
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function BoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    exhibitionName: '',
    location: '',
    theme: '',
    colorScheme: '',
    layout: ''
  })

  useEffect(() => {
    fetchBooths()
  }, [])

  const fetchBooths = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/booths')
      const data = await res.json()
      if (data.booths) {
        setBooths(data.booths)
      }
    } catch (error) {
      console.error('Failed to fetch booths:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const method = editingBooth ? 'PUT' : 'POST'
      const body = editingBooth 
        ? { ...formData, id: editingBooth.id }
        : formData

      const res = await fetch('/api/booths', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.success) {
        setShowCreateModal(false)
        setEditingBooth(null)
        setFormData({
          name: '',
          exhibitionName: '',
          location: '',
          theme: '',
          colorScheme: '',
          layout: ''
        })
        fetchBooths()
      }
    } catch (error) {
      console.error('Failed to save booth:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booth?')) return
    
    try {
      const res = await fetch(`/api/booths?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchBooths()
      }
    } catch (error) {
      console.error('Failed to delete booth:', error)
    }
  }

  const handleTogglePublish = async (booth: Booth) => {
    try {
      const res = await fetch('/api/booths', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booth.id,
          isPublished: !booth.isPublished
        })
      })
      const data = await res.json()
      if (data.success) {
        fetchBooths()
      }
    } catch (error) {
      console.error('Failed to update booth:', error)
    }
  }

  const openEditModal = (booth: Booth) => {
    setEditingBooth(booth)
    setFormData({
      name: booth.name,
      exhibitionName: booth.exhibitionName,
      location: booth.location || '',
      theme: booth.theme || '',
      colorScheme: booth.colorScheme || '',
      layout: booth.layout || ''
    })
    setShowCreateModal(true)
  }

  const themeOptions = ['Light', 'Dark', 'Vibrant', 'Professional']
  const layoutOptions = ['Modern', 'Classic', 'Grid', 'Minimal']

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Booths</h1>
          <p className="text-gray-500 mt-1">Manage your exhibition booths for different trade shows</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Booth
        </button>
      </div>

      {/* Booth Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : booths.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No booths yet</h3>
          <p className="text-gray-500 mb-4">Create your first booth to showcase your products at different exhibitions</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Booth
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {booths.map((booth) => (
            <div
              key={booth.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{booth.name}</h3>
                  <p className="text-sm text-gray-500">{booth.exhibitionName}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    booth.isPublished 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {booth.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {booth.location && (
                <p className="text-sm text-gray-600 mb-2">📍 {booth.location}</p>
              )}

              {booth.exhibitionDates && (
                <p className="text-sm text-gray-600 mb-3">
                  📅 {booth.exhibitionDates.start} - {booth.exhibitionDates.end}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
                {booth.theme && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                    {booth.theme}
                  </span>
                )}
                {booth.layout && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    {booth.layout}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Created: {new Date(booth.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(booth)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    title={booth.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {booth.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(booth)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(booth.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button className="w-full mt-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1 text-sm font-medium">
                View Booth <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingBooth ? 'Edit Booth' : 'Create New Booth'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booth Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Spring Fair 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exhibition Name *
                </label>
                <input
                  type="text"
                  value={formData.exhibitionName}
                  onChange={(e) => setFormData({ ...formData, exhibitionName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Canton Fair"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Guangzhou, China"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select theme</option>
                  {themeOptions.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout
                </label>
                <select
                  value={formData.layout}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select layout</option>
                  {layoutOptions.map((layout) => (
                    <option key={layout} value={layout}>{layout}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingBooth(null)
                  setFormData({
                    name: '',
                    exhibitionName: '',
                    location: '',
                    theme: '',
                    colorScheme: '',
                    layout: ''
                  })
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingBooth ? 'Save Changes' : 'Create Booth'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
