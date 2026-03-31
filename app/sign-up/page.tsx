'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { EmailPasswordSignUp } from '@/components/auth/EmailPasswordSignUp'

type SignUpMethod = 'oauth' | 'email'

export default function SignUpPage() {
  const { signInWithGithub, loading } = useAuth()
  const [method, setMethod] = useState<SignUpMethod>('oauth')

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-400 text-lg">
            Join Fixr and automate your pipelines
          </p>
        </div>

        {/* Toggle between OAuth and Email */}
        <div className="flex gap-3 mb-6 bg-gray-900/30 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setMethod('oauth')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              method === 'oauth'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Quick Sign Up
          </button>
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              method === 'email'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Email
          </button>
        </div>

        {method === 'oauth' ? (
          <div className="space-y-3">
            <Button 
              onClick={signInWithGithub}
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-[#24292F] hover:bg-[#24292F]/90 text-white flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Github className="w-5 h-5" />
              Sign Up with GitHub
            </Button>

            <GoogleSignInButton />
          </div>
        ) : (
          <EmailPasswordSignUp />
        )}

        <p className="text-center text-xs text-gray-500 mt-8">
          Already have an account? <a href="/sign-in" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</a>
        </p>
      </motion.div>
    </div>
  )
}
