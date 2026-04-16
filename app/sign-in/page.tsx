'use client'

import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { Button } from '@/components/ui/button'
import { Github, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { EmailPasswordSignIn } from '@/components/auth/EmailPasswordSignIn'
import Link from 'next/link'

export default function SignInPage() {
  const { signInWithGithub, loading } = useAuth()

  const features = [
    "Real-time collaboration",
    "Project analytics",
    "One-click deployments"
  ]

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] font-sans selection:bg-primary selection:text-black">
      {/* Left Panel (45% width) - Premium Obsidian */}
      <div className="hidden lg:flex w-[45%] bg-[#0e0e11] text-white p-16 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="relative z-10">
          <Link href="/" className="inline-block group">
            <span className="text-3xl font-black tracking-tighter text-glow group-hover:text-primary transition-colors">FIXR</span>
          </Link>
          
          <div className="mt-[16vh] max-w-[400px]">
            <span className="text-[11px] font-black tracking-[0.4em] text-primary/40 uppercase mb-8 block">Protocol Access</span>
            <h2 className="text-[64px] font-black mb-8 tracking-tighter leading-[0.85] text-white">
              Welcome <br /><span className="text-white/10 italic">Back.</span>
            </h2>
            <p className="text-[18px] text-white/40 mb-12 font-medium italic border-l border-primary/20 pl-8">
              "Your telemetry metrics and architectural nodes await synchronization. Re-establish your secure link."
            </p>
            
            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 text-white/60 group">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all">
                    <CheckCircle2 className="h-3 w-3 text-white/20 group-hover:text-black" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/5">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
            Verified Sentinel Engine v4.0.2
          </p>
        </div>

        {/* Subtle dot grid for texture */}
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none" />
      </div>

      {/* Right Panel (55% width) - Interactive Terminal */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-16 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] blur-[120px] pointer-events-none rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-black tracking-tighter text-glow group-hover:text-primary transition-colors">FIXR</span>
            </Link>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter leading-none">Sign in to <span className="text-white/10 italic">Fixr.</span></h1>
            <p className="text-sm text-white/30 font-medium">
              New to the protocol? <Link href="/sign-up" className="text-primary font-black uppercase tracking-widest text-[11px] hover:text-white transition-colors ml-2">Initialize Account</Link>
            </p>
          </div>

          <div className="space-y-8">
            <EmailPasswordSignIn />
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
                <span className="bg-[#0a0a0a] px-6 text-white/20">Neural Relay</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={signInWithGithub}
                disabled={loading}
                variant="outline"
                className="h-14 font-black uppercase tracking-[0.15em] text-[10px] border-white/5 bg-white/5 hover:bg-primary hover:text-black transition-all rounded-xl shadow-2xl"
              >
                <Github className="w-4 h-4 mr-3" />
                GitHub
              </Button>
              <GoogleSignInButton customClass="h-14 font-black uppercase tracking-[0.15em] text-[10px] border-white/5 bg-white/5 hover:bg-primary hover:text-black transition-all rounded-xl shadow-2xl" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
