'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Bot, Zap, Shield, GitBranch,
  BarChart3, Workflow
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning models analyze pipeline failures with 95% accuracy and suggest intelligent fixes.",
      benefits: ["Pattern recognition", "Smart error detection", "Automated diagnostics", "Learning from history"],
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast Response",
      description: "Sub-second detection with real-time WebSocket updates. Your team knows about issues before they escalate.",
      benefits: ["Real-time monitoring", "Instant notifications", "Zero-delay alerts", "Proactive detection"],
      color: "from-yellow-500 to-orange-400",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade security with encrypted data transmission and audit trails for compliance requirements.",
      benefits: ["End-to-end encryption", "Audit logs", "SOC 2 compliance", "Access controls"],
      color: "from-green-500 to-emerald-400",
    },
    {
      icon: GitBranch,
      title: "GitHub Integration",
      description: "Seamless integration with GitHub repositories, webhooks, and Actions for comprehensive pipeline monitoring.",
      benefits: ["One-click setup", "Webhook automation", "Branch protection", "PR analysis"],
      color: "from-purple-500 to-violet-400",
    },
    {
      icon: Workflow,
      title: "Auto-Fix Deployment",
      description: "Automatically applies fixes for common issues like import errors, dependency problems, and configuration issues.",
      benefits: ["Smart fixes", "Version compatibility", "Rollback safety", "Test validation"],
      color: "from-pink-500 to-rose-400",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with insights into pipeline performance, failure patterns, and team productivity.",
      benefits: ["Performance metrics", "Trend analysis", "Custom reports", "Team insights"],
      color: "from-cyan-500 to-blue-400",
    },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container mx-auto px-6 pt-24 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            POWERFUL FEATURES
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to monitor, analyze, and fix your CI/CD pipelines automatically
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group"
            >
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', height: '100%', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-5 text-sm leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map(b => (
                    <li key={b} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center rounded-2xl p-12"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your DevOps?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have already automated their pipeline monitoring with Fixr
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
