'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, AlertTriangle } from 'lucide-react'

interface TaskActionsProps {
  taskId: string
  locale: string
  isOwner: boolean
  labels: {
    edit: string
    delete: string
    confirmDelete: string
    confirmDeleteDesc: string
    cancel: string
    confirm: string
    deleting: string
    deleteFailed: string
  }
}

export default function TaskActions({ taskId, locale, isOwner, labels }: TaskActionsProps) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // 如果不是任务发布者，不显示任何按钮
  if (!isOwner) return null

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/marketplace/tasks/${taskId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || labels.deleteFailed)
      }

      // 删除成功，跳转到 marketplace 列表页
      router.push(`/${locale}/marketplace`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.deleteFailed)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="flex gap-3">
        <Link
          href={`/${locale}/marketplace/${taskId}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          {labels.edit}
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {labels.delete}
        </button>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{labels.confirmDelete}</h3>
            </div>
            <p className="text-gray-600 mb-6">{labels.confirmDeleteDesc}</p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setError('')
                }}
                disabled={deleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {labels.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {labels.deleting}
                  </>
                ) : (
                  labels.confirm
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
