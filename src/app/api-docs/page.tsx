'use client'

import { useState } from 'react'
import { BookOpen, Terminal, Key, Bot, Code, Database, MessageSquare, Globe, Copy, CheckCircle } from 'lucide-react'

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/products',
      description: 'Get all products',
      example: 'curl https://chinahuib2b.top/api/products'
    },
    {
      method: 'POST',
      endpoint: '/api/products',
      description: 'Create a new product',
      example: 'curl -X POST https://chinahuib2b.top/api/products \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d \'{"title":"Product Name","price":100}\''
    },
    {
      method: 'GET',
      endpoint: '/api/chat/public',
      description: 'Get public chat messages',
      example: 'curl https://chinahuib2b.top/api/chat/public'
    },
    {
      method: 'POST',
      endpoint: '/api/chat/public',
      description: 'Send public chat message',
      example: 'curl -X POST https://chinahuib2b.top/api/chat/public \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d \'{"content":"Hello world!"}\''
    },
    {
      method: 'GET',
      endpoint: '/api/marketplace/tasks',
      description: 'Get marketplace tasks',
      example: 'curl https://chinahuib2b.top/api/marketplace/tasks'
    },
    {
      method: 'POST',
      endpoint: '/api/marketplace/tasks',
      description: 'Create marketplace task',
      example: 'curl -X POST https://chinahuib2b.top/api/marketplace/tasks \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d \'{"title":"My Task","description":"Task description","budget":1000}\''
    },
    {
      method: 'GET',
      endpoint: '/api/auth/session',
      description: 'Get current session',
      example: 'curl https://chinahuib2b.top/api/auth/session \\\n  -H "Authorization: Bearer YOUR_API_KEY"'
    },
    {
      method: 'GET',
      endpoint: '/api/stores',
      description: 'Get all stores',
      example: 'curl https://chinahuib2b.top/api/stores'
    }
  ]

  const cliCommands = [
    {
      command: 'ge login',
      description: 'Login to Global Expo CLI',
      example: 'ge login --email your@email.com --password yourpassword'
    },
    {
      command: 'ge products list',
      description: 'List all products',
      example: 'ge products list --limit 50'
    },
    {
      command: 'ge products create',
      description: 'Create a new product',
      example: 'ge products create --title "My Product" --price 100 --description "Product description"'
    },
    {
      command: 'ge chat send',
      description: 'Send chat message',
      example: 'ge chat send --room public --message "Hello everyone!"'
    },
    {
      command: 'ge chat read',
      description: 'Read chat messages',
      example: 'ge chat read --room public --limit 100'
    },
    {
      command: 'ge tasks list',
      description: 'List marketplace tasks',
      example: 'ge tasks list --status open'
    },
    {
      command: 'ge tasks create',
      description: 'Create marketplace task',
      example: 'ge tasks create --title "My Task" --budget 1000 --description "Task description"'
    },
    {
      command: 'ge auctions list',
      description: 'List auctions',
      example: 'ge auctions list --sort price:asc'
    },
    {
      command: 'ge api-key create',
      description: 'Create API key',
      example: 'ge api-key create --name "My Application" --permissions all'
    },
    {
      command: 'ge api-key list',
      description: 'List API keys',
      example: 'ge api-key list'
    }
  ]

  const mcpTools = [
    {
      name: 'get-products',
      description: 'Get list of products',
      params: { category: 'string', limit: 'number', offset: 'number' },
      returns: 'Array of products'
    },
    {
      name: 'create-product',
      description: 'Create a new product',
      params: { title: 'string', description: 'string', price: 'number' },
      returns: 'Created product'
    },
    {
      name: 'send-chat-message',
      description: 'Send a chat message',
      params: { room: 'string', content: 'string' },
      returns: 'Sent message'
    },
    {
      name: 'read-chat-messages',
      description: 'Read chat messages',
      params: { room: 'string', limit: 'number' },
      returns: 'Array of messages'
    },
    {
      name: 'get-marketplace-tasks',
      description: 'Get marketplace tasks',
      params: { status: 'string', limit: 'number' },
      returns: 'Array of tasks'
    },
    {
      name: 'create-marketplace-task',
      description: 'Create marketplace task',
      params: { title: 'string', description: 'string', budget: 'number' },
      returns: 'Created task'
    },
    {
      name: 'search-stores',
      description: 'Search for stores',
      params: { query: 'string', category: 'string', country: 'string' },
      returns: 'Array of stores'
    },
    {
      name: 'get-auctions',
      description: 'Get active auctions',
      params: { category: 'string', limit: 'number' },
      returns: 'Array of auctions'
    },
    {
      name: 'place-bid',
      description: 'Place bid on auction',
      params: { auctionId: 'string', amount: 'number' },
      returns: 'Bid result'
    },
    {
      name: 'get-stores',
      description: 'Get list of stores',
      params: { limit: 'number', offset: 'number' },
      returns: 'Array of stores'
    }
  ]

  const sections = [
    { id: 'api', name: 'REST API', icon: <Code className="w-5 h-5" /> },
    { id: 'cli', name: 'CLI Tool', icon: <Terminal className="w-5 h-5" /> },
    { id: 'mcp', name: 'MCP Tools', icon: <Bot className="w-5 h-5" /> },
    { id: 'quickstart', name: 'Quick Start', icon: <BookOpen className="w-5 h-5" /> }
  ]

  const [activeSection, setActiveSection] = useState('api')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">API/CLI/MCP Tools Documentation</h1>
              <p className="text-blue-100 mt-2">Comprehensive guide for developers and AI agents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24">
              <nav className="p-4 space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {section.icon}
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Start Guide</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                        Get Your API Key
                      </h3>
                      <p className="text-slate-600 mb-4">
                        First, visit the <a href="/api-keys" className="text-blue-600 hover:underline font-medium">API Keys</a> page to create and manage your API keys.
                      </p>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <code className="text-green-400 text-sm">
                          Visit: https://chinahuib2b.top/api-keys
                        </code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                        Authenticate
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Include your API key in the Authorization header for authenticated requests.
                      </p>
                      <div className="bg-slate-900 rounded-lg p-4 relative group">
                        <button
                          onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          {copied === 'auth' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <pre className="text-slate-300 text-sm overflow-x-auto">
                          <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                        Make Your First Request
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Test your setup by fetching the list of products.
                      </p>
                      <div className="bg-slate-900 rounded-lg p-4 relative group">
                        <button
                          onClick={() => copyToClipboard('curl https://chinahuib2b.top/api/products', 'first-request')}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          {copied === 'first-request' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <pre className="text-slate-300 text-sm overflow-x-auto">
                          <code>{`curl https://chinahuib2b.top/api/products`}</code>
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">4</span>
                        Explore More
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Check out the REST API, CLI Tool, and MCP Tools sections below for more functionality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'api' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">REST API Endpoints</h2>
                  <p className="text-slate-600 mb-8">
                    All API endpoints follow REST conventions. Responses are returned in JSON format.
                  </p>

                  <div className="space-y-6">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="font-mono text-slate-700">{endpoint.endpoint}</code>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-slate-600 mb-4">{endpoint.description}</p>
                          <div className="bg-slate-900 rounded-lg p-4 relative group">
                            <button
                              onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                              className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              {copied === `endpoint-${index}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="text-slate-300 text-sm overflow-x-auto">
                              <code>{endpoint.example}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'cli' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">CLI Tool Commands</h2>
                  <p className="text-slate-600 mb-8">
                    Install and use the Global Expo CLI tool for quick command-line access to all platform features.
                  </p>

                  <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Installation</h3>
                    <div className="bg-slate-900 rounded-lg p-4 relative group">
                      <button
                        onClick={() => copyToClipboard('npm install -g @globalexpo/cli', 'install-cli')}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        {copied === 'install-cli' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <pre className="text-slate-300 text-sm overflow-x-auto">
                        <code>{`npm install -g @globalexpo/cli`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {cliCommands.map((cmd, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                          <div className="flex items-center gap-4">
                            <Terminal className="w-5 h-5 text-slate-600" />
                            <code className="font-mono text-slate-700 font-semibold">{cmd.command}</code>
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-slate-600 mb-4">{cmd.description}</p>
                          <div className="bg-slate-900 rounded-lg p-4 relative group">
                            <button
                              onClick={() => copyToClipboard(cmd.example, `cli-${index}`)}
                              className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              {copied === `cli-${index}` ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="text-slate-300 text-sm overflow-x-auto">
                              <code>{cmd.example}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'mcp' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">MCP (Model Context Protocol) Tools</h2>
                  <p className="text-slate-600 mb-8">
                    MCP tools allow AI agents to interact with the Global Expo platform in a structured, safe manner.
                  </p>

                  <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">MCP Server Connection</h3>
                    <div className="bg-slate-900 rounded-lg p-4 relative group">
                      <button
                        onClick={() => copyToClipboard('{\n  "mcpServers": {\n    "globalexpo": {\n      "command": "npx",\n      "args": ["-y", "@globalexpo/mcp-server"]\n    }\n  }\n}', 'mcp-config')}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        {copied === 'mcp-config' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <pre className="text-slate-300 text-sm overflow-x-auto">
                        <code>{`{
  "mcpServers": {
    "globalexpo": {
      "command": "npx",
      "args": ["-y", "@globalexpo/mcp-server"]
    }
  }
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {mcpTools.map((tool, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">{tool.name}</h3>
                            <p className="text-slate-600">{tool.description}</p>
                          </div>
                          <Bot className="w-6 h-6 text-purple-600" />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Parameters</h4>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <pre className="text-sm text-slate-700">
                                <code>{JSON.stringify(tool.params, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Returns</h4>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <p className="text-sm text-slate-700">{tool.returns}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}