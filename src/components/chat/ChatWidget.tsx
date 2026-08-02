'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface ChatWidgetProps {
  sellerId: string
  productId?: string
}

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  isOwn: boolean
}

const POLL_INTERVAL = 3000

export default function ChatWidget({ sellerId, productId }: ChatWidgetProps) {
  const { data: session, status: sessionStatus } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Resolve the logged-in user ID. useSession() may return a user object
  // without an 'id' field on the client (JWT session shape differs from
  // database session). Fetch /api/auth/session to get the canonical ID.
  useEffect(() => {
    if (sessionStatus !== 'authenticated') return
    // Prefer id from session if present
    if (session?.user?.id) {
      setResolvedUserId(session.user.id as string)
      return
    }
    // Fallback: fetch canonical session from server
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data?.user?.id) {
          setResolvedUserId(data.user.id)
        }
      })
      .catch(() => {})
  }, [session, sessionStatus])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = useCallback(async () => {
    if (!resolvedUserId) return
    try {
      const res = await fetch(`/api/chat/private/${sellerId}?limit=50`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      if (!data?.success || !data?.data?.messages) return

      const newMessages: Message[] = data.data.messages.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        timestamp: new Date(m.createdAt),
        isOwn: m.senderId === resolvedUserId,
      }))

      // Only update if there are new messages
      const lastMsg = newMessages[newMessages.length - 1]
      if (lastMsg && lastMsg.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMsg.id
        setMessages(newMessages)
      }
    } catch (e) {
      // Silent fail - polling is best effort
    }
  }, [resolvedUserId, sellerId])

  // Load messages and start polling when chat opens
  useEffect(() => {
    if (!resolvedUserId || !isOpen) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
      return
    }

    setIsLoading(true)
    fetchMessages().finally(() => setIsLoading(false))

    pollTimerRef.current = setInterval(fetchMessages, POLL_INTERVAL)

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [resolvedUserId, isOpen, fetchMessages])

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return
    if (!resolvedUserId) return

    const content = newMessage.trim()
    setIsSending(true)

    // Optimistically add to UI
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, {
      id: tempId,
      content,
      senderId: resolvedUserId,
      timestamp: new Date(),
      isOwn: true,
    }])
    setNewMessage('')

    try {
      const res = await fetch(`/api/chat/private/${sellerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, productId }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error || `HTTP ${res.status}`)
      }
      const data = await res.json()

      // Replace temp message with real one
      if (data?.success && data?.data?.id) {
        setMessages(prev => prev.map(m =>
          m.id === tempId
            ? { ...m, id: data.data.id, timestamp: new Date(data.data.createdAt) }
            : m
        ))
        lastMessageIdRef.current = data.data.id
      }
    } catch (err) {
      // Remove failed optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId))
      alert(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <button
        onClick={() => window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
        title="Login to chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed right-6 bg-white rounded-lg shadow-2xl z-50 transition-all ${
          isMinimized ? 'bottom-6 w-80 h-16' : 'bottom-6 w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
              <span className="font-semibold">Chat with Seller</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading ? (
                  <div className="text-center text-gray-500 mt-8">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                    <p className="text-sm mt-2">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
