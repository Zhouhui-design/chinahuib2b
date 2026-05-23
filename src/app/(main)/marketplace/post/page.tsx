/**
 * Post Task Page
 * Allows users to create new marketplace tasks
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PostTaskPage() {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MANUFACTURING',
    budget: '',
    price: '',
    currency: 'USD',
    unit: '',
    minOrderQty: '',
    deadline: '',
    contactInfo: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [aiGenerating, setAiGenerating] = useState(false)

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.title.trim()) {
      newErrors['title'] = 'Title is required'
    }
    
    if (!formData.description.trim()) {
      newErrors['description'] = 'Description is required'
    } else if (formData.description.length < 50) {
      newErrors['description'] = 'Description must be at least 50 characters'
    }
    
    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors['budget'] = 'Budget must be a number'
    }
    
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors['price'] = 'Price must be a number'
    }
    
    if (formData.minOrderQty && isNaN(Number(formData.minOrderQty))) {
      newErrors['minOrderQty'] = 'Min order quantity must be a number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // AI Generate Description
  const handleAIGenerate = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title first')
      return
    }
    
    try {
      setAiGenerating(true)
      
      // TODO: Implement actual AI API call
      // For now, simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock AI-generated description based on title and type
      const mockDescriptions: Record<string, string> = {
        MANUFACTURING: `We are looking for a reliable manufacturer to produce ${formData.title.toLowerCase()}. 

Requirements:
- High quality standards
- Competitive pricing
- On-time delivery
- Experience in similar products

Please provide:
1. Your manufacturing capabilities
2. Sample products or portfolio
3. Pricing structure
4. Production timeline
5. Minimum order quantities

We are ready to start immediately and looking for long-term partnership.`,
        
        PRODUCT_SALE: `We are offering ${formData.title.toLowerCase()} for sale.

Product Details:
- High quality product
- Competitive wholesale pricing
- Bulk discounts available
- Fast shipping worldwide

Specifications:
- Please contact for detailed specifications
- Custom packaging available
- Sample orders welcome

Ideal for retailers, distributors, and resellers. Contact us for pricing and availability.`,
        
        SERVICE: `We are providing professional ${formData.title.toLowerCase()} services.

Our Services Include:
- Expert consultation
- High-quality deliverables
- Fast turnaround time
- Competitive pricing
- Customer satisfaction guaranteed

Why Choose Us:
- Years of experience
- Professional team
- Proven track record
- Flexible scheduling
- Affordable rates

Contact us today to discuss your requirements and get a custom quote.`
      }
      
      const generatedDescription = mockDescriptions[formData.type as keyof typeof mockDescriptions] || mockDescriptions['MANUFACTURING']
      
      setFormData(prev => ({ ...prev, description: generatedDescription || '' }))
      
      alert('AI has generated a description for you! You can edit it as needed.')
    } catch (error) {
      console.error('AI generation error:', error)
      alert('Failed to generate description. Please try again.')
    } finally {
      setAiGenerating(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      
      // In production, get user ID from auth context
      const postedBy = 'current-user-id' // TODO: Replace with actual user ID
      
      const response = await fetch('/api/marketplace/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          postedBy,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          price: formData.price ? parseFloat(formData.price) : null,
          minOrderQty: formData.minOrderQty ? parseInt(formData.minOrderQty) : null,
          deadline: formData.deadline || null,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Task posted successfully!')
        router.push(`/marketplace/${data.data.id}`)
      } else {
        alert(data.error || 'Failed to post task')
      }
    } catch (error) {
      console.error('Error posting task:', error)
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            ← Back to Marketplace
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Post a New Task</h1>
          <p className="text-gray-600 mt-2">
            Describe what you need and connect with qualified suppliers, sellers, or service providers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Looking for Factory to Produce Wireless Earbuds"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MANUFACTURING">🏭 Manufacturing - Looking for factory/manufacturer</option>
              <option value="PRODUCT_SALE">🛍️ Product Sale - Selling products</option>
              <option value="SERVICE">🔧 Service - Offering services</option>
            </select>
          </div>

          {/* Description with AI Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiGenerating || !formData.title}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiGenerating ? '✨ Generating...' : '✨ AI Generate'}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={10}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your requirements in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum 50 characters. Use the AI Generate button for assistance.
            </p>
          </div>

          {/* Budget and Price */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Total budget"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Price per unit"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Currency and Unit */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit (Optional)
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., per unit, per hour, per piece"
              />
            </div>
          </div>

          {/* Min Order Qty and Deadline */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order Quantity (Optional)
              </label>
              <input
                type="number"
                name="minOrderQty"
                value={formData.minOrderQty}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minOrderQty ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Minimum quantity"
                min="1"
              />
              {errors.minOrderQty && (
                <p className="mt-1 text-sm text-red-600">{errors.minOrderQty}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information (Optional)
            </label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email, phone, or other contact details"
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be visible to applicants. Leave blank to use your profile contact info.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post Task'}
            </button>
            <Link
              href="/marketplace"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Posting Tasks</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Be specific about your requirements to attract qualified applicants</li>
            <li>• Include realistic budgets to set clear expectations</li>
            <li>• Provide detailed descriptions to reduce back-and-forth communication</li>
            <li>• Set reasonable deadlines to ensure quality work</li>
            <li>• Use AI Generate to get a professional description template</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
