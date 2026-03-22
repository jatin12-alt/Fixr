'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Github, Webhook, Bot, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      icon: Github,
      title: "Connect GitHub",
      description: "Securely connect your GitHub repositories with one-click OAuth integration",
      details: [
        "OAuth 2.0 secure authentication",
        "Select specific repositories",
        "Automatic webhook configuration",
        "Zero manual setup required",
      ],
      color: "from-blue-500 to-cyan-400",
    },
    {
      number: "02",
      icon: Webhook,
      title: "Monitor Pipelines",
      description: "Real-time monitoring of all your GitHub Actions workflows and CI/CD pipelines",
      details: [
        "24/7 pipeline monitoring",
        "Instant failure detection",
        "Webhook-based notifications",
        "Multi-repository support",
      ],
      color: "from-purple-500 to-violet-400",
    },
    {
      number: "03",
      icon: Bot,
      title: "AI Analysis",
      description: "Advanced AI analyzes failures, identifies root causes, and generates intelligent fixes",
      details: [
        "Pattern recognition algorithms",
        "Historical failure analysis",
        "Confidence scoring",
        "Smart fix generation",
      ],
      color: "from-green-500 to-emerald-400",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Auto Deploy",
      description: "Automatically apply fixes and re-run pipelines or get approval for manual deployment",
      details: [
        "Automated fix deployment",
        "Manual approval workflow",
        "Rollback capabilities",
        "Success notifications",
      ],
      color: "from-orange-500 to-yellow-400",
    },
  ]

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
  }

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
            HOW FIXR WORKS
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Four simple steps to automate your entire DevOps pipeline monitoring and fixing process
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * index }}
              className={`flex flex-col md:flex-row items-center gap-10 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Content */}
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black" style={{ color: 'rgba(0,212,255,0.25)' }}>{step.number}</span>
                  <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                <ul className="space-y-3">
                  {step.details.map(d => (
                    <li key={d} className="flex items-center text-gray-400">
                      <ArrowRight className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Card */}
              <div className="flex-1 w-full">
                <div style={cardStyle} className="p-10 text-center">
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5`}>
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <span className="text-5xl font-black" style={{ color: 'rgba(0,212,255,0.15)' }}>{step.number}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-10 mb-16"
          style={cardStyle}
        >
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Complete Integration Flow</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['GitHub', 'Webhooks', 'AI Analysis', 'Auto Fix', 'Deploy'].map((item, i) => (
              <div key={item} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)' }}
                  >
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="text-xs text-gray-400">{item}</div>
                </div>
                {i < 4 && <ArrowRight className="h-5 w-5 text-blue-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center rounded-2xl p-12"
          style={cardStyle}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Start Automating Today</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Setup takes less than 5 minutes. Start monitoring your pipelines immediately.
          </p>
          <Link href="/sign-up">
            <Button size="lg">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
