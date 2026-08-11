'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Globe, RefreshCw, Play, Search, AlertTriangle, CheckCircle2,
  Clock, XCircle, Loader2, ChevronDown, ChevronUp, Zap, Ban, Info,
} from 'lucide-react'

type Status = 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED'
type Category = 'PRODUCT' | 'MARKETPLACE' | 'STATIC' | 'AUTH' | 'FILTER'

interface Summary {
  success: boolean
  byCategory: Record<Category, Partial<Record<Status, number>>>
  perCategoryTotals: Record<Category, number>
  totalRecords: number
  lastCheckedAt: string | null
}

interface FailureRecord {
  id: string
  url: string
  category: Category
  status: Status
  statusCode: number | null
  errorMessage: string | null
  responseTime: number | null
  redirectCount: number | null
  finalUrl: string | null
  lastCheckedAt: string | null
  retryCount: number
}

interface FailuresResponse {
  success: boolean
  records: FailureRecord[]
  topErrors: { message: string; count: number }[]
}

interface TriggerResponse {
  success: boolean
  jobId: string
  message: string
}

const CATEGORY_LABELS: Record<Category, string> = {
  PRODUCT: '产品详情',
  MARKETPLACE: '市场/店铺',
  STATIC: '静态页',
  AUTH: '认证页',
  FILTER: '筛选页',
}

const STATUS_LABELS: Record<Status, string> = {
  PENDING: '待检',
  SUCCESS: '成功',
  FAILED: '失败',
  SKIPPED: '跳过',
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  SKIPPED: 'bg-gray-100 text-gray-700',
}

const STATUS_ICONS: Record<Status, React.ReactNode> = {
  PENDING: <Clock className="w-3 h-3" />,
  SUCCESS: <CheckCircle2 className="w-3 h-3" />,
  FAILED: <XCircle className="w-3 h-3" />,
  SKIPPED: <Ban className="w-3 h-3" />,
}

export default function UrlCrawlCard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [failures, setFailures] = useState<FailureRecord[]>([])
  const [topErrors, setTopErrors] = useState<{ message: string; count: number }[]>([])
  const [failuresError, setFailuresError] = useState<string | null>(null)
  const [failuresLoading, setFailuresLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFailures, setShowFailures] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/url-crawl?action=summary', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Summary = await res.json()
      if (data.success) {
        setSummary(data)
        setError(null)
      } else {
        setError('数据加载失败（服务端返回 success=false），请稍后重试或检查后端日志')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFailures = useCallback(async () => {
    setFailuresLoading(true)
    setFailuresError(null)
    try {
      const res = await fetch('/api/admin/url-crawl?action=list-failures&limit=50', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: FailuresResponse = await res.json()
      if (data.success) {
        setFailures(data.records)
        setTopErrors(data.topErrors)
      } else {
        throw new Error('服务端返回 success=false')
      }
    } catch (e) {
      setFailuresError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setFailuresLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSummary()
  }, [fetchSummary])

  // Auto-poll while a job is running: refresh every 5s, up to 24 times (2 min)
  useEffect(() => {
    if (!polling) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }
    pollCountRef.current = 0
    pollingRef.current = setInterval(() => {
      pollCountRef.current++
      void fetchSummary()
      if (pollCountRef.current >= 24) {
        setPolling(false)
        setTriggerMsg(prev => prev ? `${prev} (自动刷新已停止，请手动刷新查看最新状态)` : prev)
      }
    }, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [polling, fetchSummary])

  const triggerAction = async (action: 'discover' | 'crawl' | 'both' | 'force-all') => {
    setActionLoading(action)
    setTriggerMsg(null)
    try {
      const res = await fetch('/api/admin/url-crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, limit: 500 }),
      })
      const data: TriggerResponse = await res.json()
      if (data.success) {
        setTriggerMsg(`✓ ${action} 已触发 (Job: ${data.jobId})。每 5 秒自动刷新状态…`)
        setPolling(true)
        // immediately refresh
        setTimeout(() => void fetchSummary(), 1500)
      } else {
        setTriggerMsg(`✗ 触发失败: ${res.status}`)
      }
    } catch (e) {
      setTriggerMsg(`✗ 网络错误: ${e instanceof Error ? e.message : 'Unknown'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleFailures = async () => {
    if (!showFailures && failures.length === 0) {
      await fetchFailures()
    }
    setShowFailures(!showFailures)
  }

  // Totals across categories
  const totals = { PENDING: 0, SUCCESS: 0, FAILED: 0, SKIPPED: 0 } as Record<Status, number>
  if (summary) {
    for (const cat of Object.keys(summary.byCategory) as Category[]) {
      const m = summary.byCategory[cat] || {}
      for (const s of Object.keys(m) as Status[]) {
        totals[s] += m[s] || 0
      }
    }
  }

  const lastCheckedText = summary?.lastCheckedAt
    ? new Date(summary.lastCheckedAt).toLocaleString('zh-CN')
    : '—'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">URL 巡检</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">
              监控 sitemap 中所有 URL 的健康状况，自动发现 + 定期健康检查
            </p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 sm:hidden">
              URL 健康巡检
            </p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); void fetchSummary(); if (showFailures) void fetchFailures() }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm transition-colors flex-shrink-0"
          title="刷新统计"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">刷新</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Status Pills */}
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            加载失败: {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">加载中...</span>
          </div>
        ) : (
          <>
            {/* Empty state - no data yet */}
            {summary && summary.totalRecords === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-blue-700 text-xs sm:text-sm">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">暂无 URL 巡检数据</p>
                  <p className="text-blue-600 mt-0.5 text-[11px] sm:text-xs">
                    系统尚未抓取任何 URL。请点击下方"发现新 URL"按钮从 sitemap 拉取 URL 列表，然后再点击"抓取待检"执行健康检查。
                  </p>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard label="总 URL 数" smLabel="总URL" value={summary?.totalRecords ?? 0} icon={<Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} color="indigo" />
              <StatCard label="待检 PENDING" smLabel="待检" value={totals.PENDING} icon={<Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} color="amber" />
              <StatCard label="成功 SUCCESS" smLabel="成功" value={totals.SUCCESS} icon={<CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} color="green" />
              <StatCard label="失败 FAILED" smLabel="失败" value={totals.FAILED} icon={<XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} color="red" />
              <StatCard label="跳过 SKIPPED" smLabel="跳过" value={totals.SKIPPED} icon={<Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} color="gray" />
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-500">
              <span className="min-w-0 flex-1 truncate">
                最后检查: <span className="font-medium text-gray-700">{lastCheckedText}</span>
              </span>
              {polling && (
                <span className="flex items-center gap-1 text-indigo-600 font-medium flex-shrink-0 whitespace-nowrap">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">任务运行中，自动刷新中…</span>
                  <span className="sm:hidden">自动刷新…</span>
                </span>
              )}
            </div>

            {/* Trigger Message */}
            {triggerMsg && (
              <div className={`p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm border ${
                triggerMsg.startsWith('✓')
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {triggerMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
                <span>手动触发抓取任务</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  label="发现新 URL"
                  shortLabel="发现URL"
                  desc="从 sitemap 拉取"
                  icon={<Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  loading={actionLoading === 'discover'}
                  disabled={!!actionLoading}
                  onClick={() => triggerAction('discover')}
                  color="blue"
                />
                <ActionButton
                  label="抓取待检"
                  shortLabel="抓取待检"
                  desc="处理 PENDING/过期 FAILED"
                  icon={<Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  loading={actionLoading === 'crawl'}
                  disabled={!!actionLoading}
                  onClick={() => triggerAction('crawl')}
                  color="green"
                />
                <ActionButton
                  label="完整任务"
                  shortLabel="完整任务"
                  desc="发现 + 抓取"
                  icon={<RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  loading={actionLoading === 'both'}
                  disabled={!!actionLoading}
                  onClick={() => triggerAction('both')}
                  color="indigo"
                />
                <ActionButton
                  label="强制全量重跑"
                  shortLabel="全量重跑"
                  desc="忽略时间窗，重抓所有"
                  icon={<AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  loading={actionLoading === 'force-all'}
                  disabled={!!actionLoading}
                  onClick={() => {
                    if (confirm('确定要强制重跑所有 PENDING + FAILED 的 URL 吗？这可能产生大量请求。')) {
                      void triggerAction('force-all')
                    }
                  }}
                  color="red"
                />
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-2 hidden sm:block">
                提示：所有任务在后台异步执行，不阻塞响应。任务触发后会自动每 5 秒刷新统计（最长 2 分钟）。
              </p>
            </div>

            {/* Category Breakdown Table */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">分类明细</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">分类</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">待检</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">成功</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">失败</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">跳过</th>
                      <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">合计</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => {
                      const m = summary?.byCategory[cat] || {}
                      const total = summary?.perCategoryTotals[cat] || 0
                      return (
                        <tr key={cat} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-medium text-gray-900 whitespace-nowrap">{CATEGORY_LABELS[cat]}</td>
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-amber-700">{m.PENDING || 0}</td>
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-green-700">{m.SUCCESS || 0}</td>
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-red-700">{m.FAILED || 0}</td>
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-gray-700">{m.SKIPPED || 0}</td>
                          <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-900">{total}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failed URLs List */}
            <div>
              <button
                onClick={toggleFailures}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs sm:text-sm font-medium text-red-700 transition-colors"
              >
                <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">失败 URL ({totals.FAILED})</span>
                </span>
                {showFailures ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />}
              </button>

              {showFailures && (
                <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                  {/* Loading state */}
                  {failuresLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                      <span className="ml-2 text-xs sm:text-sm text-gray-500">加载失败记录中...</span>
                    </div>
                  )}

                  {/* Error state */}
                  {!failuresLoading && failuresError && (
                    <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">失败记录加载失败: {failuresError}</span>
                      <button
                        onClick={() => void fetchFailures()}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs whitespace-nowrap flex-shrink-0"
                      >
                        重试
                      </button>
                    </div>
                  )}

                  {/* Top error messages */}
                  {!failuresLoading && !failuresError && topErrors.length > 0 && (
                    <div className="p-2.5 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-[11px] sm:text-xs font-medium text-gray-600 mb-1.5 sm:mb-2">错误聚合 Top 5</p>
                      <div className="space-y-1">
                        {topErrors.slice(0, 5).map((e, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
                            <span className="text-gray-700 truncate font-mono flex-1">{e.message}</span>
                            <span className="ml-1 flex-shrink-0 px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium whitespace-nowrap">
                              ×{e.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failure records table */}
                  {!failuresLoading && !failuresError && failures.length === 0 ? (
                    <div className="p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>暂无失败记录，所有 URL 健康状态良好 ✓</span>
                    </div>
                  ) : (!failuresLoading && !failuresError && failures.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 text-[11px] sm:text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1.5 sm:py-2 text-left font-medium text-gray-500 whitespace-nowrap">URL</th>
                            <th className="px-2 py-1.5 sm:py-2 text-center font-medium text-gray-500 whitespace-nowrap">状态码</th>
                            <th className="hidden sm:table-cell px-2 py-1.5 sm:py-2 text-left font-medium text-gray-500 whitespace-nowrap">错误信息</th>
                            <th className="px-2 py-1.5 sm:py-2 text-center font-medium text-gray-500 whitespace-nowrap">重试</th>
                            <th className="hidden sm:table-cell px-2 py-1.5 sm:py-2 text-left font-medium text-gray-500 whitespace-nowrap">检查时间</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {failures.slice(0, 30).map(f => (
                            <tr key={f.id} className="hover:bg-gray-50">
                              <td className="px-2 py-1.5 sm:py-2">
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate block max-w-[160px] sm:max-w-xs"
                                  title={f.url}
                                >
                                  {f.url}
                                </a>
                              </td>
                              <td className="px-2 py-1.5 sm:py-2 text-center">
                                {f.statusCode ? (
                                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-mono whitespace-nowrap">
                                    {f.statusCode}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="hidden sm:table-cell px-2 py-1.5 sm:py-2 text-gray-600 max-w-xs truncate" title={f.errorMessage || ''}>
                                {f.errorMessage || '—'}
                              </td>
                              <td className="px-2 py-1.5 sm:py-2 text-center text-gray-700">{f.retryCount}</td>
                              <td className="hidden sm:table-cell px-2 py-1.5 sm:py-2 text-gray-500 whitespace-nowrap">
                                {f.lastCheckedAt ? new Date(f.lastCheckedAt).toLocaleString('zh-CN') : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {failures.length > 30 && (
                        <p className="text-[11px] sm:text-xs text-gray-400 text-center py-1.5 sm:py-2 bg-gray-50">
                          显示前 30 条，共 {failures.length} 条失败记录
                        </p>
                      )}
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, color, smLabel,
}: { label: string; value: number; icon: React.ReactNode; color: string; smLabel?: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'border-indigo-400 bg-indigo-50',
    amber: 'border-amber-400 bg-amber-50',
    green: 'border-green-400 bg-green-50',
    red: 'border-red-400 bg-red-50',
    gray: 'border-gray-400 bg-gray-50',
  }
  return (
    <div className={`rounded-lg border-l-4 p-2.5 sm:p-3 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] sm:text-xs text-gray-600 leading-tight">
          <span className="sm:hidden">{smLabel ?? label}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{value}</p>
    </div>
  )
}

function ActionButton({
  label, desc, icon, loading, disabled, onClick, color, shortLabel,
}: {
  label: string
  desc: string
  icon: React.ReactNode
  loading: boolean
  disabled: boolean
  onClick: () => void
  color: 'blue' | 'green' | 'indigo' | 'red'
  shortLabel?: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 ${colorMap[color]}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        <span className="flex-shrink-0">{icon}</span>
      )}
      <div className="text-left sm:flex-1 min-w-0">
        <div className="text-[12px] sm:text-sm leading-tight font-medium">
          <span className="sm:hidden">{shortLabel ?? label}</span>
          <span className="hidden sm:inline">{label}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] opacity-85 leading-tight hidden sm:block">{desc}</div>
      </div>
    </button>
  )
}
