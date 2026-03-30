import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export interface SecurityConfig {
  requireAuth?: boolean
  rateLimit?: (req: NextRequest, identifier?: string) => Promise<{ allowed: boolean; remaining: number; message?: string }>
  validateContentType?: boolean
  maxBodySize?: number
}

export function withSecurity(config: SecurityConfig = {}) {
  return async function securityMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<Response>
  ): Promise<Response> {
    try {
      // Rate limiting
      if (config.rateLimit) {
        const rateLimitResult = await config.rateLimit(req)
        
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: rateLimitResult.message || 'Rate limit exceeded' },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'Retry-After': '900' // 15 minutes
              }
            }
          )
        }
      }

      // Authentication check
      if (config.requireAuth) {
        const { userId } = auth()
        
        if (!userId) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
      }

      // Content-Type validation
      if (config.validateContentType) {
        const contentType = req.headers.get('content-type')
        
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
              { error: 'Content-Type must be application/json' },
              { status: 400 }
            )
          }
        }
      }

      // Body size validation
      if (config.maxBodySize) {
        const contentLength = req.headers.get('content-length')
        
        if (contentLength && parseInt(contentLength) > config.maxBodySize) {
          return NextResponse.json(
            { error: 'Request body too large' },
            { status: 413 }
          )
        }
      }

      // Call the handler
      return await handler(req)
      
    } catch (error) {
      console.error('Security middleware error:', error)
      
      return NextResponse.json(
        { error: 'Internal security error' },
        { status: 500 }
      )
    }
  }
}

// Helper function to apply security to API routes
export function secureAPIRoute<T extends Record<string, string>>(
  handler: (req: NextRequest, context: { params: Promise<T> }) => Promise<Response>,
  config: SecurityConfig = {}
) {
  const securityMiddleware = withSecurity(config)
  
  return async (req: NextRequest, context: { params: Promise<T> }) => {
    // Create a wrapper function that only passes req to security middleware
    const wrappedHandler = async (request: NextRequest) => handler(request, context)
    return securityMiddleware(req, wrappedHandler)
  }
}
