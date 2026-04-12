'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
  const reviews = [
    {
      name: "SARAH CHEN",
      role: "PRINCIPAL ENGINEER / TECHCORP",
      avatar: "SC",
      rating: 5,
      review: "Sentinel has completely transformed our CI/CD architecture. We've reduced entropy by 90% through autonomous resolution protocols. Precise results.",
    },
    {
      name: "MARCUS JOHNSON",
      role: "CTO / INFRASTRUX",
      avatar: "MJ",
      rating: 5,
      review: "The auto-resolution engine is a game changer for deployment scaling. Our team focuses on architectural drift instead of debugging logs.",
    },
    {
      name: "PRIYA PATEL",
      role: "SITE RELIABILITY / CLOUDNATIVE",
      avatar: "PP",
      rating: 5,
      review: "Setup was zero-latency. The real-time telemetry mesh provides unparalleled visibility into our structural integrity.",
    },
    {
      name: "ALEX RODRIGUEZ",
      role: "LEAD ARCHITECT / FLOWDATA",
      avatar: "AR",
      rating: 5,
      review: "Autonomous synthesis of build failures has reduced our iteration cycle by 40%. The Sentinel platform is mission-critical.",
    },
    {
      name: "EMILY ZHANG",
      role: "ENGINEERING VP / SCALENET",
      avatar: "EZ",
      rating: 5,
      review: "The telemetry decks are luminous. Productivity increased immediately upon stack deployment. Standardized resolution achieved.",
    },
    {
      name: "DAVID KIM",
      role: "CORE DEV / INNOVATELAB",
      avatar: "DK",
      rating: 5,
      review: "Proprietary AI synthesis at its finest. The manual staging workflow for edge-case resolution provides total control with zero overhead.",
    },
  ]

  const stats = [
    { label: "Neural Precision", value: "99.2%" },
    { label: "Entropy Reduced", value: "15M+ ops" },
    { label: "Systems Fixed", value: "2.5K+" },
    { label: "Active Nodes", value: "500+" },
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      <div className="container mx-auto px-6 pt-40 pb-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-32 relative z-10"
        >
          <span className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-6 block text-glow">Telemetry Verification</span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-12">
            Verified <br />
            <span className="text-white/10 italic text-8xl">Protocols.</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed italic border-x border-white/5 px-12">
            "Peer-reviewed testimonials from the architects of global delivery systems."
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 relative z-10"
        >
          {stats.map((stat, i) => (
            <Card key={stat.label} className="p-8 glass-card border-white/5 bg-[#1b1b1f]/20 text-center group hover:bg-white/[0.03] transition-all">
              <div className="text-4xl font-black mb-4 text-white group-hover:text-primary transition-colors text-glow">{stat.value}</div>
              <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] font-black">{stat.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="p-10 h-full flex flex-col glass-card border-white/5 bg-[#1b1b1f]/20 hover:bg-white/[0.03] hover:border-primary/20 transition-all duration-700 group">
                <div className="flex mb-8 gap-1.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-primary fill-primary shadow-glow" />
                  ))}
                </div>
                <p className="text-white/40 text-[15px] leading-relaxed flex-1 mb-10 italic font-medium group-hover:text-white/60 transition-colors">"{review.review}"</p>
                <div className="flex items-center gap-6 border-t border-white/5 pt-8">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-primary/40 transition-all">
                    <span className="text-white/30 font-black text-xs tracking-tighter group-hover:text-primary transition-colors">{review.avatar}</span>
                  </div>
                  <div>
                    <div className="font-black text-white text-[11px] uppercase tracking-[0.2em] mb-1">{review.name}</div>
                    <div className="text-[10px] text-white/10 font-bold tracking-widest">{review.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
