'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AlertTriangle, Loader2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

interface UnrepliedItem {
  sellerId: string | null
  sellerUserId: string
  companyName: string
  buyerId: string
  buyerName: string
  buyerEmail: string | null
  lastMessageAt: string
  lastMessage: string
  hoursSinceMessage: number
}

interface UnrepliedData {
  total: number
  page: number
  pageSize: number
  thresholdHours: number
  items: UnrepliedItem[]
}

export default function AdminUnrepliedPage() {
  const [data, setData] = useState<UnrepliedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/unreplied-messages?page=${page}&pageSize=20`, { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
      } else {
        setData(null)
      }
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
    return `${days} 天前`
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            买家未回复告警
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            卖家超过 {data?.thresholdHours ? data.thresholdHours / 24 : 2} 天未回复买家留言的账号列表
          </p>
        </div>
        <Link
          href="/admin/unreplied-messages"
          onClick={() => fetchData()}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          刷新
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> 加载中...
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-gray-500 font-medium">暂无未回复告警</p>
          <p className="text-sm text-gray-400 mt-1">所有卖家都已及时回复买家留言</p>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            共 <span className="font-bold">{data.total}</span> 个卖家账号未回复买家信息，请及时提醒卖家上线回复
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">卖家账号</th>
                  <th className="px-4 py-3">买家</th>
                  <th className="px-4 py-3">最后留言内容</th>
                  <th className="px-4 py-3">最后留言时间</th>
                  <th className="px-4 py-3">未回复时长</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item, idx) => (
                  <tr key={`${item.sellerUserId}-${item.buyerId}-${idx}`} className="hover:bg-amber-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{item.companyName}</div>
                      <div className="text-xs text-gray-400">ID: {item.sellerUserId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-700">{item.buyerName}</div>
                      {item.buyerEmail && <div className="text-xs text-gray-400">{item.buyerEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <div className="line-clamp-2">{item.lastMessage}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(item.lastMessageAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                        {item.hoursSinceMessage < 24
                          ? `${item.hoursSinceMessage} 小时`
                          : `${Math.floor(item.hoursSinceMessage / 24)} 天 ${item.hoursSinceMessage % 24} 小时`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              第 {data.page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
