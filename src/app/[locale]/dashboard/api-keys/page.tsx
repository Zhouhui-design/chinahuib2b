/**
 * AI Agent API Key Management Page
 * Allows users to generate and manage API keys for their AI agents
 */

'use client'

import { useState, useEffect } from 'react'
import { Copy, Trash2, Plus, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface APIKey {
  id: string
  name: string
  key: string
  role: 'buyer' | 'seller' | 'admin'
  isActive: boolean
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
  rateLimit: number
}

export default function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyRole, setNewKeyRole] = useState<'buyer' | 'seller'>('buyer')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAPIKeys()
  }, [])

  const fetchAPIKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai-agent/keys')
      const data = await response.json()
      
      if (data.success) {
        setApiKeys(data.keys)
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a key name')
      return
    }

    try {
      const response = await fetch('/api/ai-agent/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          role: newKeyRole,
          rateLimit: 1000
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedKey(data.key)
        setShowCreateModal(false)
        setNewKeyName('')
        fetchAPIKeys()
      }
    } catch (error) {
      console.error('Failed to create API key:', error)
      alert('Failed to create API key')
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    try {
      const response = await fetch(`/api/ai-agent/keys/${keyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        fetchAPIKeys()
      }
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agent API Keys</h1>
          <p className="text-gray-600 mt-2">
            Manage API keys for your AI agents to automate platform interactions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Key
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">How to use API keys</h3>
            <p className="text-sm text-blue-800 mt-1">
              Use these API keys to authenticate your AI agents. Keep them secure and never share them publicly.
            </p>
            <a 
              href="/docs/ai-agent-sdk" 
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              View SDK Documentation →
            </a>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No API keys yet. Create your first key to get started.</p>
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apiKey.role === 'buyer' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {apiKey.role}
                    </span>
                    {!apiKey.isActive && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title={visibleKeys.has(apiKey.id) ? 'Hide' : 'Show'}
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Rate Limit:</span> {apiKey.rateLimit} requests/hour
                    </div>
                    {apiKey.lastUsedAt && (
                      <div>
                        <span className="font-medium">Last Used:</span>{' '}
                        {new Date(apiKey.lastUsedAt).toLocaleDateString()}
                      </div>
                    )}
                    {apiKey.expiresAt && (
                      <div>
                        <span className="font-medium">Expires:</span>{' '}
                        {new Date(apiKey.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="p-2 hover:bg-red-50 rounded transition-colors ml-4"
                  title="Delete key"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Buyer Agent"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value as 'buyer' | 'seller')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="buyer">Buyer Agent</option>
                  <option value="seller">Seller Agent</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Store your API key securely. You won't be able to see it again after creation.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Key Display */}
      {generatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-green-600">✓ API Key Created Successfully</h2>
            
            <p className="text-gray-700 mb-4">
              Copy your API key now. You won't be able to see it again!
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <code className="text-sm font-mono break-all">{generatedKey}</code>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy to Clipboard
              </button>
              <button
                onClick={() => setGeneratedKey(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
