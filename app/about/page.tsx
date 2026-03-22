'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Github, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      title: "Innovation First",
      description: "We constantly push the boundaries of what's possible with AI in DevOps automation.",
      icon: "🚀",
    },
    {
      title: "Developer-Centric",
      description: "Every feature is built with developers in mind, focusing on usability and efficiency.",
      icon: "💡",
    },
    {
      title: "Reliability",
      description: "Our systems are built for 99.9% uptime with enterprise-grade security and monitoring.",
      icon: "🛡️",
    },
    {
      title: "Open Source",
      description: "We believe in giving back to the community and supporting open source initiatives.",
      icon: "🌐",
    },
  ]

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
  }

  const neonGradient = {
    background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={neonGradient}>
            ABOUT FIXR
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Building the future of AI-powered DevOps automation, one pipeline at a time
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-12 mb-16 rounded-2xl"
          style={cardStyle}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Our Mission</h2>
          <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
            To eliminate the frustration of pipeline failures and empower development teams
            to focus on what they do best — building amazing software. We believe that AI can
            handle the mundane, repetitive tasks of DevOps, freeing humans to be more creative
            and productive.
          </p>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div style={cardStyle} className="p-6 text-center h-full"
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  <div className="text-3xl mb-3">{value.icon}</div>
                  <h3 className="text-base font-bold mb-3" style={{ color: '#00d4ff' }}>{value.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Meet the Team</h2>
          <div className="flex justify-center">
            <div style={{ ...cardStyle, maxWidth: '360px', width: '100%' }} className="p-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)' }}
              >
                <span className="text-white font-bold text-2xl">JD</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Jatin Dongre</h3>
              <p className="text-sm mb-4" style={{ color: '#00d4ff' }}>Founder & CEO</p>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Full-stack developer and AI enthusiast passionate about automating DevOps workflows.
              </p>
              <div className="flex justify-center gap-4">
                <a href="https://github.com/jatin12-alt" target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/in/jatin-dongre-6a13a3294" target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center rounded-2xl p-12"
          style={cardStyle}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Join Our Mission</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Ready to transform your DevOps workflow? Start your free trial today.
          </p>
          <Link href="/sign-up">
            <Button size="lg">Start Free Trial</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
