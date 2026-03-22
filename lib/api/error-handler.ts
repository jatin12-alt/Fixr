import { NextRequest, NextResponse } from 'next/server'

export interface APIError {
  code: string
  message: string
  statusCode: number
  details?: any
}

export class APIErrorResponse extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code || `ERROR_${statusCode}` 
    this.details = details
    this.name = 'APIErrorResponse'
  }
}

export function withErrorHandler(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      
      // Handle known API errors
      if (error instanceof APIErrorResponse) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details,
          },
          { status: error.statusCode }
        )
      }
      
      // Handle validation errors (Zod)
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: (error as any).errors,
          },
          { status: 400 }
        )
      }
      
      // Handle database errors
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any
        
        if (dbError.code === '23505') { // Unique violation
          return NextResponse.json(
            {
              error: 'Resource already exists',
              code: 'DUPLICATE_RESOURCE',
            },
            { status: 409 }
          )
        }
        
        if (dbError.code === '23503') { // Foreign key violation
          return NextResponse.json(
            {
              error: 'Referenced resource not found',
              code: 'INVALID_REFERENCE',
            },
            { status: 400 }
          )
        }
      }
      
      // Log unexpected errors
      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      
      console.error('Unexpected API error:', {
        errorId,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: req.url,
        method: req.method,
      })
      
      // Return generic error for unexpected cases
      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          errorId: process.env.NODE_ENV === 'development' ? errorId : undefined,
        },
        { status: 500 }
      )
    }
  }
}

// Common error responses
export const Errors = {
  UNAUTHORIZED: new APIErrorResponse('Authentication required', 401, 'UNAUTHORIZED'),
  FORBIDDEN: new APIErrorResponse('Access denied', 403, 'FORBIDDEN'),
  NOT_FOUND: new APIErrorResponse('Resource not found', 404, 'NOT_FOUND'),
  VALIDATION_ERROR: (details?: any) => new APIErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', details),
  RATE_LIMITED: new APIErrorResponse('Too many requests', 429, 'RATE_LIMITED'),
  GITHUB_TOKEN_MISSING: new APIErrorResponse('GitHub authentication required', 401, 'GITHUB_TOKEN_MISSING'),
  REPO_NOT_FOUND: new APIErrorResponse('Repository not found or access denied', 404, 'REPO_NOT_FOUND'),
  ANALYSIS_FAILED: new APIErrorResponse('AI analysis failed', 500, 'ANALYSIS_FAILED'),
}
