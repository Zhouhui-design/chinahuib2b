'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { dictionaries } from '@/locales/dictionary'
import type { LanguageCode } from '@/lib/languages'
import { Bell, BellOff, MarkAsRead, Trash2, AlertCircle, MessageSquare, ShoppingBag, Wallet, Users, Settings, Filter, Search, RefreshCw, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react'

type Notice = {
  id: string
  title: string
  content: string
  senderId: string
  sender: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isGlobal: boolean
  expiresAt: string | null
  createdAt: string
  isRead: boolean
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-300', badge: 'bg-gray-200 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', badge: 'bg-yellow-200 text-yellow-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300', badge: 'bg-orange-200 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300', badge: 'bg-red-200 text-red-700' },
}

export default function NotificationsPage() {
  const params = useParams()
  const locale = (params.locale as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en
  
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    mentions: true,
    system: true,
    transactions: true,
    messages: true,
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/notices')
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      const data = await response.json()
      setNotices(data || [])
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (noticeId: string) => {
    try {
      await fetch(`/api/notices/${noticeId}/read`, {
        method: 'POST',
      })
      setNotices(notices.map(n => n.id === noticeId ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notices/read-all', {
        method: 'POST',
      })
      setNotices(notices.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read')
    }
  }

  const deleteNotice = async (noticeId: string) => {
    try {
      await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
      })
      setNotices(notices.filter(n => n.id !== noticeId))
    } catch (err) {
      console.error('Failed to delete notice')
    }
  }

  const filteredNotices = notices.filter(notice => {
    if (filterPriority !== 'all' && notice.priority !== filterPriority) {
      return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return notice.title.toLowerCase().includes(query) ||
             notice.content.toLowerCase().includes(query)
    }
    return true
  })

  const unreadCount = notices.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                {dict.notifications?.title || 'Notifications'}
              </h1>
              <p className="text-gray-600 mt-2">
                {dict.notifications?.description || `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                {dict.notifications?.markAllRead || 'Mark All Read'}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{dict.notifications?.notificationSettings || 'Notification Settings'}</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'email', label: dict.notifications?.emailNotifications || 'Email Notifications' },
                { key: 'push', label: dict.notifications?.pushNotifications || 'Push Notifications' },
                { key: 'mentions', label: dict.notifications?.mentions || 'Mentions' },
                { key: 'system', label: dict.notifications?.system || 'System Updates' },
                { key: 'transactions', label: dict.notifications?.transactions || 'Transaction Alerts' },
                { key: 'messages', label: dict.notifications?.messages || 'New Messages' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700">{label}</span>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-12 h-6 rounded-full transition-colors ${notificationSettings[key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${notificationSettings[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={dict.notifications?.search || 'Search notifications...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{dict.notifications?.allPriority || 'All Priority'}</option>
            <option value="urgent">{dict.notifications?.urgent || 'Urgent'}</option>
            <option value="high">{dict.notifications?.high || 'High'}</option>
            <option value="medium">{dict.notifications?.medium || 'Medium'}</option>
            <option value="low">{dict.notifications?.low || 'Low'}</option>
          </select>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{dict.notifications?.noNotifications || 'No notifications found.'}</p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const config = priorityConfig[notice.priority]
              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${config.color} ${!notice.isRead ? 'ring-2 ring-blue-100' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        {notice.isGlobal ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <MessageSquare className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}>
                            {dict.notifications?.[notice.priority] || config.label}
                          </span>
                          {!notice.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notice.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notice.createdAt).toLocaleDateString(locale)}
                          </span>
                          {notice.sender && (
                            <span>{notice.sender.displayName || notice.sender.username}</span>
                          )}
                          {notice.isGlobal && (
                            <span className="text-blue-600">{dict.notifications?.system || 'System'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notice.isRead && (
                        <button
                          onClick={() => markAsRead(notice.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={dict.notifications?.markRead || 'Mark as read'}
                        >
                          <MarkAsRead className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={dict.notifications?.delete || 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}