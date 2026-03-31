import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { useCallback } from 'react'

export function useAuthFetcher() {
  const { user } = useAuth()

  const fetcher = useCallback(async (url: string) => {
    if (!user) {
      throw new Error('Not authenticated')
    }

    const idToken = await user.getIdToken()
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An unknown error occurred' }))
      throw new Error(error.error || 'Failed to fetch data')
    }

    return response.json()
  }, [user])

  return fetcher
}
