'use client'

import { useEffect, useState, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import { onIdTokenChanged, User } from 'firebase/auth'

/**
 * Sentinel useAuth Hook
 * Manages identity state, token synchronization, and proactive rotation.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const syncToken = useCallback(async (user: User | null) => {
    if (user) {
      const idToken = await user.getIdToken()
      // Update secure cookie for SSR/Middleware/SSE
      document.cookie = `firebase_token=${idToken}; path=/; max-age=3600; SameSite=Lax; Secure`
      
      // Notify backend of token sync
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, email: user.email })
        })
      } catch (e) {
        console.error('[Sentinel Auth] Sync failed:', e)
      }
    } else {
      document.cookie = 'firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser)
      await syncToken(currentUser)
      setLoading(false)
    })

    // Proactive background refresh every 45 minutes
    const refreshInterval = setInterval(async () => {
      if (auth.currentUser) {
        console.log('[Sentinel Auth] Rotating identity tokens...')
        await auth.currentUser.getIdToken(true)
      }
    }, 1000 * 60 * 45) // 45 minutes

    return () => {
      unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [syncToken])

  return { user, loading, authenticated: !!user }
}
