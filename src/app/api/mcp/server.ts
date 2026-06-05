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

    const response = await fetch(`https://x2xhub.com/products?${params}`)
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
    const response = await fetch(`https://x2xhub.com/products/${productId}`)
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
    const response = await fetch('https://x2xhub.com/buyer/inquiries', {
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

    const response = await fetch(`https://x2xhub.com/sellers?${params}`)
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
    const response = await fetch('https://x2xhub.com/buyer/requirements', {
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

    const response = await fetch(`https://x2xhub.com/marketplace/tasks?${params}`)
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
    const response = await fetch(`https://x2xhub.com/marketplace/tasks/${taskId}/claim`, {
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
    const response = await fetch('https://x2xhub.com/seller/dashboard', {
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
    const response = await fetch('https://x2xhub.com/products', {
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

// Tool: Get Booth Customization
server.tool(
  'get_booth_customization',
  'Get current booth/storefront customization settings',
  {},
  async () => {
    const response = await fetch('https://x2xhub.com/seller/booth-customization', {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
    })

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to fetch booth customization. Please ensure you have a seller account.`,
          },
        ],
      }
    }

    const data = await response.json()

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    }
  }
)

// Tool: Update Booth Customization
server.tool(
  'update_booth_customization',
  'Update booth/storefront customization settings',
  {
    boothName: z.string().optional().describe('Custom booth name'),
    boothTheme: z.enum(['light', 'dark', 'vibrant', 'modern', 'classic', 'minimal']).optional().describe('Booth theme'),
    boothLayout: z.enum(['grid', 'list', 'featured', 'showcase', 'gallery']).optional().describe('Product layout'),
    boothColor: z.string().optional().describe('Primary accent color (hex format, e.g., #6366f1)'),
    boothBgImage: z.string().optional().describe('Background image URL'),
    boothAccentImage: z.string().optional().describe('Accent image URL'),
    boothFont: z.string().optional().describe('Custom font family'),
    boothAnimations: z.boolean().optional().describe('Enable smooth animations'),
    booth3DPreview: z.boolean().optional().describe('Enable 3D booth preview'),
    boothTags: z.array(z.string()).optional().describe('Tags for discoverability (max 10)'),
    boothCategories: z.array(z.string()).optional().describe('Product categories'),
    isCustomizable: z.boolean().optional().describe('Whether products can be customized'),
  },
  async (args: any) => {
    const response = await fetch('https://x2xhub.com/seller/booth-customization', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify(args),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Failed to update booth customization'}`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Booth customization updated successfully!\n\nTheme: ${result.customization.boothTheme}\nLayout: ${result.customization.boothLayout}\nColor: ${result.customization.boothColor}\nAnimations: ${result.customization.boothAnimations ? 'Enabled' : 'Disabled'}`,
        },
      ],
    }
  }
)

// Tool: Apply Booth Preset
server.tool(
  'apply_booth_preset',
  'Apply a preset theme to the booth/storefront',
  {
    preset: z.enum(['light', 'dark', 'vibrant', 'modern', 'classic', 'minimal']).describe('Preset theme name'),
  },
  async (args: any) => {
    const { preset } = args
    const response = await fetch('https://x2xhub.com/seller/booth-customization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        action: 'apply_preset',
        preset,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Failed to apply preset'}`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully applied "${preset}" preset!\n\nTheme: ${result.customization.boothTheme}\nColor: ${result.customization.boothColor}`,
        },
      ],
    }
  }
)

// Tool: Reset Booth Customization
server.tool(
  'reset_booth_customization',
  'Reset booth/storefront to default settings',
  {},
  async () => {
    const response = await fetch('https://x2xhub.com/seller/booth-customization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        action: 'reset',
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Failed to reset booth customization'}`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Booth customization has been reset to default settings!\n\nTheme: ${result.customization.boothTheme}\nLayout: ${result.customization.boothLayout}\nColor: ${result.customization.boothColor}`,
        },
      ],
    }
  }
)

// Tool: Upload Booth Banner
server.tool(
  'upload_booth_banner',
  'Upload a banner image for the booth/storefront',
  {
    imageUrl: z.string().describe('URL of the banner image'),
  },
  async (args: any) => {
    const { imageUrl } = args
    const response = await fetch('https://x2xhub.com/seller/booth-customization', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        boothBgImage: imageUrl,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Failed to upload banner'}`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Banner image uploaded successfully!\nImage URL: ${imageUrl}`,
        },
      ],
    }
  }
)

// Tool: Get Booth Preview
server.tool(
  'get_booth_preview',
  'Get a preview of the booth/storefront with current settings',
  {},
  async () => {
    const response = await fetch('https://x2xhub.com/seller/booth-customization', {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to generate booth preview`,
          },
        ],
      }
    }

    const preview = data.preview || {}
    const theme = data.presetThemes?.[data.customization?.boothTheme] || {}

    return {
      content: [
        {
          type: 'text',
          text: `Booth Preview:\n\nCSS Variables:\n${JSON.stringify(preview.cssVariables || {}, null, 2)}\n\nLayout: ${preview.layout || 'grid'}\nAnimations: ${preview.animations ? 'Enabled' : 'Disabled'}\n3D Preview: ${preview.enable3D ? 'Enabled' : 'Disabled'}\n\nTheme Colors:\n- Background: ${theme.background || 'N/A'}\n- Text: ${theme.text || 'N/A'}\n- Accent: ${theme.accent || 'N/A'}`,
        },
      ],
    }
  }
)

// Tool: Translate Text
server.tool(
  'translate_text',
  'Translate text to a specified language',
  {
    text: z.string().describe('Text to translate'),
    targetLanguage: z.string().describe('Target language code (e.g., zh, en, es, fr, de, ja, ko, ar, ru, pt)'),
    sourceLanguage: z.string().optional().describe('Source language code (auto-detected if not provided)'),
  },
  async (args: any) => {
    const { text, targetLanguage, sourceLanguage } = args
    const response = await fetch('https://x2xhub.com/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Translation failed'}`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Translation Result:\n\nOriginal (${result.translation?.sourceLanguage}): ${result.translation?.original}\n\nTranslated (${result.translation?.targetLanguage}): ${result.translation?.translated}\n\nMatch Score: ${Math.round((result.translation?.match || 0) * 100)}%`,
        },
      ],
    }
  }
)

// Tool: Translate to Multiple Languages
server.tool(
  'translate_multiple',
  'Translate text to multiple languages at once',
  {
    text: z.string().describe('Text to translate'),
    targetLanguages: z.array(z.string()).describe('Array of target language codes'),
  },
  async (args: any) => {
    const { text, targetLanguages } = args
    const response = await fetch('https://x2xhub.com/ai/translate/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        text,
        targetLanguages,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Bulk translation failed'}`,
          },
        ],
      }
    }

    const translations = result.translations || {}
    let output = `Bulk Translation Results:\n\nOriginal: ${text}\n\n`

    for (const [lang, trans] of Object.entries(translations)) {
      const transData = trans as any
      if (transData.success) {
        output += `${lang.toUpperCase()}: ${transData.translated}\n`
      } else {
        output += `${lang.toUpperCase()}: [Translation failed]\n`
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    }
  }
)

// Tool: Translate Product
server.tool(
  'translate_product',
  'Translate product information to multiple languages',
  {
    productId: z.string().describe('Product ID to translate'),
    targetLanguages: z.array(z.string()).describe('Array of target language codes'),
  },
  async (args: any) => {
    const { productId, targetLanguages } = args

    const productResponse = await fetch(`https://x2xhub.com/products/${productId}`)
    const product = await productResponse.json()

    if (!productResponse.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Failed to fetch product ${productId}`,
          },
        ],
      }
    }

    const translateResponse = await fetch('https://x2xhub.com/ai/translate/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({
        text: `${product.title || ''}\n\n${product.description || ''}`,
        targetLanguages,
      }),
    })

    const result = await translateResponse.json()

    if (!translateResponse.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error || 'Product translation failed'}`,
          },
        ],
      }
    }

    const translations = result.translations || {}
    let output = `Product Translation Results:\n\nOriginal Title: ${product.title}\nOriginal Description: ${product.description}\n\n`

    for (const [lang, trans] of Object.entries(translations)) {
      const transData = trans as any
      const lines = (transData.translated || '').split('\n\n')
      output += `${lang.toUpperCase()}:\n`
      output += `  Title: ${lines[0] || 'N/A'}\n`
      output += `  Description: ${lines[1] || 'N/A'}\n\n`
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    }
  }
)

// Tool: Get Supported Languages
server.tool(
  'get_supported_languages',
  'Get list of supported languages for translation',
  {},
  async () => {
    const languages = [
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'th', name: 'Thai', flag: '🇹🇭' },
      { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
      { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
      { code: 'ms', name: 'Malay', flag: '🇲🇾' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
      { code: 'pl', name: 'Polish', flag: '🇵🇱' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
      { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    ]

    return {
      content: [
        {
          type: 'text',
          text: `Supported Languages (${languages.length}):\n\n${languages.map(l => `${l.flag} ${l.code.toUpperCase()} - ${l.name}`).join('\n')}`,
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
