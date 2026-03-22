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
      <div className="min-h-screen bg-black text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 h-32"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-900/50 border border-gray-800 rounded-xl mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-gray-300 py-8 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">
              Monitor your pipeline health and AI performance
            </p>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangePickerChange}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Pipeline Health Trend */}
        <div className="mb-8">
          <TrendChart
            data={data.trend}
            dateRange="30"
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Error Breakdown and Repo Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorPieChart
            data={data.errorBreakdown}
            onErrorTypeClick={setSelectedErrorType}
          />
          <RepoTable data={data.repoLeaderboard} />
        </div>

        {/* Failure Heatmap */}
        <div className="mb-8">
          <HeatmapGrid data={data.heatmap} />
        </div>

        {/* Recent AI Fixes Timeline */}
        <div>
          <FixTimeline fixes={data.recentFixes} />
        </div>

        {/* Selected Error Type Filter */}
        {selectedErrorType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-xl z-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Filtered by: {selectedErrorType}</p>
                <p className="text-gray-400 text-sm">
                  Showing analytics for this error type
                </p>
              </div>
              <button
                onClick={() => setSelectedErrorType(null)}
                className="ml-4 text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
