'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorContextType {
  reportError: (error: Error, context?: Record<string, any>) => void
  reportInfo: (message: string, context?: Record<string, any>) => void
  reportWarning: (message: string, context?: Record<string, any>) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

interface ErrorProviderProps {
  children: ReactNode
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const router = useRouter()
  
  const reportError = useCallback((error: Error, context: Record<string, any> = {}) => {
    console.error('Application Error:', error, context)
    
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
    
    // Send to logging service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(console.error)
    }
    
    // Show user-friendly error message
    // You can integrate with a toast library here
    console.log('Error reported with ID:', errorData.errorId)
  }, [])
  
  const reportInfo = useCallback((message: string, context: Record<string, any> = {}) => {
    console.info('Application Info:', message, context)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', message, context)
    }
  }, [])
  
  const reportWarning = useCallback((message: string, context: Record<string, any> = {}) => {
    console.warn('Application Warning:', message, context)
    
    const warningData = {
      level: 'warning',
      message,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }
    
    // In development, just log
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WARNING]', message, context)
    }
  }, [])

  const value: ErrorContextType = {
    reportError,
    reportInfo,
    reportWarning,
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrorReporting() {
  const context = useContext(ErrorContext)
  
  if (context === undefined) {
    throw new Error('useErrorReporting must be used within an ErrorProvider')
  }
  
  return context
}
