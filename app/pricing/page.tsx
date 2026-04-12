'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus, Minus, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PricingTier {
  name: string
  price: { monthly: number; annual: number }
  description: string
  features: string[]
  cta: string
  href: string
  popular?: boolean
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for solo developers and side projects.',
    features: [
      'Up to 3 repositories',
      '50 pipeline runs/month',
      'Basic AI fix suggestions',
      '7-day history'
    ],
    cta: 'Start Project',
    href: '/sign-up',
  },
  {
    name: 'Pro',
    price: { monthly: 49, annual: 39 },
    description: 'For professional developers and growing teams.',
    features: [
      'Unlimited repositories',
      'Unlimited pipeline runs',
      'Advanced AI diagnostics',
      '90-day history retention',
      'Auto-fix deployment',
      'Priority processing'
    ],
    cta: 'Deploy Sentinel',
    href: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Team',
    price: { monthly: 149, annual: 119 },
    description: 'For organizations with advanced security needs.',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Role-based permissions',
      'Audit logs & compliance',
      'Priority engineering support',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
]

const faqs = [
  {
    question: 'How does the AI diagnosis actually work?',
    answer: 'Our engine analyzes your build logs, identifying patterns associated with failed dependencies, syntax errors, and environment misconfigurations. It then crosses this metadata with our private database of fixes to provide a solution.',
  },
  {
    question: 'Is my source code secure?',
    answer: 'Fixr never stores your source code. We only analyze build metadata and logs. All communication is encrypted via TLS 1.3, and we are SOC 2 Type II compliant.',
  },
  {
    question: 'Can I cancel or change my plan?',
    answer: 'Yes, you can transition between tiers or cancel at any time. Changes are prorated to the day.',
  },
  {
    question: 'Do you offer custom enterprise agreements?',
    answer: 'For organizations requiring self-hosted runners, custom data retention policies, or dedicated support, we offer Enterprise licensing. Contact our engineering team for details.',
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      {/* Header */}
      <section className="pt-40 pb-32 border-b border-white/5 bg-dot-grid relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[12px] font-black text-primary uppercase tracking-[0.4em] mb-6 block text-glow">Pricing Architecture</span>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-12">
              Predictable <br />
              <span className="text-white/10 italic">Scale.</span>
            </h1>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mt-16">
              <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", !isAnnual ? "text-primary text-glow" : "text-white/30")}>Monthly Pulse</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-16 h-8 rounded-full bg-white/5 border border-white/10 relative p-1.5 transition-all group hover:border-primary/50"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                <motion.div
                  className="w-5 h-5 bg-white rounded-full relative z-10 shadow-xl"
                  animate={{ x: isAnnual ? 32 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", isAnnual ? "text-primary text-glow" : "text-white/30")}>Annual Node</span>
              {isAnnual && (
                <span className="ml-4 px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow">Efficiency +20%</span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-32 container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "p-12 h-full flex flex-col relative transition-all duration-700 group border rounded-[20px]",
                tier.popular 
                  ? "bg-white hover:bg-gradient-to-br hover:from-[#1b1b1f] hover:to-[#0e0e11] border-[#e5e5e5] hover:border-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] scale-[1.05] z-10" 
                  : "bg-white hover:bg-[#131317] border-[#e5e5e5] hover:border-white/10"
              )}>
                {tier.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#f5f5f5] group-hover:bg-primary text-[#0a0a0a] group-hover:text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full transition-colors duration-[120ms] shadow-sm group-hover:shadow-glow">
                    Sentinel Standard
                  </div>
                )}

                <div className="mb-12">
                  <h3 className="text-2xl font-black mb-3 tracking-tight text-[#0a0a0a] group-hover:text-white transition-colors duration-[120ms]">{tier.name}</h3>
                  <p className="text-[15px] font-medium leading-relaxed text-[#525252] group-hover:text-white/60 transition-colors duration-[120ms]">{tier.description}</p>
                </div>

                <div className="mb-12">
                  <div className="flex items-baseline">
                    <span className="text-6xl font-black tracking-tighter text-[#0a0a0a] group-hover:text-white transition-colors duration-[120ms]">
                      ${isAnnual ? tier.price.annual : tier.price.monthly}
                    </span>
                    <span className="ml-3 text-sm font-black uppercase tracking-widest text-[#525252] group-hover:text-white/20 transition-colors duration-[120ms]">/Node</span>
                  </div>
                </div>

                <div className="flex-grow space-y-6 mb-16">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start text-sm font-medium group/feature">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0 transition-colors duration-[120ms]",
                        tier.popular ? "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/20 group-hover:text-primary" : "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-white/10 group-hover:text-white"
                      )}>
                         <Check className="h-3 w-3" />
                      </div>
                      <span className="text-[#525252] group-[.group]:hover:text-white/80 transition-colors duration-[120ms]">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={tier.href}>
                  <Button
                    className={cn(
                      "w-full h-16 rounded-[16px] font-black uppercase tracking-widest text-[10px] transition-all duration-700",
                      tier.popular ? "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary group-hover:text-black group-hover:shadow-glow" : "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-white/10 group-hover:text-white"
                    )}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-40 bg-[#0e0e11] border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="mb-24 text-center">
             <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] mb-4 block">Telemetry Matrix</span>
             <h2 className="text-4xl font-black text-white tracking-tight leading-none group">
               Full System <br />
               <span className="text-white/10 italic">Capabilities.</span>
             </h2>
          </div>
          
          <div className="overflow-hidden glass-card border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-10 py-8 text-[11px] font-bold text-white/30 uppercase tracking-[0.3em]">Module Specifications</th>
                  <th className="px-10 py-8 text-[11px] font-bold text-white uppercase tracking-[0.3em] text-center">Free</th>
                  <th className="px-10 py-8 text-[11px] font-bold text-primary uppercase tracking-[0.3em] text-center">Pro</th>
                  <th className="px-10 py-8 text-[11px] font-bold text-white uppercase tracking-[0.3em] text-center">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: 'Architectural Connections', free: '3', pro: 'Unlimited', team: 'Unlimited' },
                  { label: 'Autonomous Synthesis Engine', free: false, pro: true, team: true },
                  { label: 'Priority Signal API', free: 'Basic', pro: 'Sentinel', team: 'Sentinel' },
                  { label: 'Historical Retention', free: '7 Days', pro: '90 Days', team: '365 Days' },
                  { label: 'Compliance Audit Logging', free: false, pro: false, team: true },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-8 text-sm font-bold text-white/80 tracking-tight">{row.label}</td>
                    <td className="px-10 py-8 text-sm font-semibold text-white/40 text-center">
                      {typeof row.free === 'boolean' ? (row.free ? <CheckCircle2 className="h-5 w-5 mx-auto text-primary opacity-50" /> : '—') : row.free}
                    </td>
                    <td className="px-10 py-8 text-sm font-bold text-primary text-center">
                      {typeof row.pro === 'boolean' ? (row.pro ? <CheckCircle2 className="h-5 w-5 mx-auto text-primary text-glow" /> : '—') : row.pro}
                    </td>
                    <td className="px-10 py-8 text-sm font-semibold text-white/40 text-center">
                      {typeof row.team === 'boolean' ? (row.team ? <CheckCircle2 className="h-5 w-5 mx-auto text-white/20" /> : '—') : row.team}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-40 container mx-auto px-6 max-w-3xl relative z-10">
        <h2 className="text-4xl font-black text-white text-center mb-24 tracking-tighter uppercase italic opacity-20">Definitions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-white/5 group">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full py-8 flex items-center justify-between transition-all"
              >
                <span className={cn(
                  "text-left font-bold transition-all text-lg tracking-tight",
                  openFaq === index ? "text-primary text-glow" : "text-white/60 group-hover:text-white"
                )}>{faq.question}</span>
                <div className={cn(
                  "w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all",
                  openFaq === index ? "rotate-45 border-primary text-primary" : "text-white/20"
                )}>
                  <Plus className="h-4 w-4" />
                </div>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-12 text-white/40 text-base leading-relaxed font-medium italic border-l border-primary/20 pl-6">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
