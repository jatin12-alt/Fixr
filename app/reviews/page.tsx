'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
  const reviews = [
    {
      name: "Sarah Chen",
      role: "DevOps Engineer at TechCorp",
      avatar: "SC",
      rating: 5,
      color: "from-blue-500 to-cyan-400",
      review: "Fixr has completely transformed our CI/CD pipeline. We've reduced our failure resolution time from hours to minutes. The AI suggestions are incredibly accurate.",
    },
    {
      name: "Marcus Johnson",
      role: "CTO at StartupXYZ",
      avatar: "MJ",
      rating: 5,
      color: "from-purple-500 to-violet-400",
      review: "The auto-fix feature is a game changer. Our team can focus on building features instead of debugging pipeline failures. ROI was immediate.",
    },
    {
      name: "Priya Patel",
      role: "Senior Developer at CloudTech",
      avatar: "PP",
      rating: 5,
      color: "from-green-500 to-emerald-400",
      review: "Love the real-time monitoring and GitHub integration. Setup was incredibly easy and the dashboard provides great insights into our pipeline health.",
    },
    {
      name: "Alex Rodriguez",
      role: "Lead Engineer at DataFlow",
      avatar: "AR",
      rating: 5,
      color: "from-orange-500 to-yellow-400",
      review: "Fixr caught issues we didn't even know existed. The AI analysis is spot-on and has helped us improve our code quality significantly.",
    },
    {
      name: "Emily Zhang",
      role: "DevOps Manager at ScaleUP",
      avatar: "EZ",
      rating: 5,
      color: "from-pink-500 to-rose-400",
      review: "The time savings alone justify the cost. Our team productivity has increased by 40% since implementing Fixr. Highly recommended!",
    },
    {
      name: "David Kim",
      role: "Full Stack Developer at InnovateLab",
      avatar: "DK",
      rating: 5,
      color: "from-cyan-500 to-blue-400",
      review: "Brilliant tool! The automated fixes work perfectly for common issues, and the manual approval workflow gives us control when needed.",
    },
  ]

  const stats = [
    { label: "Average Rating", value: "4.9/5" },
    { label: "Time Saved", value: "15K+ hrs" },
    { label: "Issues Fixed", value: "2.5K+" },
    { label: "Happy Users", value: "500+" },
  ]

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container mx-auto px-6 pt-24 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            LOVED BY DEVELOPERS
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See what developers and DevOps teams are saying about Fixr
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} style={cardStyle} className="text-center p-6">
              <div className="text-3xl font-bold mb-1" style={{ color: '#00d4ff' }}>{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div style={cardStyle} className="p-6 h-full flex flex-col"
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.25)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                {/* Stars */}
                <div className="flex mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                {/* Review */}
                <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-5">"{review.review}"</p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xs">{review.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{review.name}</div>
                    <div className="text-xs text-gray-500">{review.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
