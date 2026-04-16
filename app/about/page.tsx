'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Github, Linkedin, Target, Users, ShieldCheck, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      title: "Precision Protocol",
      description: "We constantly push the boundaries of what's possible with neural synthesis in DevOps automation.",
      icon: Target,
    },
    {
      title: "Architect First",
      description: "Every feature is built with the digital architect in mind, focusing on structural efficiency.",
      icon: Users,
    },
    {
      title: "Static Integrity",
      description: "Our systems are built for absolute resilience with enterprise-grade telemetry and monitoring.",
      icon: ShieldCheck,
    },
    {
      title: "Global Mesh",
      description: "We believe in unified systems that harmonize with open source and global infrastructures.",
      icon: Globe,
    },
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      <div className="max-w-[1120px] mx-auto px-6 lg:px-10 pt-32 lg:pt-[160px] pb-[120px] relative">
        <div className="absolute top-0 left-1/4 w-[400px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-40"
        >
          <span className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-6 block text-glow">Foundational Narrative</span>
          <h1 className="text-[clamp(48px,8vw,96px)] font-black text-white tracking-tighter mb-12 leading-[0.95]">
            Engineered for <br />
            <span className="text-white/10 italic">absolute pulse.</span>
          </h1>
          <p className="text-xl text-white/40 max-w-[640px] font-medium leading-relaxed italic border-l border-primary/20 pl-8">
            Sentinel (Fixr) was structured to eliminate the entropic complexity of pipeline maintenance, 
            allowing architects to shift focus from infrastructure debugging to architectural expansion.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1b1b1f] to-[#0e0e11] border border-white/5 text-white p-10 md:p-32 rounded-[32px] md:rounded-[40px] mb-40 relative overflow-hidden group shadow-3xl"
        >
          <div className="relative z-10">
            <h2 className="text-[10px] font-black uppercase tracking-[.6em] text-primary/40 mb-12 shadow-glow">The Directive</h2>
            <p className="text-3xl md:text-[52px] font-black leading-[1.1] max-w-4xl tracking-tighter text-glow">
              To automate the analytical synthesis of every engineering team on earth, 
              ensuring that no architect ever manually debugs an entropic failure again.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/[0.02] -skew-x-12 translate-x-1/2 group-hover:translate-x-[45%] transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-dot-grid opacity-[0.03] pointer-events-none" />
        </motion.div>

        {/* Values Grid */}
        <div className="mb-[160px]">
          <h2 className="text-[11px] font-black uppercase tracking-[.5em] text-white/20 mb-20 text-center uppercase tracking-[0.5em]">Core Axioms</h2>
          <div className="mobile-scroll-container md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div key={value.title} className="mobile-scroll-item">
                <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.1 }}
                   viewport={{ once: true }}
                   className="h-full"
                >
                  <Card className="p-10 glass-card border-white/5 hover:bg-white/[0.03] transition-all duration-700 group h-full">
                    <div className="w-[64px] h-[64px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-2xl skew-x-1">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-6 tracking-tight group-hover:text-primary transition-colors">{value.title}</h3>
                    <p className="text-[15px] text-white/30 leading-relaxed font-medium group-hover:text-white/50 transition-colors italic">{value.description}</p>
                  </Card>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership */}
        <div className="mb-[160px]">
          <h2 className="text-[11px] font-black uppercase tracking-[.5em] text-white/20 mb-20 text-center uppercase tracking-[0.5em]">Architect in Chief</h2>
          <div className="flex justify-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="max-w-[540px] w-full p-16 glass-card border-white/10 rounded-[48px] text-center relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                {/* Visual Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[90px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-[#008fcc] p-[2px] mx-auto mb-10 shadow-glow group hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full bg-[#131317] rounded-full flex items-center justify-center overflow-hidden">
                      <div className="text-4xl font-black text-white/90 tracking-tighter italic">JD</div>
                    </div>
                  </div>
                  
                  <h3 className="text-4xl font-black text-white mb-4 tracking-tighter text-glow">Jatin Dongre</h3>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Founder & Principal Architect</p>
                  </div>
                  
                  <p className="text-[17px] text-white/60 mb-12 leading-relaxed font-medium italic px-8">
                    "Full-stack engineer and automation architect. Dedicated to structuring tools that respect the developer's pulse through intentional neural automation."
                  </p>
                  
                  <div className="flex justify-center gap-10">
                    {[
                      { Icon: Github, href: "https://github.com/jatin12-alt" },
                      { Icon: Linkedin, href: "https://linkedin.com/in/jatin-dongre-6a13a3294" }
                    ].map(({ Icon, href }, i) => (
                      <a key={i} href={href} 
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300" 
                        target="_blank" rel="noopener"
                      >
                        <Icon className="h-6 w-6" />
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-br from-primary to-[#008fcc] rounded-[50px] p-24 md:p-40 text-center text-black overflow-hidden relative shadow-glow group"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black mb-12 tracking-tighter leading-[0.9] text-black">Join the <br /> <span className="opacity-40 italic">evolution.</span></h2>
            <p className="text-black/60 mb-16 max-w-xl mx-auto font-black uppercase tracking-[0.2em] text-[13px]">
              We are screening for architectural partners to push the boundaries of automated infrastructure.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/sign-up">
                <Button className="h-[72px] px-16 font-black uppercase tracking-widest bg-black text-white hover:bg-white hover:text-black transition-all rounded-[16px] text-[11px] shadow-2xl">Initialize Connection</Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/2 group-hover:translate-x-[40%] transition-transform duration-1000" />
        </motion.div>
      </div>
    </div>
  )
}

