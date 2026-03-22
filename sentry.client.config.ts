import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.1,
    
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release version (from package.json)
    release: process.env.npm_package_version,
    
    // Ignore common errors that don't need tracking
    ignoreErrors: [
      // Network errors that are expected
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      
      // Browser extensions
      'Non-Error promise rejection captured',
      
      // Third-party script errors
      'Script error.',
      
      // Chrome extension errors
      'ResizeObserver loop limit exceeded',
      
      // React development errors
      'Warning: ReactDOM.render is deprecated',
    ],
    
    // beforeSend to filter out unwanted errors
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception && event.exception.values) {
        const error = event.exception.values[0]
        if (error.stacktrace && error.stacktrace.frames) {
          const frame = error.stacktrace.frames[0]
          if (frame && frame.filename && (
            frame.filename.includes('extension') ||
            frame.filename.includes('chrome-extension') ||
            frame.filename.includes('moz-extension')
          )) {
            return null
          }
        }
      }
      
      // Filter out cancelled requests
      if (event.exception && event.exception.values) {
        const error = event.exception.values[0]
        if (error.value && (
          error.value.includes('AbortError') ||
          error.value.includes('DOMException') ||
          error.value.includes('NetworkError')
        )) {
          return null
        }
      }
      
      return event
    },
    
    // Integrations
    integrations: [
      new Sentry.Replay({
        // Additional Replay configuration goes here
        // For example, note the following:
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Context
    initialScope: {
      tags: {
        component: 'client',
      },
    },
  })
}
