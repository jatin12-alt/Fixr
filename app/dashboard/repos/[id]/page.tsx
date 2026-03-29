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
  ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import { AnimatedCounter } from '@/components/AnimatedCounter'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function RepoDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data, error, isLoading, mutate } = useSWR(`/api/repos/${id}`, fetcher, {
    refreshInterval: 15000 
  })

  const [fixLoading, setFixLoading] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Repository</h2>
          <p className="text-muted-foreground mb-6">{data?.error || "Failed to fetch repository details."}</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { repo, stats, recentRuns } = data
  const latestRun = recentRuns?.[0]
  const historyRuns = recentRuns?.slice(1) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
      case 'FIXED_AND_MERGED':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'failed':
      case 'analysis_failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'running':
      case 'PR_CREATED_WAITING_REVIEW':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fixed':
      case 'FIXED_AND_MERGED':
        return 'text-green-400'
      case 'failed':
      case 'analysis_failed':
        return 'text-red-400'
      case 'running':
      case 'PR_CREATED_WAITING_REVIEW':
        return 'text-blue-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-cyan-400 transition-colors mb-4 uppercase tracking-widest group">
            <ArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 ${repo.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                  {repo.isActive && <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                  {repo.isActive ? 'Engine Online' : 'Engine Offline'}
                </div>
                <div className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-black tracking-widest uppercase">
                  Health Score: {stats.successRate}%
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3 overflow-hidden">
                <Github size={36} className="text-white/60 shrink-0" />
                <span className="truncate">{repo.name}</span>
              </h1>
              <p className="text-muted-foreground mt-1 font-mono text-xs opacity-60 truncate">
                {repo.fullName}
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-3">
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="glass border-white/5 text-xs hover:border-cyan-500/30 transition-all font-black uppercase tracking-widest"
                 onClick={handleManualScan}
                 disabled={scanLoading}
               >
                 {scanLoading ? <Loader2 size={12} className="animate-spin mr-2" /> : <Activity size={12} className="mr-2" />}
                 Trigger Manual Scan
               </Button>
               <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer">
                 <Button variant="outline" size="sm" className="glass border-white/5 text-xs hover:border-cyan-500/30 transition-all">
                   View on GitHub <ExternalLink size={12} className="ml-2" />
                 </Button>
               </a>
            </div>
          </div>
        </div>

        {/* Localized Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DetailMetricCard 
            label="Total Runs" 
            value={<AnimatedCounter value={stats.totalRuns} />} 
            icon={Activity} 
            color="text-blue-400" 
            sub="Pipeline events"
            tooltip="Total number of CI/CD executions monitored for this repository"
          />
          <DetailMetricCard 
            label="Auto-Fixes" 
            value={<AnimatedCounter value={stats.fixesApplied} />} 
            icon={Zap} 
            color="text-green-400" 
            sub="AI Resolved"
            tooltip="Number of pipeline failures autonomously fixed by AI"
          />
          <DetailMetricCard 
            label="Success Rate" 
            value={<AnimatedCounter value={stats.successRate} suffix="%" />} 
            icon={CheckCircle} 
            color="text-cyan-400" 
            sub="Engine Accuracy"
            tooltip="Percentage of failures where AI provided a successful resolution"
          />
          <DetailMetricCard 
            label="Est. Savings" 
            value={<AnimatedCounter value={stats.timeSaved * 80} prefix="$" />} 
            icon={DollarSign} 
            color="text-purple-400" 
            sub={`${stats.timeSaved}h reclaimed`}
            tooltip="Estimated financial value saved ($80/hr) through autonomous fixing"
          />
        </div>

        {/* Latest Run Section */}
        <div className="space-y-6 mb-8">
           <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-bold tracking-tight">Latest <span className="text-cyan-400">Analysis</span></h2>
           </div>

           {latestRun ? (
             <RunCard 
               run={latestRun} 
               repoId={id} 
               onTriggerFix={handleTriggerFix} 
               fixLoading={fixLoading}
               isHighlighted
             />
           ) : (
             <Card className="glass border-dashed border-white/10 p-12 text-center">
               <Bot className="h-12 w-12 text-white/5 mx-auto mb-4" />
               <p className="text-muted-foreground">No recent pipeline failures detected.</p>
             </Card>
           )}
        </div>

        {/* Collapsible History */}
        {recentRuns.length > 1 && (
           <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full h-12 flex items-center justify-center gap-2 border border-white/5 hover:bg-white/5 transition-all group"
              >
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                   {showHistory ? 'Hide Run History' : 'View Run History'}
                 </span>
                 {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-4"
                  >
                    {historyRuns.map((run: any) => (
                      <RunCard 
                        key={run.id}
                        run={run} 
                        repoId={id} 
                        onTriggerFix={handleTriggerFix} 
                        fixLoading={fixLoading}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        )}

      </div>
    </div>
  )
}

function RunCard({ run, repoId, onTriggerFix, fixLoading, isHighlighted = false }: any) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fixed':
      case 'fixed_and_merged':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed':
      case 'analysis_failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`glass border-white/5 overflow-hidden transition-all duration-300 ${isHighlighted ? 'border-cyan-500/20 ring-1 ring-cyan-500/5 shadow-[0_0_30px_rgba(0,212,255,0.05)]' : ''}`}>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0 p-3 rounded-xl bg-white/5 border border-white/10">
                <GitBranch className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-tight truncate">Build #{run.githubRunId || run.id.toString().slice(-4)}</h3>
                  <div className="flex shrink-0 items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5">
                    {getStatusIcon(run.status)}
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">{run.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium opacity-60 truncate">
                  Triggered {new Date(run.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">AI Confidence</span>
               <div className="flex items-center gap-3 w-32">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${run.aiConfidence || run.confidence || 0}%` }}
                      className={`h-full ${ (run.aiConfidence || run.confidence || 0) > 80 ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'bg-blue-500'}`}
                    />
                  </div>
                  <span className="text-xs font-black text-foreground">{(run.aiConfidence || run.confidence || 0)}%</span>
               </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                <Bot size={12} className="text-cyan-400 shrink-0" />
                AI Diagnostics
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm leading-relaxed text-blue-100/80 break-words whitespace-pre-wrap">
                {run.aiExplanation || "Engine is correlating logs and identifying root cause..."}
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  <Shield size={12} className="text-green-400" />
                   Solution Protocol
                </div>
                {['FAILED', 'ANALYSIS_FAILED', 'FAILED_RECOVERY'].includes(run.status.toUpperCase()) && (
                  <Button 
                    size="sm" 
                    className="h-7 text-[10px] font-black uppercase tracking-widest px-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all hover:shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                    onClick={() => onTriggerFix(run.id)}
                    disabled={fixLoading === run.id}
                  >
                    {fixLoading === run.id ? <Loader2 size={12} className="animate-spin mr-2" /> : <Zap size={12} className="mr-2" />}
                    Trigger Auto-Fix
                  </Button>
                )}
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4">
                 <p className="text-sm font-medium text-cyan-200/90 leading-relaxed mb-3 break-words whitespace-pre-wrap">
                   {run.aiFixSuggestion || (run.status === 'fixed' ? 'Integrity restored. Fix merged to main.' : 'Determining recovery strategy...')}
                 </p>
                 {run.aiCodeFix && (
                   <div className="rounded-lg bg-black/40 border border-white/5 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/5">
                         <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Proposed Diff</span>
                      </div>
                      <pre className="p-3 text-[10px] font-mono text-cyan-300 overflow-x-auto">
                        {run.aiCodeFix}
                      </pre>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function DetailMetricCard({ label, value, icon: Icon, color, sub, tooltip }: any) {
  return (
    <Card 
      className="glass border-white/5 group hover:border-cyan-500/20 transition-all duration-500 overflow-hidden relative"
      title={tooltip}
    >
      <CardContent className="p-6">
        <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 ${color}`}>
          <Icon size={120} />
        </div>
        <p className="text-[10px] font-black tracking-widest text-muted-foreground mb-1 uppercase">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
          <span className="text-[10px] text-muted-foreground font-black opacity-40 uppercase">{sub}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function RepoDetailSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-10">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="space-y-6">
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  )
}
