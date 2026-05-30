'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, CheckCircle, Eye, EyeOff, Calendar, Shield, Activity } from 'lucide-react'

type ApiKey = {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: string
  expiresAt: string
  lastUsed: string | null
  isActive: boolean
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read'])

  const availablePermissions = [
    { value: 'read', label: 'Read', description: 'Read data from API' },
    { value: 'write', label: 'Write', description: 'Create and update data' },
    { value: 'delete', label: 'Delete', description: 'Delete data' },
    { value: 'chat', label: 'Chat', description: 'Send and receive chat messages' },
    { value: 'marketplace', label: 'Marketplace', description: 'Access marketplace features' },
    { value: 'auction', label: 'Auctions', description: 'Access auction features' },
    { value: 'admin', label: 'Admin', description: 'Full admin access' }
  ]

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = () => {
    setLoading(true)
    setTimeout(() => {
      const mockKeys: ApiKey[] = [
        {
          id: '1',
          name: 'My Application',
          key: 'ge_sk_abc123def456ghi789jkl012mno345',
          permissions: ['read', 'write'],
          createdAt: '2026-05-01T00:00:00Z',
          expiresAt: '2027-05-01T00:00:00Z',
          lastUsed: '2026-05-30T10:30:00Z',
          isActive: true
        },
        {
          id: '2',
          name: 'AI Agent Integration',
          key: 'ge_sk_pqr678stu901vwx234yz567abc890',
          permissions: ['read', 'chat', 'marketplace'],
          createdAt: '2026-05-15T00:00:00Z',
          expiresAt: '2026-11-15T00:00:00Z',
          lastUsed: '2026-05-29T15:45:00Z',
          isActive: true
        },
        {
          id: '3',
          name: 'Legacy Integration',
          key: 'ge_sk_def123ghi456jkl789mno012pqr345',
          permissions: ['read'],
          createdAt: '2026-04-01T00:00:00Z',
          expiresAt: '2026-06-01T00:00:00Z',
          lastUsed: '2026-05-20T08:15:00Z',
          isActive: true
        }
      ]
      setApiKeys(mockKeys)
      setLoading(false)
    }, 500)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission))
    } else {
      setSelectedPermissions([...selectedPermissions, permission])
    }
  }

  const createApiKey = () => {
    if (!newKeyName.trim()) return
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ge_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: [...selectedPermissions],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: null,
      isActive: true
    }
    
    setApiKeys([newKey, ...apiKeys])
    setShowCreateModal(false)
    setNewKeyName('')
    setSelectedPermissions(['read'])
  }

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id))
  }

  const toggleKeyVisibility = (id: string) => {
    setShowKey(showKey === id ? null : id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  const getDaysUntilExpiry = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Key className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">API Keys Management</h1>
              <p className="text-blue-100 mt-2">Manage your API keys for integration with Global Expo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Active Keys</p>
                <p className="text-2xl font-bold text-slate-900">{apiKeys.filter(k => k.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Recently Used</p>
                <p className="text-2xl font-bold text-slate-900">{apiKeys.filter(k => k.lastUsed).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Expiring Soon</p>
                <p className="text-2xl font-bold text-slate-900">{apiKeys.filter(k => getDaysUntilExpiry(k.expiresAt) < 30).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create New API Key
          </button>
        </div>

        {/* API Keys List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading API keys...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map(apiKey => (
              <div key={apiKey.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{apiKey.name}</h3>
                      {isExpired(apiKey.expiresAt) ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Expired</span>
                      ) : getDaysUntilExpiry(apiKey.expiresAt) < 30 ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Expires Soon</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <code className="font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                        {showKey === apiKey.id ? apiKey.key : apiKey.key.substring(0, 10) + '...' + apiKey.key.substring(apiKey.key.length - 6)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title={showKey === apiKey.id ? 'Hide key' : 'Show key'}
                      >
                        {showKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy key"
                      >
                        {copied === apiKey.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {apiKey.permissions.map(permission => (
                        <span key={permission} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {permission}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created: {formatDate(apiKey.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires: {formatDate(apiKey.expiresAt)}
                      </div>
                      {apiKey.lastUsed && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          Last used: {formatDate(apiKey.lastUsed)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {apiKeys.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Key className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No API Keys</h3>
                <p className="text-slate-600 mb-6">Create your first API key to start integrating with Global Expo</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  Create API Key
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Create New API Key</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My Application"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Permissions
                </label>
                <div className="space-y-3">
                  {availablePermissions.map(permission => (
                    <label key={permission.value} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{permission.label}</p>
                        <p className="text-sm text-slate-600">{permission.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Security Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Treat your API keys like passwords. Never expose them in client-side code or public repositories.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                disabled={!newKeyName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}