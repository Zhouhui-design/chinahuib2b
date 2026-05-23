#!/usr/bin/env node

/**
 * China Hui B2B CLI Tool
 * Command-line interface for AI agents to interact with the platform
 */

const API_BASE = 'https://chinahuib2b.top/api'
let API_TOKEN = process.env.CHINAHUIB2B_API_TOKEN || ''

// Helper functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function printJSON(data) {
  console.log(JSON.stringify(data, null, 2))
}

// Commands
const commands = {
  // Authentication
  async login(email, password) {
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      
      API_TOKEN = result.token
      process.env.CHINAHUIB2B_API_TOKEN = result.token
      
      console.log('✓ Login successful!')
      console.log(`Token: ${result.token}`)
      printJSON(result.user)
    } catch (error) {
      console.error('✗ Login failed:', error.message)
      process.exit(1)
    }
  },

  async register(name, email, password, type = 'buyer') {
    try {
      const result = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, type }),
      })
      
      console.log('✓ Registration successful!')
      printJSON(result)
    } catch (error) {
      console.error('✗ Registration failed:', error.message)
      process.exit(1)
    }
  },

  // Products
  async searchProducts(query, options = {}) {
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (options.category) params.append('category', options.category)
      if (options.minPrice) params.append('minPrice', options.minPrice)
      if (options.maxPrice) params.append('maxPrice', options.maxPrice)
      if (options.country) params.append('country', options.country)
      if (options.limit) params.append('limit', options.limit)

      const products = await apiRequest(`/products?${params}`)
      console.log(`Found ${products.length} products:`)
      printJSON(products)
    } catch (error) {
      console.error('✗ Search failed:', error.message)
      process.exit(1)
    }
  },

  async getProduct(productId) {
    try {
      const product = await apiRequest(`/products/${productId}`)
      console.log('Product details:')
      printJSON(product)
    } catch (error) {
      console.error('✗ Failed to get product:', error.message)
      process.exit(1)
    }
  },

  async createProduct(productData) {
    try {
      const result = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      })
      
      console.log('✓ Product created successfully!')
      printJSON(result)
    } catch (error) {
      console.error('✗ Failed to create product:', error.message)
      process.exit(1)
    }
  },

  // Sellers
  async listSellers(options = {}) {
    try {
      const params = new URLSearchParams()
      if (options.category) params.append('category', options.category)
      if (options.country) params.append('country', options.country)
      if (options.limit) params.append('limit', options.limit)

      const sellers = await apiRequest(`/sellers?${params}`)
      console.log(`Found ${sellers.length} sellers:`)
      printJSON(sellers)
    } catch (error) {
      console.error('✗ Failed to list sellers:', error.message)
      process.exit(1)
    }
  },

  async getSellerStats() {
    try {
      const stats = await apiRequest('/seller/dashboard')
      console.log('Seller dashboard stats:')
      printJSON(stats)
    } catch (error) {
      console.error('✗ Failed to get seller stats:', error.message)
      process.exit(1)
    }
  },

  // Buyer
  async sendInquiry(productId, message, quantity) {
    try {
      const result = await apiRequest('/buyer/inquiries', {
        method: 'POST',
        body: JSON.stringify({ productId, message, quantity }),
      })
      
      console.log('✓ Inquiry sent successfully!')
      printJSON(result)
    } catch (error) {
      console.error('✗ Failed to send inquiry:', error.message)
      process.exit(1)
    }
  },

  async postRequirement(requirementData) {
    try {
      const result = await apiRequest('/buyer/requirements', {
        method: 'POST',
        body: JSON.stringify(requirementData),
      })
      
      console.log('✓ Requirement posted successfully!')
      printJSON(result)
    } catch (error) {
      console.error('✗ Failed to post requirement:', error.message)
      process.exit(1)
    }
  },

  // Marketplace Tasks
  async listTasks(options = {}) {
    try {
      const params = new URLSearchParams()
      if (options.type) params.append('type', options.type)
      if (options.status) params.append('status', options.status)
      if (options.limit) params.append('limit', options.limit)

      const tasks = await apiRequest(`/marketplace/tasks?${params}`)
      console.log(`Found ${tasks.length} tasks:`)
      printJSON(tasks)
    } catch (error) {
      console.error('✗ Failed to list tasks:', error.message)
      process.exit(1)
    }
  },

  async claimTask(taskId) {
    try {
      const result = await apiRequest(`/marketplace/tasks/${taskId}/claim`, {
        method: 'POST',
      })
      
      console.log('✓ Task claimed successfully!')
      printJSON(result)
    } catch (error) {
      console.error('✗ Failed to claim task:', error.message)
      process.exit(1)
    }
  },

  // Analytics
  async getAnalytics(type = 'views') {
    try {
      const stats = await apiRequest(`/analytics/${type}`)
      console.log(`${type} statistics:`)
      printJSON(stats)
    } catch (error) {
      console.error('✗ Failed to get analytics:', error.message)
      process.exit(1)
    }
  },
}

// CLI parser
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log(`
China Hui B2B CLI Tool
======================

Usage: chinahuib2b <command> [options]

Commands:
  auth
    login <email> <password>                    Login to get API token
    register <name> <email> <password> [type]   Register new account (buyer/seller)

  products
    search <query> [--category=X] [--min-price=X] [--max-price=X] [--country=X] [--limit=X]
    get <product-id>                             Get product details
    create --title=X --description=X --price=X --category=X [--currency=USD] [--images=URL1,URL2]

  sellers
    list [--category=X] [--country=X] [--limit=X]
    stats                                        Get seller dashboard stats

  buyer
    inquiry <product-id> <message> [--quantity=X]
    requirement --title=X --description=X [--budget=X] [--currency=USD]

  marketplace
    tasks [--type=X] [--status=X] [--limit=X]
    claim <task-id>

  analytics
    views                                        Get view statistics
    inquiries                                    Get inquiry statistics
    downloads                                    Get download statistics

Examples:
  chinahuib2b auth login user@example.com password123
  chinahuib2b products search electronics --category=phones --max-price=1000
  chinahuib2b buyer inquiry prod123 "Interested in bulk order" --quantity=100
  chinahuib2b marketplace tasks --type=manufacturing --limit=5
`)
    process.exit(0)
  }

  try {
    switch (command) {
      case 'auth':
        const subCommand = args[1]
        if (subCommand === 'login') {
          await commands.login(args[2], args[3])
        } else if (subCommand === 'register') {
          await commands.register(args[2], args[3], args[4], args[5] || 'buyer')
        }
        break

      case 'products':
        const productCommand = args[1]
        if (productCommand === 'search') {
          const query = args[2]
          const options = parseOptions(args.slice(3))
          await commands.searchProducts(query, options)
        } else if (productCommand === 'get') {
          await commands.getProduct(args[2])
        } else if (productCommand === 'create') {
          const data = parseOptions(args.slice(2))
          await commands.createProduct(data)
        }
        break

      case 'sellers':
        const sellerCommand = args[1]
        if (sellerCommand === 'list') {
          const options = parseOptions(args.slice(2))
          await commands.listSellers(options)
        } else if (sellerCommand === 'stats') {
          await commands.getSellerStats()
        }
        break

      case 'buyer':
        const buyerCommand = args[1]
        if (buyerCommand === 'inquiry') {
          const productId = args[2]
          const message = args[3]
          const options = parseOptions(args.slice(4))
          await commands.sendInquiry(productId, message, options.quantity)
        } else if (buyerCommand === 'requirement') {
          const data = parseOptions(args.slice(2))
          await commands.postRequirement(data)
        }
        break

      case 'marketplace':
        const marketCommand = args[1]
        if (marketCommand === 'tasks') {
          const options = parseOptions(args.slice(2))
          await commands.listTasks(options)
        } else if (marketCommand === 'claim') {
          await commands.claimTask(args[2])
        }
        break

      case 'analytics':
        const analyticsType = args[1] || 'views'
        await commands.getAnalytics(analyticsType)
        break

      default:
        console.error(`Unknown command: ${command}`)
        process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Parse --key=value options
function parseOptions(args) {
  const options = {}
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      const normalizedKey = key.replace(/-/g, '')
      options[normalizedKey] = value || true
    }
  }
  return options
}

main()
