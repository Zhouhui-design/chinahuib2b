'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react'
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

export default function ChatWidget({ sellerId, productId }: ChatWidgetProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session?.user || !isOpen) return

    const token = generateJWT(session.user.id, session.user.email || '')
    const wsUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:5001/ws'
    
    const websocket = new WebSocket(`${wsUrl}?token=${token}`)

    websocket.onopen = () => {
      console.log('Chat connected')
      setIsConnected(true)
      
      // Join conversation with seller
      websocket.send(JSON.stringify({
        type: 'join',
        conversationId: `${session.user.id}_${sellerId}`,
      }))
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: data.id || Date.now().toString(),
            content: data.content,
            senderId: data.senderId,
            timestamp: new Date(data.timestamp),
            isOwn: data.senderId === session.user.id,
          }])
        }
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    websocket.onclose = () => {
      console.log('Chat disconnected')
      setIsConnected(false)
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [session, sellerId, isOpen])

  // Generate simple JWT for chat authentication
  const generateJWT = (userId: string, email: string): string => {
    // In production, this should be generated server-side
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ 
      userId, 
      email,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }))
    const secret = process.env.NEXT_PUBLIC_CHAT_JWT_SECRET || 'chat-secret-key'
    const signature = btoa(secret) // Simplified - use proper HMAC in production
    
    return `${header}.${payload}.${signature}`
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !ws || !isConnected) return

    const messageData = {
      type: 'message',
      conversationId: `${session?.user.id}_${sellerId}`,
      senderId: session?.user.id,
      receiverId: sellerId,
      content: newMessage.trim(),
      productId: productId,
      timestamp: new Date().toISOString(),
    }

    ws.send(JSON.stringify(messageData))

    // Optimistically add to UI
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: session?.user.id || '',
      timestamp: new Date(),
      isOwn: true,
    }])

    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!session) {
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
          {!isConnected && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
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
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
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
                {messages.length === 0 ? (
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
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
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
                    disabled={!isConnected}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Connecting... Please wait
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
