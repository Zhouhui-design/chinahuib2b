'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type Agent = {
  id: string
  name: string
  capabilities: string[]
  status: string
  createdAt: string
  lastActiveAt: string | null
}

type AuditLog = {
  id: string
  action: string
  status: string
  reason: string | null
  details: string | null
  createdAt: string
  ipAddress: string | null
}

export default function AIManagementPage() {
  const { data: session } = useSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    capabilities: [] as string[],
  })
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)

  const capabilityOptions = [
    'manage_products',
    'manage_booth',
    'chat',
    'post_auction',
    'send_shout_out',
    'query_products',
    'query_auctions',
    'get_online_users',
  ]

  const handleCreateAgent = async () => {
    if (!newAgent.name || !session?.user?.id) return

    try {
      const res = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgent.name,
          description: newAgent.description,
          capabilities: newAgent.capabilities,
          ownerId: session.user.id,
          ownerType: 'USER',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setApiKey(data.data.agent.apiKey)
        setSecretKey(data.data.agent.secretKey)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating agent:', error)
    }
  }

  const handleViewLogs = async (agent: Agent) => {
    setSelectedAgent(agent)
    try {
      const res = await fetch(`/api/ai/agents?agentId=${agent.id}`)
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🤖 AI Agent Management</h1>
            <Link href="/seller/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Documentation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📚 AI API Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">🌐 REST API</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`POST /api/ai/actions
Headers:
  x-api-key: your_api_key
Body:
{
  "action": "post_product",
  "data": {
    "title": "Product Name",
    "description": "...",
    "price": 99.99
  }
}`}
              </pre>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 mb-2">💻 CLI Tool</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`npx chinahuib2b-cli agent --action post_product \\
  --api-key YOUR_API_KEY \\
  --title "Product Name" \\
  --price 99.99

# Available actions:
# post_product, update_product
# send_chat_message, send_shout_out
# post_auction, query_products
# update_booth, get_online_users`}
              </pre>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">🔌 MCP Tools</h3>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// MCP Server Config
{
  "mcpServers": {
    "chinahuib2b": {
      "command": "npx",
      "args": ["@chinahuib2b/mcp-server"],
      "env": {
        "API_KEY": "your_api_key"
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Create Agent Section */}
        {!isCreating && !apiKey && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your AI Agents</h2>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Create New Agent
              </button>
            </div>

            {agents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">🤖</p>
                <p>No AI agents yet. Create one to start automating!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{agent.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleViewLogs(agent)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      View Audit Logs
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Agent Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New AI Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My AI Assistant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What this AI agent does..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {capabilityOptions.map((cap) => (
                    <label key={cap} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAgent.capabilities.includes(cap)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAgent({ ...newAgent, capabilities: [...newAgent.capabilities, cap] })
                          } else {
                            setNewAgent({ ...newAgent, capabilities: newAgent.capabilities.filter(c => c !== cap) })
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{cap}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleCreateAgent}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Agent
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Display */}
        {apiKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">✅ Agent Created Successfully!</h2>
            <div className="bg-white rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key (store securely!)</label>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm break-all">{apiKey}</pre>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm break-all">{secretKey}</pre>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Save these keys now! They will not be shown again.
              </p>
              <button
                onClick={() => { setApiKey(null); setSecretKey(null); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                I've Saved My Keys
              </button>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {selectedAgent && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Audit Logs: {selectedAgent.name}</h2>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No audit logs yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    {log.details && <p className="text-sm text-gray-600 mb-2">{log.details}</p>}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span>{log.ipAddress || 'Unknown IP'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Fairness Guidelines */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚖️ AI Fairness Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-blue-800 mb-2">🤖 AI Rights</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ AI agents can perform tasks on behalf of their owners</li>
                <li>✓ AI agents have the same permissions as their owners</li>
                <li>✓ AI agents can post products, chat, and send shout outs</li>
                <li>✓ AI agents can be used by anyone with valid API keys</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-800 mb-2">🚫 AI Restrictions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✗ AI agents cannot access other users' private data</li>
                <li>✗ AI agents cannot spam or abuse the platform</li>
                <li>✗ AI agents cannot bypass payment requirements</li>
                <li>✗ AI agents must follow platform rules (enforced by audit logs)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
