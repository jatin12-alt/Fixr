'use client'

import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { Button } from '@/components/ui/button'
import { Github, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { EmailPasswordSignUp } from '@/components/auth/EmailPasswordSignUp'
import Link from 'next/link'

export default function SignUpPage() {
  const { signInWithGithub, loading } = useAuth()

  const features = [
    "Real-time collaboration",
    "Project analytics",
    "One-click deployments"
  ]

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-black selection:text-white">
      {/* Left Panel (45% width, black bg #000) */}
      <div className="hidden lg:flex w-[45%] bg-[#000] text-white p-[40px] flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="text-[24px] font-extrabold tracking-[-0.04em]">FIXR</span>
          </Link>
          
          <div className="mt-[16vh] max-w-[400px]">
            <h2 className="text-[48px] font-extrabold mb-[12px] tracking-tight leading-[1.1]">
              Start building together.
            </h2>
            <p className="text-[16px] text-white/60 mb-[48px] font-medium">
              Join 2,000+ teams shipping faster.
            </p>
            
            <div className="space-y-[20px]">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-[12px] text-white">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                  </div>
                  <span className="font-semibold text-[15px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[13px] font-medium text-white/40 uppercase tracking-widest">
            Trusted by 2,000+ teams
          </p>
        </div>

        {/* Subtle dot grid for texture */}
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
      </div>

      {/* Right Panel (55% width, white bg #fff) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-[40px] bg-white">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4 }}
           className="w-full max-w-[400px]"
        >
          <div className="mb-[40px]">
            <h1 className="text-[28px] font-bold text-[#0a0a0a] mb-2 tracking-tight">Create your account</h1>
            <p className="text-[14px] text-[#525252] font-medium">
              Already have an account? <Link href="/sign-in" className="text-black font-bold underline underline-offset-4 decoration-[#e5e5e5] hover:decoration-black transition-all">Sign in</Link>
            </p>
          </div>

          <div className="space-y-6">
            <EmailPasswordSignUp />
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e5e5e5]"></span>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-black">
                <span className="bg-white px-4 text-[#a3a3a3]">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={signInWithGithub}
                disabled={loading}
                variant="outline"
                className="h-[44px] font-bold border-[#e5e5e5] hover:bg-[#f5f5f5]"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <GoogleSignInButton customClass="h-[44px] font-bold border-[#e5e5e5] hover:bg-[#f5f5f5]" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
