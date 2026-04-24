/**
 * WebSocket Chat Client
 * Connects to self-developed chat system for real-time messaging
 */

export interface ChatMessage {
  id?: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  type?: 'text' | 'image' | 'file'
}

export interface ChatConnection {
  isConnected: boolean
  messages: ChatMessage[]
  error: string | null
}

type MessageHandler = (message: ChatMessage) => void
type ConnectionHandler = (connected: boolean) => void
type ErrorHandler = (error: Error) => void

class ChatClient {
  private ws: WebSocket | null = null
  private userId: string | null = null
  private token: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds
  private messageHandlers: MessageHandler[] = []
  private connectionHandlers: ConnectionHandler[] = []
  private errorHandlers: ErrorHandler[] = []
  private isConnecting = false

  /**
   * Connect to chat WebSocket server
   */
  connect(userId: string, token: string, wsUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('Already connected')
        resolve()
        return
      }

      if (this.isConnecting) {
        console.log('Connection in progress')
        resolve()
        return
      }

      this.userId = userId
      this.token = token
      this.isConnecting = true

      const url = wsUrl || process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:8080/ws'
      
      try {
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          // Authenticate
          this.authenticate(userId, token)
          
          this.notifyConnectionHandlers(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          this.notifyErrorHandlers(new Error('WebSocket connection error'))
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          this.isConnecting = false
          this.notifyConnectionHandlers(false)
          
          // Attempt reconnection if not intentional close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect()
          }
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * Send authentication message
   */
  private authenticate(userId: string, token: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const authMessage = {
      type: 'auth',
      userId,
      token,
    }

    this.ws.send(JSON.stringify(authMessage))
  }

  /**
   * Send a message
   */
  sendMessage(conversationId: string, content: string, receiverId: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    const message: ChatMessage = {
      conversationId,
      senderId: this.userId!,
      receiverId,
      content,
      timestamp: new Date(),
      type: 'text',
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'message',
        ...message,
      }))
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      return false
    }
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'join',
        conversationId,
      }))
      return true
    } catch (error) {
      console.error('Failed to join conversation:', error)
      return false
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'leave',
        conversationId,
      }))
      return true
    } catch (error) {
      console.error('Failed to leave conversation:', error)
      return false
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        const message: ChatMessage = {
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          timestamp: new Date(data.timestamp),
          type: data.type || 'text',
        }
        this.notifyMessageHandlers(message)
        break

      case 'auth_success':
        console.log('Authentication successful')
        break

      case 'auth_error':
        console.error('Authentication failed:', data.error)
        this.notifyErrorHandlers(new Error(data.error))
        break

      case 'error':
        console.error('Server error:', data.message)
        this.notifyErrorHandlers(new Error(data.message))
        break

      default:
        console.log('Unknown message type:', data.type)
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (this.userId && this.token) {
        this.connect(this.userId, this.token).catch(console.error)
      }
    }, delay)
  }

  /**
   * Subscribe to message events
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }

  /**
   * Subscribe to connection events
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler)
    }
  }

  /**
   * Subscribe to error events
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler)
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler)
    }
  }

  /**
   * Notify all message handlers
   */
  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  /**
   * Notify all connection handlers
   */
  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected)
      } catch (error) {
        console.error('Error in connection handler:', error)
      }
    })
  }

  /**
   * Notify all error handlers
   */
  private notifyErrorHandlers(error: Error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (err) {
        console.error('Error in error handler:', err)
      }
    })
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect')
      this.ws = null
    }
    this.userId = null
    this.token = null
    this.reconnectAttempts = 0
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
const chatClient = new ChatClient()

export default chatClient
