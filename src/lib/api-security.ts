/**
 * API Security Wrapper
 * Provides consistent security checks for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { securityMiddleware, checkRateLimit, sanitizeInput } from '@/lib/security'
import { rateLimit, RATE_LIMITS, RateLimitConfig } from '@/lib/rate-limiter'

interface APIHandlerOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  rateLimit?: {
    maxRequests?: number
    windowMs?: number
  } | keyof typeof RATE_LIMITS  // Support predefined configs
  validateInput?: (body: any) => { valid: boolean; error?: string }
}

/**
 * Wrap API handler with security checks
 */
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: APIHandlerOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // 1. Apply general security middleware (CSRF, etc.)
      const securityResponse = await securityMiddleware(request)
      if (securityResponse) {
        return securityResponse
      }
      
      // 2. Check authentication
      if (options.requireAuth || options.requireAdmin) {
        const session = await auth()
        
        if (!session?.user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
        
        // Check admin role
        if (options.requireAdmin && session.user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }
      }
      
      // 3. Rate limiting
      if (options.rateLimit) {
        const identifier = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown'
        
        let config: RateLimitConfig
        
        // Check if using predefined config
        if (typeof options.rateLimit === 'string') {
          config = RATE_LIMITS[options.rateLimit]
        } else {
          config = {
            maxRequests: options.rateLimit.maxRequests || 100,
            windowMs: options.rateLimit.windowMs || 60 * 1000,
          }
        }
        
        const result = await rateLimit(
          `api:${request.method}:${identifier}`,
          config
        )
        
        if (!result.allowed) {
          const response = NextResponse.json(
            { 
              error: config.message || 'Rate limit exceeded. Please try again later.',
              retryAfter: result.retryAfter
            },
            { status: 429 }
          )
          
          // Add rate limit headers
          response.headers.set('X-RateLimit-Limit', String(result.limit))
          response.headers.set('X-RateLimit-Remaining', String(result.remaining))
          response.headers.set('X-RateLimit-Reset', String(result.resetTime))
          if (result.retryAfter) {
            response.headers.set('Retry-After', String(result.retryAfter))
          }
          
          return response
        }
        
        // Continue with handler - will add headers after
        const response = await handler(request, context)
        response.headers.set('X-RateLimit-Limit', String(result.limit))
        response.headers.set('X-RateLimit-Remaining', String(result.remaining))
        response.headers.set('X-RateLimit-Reset', String(result.resetTime))
        return response
      }
      
      // 4. Input validation
      if (options.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json()
          const validation = options.validateInput(body)
          
          if (!validation.valid) {
            return NextResponse.json(
              { error: validation.error || 'Invalid input' },
              { status: 400 }
            )
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
          )
        }
      }
      
      // 5. Execute handler
      return await handler(request, context)
      
    } catch (error) {
      console.error('API Security Error:', error)
      
      // Don't expose internal errors in production
      const isProduction = process.env.NODE_ENV === 'production'
      
      return NextResponse.json(
        {
          error: isProduction ? 'Internal server error' : 'Error processing request',
          ...(isProduction ? {} : { details: error instanceof Error ? error.message : 'Unknown error' })
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody(body: any, fields: string[]): any {
  const sanitized: any = {}
  
  for (const field of fields) {
    if (body[field] !== undefined) {
      sanitized[field] = sanitizeInput(body[field])
    }
  }
  
  return sanitized
}

/**
 * Validate common input patterns
 */
export const validators = {
  email: (email: string): { valid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' }
    }
    
    if (email.length > 254) {
      return { valid: false, error: 'Email too long' }
    }
    
    return { valid: true }
  },
  
  password: (password: string): { valid: boolean; error?: string } => {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' }
    }
    
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' }
    }
    
    if (password.length > 128) {
      return { valid: false, error: 'Password too long' }
    }
    
    // Check for at least one uppercase, one lowercase, and one number
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { valid: false, error: 'Password must contain uppercase, lowercase, and numbers' }
    }
    
    return { valid: true }
  },
  
  productName: (name: string): { valid: boolean; error?: string } => {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Product name is required' }
    }
    
    if (name.length < 3) {
      return { valid: false, error: 'Product name must be at least 3 characters' }
    }
    
    if (name.length > 200) {
      return { valid: false, error: 'Product name too long' }
    }
    
    return { valid: true }
  },
  
  url: (url: string): { valid: boolean; error?: string } => {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' }
    }
    
    try {
      new URL(url)
      return { valid: true }
    } catch {
      return { valid: false, error: 'Invalid URL format' }
    }
  },
}
