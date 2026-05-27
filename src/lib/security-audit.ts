/**
 * Security Audit Service
 * Logs security-relevant events for monitoring and investigation
 */

import { prisma } from "@/lib/db"

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_ACTIVITY'

export interface SecurityEventData {
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  country?: string
  city?: string
  deviceType?: string
  browser?: string
  os?: string
  metadata?: Record<string, unknown>
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  data: SecurityEventData
): Promise<void> {
  try {
    console.log(`[SECURITY] ${eventType}:`, {
      userId: data.userId,
      email: data.email,
      ipAddress: data.ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Store in database if userId is available
    if (data.userId) {
      try {
        await (prisma as any).loginHistory.create({
          data: {
            userId: data.userId,
            action: eventType,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            country: data.country,
            city: data.city,
            deviceType: data.deviceType,
            browser: data.browser,
            os: data.os,
            metadata: data.metadata,
          },
        })
      } catch (err: any) {
        console.log('[SECURITY] Could not log to database:', err.message)
      }
    }
  } catch (error) {
    console.error('[SECURITY] Failed to log security event:', error)
  }
}

/**
 * Detect suspicious login patterns
 */
export async function detectSuspiciousActivity(
  email: string,
  ipAddress: string
): Promise<{ isSuspicious: boolean; reasons: string[] }> {
  const reasons: string[] = []

  try {
    // Check for multiple failed attempts from same IP
    const recentFailedAttempts = await (prisma as any).loginHistory.count({
      where: {
        action: 'LOGIN_FAILED',
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    })

    if (recentFailedAttempts > 10) {
      reasons.push(`High number of failed attempts from IP: ${recentFailedAttempts}`)
    }

    // Check for logins from multiple countries in short time
    const recentLogins = await (prisma as any).loginHistory.findMany({
      where: {
        action: 'LOGIN_SUCCESS',
        email,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const countries = new Set(recentLogins.map((l: any) => l.country).filter(Boolean))
    if (countries.size > 3) {
      reasons.push(`Logins from multiple countries: ${Array.from(countries).join(', ')}`)
    }

    // Check for new geographic location
    if (recentLogins.length > 0) {
      const lastLogin = recentLogins[0]
      const knownCountries = new Set(recentLogins.map((l: any) => l.country).filter(Boolean))
      if (lastLogin.country && !knownCountries.has(lastLogin.country) && knownCountries.size > 0) {
        reasons.push(`Login from new country: ${lastLogin.country}`)
      }
    }

  } catch (error) {
    console.error('[SECURITY] Failed to detect suspicious activity:', error)
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}

/**
 * Get user's login history
 */
export async function getLoginHistory(
  userId: string,
  limit = 20
): Promise<unknown[]> {
  try {
    const history = await (prisma as any).loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return history
  } catch (error) {
    console.error('[SECURITY] Failed to get login history:', error)
    return []
  }
}

/**
 * Parse user agent string to extract device info
 */
export function parseUserAgent(userAgent: string): {
  deviceType: string
  browser: string
  os: string
} {
  const ua = userAgent.toLowerCase()

  let deviceType = 'desktop'
  if (/(tablet|ipad)|(mobile|iphone|android)/.test(ua)) {
    deviceType = 'mobile'
  }

  let browser = 'unknown'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'

  let os = 'unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone')) os = 'iOS'

  return { deviceType, browser, os }
}
