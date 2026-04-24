'use client'

import { useState, useEffect, useRef } from 'react'
import chatClient, { ChatMessage } from '@/lib/chat-client'
import { useSession } from 'next-auth/react'
import { X, Send, MessageCircle, User } from 'lucide-react'

interface ChatWidgetProps {
  sellerId: string
  productId?: string
  isOpen: boolean
  onClose: () => void
}

export default function ChatWidget({ sellerId, productId, isOpen, onClose }: ChatWidgetProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Connect to chat when widget opens
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      connectToChat()
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    }
  }, [isOpen, session?.user?.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const connectToChat = async () => {
    if (!session?.user?.id) return

    try {
      // Get JWT token from session
      const token = await getAuthToken()
      
      await chatClient.connect(session.user.id, token)
      setIsConnected(true)
      setError(null)

      // Join conversation with seller
      const conversationId = generateConversationId(session.user.id, sellerId)
      chatClient.joinConversation(conversationId)

      // Subscribe to messages
      const unsubscribe = chatClient.onMessage((message) => {
        setMessages(prev => [...prev, message])
      })

      // Subscribe to connection changes
      const unsubscribeConnection = chatClient.onConnectionChange((connected) => {
        setIsConnected(connected)
        if (!connected) {
          setError('Disconnected. Attempting to reconnect...')
        } else {
          setError(null)
        }
      })

      // Subscribe to errors
      const unsubscribeError = chatClient.onError((err) => {
        setError(err.message)
      })

      return () => {
        unsubscribe()
        unsubscribeConnection()
        unsubscribeError()
      }
    } catch (err) {
      console.error('Failed to connect to chat:', err)
      setError('Failed to connect to chat server')
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !session?.user?.id || !isConnected) return

    const conversationId = generateConversationId(session.user.id, sellerId)
    const success = chatClient.sendMessage(conversationId, newMessage, sellerId)

    if (success) {
      // Add message to local state immediately for better UX
      const optimisticMessage: ChatMessage = {
        conversationId,
        senderId: session.user.id,
        receiverId: sellerId,
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
      }
      
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
    } else {
      setError('Failed to send message')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const generateConversationId = (buyerId: string, sellerId: string): string => {
    // Create consistent conversation ID regardless of order
    const ids = [buyerId, sellerId].sort()
    return `conv_${ids[0]}_${ids[1]}`
  }

  const getAuthToken = async (): Promise<string> => {
    // In production, this would get the JWT token from NextAuth session
    // For now, we'll use a placeholder - you need to implement proper token extraction
    return session?.user?.id || ''
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Chat with Exhibitor</h3>
            <div className="flex items-center space-x-1 text-xs text-blue-100">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-blue-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === session?.user?.id
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="flex items-center space-x-1 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">Exhibitor</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send
        </p>
      </div>
    </div>
  )
}
