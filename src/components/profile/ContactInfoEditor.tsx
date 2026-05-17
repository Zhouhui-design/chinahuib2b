'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Globe, Phone, Mail, MapPin, MessageCircle, Linkedin, Facebook, Instagram } from 'lucide-react'

interface ContactInfo {
  displayName?: string
  company?: string
  phone?: string
  website?: string
  location?: string
  bio?: string
  whatsapp?: string
  wechat?: string
  telegram?: string
  linkedin?: string
  facebook?: string
  instagram?: string
}

export default function ContactInfoEditor({ 
  initialData, 
  onSave,
  isSeller = false 
}: { 
  initialData?: ContactInfo
  onSave: (data: ContactInfo) => Promise<void>
  isSeller?: boolean
}) {
  const [formData, setFormData] = useState<ContactInfo>(initialData || {})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      await onSave(formData)
      setMessage({ type: 'success', text: 'Contact information saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' })
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-500" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.yourcompany.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Description
            </label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself or your business..."
            />
          </div>
        </div>
      </div>

      {/* Social Media & Messaging */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-500" />
          Social Media & Messaging
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WeChat
            </label>
            <input
              type="text"
              value={formData.wechat || ''}
              onChange={(e) => handleChange('wechat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="WeChat ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telegram
            </label>
            <input
              type="text"
              value={formData.telegram || ''}
              onChange={(e) => handleChange('telegram', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Linkedin className="w-4 h-4 inline mr-1 text-blue-700" />
              LinkedIn
            </label>
            <input
              type="url"
              value={formData.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook className="w-4 h-4 inline mr-1 text-blue-600" />
              Facebook
            </label>
            <input
              type="url"
              value={formData.facebook || ''}
              onChange={(e) => handleChange('facebook', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="https://facebook.com/page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Instagram className="w-4 h-4 inline mr-1 text-pink-600" />
              Instagram
            </label>
            <input
              type="url"
              value={formData.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              placeholder="https://instagram.com/username"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {message && (
          <div className={`px-4 py-2 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSaving}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
