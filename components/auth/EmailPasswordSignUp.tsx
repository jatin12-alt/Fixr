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
    <form onSubmit={handleSignUp} className="space-y-[20px] w-full">
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
        <label className="block text-[13px] font-medium text-[#0a0a0a]">Create Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-[44px] px-4 bg-white border border-[#e5e5e5] rounded-[6px] text-black placeholder-[#a3a3a3] focus:border-black focus:outline-none transition-all"
          placeholder="Min. 6 characters"
          required
        />
      </div>

      <div className="space-y-[6px]">
        <label className="block text-[13px] font-medium text-[#0a0a0a]">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-[44px] px-4 bg-white border border-[#e5e5e5] rounded-[6px] text-black placeholder-[#a3a3a3] focus:border-black focus:outline-none transition-all"
          placeholder="Repeat password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-[44px] bg-black hover:bg-black/90 disabled:opacity-50 text-white font-bold rounded-[6px] transition flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
      </button>
    </form>
  )
}
