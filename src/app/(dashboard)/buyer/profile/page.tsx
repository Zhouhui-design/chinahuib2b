'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Globe, MapPin, Save } from 'lucide-react'

export default function BuyerProfilePage() {
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    bio: ''
  })
  
  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      if (data.user) {
        setProfileData({
          displayName: data.user.displayName || '',
          company: data.user.company || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          website: data.user.website || '',
          location: data.user.location || '',
          bio: data.user.bio || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }
  
  // Load profile data on mount
  useEffect(() => {
    const fetchData = async () => {
      await loadProfileData()
    }
    void fetchData()
  }, [])
  
  // Get language from cookie
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])
  
  // Translations
  const t = {
    title: language === 'zh' ? '个人资料' : 'Profile',
    subtitle: language === 'zh' ? '管理您的联系信息和个人资料' : 'Manage your contact information and profile',
    
    displayName: language === 'zh' ? '显示名称' : 'Display Name',
    company: language === 'zh' ? '公司' : 'Company',
    email: language === 'zh' ? '邮箱' : 'Email',
    phone: language === 'zh' ? '电话' : 'Phone',
    website: language === 'zh' ? '网站' : 'Website',
    location: language === 'zh' ? '位置' : 'Location',
    bio: language === 'zh' ? '个人简介' : 'Bio',
    
    saveChanges: language === 'zh' ? '保存更改' : 'Save Changes',
    saving: language === 'zh' ? '保存中...' : 'Saving...',
    
    saved: language === 'zh' ? '资料已保存！' : 'Profile saved successfully!',
    error: language === 'zh' ? '保存失败，请重试' : 'Failed to save. Please try again.',
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(t.saved)
      } else {
        setMessage(data.error || t.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(t.error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('saved')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  {t.displayName}
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  {t.company}
                </label>
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {t.email}
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t.website}
                </label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.yourcompany.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t.location}
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.bio}
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? t.saving : t.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
