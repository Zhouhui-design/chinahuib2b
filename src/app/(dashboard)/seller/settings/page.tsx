'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/auth'
import { User, Mail, Phone, Building, Globe, Bell, Shield, Save, Upload, FileText, Image as ImageIcon, CreditCard, Video, CheckCircle } from 'lucide-react'

export default function SellerSettingsPage() {
  const [language, setLanguage] = useState('en')
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Form states
  const [profileData, setProfileData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    description: ''
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
  
  // Get language from cookie
  useEffect(() => {
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      setLanguage(langCookie.split('=')[1])
    }
  }, [])
  
  // Translations
  const t = {
    title: language === 'zh' ? '账户设置' :
           language === 'ja' ? 'アカウント設定' :
           language === 'ar' ? 'إعدادات الحساب' :
           language === 'es' ? 'Configuración de la cuenta' :
           language === 'fr' ? 'Paramètres du compte' :
           language === 'de' ? 'Kontoeinstellungen' :
           language === 'ko' ? '계정 설정' :
           language === 'ru' ? 'Настройки аккаунта' :
           language === 'pt' ? 'Configurações da conta' :
           language === 'hi' ? 'खाता सेटिंग्स' :
           language === 'th' ? 'การตั้งค่าบัญชี' :
           language === 'vi' ? 'Cài đặt tài khoản' :
           'Account Settings',
    
    tabs: {
      profile: language === 'zh' ? '个人资料' : 'Profile',
      notifications: language === 'zh' ? '通知设置' : 'Notifications',
      security: language === 'zh' ? '安全设置' : 'Security',
    },
    
    profile: {
      companyName: language === 'zh' ? '公司名称' : 'Company Name',
      contactName: language === 'zh' ? '联系人姓名' : 'Contact Name',
      email: language === 'zh' ? '邮箱地址' : 'Email Address',
      phone: language === 'zh' ? '电话号码' : 'Phone Number',
      website: language === 'zh' ? '网站' : 'Website',
      address: language === 'zh' ? '地址' : 'Address',
      city: language === 'zh' ? '城市' : 'City',
      country: language === 'zh' ? '国家' : 'Country',
      description: language === 'zh' ? '公司简介' : 'Company Description',
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
      passwordRequirements: language === 'zh' ? '密码要求：至少 8 个字符，包含大小写字母和数字' : 'Password requirements: At least 8 characters, including uppercase, lowercase, and numbers',
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
      // TODO: Implement API call to save profile
      // await fetch('/api/seller/profile', { method: 'PUT', body: JSON.stringify(profileData) })
      
      setTimeout(() => {
        setMessage(t.messages.saved)
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage(t.messages.error)
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
      // TODO: Implement API call to update password
      // await fetch('/api/seller/password', { method: 'PUT', body: JSON.stringify(passwordData) })
      
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Tabs */}
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

          {/* Content */}
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

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.tabs.profile}</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-1" />
                        {t.profile.companyName}
                      </label>
                      <input
                        type="text"
                        value={profileData.companyName}
                        onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Company Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        {t.profile.contactName}
                      </label>
                      <input
                        type="text"
                        value={profileData.contactName}
                        onChange={(e) => setProfileData({...profileData, contactName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contact Person Name"
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
                        placeholder="company@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.profile.country}
                      </label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.profile.address}
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Street Address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.profile.city}
                    </label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.profile.description}
                    </label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell buyers about your company..."
                    />
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

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.notifications.title}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.emailNotifications}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.emailNotificationsDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.orderUpdates}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.orderUpdatesDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderUpdates}
                        onChange={(e) => setNotificationSettings({...notificationSettings, orderUpdates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.marketingEmails}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.marketingEmailsDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings({...notificationSettings, marketingEmails: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{t.notifications.securityAlerts}</h3>
                      <p className="text-sm text-gray-600 mt-1">{t.notifications.securityAlertsDesc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.securityAlerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, securityAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t.security.title}</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.security.currentPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.security.newPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.security.passwordRequirements}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.security.confirmPassword}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-2" />
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
