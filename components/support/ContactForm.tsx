'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  website: string // Honeypot field
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  })
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email'
    }
    if (!formData.subject) newErrors.subject = 'Select a subject'
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 20) {
      newErrors.message = 'Minimum 20 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.website) return
    if (!validate()) return
    
    setStatus('loading')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '', website: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card border-white/10 p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-8 shadow-glow" />
        <h3 className="text-3xl font-black text-white mb-6 tracking-tight uppercase">Transmission Received.</h3>
        <p className="text-white/30 mb-12 max-w-sm mx-auto font-medium text-lg italic">
          "Your signal has been captured. An engineer will be assigned to your ticket within 24 hours."
        </p>
        <Button onClick={() => setStatus('idle')} className="h-14 px-10 bg-primary text-black hover:bg-white font-black uppercase tracking-widest text-xs transition-all rounded-xl shadow-glow">
          New Transmission
        </Button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" value={formData.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Node Identity</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Required" 
            className={cn("h-14 bg-white/[0.03] border-white/5 focus:border-primary/50 text-white rounded-xl transition-all", errors.name && "border-red-500/50")} />
          {errors.name && <p className="text-red-400 text-[10px] uppercase font-black tracking-widest ml-2">{errors.name}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Signal Address</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@address.com" 
            className={cn("h-14 bg-white/[0.03] border-white/5 focus:border-primary/50 text-white rounded-xl transition-all", errors.email && "border-red-500/50")} />
          {errors.email && <p className="text-red-400 text-[10px] uppercase font-black tracking-widest ml-2">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="subject" className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Frequency Matter</Label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full h-14 px-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-medium text-white/60 focus:outline-none focus:border-primary/50 transition-all appearance-none"
        >
          <option value="" className="bg-[#131317]">Select frequency...</option>
          <option value="bug" className="bg-[#131317]">Technical Issue / Bot Malfunction</option>
          <option value="feature" className="bg-[#131317]">Architecture Request</option>
          <option value="security" className="bg-[#131317]">Vulnerability Signal</option>
          <option value="enterprise" className="bg-[#131317]">Enterprise Triage</option>
          <option value="press" className="bg-[#131317]">Media Relations</option>
        </select>
        {errors.subject && <p className="text-red-400 text-[10px] uppercase font-black tracking-widest ml-2">{errors.subject}</p>}
      </div>

      <div className="space-y-3">
        <Label htmlFor="message" className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Metadata Details</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Please describe your technical requirement or inquiry in detail..."
          rows={6}
          className={cn("min-h-[200px] bg-white/[0.03] border-white/5 focus:border-primary/50 text-white rounded-xl resize-none transition-all duration-300", errors.message && "border-red-500/50")}
        />
        {errors.message && <p className="text-red-400 text-[10px] uppercase font-black tracking-widest ml-2">{errors.message}</p>}
      </div>

      <AnimatePresence>
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-4">
            <AlertCircle className="h-5 w-5" />
            Neural link failed. Use support@fixr.ai instead.
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="submit" disabled={status === 'loading'} className="w-full h-[72px] font-black uppercase tracking-[0.3em] text-[11px] bg-primary text-black hover:bg-white rounded-2xl shadow-glow active:scale-95 transition-all">
        {status === 'loading' ? 'Synthesizing Signal...' : 'Initiate Transmission'}
      </Button>
    </form>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
