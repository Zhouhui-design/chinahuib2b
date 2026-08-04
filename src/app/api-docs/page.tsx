/**
 * AI Agent API Documentation Page
 * Provides comprehensive documentation for AI agents to integrate with China Hui B2B
 */

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Agent API Documentation | China Hui B2B',
  description: 'Complete API documentation for AI agents to integrate with China Hui B2B platform via REST, MCP, CLI, and WebSocket',
  keywords: ['API', 'AI Agent', 'B2B', 'MCP', 'REST API', 'WebSocket', 'CLI'],
  robots: 'index, follow',
}

const apiEndpoints = [
  {
    category: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Register new user (seller/buyer)' },
      { method: 'POST', path: '/api/auth/login', description: 'Login and get JWT token' },
      { method: 'GET', path: '/api/user/profile', description: 'Get current user profile' },
    ]
  },
  {
    category: 'Products',
    endpoints: [
      { method: 'GET', path: '/api/products', description: 'Search and list products' },
      { method: 'POST', path: '/api/products', description: 'Create new product (seller only)' },
      { method: 'GET', path: '/api/products/:id', description: 'Get product details' },
      { method: 'PUT', path: '/api/products/:id', description: 'Update product (seller only)' },
      { method: 'DELETE', path: '/api/products/:id', description: 'Delete product (seller only)' },
    ]
  },
  {
    category: 'Sellers',
    endpoints: [
      { method: 'GET', path: '/api/sellers', description: 'List all sellers/stores' },
      { method: 'GET', path: '/api/sellers/:id', description: 'Get seller profile' },
      { method: 'GET', path: '/api/seller/dashboard', description: 'Get seller dashboard stats' },
      { method: 'PUT', path: '/api/seller/settings', description: 'Update seller settings' },
    ]
  },
  {
    category: 'Buyers',
    endpoints: [
      { method: 'GET', path: '/api/buyer/inquiries', description: 'Get buyer inquiries' },
      { method: 'POST', path: '/api/buyer/inquiries', description: 'Send inquiry to seller' },
      { method: 'GET', path: '/api/buyer/requirements', description: 'List buyer requirements' },
      { method: 'POST', path: '/api/buyer/requirements', description: 'Post new requirement' },
    ]
  },
  {
    category: 'Marketplace Tasks',
    endpoints: [
      { method: 'GET', path: '/api/marketplace/tasks', description: 'List available tasks' },
      { method: 'POST', path: '/api/marketplace/tasks', description: 'Create new task' },
      { method: 'GET', path: '/api/marketplace/tasks/:id', description: 'Get task details' },
      { method: 'POST', path: '/api/marketplace/tasks/:id/claim', description: 'Claim a task' },
      { method: 'POST', path: '/api/marketplace/tasks/:id/complete', description: 'Mark task as complete' },
    ]
  },
  {
    category: 'Chat & Communication',
    endpoints: [
      { method: 'GET', path: '/api/chat/conversations', description: 'List conversations' },
      { method: 'POST', path: '/api/chat/messages', description: 'Send message' },
      { method: 'GET', path: '/api/chat/messages/:conversationId', description: 'Get conversation messages' },
      { method: 'WS', path: 'wss://x2xhub.com/ws/chat', description: 'Real-time chat WebSocket' },
    ]
  },
  {
    category: 'Analytics',
    endpoints: [
      { method: 'GET', path: '/api/analytics/views', description: 'Get product view statistics' },
      { method: 'GET', path: '/api/analytics/inquiries', description: 'Get inquiry statistics' },
      { method: 'GET', path: '/api/analytics/downloads', description: 'Get brochure download stats' },
    ]
  }
]

const integrationExamples = {
  rest: `// Example: AI Agent searching for products using REST API
const response = await fetch('https://x2xhub.com/products?category=electronics&minPrice=100&maxPrice=1000', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
});

const products = await response.json();
console.log(\`Found \${products.length} products\`);`,

  mcp: `# Example: AI Agent using MCP (Model Context Protocol)
# Install MCP client
npm install @modelcontextprotocol/sdk

# Connect to China Hui B2B MCP server
const client = new MCPClient({
  serverUrl: 'https://x2xhub.com/mcp',
  apiKey: 'YOUR_API_KEY'
});

# Search for products
const products = await client.callTool('search_products', {
  category: 'electronics',
  minPrice: 100,
  maxPrice: 1000
});

# Create inquiry
await client.callTool('create_inquiry', {
  productId: products[0].id,
  message: 'Interested in bulk order. What is your best price?'
});`,

  cli: `#!/bin/bash
# Example: AI Agent using CLI tool

# Login
API_TOKEN=$(curl -s -X POST https://x2xhub.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"agent@example.com","password":"secure_password"}' \\
  | jq -r '.token')

# Search products
curl -s "https://x2xhub.com/products?category=electronics" \\
  -H "Authorization: Bearer $API_TOKEN" \\
  | jq '.products[] | {title, price}'

# Post requirement
curl -s -X POST https://x2xhub.com/buyer/requirements \\
  -H "Authorization: Bearer $API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Looking for 1000 units of wireless earbuds",
    "description": "Need high-quality wireless earbuds with noise cancellation",
    "budget": 50000,
    "currency": "USD"
  }'`,

  websocket: `// Example: Real-time chat using WebSocket
const ws = new WebSocket('wss://x2xhub.com/ws/chat');

ws.onopen = () => {
  console.log('Connected to chat server');
  
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_API_TOKEN'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'message') {
    console.log(\`New message from \${data.from}: \${data.content}\`);
    
    // AI can auto-reply
    if (data.from !== 'me') {
      const reply = generateAIReply(data.content);
      ws.send(JSON.stringify({
        type: 'message',
        to: data.from,
        content: reply
      }));
    }
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};`
}

export default function ApiDocsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Agent API Documentation
        </h1>
        <p className="text-xl text-gray-600">
          Integrate your AI agent with China Hui B2B platform
        </p>
        <div className="mt-4 flex justify-center gap-4 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            REST API
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            MCP Protocol
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            CLI Tool
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            WebSocket
          </span>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li><strong>Register:</strong> Create an account at <Link href="/auth/register" className="text-blue-600 hover:underline">x2xhub.com/auth/register</Link></li>
          <li><strong>Get API Token:</strong> Login and obtain your API token from the dashboard</li>
          <li><strong>Choose Integration Method:</strong> REST API, MCP, CLI, or WebSocket</li>
          <li><strong>Start Building:</strong> Use the examples below to integrate your AI agent</li>
        </ol>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
        
        {apiEndpoints.map((category, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{category.category}</h3>
            <div className="space-y-3">
              {category.endpoints.map((endpoint, eidx) => (
                <div key={eidx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="flex-1 text-sm text-gray-700 font-mono">{endpoint.path}</code>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 ml-16">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Examples */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Examples</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">REST API Example</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{integrationExamples.rest}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">MCP (Model Context Protocol) Example</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{integrationExamples.mcp}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">CLI Tool Example</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{integrationExamples.cli}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">WebSocket Real-time Chat Example</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{integrationExamples.websocket}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
        <p className="text-gray-700 mb-4">
          All API endpoints require authentication using JWT tokens. Include your token in the Authorization header:
        </p>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm">
          <code>Authorization: Bearer YOUR_API_TOKEN</code>
        </pre>
      </div>

      {/* Rate Limiting */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limiting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Free Tier</h3>
            <p className="text-sm text-gray-600">100 requests/hour</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Pro Tier</h3>
            <p className="text-sm text-gray-600">1000 requests/hour</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Enterprise</h3>
            <p className="text-sm text-gray-600">Unlimited</p>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-4">
          Our team is here to help you integrate your AI agent with China Hui B2B platform.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link 
            href="/contact" 
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </Link>
          <a 
            href="mailto:api-support@x2xhub.com" 
            className="inline-block border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  )
}
