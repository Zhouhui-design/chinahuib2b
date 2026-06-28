'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Save, Mail, Lock, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function BuyerSettingsPage() {
  const [language, setLanguage] = useState('en')
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    website: '',
    location: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      if (data.user) {
        setProfileData({
          displayName: data.user.displayName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          website: data.user.website || '',
          location: data.user.location || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1]
      setLanguage(lang || 'en')
    }
  }, [])

  const t = {
    title: language === 'zh' ? '账户设置' : 'Account Settings',
    
    tabs: {
      profile: language === 'zh' ? '个人资料' : 'Profile',
      notifications: language === 'zh' ? '通知设置' : 'Notifications',
      security: language === 'zh' ? '安全设置' : 'Security',
    },
    
    profile: {
      displayName: language === 'zh' ? '显示名称' : 'Display Name',
      email: language === 'zh' ? '邮箱' : 'Email',
      phone: language === 'zh' ? '电话' : 'Phone',
      website: language === 'zh' ? '网站' : 'Website',
      location: language === 'zh' ? '位置' : 'Location',
      saveChanges: language === 'zh' ? '保存更改' : 'Save Changes',
      saving: language === 'zh' ? '保存中...' : 'Saving...',
    },
    
    notifications: {
      title: language === 'zh' ? '通知偏好' : 'Notification Preferences',
      emailNotifications: language === 'zh' ? '邮件通知' : 'Email Notifications',
      emailNotificationsDesc: language === 'zh' ? '接收重要账户更新的邮件' : 'Receive emails for important account updates',
      orderUpdates: language === 'zh' ? '订单更新' : 'Order Updates',
      orderUpdatesDesc: language === 'zh' ? '收到新订单或订单状态变更时通知' : 'Get notified when you receive new orders or order status changes',
      marketingEmails: language === 'zh' ? '营销邮件' : 'Marketing Emails',
      marketingEmailsDesc: language === 'zh' ? '接收促销活动和平台新闻' : 'Receive promotional offers and platform news',
      securityAlerts: language === 'zh' ? '安全提醒' : 'Security Alerts',
      securityAlertsDesc: language === 'zh' ? '接收登录尝试和安全相关的提醒' : 'Get alerts about login attempts and security-related issues',
    },
    
    security: {
      title: language === 'zh' ? '修改密码' : 'Change Password',
      currentPassword: language === 'zh' ? '当前密码' : 'Current Password',
      newPassword: language === 'zh' ? '新密码' : 'New Password',
      confirmPassword: language === 'zh' ? '确认新密码' : 'Confirm New Password',
      updatePassword: language === 'zh' ? '更新密码' : 'Update Password',
      updating: language === 'zh' ? '更新中...' : 'Updating...',
    },
    
    messages: {
      saved: language === 'zh' ? '设置已保存！' : 'Settings saved successfully!',
      error: language === 'zh' ? '保存失败，请重试' : 'Failed to save settings. Please try again.',
      passwordUpdated: language === 'zh' ? '密码已更新！' : 'Password updated successfully!',
      passwordMismatch: language === 'zh' ? '两次输入的密码不一致' : 'Passwords do not match',
      weakPassword: language === 'zh' ? '密码强度不足' : 'Password is too weak',
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
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
        setMessage(t.messages.saved)
      } else {
        setMessage(data.error || t.messages.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(t.messages.error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage(t.messages.passwordMismatch)
      setLoading(false)
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage(t.messages.weakPassword)
      setLoading(false)
      return
    }
    
    try {
      setTimeout(() => {
        setMessage(t.messages.passwordUpdated)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage(t.messages.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                {t.tabs.profile}
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                {t.tabs.notifications}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5 mr-3" />
                {t.tabs.security}
              </button>
            </nav>
          </aside>

          <main className="flex-1">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('success') || message.includes('saved') || message.includes('updated')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.tabs.profile}</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        {t.profile.displayName}
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        {t.profile.email}
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
                        {t.profile.phone}
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        {t.profile.website}
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.example.com"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.profile.location}
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, Country"
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
                      {loading ? t.profile.saving : t.profile.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.notifications.title}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{t.notifications.emailNotifications}</h3>
                      <p className="text-sm text-gray-600">{t.notifications.emailNotificationsDesc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, emailNotifications: !notificationSettings.emailNotifications})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{t.notifications.orderUpdates}</h3>
                      <p className="text-sm text-gray-600">{t.notifications.orderUpdatesDesc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, orderUpdates: !notificationSettings.orderUpdates})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.orderUpdates ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notificationSettings.orderUpdates ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{t.notifications.marketingEmails}</h3>
                      <p className="text-sm text-gray-600">{t.notifications.marketingEmailsDesc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, marketingEmails: !notificationSettings.marketingEmails})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notificationSettings.marketingEmails ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{t.notifications.securityAlerts}</h3>
                      <p className="text-sm text-gray-600">{t.notifications.securityAlertsDesc}</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({...notificationSettings, securityAlerts: !notificationSettings.securityAlerts})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.securityAlerts ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notificationSettings.securityAlerts ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.security.title}</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      {t.security.currentPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      {t.security.newPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-1" />
                      {t.security.confirmPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {t.security.passwordRequirements}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? t.security.updating : t.security.updatePassword}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}