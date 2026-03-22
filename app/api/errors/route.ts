import { NextRequest } from 'next/server'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'

interface ErrorLog {
  message: string
  stack?: string
  componentStack?: string
  errorId: string
  timestamp: string
  userAgent?: string
  url?: string
  userId?: string
}

const errorHandler = secureAPIRoute(
  async (req: NextRequest) => {
    try {
      const errorData: ErrorLog = await req.json()
      
      // Validate required fields
      if (!errorData.message || !errorData.errorId || !errorData.timestamp) {
        return Response.json({ error: 'Missing required error fields' }, { status: 400 })
      }
      
      // Add additional context
      const enrichedError = {
        ...errorData,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        timestamp: new Date(errorData.timestamp).toISOString(),
      }
      
      // Log to console (in production, send to external service)
      console.error('Client Error Logged:', {
        errorId: enrichedError.errorId,
        message: enrichedError.message,
        timestamp: enrichedError.timestamp,
        ip: enrichedError.ip,
        url: enrichedError.url,
      })
      
      // In production, send to external monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Sentry, LogRocket, or your monitoring service
        await sendToMonitoringService(enrichedError)
      }
      
      return Response.json({ 
        success: true, 
        errorId: errorData.errorId 
      })
      
    } catch (error) {
      console.error('Error logging failed:', error)
      return Response.json(
        { error: 'Failed to log error' }, 
        { status: 500 }
      )
    }
  },
  {
    requireAuth: false, // Errors can happen before auth
    rateLimit: apiRateLimit,
    validateContentType: true,
    maxBodySize: 50 * 1024, // 50KB for error reports
  }
)

async function sendToMonitoringService(errorData: ErrorLog) {
  try {
    // Example implementation for external service
    // Replace with your actual monitoring service
    
    if (process.env.SENTRY_DSN) {
      // Send to Sentry
      // await Sentry.captureException(new Error(errorData.message), {
      //   extra: errorData
      // })
    }
    
    if (process.env.WEBHOOK_URL) {
      // Send to webhook/Slack
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Fixr Error: ${errorData.message}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Error ID', value: errorData.errorId, short: true },
              { title: 'URL', value: errorData.url, short: true },
              { title: 'Timestamp', value: errorData.timestamp, short: true },
              { title: 'Stack', value: errorData.stack?.substring(0, 500), short: false }
            ]
          }]
        })
      })
    }
    
  } catch (error) {
    console.error('Failed to send to monitoring service:', error)
  }
}

export { errorHandler as POST }
