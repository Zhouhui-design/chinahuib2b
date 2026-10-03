'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, Building2, Package, Store, User, Download, Loader2, Globe } from 'lucide-react'

interface VisitorDetail {
  id: string
  country: string
  countryCode: string
  city: string
  isSelfView: boolean
  createdAt: string
  viewType: 'PRODUCT' | 'BOOTH' | 'STORE'
  productTitle: string | null
  productId: string | null
  viewer: { id: string; name: string; email: string | null; avatarUrl: string | null } | null
  hasDownloaded: boolean
  downloadCount: number
}

interface ViewsData {
  stats: {
    totalViews: number
    loggedInViews: number
    storeViews: number
    boothViews: number
    productViews: number
  }
  recentVisitors: VisitorDetail[]
}

const viewTypeLabel: Record<string, string> = {
  PRODUCT: '产品',
  BOOTH: '展会',
  STORE: '公司信息',
}

const viewTypeColor: Record<string, string> = {
  PRODUCT: 'bg-blue-100 text-blue-700',
  BOOTH: 'bg-purple-100 text-purple-700',
  STORE: 'bg-green-100 text-green-700',
}

export default function SellerVisitorsPage() {
  const [data, setData] = useState<ViewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/seller/views?period=${period}`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setData(null)
      }
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const s = data?.stats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">访客统计</h1>
          <p className="text-sm text-gray-500 mt-1">查看访问您展会、产品、公司信息的游客明细</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="7">近 7 天</option>
          <option value="30">近 30 天</option>
          <option value="90">近 90 天</option>
        </select>
      </div>

      {/* 分维度统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Eye className="w-4 h-4" /> 总访问量
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{s?.totalViews ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Store className="w-4 h-4" /> 公司信息访问
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{s?.storeViews ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-4">
          <div className="flex items-center gap-2 text-purple-600 text-sm">
            <Building2 className="w-4 h-4" /> 展会访问
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-1">{s?.boothViews ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Package className="w-4 h-4" /> 产品访问
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{s?.productViews ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-3">
        <User className="w-4 h-4 text-gray-400" />
        登录访客：<span className="font-semibold text-gray-900">{s?.loggedInViews ?? 0}</span> 次
        （登录访客会显示账号与下载记录）
      </div>

      {/* 访客明细表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> 加载中...
          </div>
        ) : !data || data.recentVisitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Eye className="w-10 h-10 mb-3 opacity-50" />
            <p>暂无访客记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">访问时间</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">访客（账号）</th>
                  <th className="px-4 py-3">位置</th>
                  <th className="px-4 py-3">下载文件</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${viewTypeColor[v.viewType] || 'bg-gray-100 text-gray-600'}`}>
                        {viewTypeLabel[v.viewType] || v.viewType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.viewer ? (
                        <div>
                          <div className="font-medium text-gray-900">{v.viewer.name}</div>
                          {v.viewer.email && <div className="text-xs text-gray-400">{v.viewer.email}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400">游客{!v.isSelfView ? '' : '（自己）'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        {v.city && v.city !== 'Unknown' ? `${v.city}, ` : ''}{v.country}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {v.hasDownloaded ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <Download className="w-3.5 h-3.5" /> 已下载 ({v.downloadCount})
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
