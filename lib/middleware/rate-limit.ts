import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest, identifier: string = getClientIP(req)) => {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Clean up expired entries
    for (const [key, data] of rateLimitStore.entries()) {
      if (data.resetTime <= now) {
        rateLimitStore.delete(key)
      }
    }
    
    const current = rateLimitStore.get(identifier)
    
    if (!current || current.resetTime <= now) {
      // First request in window
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true, remaining: config.maxRequests - 1 }
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return { 
        allowed: false, 
        remaining: 0,
        message: config.message || 'Too many requests'
      }
    }
    
    // Increment counter
    current.count++
    return { allowed: true, remaining: config.maxRequests - current.count }
  }
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Rate limit configurations
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later'
})

export const webhookRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes  
  maxRequests: 50, // 50 webhooks per 5 minutes
  message: 'Too many webhook requests'
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts'
})
