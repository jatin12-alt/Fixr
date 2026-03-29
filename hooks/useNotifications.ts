import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

interface Notification {
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
  const { userId, isSignedIn } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch('/api/notifications?limit=50')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [userId])

  // Connect to SSE stream
  const connectStream = useCallback(() => {
    if (!userId) return

    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onopen = () => {
      setIsConnected(true)
      setReconnectAttempts(0)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'connected') {
          return
        }

        // New notification received
        setNotifications(prev => [data, ...prev])
        if (!data.read) {
          setUnreadCount(prev => prev + 1)
        }
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      eventSource.close()

      // Exponential backoff reconnection
      if (reconnectAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1)
          connectStream()
        }, delay)
      }
    }

    return eventSource
  }, [userId, reconnectAttempts])

  // Mark notification as read
  const markAsRead = useCallback(async (ids: string[]) => {
    if (!userId) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
  }, [userId])

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [userId])

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (isSignedIn && userId) {
      fetchNotifications()
      const eventSource = connectStream()

      return () => {
        if (eventSource) {
          eventSource.close()
        }
      }
    }
  }, [isSignedIn, userId, fetchNotifications, connectStream])

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
