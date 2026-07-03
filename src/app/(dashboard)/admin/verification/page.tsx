'use client'

import { useState, useEffect } from 'react'
import { Check, X, Eye, Globe, Plus, Search, RefreshCw } from 'lucide-react'
import prisma from '@/lib/prisma'

export default function VerificationPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'requests' | 'countries'>('requests')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab, searchTerm])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'requests') {
        const data = await prisma.verificationRequest.findMany({
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
        setRequests(data)
      } else {
        const data = await prisma.verificationCountry.findMany({
          orderBy: {
            name: 'asc',
          },
        })
        setCountries(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await prisma.verificationRequest.update({
        where: { id },
        data: {
          status,
          reviewedAt: new Date(),
        },
      })
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleToggleCountry = async (id: string, isEnabled: boolean) => {
    try {
      await prisma.verificationCountry.update({
        where: { id },
        data: { isEnabled: !isEnabled },
      })
      fetchData()
    } catch (error) {
      console.error('Error updating country:', error)
    }
  }

  const handleAddCountry = async () => {
    const name = prompt('请输入国家名称（英文）：')
    const nameZh = prompt('请输入国家名称（中文）：')
    if (name) {
      try {
        await prisma.verificationCountry.create({
          data: {
            name: name.trim(),
            nameZh: nameZh?.trim(),
            isEnabled: true,
          },
        })
        fetchData()
      } catch (error) {
        console.error('Error adding country:', error)
        alert('添加失败，可能已存在')
      }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: '审核中', color: 'bg-yellow-100 text-yellow-800' }
      case 'VERIFIED':
        return { text: '是', color: 'bg-green-100 text-green-800' }
      case 'REJECTED':
        return { text: '真实性继续核实中', color: 'bg-red-100 text-red-800' }
      default:
        return { text: '否', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const filteredRequests = requests.filter(
    (r) =>
      r.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.shippingCountry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">平台审核管理</h1>
        <button
          onClick={() => fetchData()}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </button>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          审核申请 ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'countries'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          开通国家/地区 ({countries.filter((c) => c.isEnabled).length})
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索用户名、邮箱或国家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">发货国家</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">详细地址</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">申请时间</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const statusInfo = getStatusText(request.status)
                    return (
                      <tr key={request.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.user?.username}</p>
                            <p className="text-sm text-gray-500">{request.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{request.shippingCountry}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{request.detailedAddress}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(request.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(request.id, 'VERIFIED')}
                                  className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  通过
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                                  className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  拒绝
                                </button>
                              </>
                            )}
                            <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">暂无审核申请</div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'countries' && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">开通国家/地区管理</h2>
            <button
              onClick={handleAddCountry}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加国家/地区
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    country.isEnabled
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Globe className={`w-5 h-5 mr-3 ${country.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">{country.name}</p>
                      {country.nameZh && <p className="text-sm text-gray-500">{country.nameZh}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleCountry(country.id, country.isEnabled)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      country.isEnabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {country.isEnabled ? '已开通' : '未开通'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {countries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无国家/地区配置</p>
              <p className="text-sm">点击上方按钮添加开通的国家/地区</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}