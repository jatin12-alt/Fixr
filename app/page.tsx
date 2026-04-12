'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Zap, Shield, GitBranch, BarChart3, Workflow,
  ArrowRight, CheckCircle, Github, Play, Quote, Star, Package
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { TiltCard } from '@/components/ui/TiltCard'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'

const OrbDivider = dynamic(
  () => import('@/components/three/OrbDivider').then(m => ({ default: m.OrbDivider })),
  { ssr: false, loading: () => null }
)

const HeroScene = dynamic(
  () => import('@/components/three/HeroScene').then(m => ({ default: m.HeroScene })),
  { ssr: false, loading: () => null }
)

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}
const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function HomePage() {
  useScrollAnimations()

  const features = [
    { icon: Workflow, title: 'Automated CI/CD', desc: 'Deploy with confidence. Automated pipelines that test, build, and ship your code without manual intervention.' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and compliance. Your infrastructure stays protected 24/7 with zero-trust architecture.' },
    { icon: GitBranch, title: 'Git Integration', desc: 'Native support for GitHub, GitLab, and Bitbucket. Trigger deployments on every push or pull request.' },
    { icon: Package, title: 'Dependency Management', desc: 'Automatically track, update, and resolve dependencies across your entire project ecosystem.' },
    { icon: BarChart3, title: 'Performance Analytics', desc: 'Real-time metrics and insights. Know exactly how your infrastructure performs at every moment.' },
    { icon: Github, title: 'GitHub Actions', desc: 'Native GitHub Actions support. Compose powerful workflows with hundreds of pre-built integrations.' },
  ]

  const metrics = [
    { label: 'Pipelines Fixed', value: 2500, suffix: '+' },
    { label: 'Hours Reclaimed', value: 15000, suffix: 'h' },
    { label: 'Active Teams', value: 500, suffix: '+' },
    { label: 'System Uptime', value: 99.9, suffix: '%' },
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black overflow-x-hidden">
      {/* 3D HERO SECTION */}
      <section style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Three.js Canvas — background layer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}>
          <HeroScene />
        </div>

        {/* Content — foreground layer, BELOW the particle text visually */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end', // push to bottom portion
          height: '100%',
          paddingBottom: '120px',
          textAlign: 'center',
        }}>
          
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '18px',
            maxWidth: '520px',
            marginBottom: '40px',
            lineHeight: 1.6,
          }}>
            The Digital Architect for your infrastructure. 
            24/7 autonomous monitoring and intelligent resolution.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}>
            <Link href="/sign-up">
              <button className="bg-white hover:bg-primary text-black border-none px-8 py-3.5 rounded-md text-[15px] font-semibold cursor-none transition-colors">
                Initialize System →
              </button>
            </Link>
            <Link href="/how-it-works">
              <button className="bg-transparent hover:bg-white/10 text-white border border-white/25 px-8 py-3.5 rounded-md text-[15px] font-medium cursor-none transition-colors">
                View Protocol
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          color: 'rgba(255,255,255,0.25)',
          fontSize: '12px',
          letterSpacing: '0.1em',
        }}>
          SCROLL ↓
        </div>
      </section>

      {/* METRICS STRIP - Tonal Shift to surface_container_low */}
      <section className="bg-[#1b1b1f] border-y border-white/5 py-0 relative z-10">
        <div className="max-w-[1120px] mx-auto px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {metrics.map((m, i) => (
              <div key={i} className="py-12 md:py-20 px-8 flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter text-glow">
                  {m.value}{m.suffix}
                </span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrbDivider />

      {/* FEATURES GRID */}
      <section id="features" className="py-[120px] relative z-10" style={{
        background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,0,0,0.05) 0%, transparent 100%), #131317`,
        backgroundImage: `radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: `24px 24px`
      }}>
        <div className="max-w-[1120px] mx-auto px-10">
          <div className="mb-24 relative" data-animation="fade-up">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-6 block text-glow">Module Configuration</span>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[1.0] mb-8">
              Architectural <br />
              <span className="text-white/20 italic">Intelligence.</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            alignItems: 'start', // ← KEY FIX: don't stretch to equal height
          }}>
            {features.map((f, i) => (
              <div key={i} className="group bg-white hover:bg-[#131317] border border-[#e5e5e5] hover:border-white/10 rounded-[12px] p-8 flex flex-col gap-5 h-auto transition-all duration-[120ms]">
                {/* Icon */}
                <div className="w-11 h-11 bg-[#f5f5f5] group-hover:bg-white/10 rounded-[10px] flex items-center justify-center transition-all duration-[120ms]">
                  <f.icon size={20} className="text-[#0a0a0a] group-hover:text-primary transition-colors duration-[120ms]" />
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-[#0a0a0a] group-hover:text-white m-0 tracking-tight transition-colors">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#525252] group-hover:text-white/60 m-0 leading-[1.6] transition-colors">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Obsidian Deep Layer */}
      <section className="py-[120px] bg-[#0e0e11] border-y border-white/5 relative z-10">
        <div className="max-w-[1120px] mx-auto px-10">
          <div className="grid md:grid-cols-3 gap-8" data-animation="stagger">
            {[
              { name: 'Sarah Chen', role: 'Architect @ TechCorp', quote: 'Protocol resolution dropped from hours to absolute zero.' },
              { name: 'Marcus J.', role: 'Head of Infra @ Vertex', quote: 'Immediate ROI. Sentinel is the command deck we never had.' },
              { name: 'Priya P.', role: 'Security Lead @ Orbit', quote: 'Surgical precision. Truly an architectural breakthrough.' },
            ].map((t, i) => (
              <div key={i} className="animate-card p-12 relative group bg-white hover:bg-[#131317] border border-[#e5e5e5] hover:border-white/10 rounded-[12px] transition-all duration-[120ms]">
                <Quote className="h-10 w-10 text-[#0a0a0a] group-hover:text-white/5 mb-12 transition-colors duration-[120ms]" />
                <p className="text-[18px] text-[#0a0a0a] group-hover:text-white/80 font-medium mb-16 leading-relaxed italic transition-colors duration-[120ms]">"{t.quote}"</p>
                <div className="flex items-center gap-5 pt-10 border-t border-[#e5e5e5] group-hover:border-white/5 transition-colors duration-[120ms]">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-sm text-primary shadow-glow">
                    {t.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[#0a0a0a] group-hover:text-white tracking-tight transition-colors duration-[120ms]">{t.name}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#525252] group-hover:text-white/30 transition-colors duration-[120ms]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION - Obsidian Primary Layer */}
      <section className="py-[120px] bg-[#131317] relative z-10">
        <div className="max-w-[1120px] mx-auto px-10">
          <div className="text-center mb-32 max-w-[800px] mx-auto" data-animation="fade-up">
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8">
              System <br />
              <span className="text-white/10 uppercase italic">Availability.</span>
            </h2>
            <p className="text-white/40 text-xl font-medium">Automate resolution mapping regardless of infrastructure scale.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto" data-animation="stagger">
            <div className="animate-card p-16 flex flex-col group bg-white hover:bg-[#131317] border border-[#e5e5e5] hover:border-white/10 rounded-[20px] transition-all duration-[120ms]">
              <div className="mb-12">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#525252] group-hover:text-white/30 mb-6 block text-glow transition-colors duration-[120ms]">Node Entry</h3>
                <div className="text-6xl font-black text-[#0a0a0a] group-hover:text-white transition-colors duration-[120ms]">$0<span className="text-xl text-[#525252] group-hover:text-white/20 font-medium ml-2 transition-colors duration-[120ms]">/mo</span></div>
              </div>
              <ul className="space-y-8 mb-16 flex-grow">
                {['3 repositories', 'Deep architectural mapping', 'Core resolution engine', '7-day telemetry'].map(f=>(
                  <li key={f} className="flex items-center gap-5 text-[15px] text-[#525252] group-hover:text-white/60 font-medium transition-colors">
                    <CheckCircle className="h-5 w-5 text-primary/50 group-hover:text-primary transition-colors" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full">
                <button className="w-full py-4 bg-[#f5f5f5] hover:bg-primary text-[#0a0a0a] border border-[#e5e5e5] hover:border-primary rounded-xl font-black uppercase tracking-widest text-xs transition-colors duration-[120ms]">Initialize Signal</button>
              </Link>
            </div>

            <div className="animate-card p-16 flex flex-col relative group bg-white hover:bg-gradient-to-br hover:from-[#1b1b1f] hover:to-[#0e0e11] border border-[#e5e5e5] hover:border-primary/20 rounded-[40px] shadow-2xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] xl:scale-105 transition-all duration-[120ms]">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full shadow-[0_0_30px_rgba(0,212,255,0.4)]">
                Sentinel Mode
              </div>
              <div className="mb-12">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary mb-6 block">Professional Stack</h3>
                <div className="text-6xl font-black text-[#0a0a0a] group-hover:text-white transition-colors">$49<span className="text-xl text-[#525252] group-hover:text-white/30 font-medium ml-2 transition-colors">/mo</span></div>
              </div>
              <ul className="space-y-8 mb-16 flex-grow text-[#525252] group-hover:text-white/80 font-medium transition-colors">
                {['Unlimited Node connections', 'Unlimited telemetry runs', 'Priority resolution synthesis', '90-day architectural history', 'Autonomous deployment'].map(f=>(
                  <li key={f} className="flex items-center gap-5 text-[15px]">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full">
                <button className="w-full py-4 bg-primary hover:bg-[#00c4ec] text-[#0a0a0a] border-none rounded-xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-colors duration-[120ms]">Engage Sentinel</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER - High Energy */}
      <section className="container mx-auto px-10 py-[120px] mb-0 relative z-10">
        <div 
          className="bg-[#0e0e11] border border-white/5 rounded-[50px] p-24 md:p-40 text-center text-white relative overflow-hidden group hover:shadow-[0_0_100px_rgba(0,212,255,0.1)] transition-shadow duration-700">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10">
            <span className="text-[12px] font-black tracking-[0.5em] text-primary/40 uppercase mb-12 block">Terminal Ready</span>
            <h2 className="text-5xl md:text-[90px] font-black mb-16 tracking-tighter leading-[0.9] text-glow">
              Initialize your <br /> <span className="text-white/10 uppercase">Security Bridge.</span>
            </h2>
            <Link href="/sign-up">
              <MagneticButton>
                <Button size="lg" className="h-[80px] px-20 text-xl font-bold bg-white text-black hover:bg-primary transition-all rounded-[16px] shadow-2xl">
                  Access Terminal
                </Button>
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
