'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  trendDirection?: 'up' | 'down'
  icon?: React.ReactNode
  loading?: boolean
}

export function KPICard({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendDirection, 
  icon, 
  loading 
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0

  // Animated count-up effect
  useEffect(() => {
    if (loading) return

    const duration = 2000
    const steps = 60
    const stepValue = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numericValue, loading])

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-800 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
      </div>
    )
  }

  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
    if (Number.isInteger(val)) return val.toString()
    return val.toFixed(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && <div className="text-cyan-400">{icon}</div>}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-white">
          {formatValue(displayValue)}
        </span>
        {unit && (
          <span className="ml-2 text-sm text-gray-400">{unit}</span>
        )}
      </div>

      {trend !== undefined && trendDirection && (
        <div className="flex items-center mt-3">
          {trendDirection === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
          )}
          <span className={`text-sm ${
            trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {Math.abs(trend)}% vs last period
          </span>
        </div>
      )}
    </motion.div>
  )
}
