'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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
  priority: number
  reactions: any
  createdAt: string
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
}

export default function ChatHallPage() {
  return (
    <DynamicSessionProvider>
      <ChatHallContent />
    </DynamicSessionProvider>
  )
}

function ChatHallContent() {
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<string>('loading')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([])
  const [shoutOuts, setShoutOuts] = useState<ShoutOut[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newShoutOut, setNewShoutOut] = useState('')
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [sendingShoutOut, setSendingShoutOut] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

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
        const [messagesRes, shoutOutsRes] = await Promise.all([
          fetch('/api/chat/public'),
          fetch('/api/shout-outs'),
        ])

        if (messagesRes.ok) {
          const data = await messagesRes.json()
          setPublicMessages(data.data.messages)
          setOnlineUsers(data.data.onlineUsersCount)
        }

        if (shoutOutsRes.ok) {
          const data = await shoutOutsRes.json()
          setShoutOuts(data.data.shoutOuts)
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
          const data = JSON.parse(event.data)

          if (data.type === 'connected') {
            console.log('SSE ready:', data)
          } else if (data.type === 'update') {
            if (data.messages && data.messages.length > 0) {
              setPublicMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id))
                const newMessages = data.messages.filter((m: PublicMessage) => !existingIds.has(m.id))
                return [...prev, ...newMessages]
              })
            }

            if (data.shoutOuts && data.shoutOuts.length > 0) {
              setShoutOuts(prev => {
                const existingIds = new Set(prev.map(s => s.id))
                const newShoutOuts = data.shoutOuts.filter((s: ShoutOut) => !existingIds.has(s.id))
                return [...newShoutOuts, ...prev].slice(0, 20)
              })
            }

            if (data.onlineUsersCount !== undefined) {
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !newMessage.trim()) return

    setSendingMessage(true)
    try {
      const res = await fetch('/api/chat/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setPublicMessages(prev => [...prev, data.data])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const sendShoutOut = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !newShoutOut.trim()) return

    setSendingShoutOut(true)
    try {
      const res = await fetch('/api/shout-outs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newShoutOut.trim(),
          priority: 1,
          expiresInHours: 24,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setShoutOuts(prev => [data.data.shoutOut, ...prev])
        setNewShoutOut('')
        alert(`Shout out sent! ${data.data.stats.isFree ? 'Free' : `$${data.data.stats.cost}`} - ${data.data.stats.remainingFree} free remaining today`)
      }
    } catch (error) {
      console.error('Error sending shout out:', error)
    } finally {
      setSendingShoutOut(false)
    }
  }

  if (!mounted || status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading Chat Hall...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🌍 Global Chat Hall</h1>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {onlineUsers} users online • {isConnected ? 'Live' : 'Reconnecting...'}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/marketplace"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                📦 Marketplace
              </Link>
              <Link
                href="/auction-screen"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                🏪 Auction Screen
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">👥 Online Users ({onlineUsers})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {publicMessages
                .filter(m => m.sender.isOnline)
                .reduce((acc, m) => {
                  if (!acc.find(u => u.id === m.sender.id)) {
                    acc.push(m.sender)
                  }
                  return acc
                }, [] as User[])
                .map((user) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.displayName?.charAt(0) || user.username.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user.displayName || user.username}
                      </p>
                      {user.sellerProfile && (
                        <p className="text-gray-400 text-xs truncate">
                          🏪 {user.sellerProfile.companyName}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-xl p-4 border border-yellow-600 mt-4">
            <h2 className="text-lg font-bold text-yellow-200 mb-4">📢 Shout Out</h2>
            <p className="text-yellow-300 text-sm mb-4">
              10 free/day • $0.10 after • Visible to everyone
            </p>
            <form onSubmit={sendShoutOut} className="space-y-3">
              <textarea
                value={newShoutOut}
                onChange={(e) => setNewShoutOut(e.target.value)}
                placeholder="Announce your products or services to the world..."
                className="w-full p-3 bg-yellow-950 border border-yellow-600 rounded-lg text-yellow-100 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
                disabled={!session?.user || sendingShoutOut}
              />
              <button
                type="submit"
                disabled={!session?.user || sendingShoutOut || !newShoutOut.trim()}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
              >
                {sendingShoutOut ? 'Sending...' : '📢 Send Shout Out'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">💬 Public Chat</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-gray-400 text-sm">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {publicMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isSystemMessage ? 'justify-center' : ''}`}
                >
                  {!message.isSystemMessage && (
                    <div className="flex-shrink-0">
                      <Link href={`/users/${message.sender.id}`}>
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {message.sender.displayName?.charAt(0) || message.sender.username.charAt(0)}
                          </div>
                          {message.sender.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                          )}
                        </div>
                      </Link>
                    </div>
                  )}

                  <div className="flex-1">
                    {message.isAnnouncement ? (
                      <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 text-center">
                        <p className="text-blue-200 font-bold">{message.content}</p>
                      </div>
                    ) : message.isSystemMessage ? (
                      <p className="text-gray-500 text-sm text-center italic">{message.content}</p>
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
                              className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full hover:bg-purple-500"
                            >
                              🏪 Visit Booth
                            </Link>
                          )}
                          <span className="text-gray-500 text-xs">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 inline-block max-w-full">
                          <p className="text-white whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={session?.user ? "Type a message..." : "Sign in to chat"}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!session?.user || sendingMessage}
                />
                <button
                  type="submit"
                  disabled={!session?.user || sendingMessage || !newMessage.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold transition"
                >
                  {sendingMessage ? '...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:w-1/4">
          <div className="bg-gradient-to-b from-purple-900 to-blue-900 rounded-xl p-4 border border-purple-600">
            <h2 className="text-lg font-bold text-purple-200 mb-4">📢 Recent Shout Outs</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {shoutOuts.map((shoutOut) => (
                <div
                  key={shoutOut.id}
                  className="bg-purple-950 rounded-lg p-3 border border-purple-700 hover:border-purple-500 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                      {shoutOut.sender.displayName?.charAt(0) || shoutOut.sender.username.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-200 font-medium text-sm truncate">
                        {shoutOut.sender.displayName || shoutOut.sender.username}
                      </p>
                    </div>
                    {!shoutOut.isFree && (
                      <span className="text-yellow-400 text-xs font-bold">💎 PAID</span>
                    )}
                  </div>
                  <p className="text-purple-100 text-sm">{shoutOut.content}</p>
                  <p className="text-purple-400 text-xs mt-2">
                    {new Date(shoutOut.createdAt).toLocaleTimeString()} • {shoutOut.viewCount} views
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mt-4">
            <h2 className="text-lg font-bold text-white mb-4">🚀 Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/marketplace/post"
                className="block w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg text-center font-bold transition"
              >
                📦 Post Product
              </Link>
              <Link
                href="/seller/settings"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-center font-bold transition"
              >
                🏪 Customize Booth
              </Link>
              <Link
                href="/marketplace"
                className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-center font-bold transition"
              >
                🔍 Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
