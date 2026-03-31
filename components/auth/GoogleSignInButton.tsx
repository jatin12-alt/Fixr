'use client'

import React from 'react'
import { signInWithGoogle } from '@/lib/firebase-auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const idToken = await signInWithGoogle()
      const user = auth.currentUser

      if (!user) throw new Error('Failed to get user information')
      
      // Store token in cookie
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      // Sync user to database
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      })

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Google sign in error:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please allow pop-ups and try again.')
      } else {
        setError(err.message || 'Failed to sign in with Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-900 font-semibold rounded-lg transition border border-gray-200"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M8.477 12c0-.78.07-1.535.184-2.268H4v4.286h5.137c-.266 1.37-.9 2.53-1.91 3.296v2.637h3.09c1.8-1.657 2.84-4.097 2.84-6.95 0-.62-.054-1.22-.15-1.802H12v2.802h3.285a3.583 3.583 0 0 1-1.585 2.347v2.637h3.09c1.8-1.657 2.84-4.097 2.84-6.95z"/>
            <path fill="#FBBC04" d="M4 20v-5.286h3.09a3.583 3.583 0 0 0 1.91-3.296H4V8.132h5.137c.266-1.37.9-2.53 1.91-3.296V2.2H8.957C7.157 3.857 6.117 6.297 6.117 12c0 .62.054 1.22.15 1.802H4z"/>
            <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.09-2.637a4.321 4.321 0 0 1-2.04.546c-1.334 0-2.478-.356-3.255-.993H4v2.802C5.92 22.268 8.72 23 12 23z"/>
            <path fill="#34A853" d="M8.477 12c0-.78.07-1.535.184-2.268H4v4.286h5.137c-.266 1.37-.9 2.53-1.91 3.296H4V20c1.92 1.732 4.72 2.802 8 2.802 2.97 0 5.46-.98 7.28-2.66l-3.09-2.637a4.321 4.321 0 0 1-2.04.546c-1.334 0-2.478-.356-3.255-.993"/>
          </svg>
        )}
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
    </div>
  )
}
