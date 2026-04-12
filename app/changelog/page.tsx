'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GitCommit, Zap, Shield, Sparkles } from 'lucide-react'

export default function ChangelogPage() {
  const entries = [
    {
      version: "v2.4.0",
      date: "April 10, 2026",
      title: "Sentinel Vision Integration",
      desc: "Upgraded our analysis engine with visual correlation. The engine can now analyze screenshot diffs from UI tests to pinpoint failures.",
      type: "feature",
      icon: Sparkles
    },
    {
      version: "v2.3.5",
      date: "March 28, 2026",
      title: "Concurrent Triage Improvements",
      desc: "Increased engine throughput by 45%. You can now process up to 20 failure diagnostics simultaneously per project.",
      type: "performance",
      icon: Zap
    },
    {
      version: "v2.3.0",
      date: "March 15, 2026",
      title: "OAuth Scoping Refactor",
      desc: "Reduced GitHub permission scopes to the absolute minimum required for pipeline monitoring. Enhanced security for enterprise teams.",
      type: "security",
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      <div className="max-w-[1120px] mx-auto px-10 pt-[160px] pb-[120px] relative z-10">
        <div className="mb-24">
          <span className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4 block text-glow">Engine Evolution</span>
          <h1 className="text-[clamp(40px,7vw,80px)] font-black text-white tracking-tighter leading-[1.0] mb-8">
            Changelog.
          </h1>
          <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed italic">
            Every update to the Sentinel Engine is a step toward a world with 
            zero-manual infrastructure maintenance.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[14px] top-6 bottom-6 w-[1px] bg-white/10" />

          <div className="space-y-24">
            {entries.map((entry, i) => (
              <motion.div 
                key={entry.version}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-12 group"
              >
                {/* Dot */}
                <div className="absolute left-0 top-1.5 w-[30px] h-[30px] bg-[#1b1b1f] border border-white/20 group-hover:border-primary rounded-full flex items-center justify-center z-10 transition-colors duration-500">
                   <div className="w-2.5 h-2.5 bg-white/40 group-hover:bg-primary rounded-full transition-colors duration-500" />
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-24">
                  <div className="shrink-0 pt-2">
                    <span className="text-[11px] font-black p-2 bg-white/5 border border-white/10 rounded-md tracking-widest text-[#e5e1e7] block mb-2">{entry.version}</span>
                    <span className="text-[11px] font-bold text-white/40">{entry.date}</span>
                  </div>

                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <entry.icon size={20} className="text-primary" />
                        <h2 className="text-2xl font-black text-white tracking-tight">{entry.title}</h2>
                    </div>
                    <p className="text-white/60 font-medium leading-[1.8] text-[15px]">
                      {entry.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
