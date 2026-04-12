'use client'

import Link from 'next/link'
import { ContactForm } from '@/components/support/ContactForm'
import { Mail, Clock, Github, Twitter, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black relative overflow-hidden bg-dot-grid">
      <div className="absolute top-0 right-0 w-full h-[600px] bg-primary/[0.03] blur-[150px] pointer-events-none" />
      <div className="max-w-[1120px] mx-auto px-10 pt-48 pb-32 relative z-10">
        {/* Header */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[11px] font-black text-primary/40 uppercase tracking-[0.5em] mb-8 block text-glow">Channel Establishment</span>
            <h1 className="text-7xl md:text-[120px] font-black text-white tracking-tighter mb-12 leading-[0.85]">
              Talk to <br />
              <span className="text-white/10 italic">Engineering.</span>
            </h1>
            <p className="text-2xl text-white/40 max-w-2xl font-medium leading-relaxed italic border-l-2 border-primary/20 pl-10">
              "Direct access to our infrastructure and AI specialists. 
              We respond to technical inquiries within one business cycle."
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-32">
          {/* Contact Form Column */}
          <div>
             <div className="flex items-center gap-6 mb-16">
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 uppercase">Channel 01: Neural Relay</span>
               <div className="h-px flex-grow bg-white/5" />
             </div>
            <ContactForm />
          </div>

          {/* Contact Info Column */}
          <div className="space-y-32">
            <div>
              <div className="flex items-center gap-6 mb-16">
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 uppercase">Channel 02: Direct Link</span>
                 <div className="h-px flex-grow bg-white/5" />
               </div>
              <div className="space-y-12">
                {[
                  { Icon: Mail, label: 'Signal Relay', value: 'support@fixr.ai', href: 'mailto:support@fixr.ai' },
                  { Icon: Clock, label: 'Sync Latency', value: 'Sub-24 Cycle Response', href: '#' },
                  { Icon: Github, label: 'Kernel Source', value: 'github.com/jatin12-alt', href: 'https://github.com/jatin12-alt' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center group">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mr-8 transition-all group-hover:bg-primary group-hover:text-black shadow-2xl skew-x-1 group-hover:skew-x-0">
                      <item.Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/10 mb-2">{item.label}</p>
                      <a href={item.href} className="text-xl font-black text-white hover:text-primary transition-all tracking-tight italic">
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-12 glass-card border-white/5 rounded-[40px] shadow-2xl group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-8">Enterprise Triage</h3>
              <p className="text-lg text-white/30 font-medium leading-relaxed mb-12 italic border-l border-white/10 pl-6">
                "For organizations with critical infrastructure requirements or custom deployment needs."
              </p>
              <a href="mailto:enterprise@fixr.ai" className="h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all w-fit">
                enterprise@fixr.ai <ExternalLink className="h-4 w-4 text-primary" />
              </a>
            </div>

            <div className="pt-16 border-t border-white/5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 mb-10">Satellite Links</h3>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                <Link href="/help" className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all">Manifest</Link>
                <Link href="/status" className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all">Pulse Status</Link>
                <Link href="/security" className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all">Fortress PGP</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
