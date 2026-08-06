'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AdminDevToolsProps {
  isAdmin: boolean
  userEmail?: string | null
  buildId?: string
}

interface LogEntry {
  id: number
  level: 'error' | 'warn' | 'info'
  message: string
  timestamp: string
}

const ADMIN_EMAILS = [
  '1994169577@qq.com',
  'sardenesy@gmail.com',
]

export default function AdminDevTools({ isAdmin, userEmail, buildId }: AdminDevToolsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const logIdRef = useRef(0)

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      id: ++logIdRef.current,
      level,
      message: message.slice(0, 500),
      timestamp: new Date().toLocaleTimeString(),
    }
    setLogs((prev) => [entry, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.error = (...args: unknown[]) => {
      addLog('error', args.map((a) => {
        if (a instanceof Error) return `${a.message}\n${a.stack || ''}`
        if (typeof a === 'object') return JSON.stringify(a, null, 2)
        return String(a)
      }).join(' '))
      originalConsoleError.apply(console, args)
    }

    console.warn = (...args: unknown[]) => {
      addLog('warn', args.map((a) => {
        if (typeof a === 'object') return JSON.stringify(a)
        return String(a)
      }).join(' '))
      originalConsoleWarn.apply(console, args)
    }

    window.addEventListener('error', (e) => {
      addLog('error', `${e.message} @ ${e.filename}:${e.lineno}`)
    })

    window.addEventListener('unhandledrejection', (e) => {
      addLog('error', `Unhandled: ${e.reason}`)
    })

    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [isAdmin, addLog])

  if (!isAdmin) return null

  const errorCount = logs.filter((l) => l.level === 'error').length
  const warnCount = logs.filter((l) => l.level === 'warn').length

  const clearLogs = () => setLogs([])

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dev-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-white/10 hover:bg-slate-800 transition-colors"
          title="Admin DevTools"
        >
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] opacity-60">ADMIN</span>
          {errorCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold">
              {errorCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-yellow-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
              {warnCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 left-4 z-[9999] w-[480px] max-h-[600px] rounded-xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/10 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs font-semibold">Admin DevTools</span>
              <span className="text-[10px] text-slate-400">{userEmail}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▼' : '▲'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800/50 px-4 py-2 text-[10px]">
            <span className="text-slate-400">Build:</span>
            <span className="font-mono text-slate-300">{buildId || 'unknown'}</span>
            <span className="text-slate-600">|</span>
            <span className="text-red-400">{errorCount} errors</span>
            <span className="text-yellow-400">{warnCount} warnings</span>
            <span className="ml-auto text-green-400">● Admin Mode</span>
          </div>

          {!isExpanded && (
            <div className="flex gap-1 bg-slate-800/30 px-4 py-2">
              <button
                onClick={clearLogs}
                className="rounded bg-slate-700 px-2 py-1 text-[10px] hover:bg-slate-600 transition"
              >
                Clear
              </button>
              <button
                onClick={exportLogs}
                className="rounded bg-slate-700 px-2 py-1 text-[10px] hover:bg-slate-600 transition"
              >
                Export JSON
              </button>
              <button
                onClick={() => {
                  addLog('info', 'Page info check')
                  addLog('info', `URL: ${window.location.href}`)
                  addLog('info', `User Agent: ${navigator.userAgent.slice(0, 80)}`)
                  addLog('info', `Viewport: ${window.innerWidth}x${window.innerHeight}`)
                }}
                className="rounded bg-blue-600 px-2 py-1 text-[10px] hover:bg-blue-500 transition"
              >
                Diagnose
              </button>
            </div>
          )}

          {!isExpanded && (
            <div className="flex-1 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-slate-500">
                  No errors or warnings. Console is clean. ✨
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`px-4 py-2 text-[11px] ${
                        log.level === 'error'
                          ? 'bg-red-950/30 border-l-2 border-red-500'
                          : log.level === 'warn'
                          ? 'bg-yellow-950/30 border-l-2 border-yellow-500'
                          : 'bg-slate-800/20 border-l-2 border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px] opacity-60">
                        <span>{log.timestamp}</span>
                        <span className="uppercase font-bold">{log.level}</span>
                      </div>
                      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed">
                        {log.message}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isExpanded && (
            <div className="flex-1 overflow-y-auto p-4 text-[11px] space-y-3">
              <Section title="Session">
                <InfoRow label="Email" value={userEmail || 'N/A'} />
                <InfoRow label="Admin" value={isAdmin ? 'Yes' : 'No'} />
              </Section>
              <Section title="Page">
                <InfoRow label="URL" value={typeof window !== 'undefined' ? window.location.href : 'N/A'} />
                <InfoRow label="Referrer" value={typeof document !== 'undefined' ? document.referrer || 'Direct' : 'N/A'} />
                <InfoRow label="Language" value={typeof navigator !== 'undefined' ? navigator.language : 'N/A'} />
              </Section>
              <Section title="Device">
                <InfoRow label="Viewport" value={`${typeof window !== 'undefined' ? window.innerWidth : '?'} × ${typeof window !== 'undefined' ? window.innerHeight : '?'}`} />
                <InfoRow label="Platform" value={typeof navigator !== 'undefined' ? navigator.platform || 'Unknown' : 'N/A'} />
                <InfoRow label="Online" value={typeof navigator !== 'undefined' ? String(navigator.onLine) : 'N/A'} />
              </Section>
              <Section title="Build">
                <InfoRow label="Build ID" value={buildId || 'unknown'} />
              </Section>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</div>
      <div className="space-y-1 rounded bg-slate-800/50 p-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="min-w-[80px] text-slate-500">{label}</span>
      <span className="break-all font-mono text-slate-200">{value}</span>
    </div>
  )
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.some(
    (admin) => admin.toLowerCase() === email.toLowerCase()
  )
}
