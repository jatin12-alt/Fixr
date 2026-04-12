'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PolicyPageProps {
  title: string
  subtitle: string
  lastUpdated: string
  children: React.ReactNode
}

export default function PolicyPage({ title, subtitle, lastUpdated, children }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/[0.03] blur-[150px] pointer-events-none" />
      <div className="max-w-[1120px] mx-auto px-10 pt-[200px] pb-[120px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-32"
        >
          <span className="text-[11px] font-black text-primary/40 uppercase tracking-[0.5em] mb-6 block text-glow">Legal Architecture</span>
          <h1 className="text-[clamp(48px,8vw,120px)] font-black text-white tracking-tighter mb-12 leading-[0.85]">{title}<span className="text-white/10 italic">Core.</span></h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-16">
            <p className="text-2xl text-white/40 max-w-2xl font-medium leading-relaxed italic">
              "{subtitle}"
            </p>
            <div className="shrink-0 text-[10px] font-black uppercase tracking-[0.3em] text-white/10 mb-2 border border-white/10 px-4 py-2 rounded-full h-fit">
              Last Sync: {lastUpdated}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-3xl space-y-16"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
