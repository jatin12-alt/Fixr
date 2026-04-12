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
      title: "Secure Node Connection",
      description: "Establish a high-bandwidth, encrypted link to your repository architecture with zero-trust OAuth integration.",
      details: [
        "Architectural OAuth 2.0 tunneling",
        "Granular permission staging",
        "Encrypted metadata synchronization",
        "Multi-region deployment ready",
      ],
      color: "from-[#00d4ff] to-[#8b5cf6]",
    },
    {
      number: "02",
      icon: Webhook,
      title: "Real-time Pulse Monitoring",
      description: "Our Sentinel engine monitors every heartbeat of your CI/CD pipelines, translating logs into actionable intelligence.",
      details: [
        "In-memory stream processing",
        "Sub-second latency detection",
        "Neural log pattern matching",
        "Stateful pipeline tracking",
      ],
      color: "from-[#8b5cf6] to-[#d0bcff]",
    },
    {
      number: "03",
      icon: Bot,
      title: "AI Synthesis & Diagnosis",
      description: "Failure data is processed through our specialized AI models to identify the exact architectural root cause.",
      details: [
        "Proprietary failure-fix mapping",
        "Deep context log analysis",
        "Probability-ranked solutions",
        "Historical data cross-referencing",
      ],
      color: "from-[#d0bcff] to-[#00d4ff]",
    },
  ]

  return (
    <div className="min-h-screen bg-[#131317] bg-dot-grid selection:bg-primary selection:text-black">
      <div className="container mx-auto px-10 pt-48 pb-48">
        {/* Architectural Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-48"
        >
          <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
          <span className="text-[11px] font-black tracking-[0.6em] text-primary uppercase mb-10 block text-glow">
            Neural Architecture Overview
          </span>
          <h1 className="text-7xl md:text-[160px] font-black mb-12 tracking-tighter leading-[0.85]">
            Architecting <br />
            <span className="text-white/10 italic">Reliability.</span>
          </h1>
          <p className="text-xl text-white/30 max-w-2xl leading-relaxed italic border-l-2 border-primary/20 pl-10">
            "We believe the infrastructure layer should be silent, autonomous, and illuminated. A system that doesn't just notify, but resolves."
          </p>
        </motion.div>

        {/* Layered Steps */}
        <div className="space-y-48">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col md:flex-row items-center gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Content Side */}
              <div className="flex-1 space-y-12">
                <div className="flex items-center gap-10">
                  <span className="text-[100px] font-black text-white/[0.03] leading-none select-none tracking-tighter">{step.number}</span>
                  <div className="h-[1px] flex-grow bg-white/5" />
                </div>
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-6">{step.title}</h2>
                  <p className="text-white/40 text-xl leading-relaxed max-w-lg font-medium italic">"{step.description}"</p>
                </div>
                <div className="grid grid-cols-1 gap-6 pt-6">
                  {step.details.map(d => (
                    <div key={d} className="flex items-center gap-6 text-white/20 group">
                      <div className="w-2 h-2 rounded-full border border-primary/40 group-hover:bg-primary transition-all duration-500 shadow-glow" />
                      <span className="text-[13px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Card */}
              <div className="flex-1 w-full perspective-2000">
                <div className="glass-card p-24 relative overflow-hidden group hover:translate-y-[-15px] hover:rotate-2 transition-all duration-1000 border-white/5 hover:border-primary/20 shadow-2xl">
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${step.color} opacity-5 blur-[100px] group-hover:opacity-20 transition-opacity`} />
                  <div className="relative z-10">
                    <div className={`w-24 h-24 rounded-[24px] bg-gradient-to-br ${step.color} flex items-center justify-center mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] skew-y-6 group-hover:skew-y-0 transition-all duration-700`}>
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="h-1 w-16 bg-primary mb-8" />
                    <div className="text-[11px] font-black tracking-[0.4em] text-white/10 uppercase mb-3">Module Identity</div>
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-glow" />
                      <span className="text-xs font-mono text-white tracking-widest uppercase">Protocol: Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Blueprint Section */}
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="mt-80 relative py-48 border-t border-white/5"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="relative z-10 text-center max-w-4xl mx-auto">
             <span className="text-[11px] font-black tracking-[0.6em] text-white/20 uppercase mb-16 block">Operational Flow</span>
            <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12">
              {['G_HUB', 'SIGNAL', 'AI_CORE', 'PATCH', 'AUTO_D'].map((item, i) => (
                <div key={item} className="group flex flex-col items-center">
                  <div className="w-20 h-20 rounded-[20px] glass-card flex items-center justify-center mb-6 group-hover:border-primary group-hover:shadow-glow transition-all duration-700 bg-white/[0.02] border-white/5">
                    <span className="text-primary font-black text-xl">{i + 1}</span>
                  </div>
                  <div className="text-[11px] font-black tracking-[0.3em] text-white/20 uppercase group-hover:text-primary transition-colors">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* High-Velocity CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-32 p-32 rounded-[60px] glass-card border-white/5 text-center relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 blur-[120px] rounded-full group-hover:bg-primary/10 transition-all duration-1000" />
          
          <span className="text-[11px] font-black tracking-[0.5em] text-white/20 uppercase mb-10 block">System Integration</span>
          <h2 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter text-white uppercase italic">Deploy Sentinel.</h2>
          <p className="text-white/40 mb-16 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            Join the elite fleet of digital architects. Transition from manual triage to autonomous structural resolution.
          </p>
          <div className="flex justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="h-[72px] px-16 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-glow hover:shadow-glow-subtle rounded-2xl">
                Access Node Terminal
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

