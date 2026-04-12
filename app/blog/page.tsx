'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import { TiltCard } from '@/components/ui/TiltCard'

export default function BlogPage() {
  const posts = [
    {
      title: "The Zero-Touch Evolution",
      excerpt: "Structural transition from passive monitoring to autonomous resolution protocols in global delivery architectures.",
      date: "04.08.26",
      readTime: "06 MIN",
      author: "J. DONGRE",
      category: "PERSPECTIVE"
    },
    {
      title: "Neural Determinism in Infrastructure",
      excerpt: "Semantic reasoning vs LLM inference: The requirement for static execution graphs in high-availability CI/CD.",
      date: "03.22.26",
      readTime: "12 MIN",
      author: "CORE ENG.",
      category: "TECHNICAL"
    },
    {
      title: "Announcing Pro Modular Tier",
      excerpt: "Deployment of the Sentinel-3 Engine. Advanced repository mesh, enterprise SSO, and prioritized telemetry tunnels.",
      date: "02.14.26",
      readTime: "04 MIN",
      author: "PRODUCT AD.",
      category: "LOGISTICS"
    }
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      <div className="max-w-[1120px] mx-auto px-10 pt-[160px] pb-[120px] relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mb-32 relative">
          <span className="text-[12px] font-black text-primary uppercase tracking-[0.4em] mb-6 block text-glow">Signal Stream</span>
          <h1 className="text-[clamp(48px,8vw,96px)] font-black text-white tracking-tighter leading-[0.9] mb-12">
            Sentinel <span className="text-white/10 italic">Pulse.</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed italic border-l border-primary/20 pl-8">
            Technical perspectives, architectural deep-dives, and system deployment announcements from the core synchronization team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <TiltCard>
                <Card className="p-10 glass-card border-white/5 rounded-[40px] bg-[#1b1b1f]/20 h-full flex flex-col justify-between hover:border-primary/30 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div>
                    <div className="flex items-center justify-between mb-10">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-full shadow-glow">{post.category}</span>
                      <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:border-primary transition-all duration-500">
                        <ArrowUpRight size={18} />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-6 tracking-tight leading-tight group-hover:text-glow transition-all">{post.title}</h2>
                    <p className="text-[15px] text-white/30 font-medium leading-relaxed mb-12 line-clamp-3 italic">
                      {post.excerpt}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-10">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{post.author}</span>
                      <span className="text-[10px] font-bold text-white/20 tracking-widest">{post.date}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-colors">{post.readTime}</span>
                  </div>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
