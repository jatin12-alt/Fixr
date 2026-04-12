'use client'

import { Shield, Lock, Eye, CheckCircle, ChevronRight, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/MagneticButton'

export default function SecurityPage() {
  const pillars = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      desc: "All data in transit is protected using TLS 1.3. Sensitive metadata is stored using AES-256 with rotating organizational keys.",
    },
    {
      icon: Eye,
      title: "Zero-Knowledge Analysis",
      desc: "Our engine never stores your source code. Analysis happens in volatile RAM and is immediately purged upon resolution.",
    },
    {
      icon: Shield,
      title: "Enterprise Compliance",
      desc: "SOC 2 Type II, GDPR, and HIPAA compliant. We adhere to the strictest global standards for data residency and privacy.",
    },
    {
      icon: CheckCircle,
      title: "Continuous Monitoring",
      desc: "Real-time auditing of every engine action. Full transparency into the reasoning behind every automated recovery.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black relative overflow-hidden bg-dot-grid">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-primary/[0.03] blur-[150px] pointer-events-none" />
      <div className="container mx-auto px-10 pt-48 pb-48">
        {/* Header */}
        <div className="mb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[11px] font-black text-primary/40 uppercase tracking-[0.5em] mb-10 block text-glow">Fortress Protocols</span>
            <h1 className="text-7xl md:text-[120px] font-black text-white tracking-tighter leading-[0.85] mb-12">
              Engineered for <br /><span className="text-white/10 italic">Absolute Safety.</span>
            </h1>
            <p className="text-2xl text-white/40 max-w-2xl font-medium leading-relaxed italic border-l-2 border-primary/20 pl-10">
              "Security isn't a feature; it's our foundation. The Sentinel Engine is built with 
              multi-layered defensive architectures to ensure your infrastructure remains yours."
            </p>
          </motion.div>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-48 relative z-10">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="p-12 glass-card border-white/5 rounded-[40px] h-full hover:border-primary/20 transition-all duration-700 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-black transition-all shadow-2xl skew-x-1 group-hover:skew-x-0">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{pillar.title}</h3>
                  <p className="text-white/30 text-lg font-medium leading-relaxed italic pr-6 group-hover:text-white/50 transition-colors">"{pillar.desc}"</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Audit Log / Report Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[60px] p-20 md:p-32 border-white/5 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-black text-primary/40 uppercase tracking-[0.4em] mb-12 block">Technical Validation</span>
            <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-[0.9] text-white">
              Download our <br />Security <span className="text-white/10 italic">Whitepaper.</span>
            </h2>
            <p className="text-white/30 mb-16 text-xl font-medium leading-relaxed italic border-l border-white/10 pl-8">
              Get an in-depth look at our architecture, threat modeling, and data handling protocols. 
              Verified by independent security auditors.
            </p>
            <div className="flex">
              <button className="h-[72px] px-16 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl flex items-center gap-4 hover:bg-white transition-all shadow-glow">
                Download PDF <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 right-[-100px] -translate-y-1/2 h-[600px] w-[600px] text-primary/5 pointer-events-none opacity-50"
          >
            <Globe className="w-full h-full" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
