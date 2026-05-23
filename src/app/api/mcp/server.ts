/**
 * MCP (Model Context Protocol) Server for China Hui B2B
 * Allows AI agents to interact with the platform using natural language
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

// Create MCP server
const server = new McpServer({
  name: 'China Hui B2B',
  version: '1.0.0',
})

// Tool: Search Products
server.tool(
  'search_products',
  'Search for products on China Hui B2B marketplace',
  {
    query: z.string().optional().describe('Search query'),
    category: z.string().optional().describe('Product category'),
    minPrice: z.number().optional().describe('Minimum price'),
    maxPrice: z.number().optional().describe('Maximum price'),
    country: z.string().optional().describe('Seller country'),
    limit: z.number().default(10).describe('Number of results'),
  },
  async (args: any) => {
    const { query, category, minPrice, maxPrice, country, limit } = args
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (category) params.append('category', category)
    if (minPrice) params.append('minPrice', minPrice.toString())
    if (maxPrice) params.append('maxPrice', maxPrice.toString())
    if (country) params.append('country', country)
    params.append('limit', limit.toString())

    const response = await fetch(`https://chinahuib2b.top/api/products?${params}`)
    const data = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data.products || [], null, 2),
        },
      ],
    }
  }
)

// Tool: Get Product Details
server.tool(
  'get_product_details',
  'Get detailed information about a specific product',
  {
    productId: z.string().describe('Product ID'),
  },
  async (args: any) => {
    const { productId } = args
    const response = await fetch(`https://chinahuib2b.top/api/products/${productId}`)
    const product = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(product, null, 2),
        },
      ],
    }
  }
)

// Tool: Create Inquiry
server.tool(
  'create_inquiry',
  'Send an inquiry to a seller about a product',
  {
    productId: z.string().describe('Product ID'),
    message: z.string().describe('Inquiry message'),
    quantity: z.number().optional().describe('Desired quantity'),
  },
  async (args: any) => {
    const { productId, message, quantity } = args
    // This would require authentication in production
    const response = await fetch('https://chinahuib2b.top/api/buyer/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        productId,
        message,
        quantity,
      }),
    })

    const result = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: `Inquiry sent successfully! Inquiry ID: ${result.id}`,
        },
      ],
    }
  }
)

// Tool: List Sellers
server.tool(
  'list_sellers',
  'List all sellers/stores on the platform',
  {
    category: z.string().optional().describe('Filter by category'),
    country: z.string().optional().describe('Filter by country'),
    limit: z.number().default(10).describe('Number of results'),
  },
  async (args: any) => {
    const { category, country, limit } = args
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (country) params.append('country', country)
    params.append('limit', limit.toString())

    const response = await fetch(`https://chinahuib2b.top/api/sellers?${params}`)
    const data = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data.sellers || [], null, 2),
        },
      ],
    }
  }
)

// Tool: Post Requirement
server.tool(
  'post_requirement',
  'Post a buying requirement on the platform',
  {
    title: z.string().describe('Requirement title'),
    description: z.string().describe('Detailed description'),
    budget: z.number().optional().describe('Budget amount'),
    currency: z.string().default('USD').describe('Currency code'),
    deadline: z.string().optional().describe('Deadline date (ISO format)'),
  },
  async (args: any) => {
    const { title, description, budget, currency, deadline } = args
    const response = await fetch('https://chinahuib2b.top/api/buyer/requirements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        title,
        description,
        budget,
        currency,
        deadline,
      }),
    })

    const result = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: `Requirement posted successfully! Requirement ID: ${result.id}`,
        },
      ],
    }
  }
)

// Tool: List Marketplace Tasks
server.tool(
  'list_tasks',
  'List available tasks in the marketplace',
  {
    type: z.enum(['all', 'product_sale', 'manufacturing', 'service']).optional().describe('Task type'),
    status: z.enum(['open', 'in_progress', 'completed']).optional().describe('Task status'),
    limit: z.number().default(10).describe('Number of results'),
  },
  async (args: any) => {
    const { type, status, limit } = args
    const params = new URLSearchParams()
    if (type && type !== 'all') params.append('type', type)
    if (status) params.append('status', status)
    params.append('limit', limit.toString())

    const response = await fetch(`https://chinahuib2b.top/api/marketplace/tasks?${params}`)
    const data = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data.tasks || [], null, 2),
        },
      ],
    }
  }
)

// Tool: Claim Task
server.tool(
  'claim_task',
  'Claim a task from the marketplace',
  {
    taskId: z.string().describe('Task ID'),
  },
  async (args: any) => {
    const { taskId } = args
    const response = await fetch(`https://chinahuib2b.top/api/marketplace/tasks/${taskId}/claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
    })

    const result = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: `Task claimed successfully! Task ID: ${taskId}`,
        },
      ],
    }
  }
)

// Tool: Get Seller Dashboard Stats
server.tool(
  'get_seller_stats',
  'Get seller dashboard statistics',
  {},
  async () => {
    const response = await fetch('https://chinahuib2b.top/api/seller/dashboard', {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
    })

    const stats = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    }
  }
)

// Tool: Create Product
server.tool(
  'create_product',
  'Create a new product listing (seller only)',
  {
    title: z.string().describe('Product title'),
    description: z.string().describe('Product description'),
    price: z.number().describe('Product price'),
    currency: z.string().default('USD').describe('Currency code'),
    category: z.string().describe('Product category'),
    images: z.array(z.string()).optional().describe('Product image URLs'),
    minOrderQty: z.number().optional().describe('Minimum order quantity'),
  },
  async (args: any) => {
    const { title, description, price, currency, category, images, minOrderQty } = args
    const response = await fetch('https://chinahuib2b.top/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        title,
        description,
        price,
        currency,
        category,
        images,
        minOrderQty,
      }),
    })

    const result = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: `Product created successfully! Product ID: ${result.id}`,
        },
      ],
    }
  }
)

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('China Hui B2B MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
