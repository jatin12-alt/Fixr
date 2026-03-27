'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, Wrench } from 'lucide-react'
import { KPICard } from '@/components/analytics/KPICard'
import { TrendChart } from '@/components/analytics/TrendChart'
import { ErrorPieChart } from '@/components/analytics/ErrorPieChart'
import { HeatmapGrid } from '@/components/analytics/HeatmapGrid'
import { RepoTable } from '@/components/analytics/RepoTable'
import { FixTimeline } from '@/components/analytics/FixTimeline'
import { DateRangePicker } from '@/components/analytics/DateRangePicker'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.35, ease: "easeOut" as const } 
  }
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
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
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
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    setDateRange({ startDate, endDate })
  }

  const handleDateRangePickerChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-muted-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-muted/50 border border-border rounded-xl p-6 h-32"></div>
              ))}
            </div>
            <div className="h-96 bg-muted/50 border border-border rounded-xl mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-muted-foreground py-8 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="min-h-screen bg-black text-muted-foreground py-8" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your pipeline health and AI performance
            </p>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangePickerChange}
          />
        </motion.div>

        {/* KPI Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
          <KPICard
            title="Total Runs"
            value={data.kpis.totalRuns}
            icon={<BarChart3 className="h-5 w-5" />}
            trend={12}
            trendDirection="up"
          />
          <KPICard
            title="Success Rate"
            value={data.kpis.successRate.toFixed(1)}
            unit="%"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={2.1}
            trendDirection="up"
          />
          <KPICard
            title="AI Fixes"
            value={data.kpis.totalFixes}
            icon={<Wrench className="h-5 w-5" />}
          />
          <KPICard
            title="Time Saved"
            value={data.kpis.timeSaved.toFixed(1)}
            unit="hrs"
            icon={<Clock className="h-5 w-5" />}
          />
        </motion.div>

        {/* Pipeline Health Trend */}
        <motion.div className="mb-8" variants={itemVariants}>
          <TrendChart
            data={data.trend}
            dateRange="30"
            onDateRangeChange={handleDateRangeChange}
          />
        </motion.div>

        {/* Error Breakdown and Repo Leaderboard */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" variants={itemVariants}>
          <ErrorPieChart
            data={data.errorBreakdown}
            onErrorTypeClick={setSelectedErrorType}
          />
          <RepoTable data={data.repoLeaderboard} />
        </motion.div>

        {/* Failure Heatmap */}
        <motion.div className="mb-8" variants={itemVariants}>
          <HeatmapGrid data={data.heatmap} />
        </motion.div>

        {/* Recent AI Fixes Timeline */}
        <motion.div variants={itemVariants}>
          <FixTimeline fixes={data.recentFixes} />
        </motion.div>

        {/* Selected Error Type Filter */}
        {selectedErrorType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-muted border border-border rounded-lg p-4 shadow-xl z-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Filtered by: {selectedErrorType}</p>
                <p className="text-muted-foreground text-sm">
                  Showing analytics for this error type
                </p>
              </div>
              <button
                onClick={() => setSelectedErrorType(null)}
                className="ml-4 text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
