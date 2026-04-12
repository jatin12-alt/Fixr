'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { 
  GitBranch, Clock, CheckCircle, AlertTriangle, 
  Github, Loader2, Zap, ArrowLeft, Bot, 
  Activity, TrendingUp, DollarSign, ExternalLink,
  ChevronDown, ChevronUp, Shield, Edit2, Users, Calendar
} from 'lucide-react'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function RepoDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, error, isLoading, mutate } = useSWR(`/api/repos/${id}`, fetcher, {
    refreshInterval: 15000 
  })

  const [fixLoading, setFixLoading] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [scanLoading, setScanLoading] = useState(false)

  const handleManualScan = async () => {
    setScanLoading(true)
    try {
      const res = await fetch(`/api/repos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshScan: true })
      })
      const result = await res.json()
      if (result.success) {
        mutate()
      } else {
        alert(result.error || 'Failed to trigger scan')
      }
    } catch (err) {
      alert('Network error triggering scan')
    } finally {
      setScanLoading(false)
    }
  }

  const handleTriggerFix = async (runId: number) => {
    setFixLoading(runId)
    try {
      const res = await fetch(`/api/repos/${id}/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId })
      })
      const result = await res.json()
      if (result.success) {
        mutate()
      } else {
        alert(result.error || 'Failed to trigger fix')
      }
    } catch (err) {
      alert('Network error triggering fix')
    } finally {
      setFixLoading(null)
    }
  }

  if (isLoading) return <RepoDetailSkeleton />

  if (error || !data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131317] p-10 selection:bg-primary selection:text-black">
        <div className="text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[80px] pointer-events-none" />
          <AlertTriangle className="h-16 w-16 text-primary mx-auto mb-8 shadow-glow" />
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Node Breakdown.</h2>
          <p className="text-white/30 mb-12 font-medium italic border-l border-primary/20 pl-8 text-left max-w-sm mx-auto">{data?.error || "Neural link failure: Unable to synchronize repository manifest."}</p>
          <Link href="/dashboard">
            <Button variant="outline" className="h-[52px] px-8 font-black uppercase tracking-[0.2em] text-[10px] border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-xl">
              <ArrowLeft className="mr-3 h-4 w-4" /> Return to Deck
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { repo, stats, recentRuns } = data
  const latestRun = recentRuns?.[0]
  const historyRuns = recentRuns?.slice(1) || []

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'members', name: 'Members' },
    { id: 'activity', name: 'Activity' },
  ]

  return (
    <div className="min-h-screen pt-32 pb-32 px-10 bg-[#131317] selection:bg-primary selection:text-black">
      <div className="max-w-[1120px] mx-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] pointer-events-none" />
        
        {/* Navigation */}
        <div className="mb-16">
          <Link href="/dashboard" className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-primary transition-all group">
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-2 transition-transform" /> Back to command deck
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-20 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-6 mb-6">
              <h1 className="text-5xl font-black text-white tracking-tighter truncate">
                {repo.name.split('/').pop()} <span className="text-white/10 italic">Core.</span>
              </h1>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-glow-subtle",
                repo.isActive ? "bg-primary/10 border border-primary/20 text-primary" : "bg-white/5 text-white/20 border border-white/5"
              )}>
                {repo.isActive ? "Monitoring Active" : "Telemetry Paused"}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-primary/40" />
                <span className="text-white/60">Node Initialized</span> {new Date(repo.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-primary/40" />
                <span className="text-white/60">Pulse Sync</span> Q3 2025
              </div>
              <div className="flex items-center gap-3">
                <Users size={14} className="text-primary/40" />
                <span className="text-white/60">Mesh Size:</span> 12
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-white/60">{stats.successRate}% Integrity</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Button variant="outline" className="h-[52px] px-8 font-black uppercase tracking-[0.2em] text-[10px] border-white/5 glass-card text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-xl">
              <Edit2 size={14} className="mr-3" /> Edit Manifest
            </Button>
            <Button onClick={handleManualScan} disabled={scanLoading} className="h-[52px] px-10 font-black uppercase tracking-[0.2em] text-[10px] bg-primary text-black hover:bg-white transition-all rounded-xl shadow-glow">
              {scanLoading ? <Loader2 size={16} className="animate-spin" /> : "Initiate Pulse Scan"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-12 border-b border-white/5 mb-20 relative z-10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-6 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative block whitespace-nowrap",
                activeTab === tab.id ? "text-primary text-glow" : "text-white/20 hover:text-white"
              )}
            >
              {tab.name}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-glow" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-16 relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <Card className="p-10 glass-card border-white/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-10 block">Infrastructure Telemetry</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                    <div className="group/metric">
                      <p className="text-[9px] uppercase font-black text-white/10 mb-2 tracking-[0.2em] group-hover/metric:text-primary transition-colors">Total Runs</p>
                      <p className="text-4xl font-black text-white tracking-tighter group-hover/metric:text-glow-subtle transition-all">{stats.totalRuns}</p>
                    </div>
                    <div className="group/metric">
                      <p className="text-[9px] uppercase font-black text-white/10 mb-2 tracking-[0.2em] group-hover/metric:text-primary transition-colors">Integrity Rate</p>
                      <p className="text-4xl font-black text-primary tracking-tighter text-glow-subtle">{stats.successRate}%</p>
                    </div>
                    <div className="group/metric">
                      <p className="text-[9px] uppercase font-black text-white/10 mb-2 tracking-[0.2em] group-hover/metric:text-primary transition-colors">Neural Repairs</p>
                      <p className="text-4xl font-black text-white tracking-tighter group-hover/metric:text-glow-subtle transition-all">{stats.fixesApplied}</p>
                    </div>
                    <div className="group/metric">
                      <p className="text-[9px] uppercase font-black text-white/10 mb-2 tracking-[0.2em] group-hover/metric:text-primary transition-colors">Value Recouped</p>
                      <p className="text-4xl font-black text-white tracking-tighter group-hover/metric:text-glow-subtle transition-all">${(stats.timeSaved * 80).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-10 glass-card border-white/5 flex flex-col justify-center relative group">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
                  <Bot size={48} className="text-primary mb-8 animate-float shadow-glow" />
                  <h3 className="text-2xl font-black text-white mb-6 tracking-tighter">Autonomous Core AI</h3>
                  <p className="text-[14px] leading-relaxed text-white/40 font-medium italic border-l-2 border-primary/20 pl-8">
                    Sentinel Engine is currently triaging your CI/CD delivery nodes. It has successfully correlated root structural causes for {stats.fixesApplied} anomalies in the current cycle.
                  </p>
                </Card>

                <div className="md:col-span-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 block">Live Engine Analysis</h3>
                   {latestRun ? (
                      <Card className="p-10 glass-card border-white/5 group hover:bg-white/[0.04] transition-all duration-500 flex flex-col md:flex-row gap-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] pointer-events-none" />
                        <div className="flex-1 space-y-8 relative z-10">
                          <div className="flex items-center gap-6">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border shadow-glow-subtle",
                              latestRun.status.toUpperCase() === 'FIXED' ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-white/30"
                            )}>
                              {latestRun.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-white/10 font-black uppercase tracking-[0.4em]">Signal #{latestRun.githubRunId}</span>
                          </div>
                          <p className="text-[17px] font-medium text-white/60 leading-relaxed italic pr-12 group-hover:text-white transition-colors">
                            "{latestRun.aiExplanation || "Decoding structural anomalies: Node sync in progress..."}"
                          </p>
                        </div>
                        {['FAILED', 'ANALYSIS_FAILED'].includes(latestRun.status.toUpperCase()) && (
                          <div className="shrink-0 flex items-center relative z-10">
                            <Button onClick={() => handleTriggerFix(latestRun.id)} disabled={fixLoading === latestRun.id} className="h-14 px-10 font-black uppercase tracking-[0.2em] text-[10px] bg-primary text-black hover:bg-white transition-all rounded-xl shadow-glow">
                              {fixLoading === latestRun.id ? <Loader2 size={18} className="animate-spin" /> : <>Deploy Neural Fix <ArrowLeft className="h-4 w-4 rotate-180 ml-4" /></>}
                            </Button>
                          </div>
                        )}
                      </Card>
                   ) : (
                     <p className="text-white/10 text-[11px] font-black uppercase tracking-[0.4em] italic py-12 border border-dashed border-white/5 rounded-[24px] text-center">No telemetry pulses captured in this cycle.</p>
                   )}
                </div>
              </motion.div>
            )}

            {activeTab !== 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/5">
                  <Shield className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/10 text-[11px] font-black uppercase tracking-[0.5em] italic">Accessing encrypted module data...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}

function RepoDetailSkeleton() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-10 bg-[#131317]">
      <div className="max-w-[1120px] mx-auto space-y-16">
        <Skeleton className="h-4 w-40 bg-white/5" />
        <div className="flex justify-between items-end">
          <div className="space-y-6">
            <Skeleton className="h-14 w-96 bg-white/5 rounded-xl" />
            <Skeleton className="h-4 w-80 bg-white/5" />
          </div>
          <div className="flex gap-4">
             <Skeleton className="h-14 w-40 bg-white/5 rounded-xl" />
             <Skeleton className="h-14 w-40 bg-white/5 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
        <div className="grid grid-cols-2 gap-12">
           <Skeleton className="h-72 bg-white/5 rounded-[32px]" />
           <Skeleton className="h-72 bg-white/5 rounded-[32px]" />
        </div>
      </div>
    </div>
  )
}
