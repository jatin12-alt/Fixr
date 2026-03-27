'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Bot, Zap, Shield, GitBranch, BarChart3, Workflow,
  ArrowRight, CheckCircle, Github, Play
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
}
const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 25)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString()}{suffix}</>
}

export default function HomePage() {
  const glowText = {
    background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00ff88 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.3))',
  }

  const cardBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  }

  const features = [
    { icon: Bot,       title: 'AI Analysis',       desc: 'GPT-powered root cause analysis with 95% accuracy',                color: 'from-blue-500 to-cyan-400' },
    { icon: Zap,       title: 'Real-time Alerts',  desc: 'Sub-second detection via webhooks and live WebSocket updates',    color: 'from-yellow-500 to-orange-400' },
    { icon: Shield,    title: 'Enterprise Grade',  desc: 'SOC 2 compliant, end-to-end encrypted, full audit trails',        color: 'from-green-500 to-emerald-400' },
    { icon: GitBranch, title: 'GitHub Native',     desc: 'One-click OAuth, automatic webhooks, branch protection support',  color: 'from-purple-500 to-violet-400' },
    { icon: Workflow,  title: 'Auto-Fix Engine',   desc: 'Automatically deploys patches for common pipeline failures',      color: 'from-pink-500 to-rose-400' },
    { icon: BarChart3, title: 'Deep Analytics',    desc: 'Trend reports, failure heatmaps, and team productivity insights', color: 'from-cyan-500 to-blue-400' },
  ]

  const steps = [
    { num: '01', title: 'Connect GitHub',  desc: 'OAuth in one click, select any repo' },
    { num: '02', title: 'Monitor 24/7',    desc: 'Webhooks catch every failure instantly' },
    { num: '03', title: 'AI Diagnoses',    desc: 'Groq-powered analysis finds root cause' },
    { num: '04', title: 'Auto Fix & Ship', desc: 'Patch deployed, pipeline re-runs clean' },
  ]

  const testimonials = [
    { name: 'Sarah Chen',     role: 'DevOps @ TechCorp',      quote: 'Failure resolution dropped from 3 hours to under 5 minutes.',    avatar: 'SC', color: 'from-blue-500 to-cyan-400' },
    { name: 'Marcus Johnson', role: 'CTO @ StartupXYZ',       quote: 'ROI was immediate. Team ships features instead of chasing bugs.', avatar: 'MJ', color: 'from-purple-500 to-violet-400' },
    { name: 'Priya Patel',   role: 'Senior Dev @ CloudTech',  quote: 'Setup took 4 minutes. The dashboard is exactly what I needed.',  avatar: 'PP', color: 'from-green-500 to-emerald-400' },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* HERO */}
      <section className="container mx-auto px-6 pt-24 pb-24 text-center">
        <motion.div variants={stagger} initial="initial" animate="animate">

          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AI-Powered DevOps &middot; Live in Production
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp}
            className="text-6xl md:text-8xl font-black leading-none mb-6"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="text-white">Your Pipelines.</span>
            <br />
            <span style={glowText}>Never Broken Again.</span>
          </motion.h1>


          {/* Subheadline */}
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Fixr monitors your GitHub Actions 24/7, uses AI to diagnose failures instantly,
            and automatically deploys fixes while you sleep.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center mb-14">
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-8 gap-2">
                Start Free - No Credit Card
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8 gap-2">
                <Play className="h-4 w-4" />
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {['No credit card required', 'Setup in 5 minutes', 'GitHub OAuth secured', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Terminal card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 mx-auto max-w-3xl"
        >
          <div style={{ background: 'rgba(10,10,20,0.9)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 80px rgba(0,212,255,0.08)' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px' }} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-xs text-gray-500 ml-3 font-mono">fixr - pipeline monitor</span>
            </div>
            <div className="p-6 text-left font-mono text-sm space-y-3">
              {[
                { text: '> Watching: jatin12-alt/CodeSense-AI',               color: '#00d4ff' },
                { text: 'x Build failed: ModuleNotFoundError: react',          color: '#ff6b6b' },
                { text: '~ AI analyzing failure...',                            color: '#ffd93d' },
                { text: 'i Root cause: outdated peer dependency',               color: '#00ff88' },
                { text: '> Applying fix: npm install react@19 --legacy-peer-deps', color: '#8b5cf6' },
                { text: 'v Pipeline re-triggered - build passing (47s)',        color: '#00ff88' },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.2 }}
                  style={{ color: line.color }}
                >
                  {line.text}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Pipelines Fixed',   target: 2500,  suffix: '+' },
            { label: 'Hours Saved',       target: 15000, suffix: '+' },
            { label: 'Happy Developers',  target: 500,   suffix: '+' },
            { label: 'Uptime',           target: 99,    suffix: '.9%' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={cardBase}
              className="p-6 text-center"
            >
              <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: '#00d4ff' }}>
                <Counter target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Everything you need. <span style={{ color: '#00d4ff' }}>Nothing you don't.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Six core capabilities that turn pipeline chaos into complete automation.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={cardBase}
              className="p-6"
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,255,0.05)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.25)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.09)' }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            From failure to fixed in <span style={{ color: '#00ff88' }}>seconds.</span>
          </h2>
          <p className="text-gray-400">Four steps. Fully automated. Zero drama.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={cardBase}
              className="p-6 text-center relative"
            >
              <div className="text-5xl font-black mb-3" style={{ color: 'rgba(0,212,255,0.15)' }}>{s.num}</div>
              <h3 className="text-white font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
              {i < 3 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Loved by <span style={{ color: '#8b5cf6' }}>real teams.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={cardBase}
              className="p-6"
            >
              <div className="flex mb-3">
                {[...Array(5)].map((_, j) => <span key={j} className="text-yellow-400 text-sm">star</span>)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">{t.avatar}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-12 md:p-20 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 relative">
            Ready to <span style={glowText}>never debug again?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto relative">
            Join 500+ developers who ship faster because Fixr handles the boring stuff.
          </p>
          <div className="flex flex-wrap gap-4 justify-center relative">
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-10 gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com/jatin12-alt" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="text-base px-8 gap-2">
                <Github className="h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
