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
    <form onSubmit={handleSignIn} className="space-y-6 w-full">
      {error && (
        <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border border-red-500/20">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Relay Identifier</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-xl text-white placeholder-white/10 focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
          placeholder="identity@sentinel.io"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Secure Key</label>
          <Link href="/forgot-password" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-xl text-white placeholder-white/10 focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary hover:bg-white text-black disabled:opacity-50 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/10"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Synchronize <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  )
}
