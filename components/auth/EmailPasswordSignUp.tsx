'use client'

import React, { useState } from 'react'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'

export function EmailPasswordSignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // Store token
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      // Create user in database
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
      console.error('Sign up error:', err)
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please sign in instead.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.')
      } else {
        setError(err.message || 'Failed to sign up')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-6 w-full">
      {error && (
        <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Protocol Identifier</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-xl text-white placeholder-white/10 focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
          placeholder="name@sentinel.io"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Initialization Key</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-xl text-white placeholder-white/10 focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
          placeholder="Min. 8 characters suggested"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Verify Key</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-12 px-4 bg-white/5 border border-white/5 rounded-xl text-white placeholder-white/10 focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
          placeholder="Repeat initialization key"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary hover:bg-white text-black disabled:opacity-50 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/10"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  )
}
