import * as Sentry from '@sentry/node'

const SENTRY_DSN = process.env.SENTRY_DSN

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 0.1,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release version
    release: process.env.npm_package_version,
    
    // Capture unhandled promise rejections
    captureUnhandledRejections: true,
    
    // Ignore common server errors
    ignoreErrors: [
      // Database connection errors that are expected
      'Connection terminated unexpectedly',
      'Connection lost',
      
      // Timeout errors
      'Request timeout',
      'Connection timeout',
      
      // Validation errors that are handled
      'ValidationError',
      'ZodError',
    ],
    
    // beforeSend to filter out unwanted errors
    beforeSend(event, hint) {
      // Filter out errors from health checks
      if (event.request && event.request.url) {
        if (event.request.url.includes('/api/health')) {
          return null
        }
      }
      
      // Filter out rate limiting errors
      if (event.exception && event.exception.values) {
        const error = event.exception.values[0]
        if (error.value && (
          error.value.includes('Rate limit exceeded') ||
          error.value.includes('Too many requests')
        )) {
          return null
        }
      }
      
      return event
    },
    
    // Context
    initialScope: {
      tags: {
        component: 'server',
        runtime: process.env.NODE_RUNTIME || 'nodejs',
      },
    },
  })
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    Sentry.captureException(reason, {
      extra: {
        promise,
      },
    })
  })
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    Sentry.captureException(error)
    process.exit(1)
  })
}
