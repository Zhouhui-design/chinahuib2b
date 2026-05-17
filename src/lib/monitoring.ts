/**
 * Error Tracking and Monitoring System
 * Integrates with Sentry, LogRocket, or custom error tracking
 */

import { NextRequest, NextResponse } from 'next/server'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error context interface
export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  method?: string
  userAgent?: string
  ip?: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Tracked error interface
export interface TrackedError {
  id: string
  name: string
  message: string
  stack?: string
  severity: ErrorSeverity
  context: ErrorContext
  occurredAt: Date
}

// In-memory error store (use Redis in production)
const errorStore: TrackedError[] = []
const MAX_ERRORS = 1000

/**
 * Track an error
 */
export function trackError(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Partial<ErrorContext>
): TrackedError {
  const errorMessage = error instanceof Error ? error.message : error
  const errorStack = error instanceof Error ? error.stack : undefined
  const errorName = error instanceof Error ? error.name : 'Error'
  
  const trackedError: TrackedError = {
    id: generateId(),
    name: errorName,
    message: errorMessage,
    stack: errorStack,
    severity,
    context: {
      userId: context?.userId,
      sessionId: context?.sessionId,
      url: context?.url,
      method: context?.method,
      userAgent: context?.userAgent,
      ip: context?.ip,
      timestamp: new Date(),
      metadata: context?.metadata,
    },
    occurredAt: new Date(),
  }
  
  // Store error
  errorStore.push(trackedError)
  
  // Keep only last MAX_ERRORS
  if (errorStore.length > MAX_ERRORS) {
    errorStore.shift()
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${severity.toUpperCase()}] ${errorName}: ${errorMessage}`, {
      context: trackedError.context,
      stack: errorStack,
    })
  }
  
  // Send to external service in production
  if (process.env.NODE_ENV === 'production') {
    sendToExternalService(trackedError).catch(console.error)
  }
  
  return trackedError
}

/**
 * Track API errors automatically
 */
export async function withErrorTracking(
  handler: (request: NextRequest) => Promise<NextResponse>,
  request: NextRequest
): Promise<NextResponse> {
  try {
    return await handler(request)
  } catch (error) {
    const trackedError = trackError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.HIGH,
      {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || undefined,
      }
    )
    
    // Return appropriate error response
    const isProduction = process.env.NODE_ENV === 'production'
    
    return NextResponse.json(
      {
        error: isProduction ? 'Internal server error' : trackedError.message,
        errorId: trackedError.id,
      },
      { status: 500 }
    )
  }
}

/**
 * Get recent errors
 */
export function getRecentErrors(options?: {
  limit?: number
  severity?: ErrorSeverity
  since?: Date
}): TrackedError[] {
  let errors = [...errorStore]
  
  // Filter by severity
  if (options?.severity) {
    errors = errors.filter(e => e.severity === options.severity)
  }
  
  // Filter by time
  if (options?.since) {
    errors = errors.filter(e => e.occurredAt >= options.since!)
  }
  
  // Sort by most recent
  errors.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
  
  // Limit results
  const limit = options?.limit || 50
  return errors.slice(0, limit)
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number
  bySeverity: Record<ErrorSeverity, number>
  recentTrend: number
  topErrors: Array<{ name: string; count: number }>
} {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  // Count by severity
  const bySeverity = {
    [ErrorSeverity.LOW]: 0,
    [ErrorSeverity.MEDIUM]: 0,
    [ErrorSeverity.HIGH]: 0,
    [ErrorSeverity.CRITICAL]: 0,
  }
  
  errorStore.forEach(error => {
    bySeverity[error.severity]++
  })
  
  // Calculate recent trend (errors in last hour)
  const recentErrors = errorStore.filter(e => e.occurredAt >= oneHourAgo)
  const previousHour = errorStore.filter(e => {
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    return e.occurredAt >= twoHoursAgo && e.occurredAt < oneHourAgo
  })
  
  const recentTrend = recentErrors.length - previousHour.length
  
  // Find top errors
  const errorCounts = new Map<string, number>()
  errorStore.forEach(error => {
    const key = `${error.name}: ${error.message}`
    errorCounts.set(key, (errorCounts.get(key) || 0) + 1)
  })
  
  const topErrors = Array.from(errorCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  return {
    total: errorStore.length,
    bySeverity,
    recentTrend,
    topErrors,
  }
}

/**
 * Clear old errors
 */
export function clearOldErrors(olderThan: Date): number {
  const initialLength = errorStore.length
  const filtered = errorStore.filter(e => e.occurredAt >= olderThan)
  errorStore.length = 0
  errorStore.push(...filtered)
  return initialLength - errorStore.length
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Send error to external service (Sentry, etc.)
 */
async function sendToExternalService(error: TrackedError): Promise<void> {
  // Example: Send to Sentry
  // if (process.env.SENTRY_DSN) {
  //   await fetch('https://sentry.io/api/...', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(error),
  //   })
  // }
  
  // Example: Send to custom webhook
  if (process.env.ERROR_WEBHOOK_URL) {
    try {
      await fetch(process.env.ERROR_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            severity: error.severity,
          },
          context: error.context,
          occurredAt: error.occurredAt,
        }),
      })
    } catch (err) {
      console.error('Failed to send error to webhook:', err)
    }
  }
}

/**
 * Performance monitoring utilities
 */
export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'percent' | 'count'
  timestamp: Date
  tags?: Record<string, string>
}

const metrics: PerformanceMetric[] = []
const MAX_METRICS = 5000

/**
 * Record a performance metric
 */
export function recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
  metrics.push({
    ...metric,
    timestamp: new Date(),
  })
  
  // Keep only last MAX_METRICS
  if (metrics.length > MAX_METRICS) {
    metrics.shift()
  }
}

/**
 * Measure execution time
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = Date.now()
  
  try {
    const result = await fn()
    const duration = Date.now() - start
    
    recordMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
    })
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    
    recordMetric({
      name: `${name}_error`,
      value: duration,
      unit: 'ms',
      tags: { ...tags, error: 'true' },
    })
    
    throw error
  }
}

/**
 * Get performance metrics
 */
export function getMetrics(options?: {
  name?: string
  since?: Date
  limit?: number
}): PerformanceMetric[] {
  let filtered = [...metrics]
  
  if (options?.name) {
    filtered = filtered.filter(m => m.name === options.name)
  }
  
  if (options?.since) {
    filtered = filtered.filter(m => m.timestamp >= options.since!)
  }
  
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  
  const limit = options?.limit || 100
  return filtered.slice(0, limit)
}

/**
 * Calculate metric statistics
 */
export function getMetricStats(name: string, windowMs: number = 60 * 60 * 1000): {
  count: number
  avg: number
  min: number
  max: number
  p95: number
  p99: number
} {
  const now = new Date()
  const since = new Date(now.getTime() - windowMs)
  
  const relevantMetrics = metrics
    .filter(m => m.name === name && m.timestamp >= since)
    .map(m => m.value)
    .sort((a, b) => a - b)
  
  if (relevantMetrics.length === 0) {
    return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 }
  }
  
  const count = relevantMetrics.length
  const sum = relevantMetrics.reduce((a, b) => a + b, 0)
  const avg = sum / count
  const min = relevantMetrics[0]
  const max = relevantMetrics[count - 1]
  const p95 = relevantMetrics[Math.floor(count * 0.95)]
  const p99 = relevantMetrics[Math.floor(count * 0.99)]
  
  return { count, avg, min, max, p95, p99 }
}
