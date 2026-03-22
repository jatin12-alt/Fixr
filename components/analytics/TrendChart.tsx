'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { format } from 'date-fns'

interface TrendData {
  date: string
  successCount: number
  failureCount: number
  successRate: number
}

interface TrendChartProps {
  data: TrendData[]
  dateRange: string
  onDateRangeChange: (range: string) => void
}

const dateRanges = [
  { label: '7D', value: '7' },
  { label: '30D', value: '30' },
  { label: '90D', value: '90' },
]

export function TrendChart({ data, dateRange, onDateRangeChange }: TrendChartProps) {
  const [activeTab, setActiveTab] = useState<'success' | 'rate'>('success')

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
    total: item.successCount + item.failureCount,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {activeTab === 'success' ? (
            <>
              <p className="text-green-400 text-sm">
                Success: {payload[0]?.payload?.successCount || 0}
              </p>
              <p className="text-red-400 text-sm">
                Failed: {payload[0]?.payload?.failureCount || 0}
              </p>
              <p className="text-gray-400 text-sm">
                Total: {payload[0]?.payload?.total || 0}
              </p>
            </>
          ) : (
            <p className="text-cyan-400 text-sm">
              Success Rate: {payload[0]?.value?.toFixed(1)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Pipeline Health Trend</h3>
        
        <div className="flex items-center space-x-4">
          {/* Tab Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('success')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === 'success'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Runs
            </button>
            <button
              onClick={() => setActiveTab('rate')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeTab === 'rate'
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Success Rate
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => onDateRangeChange(range.value)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  dateRange === range.value
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'success' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="failureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="successCount"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#successGradient)"
              />
              <Area
                type="monotone"
                dataKey="failureCount"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#failureGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
