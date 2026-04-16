'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import {
  GitBranch, Clock, CheckCircle, AlertTriangle,
  Plus, Github, Loader2, BarChart3, Zap,
  ExternalLink, ArrowRight, Bot, Cpu, Activity,
  TrendingUp, DollarSign, Search, Command, ChevronDown, CheckCircle2,
  MoreVertical, Calendar, User, Users
} from 'lucide-react'
import type { DashboardData } from '@/types'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import dynamic from 'next/dynamic'

const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart').then(mod => ({ default: mod.AnalyticsChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full mt-4 flex items-center justify-center text-[#a3a3a3]">Synchronizing data...</div>
})

import { useAuthFetcher } from '@/hooks/useAuthFetcher'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const authFetcher = useAuthFetcher()
  const { data, isLoading: swrLoading } = useSWR<DashboardData & { analytics: any[] }>(
    user ? '/api/dashboard' : null,
    authFetcher,
    { refreshInterval: 30000 }
  )

  const [hoveredRun, setHoveredRun] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPulseHistory, setShowPulseHistory] = useState(false)

  const roi = useMemo(() => {
    if (!data?.stats) return { devHours: 0, dollars: 0 }
    const devHours = data.stats.fixesApplied * 1.5 
    const dollars = devHours * 80 
    return { devHours, dollars: dollars.toLocaleString() }
  }, [data])

  const filteredRuns = useMemo(() => {
    if (!data?.recentRuns) return []
    return data.recentRuns.filter(run =>
      run.repo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  const filteredRepos = useMemo(() => {
    if (!data?.repos) return []
    return data.repos.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  if (authLoading || (user && swrLoading)) return <DashboardSkeleton />
  if (!user) return null // Let middleware handle this or return empty if needed
  if (!data || data.repos.length === 0) return <DashboardEmptyState />

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
      case 'FIXED_AND_MERGED':
        return <CheckCircle2 className="w-4 h-4 text-primary shadow-glow" />
      case 'failed':
      case 'analysis_failed':
        return <AlertTriangle className="w-4 h-4 text-primary" />
      default:
        return <Clock className="w-4 h-4 text-white/20" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'FIXED_AND_MERGED': 'Auto-Fixed',
      'PR_CREATED_WAITING_REVIEW': 'Pending Review',
      'DIAGNOSTIC_REPORT_READY': 'Analysis Ready',
      'analysis_failed': 'Engine Error',
      'failed': 'CI Failure'
    }
    return labels[status] || status.replace(/_/g, ' ')
  }

  return (
    <div className="py-24 lg:py-16 selection:bg-primary selection:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-8 relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow" />
            <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] text-primary/40">
              Neural Telemetry Active
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">Command <span className="text-white/10 italic">Deck.</span></h1>
        </div>

        <div className="relative group max-w-sm w-full z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search manifests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-all focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {/* ROI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <ROICard label="Auto-Fixes" value={data.stats.fixesApplied} icon={Zap} sub="RESOLVED" />
        <ROICard label="Hours Saved" value={roi.devHours} icon={Clock} sub="BW GAIN" unit="H" />
        <ROICard label="Value Created" value={data.stats.savings} icon={DollarSign} sub="ROI SYNC" unit="$" isPrefix />
        <ROICard label="Active Repos" value={data.stats.activeRepos} icon={GitBranch} sub="NODES" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-12">
          <Card className="glass-card border-white/5 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
            <CardHeader className="bg-white/5 border-b border-white/5 py-6 px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Efficiency Matrix</span>
                </div>
                <div className="flex items-center gap-6 text-[10px] uppercase font-black tracking-widest">
                  <span className="flex items-center gap-2 text-white/20"><div className="w-1.5 h-1.5 rounded-full bg-white/10" /> Failures</span>
                  <span className="flex items-center gap-2 text-primary"><div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow" /> Resolutions</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AnalyticsChart data={data.analytics} />
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-3">
                <Activity className="h-4 w-4 text-primary/40" />
                Live Sync Events
              </h2>
            </div>
            
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredRuns.slice(0, showPulseHistory ? 10 : 3).map((run) => (
                  <PulseItem
                    key={run.id}
                    run={run}
                    isHovered={hoveredRun === run.id}
                    onHoverChange={(hover: boolean) => setHoveredRun(hover ? run.id : null)}
                    getStatusIcon={getStatusIcon}
                    getStatusLabel={getStatusLabel}
                  />
                ))}
              </AnimatePresence>
              
              {!showPulseHistory && filteredRuns.length > 3 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPulseHistory(true)}
                  className="w-full h-14 border border-white/5 glass-card text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:bg-white/5 hover:text-white transition-all rounded-xl"
                >
                   Access Historic Log
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Structural Nodes</h2>
            <div className="space-y-6">
              {filteredRepos.map((repo) => (
                <ProjectCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary to-[#008fcc] p-10 border-none rounded-[32px] shadow-glow relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                   <Bot className="h-6 w-6 text-white text-glow" />
                </div>
                <span className="font-black text-xl text-black tracking-tighter">Sentinel Core</span>
              </div>
              <p className="text-black/60 text-sm leading-relaxed mb-10 font-bold uppercase tracking-tight">
                Autonomous resolution handling 92%+ of patterns. Performance optimal.
              </p>
              <Button className="w-full bg-black text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-[11px] h-[52px] rounded-xl shadow-2xl">
                Configure Engine
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-dot-grid opacity-[0.05] pointer-events-none" />
          </Card>
        </div>
      </div>
    </div>
  )
}

function ROICard({ label, value, icon: Icon, sub, unit, isPrefix = false }: any) {
  return (
    <Card className="p-6 md:p-8 glass-card border-white/5 hover:bg-white/[0.03] transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
      <p className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-3 text-glow-none">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-4xl font-black text-white tracking-tighter text-glow-subtle">
          {isPrefix && unit}{value}{!isPrefix && unit}
        </span>
        <span className="text-[9px] md:text-[10px] text-primary/40 font-black uppercase tracking-widest">{sub}</span>
      </div>
      <div className="absolute right-4 md:right-6 bottom-4 md:bottom-6 text-white/5 group-hover:text-primary/10 transition-all">
        <Icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
      </div>
    </Card>
  )
}

function PulseItem({ run, isHovered, onHoverChange, getStatusIcon, getStatusLabel }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <Card className={cn(
        "p-5 md:p-6 transition-all duration-500 glass-card border-white/5 group",
        isHovered && "bg-white/[0.04] border-primary/20 scale-[1.01]"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary group-hover:text-black transition-all shadow-2xl skew-x-1">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-[15px] font-black text-white mb-1 group-hover:text-primary transition-colors">{run.repo?.name}</h3>
              <p className="text-[8px] md:text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">Telemetry ID: {run.githubRunId}</p>
            </div>
          </div>
          <div className="flex items-center self-start sm:self-auto gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5 group-hover:border-primary/20 transition-all">
            {getStatusIcon(run.status)}
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{getStatusLabel(run.status)}</span>
          </div>
        </div>
        <div className="pt-6 border-t border-white/5">
          <p className="text-[13px] text-white/30 font-medium leading-relaxed italic pr-10 group-hover:text-white/50 transition-colors">
            "{run.aiExplanation || "Decoding structural anomalies: Synchronization in progress..."}"
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

function ProjectCard({ repo }: any) {
  return (
    <Link href={`/dashboard/repos/${repo.id}`} className="block">
      <Card className="glass-card border-white/5 rounded-[24px] p-8 transition-all duration-700 hover:bg-white/[0.03] hover:border-primary/20 hover:shadow-glow-subtle group relative overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-lg font-black text-white tracking-tighter group-hover:text-glow transition-all">{repo.name}</h3>
          <button className="text-white/10 hover:text-primary transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
        
        <p className="text-[14px] text-white/30 mb-8 line-clamp-2 min-h-[44px] leading-relaxed font-medium italic group-hover:text-white/50 transition-colors">
          {repo.description || "Autonomous infrastructure monitoring and structural recovery protocol active for this manifest."}
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
                {repo.isActive ? (
                  <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.2em] shadow-glow">Active Deck</div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">In Sync</div>
                )}
             </div>
             <span className="text-[12px] font-black text-white text-glow-subtle">{repo.healthScore || 100}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${repo.healthScore || 100}%` }}
              className="h-full bg-primary shadow-glow"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-[#1b1b1f] border-2 border-[#131317] flex items-center justify-center relative overflow-hidden group-hover:border-primary/20 transition-all">
                <User size={14} className="text-white/20" />
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-white/10 group-hover:text-primary/40 transition-colors">
            <Calendar size={14} />
            <span className="text-[11px] font-black uppercase tracking-[0.1em]">Q2 Pulse</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="py-24 lg:py-16 space-y-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-40 bg-white/5" />
          <Skeleton className="h-12 lg:h-14 w-64 lg:w-80 bg-white/5" />
        </div>
        <Skeleton className="h-12 lg:h-14 w-full md:w-80 bg-white/5 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1,2,3,4].map(i=><Skeleton key={i} className="h-32 bg-white/5 rounded-[24px]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <Skeleton className="h-[400px] bg-white/5 rounded-[32px]" />
          <Skeleton className="h-80 bg-white/5 rounded-[24px]" />
        </div>
        <Skeleton className="h-[400px] lg:h-[600px] bg-white/5 rounded-[32px]" />
      </div>
    </div>
  )
}

function DashboardEmptyState() {
  return (
    <div className="min-h-screen bg-[#131317] flex items-center justify-center p-10">
      <div className="text-center max-w-lg relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl group hover:border-primary/40 transition-all duration-700">
           <Github className="h-12 w-12 text-white/20 group-hover:text-primary transition-all" />
        </div>
        <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">No manifests found.</h2>
        <p className="text-white/30 mb-12 font-medium italic border-l border-primary/20 pl-8 text-left">Initialize your architectural source by connecting a primary repository to the Sentinel Engine.</p>
        <Link href="/dashboard/repos">
          <Button className="h-[60px] px-12 font-black uppercase tracking-[0.2em] text-[11px] bg-primary text-black hover:bg-white transition-all rounded-xl shadow-glow">Initialize Source</Button>
        </Link>
      </div>
    </div>
  )
}
