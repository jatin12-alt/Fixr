'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, Wrench, Search, ChevronRight } from 'lucide-react'
import { KPICard } from '@/components/analytics/KPICard'
import { RepoTable } from '@/components/analytics/RepoTable'
import { FixTimeline } from '@/components/analytics/FixTimeline'
import { DateRangePicker } from '@/components/analytics/DateRangePicker'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'

const TrendChart = dynamic(() => import('@/components/analytics/TrendChart').then(m => m.TrendChart), { 
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-[#a3a3a3] font-mono text-[10px] uppercase tracking-widest">Reconstructing Trend Matrix...</div>
})
const ErrorPieChart = dynamic(() => import('@/components/analytics/ErrorPieChart').then(m => m.ErrorPieChart), { ssr: false })
const HeatmapGrid = dynamic(() => import('@/components/analytics/HeatmapGrid').then(m => m.HeatmapGrid), { ssr: false })

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

interface AnalyticsData {
  kpis: {
    totalRuns: number
    successRate: number
    totalFixes: number
    timeSaved: number
    healthScore: number
  }
  trend: Array<{
    date: string
    successCount: number
    failureCount: number
    successRate: number
  }>
  errorBreakdown: Array<{
    errorType: string
    count: number
    percentage: number
  }>
  repoLeaderboard: Array<{
    repoName: string
    healthScore: number
    totalRuns: number
    successRate: number
    lastRun: string
  }>
  heatmap: Array<{
    hour: number
    dayOfWeek: number
    failureCount: number
  }>
  recentFixes: Array<{
    id: string
    repoName: string
    fixDescription: string
    timeSaved: number
    appliedAt: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  })
  const [selectedErrorType, setSelectedErrorType] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      })

      const response = await fetch(`/api/analytics?${params}`)
      if (!response.ok) {
        setData(null)
        return
      }
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangePickerChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range)
  }

  if (loading) {
    return (
      <div className="p-10 bg-[#131317] min-h-screen">
        <div className="animate-pulse space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-6">
              <div className="h-4 w-40 bg-white/5 rounded-full" />
              <div className="h-14 w-80 bg-white/5 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {[1,2,3,4].map(i=><div key={i} className="h-32 bg-white/5 rounded-[24px]" />)}
          </div>
          <div className="h-[400px] bg-white/5 rounded-[32px]" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#131317] flex items-center justify-center p-10 selection:bg-primary selection:text-black">
        <div className="text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
          <BarChart3 className="h-16 w-16 text-primary/40 mx-auto mb-8 shadow-glow" />
          <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Structural Data Unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="py-32 px-10 bg-[#131317] min-h-screen selection:bg-primary selection:text-black" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-[1120px] mx-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] pointer-events-none rounded-full" />
        
        {/* Header */}
        <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20" variants={itemVariants}>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 block">Enterprise Intelligence</span>
            <h1 className="text-5xl font-black text-white tracking-tighter">Analytics <span className="text-white/10 italic">Dashboard.</span></h1>
          </div>
          <DateRangePicker value={dateRange} onChange={handleDateRangePickerChange} />
        </motion.div>

        {/* KPI Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20" variants={itemVariants}>
          <KPICard title="Total Runs" value={data.kpis.totalRuns} icon={<BarChart3 className="h-4 w-4" />} />
          <KPICard title="Platform Health" value={data.kpis.successRate.toFixed(1)} unit="%" icon={<TrendingUp className="h-4 w-4" />} />
          <KPICard title="AI Resolutions" value={data.kpis.totalFixes} icon={<Wrench className="h-4 w-4" />} />
          <KPICard title="Bandwidth Recovered" value={data.kpis.timeSaved.toFixed(1)} unit="H" icon={<Clock className="h-4 w-4" />} />
        </motion.div>

        {/* Pipeline Health Trend */}
        <motion.div className="mb-20" variants={itemVariants}>
          <Card className="glass-card border-white/5 p-10 shadow-2xl rounded-[32px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
             <div className="flex items-center gap-4 mb-12 relative z-10">
               <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Resolution Trend Analysis (30D)</span>
             </div>
             <TrendChart data={data.trend} dateRange="30" onDateRangeChange={() => {}} />
          </Card>
        </motion.div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div variants={itemVariants} className="space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Error Taxonomy</h3>
             <Card className="glass-card border-white/5 p-10 shadow-2xl min-h-[440px] rounded-[32px] group">
                <ErrorPieChart data={data.errorBreakdown} onErrorTypeClick={setSelectedErrorType} />
             </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Source Leaderboard</h3>
            <Card className="glass-card border-white/5 overflow-hidden shadow-2xl rounded-[32px] group">
               <RepoTable data={data.repoLeaderboard} />
            </Card>
          </motion.div>
        </div>

        {/* Failure Heatmap */}
        <motion.div className="mb-20 space-y-8" variants={itemVariants}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Load Temporal Heatmap</h3>
          <Card className="glass-card border-white/5 p-10 shadow-2xl rounded-[32px] group relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
            <HeatmapGrid data={data.heatmap} />
          </Card>
        </motion.div>

        {/* Recent AI Fixes Timeline */}
        <motion.div variants={itemVariants} className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Log</h3>
          <FixTimeline fixes={data.recentFixes} />
        </motion.div>

        {/* Active Filter Pill */}
        <AnimatePresence>
          {selectedErrorType && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-10 right-10 bg-primary text-black px-10 py-6 rounded-2xl shadow-glow flex items-center gap-6 border-none z-[100]"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-black/40 mb-1">Active Taxonomy Filter</span>
                <span className="text-sm font-black tracking-tight">{selectedErrorType}</span>
              </div>
              <button onClick={() => setSelectedErrorType(null)} className="h-10 w-10 bg-black/5 hover:bg-black/10 rounded-xl flex items-center justify-center transition-all border border-black/5">
                <ChevronRight className="h-5 w-5 rotate-90" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
