'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior AI Infrastructure Engineer",
      dept: "Engineering",
      location: "San Francisco / Remote",
      type: "Full-time"
    },
    {
      title: "Full-stack Product Engineer",
      dept: "Product",
      location: "New York / Remote",
      type: "Full-time"
    },
    {
      title: "Developer Relations Lead",
      dept: "Growth",
      location: "Remote",
      type: "Full-time"
    }
  ]

  return (
    <div className="min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      <div className="max-w-[1120px] mx-auto px-10 pt-[160px] pb-[120px] relative z-10">
        <div className="mb-24">
          <span className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4 block text-glow">Human Resources</span>
          <h1 className="text-[clamp(40px,7vw,80px)] font-black text-white tracking-tighter leading-[1.0] mb-8">
            Build the future <br /><span className="text-white/10 italic">of autonomy.</span>
          </h1>
          <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed italic">
            We're a small, obsessed team building the surgical automation stack for the 
            world's best engineering teams. Join the engine room.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] flex flex-col justify-between h-[500px] backdrop-blur-md">
            <div>
              <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Our Philosophy</h2>
              <p className="text-white/40 font-medium leading-relaxed italic">
                We value velocity, precision, and deep technical obsession. We believe in 
                small, highly-autonomous teams that own their entire product lifecycle.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="p-4 bg-[#131317] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#e5e1e7]">High Ownership</span>
              <span className="p-4 bg-[#131317] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#e5e1e7]">Remote First</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1b1b1f] to-[#0e0e11] border border-primary/20 p-12 rounded-[40px] text-white flex flex-col justify-between h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
             <div className="relative z-10">
               <h2 className="text-3xl font-black mb-6 tracking-tight text-glow">Benefits</h2>
               <ul className="space-y-4 text-white/60 font-medium">
                 <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Competitive Equity Packages</li>
                 <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Work From Anywhere Credits</li>
                 <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Annual Offsites (Goa, Tokyo, Berlin)</li>
                 <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Deep Work Stipends</li>
               </ul>
             </div>
             <p className="text-primary/30 text-[10px] font-black uppercase tracking-[0.3em] relative z-10">Sentinel HR // 2026</p>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-12">Open Opportunities</h2>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <Card key={i} className="p-8 bg-white/5 border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 cursor-pointer group rounded-[24px]">
                <div>
                  <h3 className="text-[20px] font-bold text-white mb-3 tracking-tight group-hover:translate-x-1 group-hover:text-primary transition-all duration-500">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-2"><MapPin size={12} className="text-primary/40" /> {job.location}</span>
                    <span className="flex items-center gap-2"><Clock size={12} className="text-primary/40" /> {job.type}</span>
                    <span className="px-3 py-1.5 bg-[#1b1b1f] border border-white/5 rounded-md text-white/60">{job.dept}</span>
                  </div>
                </div>
                <MagneticButton>
                    <button className="h-12 w-12 bg-[#1b1b1f] border border-white/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-black text-white/50 transition-all duration-500 shadow-glow">
                        <ArrowRight size={20} />
                    </button>
                </MagneticButton>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
