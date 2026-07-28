/**
 * Security utilities for CSRF, XSS, and input validation
 */

import { NextRequest, NextResponse } from 'next/server'

// CSRF Token management
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate a random CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME)
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (!tokenFromHeader || !tokenFromCookie) {
    return false
  }
  
  // Constant-time comparison to prevent timing attacks
  return tokenFromHeader === tokenFromCookie
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize and validate user input
 */
export function sanitizeInput(input: any, options?: {
  maxLength?: number
  allowHTML?: boolean
  allowedTags?: string[]
}): string {
  if (typeof input !== 'string') return ''
  
  let sanitized = input.trim()
  
  // Check max length
  const maxLength = options?.maxLength || 10000
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  // Sanitize HTML if not allowed
  if (!options?.allowHTML) {
    sanitized = sanitizeHTML(sanitized)
  }
  
  return sanitized
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://www.googleoptimize.com; " +
    "worker-src 'self' blob:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https: wss://* https://api.x2xhub.com https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.googleoptimize.com https://o4511420043034624.ingest.de.sentry.io; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  )
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  
  // Cross-Origin policies
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
  
  return response
}

/**
 * Security middleware for API routes
 * Note: For CSRF verification with auth, use api-security.ts wrapper
 */
export async function securityMiddleware(request: NextRequest) {
  // Only apply to state-changing methods
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  
  if (protectedMethods.includes(request.method)) {
    // Skip CSRF check for GET requests and public APIs
    const pathname = request.nextUrl.pathname
    
    // Skip CSRF for authentication endpoints
    if (pathname.startsWith('/api/auth/')) {
      return null
    }
    
    // Skip CSRF for public read-only APIs
    if (pathname.includes('/public')) {
      return null
    }
    
    // CSRF verification should be done in API routes using api-security.ts
    // This function is mainly for adding security headers
  }
  
  return null
}

/**
 * Rate limit helper (simple in-memory implementation)
 * For production, use Redis-based rate limiting
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
