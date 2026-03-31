'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
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
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          const idToken = await user.getIdToken()
          // Set session cookie for middleware
          document.cookie = `firebase_token=${idToken}; path=/; max-age=3600; SameSite=Lax`
          
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
          console.error('Error syncing user:', error)
        }
      } else {
        setUser(null)
        // Clear session cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
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
