'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  type: 'product_image' | 'brochure' | 'store_brochure' | 'logo' | 'banner'
  productId?: string
  title?: string
  onUploadSuccess?: (data: any) => void
  onUploadStart?: () => void
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
}

export default function FileUpload({
  type,
  productId,
  title,
  onUploadSuccess,
  onUploadStart,
  accept,
  maxSizeMB,
  multiple = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set default accept and max size based on type
  const defaultAccept = type === 'brochure' || type === 'store_brochure' ? '.pdf' : 'image/*'
  const defaultMaxSize = type === 'brochure' || type === 'store_brochure' ? 20 : 5
  
  const fileAccept = accept || defaultAccept
  const maxFileSize = maxSizeMB || defaultMaxSize

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError(null)
    setSuccess(null)
    setUploading(true)
    setProgress(0)
    
    // Call onUploadStart callback if provided
    if (onUploadStart) {
      onUploadStart()
    }

    try {
      const results = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Max size: ${maxFileSize}MB`)
        }

        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        if (productId) formData.append('productId', productId)
        if (title) formData.append('title', title)

        // Simulate progress (since fetch doesn't support upload progress natively)
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 200)

        // Upload to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        setProgress(100)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed')
        }

        results.push(data)
      }

      setSuccess(`Successfully uploaded ${files.length} file(s)`)
      setUploading(false)
      setProgress(0)

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(results.length === 1 ? results[0] : results)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'brochure':
        return <FileText className="w-8 h-8" />
      case 'logo':
      case 'banner':
      case 'product_image':
        return <ImageIcon className="w-8 h-8" />
      default:
        return <Upload className="w-8 h-8" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'brochure':
        return 'Upload PDF Brochure'
      case 'logo':
        return 'Upload Company Logo'
      case 'banner':
        return 'Upload Store Banner'
      case 'product_image':
        return multiple ? 'Upload Product Images' : 'Upload Product Image'
      default:
        return 'Upload File'
    }
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}
          ${error ? 'border-red-400 bg-red-50' : ''}
          ${success ? 'border-green-400 bg-green-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={fileAccept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          ) : (
            <div className={`text-gray-400 ${error ? 'text-red-400' : ''} ${success ? 'text-green-600' : ''}`}>
              {getIcon()}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700">
              {uploading ? 'Uploading...' : getLabel()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileAccept.includes('pdf') ? 'PDF files only' : 'JPG, PNG, WebP'} • Max {maxFileSize}MB
              {multiple && ' • Multiple files allowed'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {uploading && progress > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">{progress}%</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-3 flex items-start space-x-2 text-green-600 bg-green-50 p-3 rounded">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">{success}</div>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
