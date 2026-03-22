import React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

/**
 * EmptyState Component
 * 
 * A reusable empty state component for lists and pages with no data.
 * Use this for consistent empty states across the application.
 * 
 * @example
 * <EmptyState
 *   icon={<RepositoryIcon className="w-12 h-12" />}
 *   title="No repositories connected"
 *   description="Connect your first repository to start monitoring CI/CD pipelines."
 *   actionLabel="Connect Repository"
 *   onAction={() => openConnectModal()}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-4',
        className
      )}
      data-testid="empty-state"
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && (actionHref || onAction) && (
          <>
            {actionHref ? (
              <a
                href={actionHref}
                className={cn(
                  'inline-flex items-center justify-center',
                  'px-4 py-2 rounded-lg',
                  'bg-cyan-500 hover:bg-cyan-600',
                  'text-white font-medium text-sm',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2'
                )}
              >
                {actionLabel}
              </a>
            ) : (
              <button
                onClick={onAction}
                className={cn(
                  'inline-flex items-center justify-center',
                  'px-4 py-2 rounded-lg',
                  'bg-cyan-500 hover:bg-cyan-600',
                  'text-white font-medium text-sm',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2'
                )}
              >
                {actionLabel}
              </button>
            )}
          </>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
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
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Pre-configured empty states for common scenarios
 */

export function EmptyRepositories(props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      }
      title="No repositories connected"
      description="Connect your first repository to start monitoring CI/CD pipelines and receive AI-powered fix suggestions."
      {...props}
    />
  )
}

export function EmptyPipelineRuns(props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      }
      title="Waiting for first pipeline run"
      description="Trigger a build in your connected repository to see pipeline data here."
      {...props}
    />
  )
}

export function EmptyNotifications(props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      }
      title="You're all caught up!"
      description="No new notifications. We'll let you know when something important happens."
      {...props}
    />
  )
}

export function EmptyTeamMembers(props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      }
      title="No team members yet"
      description="Invite your first teammate to collaborate on CI/CD monitoring and fix management."
      {...props}
    />
  )
}

export function EmptyAuditLogs(props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      }
      title="No activity yet"
      description="Audit logs will appear here once team members start performing actions."
      {...props}
    />
  )
}
