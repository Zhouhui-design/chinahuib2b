'use client'

import { useState } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Video, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  fileType: string
  label: string
  description: string
  accept: string
  onUploadComplete?: (file: any) => void
}

export default function VerificationFileUpload({ 
  fileType, 
  label, 
  description,
  accept,
  onUploadComplete 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', fileType)

      const response = await fetch('/api/seller/verification/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess('File uploaded successfully!')
      if (onUploadComplete) {
        onUploadComplete(data.file)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const getFileIcon = () => {
    if (fileType === 'VIDEO') return <Video className="w-5 h-5" />
    if (['PHOTO'].includes(fileType)) return <ImageIcon className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 text-gray-400">
          {getFileIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">{label}</h4>
          <p className="text-xs text-gray-500 mb-3">{description}</p>
          
          <div className="flex items-center space-x-3">
            <label className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
              <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
            
            {success && (
              <span className="inline-flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {success}
              </span>
            )}
          </div>
          
          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
