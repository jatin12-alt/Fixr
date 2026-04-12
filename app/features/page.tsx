'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Bot, Zap, Shield, GitBranch,
  BarChart3, Workflow, CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: "Neural Analysis",
      description: "Proprietary AI synthesis translates raw build logs into prioritized resolution protocols with 95% accuracy.",
      benefits: ["Pattern recognition", "Synchronized detection", "Automated synthesis", "Historical cross-referencing"],
    },
    {
      icon: Zap,
      title: "Sub-Second Pulse",
      description: "Real-time telemetry via architectural WebSocket tunnels. Your stack remains illuminated 24/7.",
      benefits: ["Stream monitoring", "Signal alerts", "Zero-latency detection", "Continuous health-check"],
    },
    {
      icon: Shield,
      title: "Hardened Security",
      description: "Military-grade encryption for all metadata transit. Zero-trust architecture ensures your logic remains private.",
      benefits: ["TLS 1.3 encryption", "Full Audit Telemetry", "SOC 2 Type II", "Role-based staging"],
    },
    {
      icon: GitBranch,
      title: "GitHub Tunneling",
      description: "High-bandwidth integration with repository structures, automated webhooks, and Action monitoring.",
      benefits: ["One-click OAuth", "Webhook synchro", "Branch protection", "PR synthesis"],
    },
    {
      icon: Workflow,
      title: "Auto-Resolution",
      description: "Surgically apply patches for configuration failures, dependency conflicts, and environment drift.",
      benefits: ["Adaptive patching", "Drift detection", "Validation staging", "Rollback protocols"],
    },
    {
      icon: BarChart3,
      title: "Signal Analytics",
      description: "Luminous command decks provide visibility into architectural health, throughput, and team telemetry.",
      benefits: ["Telemetry decks", "Heatmap mapping", "Custom signal reports", "Team productivity"],
    },
  ]

  return (
    <div className="min-h-screen bg-[#131317] bg-dot-grid selection:bg-primary selection:text-black">
      <div className="container mx-auto px-6 pt-40 pb-32">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-32 relative text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <span className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-6 block text-glow">Engine Capabilities</span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-12">
            Deep architecture. <br />
            <span className="text-white/10 italic">Minimal pulse.</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed italic border-x border-white/5 px-12">
            "Surgical toolsets for architects who demand precision over complexity in their CI/CD automation protocol."
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-40">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Card className="p-12 h-full glass-card border-white/5 hover:bg-white/[0.03] transition-all duration-700 group relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-2xl skew-y-1">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight">{feature.title}</h3>
                <p className="text-white/40 mb-10 text-[15px] leading-relaxed font-medium">{feature.description}</p>
                <div className="space-y-4 pt-8 border-t border-white/5">
                  {feature.benefits.map(b => (
                    <div key={b} className="flex items-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-4 flex-shrink-0 group-hover:bg-primary group-hover:shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-all" />
                      {b}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1b1b1f] to-[#0e0e11] border border-white/5 rounded-[50px] p-24 md:p-40 text-center text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 group-hover:translate-x-[40%] transition-transform duration-1000" />
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter leading-none text-glow">Standardize your <br /> <span className="text-white/10">resolution protocol.</span></h2>
          <p className="text-white/40 mb-16 max-w-xl mx-auto text-lg font-medium italic">
            "Reduce architectural burnout by automating the repetitive diagnostics of the delivery cycle."
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="h-[72px] px-16 bg-white text-black hover:bg-primary transition-all font-black uppercase tracking-widest text-[11px] rounded-[16px]">
                Initialize Stack
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

