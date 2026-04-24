'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/ui/FileUpload'
import { Loader2, Trash2, Download, FileText, Plus, AlertCircle } from 'lucide-react'

interface Brochure {
  id: string
  title: string
  fileUrl: string
  downloadCount: number
  createdAt: string
}

export default function BrochuresPage() {
  const router = useRouter()
  const [brochures, setBrochures] = useState<Brochure[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Load brochures list
  const loadBrochures = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/seller/brochures')
      
      if (!response.ok) {
        throw new Error('Failed to load brochures')
      }
      
      const data = await response.json()
      setBrochures(data.brochures)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brochures')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrochures()
  }, [])

  // Delete brochure
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/brochures/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete brochure')
      }

      // Update list (optimistic update)
      setBrochures(prev => prev.filter(b => b.id !== id))
      alert('Brochure deleted successfully')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete brochure')
    } finally {
      setDeletingId(null)
    }
  }

  // Upload success callback
  const handleUploadSuccess = (data: any) => {
    setUploading(false)
    // Reload list after upload
    loadBrochures()
  }

  const handleUploadStart = () => {
    setUploading(true)
  }

  if (loading && brochures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Brochure Manager</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload company catalogs, certification documents, and other PDF files for buyers to download
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadBrochures}
              className="text-xs text-red-600 hover:text-red-700 underline mt-1"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Upload New Brochure
          </h2>
          
          <FileUpload
            type="store_brochure"
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
          />
          
          <p className="text-xs text-gray-500 mt-3">
            Supported format: PDF • Maximum file size: 20MB • Files will appear in your store's brochure section
          </p>
          
          {uploading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>

        {/* Uploaded Brochures List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Uploaded Brochures ({brochures.length})
          </h2>

          {brochures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No brochures yet</p>
              <p className="text-sm text-gray-400">Upload your first brochure using the form above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {brochures.map((brochure) => (
                <div
                  key={brochure.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-10 h-10 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{brochure.title}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {brochure.downloadCount} downloads
                        </span>
                        <span>
                          📅 {new Date(brochure.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={brochure.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Preview/Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(brochure.id, brochure.title)}
                      disabled={deletingId === brochure.id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete brochure"
                    >
                      {deletingId === brochure.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
