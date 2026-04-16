import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  repoName?: string
  repoId?: string
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const { user } = useAuth()
  const userId = user?.uid
  const isSignedIn = !!user
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/notifications?limit=50', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [user])

  // Connect to SSE stream
  const connectStream = useCallback(() => {
    if (!user) return

    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onopen = () => {
      setIsConnected(true)
      setReconnectAttempts(0)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'connected') return

        setNotifications(prev => [data, ...prev])
        if (!data.read) {
          setUnreadCount(prev => prev + 1)
        }
      } catch (error) {
        console.error('Sentinel Monitor: Parse failure:', error)
      }
    }

    eventSource.onerror = async () => {
      setIsConnected(false)
      eventSource.close()

      // On error, check if the token is the culprit by forcing a refresh
      try {
        console.log('Sentinel Monitor: Pulsing identity for reconnection...')
        await user.getIdToken(true)
      } catch (e) {
        console.error('Sentinel Monitor: Identity pulse failed:', e)
      }

      // Exponential backoff reconnection
      setReconnectAttempts(prev => {
        const next = prev + 1
        if (next <= 5) {
          const delay = Math.min(1000 * Math.pow(2, prev), 30000)
          setTimeout(() => {
            connectStream()
          }, delay)
        }
        return next
      })
    }

    return eventSource
  }, [user]) // Removed reconnectAttempts

  // Mark notification as read
  const markAsRead = useCallback(async (ids: string[]) => {
    if (!user) return

    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ ids }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - ids.length))
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }, [user])

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    if (!user) return

    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ all: true }),
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [user])

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (isSignedIn && user) {
      fetchNotifications()
      const eventSource = connectStream()

      return () => {
        if (eventSource) {
          eventSource.close()
        }
      }
    }
  }, [isSignedIn, user, fetchNotifications, connectStream])

  return {
    notifications: notifications.filter(n => !dismissedIds.has(n.id)),
    unreadCount,
    isConnected,
    markAsRead,
    markAllRead,
    dismissNotification,
    refetch: fetchNotifications,
  }
}
