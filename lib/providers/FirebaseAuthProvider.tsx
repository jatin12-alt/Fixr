'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  onIdTokenChanged, 
  User as FirebaseUser,
  signInWithPopup,
  GithubAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  signInWithGithub: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGithub: async () => {},
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    let refreshTimer: NodeJS.Timeout
    
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      console.log('Sentinel Auth: State changed for node:', user?.uid)
      
      if (user) {
        setUser(user)
        try {
          // Get token and update cookie
          const tokenResult = await user.getIdTokenResult()
          const idToken = tokenResult.token
          
          document.cookie = `firebase_token=${idToken}; path=/; max-age=3600; SameSite=Lax`
          
          // Proactive refresh: Schedule refresh 5 minutes before expiry
          const expirationTime = new Date(tokenResult.expirationTime).getTime()
          const currentTime = new Date().getTime()
          const delay = expirationTime - currentTime - 300000 // 5 minutes before
          
          if (refreshTimer) clearTimeout(refreshTimer)
          if (delay > 0) {
            refreshTimer = setTimeout(async () => {
              console.log('Sentinel Auth: Proactive token rotation triggered')
              await user.getIdToken(true) // Force refresh
            }, delay)
          }

          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            })
          })
        } catch (error) {
          console.error('Sentinel Auth: Synchronization failure:', error)
        }
      } else {
        setUser(null)
        if (refreshTimer) clearTimeout(refreshTimer)
        document.cookie = 'firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
      if (refreshTimer) clearTimeout(refreshTimer)
    }
  }, [])

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      // Clear session cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGithub, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
