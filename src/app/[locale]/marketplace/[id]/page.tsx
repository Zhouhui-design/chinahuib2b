/**
 * Task Detail Page
 * Shows full task information and allows applications
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  type: string
  budget: number | null
  price: number | null
  currency: string
  unit: string | null
  minOrderQty: number | null
  deadline: string | null
  status: string
  postedBy: string
  contactInfo: string | null
  applications: number
  views: number
  rating: number | null
  attachments: any[] | null
  createdAt: string
  recentApplications?: any[]
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params['id'] as string

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applying, setApplying] = useState(false)

  // Application form state
  const [applicantMessage, setApplicantMessage] = useState('')
  const [quote, setQuote] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/marketplace/tasks/${taskId}`)
        const data = await response.json()

        if (data.success) {
          setTask(data.data)
        } else {
          setError(data.error || 'Failed to load task')
        }
      } catch (err) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (taskId) {
      fetchTask()
    }
  }, [taskId])

  // Handle application submission
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!applicantMessage.trim()) {
      alert('Please enter a message')
      return
    }

    try {
      setApplying(true)
      
      // In production, get user ID from auth context
      const applicantId = 'current-user-id' // TODO: Replace with actual user ID
      
      const response = await fetch(`/api/marketplace/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantId,
          message: applicantMessage,
          quote: quote ? parseFloat(quote) : null,
          deliveryTime: deliveryTime || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Application submitted successfully!')
        setShowApplyForm(false)
        setApplicantMessage('')
        setQuote('')
        setDeliveryTime('')
        
        // Refresh task data
        const taskResponse = await fetch(`/api/marketplace/tasks/${taskId}`)
        const taskData = await taskResponse.json()
        if (taskData.success) {
          setTask(taskData.data)
        }
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The task you are looking for does not exist.'}</p>
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MANUFACTURING':
        return '🏭 Manufacturing'
      case 'PRODUCT_SALE':
        return '🛍️ Product Sale'
      case 'SERVICE':
        return '🔧 Service'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Marketplace
          </Link>
        </nav>

        {/* Task Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  task.type === 'MANUFACTURING' ? 'bg-blue-100 text-blue-800' :
                  task.type === 'PRODUCT_SALE' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {getTypeLabel(task.type)}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">Posted by <span className="font-semibold">{task.postedBy}</span></p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t">
            <span>👁️ {task.views} views</span>
            <span>📝 {task.applications} applications</span>
            <span>📅 Posted {new Date(task.createdAt).toLocaleDateString()}</span>
            {task.rating && <span>⭐ {task.rating} rating</span>}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Task Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Attachments</h2>
                <div className="space-y-2">
                  {task.attachments.map((attachment: any, index: number) => (
                    <a
                      key={index}
                      href={typeof attachment === 'string' ? attachment : attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      📎 Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Applications */}
            {task.recentApplications && task.recentApplications.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications ({task.recentApplications.length})</h2>
                <div className="space-y-4">
                  {task.recentApplications.map((app: any) => (
                    <div key={app.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-gray-700 mb-2">{app.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {app.quote && <span>💰 Quote: ${app.quote}</span>}
                        {app.deliveryTime && <span>⏱️ Delivery: {app.deliveryTime}</span>}
                        <span>📅 {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Task Info & Actions */}
          <div className="space-y-6">
            {/* Task Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Task Details</h2>
              
              <div className="space-y-4">
                {task.budget && (
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${task.budget.toLocaleString()} {task.currency}
                    </p>
                  </div>
                )}
                
                {task.price && (
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${task.price} {task.currency}
                      {task.unit && <span className="text-sm text-gray-500">/{task.unit}</span>}
                    </p>
                  </div>
                )}
                
                {task.deadline && (
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {task.minOrderQty && (
                  <div>
                    <p className="text-sm text-gray-600">Min Order Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {task.minOrderQty} units
                    </p>
                  </div>
                )}
                
                {task.contactInfo && (
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="text-sm text-gray-900">{task.contactInfo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {task.status === 'OPEN' ? (
                <>
                  <button
                    onClick={() => setShowApplyForm(!showApplyForm)}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                  >
                    {showApplyForm ? 'Cancel' : 'Apply Now'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Submit your proposal to the task poster
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 font-semibold">This task is no longer accepting applications</p>
                  <p className="text-sm text-gray-500 mt-1">Status: {task.status}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Apply for Task</h2>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      value={applicantMessage}
                      onChange={(e) => setApplicantMessage(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Introduce yourself and explain why you're qualified for this task..."
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Quote (USD)
                      </label>
                      <input
                        type="number"
                        value={quote}
                        onChange={(e) => setQuote(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your price"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Delivery Time
                      </label>
                      <input
                        type="text"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 2 weeks, 30 days"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={applying}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
