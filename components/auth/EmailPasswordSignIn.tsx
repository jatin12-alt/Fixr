'use client'

import React, { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowRight } from 'lucide-react'

export function EmailPasswordSignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // Store token in cookie
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      // Sync user
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        }),
      })

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Sign in error:', err)
      if (err.code === 'auth/user-not-found') {
        setError('User not found. Please sign up first.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.')
      } else {
        setError(err.message || 'Failed to sign in')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-[24px] w-full">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}
      
      <div className="space-y-[6px]">
        <label className="block text-[13px] font-medium text-[#0a0a0a]">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-[44px] px-4 bg-white border border-[#e5e5e5] rounded-[6px] text-black placeholder-[#a3a3a3] focus:border-black focus:outline-none transition-all"
          placeholder="name@company.com"
          required
        />
      </div>

      <div className="space-y-[6px]">
        <div className="flex justify-between items-center">
          <label className="block text-[13px] font-medium text-[#0a0a0a]">Password</label>
          <Link href="/forgot-password" size="sm" className="text-[13px] text-[#525252] hover:text-black">
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-[44px] px-4 bg-white border border-[#e5e5e5] rounded-[6px] text-black placeholder-[#a3a3a3] focus:border-black focus:outline-none transition-all"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-[44px] bg-black hover:bg-black/90 disabled:opacity-50 text-white font-bold rounded-[6px] transition flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  )
}
