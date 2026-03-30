'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  GitBranch, Clock, CheckCircle, AlertTriangle, 
  Plus, Github, Loader2, BarChart3, Zap, 
  ExternalLink, ArrowRight, Bot, Cpu, Activity,
  TrendingUp, DollarSign, Search, Command, ChevronDown
} from 'lucide-react'
import type { DashboardData } from '@/types'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import dynamic from 'next/dynamic'

// Dynamic import for AnalyticsChart to prevent hydration errors
const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart').then(mod => ({ default: mod.AnalyticsChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full mt-4 flex items-center justify-center text-muted-foreground">Loading chart...</div>
})

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<DashboardData & { analytics: any[] }>('/api/dashboard', fetcher, {
    refreshInterval: 30000 // Real-time: 30s
  })

  const [hoveredRun, setHoveredRun] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPulseHistory, setShowPulseHistory] = useState(false)

  // Calculations for the "Money Shot"
  const roi = useMemo(() => {
    if (!data?.stats) return { devHours: 0, dollars: 0 }
    const devHours = data.stats.fixesApplied * 1.5 // 1.5h per fix
    const dollars = devHours * 80 // $80/hr premium rate
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const breathAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  if (isLoading) return <DashboardSkeleton />

  if (!data || data.repos.length === 0) return <DashboardEmptyState />

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
      case 'DIAGNOSTIC_REPORT_READY':
        return <Bot className="w-5 h-5 text-purple-400" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'FIXED_AND_MERGED': 'Auto-Fixed',
      'PR_CREATED_WAITING_REVIEW': 'Pending Review',
      'DIAGNOSTIC_REPORT_READY': 'Diagnostic Ready',
      'analysis_failed': 'Engine Error',
      'failed': 'CI Failure',
      'fixed': 'Fixed'
    }
    return labels[status] || status.replace(/_/g, ' ')
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div 
                className="w-2 h-2 rounded-full bg-green-500"
                animate={breathAnimation}
              />
              <motion.span 
                className="text-xs font-display text-green-500/80 tracking-widest uppercase"
                animate={breathAnimation}
              >
                Autonomous Engine Active
              </motion.span>
            </div>
            <h1 className="text-5xl font-black text-foreground tracking-tight">
              Executive <span className="neon-text">Analytics</span>
            </h1>
          </motion.div>

          {/* Search Bar */}
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search failures, repos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-border/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
            <Command className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Global ROI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ROICard 
            label="AUTO-FIXES" 
            value={<AnimatedCounter value={data.stats.fixesApplied} />} 
            icon={Zap} 
            color="text-green-400" 
            sub="Successful merges"
            tooltip="Number of pipeline failures resolved and merged by AI"
          />
          <ROICard 
            label="TIME RECLAIMED" 
            value={<AnimatedCounter value={roi.devHours} suffix="h" />} 
            icon={Clock} 
            color="text-blue-400" 
            sub="Developer bandwidth"
            tooltip="Developer hours saved based on 1.5h per fix"
          />
          <ROICard 
            label="TOTAL SAVINGS" 
            value={<AnimatedCounter value={data.stats.savings} prefix="$" />} 
            icon={DollarSign} 
            color="text-purple-400" 
            sub="Estimated value"
            tooltip="Estimated financial ROI using average dev salary rates"
          />
          <ROICard 
            label="ACTIVE REPOS" 
            value={<AnimatedCounter value={data.stats.activeRepos} />} 
            icon={GitBranch} 
            color="text-primary" 
            sub="Monitored"
            tooltip="Total repositories currently being monitored by Fixr"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Visuals: Performance Chart & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-white/5 overflow-hidden">
              <CardHeader className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base uppercase tracking-widest text-muted-foreground">Success Rate (7d)</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] uppercase font-bold">
                    <span className="flex items-center gap-1.5 text-red-400"><div className="w-2 h-2 rounded-full bg-red-400" /> Failures</span>
                    <span className="flex items-center gap-1.5 text-green-400"><div className="w-2 h-2 rounded-full bg-green-400" /> Auto-Fixes</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AnalyticsChart data={data.analytics} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live <span className="text-primary">Pulse</span>
                </h2>
              </div>

              <div className="space-y-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence mode="popLayout">
                    {/* Latest Analysis */}
                    {filteredRuns.length > 0 && (
                      <PulseItem 
                        run={filteredRuns[0]}
                        isHovered={hoveredRun === filteredRuns[0].id}
                        onHoverChange={(hover: boolean) => setHoveredRun(hover ? filteredRuns[0].id : null)}
                        getStatusIcon={getStatusIcon}
                        getStatusLabel={getStatusLabel}
                      />
                    )}

                    {/* History Toggle */}
                    {filteredRuns.length > 1 && (
                      <div className="flex justify-center mt-6">
                        <Button
                          variant="ghost"
                          onClick={() => setShowPulseHistory(!showPulseHistory)}
                          className="h-10 px-6 flex items-center justify-center gap-2 border border-white/5 hover:bg-white/5 transition-all group"
                        >
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                             {showPulseHistory ? 'Collapse History' : `View Pulse History (${filteredRuns.length - 1})`}
                           </span>
                           <motion.div
                              animate={{ rotate: showPulseHistory ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                           >
                              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
                           </motion.div>
                        </Button>
                      </div>
                    )}

                    {/* Historical Analysis */}
                    {showPulseHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-4 pt-4"
                      >
                        {filteredRuns.slice(1).map((run) => (
                          <PulseItem 
                            key={run.id}
                            run={run}
                            isHovered={hoveredRun === run.id}
                            onHoverChange={(hover: boolean) => setHoveredRun(hover ? run.id : null)}
                            getStatusIcon={getStatusIcon}
                            getStatusLabel={getStatusLabel}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Sidebar: Repo Health & Engine Status */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Source <span className="text-blue-400">Health</span>
            </h2>

            <div className="space-y-4">
              {filteredRepos.map((repo, i) => (
                <RepoHealthCard 
                  key={repo.id} 
                  repo={repo} 
                  onClick={() => router.push(`/dashboard/repos/${repo.id}`)}
                />
              ))}
              {filteredRepos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs italic">
                  No repositories match your search.
                </div>
              )}
            </div>

            {/* AI Capability Card */}
            <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/10 border-border/20 shadow-2xl overflow-hidden relative group">
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                      <Bot className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="font-bold text-foreground">Quantum Engine</span>
                  </div>
                  <p className="text-xs text-cyan-100/60 leading-relaxed mb-6">
                    Autonomous recovery handling 85%+ of failure patterns. 
                    Real-time Groq analysis active.
                  </p>
                  <Link href="/dashboard/analytics" className="w-full">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full text-xs text-primary hover:text-cyan-300 hover:bg-primary/10"
                    >
                      Engine Log History <ArrowRight size={12} className="ml-2" />
                    </Button>
                  </Link>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  )
}

function ROICard({ label, value, icon: Icon, color, sub, highlight = false, tooltip }: any) {
  return (
    <Card 
      className={`glass border-white/5 overflow-hidden group hover:border-white/10 transition-all ${highlight ? 'bg-primary/5 border-border/20' : ''}`}
      title={tooltip}
    >
      <CardContent className="p-6 relative">
        <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all ${color}`}>
          <Icon size={120} />
        </div>
        <p className="text-[10px] font-black tracking-widest text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
          <span className="text-[10px] text-muted-foreground font-medium">{sub}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function PulseItem({ run, isHovered, onHoverChange, getStatusIcon, getStatusLabel }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <Card className={`glass border-white/5 overflow-hidden transition-all duration-300 ${isHovered ? 'border-border/50 bg-white/[0.04]' : ''}`}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded bg-white/5 ${run.status === 'failed' ? 'text-red-400' : 'text-green-400'}`}>
                <Github size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">{run.repo?.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono tracking-tighter uppercase">REF: {run.githubRunId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
              {getStatusIcon(run.status)}
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{getStatusLabel(run.status)}</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Analysis</span>
              <p className="text-xs text-blue-100/60 leading-relaxed italic break-words">
                {run.aiExplanation || "Engine is currently analyzing pipeline logs..."}
              </p>
            </div>
            <div className="flex flex-col justify-end items-end gap-2 min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-right">Engine Confidence</span>
              <div className="flex items-center gap-3 w-full max-w-[140px]">
                <span className="text-xs font-black text-foreground truncate">{run.aiConfidence || run.confidence || 0}%</span>
                <div 
                  className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-0 relative"
                  // eslint-disable-next-line react/no-unknown-property
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  style={{ '--confidence-width': `${run.aiConfidence || run.confidence || 0}%` } as React.CSSProperties}
                >
                  <div 
                    className={`h-full transition-all duration-1000 absolute top-0 left-0 confidence-bar ${
                      (run.aiConfidence || run.confidence || 0) > 80 ? 'bg-green-500 shadow-neon-green' : 
                      (run.aiConfidence || run.confidence || 0) > 50 ? 'bg-primary' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function RepoHealthCard({ repo, onClick }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="glass border-white/5 group transition-all hover:bg-white/[0.03]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
                <GitBranch size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{repo.name}</h4>
                <p className="text-[9px] text-muted-foreground font-mono italic">Protected</p>
              </div>
            </div>
            <div className={`h-2 w-2 rounded-full ${repo.isActive ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-card'}`} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-black tracking-widest text-muted-foreground">
               <span>HEALTH LEVEL</span>
               <span className="text-primary">OPTIMAL</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
               />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-10">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
           <div className="col-span-2 space-y-8">
              <Skeleton className="h-[300px] w-full" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
           </div>
           <div className="space-y-4">
             {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
           </div>
        </div>
      </div>
    </div>
  )
}

function DashboardEmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center max-w-md"
       >
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
             <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
             <Github className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">No Sources Detected</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
             Connect your first GitHub repository to initialize the Fixr Engine and start saving developer hours automatically.
          </p>
          <Link href="/repos">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-6 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all">
              Initialize Repository <Plus className="ml-2 h-5 w-5" />
            </Button>
          </Link>
       </motion.div>
    </div>
  )
}
