'use client'

import { useState, useEffect } from 'react'
import { Bot, Plus, Trash2, Edit, Eye, CheckCircle, AlertCircle, Shield, Settings, Database, MessageSquare, Zap } from 'lucide-react'

type AiAgent = {
  id: string
  name: string
  description: string
  type: 'buyer' | 'seller' | 'assistant' | 'scraper' | 'analyzer' | 'negotiator'
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  apiKey: string
  createdAt: string
  lastActive: string | null
  avatar?: string
  website?: string
  version: string
  rateLimit: { requests: number, period: string }
  usage: { requests: number, period: string }
}

export default function AiRegisterPage() {
  const [agents, setAgents] = useState<AiAgent[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingAgent, setEditingAgent] = useState<AiAgent | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'assistant' as AiAgent['type'],
    permissions: ['read'] as string[],
    website: '',
    version: '1.0',
    rateLimitRequests: 1000,
    rateLimitPeriod: 'hour'
  })

  const agentTypes = [
    { value: 'buyer', label: 'Buyer Agent', description: 'AI that finds and negotiates purchases', icon: <Zap className="w-4 h-4" /> },
    { value: 'seller', label: 'Seller Agent', description: 'AI that manages listings and sales', icon: <Database className="w-4 h-4" /> },
    { value: 'assistant', label: 'Assistant', description: 'General purpose AI assistant', icon: <Bot className="w-4 h-4" /> },
    { value: 'scraper', label: 'Scraper', description: 'AI that collects market data', icon: <Settings className="w-4 h-4" /> },
    { value: 'analyzer', label: 'Analyzer', description: 'AI that analyzes trends and data', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'negotiator', label: 'Negotiator', description: 'AI that handles negotiations', icon: <Shield className="w-4 h-4" /> }
  ]

  const availablePermissions = [
    { value: 'read', label: 'Read', description: 'Read data from the platform' },
    { value: 'write', label: 'Write', description: 'Create and update data' },
    { value: 'delete', label: 'Delete', description: 'Delete data' },
    { value: 'chat', label: 'Chat', description: 'Send and receive chat messages' },
    { value: 'marketplace', label: 'Marketplace', description: 'Create and manage marketplace tasks' },
    { value: 'auction', label: 'Auctions', description: 'Participate in auctions' },
    { value: 'analyze', label: 'Analytics', description: 'Access analytics and reports' }
  ]

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = () => {
    setLoading(true)
    setTimeout(() => {
      const mockAgents: AiAgent[] = [
        {
          id: '1',
          name: 'ProductBot',
          description: 'An AI agent that helps create and manage product listings automatically.',
          type: 'seller',
          status: 'active',
          permissions: ['read', 'write', 'chat'],
          apiKey: 'ai_sk_abc123def456ghi789',
          createdAt: '2026-05-01T00:00:00Z',
          lastActive: '2026-05-30T10:30:00Z',
          version: '2.1.0',
          rateLimit: { requests: 1000, period: 'hour' },
          usage: { requests: 456, period: 'hour' }
        },
        {
          id: '2',
          name: 'NegotiationAI',
          description: 'AI that handles price negotiations with suppliers and buyers.',
          type: 'negotiator',
          status: 'active',
          permissions: ['read', 'chat', 'marketplace'],
          apiKey: 'ai_sk_jkl012mno345pqr678',
          createdAt: '2026-05-10T00:00:00Z',
          lastActive: '2026-05-29T15:45:00Z',
          version: '1.5.0',
          rateLimit: { requests: 500, period: 'hour' },
          usage: { requests: 123, period: 'hour' }
        },
        {
          id: '3',
          name: 'MarketAnalyzer',
          description: 'Analyzes market trends and provides insights on pricing and demand.',
          type: 'analyzer',
          status: 'active',
          permissions: ['read', 'analyze'],
          apiKey: 'ai_sk_stu901vwx234yz567',
          createdAt: '2026-04-15T00:00:00Z',
          lastActive: '2026-05-28T08:15:00Z',
          version: '3.0.0',
          rateLimit: { requests: 2000, period: 'hour' },
          usage: { requests: 789, period: 'hour' }
        },
        {
          id: '4',
          name: 'ScraperBot',
          description: 'Collects public market data for analysis (currently suspended).',
          type: 'scraper',
          status: 'suspended',
          permissions: ['read'],
          apiKey: 'ai_sk_bcd234efg456hij789',
          createdAt: '2026-03-01T00:00:00Z',
          lastActive: '2026-05-01T00:00:00Z',
          version: '1.0.0',
          rateLimit: { requests: 100, period: 'hour' },
          usage: { requests: 0, period: 'hour' }
        }
      ]
      setAgents(mockAgents)
      setLoading(false)
    }, 500)
  }

  const togglePermission = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) })
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, permission] })
    }
  }

  const createAgent = () => {
    if (!formData.name.trim()) return

    const newAgent: AiAgent = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: 'active',
      permissions: [...formData.permissions],
      apiKey: `ai_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      lastActive: null,
      website: formData.website,
      version: formData.version,
      rateLimit: { requests: formData.rateLimitRequests, period: formData.rateLimitPeriod },
      usage: { requests: 0, period: formData.rateLimitPeriod }
    }

    setAgents([newAgent, ...agents])
    setShowCreateModal(false)
    resetForm()
  }

  const updateAgent = () => {
    if (!editingAgent || !formData.name.trim()) return

    setAgents(agents.map(agent => 
      agent.id === editingAgent.id 
        ? { ...agent, ...formData }
        : agent
    ))
    setShowCreateModal(false)
    setEditingAgent(null)
    resetForm()
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id))
  }

  const editAgent = (agent: AiAgent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      description: agent.description,
      type: agent.type,
      permissions: [...agent.permissions],
      website: agent.website || '',
      version: agent.version,
      rateLimitRequests: agent.rateLimit.requests,
      rateLimitPeriod: agent.rateLimit.period
    })
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'assistant',
      permissions: ['read'],
      website: '',
      version: '1.0',
      rateLimitRequests: 1000,
      rateLimitPeriod: 'hour'
    })
  }

  const toggleStatus = (id: string) => {
    setAgents(agents.map(agent => 
      agent.id === id 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
      case 'inactive':
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">Inactive</span>
      case 'suspended':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Suspended</span>
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buyer': return <Zap className="w-4 h-4" />
      case 'seller': return <Database className="w-4 h-4" />
      case 'assistant': return <Bot className="w-4 h-4" />
      case 'scraper': return <Settings className="w-4 h-4" />
      case 'analyzer': return <MessageSquare className="w-4 h-4" />
      case 'negotiator': return <Shield className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'text-blue-600 bg-blue-50'
      case 'seller': return 'text-green-600 bg-green-50'
      case 'assistant': return 'text-purple-600 bg-purple-50'
      case 'scraper': return 'text-orange-600 bg-orange-50'
      case 'analyzer': return 'text-indigo-600 bg-indigo-50'
      case 'negotiator': return 'text-pink-600 bg-pink-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const usagePercentage = (agent: AiAgent) => {
    return Math.round((agent.usage.requests / agent.rateLimit.requests) * 100)
  }

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    suspended: agents.filter(a => a.status === 'suspended').length,
    totalRequests: agents.reduce((sum, a) => sum + a.usage.requests, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Bot className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">AI Identity Registration</h1>
              <p className="text-emerald-100 mt-2">Register and manage your AI agents on the Global Expo platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Agents</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Suspended</p>
                <p className="text-2xl font-bold text-slate-900">{stats.suspended}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingAgent(null)
              resetForm()
              setShowCreateModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Register New AI Agent
          </button>
        </div>

        {/* AI Agents List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading AI agents...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {agents.map(agent => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl ${getTypeColor(agent.type)}`}>
                      {getTypeIcon(agent.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                        {getStatusBadge(agent.status)}
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                          v{agent.version}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{agent.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {agent.permissions.map(permission => (
                          <span key={permission} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                            {permission}
                          </span>
                        ))}
                      </div>

                      {/* Usage Meter */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>API Usage</span>
                          <span>{agent.usage.requests} / {agent.rateLimit.requests} requests</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              usagePercentage(agent) > 80 ? 'bg-red-500' : 
                              usagePercentage(agent) > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(usagePercentage(agent), 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div>Created: {formatDate(agent.createdAt)}</div>
                        {agent.lastActive && <div>Last Active: {formatDate(agent.lastActive)}</div>}
                        {agent.website && <div>Website: {agent.website}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(agent.id)}
                      disabled={agent.status === 'suspended'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        agent.status === 'active' 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-emerald-600 hover:bg-emerald-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => editAgent(agent)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {agents.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No AI Agents Registered</h3>
                <p className="text-slate-600 mb-6">Register your first AI agent to start automating your workflows</p>
                <button
                  onClick={() => {
                    setEditingAgent(null)
                    resetForm()
                    setShowCreateModal(true)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all"
                >
                  Register AI Agent
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingAgent ? 'Edit AI Agent' : 'Register New AI Agent'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAgent(null)
                    resetForm()
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., ProductBot"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this AI agent does..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Agent Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {agentTypes.map(type => (
                    <label key={type.value} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getTypeColor(type.value)}`}>{type.icon}</div>
                          <p className="font-medium text-slate-900">{type.label}</p>
                        </div>
                        <p className="text-sm text-slate-600">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availablePermissions.map(permission => (
                    <label key={permission.value} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{permission.label}</p>
                        <p className="text-sm text-slate-600">{permission.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Rate Limiting
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Requests</label>
                    <input
                      type="number"
                      value={formData.rateLimitRequests}
                      onChange={(e) => setFormData({ ...formData, rateLimitRequests: parseInt(e.target.value) || 1000 })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Period</label>
                    <select
                      value={formData.rateLimitPeriod}
                      onChange={(e) => setFormData({ ...formData, rateLimitPeriod: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    >
                      <option value="minute">Per Minute</option>
                      <option value="hour">Per Hour</option>
                      <option value="day">Per Day</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingAgent(null)
                  resetForm()
                }}
                className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingAgent ? updateAgent : createAgent}
                disabled={!formData.name.trim()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingAgent ? 'Update Agent' : 'Register Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}