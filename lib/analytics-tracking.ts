export interface AnalyticsEvent {
  action: string
  category?: string
  label?: string
  value?: number
}

/**
 * Track custom analytics events
 * Uses Vercel Analytics custom events
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  // Only track in production or when analytics is enabled
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === '1') {
    try {
      // Vercel Analytics automatically tracks page views
      // For custom events, we can use their API
      // Note: Custom events might require Vercel Analytics Pro
      
      // For now, we'll log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('📊 Analytics Event:', event)
      }
      
      // TODO: Implement custom event tracking with Vercel Analytics Pro
      // or integrate with Plausible/Google Analytics if needed
      
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }
}

/**
 * Predefined analytics events for Fixr
 */
export const AnalyticsEvents = {
  // Authentication events
  USER_SIGNED_IN: {
    action: 'user_signed_in',
    category: 'authentication',
    label: 'GitHub OAuth',
  },
  USER_SIGNED_UP: {
    action: 'user_signed_up',
    category: 'authentication',
    label: 'GitHub OAuth',
  },
  
  // Repository events
  REPOSITORY_CONNECTED: {
    action: 'repository_connected',
    category: 'repository',
    label: 'GitHub Integration',
  },
  REPOSITORY_DISCONNECTED: {
    action: 'repository_disconnected',
    category: 'repository',
    label: 'GitHub Integration',
  },
  
  // Pipeline events
  PIPELINE_FAILURE_DETECTED: {
    action: 'pipeline_failure_detected',
    category: 'pipeline',
    label: 'AI Detection',
  },
  AI_ANALYSIS_TRIGGERED: {
    action: 'ai_analysis_triggered',
    category: 'pipeline',
    label: 'AI Processing',
  },
  AUTO_FIX_APPLIED: {
    action: 'auto_fix_applied',
    category: 'pipeline',
    label: 'AI Fix',
  },
  
  // Team events
  TEAM_CREATED: {
    action: 'team_created',
    category: 'team',
    label: 'Collaboration',
  },
  MEMBER_INVITED: {
    action: 'member_invited',
    category: 'team',
    label: 'Collaboration',
  },
  
  // Analytics events
  ANALYTICS_VIEWED: {
    action: 'analytics_viewed',
    category: 'analytics',
    label: 'Dashboard',
  },
  
  // Pricing events
  PRICING_VIEWED: {
    action: 'pricing_viewed',
    category: 'pricing',
    label: 'Conversion',
  },
  
  // Notification events
  NOTIFICATION_CLICKED: {
    action: 'notification_clicked',
    category: 'notification',
    label: 'Engagement',
  },
  EMAIL_PREFERENCES_UPDATED: {
    action: 'email_preferences_updated',
    category: 'notification',
    label: 'Settings',
  },
  
  // Feature usage
  WEBHOOK_TESTED: {
    action: 'webhook_tested',
    category: 'feature',
    label: 'GitHub Integration',
  },
  EXPORT_DOWNLOADED: {
    action: 'export_downloaded',
    category: 'feature',
    label: 'Data Export',
  },
} as const

/**
 * Track repository connection
 */
export const trackRepositoryConnected = (repoName: string): void => {
  trackEvent({
    ...AnalyticsEvents.REPOSITORY_CONNECTED,
    label: repoName,
  })
}

/**
 * Track AI analysis
 */
export const trackAIAnalysis = (repoName: string, success: boolean): void => {
  trackEvent({
    ...AnalyticsEvents.AI_ANALYSIS_TRIGGERED,
    label: `${repoName} - ${success ? 'Success' : 'Failed'}`,
  })
}

/**
 * Track auto-fix application
 */
export const trackAutoFixApplied = (repoName: string, fixType: string): void => {
  trackEvent({
    ...AnalyticsEvents.AUTO_FIX_APPLIED,
    label: `${repoName} - ${fixType}`,
  })
}

/**
 * Track team creation
 */
export const trackTeamCreated = (teamName: string): void => {
  trackEvent({
    ...AnalyticsEvents.TEAM_CREATED,
    label: teamName,
  })
}

/**
 * Track pricing page view
 */
export const trackPricingViewed = (): void => {
  trackEvent(AnalyticsEvents.PRICING_VIEWED)
}

/**
 * Track analytics dashboard view
 */
export const trackAnalyticsViewed = (): void => {
  trackEvent(AnalyticsEvents.ANALYTICS_VIEWED)
}

/**
 * Track notification engagement
 */
export const trackNotificationClicked = (notificationType: string): void => {
  trackEvent({
    ...AnalyticsEvents.NOTIFICATION_CLICKED,
    label: notificationType,
  })
}

/**
 * Generic event tracker for custom events
 */
export const trackCustomEvent = (
  action: string,
  category?: string,
  label?: string,
  value?: number
): void => {
  trackEvent({
    action,
    category,
    label,
    value,
  })
}
