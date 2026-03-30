// Optional Sentry integration - only available if installed
let Sentry: any = null
try {
  // webpackIgnore tells the bundler to skip this require (Sentry is optional)
  Sentry = require(/* webpackIgnore: true */ '@sentry/nextjs')
} catch (error) {
  // Sentry not installed - error logging will work without it
}

export interface ErrorContext {
  userId?: string
  userEmail?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  statusCode?: number
  responseTime?: number
  healthStatus?: any
  additionalData?: Record<string, any>
}

export interface LogEntry {
  level: 'error' | 'warning' | 'info' | 'debug'
  message: string
  error?: Error
  context?: ErrorContext
  timestamp: Date
}

class ErrorLogger {
  private isProduction = process.env.NODE_ENV === 'production'
  private isSentryEnabled = !!process.env.SENTRY_DSN

  /**
   * Log an error with context
   */
  error(message: string, error?: Error, context?: ErrorContext): void {
    const logEntry: LogEntry = {
      level: 'error',
      message,
      error,
      context,
      timestamp: new Date(),
    }

    // Always log to console in development
    if (!this.isProduction) {
      console.error('🚨 Error:', logEntry)
      if (error) console.error('Stack trace:', error.stack)
    }

    // Send to Sentry if enabled
    if (this.isSentryEnabled) {
      this.sendToSentry(message, error, context, 'error')
    }

    // Store in database/external service in production
    if (this.isProduction) {
      this.storeLogEntry(logEntry)
    }
  }

  /**
   * Log a warning
   */
  warning(message: string, context?: ErrorContext): void {
    const logEntry: LogEntry = {
      level: 'warning',
      message,
      context,
      timestamp: new Date(),
    }

    if (!this.isProduction) {
      console.warn('⚠️ Warning:', logEntry)
    }

    if (this.isSentryEnabled) {
      this.sendToSentry(message, undefined, context, 'warning')
    }

    if (this.isProduction) {
      this.storeLogEntry(logEntry)
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: ErrorContext): void {
    const logEntry: LogEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date(),
    }

    if (!this.isProduction) {
      console.info('ℹ️ Info:', logEntry)
    }

    // Don't send info messages to Sentry by default
    if (this.isProduction) {
      this.storeLogEntry(logEntry)
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: ErrorContext): void {
    const logEntry: LogEntry = {
      level: 'debug',
      message,
      context,
      timestamp: new Date(),
    }

    if (!this.isProduction) {
      console.debug('🐛 Debug:', logEntry)
    }

    // Don't store debug messages in production
  }

  /**
   * Set user context for Sentry
   */
  setUser(userId: string, email?: string, additionalData?: Record<string, any>): void {
    if (Sentry) {
      Sentry.setUser({
        id: userId,
        email,
        ...additionalData,
      })
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (Sentry) {
      Sentry.setUser(null)
    }
  }

  /**
   * Add breadcrumb for better context
   */
  addBreadcrumb(
    message: string,
    category: string = 'custom',
    level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
    data?: Record<string, any>
  ): void {
    if (Sentry) {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        data,
        timestamp: Date.now() / 1000,
      })
    }
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(
    message: string,
    error?: Error,
    context?: ErrorContext,
    level: 'error' | 'warning' = 'error'
  ): void {
    if (!Sentry) {
      // Sentry not available - just log to console
      console.log('Sentry not available - skipping error reporting')
      return
    }

    try {
      // Set user context if available
      if (context?.userId) {
        Sentry.setUser({
          id: context.userId,
          email: context.userEmail,
        })
      }

      // Set tags and extra context
      Sentry.setTags({
        component: context?.url?.includes('/api/') ? 'api' : 'frontend',
        method: context?.method,
        statusCode: context?.statusCode,
      })

      Sentry.setContext('request_context', {
        url: context?.url,
        method: context?.method,
        userAgent: context?.userAgent,
        ip: context?.ip,
        sessionId: context?.sessionId,
        requestId: context?.requestId,
      })

      if (error) {
        // Send exception with additional context
        Sentry.captureException(error, {
          tags: {
            message,
          },
          extra: {
            customMessage: message,
            ...context?.additionalData,
          },
          level: level as any,
        })
      } else {
        // Send message as event
        Sentry.captureMessage(message, level as any)
      }

      // Clear user context after sending
      Sentry.setUser(null)
    } catch (sentryError) {
      console.error('Failed to send to Sentry:', sentryError)
    }
  }

  /**
   * Store log entry (placeholder for database storage)
   */
  private async storeLogEntry(logEntry: LogEntry): Promise<void> {
    try {
      // TODO: Store in database or external logging service
      // This could be PostgreSQL, Elasticsearch, or a service like LogDNA
      
      // For now, just log to console in production
      console.log('📊 Log Entry:', JSON.stringify(logEntry, null, 2))
    } catch (error) {
      console.error('Failed to store log entry:', error)
    }
  }

  /**
   * Create a performance transaction
   */
  startTransaction(name: string, operation: string = 'custom'): any {
    if (Sentry) {
      return Sentry.startTransaction({
        name,
        op: operation,
      })
    }
    return undefined
  }

  /**
   * Finish a transaction
   */
  finishTransaction(transaction?: any): void {
    if (Sentry && transaction) {
      transaction.finish()
    }
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()

// Export convenience functions
export const logError = (message: string, error?: Error, context?: ErrorContext) =>
  errorLogger.error(message, error, context)

export const logWarning = (message: string, context?: ErrorContext) =>
  errorLogger.warning(message, context)

export const logInfo = (message: string, context?: ErrorContext) =>
  errorLogger.info(message, context)

export const logDebug = (message: string, context?: ErrorContext) =>
  errorLogger.debug(message, context)

export const setUserContext = (userId: string, email?: string, additionalData?: Record<string, any>) =>
  errorLogger.setUser(userId, email, additionalData)

export const clearUserContext = () => errorLogger.clearUser()

export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug',
  data?: Record<string, any>
) => errorLogger.addBreadcrumb(message, category, level, data)
