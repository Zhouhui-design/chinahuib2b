'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Search, FileText, Building2, User, Loader2 } from 'lucide-react'

interface DownloadRecord {
  id: string
  downloadedAt: string
  brochureType: 'PRODUCT' | 'STORE'
  ipAddress: string | null
  fileName: string | null
  productTitle: string | null
  user: { id: string; name: string; email: string | null } | null
  seller: { id: string; companyName: string; slug: string } | null
}

export default function AdminDownloadRecordsPage() {
  const [records, setRecords] = useState<DownloadRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [loading, setLoading] = useState(true)
  const [sellerFilter, setSellerFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (sellerFilter) params.set('sellerId', sellerFilter)
      if (userFilter) params.set('userId', userFilter)
      const res = await fetch(`/api/admin/download-records?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRecords(data.data.records || [])
        setTotal(data.data.total || 0)
      }
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sellerFilter, userFilter])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">下载记录</h1>
          <p className="text-sm text-gray-500 mt-1">
            查看哪个用户下载了哪个公司的哪个文件（共 {total} 条）
          </p>
        </div>
        <Download className="w-8 h-8 text-blue-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={sellerFilter}
            onChange={(e) => { setSellerFilter(e.target.value); setPage(1) }}
            placeholder="按卖家 ID 过滤"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setPage(1) }}
            placeholder="按用户 ID 过滤"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            加载中...
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Download className="w-10 h-10 mb-3 opacity-50" />
            <p>暂无下载记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">下载时间</th>
                  <th className="px-4 py-3">用户（账号）</th>
                  <th className="px-4 py-3">公司（卖家）</th>
                  <th className="px-4 py-3">文件</th>
                  <th className="px-4 py-3">类型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(r.downloadedAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      {r.user ? (
                        <div>
                          <div className="font-medium text-gray-900">{r.user.name}</div>
                          {r.user.email && <div className="text-xs text-gray-400">{r.user.email}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400">游客</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.seller ? (
                        <div>
                          <div className="font-medium text-gray-900">{r.seller.companyName}</div>
                          <div className="text-xs text-gray-400">{r.seller.slug}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[300px]">
                          {r.fileName || r.productTitle || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                        r.brochureType === 'PRODUCT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {r.brochureType === 'PRODUCT' ? '产品画册' : '公司画册'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            第 {page} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
