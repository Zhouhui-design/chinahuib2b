'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Conversation {
  partnerId: string
  partnerName: string
  partnerAvatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  isOwn: boolean
}

const POLL_INTERVAL = 5000

export default function SellerMessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMsgIdRef = useRef<string | null>(null)
  const pollListRef = useRef<NodeJS.Timeout | null>(null)
  const pollMsgRef = useRef<NodeJS.Timeout | null>(null)

  // Resolve current user ID from session endpoint (no SessionProvider needed)
  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data?.user?.id) {
          setCurrentUserId(data.user.id)
        }
      })
      .catch(() => {})
  }, [])

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      if (data?.success?.data?.conversations) {
        setConversations(data.data.conversations)
      }
    } catch (e) {
      // Silent
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedPartner) return
    try {
      const res = await fetch(`/api/chat/private/${selectedPartner}?limit=100`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      if (!data?.success?.data?.messages) return

      const msgs: Message[] = data.data.messages.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        createdAt: m.createdAt,
        isOwn: m.senderId === currentUserId,
      }))

      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg && lastMsg.id !== lastMsgIdRef.current) {
        lastMsgIdRef.current = lastMsg.id
        setMessages(msgs)
      }
    } catch (e) {
      // Silent
    }
  }, [selectedPartner, currentUserId])

  // Poll conversations list
  useEffect(() => {
    if (!currentUserId) return
    fetchConversations()
    pollListRef.current = setInterval(fetchConversations, POLL_INTERVAL)
    return () => {
      if (pollListRef.current) clearInterval(pollListRef.current)
    }
  }, [currentUserId, fetchConversations])

  // Poll messages when a conversation is selected
  useEffect(() => {
    if (!selectedPartner || !currentUserId) {
      if (pollMsgRef.current) {
        clearInterval(pollMsgRef.current)
        pollMsgRef.current = null
      }
      return
    }

    setIsLoadingMessages(true)
    setMessages([])
    lastMsgIdRef.current = null
    fetchMessages().finally(() => setIsLoadingMessages(false))

    pollMsgRef.current = setInterval(fetchMessages, POLL_INTERVAL)
    return () => {
      if (pollMsgRef.current) clearInterval(pollMsgRef.current)
    }
  }, [selectedPartner, currentUserId, fetchMessages])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !selectedPartner) return
    const content = newMessage.trim()
    setIsSending(true)

    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, {
      id: tempId,
      content,
      senderId: currentUserId || '',
      createdAt: new Date().toISOString(),
      isOwn: true,
    }])
    setNewMessage('')

    try {
      const res = await fetch(`/api/chat/private/${selectedPartner}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()

      setMessages(prev => prev.map(m =>
        m.id === tempId
          ? { ...m, id: data.data.id, createdAt: data.data.createdAt }
          : m
      ))
      lastMsgIdRef.current = data.data.id
      // Refresh conversation list to update preview
      fetchConversations()
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      alert('Failed to send message. Please try again.')
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

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString()
  }

  if (isLoadingList) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <Link href="/seller" className="text-sm text-gray-500 hover:text-blue-600 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-gray-200 overflow-y-auto ${selectedPartner ? 'hidden md:block' : ''}`}>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-12 h-12 mb-3 opacity-40" />
                <p>No messages yet</p>
                <p className="text-sm">Buyer inquiries will appear here</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => setSelectedPartner(conv.partnerId)}
                  className={`w-full flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedPartner === conv.partnerId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold mr-3 flex-shrink-0">
                    {conv.partnerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">{conv.partnerName}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Message Thread */}
          <div className={`flex-1 flex flex-col ${selectedPartner ? '' : 'hidden md:flex'}`}>
            {!selectedPartner ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-16 h-16 mb-3 opacity-30" />
                <p>Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="border-b border-gray-200 px-4 py-3 flex items-center">
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium text-gray-900">
                    {conversations.find(c => c.partnerId === selectedPartner)?.partnerName || 'Chat'}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {isLoadingMessages ? (
                    <div className="flex justify-center mt-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <p>No messages yet</p>
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
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a reply..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                    >
                      {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
