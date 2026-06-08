'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Send, Globe, Sparkles, MessageSquare, Users, TrendingUp, Filter, Search, Image, Paperclip, Smile, MapPin, Tag, Clock, Eye, AlertCircle, Bell, BellOff, Volume2, VolumeX, Shield, Zap, Crown, ShoppingBag } from 'lucide-react'
import type { LanguageCode } from '@/lib/languages'
import { dictionaries } from '@/locales/dictionary'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const DynamicSessionProvider = dynamic(
  () => import('@/components/providers/SessionProvider').then(mod => mod.SessionProvider),
  { ssr: false }
)

type User = {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  role: string
  isOnline: boolean
  sellerProfile?: {
    id: string
    companyName: string
    logoUrl: string | null
    isVerified: boolean
  } | null
}

type PublicMessage = {
  id: string
  content: string
  senderId: string
  sender: User
  linkedSellerId: string | null
  linkedSeller: any
  isSystemMessage: boolean
  isAnnouncement: boolean
  isWorldChat: boolean
  priority: number
  reactions: any
  createdAt: string
  language?: string
}

type ShoutOut = {
  id: string
  content: string
  senderId: string
  sender: User
  isFree: boolean
  cost: number | null
  priority: number
  expiresAt: string | null
  viewCount: number
  clickCount: number
  createdAt: string
  type: 'product' | 'service' | 'demand' | 'general'
  tags: string[]
  location?: string
}

type Notice = {
  id: string
  title: string
  content: string
  senderId: string
  sender: User
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isGlobal: boolean
  expiresAt: string | null
  createdAt: string
}

type PostType = 'product' | 'service' | 'demand'

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-600', badge: 'text-gray-400' },
  medium: { label: 'Medium', color: 'bg-yellow-600', badge: 'text-yellow-400' },
  high: { label: 'High', color: 'bg-orange-600', badge: 'text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-600', badge: 'text-red-400' },
}

export default function ChatHallPage() {
  return (
    <DynamicSessionProvider>
      <ErrorBoundary>
        <ChatHallContent />
      </ErrorBoundary>
    </DynamicSessionProvider>
  )
}

function ChatHallContent() {
  const params = useParams()
  const locale = (params.locale as LanguageCode) || 'en'
  const dict = dictionaries[locale] || dictionaries.en
  
  const postTypeConfig = {
    product: { icon: '📦', label: dict.chatHall.product, color: 'bg-green-600', bgLight: 'bg-green-50', textColor: 'text-green-700' },
    service: { icon: '🛠️', label: dict.chatHall.service, color: 'bg-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
    demand: { icon: '💡', label: dict.chatHall.demand, color: 'bg-purple-600', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
    general: { icon: '💬', label: dict.chatHall.general || 'General', color: 'bg-slate-600', bgLight: 'bg-slate-50', textColor: 'text-slate-700' },
  }
  
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<string>('loading')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  // Chat states
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([])
  const [worldChatMessages, setWorldChatMessages] = useState<PublicMessage[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [shoutOuts, setShoutOuts] = useState<ShoutOut[]>([])
  
  // Form states
  const [newMessage, setNewMessage] = useState('')
  const [newWorldChat, setNewWorldChat] = useState('')
  const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent' })
  
  // UI states
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [sendingWorldChat, setSendingWorldChat] = useState(false)
  const [sendingNotice, setSendingNotice] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'world' | 'notices' | 'posts'>('chat')
  const [selectedPostType, setSelectedPostType] = useState<PostType>('product')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<PostType | 'all'>('all')
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('auto')
  const [worldChatStats, setWorldChatStats] = useState({ remainingFree: 10, costPerMessage: 0.1 })
  const [receiveNotices, setReceiveNotices] = useState(true)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>('')
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  
  // Anti-spam
  const [lastMessageTime, setLastMessageTime] = useState(0)
  const [messageCooldown, setMessageCooldown] = useState(0)
  const [canSendMessage, setCanSendMessage] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        setStatus(data.user ? 'authenticated' : 'unauthenticated')
      })
      .catch(() => {
        setStatus('unauthenticated')
      })
  }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchInitialData = async () => {
      try {
        const [messagesRes, shoutOutsRes, noticesRes, worldStatsRes] = await Promise.all([
          fetch('/api/chat/public'),
          fetch('/api/shout-outs'),
          fetch('/api/notices'),
          fetch('/api/chat/world-stats'),
        ])

        if (messagesRes.ok) {
          const data = await messagesRes.json()
          setPublicMessages(data?.data?.messages || [])
          setOnlineUsers(data?.data?.onlineUsersCount || 0)
        }

        if (shoutOutsRes.ok) {
          const data = await shoutOutsRes.json()
          setShoutOuts(data?.data?.shoutOuts || [])
        }

        if (noticesRes.ok) {
          const data = await noticesRes.json()
          setNotices(data?.data?.notices || [])
        }

        if (worldStatsRes.ok) {
          const data = await worldStatsRes.json()
          setWorldChatStats(data)
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    const connectSSE = () => {
      const eventSource = new EventSource('/api/chat/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        console.log('SSE Connected')
      }

      eventSource.onmessage = (event) => {
        try {
          const rawData = event.data
          if (!rawData || typeof rawData !== 'string') return
          
          const data = JSON.parse(rawData)
          if (!data || typeof data !== 'object') return

          if (data.type === 'connected') {
            console.log('SSE ready:', data)
          } else if (data.type === 'update') {
            // Safely handle messages with strict validation
            if (Array.isArray(data.messages) && data.messages.length > 0) {
              setPublicMessages(prev => {
                // 1. Clean old array: filter out invalid items
                const cleanPrev = Array.isArray(prev) ? prev.filter(m => m && typeof m === 'object' && m.id) : [];
                const existingIds = new Set(cleanPrev.map(m => m.id));
                // 2. Filter new messages: valid object with id
                const newMessages = data.messages.filter((m: PublicMessage) => 
                  m && typeof m === 'object' && m.id && !existingIds.has(m.id)
                );
                // 3. Merge and limit length
                return [...cleanPrev, ...newMessages].slice(-100);
              })
            }

            // Safely handle world chat messages with strict validation
            if (Array.isArray(data.worldChatMessages) && data.worldChatMessages.length > 0) {
              setWorldChatMessages(prev => {
                const cleanPrev = Array.isArray(prev) ? prev.filter(m => m && typeof m === 'object' && m.id) : [];
                const existingIds = new Set(cleanPrev.map(m => m.id));
                const newMessages = data.worldChatMessages.filter((m: PublicMessage) => 
                  m && typeof m === 'object' && m.id && !existingIds.has(m.id)
                );
                return [...newMessages, ...cleanPrev].slice(0, 50);
              })
              
              data.worldChatMessages.forEach((msg: PublicMessage) => {
                if (msg && typeof msg === 'object' && msg.isWorldChat && msg.content) {
                  setCurrentAnnouncement(msg.content)
                  setShowAnnouncement(true)
                  setTimeout(() => setShowAnnouncement(false), 10000)
                }
              })
            }

            // Safely handle shout outs with strict validation
            if (Array.isArray(data.shoutOuts) && data.shoutOuts.length > 0) {
              setShoutOuts(prev => {
                const cleanPrev = Array.isArray(prev) ? prev.filter(s => s && typeof s === 'object' && s.id) : [];
                const existingIds = new Set(cleanPrev.map(s => s.id));
                const newShoutOuts = data.shoutOuts.filter((s: ShoutOut) => 
                  s && typeof s === 'object' && s.id && !existingIds.has(s.id)
                );
                return [...newShoutOuts, ...cleanPrev].slice(0, 50);
              })
            }

            // Safely handle notices with strict validation
            if (Array.isArray(data.notices) && data.notices.length > 0) {
              setNotices(prev => {
                const cleanPrev = Array.isArray(prev) ? prev.filter(n => n && typeof n === 'object' && n.id) : [];
                const existingIds = new Set(cleanPrev.map(n => n.id));
                const newNotices = data.notices.filter((n: Notice) => 
                  n && typeof n === 'object' && n.id && !existingIds.has(n.id)
                );
                return [...newNotices, ...cleanPrev].slice(0, 30);
              })
            }

            // Safely handle online users count
            if (typeof data.onlineUsersCount === 'number' && data.onlineUsersCount >= 0) {
              setOnlineUsers(data.onlineUsersCount)
            }
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        console.error('SSE Error, reconnecting...')
        eventSource.close()
        setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [mounted])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [publicMessages])

  // 调试日志：打印所有状态的类型和内容
  useEffect(() => {
    console.group('🔍 Chat Hall 状态调试日志')
    console.log('📊 publicMessages - type:', typeof publicMessages, 'isArray:', Array.isArray(publicMessages), 'length:', publicMessages?.length)
    if (Array.isArray(publicMessages)) {
      console.log('📊 publicMessages content:', publicMessages.slice(0, 3))
      publicMessages.forEach((msg, idx) => {
        console.log(`  [${idx}] msg.id:`, msg?.id, 'msg.type:', typeof msg, 'msg:', msg)
      })
    }
    console.log('🌍 worldChatMessages - type:', typeof worldChatMessages, 'isArray:', Array.isArray(worldChatMessages), 'length:', worldChatMessages?.length)
    if (Array.isArray(worldChatMessages)) {
      console.log('🌍 worldChatMessages content:', worldChatMessages.slice(0, 3))
    }
    console.log('📣 shoutOuts - type:', typeof shoutOuts, 'isArray:', Array.isArray(shoutOuts), 'length:', shoutOuts?.length)
    if (Array.isArray(shoutOuts)) {
      console.log('📣 shoutOuts content:', shoutOuts.slice(0, 3))
    }
    console.log('🔔 notices - type:', typeof notices, 'isArray:', Array.isArray(notices), 'length:', notices?.length)
    if (Array.isArray(notices)) {
      console.log('🔔 notices content:', notices.slice(0, 3))
    }
    console.log('👥 onlineUsers - type:', typeof onlineUsers, 'value:', onlineUsers)
    console.log('🔌 isConnected - type:', typeof isConnected, 'value:', isConnected)
    console.log('⏳ isLoading - type:', typeof isLoading, 'value:', isLoading)
    console.groupEnd()
  }, [publicMessages, worldChatMessages, shoutOuts, notices, onlineUsers, isConnected, isLoading])

  useEffect(() => {
    const COOLDOWN_MS = 3000
    const now = Date.now()
    
    if (now - lastMessageTime < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastMessageTime)) / 1000)
      setMessageCooldown(remaining)
      setCanSendMessage(false)
      
      const timer = setTimeout(() => {
        setMessageCooldown(0)
        setCanSendMessage(true)
      }, COOLDOWN_MS - (now - lastMessageTime))
      
      return () => clearTimeout(timer)
    }
  }, [lastMessageTime])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !newMessage.trim()) return
    if (!canSendMessage) return

    setSendingMessage(true)
    setLastMessageTime(Date.now())
    
    try {
      const res = await fetch('/api/chat/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          language: selectedLanguage
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setPublicMessages(prev => [...(prev || []), data.data])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const sendWorldChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !newWorldChat.trim()) return
    if (newWorldChat.length > 100) {
      alert('World chat messages are limited to 100 characters!')
      return
    }

    setSendingWorldChat(true)
    try {
      const res = await fetch('/api/chat/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newWorldChat.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setWorldChatMessages(prev => [data.data, ...(prev || [])])
        setWorldChatStats(data.stats)
        setNewWorldChat('')
        
        if (data.stats.remainingFree >= 0) {
          alert(`World message sent! ${data.stats.isFree ? 'Free' : `$${data.stats.cost} charged`} - ${data.stats.remainingFree} free remaining today`)
        } else {
          alert('Insufficient balance! Please add funds to your account.')
        }
      }
    } catch (error) {
      console.error('Error sending world chat:', error)
    } finally {
      setSendingWorldChat(false)
    }
  }

  const sendNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !newNotice.title.trim() || !newNotice.content.trim()) return

    setSendingNotice(true)
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice),
      })

      if (res.ok) {
        const data = await res.json()
        setNotices(prev => [data.data, ...prev])
        setNewNotice({ title: '', content: '', priority: 'medium' })
        alert('Notice published successfully! It will be delivered to all users.')
      }
    } catch (error) {
      console.error('Error sending notice:', error)
    } finally {
      setSendingNotice(false)
    }
  }

  const toggleNoticeReceiving = async () => {
    try {
      const res = await fetch('/api/notices/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiveNotices: !receiveNotices }),
      })

      if (res.ok) {
        setReceiveNotices(!receiveNotices)
      }
    } catch (error) {
      console.error('Error updating notice settings:', error)
    }
  }

  const filteredShoutOuts = Array.isArray(shoutOuts) ? shoutOuts.filter(shoutOut => {
    if (!shoutOut || typeof shoutOut.content !== 'string') return false
    const matchesSearch = !searchQuery || 
      shoutOut.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || shoutOut.type === selectedFilter
    return matchesSearch && matchesFilter
  }) : []

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return dict.chatHall.justNow
    if (minutes < 60) return `${minutes}${dict.chatHall.minutesAgo}`
    if (hours < 24) return `${hours}${dict.chatHall.hoursAgo}`
    if (days < 7) return `${days}${dict.chatHall.daysAgo}`
    return date.toLocaleDateString()
  }

  if (!mounted || status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 blur-3xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{dict.chatHall.connectingToChat}</h2>
          <p className="text-blue-300">{dict.chatHall.bringingWorldTogether}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* World Chat Announcement Banner */}
      {showAnnouncement && currentAnnouncement && (
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-6 animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <marquee behavior="scroll" direction="left" scrollamount="5">
              <span className="font-bold text-lg">🌍 {dict.chatHall.worldAnnouncement}: </span>
              <span>{currentAnnouncement}</span>
            </marquee>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">🌍 {dict.chatHall.title}</h1>
                  <p className="text-xs text-slate-400">{dict.chatHall.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">{onlineUsers} {dict.chatHall.online}</span>
              </div>
              <Link
                href={`/${locale}/marketplace`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all hover:shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                {dict.chatHall.marketplace}
              </Link>
              <Link
                href={`/${locale}/auction-screen`}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all hover:shadow-lg"
              >
                <AuctionIcon className="w-4 h-4" />
                {dict.chatHall.auctions}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Online Users & Quick Post */}
          <div className="lg:w-80 space-y-4">
            {/* Online Users */}
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  {dict.chatHall.onlineUsers}
                </h2>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {onlineUsers}
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(publicMessages || [])
                  .filter(m => m && m.sender && m.sender.id && m.sender.isOnline)
                  .reduce((acc, m) => {
                    if (m.sender && !acc.find(u => u.id === m.sender.id)) {
                      acc.push(m.sender)
                    }
                    return acc
                  }, [] as User[])
                  .filter(user => user && user.id)
                  .slice(0, 10)
                  .map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/50 transition-all group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.displayName?.charAt(0) || user.username.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                          {user.displayName || user.username}
                        </p>
                        {user.sellerProfile && (
                          <p className="text-slate-400 text-xs truncate">
                            🏪 {user.sellerProfile.companyName}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            {/* World Chat Quick Access */}
            <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 backdrop-blur rounded-2xl p-4 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-yellow-400" />
                  {dict.chatHall.worldChat}
                </h2>
                <div className="flex items-center gap-1 text-yellow-300 text-xs">
                  <Zap className="w-4 h-4" />
                  {worldChatStats?.remainingFree ?? 0} {dict.chatHall.freeRemaining}
                </div>
              </div>
              <form onSubmit={sendWorldChat} className="space-y-3">
                <textarea
                  value={newWorldChat}
                  onChange={(e) => setNewWorldChat(e.target.value)}
                  placeholder={dict.chatHall.broadcastToWorld}
                  maxLength={100}
                  className="w-full p-3 bg-slate-800/80 border border-yellow-500/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={2}
                  disabled={!session?.user || sendingWorldChat}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-300">{newWorldChat.length}/100 {dict.chatHall.chars}</span>
                  <span className="text-slate-400">${worldChatStats?.costPerMessage ?? 0}{dict.chatHall.perMessage}</span>
                </div>
                <button
                  type="submit"
                  disabled={!session?.user || sendingWorldChat || !newWorldChat.trim()}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all hover:shadow-lg"
                >
                  {sendingWorldChat ? dict.chatHall.broadcasting : `🌍 ${dict.chatHall.broadcast}`}
                </button>
              </form>
            </div>

            {/* Quick Post */}
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur rounded-2xl p-4 border border-blue-500/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                {dict.chatHall.quickPost}
              </h2>
              
              <div className="flex gap-2 mb-3">
                {(Object.keys(postTypeConfig) as PostType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedPostType(type)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPostType === type
                        ? `${postTypeConfig[type].color} text-white`
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {postTypeConfig[type].icon} {postTypeConfig[type].label}
                  </button>
                ))}
              </div>

              <textarea
                value={shoutOuts[0]?.content || ''}
                placeholder={`${dict.chatHall.postProduct}...`}
                className="w-full p-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={!session?.user}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">10 {dict.chatHall.freePerDay} • $0.10 after</span>
                <button
                  disabled={!session?.user}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${postTypeConfig[selectedPostType].color} hover:opacity-90 text-white`}
                >
                  📢 {dict.chatHall.posts}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                {dict.chatHall.publicChat}
              </button>
              <button
                onClick={() => setActiveTab('world')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'world'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Globe className="w-5 h-5" />
                {dict.chatHall.worldChat}
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'notices'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Bell className="w-5 h-5" />
                {dict.chatHall.notices}
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'posts'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                {dict.chatHall.posts}
              </button>
            </div>

            {/* Public Chat View */}
            {activeTab === 'chat' && (
              <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700 flex flex-col h-[calc(100vh-22rem)]">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">💬 {dict.chatHall.publicChat}</h2>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${
                      isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-xs font-medium">{isConnected ? dict.chatHall.live : dict.chatHall.offline}</span>
                    </div>
                    {!canSendMessage && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">{dict.chatHall.wait} {messageCooldown}{dict.chatHall.seconds}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">{selectedLanguage === 'auto' ? dict.chatHall.auto : selectedLanguage.toUpperCase()}</span>
                      </button>
                      {showLanguageSelector && (
                        <div className="absolute right-0 mt-2 w-40 bg-slate-700 rounded-lg py-2 z-10 shadow-xl border border-slate-600">
                          {['auto', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'].map(lang => (
                            <button
                              key={lang}
                              onClick={() => {
                                setSelectedLanguage(lang)
                                setShowLanguageSelector(false)
                              }}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                selectedLanguage === lang ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              {lang === 'auto' ? dict.chatHall.autoDetect : lang.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(!publicMessages || publicMessages.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">{dict.chatHall.noMessages}</p>
                      <p className="text-sm">{dict.chatHall.firstHello}</p>
                    </div>
                  ) : (
                    (publicMessages || [])
                      .filter(m => m && !m.isWorldChat)
                      .map((message) => {
                        const hasSender = !message.isSystemMessage && message.sender
                        return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.isSystemMessage ? 'justify-center' : ''}`}
                        >
                          {hasSender && (
                            <div className="flex-shrink-0">
                              <Link href={`/users/${message.sender?.id || ''}`}>
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {message.sender?.displayName?.charAt(0) || message.sender?.username?.charAt(0) || '?'}
                                  </div>
                                  {message.sender.isOnline && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                                  )}
                                </div>
                              </Link>
                            </div>
                          )}

                          <div className="flex-1">
                            {message.isAnnouncement ? (
                              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 border border-blue-500">
                                <p className="text-white font-bold">{message.content}</p>
                              </div>
                            ) : message.isSystemMessage ? (
                              <p className="text-slate-500 text-sm text-center italic">{message.content}</p>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Link
                                    href={`/users/${message.sender.id}`}
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                  >
                                    {message.sender.displayName || message.sender.username}
                                  </Link>
                                  {message.sender.sellerProfile && (
                                    <Link
                                      href={`/stores/${message.sender.sellerProfile.id}`}
                                      className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full hover:bg-purple-500 transition-colors"
                                    >
                                      🏪 {dict.chatHall.visitStore}
                                    </Link>
                                  )}
                                  <span className="text-slate-500 text-xs">
                                    {formatTime(message.createdAt)}
                                  </span>
                                </div>
                                <div className="bg-slate-700/80 rounded-xl p-3 backdrop-blur">
                                  <p className="text-white whitespace-pre-wrap">{message.content}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )})
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-700">
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Image className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={session?.user ? dict.chatHall.typeMessage : dict.chatHall.signInToChat}
                      className="flex-1 px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!session?.user || sendingMessage || !canSendMessage}
                    />
                    <button
                      type="button"
                      className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!session?.user || sendingMessage || !newMessage.trim() || !canSendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* World Chat View */}
            {activeTab === 'world' && (
              <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur rounded-2xl border border-yellow-500/30 flex flex-col h-[calc(100vh-22rem)]">
                <div className="p-4 border-b border-yellow-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-yellow-400" />
                      {dict.chatHall.worldChat}
                    </h2>
                    <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                      <Crown className="w-4 h-4" />
                      <span className="text-xs font-medium">{dict.chatHall.broadcastToWorld}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-yellow-300">
                      {worldChatStats?.remainingFree ?? 0} {dict.chatHall.freeRemaining}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(!worldChatMessages || worldChatMessages.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <Globe className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">{dict.chatHall.noWorldMessagesYet}</p>
                      <p className="text-sm">{dict.chatHall.beFirstToBroadcast}</p>
                    </div>
                  ) : (
                    (worldChatMessages || [])
                      .filter(m => m && typeof m === 'object' && m.id)
                      .map((message) => (
                      <div key={message.id} className="bg-gradient-to-r from-yellow-800/50 to-orange-800/50 rounded-xl p-4 border border-yellow-500/30">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <Link href={`/users/${message?.sender?.id || ''}`}>
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                {message?.sender?.displayName?.charAt(0) || message?.sender?.username?.charAt(0) || '?'}
                              </div>
                            </Link>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                href={`/users/${message?.sender?.id || ''}`}
                                className="text-yellow-300 hover:text-yellow-200 font-bold"
                              >
                                {message?.sender?.displayName || message?.sender?.username || 'Unknown'}
                              </Link>
                              {message?.sender?.sellerProfile && (
                                <span className="text-xs bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded-full">
                                  🏪 {dict.chatHall.visitStore}
                                </span>
                              )}
                              <span className="text-slate-400 text-xs">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                              <p className="text-white text-lg font-medium">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span>🌍 Global Broadcast</span>
                              {!message.isSystemMessage && <span>💬 Seen by thousands</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Notices View */}
            {activeTab === 'notices' && (
              <div className="space-y-4">
                {/* Notice Settings */}
                <div className="flex items-center justify-between bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-400" />
                    {dict.chatHall.notices}
                  </h2>
                  <button
                    onClick={toggleNoticeReceiving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      receiveNotices
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                    }`}
                  >
                    {receiveNotices ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    <span className="text-sm">{receiveNotices ? dict.chatHall.receiving : dict.chatHall.muted}</span>
                  </button>
                </div>

                {/* Post Notice Form */}
                <div className="bg-gradient-to-r from-red-600/30 to-orange-600/30 backdrop-blur rounded-xl p-4 border border-red-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4">📢 {dict.chatHall.postNewNotice}</h3>
                  <form onSubmit={sendNotice} className="space-y-4">
                    <input
                      type="text"
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      placeholder={dict.chatHall.noticeTitle}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={!session?.user}
                    />
                    <textarea
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                      placeholder={dict.chatHall.noticeContent}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      disabled={!session?.user}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">{dict.chatHall.priority}:</span>
                      {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setNewNotice({ ...newNotice, priority })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            newNotice.priority === priority
                              ? `${priorityConfig[priority].color} text-white`
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {priorityConfig[priority].label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={!session?.user || sendingNotice || !newNotice.title.trim() || !newNotice.content.trim()}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all hover:shadow-lg"
                    >
                      {sendingNotice ? dict.chatHall.posting : `📢 ${dict.chatHall.sendNotice}`}
                    </button>
                  </form>
                </div>

                {/* Notice List */}
                <div className="space-y-3">
                  {(!notices || notices.length === 0) ? (
                    <div className="text-center py-12 bg-slate-800/60 backdrop-blur rounded-xl">
                      <Bell className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">{dict.chatHall.noNoticesYet}</p>
                    </div>
                  ) : (
                    (notices || [])
                      .filter(n => n && typeof n === 'object' && n.id)
                      .map((notice) => (
                      <div key={notice.id} className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold">
                              {notice?.sender?.displayName?.charAt(0) || notice?.sender?.username?.charAt(0) || '?'}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{notice?.title || ''}</h4>
                              <p className="text-slate-400 text-xs">{notice?.sender?.displayName || notice?.sender?.username || 'System'} • {formatTime(notice?.createdAt || new Date().toISOString())}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityConfig[notice?.priority || 'medium'].color} text-white`}>
                            {priorityConfig[notice?.priority || 'medium'].label}
                          </span>
                        </div>
                        <p className="text-white">{notice?.content || ''}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          {notice?.isGlobal && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Global</span>}
                          <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Delivered to all users</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Posts View */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value as PostType | 'all')}
                      className="px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">{dict.chatHall.allPosts}</option>
                      <option value="product">{dict.chatHall.products}</option>
                      <option value="service">{dict.chatHall.services}</option>
                      <option value="demand">{dict.chatHall.demands}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredShoutOuts.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">{dict.chatHall.noPostsFound}</p>
                    </div>
                  ) : (
                    filteredShoutOuts
                      .filter(s => s && s.id)
                      .map((shoutOut) => (
                      <div
                        key={shoutOut.id}
                        className={`bg-slate-800/60 backdrop-blur rounded-2xl border ${(postTypeConfig[shoutOut.type] || postTypeConfig.general).bgLight} p-4 transition-all hover:shadow-xl hover:-translate-y-1`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {shoutOut?.sender?.displayName?.charAt(0) || shoutOut?.sender?.username?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-white font-medium">{shoutOut?.sender?.displayName || shoutOut?.sender?.username || 'Unknown'}</p>
                              <p className="text-slate-400 text-xs">{formatTime(shoutOut?.createdAt || new Date().toISOString())}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${(postTypeConfig[shoutOut.type] || postTypeConfig.general).color} text-white`}>
                            {(postTypeConfig[shoutOut.type] || postTypeConfig.general).icon} {(postTypeConfig[shoutOut.type] || postTypeConfig.general).label}
                          </span>
                        </div>
                        
                        <p className="text-white mb-4">{shoutOut?.content || ''}</p>
                        
                        {Array.isArray(shoutOut.tags) && shoutOut.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {shoutOut.tags.filter(Boolean).map(tag => (
                              <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg">
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {shoutOut?.location && (
                          <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                            <MapPin className="w-4 h-4" />
                            {shoutOut.location}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                              <Eye className="w-4 h-4" />
                              {shoutOut.viewCount}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock className="w-4 h-4" />
                              {shoutOut.expiresAt ? 'Expiring soon' : '24h'}
                            </span>
                          </div>
                          {!shoutOut.isFree && (
                            <span className="text-yellow-400 text-xs font-bold">💎 Boosted</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Stats & Actions */}
          <div className="lg:w-80 space-y-4">
            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">📊 {dict.chatHall.hallStats}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-blue-400">{onlineUsers ?? 0}</p>
                  <p className="text-xs text-slate-400">{dict.chatHall.onlineNow}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-green-400">{publicMessages?.length ?? 0}</p>
                  <p className="text-xs text-slate-400">{dict.chatHall.messages}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-purple-400">{shoutOuts?.length ?? 0}</p>
                  <p className="text-xs text-slate-400">{dict.chatHall.posts}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-yellow-400">{notices?.length ?? 0}</p>
                  <p className="text-xs text-slate-400">{dict.chatHall.notices}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur rounded-2xl p-4 border border-purple-500/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                {dict.chatHall.trendingPosts}
              </h2>
              <div className="space-y-3">
                {(shoutOuts || []).slice(0, 5).filter(Boolean).map((shoutOut, index) => (
                  <div
                    key={shoutOut?.id || Math.random()}
                    className="bg-slate-800/50 rounded-xl p-3 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-slate-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm line-clamp-2">{shoutOut?.content || ''}</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {shoutOut?.sender?.displayName || shoutOut?.sender?.username || 'Unknown'} • {(shoutOut?.viewCount || 0)} {dict.chatHall.views}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">🚀 {dict.chatHall.quickActions}</h2>
              <div className="space-y-2">
                <Link
                  href={`/${locale}/marketplace/post`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {dict.chatHall.postProduct}
                </Link>
                <Link
                  href="/seller/booths"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  <BuildingIcon className="w-5 h-5" />
                  {dict.chatHall.manageBooths}
                </Link>
                <Link
                  href="/marketplace"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  {dict.chatHall.browseMarket}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function AuctionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}