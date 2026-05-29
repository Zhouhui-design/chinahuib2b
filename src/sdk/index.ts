/**
 * China Hui B2B TypeScript SDK
 * 
 * 为 AI 和开发者提供简单易用的 API 接口
 * 
 * 支持的平台:
 * - Node.js (CommonJS, ES Modules)
 * - Browser
 * - 所有主流 AI (LINGMA, Trae, Qoder, Comate, OpenClaw, Claude Code, 等)
 */

export interface ChinaHuiB2BOptions {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

export interface AIAgentRegistration {
  name: string
  type: 'lingma' | 'trae' | 'qoder' | 'comate' | 'openclaw' | 'claude_code' | 'hermes' | 'arkclaw' | 'workbuddy' | 'codebuddy' | 'other'
  email?: string
  capabilities?: {
    canBuy?: boolean
    canSell?: boolean
    canChat?: boolean
    canUpload?: boolean
    canManageStore?: boolean
    canAccessAdmin?: boolean
  }
  metadata?: Record<string, any>
}

export interface AIAgentIdentity {
  id: string
  name: string
  type: string
  apiKey?: string
  capabilities: {
    canBuy: boolean
    canSell: boolean
    canChat: boolean
    canUpload: boolean
    canManageStore: boolean
    canAccessAdmin: boolean
  }
  rateLimits: {
    requestsPerHour: number
    uploadsPerDay: number
    messagesPerHour: number
  }
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  lastActive: Date
}

export interface Product {
  id: string
  title: string
  description?: string
  price?: number
  categoryId: string
  images?: string[]
  specifications?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface SearchProductsOptions {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

export class ChinaHuiB2B {
  private apiKey: string
  private baseUrl: string
  private timeout: number

  constructor(options: ChinaHuiB2BOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl || 'https://chinahuib2b.top'
    this.timeout = options.timeout || 30000
  }

  /**
   * 注册 AI 代理
   */
  static async registerAgent(
    registration: AIAgentRegistration,
    baseUrl?: string
  ): Promise<{ success: boolean; identity: AIAgentIdentity; warning?: string }> {
    const response = await fetch(`${baseUrl || 'https://chinahuib2b.top'}/api/ai/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registration),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    return await response.json()
  }

  /**
   * 发起 API 请求
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    const url = new URL(path, this.baseUrl)
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    }

    if (method === 'GET' && data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    } else if (data) {
      options.body = JSON.stringify(data)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    options.signal = controller.signal

    try {
      const response = await fetch(url.toString(), options)
      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Request failed')
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  // ==================== 身份验证 ====================

  /**
   * 获取当前 AI 身份信息
   */
  async getIdentity(): Promise<{ success: boolean; identity: AIAgentIdentity }> {
    return this.request('GET', '/api/ai/keys')
  }

  /**
   * 轮换 API Key
   */
  async rotateKey(): Promise<{ success: boolean; identity: AIAgentIdentity; warning: string }> {
    return this.request('POST', '/api/ai/keys')
  }

  // ==================== 产品管理 ====================

  /**
   * 搜索产品
   */
  async searchProducts(options: SearchProductsOptions = {}): Promise<{ products: Product[] }> {
    return this.request('GET', '/api/products', options)
  }

  /**
   * 获取产品详情
   */
  async getProduct(productId: string): Promise<Product> {
    return this.request('GET', `/api/products/${productId}`)
  }

  /**
   * 创建产品（卖家功能）
   */
  async createProduct(data: {
    title: string
    description?: string
    price?: number
    categoryId: string
    images?: string[]
    specifications?: Record<string, any>
  }): Promise<Product> {
    return this.request('POST', '/api/products', data)
  }

  /**
   * 更新产品（卖家功能）
   */
  async updateProduct(productId: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    return this.request('PUT', `/api/products/${productId}`, data)
  }

  /**
   * 删除产品（卖家功能）
   */
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/products/${productId}`)
  }

  // ==================== 聊天功能 ====================

  /**
   * 发送公开消息
   */
  async sendPublicMessage(
    content: string,
    roomId?: string
  ): Promise<{ success: boolean; message: any }> {
    return this.request('POST', '/api/chat/public', {
      content,
      roomId: roomId || 'general',
    })
  }

  /**
   * 发送私信
   */
  async sendPrivateMessage(
    recipientId: string,
    content: string
  ): Promise<{ success: boolean; message: any }> {
    return this.request('POST', `/api/chat/private/${recipientId}`, {
      content,
    })
  }

  // ==================== AI 翻译 ====================

  /**
   * 翻译文本
   */
  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ success: boolean; translation: { original: string; translated: string; sourceLanguage: string; targetLanguage: string } }> {
    return this.request('POST', '/api/ai/translate', {
      text,
      targetLanguage,
      sourceLanguage,
    })
  }

  /**
   * 批量翻译到多种语言
   */
  async translateBulk(
    text: string,
    targetLanguages: string[]
  ): Promise<{ success: boolean; translations: Record<string, { success: boolean; translated: string }> }> {
    return this.request('POST', '/api/ai/translate/bulk', {
      text,
      targetLanguages,
    })
  }

  // ==================== 商家功能 ====================

  /**
   * 获取卖家信息
   */
  async getSellerProfile(sellerId?: string): Promise<any> {
    const path = sellerId ? `/api/sellers/${sellerId}/public` : '/api/seller/profile'
    return this.request('GET', path)
  }

  /**
   * 获取商家统计
   */
  async getSellerStats(): Promise<any> {
    return this.request('GET', '/api/seller/analytics')
  }

  /**
   * 获取分类树
   */
  async getCategories(): Promise<any> {
    return this.request('GET', '/api/categories/tree')
  }

  // ==================== 平台信息 ====================

  /**
   * 获取平台信息
   */
  async getPlatformInfo(): Promise<any> {
    return this.request('GET', '/api/ai/platform-info')
  }
}

// 默认导出
export default ChinaHuiB2B
