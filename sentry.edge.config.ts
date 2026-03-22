import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

// Minimal config for edge runtime
if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Disable traces in edge runtime for performance
    tracesSampleRate: 0,
    
    // Context
    initialScope: {
      tags: {
        component: 'edge',
        runtime: 'edge',
      },
    },
  })
}
