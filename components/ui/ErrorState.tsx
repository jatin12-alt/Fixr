import React from 'react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  retryLabel?: string
  dismissLabel?: string
  error?: Error | null
  className?: string
}

/**
 * ErrorState Component
 * 
 * A reusable error state component for failed data fetches and operations.
 * Use this for consistent error handling across the application.
 * 
 * @example
 * <ErrorState
 *   title="Failed to load repositories"
 *   message="There was an error loading your repositories. Please try again."
 *   onRetry={() => fetchRepositories()}
 * />
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  error,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-4',
        className
      )}
      data-testid="error-state"
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className="mb-4 text-red-500 dark:text-red-400">
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-2">
        {message}
      </p>

      {/* Error Details (for development) */}
      {error && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-sm overflow-auto">
          <p className="text-xs text-red-600 dark:text-red-400 font-mono">
            {error.message}
          </p>
          {error.stack && (
            <pre className="mt-2 text-xs text-red-500 dark:text-red-400 font-mono whitespace-pre-wrap">
              {error.stack.split('\n').slice(1, 4).join('\n')}
            </pre>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              'inline-flex items-center justify-center',
              'px-4 py-2 rounded-lg',
              'bg-cyan-500 hover:bg-cyan-600',
              'text-white font-medium text-sm',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2'
            )}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {retryLabel}
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'inline-flex items-center justify-center',
              'px-4 py-2 rounded-lg',
              'border border-slate-300 dark:border-slate-600',
              'text-slate-700 dark:text-slate-300 font-medium text-sm',
              'hover:bg-slate-50 dark:hover:bg-slate-800',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
            )}
          >
            {dismissLabel}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Compact error state for inline use (e.g., in cards, lists)
 */
export function ErrorStateCompact({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        'p-4 rounded-lg',
        'bg-red-50 dark:bg-red-900/20',
        'border border-red-200 dark:border-red-800',
        className
      )}
      data-testid="error-state-compact"
      role="alert"
    >
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <p className="text-sm text-red-700 dark:text-red-300 flex-1">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'text-sm font-medium',
            'text-red-600 dark:text-red-400',
            'hover:text-red-700 dark:hover:text-red-300',
            'focus:outline-none focus:underline'
          )}
        >
          Retry
        </button>
      )}
    </div>
  )
}

/**
 * Error state for toast notifications
 */
export function ErrorToast({
  message,
  onClose,
}: {
  message: string
  onClose?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        'p-4 rounded-lg',
        'bg-red-50 dark:bg-red-900/20',
        'border border-red-200 dark:border-red-800',
        'shadow-lg'
      )}
      role="alert"
    >
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Error
        </p>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
